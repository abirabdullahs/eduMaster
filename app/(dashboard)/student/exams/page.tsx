'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import DashboardShell from '@/components/layout/DashboardShell';
import { 
  Search, 
  Loader2, 
  ChevronRight, 
  Calendar,
  Zap,
  Clock,
  PlayCircle,
  History,
  Globe,
  GraduationCap
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { format, isAfter, isBefore } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';

export default function StudentExamsPage() {
  const [activeTab, setActiveTab] = useState<'my-exams' | 'public-exams'>('my-exams');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState<any[]>([]);
  const { user } = useAuth();
  const supabase = createClient();

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Fetch Enrolled Course IDs
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select('course_id')
        .eq('student_id', user.id)
        .eq('status', 'active');
      
      const enrolledCourseIds = enrollments?.map(e => e.course_id) || [];

      // 2. Fetch Exams
      const { data: examData } = await supabase
        .from('exams')
        .select(`
          *,
          courses (title)
        `)
        .eq('status', 'published')
        .order('start_time', { ascending: true });

      setExams(examData?.map(exam => {
        const now = new Date();
        const start = exam.start_time ? new Date(exam.start_time) : null;
        const end = exam.end_time ? new Date(exam.end_time) : null;

        let status: 'upcoming' | 'live' | 'ended' = 'upcoming';
        if (start && isBefore(now, start)) status = 'upcoming';
        else if (start && end && isAfter(now, start) && isBefore(now, end)) status = 'live';
        else if (end && isAfter(now, end)) status = 'ended';
        else if (!start && !end) status = 'live'; // Always live if no time set (e.g. practice only)

        const isEnrolled = enrolledCourseIds.includes(exam.course_id);
        const isPublic = exam.exam_type === 'public';

        return { ...exam, status, isEnrolled, isPublic };
      }) || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredExams = exams.filter(exam => {
    const matchesSearch = exam.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'my-exams' ? exam.isEnrolled : exam.isPublic;
    return matchesSearch && matchesTab;
  });

  return (
    <DashboardShell>
      <div className="space-y-10 animate-in fade-in duration-500 font-bengali">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-white tracking-tight">পরীক্ষাসমূহ</h1>
            <p className="text-slate-400">আপনার কোর্সের পরীক্ষা এবং পাবলিক পরীক্ষাগুলোতে অংশগ্রহণ করুন।</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={18} />
              <input 
                type="text"
                placeholder="পরীক্ষা খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-6 py-3 bg-[#161b22] border border-slate-800 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all w-full md:w-80"
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 p-1.5 bg-[#161b22] border border-slate-800 rounded-2xl w-fit">
          <button 
            onClick={() => setActiveTab('my-exams')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
              activeTab === 'my-exams' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
          >
            <GraduationCap size={18} />
            আমার কোর্স পরীক্ষা
          </button>
          <button 
            onClick={() => setActiveTab('public-exams')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
              activeTab === 'public-exams' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
          >
            <Globe size={18} />
            পাবলিক পরীক্ষা
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="animate-spin text-indigo-500" size={48} />
            <p className="text-slate-500 font-bold animate-pulse">লোড হচ্ছে...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredExams.length > 0 ? (
              filteredExams.map((exam) => (
                <div key={exam.id} className="group bg-[#161b22] border border-slate-800 rounded-3xl p-6 hover:border-indigo-500/50 transition-all shadow-xl flex flex-col">
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center justify-between">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
                        exam.status === 'live' ? "bg-emerald-500/10 text-emerald-500" : 
                        exam.status === 'upcoming' ? "bg-indigo-500/10 text-indigo-500" : "bg-slate-500/10 text-slate-500"
                      )}>
                        {exam.status === 'live' ? <PlayCircle size={24} /> : 
                         exam.status === 'upcoming' ? <Calendar size={24} /> : <History size={24} />}
                      </div>
                      <span className={cn(
                        "px-3 py-1 text-[10px] font-bold rounded-lg uppercase tracking-widest",
                        exam.status === 'live' ? "bg-emerald-500/10 text-emerald-500 animate-pulse" : 
                        exam.status === 'upcoming' ? "bg-indigo-500/10 text-indigo-400" : "bg-slate-500/10 text-slate-400"
                      )}>
                        {exam.status}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-2">
                        {exam.title}
                      </h3>
                      {exam.courses?.title && (
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{exam.courses.title}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800/50">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Duration</p>
                        <p className="text-sm font-bold text-white flex items-center gap-1">
                          <Clock size={14} className="text-indigo-500" />
                          {exam.duration_minutes}m
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Marking</p>
                        <p className="text-sm font-bold text-white flex items-center gap-1">
                          <Zap size={14} className="text-amber-500" />
                          {exam.negative_marking ? `-${exam.negative_value}` : 'No Neg'}
                        </p>
                      </div>
                    </div>

                    {exam.start_time && (
                      <div className="pt-4 space-y-1">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Time Window</p>
                        <p className="text-xs text-slate-400">
                          {format(new Date(exam.start_time), 'MMM d, p')} - {exam.end_time ? format(new Date(exam.end_time), 'p') : 'Open'}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="pt-8">
                    {exam.status === 'live' ? (
                      <Link 
                        href={`/exam/${exam.access_link}`}
                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                      >
                        Start Exam <ChevronRight size={18} />
                      </Link>
                    ) : exam.status === 'ended' ? (
                      <Link 
                        href={`/exam/${exam.access_link}?practice=true`}
                        className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
                      >
                        Practice Mode <ChevronRight size={18} />
                      </Link>
                    ) : (
                      <div className="w-full py-4 bg-slate-800/50 text-slate-600 font-bold rounded-2xl text-center cursor-not-allowed">
                        Upcoming...
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center space-y-6 bg-[#161b22] border border-slate-800 rounded-3xl">
                <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-600">
                  <Calendar size={40} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white">কোনো পরীক্ষা পাওয়া যায়নি</h3>
                  <p className="text-slate-500">আপাতত কোনো পরীক্ষা নেই।</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
