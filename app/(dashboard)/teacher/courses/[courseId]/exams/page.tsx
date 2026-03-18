'use client';

import { useState, useEffect, useCallback, use } from 'react';
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
  ArrowLeft,
  Settings,
  Target,
  Zap,
  Play
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Exam, Course } from '@/lib/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format, isAfter, isBefore } from 'date-fns';

export default function TeacherCourseExamsPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  const [exams, setExams] = useState<Exam[]>([]);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data: courseData }, { data: examData }] = await Promise.all([
        supabase.from('courses').select('*').eq('id', courseId).single(),
        supabase.from('exams').select('*').eq('course_id', courseId).order('created_at', { ascending: false })
      ]);

      setCourse(courseData);
      setExams(examData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [supabase, courseId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getStatus = (exam: Exam) => {
    const now = new Date();
    const start = exam.start_time ? new Date(exam.start_time) : null;
    const end = exam.end_time ? new Date(exam.end_time) : null;

    if (exam.status === 'draft') return 'draft';
    if (start && isBefore(now, start)) return 'upcoming';
    if (start && end && isAfter(now, start) && isBefore(now, end)) return 'active';
    if (end && isAfter(now, end)) return 'ended';
    return 'active';
  };

  const filteredExams = exams.filter(e => 
    e.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && !course) {
    return (
      <DashboardShell>
        <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin text-indigo-500" size={48} />
          <p className="text-slate-400 font-medium tracking-wide">Loading course exams...</p>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="space-y-10 animate-in fade-in duration-500 font-bengali">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="p-2 bg-[#161b22] border border-slate-800 text-slate-400 hover:text-white rounded-xl transition-all"
            >
              <ArrowLeft size={24} />
            </button>
            <div className="space-y-1">
              <h1 className="text-3xl font-bold text-white tracking-tight">Course Exams</h1>
              <p className="text-slate-400">Manage exams for <span className="text-indigo-400">{course?.title}</span></p>
            </div>
          </div>
          <Link 
            href={`/teacher/courses/${courseId}/exams/new`}
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
              placeholder="Search exams..."
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
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total</p>
                <p className="text-lg font-bold text-white">{exams.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
                <Zap size={20} />
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active</p>
                <p className="text-lg font-bold text-white">{exams.filter(e => getStatus(e) === 'active').length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Exams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredExams.map((exam) => {
            const status = getStatus(exam);
            return (
              <div 
                key={exam.id} 
                className="bg-[#161b22] border border-slate-800 rounded-3xl overflow-hidden shadow-xl hover:border-slate-700 transition-all group flex flex-col"
              >
                <div className="p-8 flex-1 space-y-6">
                  <div className="flex items-center justify-between">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      status === 'active' ? "bg-emerald-500/10 text-emerald-500" :
                      status === 'upcoming' ? "bg-indigo-500/10 text-indigo-500" :
                      status === 'ended' ? "bg-slate-500/10 text-slate-500" :
                      "bg-amber-500/10 text-amber-500"
                    )}>
                      {status}
                    </span>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      <Clock size={12} />
                      {exam.duration_minutes}m
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-white leading-tight group-hover:text-indigo-400 transition-colors">
                    {exam.title}
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm text-slate-400">
                      <Calendar size={16} className="text-indigo-500" />
                      <span>{exam.start_time ? format(new Date(exam.start_time), 'MMM d, p') : 'No schedule'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-400">
                      <Target size={16} className="text-emerald-500" />
                      <span>{exam.negative_marking ? `Neg: -${exam.negative_value}` : 'No Negative Marking'}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-white/5 border-t border-slate-800 grid grid-cols-2 gap-3">
                  <Link 
                    href={`/teacher/courses/${courseId}/exams/${exam.id}/questions`}
                    className="py-3 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
                  >
                    <Settings size={16} />
                    Manage
                  </Link>
                  <Link 
                    href={`/teacher/courses/${courseId}/exams/${exam.id}/results`}
                    className="py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
                  >
                    <BarChart3 size={16} />
                    Results
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {filteredExams.length === 0 && (
          <div className="p-20 bg-[#161b22] border border-slate-800 rounded-3xl text-center space-y-4">
            <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center text-slate-600 mx-auto">
              <FileText size={32} />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">No exams found</h3>
              <p className="text-slate-400">Start by creating your first exam for this course.</p>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
