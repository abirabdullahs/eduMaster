'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import DashboardShell from '@/components/layout/DashboardShell';
import { 
  FileText, 
  Plus, 
  Search, 
  Loader2, 
  MoreVertical, 
  Edit, 
  Trash2, 
  BarChart3, 
  Users, 
  Clock, 
  Calendar,
  ChevronRight,
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Exam, Course } from '@/lib/types';
import Link from 'next/link';
import { format } from 'date-fns';

export default function TeacherExamsPage() {
  const [exams, setExams] = useState<(Exam & { courses: Course })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const supabase = createClient();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: examData } = await supabase
        .from('exams')
        .select(`
          *,
          courses:course_id (*)
        `)
        .eq('created_by', user.id)
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

  const filteredExams = exams.filter(e => 
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.courses?.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <DashboardShell>
        <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin text-indigo-500" size={48} />
          <p className="text-slate-400 font-medium tracking-wide">Loading your exams...</p>
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
            <h1 className="text-4xl font-bold text-white tracking-tight">My Exams</h1>
            <p className="text-slate-400">Manage your course exams and analyze student performance.</p>
          </div>
          <Link 
            href="/teacher/courses" // Teachers create exams from course context usually, but we can provide a shortcut
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20"
          >
            <Plus size={20} />
            Create New Exam
          </Link>
        </div>

        {/* Search & Stats */}
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input 
              type="text" 
              placeholder="Search by exam title or course..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-[#161b22] border border-slate-800 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            />
          </div>
          <div className="flex bg-[#161b22] border border-slate-800 rounded-2xl p-4 gap-8 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500">
                <FileText size={20} />
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Exams</p>
                <p className="text-lg font-bold text-white">{exams.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
                <Users size={20} />
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Exams</p>
                <p className="text-lg font-bold text-white">{exams.filter(e => e.status === 'published').length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Exams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredExams.map((exam) => (
            <div 
              key={exam.id} 
              className="bg-[#161b22] border border-slate-800 rounded-3xl overflow-hidden shadow-xl hover:border-slate-700 transition-all group flex flex-col"
            >
              <div className="p-8 flex-1 space-y-6">
                <div className="flex items-center justify-between">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                    exam.status === 'published' ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                  )}>
                    {exam.status}
                  </span>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <Clock size={12} />
                    {exam.duration_minutes}m
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white leading-tight group-hover:text-indigo-400 transition-colors">
                    {exam.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Course: <span className="text-slate-400">{exam.courses?.title || 'Public Exam'}</span>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="p-4 bg-white/5 rounded-2xl border border-slate-800/50 space-y-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Attempts</p>
                    <p className="text-lg font-bold text-white">0</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-slate-800/50 space-y-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Avg. Score</p>
                    <p className="text-lg font-bold text-white">0.0</p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white/5 border-t border-slate-800 grid grid-cols-2 gap-3">
                <Link 
                  href={`/teacher/courses/${exam.course_id}/exams/${exam.id}/questions`}
                  className="py-3 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
                >
                  <Edit size={16} />
                  Manage
                </Link>
                <Link 
                  href={`/teacher/courses/${exam.course_id}/exams/${exam.id}/results`}
                  className="py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
                >
                  <BarChart3 size={16} />
                  Results
                </Link>
              </div>
            </div>
          ))}
        </div>

        {filteredExams.length === 0 && (
          <div className="p-20 bg-[#161b22] border border-slate-800 rounded-3xl text-center space-y-4">
            <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center text-slate-600 mx-auto">
              <FileText size={32} />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">No exams found</h3>
              <p className="text-slate-400">Start by creating an exam for one of your courses.</p>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
