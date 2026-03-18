'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  Clock, 
  Target, 
  Calendar, 
  AlertCircle, 
  Loader2,
  Play,
  CheckCircle2,
  Info,
  ArrowRight,
  ShieldAlert,
  History
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Exam, Enrollment, Profile } from '@/lib/types';
import ExamPlayer from '@/components/exams/ExamPlayer';
import PracticeMode from '@/components/exams/PracticeMode';
import { differenceInSeconds, isAfter, isBefore, format } from 'date-fns';

export default function ExamAccessClient({ initialExam }: { initialExam: Exam }) {
  const [exam, setExam] = useState<Exam>(initialExam);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExamStarted, setIsExamStarted] = useState(false);
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  const [practiceConfig, setPracticeConfig] = useState<{ timed: boolean; duration?: number } | null>(null);
  const [countdown, setCountdown] = useState<number>(0);
  const [hasAlreadyAttempted, setHasAlreadyAttempted] = useState(false);
  
  const router = useRouter();
  const params = useParams();
  const accessLink = params.accessLink as string;
  const supabase = createClient();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Get User
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        router.push(`/login?redirect=/exam/${accessLink}`);
        return;
      }
      setUser(authUser);

      // 2. Check Enrollment if Course Exam
      if (initialExam.exam_type === 'course') {
        const { data: enrollData } = await supabase
          .from('enrollments')
          .select('*')
          .eq('course_id', initialExam.course_id)
          .eq('student_id', authUser.id)
          .eq('status', 'active')
          .single();

        if (!enrollData) {
          setError('You are not enrolled in the course associated with this exam.');
        } else {
          setEnrollment(enrollData);
        }
      }

      // 3. Check if student has already attempted real exam (one attempt only)
      const { data: existingAttempt } = await supabase
        .from('exam_attempts')
        .select('id')
        .eq('student_id', authUser.id)
        .eq('exam_id', initialExam.id)
        .eq('is_practice', false)
        .maybeSingle();

      if (existingAttempt) {
        setHasAlreadyAttempted(true);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load exam details');
    } finally {
      setLoading(false);
    }
  }, [supabase, accessLink, router, initialExam]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Countdown timer for scheduled exams
  useEffect(() => {
    if (!exam?.start_time) return;
    
    const interval = setInterval(() => {
      const now = new Date();
      const start = new Date(exam.start_time!);
      const diff = differenceInSeconds(start, now);
      
      if (diff <= 0) {
        setCountdown(0);
        clearInterval(interval);
      } else {
        setCountdown(diff);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [exam]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0e17] gap-4">
        <Loader2 className="animate-spin text-indigo-500" size={48} />
        <p className="text-slate-400 font-medium tracking-wide">Preparing exam environment...</p>
      </div>
    );
  }

  if (isExamStarted) {
    return (
      <ExamPlayer 
        exam={exam!} 
        isPractice={isPracticeMode} 
        practiceDuration={practiceConfig?.duration}
        onComplete={() => {
          setIsExamStarted(false);
          setIsPracticeMode(false);
          setPracticeConfig(null);
        }}
      />
    );
  }

  const now = new Date();
  const startTime = exam?.start_time ? new Date(exam.start_time) : null;
  const endTime = exam?.end_time ? new Date(exam.end_time) : null;
  
  const isBeforeStart = startTime && isBefore(now, startTime);
  const isAfterEnd = endTime && isAfter(now, endTime);
  const isWithinWindow = startTime && endTime && isAfter(now, startTime) && isBefore(now, endTime);
  const isPublic = exam?.exam_type === 'public';
  const canStartReal = (isPublic || enrollment) && isWithinWindow;

  return (
    <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center p-6 font-bengali">
      <div className="w-full max-w-2xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Exam Card */}
        <div className="bg-[#161b22] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-8 border-b border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className={cn(
                "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                isPublic ? "bg-emerald-500/10 text-emerald-500" : "bg-indigo-500/10 text-indigo-500"
              )}>
                {isPublic ? 'Public Exam' : 'Course Exam'}
              </span>
              {exam?.status === 'draft' && (
                <span className="px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  Draft Mode
                </span>
              )}
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">{exam?.title}</h1>
            <div className="flex flex-wrap gap-6 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-indigo-500" />
                <span>{exam?.duration_minutes} Minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <Target size={16} className="text-purple-500" />
                <span>{exam?.negative_marking ? `Negative: ${exam.negative_value}` : 'No Negative Marking'}</span>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-8">
            {error ? (
              <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-4">
                <ShieldAlert className="text-red-500 shrink-0" size={24} />
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white">Access Denied</h3>
                  <p className="text-sm text-red-200">{error}</p>
                </div>
              </div>
            ) : (
              <>
                {/* Rules */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Info size={20} className="text-blue-500" />
                    Exam Rules
                  </h3>
                  <ul className="space-y-3 text-sm text-slate-400">
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                      <span>The exam will automatically submit when the timer reaches zero.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                      <span>Do not refresh the page or navigate away during the exam.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                      <span>Each question has 4 options. Only one is correct.</span>
                    </li>
                  </ul>
                </div>

                {/* Status & Actions */}
                <div className="pt-6 border-t border-slate-800">
                  {isAfterEnd ? (
                    <div className="space-y-6">
                      <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-3">
                        <History className="text-amber-500" size={20} />
                        <p className="text-sm text-amber-200 font-medium">This exam is now in Practice Mode.</p>
                      </div>
                      <PracticeMode 
                        onStart={(config) => {
                          setPracticeConfig(config);
                          setIsPracticeMode(true);
                          setIsExamStarted(true);
                        }}
                      />
                    </div>
                  ) : isBeforeStart ? (
                    <div className="text-center space-y-6">
                      <div className="space-y-2">
                        <p className="text-slate-500 text-sm uppercase tracking-widest font-bold">Exam starts in</p>
                        <div className="text-5xl font-bold text-white font-mono tracking-tighter">
                          {Math.floor(countdown / 3600).toString().padStart(2, '0')}:
                          {Math.floor((countdown % 3600) / 60).toString().padStart(2, '0')}:
                          {(countdown % 60).toString().padStart(2, '0')}
                        </div>
                      </div>
                      <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl inline-block">
                        <p className="text-xs text-indigo-300">
                          Scheduled for: {format(startTime!, 'PPP p')}
                        </p>
                      </div>
                    </div>
                  ) : isWithinWindow ? (
                    hasAlreadyAttempted ? (
                      <div className="space-y-6">
                        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex flex-col gap-3">
                          <p className="text-sm text-amber-200 font-medium">
                            আপনাকে এই পরীক্ষা ইতিমধ্যে দিয়েছেন। শুধুমাত্র একবার পরীক্ষা দেওয়া যাবে।
                          </p>
                        </div>
                        <PracticeMode 
                          onStart={(config) => {
                            setPracticeConfig(config);
                            setIsPracticeMode(true);
                            setIsExamStarted(true);
                          }}
                        />
                      </div>
                    ) : (
                      <button 
                        onClick={() => setIsExamStarted(true)}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-xl shadow-indigo-500/20 transition-all flex items-center justify-center gap-3 group"
                      >
                        <Play size={20} className="group-hover:translate-x-1 transition-transform" />
                        Start Real Exam
                      </button>
                    )
                  ) : (
                    <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-center">
                      <p className="text-slate-400 text-sm">Exam schedule is not yet active.</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-slate-600">
            Logged in as <span className="text-slate-400 font-bold">{user?.email}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
