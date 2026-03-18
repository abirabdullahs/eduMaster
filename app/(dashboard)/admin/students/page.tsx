'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  Mail, 
  Phone, 
  Calendar, 
  BookOpen, 
  CreditCard, 
  FileText, 
  X,
  Loader2,
  AlertCircle,
  ChevronRight,
  Plus,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Profile, Course } from '@/lib/types';
import { formatPrice } from '@/lib/utils';

export default function AdminStudents() {
  const [students, setStudents] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState<string>('all');
  const [selectedStudent, setSelectedStudent] = useState<Profile | null>(null);
  const [studentEnrollments, setStudentEnrollments] = useState<any[]>([]);
  const [studentResults, setStudentResults] = useState<any[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [enrollCourseId, setEnrollCourseId] = useState('');
  const supabase = createClient();

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setStudents(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const fetchCourses = useCallback(async () => {
    const { data } = await supabase.from('courses').select('*').eq('status', 'published');
    setAllCourses(data || []);
  }, [supabase]);

  useEffect(() => {
    fetchStudents();
    fetchCourses();
  }, [fetchStudents, fetchCourses]);

  async function fetchStudentDetails(studentId: string) {
    const [enrollmentsRes, resultsRes] = await Promise.all([
      supabase
        .from('enrollments')
        .select(`
          *,
          courses (title, main_price, discounted_price)
        `)
        .eq('student_id', studentId),
      supabase
        .from('exam_attempts')
        .select(`
          *,
          exams (title)
        `)
        .eq('student_id', studentId)
        .eq('is_practice', false)
        .order('submitted_at', { ascending: false })
    ]);

    if (enrollmentsRes.data) setStudentEnrollments(enrollmentsRes.data);
    if (resultsRes.data) setStudentResults(resultsRes.data);
  }

  const handleStudentClick = (student: Profile) => {
    setSelectedStudent(student);
    fetchStudentDetails(student.id);
  };

  const handleManualEnroll = async () => {
    if (!selectedStudent || !enrollCourseId) return;

    try {
      const existing = studentEnrollments.find(e => e.course_id === enrollCourseId);
      if (existing) {
        alert('Student is already enrolled in this course.');
        return;
      }

      const course = allCourses.find(c => c.id === enrollCourseId);
      const { error } = await supabase
        .from('enrollments')
        .insert({
          student_id: selectedStudent.id,
          course_id: enrollCourseId,
          status: 'active',
          is_offline_course: course?.is_offline ?? false,
          approved_at: new Date().toISOString(),
          approved_by: (await supabase.auth.getUser()).data.user?.id,
        });

      if (error) throw error;
      
      fetchStudentDetails(selectedStudent.id);
      setIsEnrollModalOpen(false);
      setEnrollCourseId('');
    } catch (err: any) {
      alert(err.message || 'Failed to enroll student');
    }
  };

  const handleRemoveEnrollment = async (enrollmentId: string) => {
    if (!confirm('Are you sure you want to remove this enrollment?')) return;

    try {
      const { error } = await supabase
        .from('enrollments')
        .delete()
        .eq('id', enrollmentId);

      if (error) throw error;
      
      if (selectedStudent) {
        fetchStudentDetails(selectedStudent.id);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to remove enrollment');
    }
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = filterClass === 'all' || s.class === filterClass;
    return matchesSearch && matchesClass;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Student Management</h1>
          <p className="text-slate-400 mt-1">Manage student records, enrollments, and payments.</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Search students by name or email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#161b22] border border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="text-slate-500" size={18} />
          <select 
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="bg-[#161b22] border border-slate-800 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          >
            <option value="all">All Classes</option>
            <option value="SSC">SSC</option>
            <option value="HSC">HSC</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#161b22] border border-slate-800 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0d1117] border-b border-slate-800">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Student</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Class</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Contact</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Joined</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-800" />
                        <div className="space-y-2">
                          <div className="h-4 w-32 bg-slate-800 rounded" />
                          <div className="h-3 w-48 bg-slate-800 rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><div className="h-6 w-12 bg-slate-800 rounded-lg" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-800 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-20 bg-slate-800 rounded" /></td>
                    <td className="px-6 py-4 text-right"><div className="h-8 w-8 bg-slate-800 rounded ml-auto" /></td>
                  </tr>
                ))
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-slate-500">
                    No students found.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr 
                    key={student.id} 
                    className="hover:bg-white/5 transition-colors cursor-pointer group"
                    onClick={() => handleStudentClick(student)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold">
                          {student.name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{student.name}</p>
                          <p className="text-xs text-slate-500">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider",
                        student.class === 'SSC' ? "bg-blue-500/10 text-blue-500" : "bg-purple-500/10 text-purple-400"
                      )}>
                        {student.class || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <Phone size={12} className="text-indigo-500" />
                          {student.mobile || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {new Date(student.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-slate-500 hover:text-white transition-all">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl h-full bg-[#0d1117] border-l border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-[#161b22]">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-500/20">
                  {selectedStudent.name[0]}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedStudent.name}</h2>
                  <p className="text-sm text-slate-500">{selectedStudent.email}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedStudent(null)}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-all"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-10">
              {/* Info Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-[#161b22] border border-slate-800 rounded-2xl space-y-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Class</p>
                  <p className="text-lg font-bold text-white">{selectedStudent.class || 'N/A'}</p>
                </div>
                <div className="p-4 bg-[#161b22] border border-slate-800 rounded-2xl space-y-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Mobile</p>
                  <p className="text-lg font-bold text-white">{selectedStudent.mobile || 'N/A'}</p>
                </div>
              </div>

              {/* Enrollments Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <BookOpen size={20} className="text-indigo-500" />
                    Enrolled Courses
                  </h3>
                  <button 
                    onClick={() => setIsEnrollModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 text-xs font-bold rounded-xl border border-indigo-500/20 transition-all"
                  >
                    <Plus size={14} />
                    Manual Enroll
                  </button>
                </div>

                <div className="space-y-4">
                  {studentEnrollments.length === 0 ? (
                    <div className="p-8 text-center bg-[#161b22] border border-dashed border-slate-800 rounded-2xl text-slate-500 text-sm">
                      No courses enrolled yet.
                    </div>
                  ) : (
                    studentEnrollments.map((enroll) => (
                      <div key={enroll.id} className="p-4 bg-[#161b22] border border-slate-800 rounded-2xl flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400">
                            <BookOpen size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{enroll.courses?.title}</p>
                            <p className="text-xs text-slate-500">Enrolled on {new Date(enroll.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={cn(
                            "px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider",
                            enroll.status === 'active' ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                          )}>
                            {enroll.status}
                          </span>
                          <button 
                            onClick={() => handleRemoveEnrollment(enroll.id)}
                            className="p-2 text-slate-500 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Stats/History Placeholders */}
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <CreditCard size={16} className="text-emerald-500" />
                    Payment History
                  </h3>
                  <div className="space-y-3">
                    {[1, 2].map(i => (
                      <div key={i} className="flex items-center justify-between text-xs p-3 bg-[#161b22] rounded-xl border border-slate-800">
                        <span className="text-slate-400">Course Payment</span>
                        <span className="text-emerald-500 font-bold">৳ 2,500</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <FileText size={16} className="text-purple-500" />
                    Exam Results
                  </h3>
                  <div className="space-y-3">
                    {studentResults.length === 0 ? (
                      <div className="p-4 text-center text-slate-500 text-xs bg-[#161b22] rounded-xl border border-slate-800">
                        No exam results yet.
                      </div>
                    ) : (
                      studentResults.map((attempt: any) => (
                        <div key={attempt.id} className="flex items-center justify-between text-xs p-3 bg-[#161b22] rounded-xl border border-slate-800">
                          <div>
                            <span className="text-white font-medium">{attempt.exams?.title || 'Exam'}</span>
                            <span className="block text-slate-500 mt-0.5">
                              {attempt.submitted_at ? new Date(attempt.submitted_at).toLocaleDateString() : 'N/A'}
                            </span>
                          </div>
                          <span className="text-purple-400 font-bold">
                            {attempt.score}/{attempt.total_questions} ({attempt.correct_count}✓ {attempt.wrong_count}✗)
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Enroll Modal */}
      {isEnrollModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#161b22] border border-slate-800 rounded-3xl p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Manual Enrollment</h3>
              <button onClick={() => setIsEnrollModalOpen(false)} className="text-slate-500 hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Select Course</label>
                <select 
                  value={enrollCourseId}
                  onChange={(e) => setEnrollCourseId(e.target.value)}
                  className="w-full bg-[#0d1117] border border-slate-800 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                >
                  <option value="">Choose a course...</option>
                  {allCourses
                    .filter(c => !studentEnrollments.some(e => e.course_id === c.id))
                    .map(course => (
                      <option key={course.id} value={course.id}>{course.title}</option>
                    ))}
                  {allCourses.filter(c => !studentEnrollments.some(e => e.course_id === c.id)).length === 0 && (
                    <option value="" disabled>No more courses to enroll (already enrolled in all)</option>
                  )}
                </select>
              </div>
              <button 
                onClick={handleManualEnroll}
                disabled={!enrollCourseId}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Enroll Student
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
