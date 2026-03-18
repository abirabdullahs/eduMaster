'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import DashboardShell from '@/components/layout/DashboardShell';
import { 
  Search, 
  Loader2, 
  ChevronRight, 
  Trophy,
  CheckCircle2,
  XCircle,
  Calendar,
  BarChart3,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';

export default function StudentResultsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [selectedAttempt, setSelectedAttempt] = useState<any | null>(null);
  const { user } = useAuth();
  const supabase = createClient();

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data } = await supabase
        .from('exam_attempts')
        .select(`
          *,
          exams (title, total_marks, pass_marks)
        `)
        .eq('student_id', user.id)
        .eq('is_practice', false)
        .order('created_at', { ascending: false });

      setAttempts(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredAttempts = attempts.filter(attempt => 
    attempt.exams?.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedAttempt) {
    return (
      <DashboardShell>
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 font-bengali">
          <button 
            onClick={() => setSelectedAttempt(null)}
            className="flex items-center gap-2 text-slate-500 hover:text-white transition-all group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold">Back to Results</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Summary Card */}
            <div className="lg:col-span-1 space-y-8">
              <div className="bg-[#161b22] border border-slate-800 rounded-3xl p-8 shadow-xl space-y-8">
                <div className="text-center space-y-4">
                  <div className="w-24 h-24 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto text-indigo-500">
                    <Trophy size={48} />
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-2xl font-bold text-white tracking-tight">{selectedAttempt.exams.title}</h2>
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">{format(new Date(selectedAttempt.created_at), 'MMMM d, yyyy')}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-800/50 rounded-2xl space-y-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Score</p>
                    <p className="text-2xl font-bold text-white">{selectedAttempt.score}</p>
                  </div>
                  <div className="p-4 bg-slate-800/50 rounded-2xl space-y-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total</p>
                    <p className="text-2xl font-bold text-slate-400">{selectedAttempt.exams.total_marks}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400 flex items-center gap-2 font-bold">
                      <CheckCircle2 size={16} className="text-emerald-500" />
                      Correct
                    </span>
                    <span className="text-white font-bold">{selectedAttempt.correct_count}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400 flex items-center gap-2 font-bold">
                      <XCircle size={16} className="text-rose-500" />
                      Wrong
                    </span>
                    <span className="text-white font-bold">{selectedAttempt.wrong_count}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400 flex items-center gap-2 font-bold">
                      <BarChart3 size={16} className="text-indigo-500" />
                      Accuracy
                    </span>
                    <span className="text-white font-bold">
                      {Math.round((selectedAttempt.correct_count / (selectedAttempt.correct_count + selectedAttempt.wrong_count)) * 100) || 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Breakdown Placeholder */}
            <div className="lg:col-span-2 bg-[#161b22] border border-slate-800 rounded-3xl p-8 shadow-xl flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center text-slate-600">
                <BarChart3 size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">বিস্তারিত বিশ্লেষণ</h3>
                <p className="text-slate-500 max-w-md">এখানে প্রতিটি প্রশ্নের উত্তর এবং সঠিক উত্তরের ব্যাখ্যা দেখানো হবে। (শীঘ্রই আসছে)</p>
              </div>
            </div>
          </div>
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
            <h1 className="text-4xl font-bold text-white tracking-tight">ফলাফল</h1>
            <p className="text-slate-400">আপনার দেওয়া পরীক্ষাগুলোর ফলাফল এবং বিশ্লেষণ দেখুন।</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={18} />
              <input 
                type="text"
                placeholder="ফলাফল খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-6 py-3 bg-[#161b22] border border-slate-800 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all w-full md:w-80"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-[#161b22] border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-800/50 border-b border-slate-800">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Exam Name</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Score</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Correct/Wrong</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Date</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <div className="h-4 w-40 bg-slate-800 rounded" />
                          <div className="h-3 w-24 bg-slate-800 rounded" />
                        </div>
                      </td>
                      <td className="px-6 py-4"><div className="h-4 w-16 bg-slate-800 rounded" /></td>
                      <td className="px-6 py-4"><div className="h-4 w-20 bg-slate-800 rounded" /></td>
                      <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-800 rounded" /></td>
                      <td className="px-6 py-4 text-right"><div className="h-8 w-8 bg-slate-800 rounded ml-auto" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-[#161b22] border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-800/50 border-b border-slate-800">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Exam Name</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Score</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Correct/Wrong</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Date</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredAttempts.length > 0 ? (
                    filteredAttempts.map((attempt) => (
                      <tr key={attempt.id} className="group hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <div className="space-y-0.5">
                            <p className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">{attempt.exams.title}</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Attempt #{attempt.id.slice(0, 8)}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">{attempt.score}</span>
                            <span className="text-xs text-slate-500">/ {attempt.exams.total_marks}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 text-emerald-500 text-xs font-bold">
                              <CheckCircle2 size={14} />
                              {attempt.correct_count}
                            </div>
                            <div className="flex items-center gap-1 text-rose-500 text-xs font-bold">
                              <XCircle size={14} />
                              {attempt.wrong_count}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-slate-400 text-xs">
                            <Calendar size={14} />
                            {format(new Date(attempt.created_at), 'MMM d, yyyy')}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => setSelectedAttempt(attempt)}
                            className="p-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-400 hover:text-white hover:border-indigo-500 transition-all"
                          >
                            <ChevronRight size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-20 text-center">
                        <div className="space-y-4">
                          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-600">
                            <Trophy size={32} />
                          </div>
                          <p className="text-slate-500 font-bold">এখনো কোনো পরীক্ষা দেওয়া হয়নি</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
