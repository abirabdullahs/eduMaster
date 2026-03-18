'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { createClient } from '@/lib/supabase/client';
import DashboardShell from '@/components/layout/DashboardShell';
import ContentTree from '@/components/courses/ContentTree';
import LectureQuestions from '@/components/courses/LectureQuestions';
import { SubjectForm, ChapterForm, LectureForm } from '@/components/courses/forms/CourseContentForms';
import { 
  Loader2, 
  Users, 
  BookOpen, 
  Settings, 
  ChevronRight, 
  ArrowLeft,
  Search,
  CheckCircle2,
  Clock,
  BarChart3,
  Mail,
  MessageSquare,
  Plus,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Course, Subject, Chapter, Lecture, Profile, Enrollment, LectureProgress } from '@/lib/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

export default function TeacherCourseDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  const [course, setCourse] = useState<Course | null>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'content' | 'students'>('content');
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const supabase = createClient();

  // Form States
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [isAddingChapter, setIsAddingChapter] = useState<string | null>(null); // parentId
  const [isAddingLecture, setIsAddingLecture] = useState<string | null>(null); // parentId
  const [isSendingAnnouncement, setIsSendingAnnouncement] = useState(false);
  const [announcement, setAnnouncement] = useState({ title: '', body: '' });
  const [sending, setSending] = useState(false);
  const [editingItem, setEditingItem] = useState<{ type: 'subject' | 'chapter' | 'lecture', data: any } | null>(null);
  const [isQuestionsModalOpen, setIsQuestionsModalOpen] = useState(false);
  const [selectedLecture, setSelectedLecture] = useState<any>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch Course
      const { data: courseData } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();
      setCourse(courseData);

      // 2. Fetch Content Tree
      const { data: subjectData } = await supabase
        .from('subjects')
        .select(`
          *,
          chapters:chapters (
            *,
            lectures:lectures (*)
          )
        `)
        .eq('course_id', courseId)
        .order('order_index', { ascending: true });
      
      // Sort chapters and lectures manually since Supabase order on nested is tricky
      const sortedSubjects = subjectData?.map(s => ({
        ...s,
        chapters: s.chapters.sort((a: any, b: any) => a.order_index - b.order_index).map((c: any) => ({
          ...c,
          lectures: c.lectures.sort((a: any, b: any) => a.order_index - b.order_index)
        }))
      })) || [];
      setSubjects(sortedSubjects);

      // 3. Fetch Enrolled Students & Progress
      const { data: enrollmentData } = await supabase
        .from('enrollments')
        .select(`
          *,
          profiles:student_id (*)
        `)
        .eq('course_id', courseId)
        .eq('status', 'active');

      // Get all lecture IDs for this course
      const allLectureIds = sortedSubjects.flatMap(s => s.chapters.flatMap((c: any) => c.lectures.map((l: any) => l.id)));
      
      // Fetch progress for these students
      const { data: progressData } = await supabase
        .from('lecture_progress')
        .select('*')
        .in('lecture_id', allLectureIds);

      const studentsWithProgress = enrollmentData?.map((e: any) => {
        const studentProgress = progressData?.filter(p => p.student_id === e.student_id) || [];
        const completedCount = studentProgress.length;
        const totalCount = allLectureIds.length;
        const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

        return {
          ...e.profiles,
          enrollment_id: e.id,
          enrolled_at: e.created_at,
          progress: progressPercent,
          completed_count: completedCount,
          total_count: totalCount
        };
      }) || [];

      setStudents(studentsWithProgress);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [supabase, courseId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handlers
  const handleAddSubject = async (values: any) => {
    const { error } = await supabase
      .from('subjects')
      .insert({ ...values, course_id: courseId, order_index: subjects.length });
    if (!error) {
      setIsAddingSubject(false);
      fetchData();
    }
  };

  const handleAddChapter = async (values: any) => {
    if (!isAddingChapter) return;
    const parentSubject = subjects.find(s => s.id === isAddingChapter);
    const { error } = await supabase
      .from('chapters')
      .insert({ ...values, subject_id: isAddingChapter, order_index: parentSubject?.chapters?.length || 0 });
    if (error) {
      alert('Failed to add chapter: ' + error.message);
      return;
    }
    setIsAddingChapter(null);
    fetchData();
  };

  const handleAddLecture = async (values: any) => {
    if (!isAddingLecture) return;
    // Find parent chapter to get order_index
    let parentChapter: any = null;
    for (const s of subjects) {
      parentChapter = s.chapters.find((c: any) => c.id === isAddingLecture);
      if (parentChapter) break;
    }
    const { error } = await supabase
      .from('lectures')
      .insert({ 
        title: values.title,
        topics: values.topics,
        video_url: values.video_url,
        content_markdown: values.content,
        tags: values.tags || [],
        chapter_id: isAddingLecture, 
        order_index: parentChapter?.lectures?.length || 0 
      });
    if (!error) {
      setIsAddingLecture(null);
      fetchData();
    }
  };

  const handleEdit = async (values: any) => {
    if (!editingItem) return;
    const table = editingItem.type === 'subject' ? 'subjects' : editingItem.type === 'chapter' ? 'chapters' : 'lectures';
    const payload = editingItem.type === 'lecture' ? {
      title: values.title,
      topics: values.topics,
      video_url: values.video_url,
      content_markdown: values.content,
      tags: values.tags || []
    } : values;

    const { error } = await supabase
      .from(table)
      .update(payload)
      .eq('id', editingItem.data.id);
    
    if (!error) {
      setEditingItem(null);
      fetchData();
    }
  };

  const handleDelete = async (type: string, id: string) => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return;
    const table = type === 'subject' ? 'subjects' : type === 'chapter' ? 'chapters' : 'lectures';
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (!error) fetchData();
  };

  const handleReorder = async (type: string, items: any[]) => {
    const table = type === 'subject' ? 'subjects' : type === 'chapter' ? 'chapters' : 'lectures';
    const updates = items.map((item, index) => ({
      id: item.id,
      order_index: index
    }));

    // In a real app, we'd use a RPC or multiple updates
    // For now, we'll do them sequentially or just update state and hope for the best
    // Better: update state immediately for UI responsiveness
    if (type === 'subject') setSubjects(items);
    
    for (const update of updates) {
      await supabase.from(table).update({ order_index: update.order_index }).eq('id', update.id);
    }
    fetchData();
  };

  const handleSendAnnouncement = async () => {
    if (!announcement.title || !announcement.body) return;
    setSending(true);
    try {
      const studentIds = students.map(s => s.id);
      if (studentIds.length === 0) {
        alert('No students enrolled in this course.');
        return;
      }

      const notifications = studentIds.map(studentId => ({
        user_id: studentId,
        title: announcement.title,
        body: announcement.body,
        type: 'general',
        is_read: false
      }));

      const { error } = await supabase.from('notifications').insert(notifications);
      if (error) throw error;

      alert('Announcement sent to all students!');
      setIsSendingAnnouncement(false);
      setAnnouncement({ title: '', body: '' });
    } catch (err: any) {
      alert(err.message || 'Failed to send announcement');
    } finally {
      setSending(false);
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && !course) {
    return (
      <DashboardShell>
        <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin text-indigo-500" size={48} />
          <p className="text-slate-400 font-medium tracking-wide">Loading course details...</p>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="space-y-10 animate-in fade-in duration-500 font-bengali">
        {/* Breadcrumbs & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="p-2 bg-[#161b22] border border-slate-800 text-slate-400 hover:text-white rounded-xl transition-all"
            >
              <ArrowLeft size={24} />
            </button>
            <div className="space-y-1">
              <h1 className="text-3xl font-bold text-white tracking-tight">{course?.title}</h1>
              <div className="flex items-center gap-4 text-xs text-slate-500 font-medium uppercase tracking-widest">
                <span className="flex items-center gap-1.5"><Users size={14} /> {students.length} Students</span>
                <span className="flex items-center gap-1.5"><BookOpen size={14} /> {subjects.length} Subjects</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSendingAnnouncement(true)}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              <MessageSquare size={18} />
              Send Announcement
            </button>
            <Link 
              href={`/teacher/courses/${courseId}/exams`}
              className="px-6 py-3 bg-[#161b22] border border-slate-800 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all flex items-center gap-2"
            >
              <BarChart3 size={18} />
              Manage Exams
            </Link>
            <button 
              onClick={() => setIsAddingSubject(true)}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20"
            >
              <Plus size={20} />
              Add Subject
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-[#161b22] border border-slate-800 rounded-2xl p-1.5 w-fit">
          <button
            onClick={() => setActiveTab('content')}
            className={cn(
              "px-8 py-3 rounded-xl text-sm font-bold capitalize transition-all",
              activeTab === 'content' ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
            )}
          >
            Course Content
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={cn(
              "px-8 py-3 rounded-xl text-sm font-bold capitalize transition-all",
              activeTab === 'students' ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
            )}
          >
            Enrolled Students
          </button>
        </div>

        {activeTab === 'content' ? (
          <div className="max-w-4xl">
            <ContentTree 
              subjects={subjects}
              onEdit={(type, data) => setEditingItem({ type, data })}
              onDelete={handleDelete}
              onAddChild={(type, parentId) => type === 'chapter' ? setIsAddingChapter(parentId) : setIsAddingLecture(parentId)}
              onReorder={handleReorder}
              onManageQuestions={(lecture) => {
                setSelectedLecture(lecture);
                setIsQuestionsModalOpen(true);
              }}
            />
            {subjects.length === 0 && (
              <div className="p-20 bg-[#161b22] border border-dashed border-slate-800 rounded-3xl text-center space-y-4">
                <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center text-slate-600 mx-auto">
                  <BookOpen size={32} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-white">No content yet</h3>
                  <p className="text-slate-400">Start by adding your first subject to this course.</p>
                </div>
                <button 
                  onClick={() => setIsAddingSubject(true)}
                  className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl"
                >
                  Add Subject
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text" 
                placeholder="Search students..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#161b22] border border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>

            <div className="bg-[#161b22] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-white/5">
                      <th className="p-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Student</th>
                      <th className="p-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Class</th>
                      <th className="p-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Enrolled Date</th>
                      <th className="p-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Progress</th>
                      <th className="p-6 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-white/5 transition-all group">
                        <td className="p-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold">
                              {student.name[0]}
                            </div>
                            <div>
                              <p className="font-bold text-white group-hover:text-indigo-400 transition-colors">{student.name}</p>
                              <p className="text-xs text-slate-500">{student.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-6">
                          <span className="px-3 py-1 bg-slate-800 text-slate-300 text-[10px] font-bold rounded-full uppercase tracking-widest">
                            {student.class || 'N/A'}
                          </span>
                        </td>
                        <td className="p-6">
                          <p className="text-sm text-slate-400">{format(new Date(student.enrolled_at), 'MMM d, yyyy')}</p>
                        </td>
                        <td className="p-6">
                          <div className="space-y-2 w-48">
                            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                              <span className="text-slate-500">Progress</span>
                              <span className="text-indigo-400">{student.progress}%</span>
                            </div>
                            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                                style={{ width: `${student.progress}%` }}
                              />
                            </div>
                            <p className="text-[9px] text-slate-600 text-right">{student.completed_count}/{student.total_count} Lectures</p>
                          </div>
                        </td>
                        <td className="p-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => router.push(`/teacher/students?id=${student.id}`)}
                              className="p-2 hover:bg-indigo-500/10 text-slate-500 hover:text-indigo-500 rounded-lg transition-all"
                              title="View Student Progress"
                            >
                              <BarChart3 size={18} />
                            </button>
                            <button 
                              className="p-2 hover:bg-emerald-500/10 text-slate-500 hover:text-emerald-500 rounded-lg transition-all"
                              title="Send Message"
                            >
                              <MessageSquare size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredStudents.length === 0 && (
                  <div className="p-20 text-center space-y-4">
                    <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center text-slate-600 mx-auto">
                      <Users size={32} />
                    </div>
                    <p className="text-slate-500 font-medium">No students found matching your search.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modals */}
        <SubjectForm 
          isOpen={isAddingSubject} 
          onClose={() => setIsAddingSubject(false)} 
          onSubmit={handleAddSubject} 
        />
        <ChapterForm 
          isOpen={!!isAddingChapter} 
          onClose={() => setIsAddingChapter(null)} 
          onSubmit={handleAddChapter} 
        />
        <LectureForm 
          isOpen={!!isAddingLecture} 
          onClose={() => setIsAddingLecture(null)} 
          onSubmit={handleAddLecture} 
        />

        {/* Announcement Modal */}
        {isSendingAnnouncement && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-[#161b22] border border-slate-800 rounded-3xl p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
                    <MessageSquare size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-white">Send Announcement</h3>
                </div>
                <button onClick={() => setIsSendingAnnouncement(false)} className="text-slate-500 hover:text-white p-2 hover:bg-white/5 rounded-xl transition-all">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Title</label>
                  <input 
                    type="text"
                    value={announcement.title}
                    onChange={(e) => setAnnouncement(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-[#0d1117] border border-slate-800 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    placeholder="e.g. Class Cancelled"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Message</label>
                  <textarea 
                    value={announcement.body}
                    onChange={(e) => setAnnouncement(prev => ({ ...prev, body: e.target.value }))}
                    rows={4}
                    className="w-full bg-[#0d1117] border border-slate-800 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
                    placeholder="Write your message here..."
                  />
                </div>

                <button 
                  onClick={handleSendAnnouncement}
                  disabled={sending || !announcement.title || !announcement.body}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                >
                  {sending ? <Loader2 className="animate-spin" size={20} /> : <Mail size={20} />}
                  Send to {students.length} Students
                </button>
              </div>
            </div>
          </div>
        )}
        {editingItem && (
          editingItem.type === 'subject' ? (
            <SubjectForm 
              isOpen={true} 
              onClose={() => setEditingItem(null)} 
              onSubmit={handleEdit} 
              initialData={editingItem.data}
            />
          ) : editingItem.type === 'chapter' ? (
            <ChapterForm 
              isOpen={true} 
              onClose={() => setEditingItem(null)} 
              onSubmit={handleEdit} 
              initialData={editingItem.data}
            />
          ) : (
            <LectureForm 
              isOpen={true} 
              onClose={() => setEditingItem(null)} 
              onSubmit={handleEdit} 
              initialData={{
                ...editingItem.data,
                content: editingItem.data.content_markdown || editingItem.data.content_html,
                tags: editingItem.data.tags
              }}
            />
          )
        )}

        {isQuestionsModalOpen && selectedLecture && (
          <LectureQuestions 
            lecture={selectedLecture}
            onClose={() => {
              setIsQuestionsModalOpen(false);
              setSelectedLecture(null);
            }}
          />
        )}
      </div>
    </DashboardShell>
  );
}
