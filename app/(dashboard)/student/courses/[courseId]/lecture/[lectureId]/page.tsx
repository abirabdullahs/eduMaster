'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { createClient } from '@/lib/supabase/client';
import DashboardShell from '@/components/layout/DashboardShell';
import { 
  Loader2, 
  ChevronRight, 
  CheckCircle2, 
  PlayCircle, 
  FileText, 
  ArrowLeft,
  Menu,
  X,
  ChevronDown,
  ChevronLeft,
  Download,
  BookOpen,
  Lock,
  HelpCircle
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import MarkdownContentRenderer from '@/components/lectures/MarkdownContentRenderer';
import { Course, Subject, Chapter, Lecture, LectureProgress } from '@/lib/types';
import { useRouter } from 'next/navigation';

export default function StudentLecturePage({ params }: { params: Promise<{ courseId: string, lectureId: string }> }) {
  const { courseId, lectureId } = use(params);
  
  const [course, setCourse] = useState<Course | null>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [progress, setProgress] = useState<Map<string, { completed: boolean; mcq_passed?: boolean; mcq_score?: number; mcq_total?: number }>>(new Map());
  const [lockedLectures, setLockedLectures] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);
  const [currentChapter, setCurrentChapter] = useState<any>(null);
  const [completing, setCompleting] = useState(false);
  const [mcqQuestions, setMcqQuestions] = useState<any[]>([]);
  const [mcqAnswers, setMcqAnswers] = useState<Record<string, string>>({});
  const [mcqSubmitting, setMcqSubmitting] = useState(false);
  const [showMcqResult, setShowMcqResult] = useState<{ score: number; total: number; passed: boolean } | null>(null);
  const supabase = createClient();
  const router = useRouter();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

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
      
      const sortedSubjects = subjectData?.map(s => ({
        ...s,
        chapters: s.chapters.sort((a: any, b: any) => a.order_index - b.order_index).map((c: any) => ({
          ...c,
          lectures: c.lectures.sort((a: any, b: any) => a.order_index - b.order_index)
        }))
      })) || [];
      setSubjects(sortedSubjects);

      // 3. Fetch Progress (with mcq data)
      const { data: progressData } = await supabase
        .from('lecture_progress')
        .select('lecture_id, mcq_passed, mcq_score, mcq_total, completed_at')
        .eq('student_id', session.user.id);
      
      const progressMap = new Map<string, { completed: boolean; mcq_passed?: boolean; mcq_score?: number; mcq_total?: number }>();
      progressData?.forEach(p => {
        progressMap.set(p.lecture_id, {
          completed: !!p.completed_at,
          mcq_passed: p.mcq_passed,
          mcq_score: p.mcq_score,
          mcq_total: p.mcq_total,
        });
      });
      setProgress(progressMap);

      // 4. Compute locked lectures (80% MCQ rule)
      const allLecs = sortedSubjects.flatMap((s: any) => s.chapters.flatMap((c: any) => c.lectures));
      const locked = new Set<string>();
      for (let i = 1; i < allLecs.length; i++) {
        const prev = allLecs[i - 1];
        const curr = allLecs[i];
        const prevProg = progressMap.get(prev.id);
        const prevMcqCount = prev.mcq_count ?? 0;
        if (prevMcqCount > 0) {
          if (!prevProg?.mcq_passed) locked.add(curr.id);
        }
      }
      setLockedLectures(locked);

      // 5. Find Selected Lecture and its Chapter
      const allLectures = sortedSubjects.flatMap(s => s.chapters.flatMap((c: any) => c.lectures));
      const found = allLectures.find(l => l.id === lectureId);
      setSelectedLecture(found || null);

      if (found) {
        const chapter = sortedSubjects.flatMap(s => s.chapters).find(c => c.id === found.chapter_id);
        setCurrentChapter(chapter);
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [courseId, lectureId, supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!selectedLecture || (selectedLecture.mcq_count ?? 0) === 0) {
      setMcqQuestions([]);
      setMcqAnswers({});
      return;
    }
    const load = async () => {
      const { data } = await supabase
        .from('questions')
        .select('*')
        .eq('lecture_id', selectedLecture.id)
        .order('order_index');
      setMcqQuestions(data || []);
      setMcqAnswers({});
    };
    load();
  }, [selectedLecture?.id, selectedLecture?.mcq_count, supabase]);

  // On mobile, start with sidebar closed for more content space; on desktop keep it open
  useEffect(() => {
    setSidebarOpen(window.innerWidth >= 1024);
  }, []);

  const handleMarkComplete = async () => {
    if (!selectedLecture || (selectedLecture.mcq_count ?? 0) > 0) return;
    setCompleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase.from('lecture_progress').upsert({
        student_id: session.user.id,
        lecture_id: selectedLecture.id,
        completed_at: new Date().toISOString(),
      }, { onConflict: 'student_id,lecture_id' });

      if (error) throw error;

      setProgress(prev => new Map(prev).set(selectedLecture.id, { completed: true }));
      const allLectures = subjects.flatMap(s => s.chapters.flatMap((c: any) => c.lectures));
      const idx = allLectures.findIndex(l => l.id === selectedLecture.id);
      if (idx < allLectures.length - 1) router.push(`/student/courses/${courseId}/lecture/${allLectures[idx + 1].id}`);
    } catch (err: any) {
      alert(err.message || 'Failed to mark as complete');
    } finally {
      setCompleting(false);
    }
  };

  const handleMcqSubmit = async () => {
    if (!selectedLecture || mcqQuestions.length === 0) return;
    setMcqSubmitting(true);
    try {
      const res = await fetch('/api/lecture/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lecture_id: selectedLecture.id,
          mcq_answers: Object.entries(mcqAnswers).map(([question_id, selected_option]) => ({
            question_id,
            selected_option: selected_option as 'a' | 'b' | 'c' | 'd',
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setShowMcqResult({ score: data.score, total: data.total, passed: data.passed });
      setProgress(prev => new Map(prev).set(selectedLecture.id, {
        completed: data.passed,
        mcq_passed: data.passed,
        mcq_score: data.score,
        mcq_total: data.total,
      }));
      if (data.passed && data.next_lecture_id) {
        setLockedLectures(prev => {
          const next = new Set(prev);
          next.delete(data.next_lecture_id);
          return next;
        });
      }
    } catch (err: any) {
      alert(err.message || 'Failed to submit');
    } finally {
      setMcqSubmitting(false);
    }
  };

  const getNavigation = () => {
    const allLectures = subjects.flatMap(s => s.chapters.flatMap((c: any) => c.lectures));
    const currentIndex = allLectures.findIndex(l => l.id === selectedLecture?.id);
    return {
      prev: currentIndex > 0 ? allLectures[currentIndex - 1] : null,
      next: currentIndex < allLectures.length - 1 ? allLectures[currentIndex + 1] : null
    };
  };

  const nav = getNavigation();

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex flex-col items-center justify-center py-40 space-y-4">
          <Loader2 className="animate-spin text-indigo-500" size={48} />
          <p className="text-slate-500 font-bold animate-pulse">লোড হচ্ছে...</p>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="flex min-h-[calc(100dvh-80px)] -m-4 sm:-m-6 md:-m-8 relative overflow-hidden font-bengali max-w-full">
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-20 lg:hidden" 
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}
        {/* Sidebar: Content Tree */}
        <div className={cn(
          "bg-[#161b22] border-r border-slate-800 transition-all duration-300 flex flex-col fixed inset-y-0 left-0 lg:relative lg:inset-auto z-30 lg:z-auto h-[100dvh] lg:h-full",
          sidebarOpen ? "w-[min(320px,85vw)] translate-x-0 lg:w-72" : "w-0 -translate-x-full lg:translate-x-0 lg:w-72 overflow-hidden"
        )}>
          <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-white flex items-center gap-2">
              <BookOpen size={18} className="text-indigo-500" />
              কোর্স কন্টেন্ট
            </h3>
            <button onClick={() => setSidebarOpen(false)} className="text-slate-500 hover:text-white lg:hidden">
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 overscroll-contain">
            {subjects.map((subject) => (
              <div key={subject.id} className="space-y-2">
                <div className="px-3 py-2 bg-slate-800/50 rounded-xl text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <ChevronDown size={14} />
                  {subject.title}
                </div>
                <div className="space-y-1 pl-2">
                  {subject.chapters.map((chapter: any) => (
                    <div key={chapter.id} className="space-y-1">
                      <div className="px-3 py-1.5 text-sm font-bold text-white/80 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                        {chapter.title}
                      </div>
                      <div className="space-y-0.5 pl-4">
                        {chapter.lectures.map((lecture: any) => {
                          const isLocked = lockedLectures.has(lecture.id);
                          const prog = progress.get(lecture.id);
                          return isLocked ? (
                            <div
                              key={lecture.id}
                              className={cn(
                                "w-full px-3 py-2 rounded-xl text-left text-xs flex items-center justify-between cursor-not-allowed opacity-60",
                                selectedLecture?.id === lecture.id ? "bg-slate-800" : "text-slate-500"
                              )}
                              title="আগের lecture এর MCQ-তে ৮০% পেলে unlock হবে"
                            >
                              <div className="flex items-center gap-2">
                                <Lock size={14} className="text-amber-500" />
                                <span className="line-clamp-1">{lecture.title}</span>
                              </div>
                            </div>
                          ) : (
                            <Link
                              key={lecture.id}
                              href={`/student/courses/${courseId}/lecture/${lecture.id}`}
                              className={cn(
                                "w-full px-3 py-2 rounded-xl text-left text-xs transition-all flex items-center justify-between group",
                                selectedLecture?.id === lecture.id 
                                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" 
                                  : "text-slate-400 hover:bg-white/5 hover:text-white"
                              )}
                            >
                              <div className="flex items-center gap-2">
                                {lecture.video_url ? <PlayCircle size={14} /> : <FileText size={14} />}
                                <span className="line-clamp-1">{lecture.title}</span>
                              </div>
                              {(prog?.completed || prog?.mcq_passed) && (
                                <CheckCircle2 size={14} className={cn(selectedLecture?.id === lecture.id ? "text-white" : "text-emerald-500")} />
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col bg-[#0d1117] overflow-y-auto">
          {/* Top Bar */}
          <div className="sticky top-0 z-10 bg-[#0d1117]/95 backdrop-blur-md border-b border-slate-800 p-3 sm:p-4 flex items-center justify-between gap-2 min-w-0">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="shrink-0 p-2 bg-[#161b22] border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-all"
              >
                <Menu size={18} className="sm:w-5 sm:h-5" />
              </button>
              <div className="space-y-0.5 min-w-0 flex-1">
                <h2 className="text-xs sm:text-sm font-bold text-white line-clamp-2 truncate">{selectedLecture?.title || 'Lecture Content'}</h2>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate">{course?.title}</p>
              </div>
            </div>
            <Link 
              href={`/student/courses/${courseId}`}
              className="shrink-0 px-3 py-2 sm:px-4 bg-[#161b22] border border-slate-800 text-slate-400 hover:text-white rounded-xl text-[10px] sm:text-xs font-bold transition-all flex items-center gap-1 sm:gap-2"
            >
              <ArrowLeft size={14} />
              <span className="hidden sm:inline">Course Home</span>
            </Link>
          </div>

          {/* Content */}
          {selectedLecture ? (
            <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto w-full space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-x-hidden">
              {lockedLectures.has(selectedLecture.id) ? (
                <div className="flex flex-col items-center justify-center py-20 px-6 bg-[#161b22] border border-slate-800 rounded-2xl">
                  <Lock size={64} className="text-amber-500/60 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">লেকচার লক করা আছে</h3>
                  <p className="text-slate-400 text-center max-w-md">আগের lecture এর MCQ-তে ৮০% পেলে এই lecture unlock হবে।</p>
                </div>
              ) : (
                <>
              {/* Video Player */}
              {selectedLecture.video_url && (
                <div className="aspect-video bg-black rounded-xl sm:rounded-3xl overflow-hidden shadow-xl border border-slate-800 w-full max-w-full">
                  <iframe 
                    src={selectedLecture.video_url.replace('watch?v=', 'embed/')}
                    className="w-full h-full"
                    allowFullScreen
                  />
                </div>
              )}

              {/* Lecture Info */}
              <div className="space-y-6 sm:space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
                  <div className="space-y-2 min-w-0">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight break-words">{selectedLecture.title}</h1>
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                      {selectedLecture.topics?.split(',').map((topic, i) => (
                        <span key={i} className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-bold rounded-lg uppercase tracking-widest">
                          {topic.trim()}
                        </span>
                      ))}
                      {currentChapter?.suggestion_pdf_url && (
                        <a 
                          href={currentChapter.suggestion_pdf_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded-lg uppercase tracking-widest flex items-center gap-1 hover:bg-emerald-500/20 transition-all"
                        >
                          <Download size={12} /> Suggestions PDF
                        </a>
                      )}
                    </div>
                  </div>
                  {(selectedLecture.mcq_count ?? 0) === 0 && (
                    <button 
                      onClick={handleMarkComplete}
                      disabled={completing || progress.get(selectedLecture.id)?.completed}
                      className={cn(
                        "w-full md:w-auto shrink-0 px-6 py-3 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg text-sm sm:text-base",
                        progress.get(selectedLecture.id)?.completed
                          ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 cursor-default"
                          : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20"
                      )}
                    >
                      {completing ? <Loader2 className="animate-spin" size={20} /> : (
                        progress.get(selectedLecture.id)?.completed ? <><CheckCircle2 size={20} /> Completed</> : <><CheckCircle2 size={20} /> Mark as Complete</>
                      )}
                    </button>
                  )}
                </div>

                {/* Markdown Content */}
                {(selectedLecture.content_markdown || (selectedLecture as any).content_html) && (
                  <div className="bg-[#161b22] border border-slate-800 rounded-xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl overflow-x-auto min-h-[120px]">
                    <MarkdownContentRenderer 
                      content={selectedLecture.content_markdown || (selectedLecture as any).content_html} 
                    />
                  </div>
                )}

                {/* MCQ Section */}
                {(selectedLecture.mcq_count ?? 0) > 0 && (
                  <div className="bg-[#161b22] border border-slate-800 rounded-xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl space-y-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <HelpCircle size={20} />
                      MCQ প্রশ্ন
                    </h3>
                    {progress.get(selectedLecture.id)?.mcq_passed ? (
                      <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                        <CheckCircle2 size={24} className="text-emerald-500" />
                        <span className="text-emerald-400 font-bold">✓ Completed — Score: {progress.get(selectedLecture.id)!.mcq_score}/{progress.get(selectedLecture.id)!.mcq_total}</span>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-4">
                          {mcqQuestions.map((q, i) => (
                            <div key={q.id} className="p-4 bg-[#0d1117] rounded-xl border border-slate-800">
                              <p className="text-sm font-medium text-white mb-3">{i + 1}. {q.question_text}</p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {['a','b','c','d'].map(opt => q[`option_${opt}`] && (
                                  <button
                                    key={opt}
                                    type="button"
                                    onClick={() => setMcqAnswers(prev => ({ ...prev, [q.id]: opt }))}
                                    className={cn(
                                      "p-3 rounded-xl text-left text-sm border transition-all",
                                      mcqAnswers[q.id] === opt ? "bg-indigo-600 border-indigo-500 text-white" : "bg-white/5 border-slate-800 text-slate-400 hover:border-slate-600"
                                    )}
                                  >
                                    <span className="font-bold mr-2">{opt.toUpperCase()}.</span>{q[`option_${opt}`]}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={handleMcqSubmit}
                          disabled={mcqSubmitting || Object.keys(mcqAnswers).length < mcqQuestions.length}
                          className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center gap-2"
                        >
                          {mcqSubmitting ? <Loader2 className="animate-spin" size={20} /> : <>Submit Answers</>}
                        </button>
                      </>
                    )}
                  </div>
                )}

                {showMcqResult && (
                  <div className={cn(
                    "fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4",
                    showMcqResult.passed ? "bg-emerald-500/10" : ""
                  )}>
                    <div className={cn(
                      "max-w-md w-full p-8 rounded-2xl border text-center",
                      showMcqResult.passed ? "bg-emerald-500/10 border-emerald-500/30" : "bg-amber-500/10 border-amber-500/30"
                    )}>
                      <h3 className="text-xl font-bold text-white mb-2">
                        {showMcqResult.passed ? '🎉 Congratulations!' : 'Try Again'}
                      </h3>
                      <p className="text-slate-300 mb-4">Score: {showMcqResult.score}/{showMcqResult.total} ({Math.round(showMcqResult.score/showMcqResult.total*100)}%)</p>
                      <p className="text-sm text-slate-400 mb-6">
                        {showMcqResult.passed ? 'You passed! Next lecture is now unlocked.' : 'You need 80% to unlock the next lecture.'}
                      </p>
                      <button
                        onClick={() => setShowMcqResult(null)}
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl"
                      >
                        OK
                      </button>
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-6 sm:pt-10 border-t border-slate-800">
                  {nav.prev ? (
                    <Link 
                      href={`/student/courses/${courseId}/lecture/${nav.prev.id}`}
                      className="flex items-center gap-3 sm:gap-4 group min-w-0"
                    >
                      <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 bg-[#161b22] border border-slate-800 rounded-xl sm:rounded-2xl flex items-center justify-center text-slate-500 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all">
                        <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Previous</p>
                        <p className="text-xs sm:text-sm font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-1">{nav.prev.title}</p>
                      </div>
                    </Link>
                  ) : <div />}

                  {nav.next ? (
                    <Link 
                      href={`/student/courses/${courseId}/lecture/${nav.next.id}`}
                      className="flex items-center gap-3 sm:gap-4 text-right group min-w-0 sm:flex-row-reverse"
                    >
                      <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 bg-[#161b22] border border-slate-800 rounded-xl sm:rounded-2xl flex items-center justify-center text-slate-500 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all">
                        <ChevronRight size={20} className="sm:w-6 sm:h-6" />
                      </div>
                      <div className="space-y-0.5 min-w-0 flex-1 text-right">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Next</p>
                        <p className="text-xs sm:text-sm font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-1">{nav.next.title}</p>
                      </div>
                    </Link>
                  ) : <div />}
                </div>
              </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 space-y-4">
              <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center">
                <PlayCircle size={40} />
              </div>
              <p className="font-bold">লেকচার পাওয়া যায়নি</p>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
