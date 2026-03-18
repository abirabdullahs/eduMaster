'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  GraduationCap, 
  Mail, 
  Phone, 
  CheckCircle2, 
  XCircle, 
  Search, 
  MoreVertical, 
  Trash2, 
  ExternalLink,
  Loader2,
  AlertCircle,
  BookOpen,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Profile } from '@/lib/types';
import { useSearchParams, useRouter } from 'next/navigation';

export default function AdminTeachers() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = searchParams.get('tab') || 'active';
  
  const [teachers, setTeachers] = useState<Profile[]>([]);
  const [teacherCourses, setTeacherCourses] = useState<Record<string, { id: string; title: string }[]>>({});
  const [expandedTeacherId, setExpandedTeacherId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const supabase = createClient();

  const fetchTeachers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const status = activeTab === 'pending' ? 'pending' : 'active';
      const { data: teachersData, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'teacher')
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setTeachers(teachersData || []);

      if (teachersData?.length && activeTab === 'active') {
        const { data: coursesData } = await supabase
          .from('courses')
          .select('id, title, teacher_id')
          .in('teacher_id', teachersData.map(t => t.id));
        const byTeacher: Record<string, { id: string; title: string }[]> = {};
        (coursesData || []).forEach((c: any) => {
          if (!byTeacher[c.teacher_id]) byTeacher[c.teacher_id] = [];
          byTeacher[c.teacher_id].push({ id: c.id, title: c.title });
        });
        setTeacherCourses(byTeacher);
      } else {
        setTeacherCourses({});
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch teachers');
    } finally {
      setLoading(false);
    }
  }, [activeTab, supabase]);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  const handleStatusUpdate = async (id: string, newStatus: 'active' | 'rejected') => {
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ status: newStatus })
        .eq('id', id);

      if (updateError) throw updateError;
      
      // Refresh list
      fetchTeachers();
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Teacher Management</h1>
          <p className="text-slate-400 mt-1">Manage teacher applications and active staff.</p>
        </div>
        
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-1 bg-[#161b22] border border-slate-800 rounded-2xl p-1">
          <button 
            onClick={() => router.push('/admin/teachers?tab=active')}
            className={cn(
              "px-6 py-2 rounded-xl text-sm font-bold transition-all",
              activeTab === 'active' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-slate-400 hover:text-white"
            )}
          >
            Active Teachers
          </button>
          <button 
            onClick={() => router.push('/admin/teachers?tab=pending')}
            className={cn(
              "px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
              activeTab === 'pending' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-slate-400 hover:text-white"
            )}
          >
            Pending Requests
            {activeTab !== 'pending' && teachers.length > 0 && activeTab === 'active' && (
              <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
            )}
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Search teachers by name or email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#161b22] border border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-[#161b22] border border-slate-800 rounded-3xl p-6 space-y-6 animate-pulse">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-slate-800" />
                  <div className="space-y-2">
                    <div className="h-5 w-32 bg-slate-800 rounded" />
                    <div className="h-3 w-24 bg-slate-800 rounded" />
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-4 w-full bg-slate-800 rounded" />
                <div className="h-4 w-3/4 bg-slate-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-3xl flex flex-col items-center text-center gap-4">
          <AlertCircle className="text-red-500" size={48} />
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">Error Loading Data</h3>
            <p className="text-sm text-red-200">{error}</p>
          </div>
          <button onClick={fetchTeachers} className="px-6 py-2 bg-red-500 text-white font-bold rounded-xl">Retry</button>
        </div>
      ) : filteredTeachers.length === 0 ? (
        <div className="py-20 text-center bg-[#161b22] border border-dashed border-slate-800 rounded-3xl space-y-4">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-500">
            <GraduationCap size={32} />
          </div>
          <p className="text-slate-500 font-medium">No {activeTab} teachers found.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTeachers.map((teacher) => (
            <div key={teacher.id} className="bg-[#161b22] border border-slate-800 rounded-3xl p-6 space-y-6 group hover:border-indigo-500/50 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-indigo-500/20">
                    {teacher.name[0]}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white leading-tight">{teacher.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">{teacher.subject_expertise || 'No expertise listed'}</p>
                  </div>
                </div>
                <button className="p-2 text-slate-500 hover:text-white transition-all">
                  <MoreVertical size={18} />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-slate-400">
                  <Mail size={16} className="text-indigo-500" />
                  <span className="truncate">{teacher.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-400">
                  <Phone size={16} className="text-indigo-500" />
                  <span>{teacher.mobile || 'N/A'}</span>
                </div>
              </div>

              {activeTab === 'pending' && (
                <div className="space-y-4">
                  <div className="p-4 bg-[#0d1117] rounded-2xl border border-slate-800">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Bio</p>
                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">{teacher.bio || 'No bio provided.'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => handleStatusUpdate(teacher.id, 'active')}
                      className="flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20"
                    >
                      <CheckCircle2 size={14} />
                      Approve
                    </button>
                    <button 
                      onClick={() => handleStatusUpdate(teacher.id, 'rejected')}
                      className="flex items-center justify-center gap-2 py-2.5 bg-red-600/10 hover:bg-red-600/20 text-red-500 text-xs font-bold rounded-xl border border-red-500/20 transition-all"
                    >
                      <XCircle size={14} />
                      Reject
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'active' && (
                <div className="pt-4 border-t border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Active</span>
                      {(teacherCourses[teacher.id]?.length ?? 0) > 0 && (
                        <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 text-[10px] font-bold rounded-lg">
                          {teacherCourses[teacher.id].length} course(s)
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {(teacherCourses[teacher.id]?.length ?? 0) > 0 && (
                        <button
                          onClick={() => setExpandedTeacherId(expandedTeacherId === teacher.id ? null : teacher.id)}
                          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-all flex items-center gap-1"
                        >
                          {expandedTeacherId === teacher.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          <span className="text-[10px]">{expandedTeacherId === teacher.id ? 'Hide' : 'Show'}</span>
                        </button>
                      )}
                      <button className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-all">
                        <ExternalLink size={14} />
                      </button>
                      <button className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-all">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  {expandedTeacherId === teacher.id && teacherCourses[teacher.id]?.length > 0 && (
                    <div className="p-3 bg-[#0d1117] rounded-xl border border-slate-800 space-y-2">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Assigned Courses</p>
                      {teacherCourses[teacher.id].map((c) => (
                        <div key={c.id} className="flex items-center gap-2 text-sm">
                          <BookOpen size={12} className="text-indigo-500" />
                          <span className="text-slate-300">{c.title}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
