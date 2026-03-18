'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import DashboardShell from '@/components/layout/DashboardShell';
import { 
  FileText, 
  Search, 
  Loader2, 
  BarChart3, 
  Users, 
  Clock, 
  Calendar,
  ChevronRight,
  Shield,
  Trash2,
  Filter,
  ArrowUpRight,
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Exam, Course, Profile } from '@/lib/types';
import Link from 'next/link';
import { format } from 'date-fns';

export default function AdminExamsPage() {
  const [exams, setExams] = useState<(Exam & { courses: Course; profiles: Profile })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'course' | 'public'>('all');
  
  const supabase = createClient();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: examData } = await supabase
        .from('exams')
        .select(`
          *,
          courses:course_id (*),
          profiles:created_by (*)
        `)
        .order('created_at', { ascending: false });

      setExams(examData as any || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredExams = exams.filter(e => {
    const matchesSearch = 
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.courses?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.profiles?.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === 'all' || e.exam_type === filterType;

    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <DashboardShell>
        <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin text-indigo-500" size={48} />
          <p className="text-slate-400 font-medium tracking-wide">Loading all exams...</p>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="space-y-12 font-bengali">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-white tracking-tight">Exam Management</h1>
            <p className="text-slate-400">Monitor and manage all exams across the platform.</p>
          </div>
          <div className="flex bg-[#161b22] border border-slate-800 rounded-2xl p-4 gap-8 shrink-0 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500">
                <FileText size={20} />
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Global Exams</p>
                <p className="text-lg font-bold text-white">{exams.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-500">
                <Shield size={20} />
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Public Exams</p>
                <p className="text-lg font-bold text-white">{exams.filter(e => e.exam_type === 'public').length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input 
              type="text" 
              placeholder="Search by title, course, or teacher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-[#161b22] border border-slate-800 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            />
          </div>
          <div className="flex bg-[#161b22] border border-slate-800 rounded-2xl p-1 shrink-0">
            {(['all', 'course', 'public'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={cn(
                  "px-6 py-3 rounded-xl text-sm font-bold capitalize transition-all",
                  filterType === t ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Exams Table */}
        <div className="bg-[#161b22] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-white/5">
                  <th className="p-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Exam Details</th>
                  <th className="p-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Course</th>
                  <th className="p-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Created By</th>
                  <th className="p-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Type</th>
                  <th className="p-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Schedule</th>
                  <th className="p-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="p-6 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredExams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-white/5 transition-all group">
                    <td className="p-6">
                      <div className="space-y-1">
                        <p className="font-bold text-white group-hover:text-indigo-400 transition-colors">{exam.title}</p>
                        <div className="flex items-center gap-3 text-[10px] text-slate-500">
                          <span className="flex items-center gap-1"><Clock size={10} /> {exam.duration_minutes}m</span>
                          <span className="flex items-center gap-1"><Target size={10} /> {exam.negative_marking ? `-${exam.negative_value}` : 'No neg'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <p className="text-sm text-slate-400">{exam.courses?.title || 'Public'}</p>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-slate-400">
                          {exam.profiles?.name[0]}
                        </div>
                        <p className="text-sm text-slate-400">{exam.profiles?.name}</p>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        exam.exam_type === 'public' ? "bg-emerald-500/10 text-emerald-500" : "bg-indigo-500/10 text-indigo-500"
                      )}>
                        {exam.exam_type}
                      </span>
                    </td>
                    <td className="p-6">
                      <div className="space-y-1">
                        <p className="text-xs text-slate-400">{exam.start_time ? format(new Date(exam.start_time), 'MMM d, p') : 'N/A'}</p>
                        <p className="text-[10px] text-slate-600">to {exam.end_time ? format(new Date(exam.end_time), 'MMM d, p') : 'N/A'}</p>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        exam.status === 'published' ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                      )}>
                        {exam.status}
                      </span>
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          href={`/admin/courses/${exam.course_id}/exams/${exam.id}/results`}
                          className="p-2 hover:bg-indigo-500/10 text-slate-500 hover:text-indigo-500 rounded-lg transition-all"
                          title="View Results"
                        >
                          <BarChart3 size={18} />
                        </Link>
                        <button 
                          className="p-2 hover:bg-red-500/10 text-slate-500 hover:text-red-500 rounded-lg transition-all"
                          title="Delete Exam"
                        >
                          <Trash2 size={18} />
                        </button>
                        <Link 
                          href={`/exam/${exam.access_link}`}
                          target="_blank"
                          className="p-2 hover:bg-emerald-500/10 text-slate-500 hover:text-emerald-500 rounded-lg transition-all"
                          title="View Public Page"
                        >
                          <ArrowUpRight size={18} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredExams.length === 0 && (
              <div className="p-20 text-center space-y-4">
                <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center text-slate-600 mx-auto">
                  <Search size={32} />
                </div>
                <p className="text-slate-500 font-medium">No exams found matching your search.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
