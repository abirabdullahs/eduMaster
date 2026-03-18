'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  BarChart3, 
  Users, 
  Trophy, 
  Target, 
  Search, 
  Download, 
  ArrowLeft,
  Loader2,
  ChevronRight,
  User,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Exam, ExamAttempt, Profile } from '@/lib/types';
import { format } from 'date-fns';

interface AttemptWithProfile extends ExamAttempt {
  profiles: Profile;
}

export default function ExamResultsDashboard() {
  const [exam, setExam] = useState<Exam | null>(null);
  const [attempts, setAttempts] = useState<AttemptWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'real' | 'practice'>('all');
  
  const router = useRouter();
  const params = useParams();
  const { role, courseId, examId } = params;
  const supabase = createClient();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Get Exam
      const { data: examData } = await supabase
        .from('exams')
        .select('*')
        .eq('id', examId)
        .single();
      setExam(examData);

      // 2. Get Attempts with Profiles
      const { data: attemptData } = await supabase
        .from('exam_attempts')
        .select(`
          *,
          profiles:student_id (*)
        `)
        .eq('exam_id', examId)
        .order('submitted_at', { ascending: false });

      setAttempts(attemptData as any || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [supabase, examId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredAttempts = attempts.filter(a => {
    const matchesSearch = 
      a.profiles.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.profiles.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesMode = 
      filterMode === 'all' || 
      (filterMode === 'real' && !a.is_practice) || 
      (filterMode === 'practice' && a.is_practice);

    return matchesSearch && matchesMode;
  });

  // Stats
  const realAttempts = attempts.filter(a => !a.is_practice);
  const avgScore = realAttempts.length > 0 
    ? realAttempts.reduce((acc, curr) => acc + curr.score, 0) / realAttempts.length 
    : 0;
  const highestScore = realAttempts.length > 0 
    ? Math.max(...realAttempts.map(a => a.score)) 
    : 0;
  const passRate = realAttempts.length > 0
    ? (realAttempts.filter(a => (a.score / a.total_questions) >= 0.4).length / realAttempts.length) * 100
    : 0;

  const exportToCSV = () => {
    const headers = ['Student Name', 'Email', 'Score', 'Total Questions', 'Correct', 'Wrong', 'Mode', 'Submitted At'];
    const rows = filteredAttempts.map(a => [
      a.profiles.name,
      a.profiles.email,
      a.score,
      a.total_questions,
      a.correct_count,
      a.wrong_count,
      a.is_practice ? 'Practice' : 'Real',
      format(new Date(a.submitted_at!), 'PPP p')
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `results_${exam?.title.replace(/\s+/g, '_')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0e17] gap-4">
        <Loader2 className="animate-spin text-indigo-500" size={48} />
        <p className="text-slate-400 font-medium tracking-wide">Analyzing results...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e17] p-6 md:p-12 font-bengali">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <button 
              onClick={() => router.back()}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-all text-sm font-bold uppercase tracking-widest mb-4"
            >
              <ArrowLeft size={16} />
              Back to Exam
            </button>
            <h1 className="text-4xl font-bold text-white tracking-tight">{exam?.title} - Results</h1>
            <p className="text-slate-400">Comprehensive performance analysis for all students.</p>
          </div>
          <button 
            onClick={exportToCSV}
            className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl border border-slate-800 transition-all flex items-center gap-2"
          >
            <Download size={20} />
            Export CSV
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-[#161b22] border border-slate-800 rounded-3xl p-8 space-y-4 shadow-xl">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500">
              <Users size={24} />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Attempts</p>
              <p className="text-3xl font-bold text-white">{attempts.length}</p>
              <p className="text-[10px] text-slate-600">{realAttempts.length} Real • {attempts.length - realAttempts.length} Practice</p>
            </div>
          </div>
          <div className="bg-[#161b22] border border-slate-800 rounded-3xl p-8 space-y-4 shadow-xl">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
              <BarChart3 size={24} />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Avg. Score</p>
              <p className="text-3xl font-bold text-white">{avgScore.toFixed(2)}</p>
              <p className="text-[10px] text-slate-600">Based on real attempts</p>
            </div>
          </div>
          <div className="bg-[#161b22] border border-slate-800 rounded-3xl p-8 space-y-4 shadow-xl">
            <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500">
              <Trophy size={24} />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Highest Score</p>
              <p className="text-3xl font-bold text-white">{highestScore.toFixed(2)}</p>
              <p className="text-[10px] text-slate-600">Top performance</p>
            </div>
          </div>
          <div className="bg-[#161b22] border border-slate-800 rounded-3xl p-8 space-y-4 shadow-xl">
            <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500">
              <Target size={24} />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Pass Rate</p>
              <p className="text-3xl font-bold text-white">{passRate.toFixed(1)}%</p>
              <p className="text-[10px] text-slate-600">Score ≥ 40%</p>
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input 
              type="text" 
              placeholder="Search by student name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-[#161b22] border border-slate-800 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            />
          </div>
          <div className="flex bg-[#161b22] border border-slate-800 rounded-2xl p-1 shrink-0">
            {(['all', 'real', 'practice'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setFilterMode(m)}
                className={cn(
                  "px-6 py-3 rounded-xl text-sm font-bold capitalize transition-all",
                  filterMode === m ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
                )}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Results Table */}
        <div className="bg-[#161b22] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-white/5">
                  <th className="p-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Student</th>
                  <th className="p-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Score</th>
                  <th className="p-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Accuracy</th>
                  <th className="p-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Mode</th>
                  <th className="p-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Time Taken</th>
                  <th className="p-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Submitted</th>
                  <th className="p-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredAttempts.map((attempt) => {
                  const acc = Math.round((attempt.correct_count / attempt.total_questions) * 100);
                  const minutes = Math.floor(attempt.time_taken_seconds / 60);
                  const seconds = attempt.time_taken_seconds % 60;

                  return (
                    <tr key={attempt.id} className="hover:bg-white/5 transition-all group">
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400">
                            <User size={20} />
                          </div>
                          <div>
                            <p className="font-bold text-white">{attempt.profiles.name}</p>
                            <p className="text-xs text-slate-500">{attempt.profiles.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-white">{attempt.score.toFixed(2)}</span>
                          <span className="text-xs text-slate-500">/ {attempt.total_questions}</span>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden min-w-[60px]">
                            <div 
                              className={cn(
                                "h-full rounded-full transition-all duration-1000",
                                acc >= 80 ? "bg-emerald-500" : acc >= 40 ? "bg-amber-500" : "bg-red-500"
                              )}
                              style={{ width: `${acc}%` }}
                            />
                          </div>
                          <span className="text-sm font-bold text-slate-400">{acc}%</span>
                        </div>
                      </td>
                      <td className="p-6">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          attempt.is_practice ? "bg-amber-500/10 text-amber-500" : "bg-indigo-500/10 text-indigo-500"
                        )}>
                          {attempt.is_practice ? 'Practice' : 'Real'}
                        </span>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                          <Clock size={14} />
                          <span>{minutes}m {seconds}s</span>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                          <Calendar size={14} />
                          <span>{format(new Date(attempt.submitted_at!), 'MMM d, p')}</span>
                        </div>
                      </td>
                      <td className="p-6">
                        <button className="p-2 hover:bg-indigo-500/10 text-slate-500 hover:text-indigo-500 rounded-lg transition-all">
                          <ChevronRight size={20} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredAttempts.length === 0 && (
              <div className="p-20 text-center space-y-4">
                <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center text-slate-600 mx-auto">
                  <Search size={32} />
                </div>
                <p className="text-slate-500 font-medium">No results found matching your criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
