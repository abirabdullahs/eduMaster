'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  ArrowLeft, 
  BookOpen, 
  Plus, 
  CreditCard, 
  Settings,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  ExternalLink,
  Users,
  Clock,
  Layout,
  GripVertical,
  Save,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Course } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import ContentTree from '@/components/courses/ContentTree';
import { SubjectForm, ChapterForm, LectureForm } from '@/components/courses/forms/CourseContentForms';
import LectureQuestions from '@/components/courses/LectureQuestions';

type TabType = 'curriculum' | 'payments' | 'settings';

export default function CourseDetailPage() {
  const { courseId } = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('curriculum');
  const [course, setCourse] = useState<any>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const supabase = createClient();

  // Settings form state
  const [settingsForm, setSettingsForm] = useState({
    title: '',
    main_price: 0,
    discount_price: 0,
    description: '',
    thumbnail_url: ''
  });

  // Modal states
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
  const [isLectureModalOpen, setIsLectureModalOpen] = useState(false);
  const [isQuestionsModalOpen, setIsQuestionsModalOpen] = useState(false);
  
  const [editingItem, setEditingItem] = useState<any>(null);
  const [parentId, setParentId] = useState<string | null>(null);
  const [selectedLecture, setSelectedLecture] = useState<any>(null);
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);

  const fetchCourseData = useCallback(async () => {
    setLoading(true);
    try {
      const [courseRes, subjectsRes] = await Promise.all([
        supabase.from('courses').select('*, profiles:teacher_id(name)').eq('id', courseId).single(),
        supabase.from('subjects').select('*, chapters(*, lectures(*))').eq('course_id', courseId).order('order_index', { ascending: true })
      ]);

      if (courseRes.error) throw courseRes.error;
      
      // Sort nested items
      const sortedSubjects = (subjectsRes.data || []).map(subject => ({
        ...subject,
        chapters: (subject.chapters || []).sort((a: any, b: any) => a.order_index - b.order_index).map((chapter: any) => ({
          ...chapter,
          lectures: (chapter.lectures || []).sort((a: any, b: any) => a.order_index - b.order_index)
        }))
      }));

      setCourse(courseRes.data);
      setSettingsForm({
        title: courseRes.data.title || '',
        main_price: courseRes.data.main_price || 0,
        discount_price: courseRes.data.discounted_price || 0,
        description: courseRes.data.description || '',
        thumbnail_url: courseRes.data.thumbnail_url || ''
      });
      setSubjects(sortedSubjects);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch course data');
    } finally {
      setLoading(false);
    }
  }, [courseId, supabase]);

  const fetchPendingPayments = useCallback(async () => {
    if (!courseId || !course?.is_offline) return;
    setPaymentsLoading(true);
    try {
      const { data } = await supabase
        .from('offline_monthly_payments')
        .select(`
          *,
          profiles:student_id (name, email)
        `)
        .eq('course_id', courseId)
        .eq('status', 'pending')
        .order('submitted_at', { ascending: false });
      setPendingPayments(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setPaymentsLoading(false);
    }
  }, [courseId, course?.is_offline, supabase]);

  useEffect(() => {
    fetchCourseData();
  }, [fetchCourseData, refreshKey]);

  useEffect(() => {
    if (activeTab === 'payments' && course?.is_offline) {
      fetchPendingPayments();
    }
  }, [activeTab, course?.is_offline, fetchPendingPayments]);

  const handleUpdateSettings = async () => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('courses')
        .update({
          title: settingsForm.title,
          main_price: settingsForm.main_price,
          discounted_price: settingsForm.discount_price,
          description: settingsForm.description,
          thumbnail_url: settingsForm.thumbnail_url
        })
        .eq('id', courseId);
      
      if (error) throw error;
      alert('Settings updated successfully!');
      setRefreshKey(prev => prev + 1);
    } catch (err: any) {
      alert('Failed to update settings: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleStatus = async () => {
    const newStatus = course?.status === 'published' ? 'draft' : 'published';
    if (!confirm(`Are you sure you want to ${newStatus === 'published' ? 'publish' : 'unpublish'} this course?`)) return;

    setUpdating(true);
    try {
      const { error } = await supabase
        .from('courses')
        .update({ status: newStatus })
        .eq('id', courseId);
      
      if (error) throw error;
      setRefreshKey(prev => prev + 1);
    } catch (err: any) {
      alert('Failed to update status: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!confirm('CRITICAL: Are you sure you want to delete this course permanently? This action cannot be undone and all content will be lost.')) return;
    
    const confirmation = prompt('Please type "DELETE" to confirm:');
    if (confirmation !== 'DELETE') return;

    setUpdating(true);
    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);
      
      if (error) throw error;
      router.push('/admin/courses');
    } catch (err: any) {
      alert('Failed to delete course: ' + err.message);
      setUpdating(false);
    }
  };

  const handleReorder = async (type: 'subject' | 'chapter' | 'lecture', items: any[]) => {
    const table = type === 'subject' ? 'subjects' : type === 'chapter' ? 'chapters' : 'lectures';
    const updates = items.map((item, index) => ({
      id: item.id,
      order_index: index
    }));

    try {
      const { error } = await supabase.from(table).upsert(updates);
      if (error) throw error;
      setRefreshKey(prev => prev + 1);
    } catch (err: any) {
      alert('Failed to reorder: ' + err.message);
    }
  };

  const handleDelete = async (type: 'subject' | 'chapter' | 'lecture', id: string) => {
    if (!confirm(`Are you sure you want to delete this ${type}? All nested content will be lost.`)) return;
    
    const table = type === 'subject' ? 'subjects' : type === 'chapter' ? 'chapters' : 'lectures';
    try {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      setRefreshKey(prev => prev + 1);
    } catch (err: any) {
      alert('Failed to delete: ' + err.message);
    }
  };

  const handleFormSubmit = async (type: 'subject' | 'chapter' | 'lecture', data: any) => {
    const table = type === 'subject' ? 'subjects' : type === 'chapter' ? 'chapters' : 'lectures';
    let payload = data;
    if (type === 'lecture') {
      payload = {
        title: data.title,
        topics: data.topics,
        video_url: data.video_url,
        content_markdown: data.content,
        tags: data.tags || [],
      };
    }
    try {
      if (editingItem) {
        const { error } = await supabase.from(table).update(payload).eq('id', editingItem.id);
        if (error) throw error;
      } else {
        const insertData = { ...payload };
        if (type === 'subject') insertData.course_id = courseId;
        if (type === 'chapter') insertData.subject_id = parentId;
        if (type === 'lecture') insertData.chapter_id = parentId;
        
        const { error } = await supabase.from(table).insert(insertData);
        if (error) throw error;
      }
      
      setRefreshKey(prev => prev + 1);
      setIsSubjectModalOpen(false);
      setIsChapterModalOpen(false);
      setIsLectureModalOpen(false);
      setEditingItem(null);
      setParentId(null);
    } catch (err: any) {
      alert('Failed to save: ' + err.message);
    }
  };

  if (loading && !course) return (
    <div className="flex flex-col items-center justify-center py-40 gap-4">
      <Loader2 className="animate-spin text-indigo-500" size={40} />
      <p className="text-slate-400 font-medium tracking-wide">Loading course details...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/admin/courses')}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-all"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">{course?.title}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-indigo-400 font-bold text-sm">{course?.profiles?.name}</span>
              <span className="text-slate-600">•</span>
              <span className={cn(
                "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider",
                course?.status === 'published' ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
              )}>
                {course?.status}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400 text-xs flex items-center gap-1">
                <Users size={12} /> {course?.student_count || 0} Students
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center bg-[#161b22] border border-slate-800 rounded-2xl p-1 shadow-xl">
          <button 
            onClick={() => setActiveTab('curriculum')}
            className={cn(
              "px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
              activeTab === 'curriculum' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-slate-400 hover:text-white"
            )}
          >
            <Layout size={16} />
            Curriculum
          </button>
          {course?.is_offline && (
            <button 
              onClick={() => setActiveTab('payments')}
              className={cn(
                "px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                activeTab === 'payments' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-slate-400 hover:text-white"
              )}
            >
              <CreditCard size={16} />
              Payments
            </button>
          )}
          <button 
            onClick={() => setActiveTab('settings')}
            className={cn(
              "px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
              activeTab === 'settings' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-slate-400 hover:text-white"
            )}
          >
            <Settings size={16} />
            Settings
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#161b22] border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="aspect-video relative bg-slate-800">
              {course?.thumbnail_url ? (
                <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-600">
                  <BookOpen size={48} />
                </div>
              )}
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-white tracking-tight">{formatPrice(course?.main_price)}</span>
                {(course?.discounted_price ?? 0) > 0 && (
                  <span className="text-slate-500 line-through text-sm">{formatPrice(course?.discounted_price)}</span>
                )}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">{course?.description}</p>
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <button 
                  onClick={() => window.open(`/courses/${courseId}`, '_blank')}
                  className="w-full py-3 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-xl border border-white/10 transition-all flex items-center justify-center gap-2"
                >
                  <ExternalLink size={14} />
                  View Public Page
                </button>
                <button 
                  onClick={() => setIsSubjectModalOpen(true)}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={14} />
                  Add New Subject
                </button>
              </div>
            </div>
          </div>

          <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-3xl p-6 space-y-4">
            <h4 className="text-sm font-bold text-indigo-400 flex items-center gap-2">
              <CheckCircle2 size={16} />
              Quick Stats
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Subjects</p>
                <p className="text-lg font-bold text-white">{subjects.length}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Lectures</p>
                <p className="text-lg font-bold text-white">
                  {subjects.reduce((acc, s) => acc + s.chapters.reduce((acc2: any, c: any) => acc2 + c.lectures.length, 0), 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {activeTab === 'curriculum' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <BookOpen size={24} className="text-indigo-500" />
                  Course Curriculum
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <GripVertical size={14} />
                  Drag to reorder subjects, chapters, or lectures
                </div>
              </div>

              {subjects.length === 0 ? (
                <div className="bg-[#161b22] border border-slate-800 rounded-3xl p-20 text-center space-y-4">
                  <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-600">
                    <BookOpen size={40} />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-lg font-bold text-white">No Curriculum Yet</h4>
                    <p className="text-sm text-slate-500 max-w-xs mx-auto">Start building your course by adding subjects, chapters, and lectures.</p>
                  </div>
                  <button 
                    onClick={() => setIsSubjectModalOpen(true)}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all"
                  >
                    Add Your First Subject
                  </button>
                </div>
              ) : (
                <ContentTree 
                  subjects={subjects}
                  onEdit={(type, item) => {
                    setEditingItem(item);
                    if (type === 'subject') setIsSubjectModalOpen(true);
                    if (type === 'chapter') setIsChapterModalOpen(true);
                    if (type === 'lecture') setIsLectureModalOpen(true);
                  }}
                  onDelete={handleDelete}
                  onAddChild={(type, parentId) => {
                    setParentId(parentId);
                    setEditingItem(null);
                    if (type === 'chapter') setIsChapterModalOpen(true);
                    if (type === 'lecture') setIsLectureModalOpen(true);
                  }}
                  onReorder={handleReorder}
                  onManageQuestions={(lecture) => {
                    setSelectedLecture(lecture);
                    setIsQuestionsModalOpen(true);
                  }}
                />
              )}
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="bg-[#161b22] border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
              <div className="p-6 border-b border-slate-800 bg-[#1c2128]">
                <h3 className="text-lg font-bold text-white">Monthly Payment Requests</h3>
              </div>
              {paymentsLoading ? (
                <div className="p-20 flex flex-col items-center justify-center gap-4">
                  <Loader2 className="animate-spin text-indigo-500" size={40} />
                  <p className="text-slate-500">Loading...</p>
                </div>
              ) : pendingPayments.length === 0 ? (
                <div className="p-20 text-center text-slate-500 space-y-4">
                  <CreditCard className="mx-auto opacity-20" size={64} />
                  <p className="text-lg font-medium">No pending payment requests</p>
                  <p className="text-sm max-w-xs mx-auto">When students submit receipt numbers, they will appear here for approval.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-800">
                  {pendingPayments.map((p) => (
                    <div key={p.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <p className="font-bold text-white">{(p.profiles as any)?.name || 'Unknown'}</p>
                        <p className="text-sm text-slate-400">{(p.profiles as any)?.email}</p>
                        <p className="text-xs text-slate-500 mt-1">{p.month_label} • Receipt: {p.receipt_number}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={async () => {
                            try {
                              const res = await fetch('/api/payments/monthly', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ payment_id: p.id, action: 'approve' }),
                              });
                              if (!res.ok) throw new Error((await res.json()).error);
                              fetchPendingPayments();
                            } catch (err: any) {
                              alert(err.message);
                            }
                          }}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl flex items-center gap-2"
                        >
                          <CheckCircle2 size={16} />
                          Approve
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              const res = await fetch('/api/payments/monthly', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ payment_id: p.id, action: 'reject' }),
                              });
                              if (!res.ok) throw new Error((await res.json()).error);
                              fetchPendingPayments();
                            } catch (err: any) {
                              alert(err.message);
                            }
                          }}
                          className="px-4 py-2 bg-red-600/80 hover:bg-red-500 text-white text-sm font-bold rounded-xl flex items-center gap-2"
                        >
                          <X size={16} />
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-[#161b22] border border-slate-800 rounded-3xl p-8 space-y-8 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Settings size={20} className="text-slate-500" />
                  Course Settings
                </h3>
                <div className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                  course?.status === 'published' ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                )}>
                  Status: {course?.status}
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Course Title</label>
                    <input 
                      type="text" 
                      value={settingsForm.title} 
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full bg-[#0d1117] border border-slate-800 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Main Price (৳)</label>
                    <input 
                      type="number" 
                      value={settingsForm.main_price} 
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, main_price: Number(e.target.value) }))}
                      className="w-full bg-[#0d1117] border border-slate-800 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Discount Price (৳)</label>
                    <input 
                      type="number" 
                      value={settingsForm.discount_price} 
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, discount_price: Number(e.target.value) }))}
                      className="w-full bg-[#0d1117] border border-slate-800 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Thumbnail URL</label>
                    <input 
                      type="text" 
                      value={settingsForm.thumbnail_url} 
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, thumbnail_url: e.target.value }))}
                      className="w-full bg-[#0d1117] border border-slate-800 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Description</label>
                    <textarea 
                      value={settingsForm.description} 
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      className="w-full bg-[#0d1117] border border-slate-800 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none" 
                    />
                  </div>
                  <button 
                    onClick={handleUpdateSettings}
                    disabled={updating}
                    className="w-full py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl border border-white/10 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {updating ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    Save Changes
                  </button>
                </div>
                <div className="space-y-6">
                  <div className="p-8 bg-indigo-600/10 border border-indigo-500/20 rounded-3xl space-y-6">
                    <div className="space-y-2">
                      <h4 className="text-lg font-bold text-indigo-400">Visibility Control</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">Publishing your course makes it visible to all students on the platform. Draft courses are only visible to you.</p>
                    </div>
                    <button 
                      onClick={handleToggleStatus}
                      disabled={updating}
                      className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {updating ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                      {course?.status === 'published' ? 'Switch to Draft' : 'Publish Course Now'}
                    </button>
                  </div>
                  <div className="p-8 bg-red-500/5 border border-red-500/10 rounded-3xl space-y-4">
                    <h4 className="text-sm font-bold text-red-400 flex items-center gap-2">
                      <Trash2 size={16} />
                      Danger Zone
                    </h4>
                    <p className="text-xs text-slate-500">Deleting this course is permanent and cannot be undone. All student progress and content will be lost.</p>
                    <button 
                      onClick={handleDeleteCourse}
                      disabled={updating}
                      className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-bold rounded-xl border border-red-500/20 transition-all disabled:opacity-50"
                    >
                      Delete Course Permanently
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Forms */}
      <SubjectForm 
        isOpen={isSubjectModalOpen}
        onClose={() => {
          setIsSubjectModalOpen(false);
          setEditingItem(null);
        }}
        initialData={editingItem}
        onSubmit={(data) => handleFormSubmit('subject', data)}
      />

      <ChapterForm 
        isOpen={isChapterModalOpen}
        onClose={() => {
          setIsChapterModalOpen(false);
          setEditingItem(null);
          setParentId(null);
        }}
        initialData={editingItem}
        onSubmit={(data) => handleFormSubmit('chapter', data)}
      />

      <LectureForm 
        isOpen={isLectureModalOpen}
        onClose={() => {
          setIsLectureModalOpen(false);
          setEditingItem(null);
          setParentId(null);
        }}
        initialData={editingItem}
        onSubmit={(data) => handleFormSubmit('lecture', data)}
      />

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
  );
}
