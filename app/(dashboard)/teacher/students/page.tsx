'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { createClient } from '@/lib/supabase/client';
import DashboardShell from '@/components/layout/DashboardShell';
import { 
  Users, 
  Search, 
  Loader2, 
  Filter, 
  BarChart3, 
  Mail, 
  MessageSquare, 
  ChevronRight,
  BookOpen,
  Target,
  Clock,
  CheckCircle2,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Profile, Course, Exam, ExamAttempt } from '@/lib/types';
import { format } from 'date-fns';

export default function TeacherStudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('all');
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [studentAttempts, setStudentAttempts] = useState<any[]>([]);
  const [loadingAttempts, setLoadingAttempts] = useState(false);
  
  const supabase = createClient();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Get Teacher's Courses
      const { data: courseData } = await supabase
        .from('courses')
        .select('*')
        .eq('teacher_id', user.id);
      
      setCourses(courseData || []);
      const courseIds = courseData?.map(c => c.id) || [];

      // 2. Get Enrollments for these courses
      const { data: enrollmentData } = await supabase
        .from('enrollments')
        .select(`
          *,
          profiles:student_id (*),
          courses:course_id (title)
        `)
        .in('course_id', courseIds)
        .eq('status', 'active');

      // Group by student to avoid duplicates if enrolled in multiple courses
      const studentMap = new Map();
      enrollmentData?.forEach((e: any) => {
        const courseTitle = e.courses?.title;
        if (!studentMap.has(e.student_id)) {
          studentMap.set(e.student_id, {
            ...e.profiles,
            id: e.student_id,
            courses: courseTitle ? [courseTitle] : [],
            courseIds: [e.course_id],
            enrolled_at: e.created_at
          });
        } else {
          const s = studentMap.get(e.student_id);
          if (courseTitle && !s.courses.includes(courseTitle)) s.courses.push(courseTitle);
          if (!s.courseIds.includes(e.course_id)) s.courseIds.push(e.course_id);
        }
      });

      setStudents(Array.from(studentMap.values()));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetchStudentAttempts = async (studentId: string) => {
    setLoadingAttempts(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: teacherCourses } = await supabase
        .from('courses')
        .select('id')
        .eq('teacher_id', user.id);
      
      const teacherCourseIds = teacherCourses?.map(c => c.id) || [];
      if (teacherCourseIds.length === 0) {
        setStudentAttempts([]);
        return;
      }

      const { data: teacherExams } = await supabase
        .from('exams')
        .select('id')
        .in('course_id', teacherCourseIds);
      const examIds = teacherExams?.map(e => e.id) || [];

      if (examIds.length === 0) {
        setStudentAttempts([]);
        return;
      }

      const { data: attempts } = await supabase
        .from('exam_attempts')
        .select(`
          *,
          exams:exam_id (*)
        `)
        .eq('student_id', studentId)
        .in('exam_id', examIds)
        .order('submitted_at', { ascending: false });

      setStudentAttempts(attempts?.filter((a: any) => a.exams) || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAttempts(false);
    }
  };

  const handleViewStudent = (student: any) => {
    setSelectedStudent(student);
    fetchStudentAttempts(student.id);
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         s.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCourse = selectedCourseId === 'all' || s.courseIds.includes(selectedCourseId);
    return matchesSearch && matchesCourse;
  });

  if (loading) {
    return (
      <DashboardShell>
        <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin text-indigo-500" size={48} />
          <p className="text-slate-400 font-medium tracking-wide">Loading students...</p>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="space-y-10 animate-in fade-in duration-500 font-bengali">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-white tracking-tight">My Students</h1>
            <p className="text-slate-400">Monitor student performance across all your courses.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-[#161b22] border border-slate-800 rounded-2xl p-4 gap-8 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500">
                  <Users size={20} />
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Students</p>
                  <p className="text-lg font-bold text-white">{students.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input 
              type="text" 
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-[#161b22] border border-slate-800 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            />
          </div>
          <div className="flex items-center gap-3 bg-[#161b22] border border-slate-800 rounded-2xl p-2 shrink-0">
            <Filter size={18} className="ml-3 text-slate-500" />
            <select 
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="bg-transparent text-white text-sm font-bold py-2 px-4 focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#161b22]">All Courses</option>
              {courses.map(course => (
                <option key={course.id} value={course.id} className="bg-[#161b22]">{course.title}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Students Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredStudents.map((student) => (
            <div 
              key={student.id} 
              className="bg-[#161b22] border border-slate-800 rounded-3xl overflow-hidden shadow-xl hover:border-slate-700 transition-all group flex flex-col"
            >
              <div className="p-8 flex-1 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                    {student.name[0]}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-white leading-tight group-hover:text-indigo-400 transition-colors">
                      {student.name}
                    </h3>
                    <p className="text-xs text-slate-500">{student.email}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {student.courses.map((c: string) => (
                      <span key={c} className="px-2 py-1 bg-white/5 text-slate-400 text-[10px] font-bold rounded-lg border border-slate-800 uppercase tracking-widest">
                        {c}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1.5"><Clock size={14} /> Enrolled {format(new Date(student.enrolled_at), 'MMM yyyy')}</span>
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-full font-bold uppercase tracking-widest text-[9px]">
                      {student.class || 'SSC'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white/5 border-t border-slate-800 grid grid-cols-2 gap-3">
                <button 
                  onClick={() => handleViewStudent(student)}
                  className="py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
                >
                  <BarChart3 size={16} />
                  View Results
                </button>
                <button 
                  className="py-3 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
                >
                  <MessageSquare size={16} />
                  Message
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredStudents.length === 0 && (
          <div className="p-20 bg-[#161b22] border border-slate-800 rounded-3xl text-center space-y-4">
            <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center text-slate-600 mx-auto">
              <Users size={32} />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">No students found</h3>
              <p className="text-slate-400">Try adjusting your search or filter.</p>
            </div>
          </div>
        )}

        {/* Student Results Modal */}
        {selectedStudent && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-4xl bg-[#161b22] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-xl font-bold">
                    {selectedStudent.name[0]}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{selectedStudent.name}</h3>
                    <p className="text-sm text-slate-500">Exam performance across your courses</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedStudent(null)}
                  className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-8">
                {loadingAttempts ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="animate-spin text-indigo-500" size={40} />
                    <p className="text-slate-400">Fetching results...</p>
                  </div>
                ) : studentAttempts.length > 0 ? (
                  <div className="grid gap-6">
                    {studentAttempts.map((attempt) => (
                      <div key={attempt.id} className="p-6 bg-white/5 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-slate-700 transition-all">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <span className={cn(
                              "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider",
                              attempt.is_practice ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500"
                            )}>
                              {attempt.is_practice ? 'Practice' : 'Main Exam'}
                            </span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                              {format(new Date(attempt.submitted_at), 'MMM d, yyyy')}
                            </span>
                          </div>
                          <h4 className="text-lg font-bold text-white">{attempt.exams?.title}</h4>
                        </div>

                        <div className="flex items-center gap-8">
                          <div className="text-center space-y-1">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Score</p>
                            <p className="text-xl font-bold text-emerald-500">{attempt.score.toFixed(2)}</p>
                          </div>
                          <div className="text-center space-y-1">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Accuracy</p>
                            <p className="text-xl font-bold text-white">
                              {Math.round((attempt.correct_count / attempt.total_questions) * 100)}%
                            </p>
                          </div>
                          <div className="text-center space-y-1">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Time</p>
                            <p className="text-xl font-bold text-slate-400">
                              {Math.floor(attempt.time_taken_seconds / 60)}m
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center space-y-4">
                    <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center text-slate-600 mx-auto">
                      <Target size={32} />
                    </div>
                    <p className="text-slate-500 font-medium">No exam attempts found for this student in your courses.</p>
                  </div>
                )}
              </div>

              <div className="p-8 bg-white/5 border-t border-slate-800 flex justify-end">
                <button 
                  onClick={() => setSelectedStudent(null)}
                  className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
