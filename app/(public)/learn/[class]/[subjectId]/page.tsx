'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Lock, CheckCircle2, Loader2, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import FreeContentViewer from '@/components/free-content/FreeContentViewer';

export default function LearnSubjectPage() {
  const params = useParams();
  const classParam = (params.class as string)?.toUpperCase() || 'SSC';
  const subjectId = params.subjectId as string;
  const [subject, setSubject] = useState<any>(null);
  const [chapters, setChapters] = useState<any[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<any>(null);
  const [contents, setContents] = useState<any[]>([]);
  const [contentIndex, setContentIndex] = useState(0);
  const resumeIndexRef = useRef<number | null>(null);
  const [progress, setProgress] = useState<Record<string, { status: string; answer_given?: string; is_correct?: boolean }>>({});
  const [subjectProgress, setSubjectProgress] = useState({ completed: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
  }, [supabase]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: subj } = await supabase
        .from('free_subjects')
        .select('*')
        .eq('id', subjectId)
        .single();
      setSubject(subj);

      const { data: chaps } = await supabase
        .from('free_chapters')
        .select(`
          *,
          topics:free_topics (*)
        `)
        .eq('subject_id', subjectId)
        .order('order_index');

      const sorted = (chaps || []).map((c: any) => ({
        ...c,
        topics: (c.topics || []).sort((a: any, b: any) => a.order_index - b.order_index),
      })).sort((a: any, b: any) => a.order_index - b.order_index);
      setChapters(sorted);

      const allTopics = sorted.flatMap((c: any) => c.topics || []);

      if (allTopics.length === 0) {
        setLoading(false);
        return;
      }

      let initialTopic = allTopics[0];
      let initialIndex = 0;

      if (user) {
        const res = await fetch(`/api/free-content/progress?subject_id=${subjectId}`);
        const data = await res.json();
        if (data.subjectProgress) {
          setSubjectProgress(data.subjectProgress);
        }
        if (data.resume?.topic_id && data.resume?.content_index != null) {
          const t = allTopics.find((x: any) => x.id === data.resume.topic_id);
          if (t) {
            initialTopic = t;
            initialIndex = data.resume.content_index;
          }
        }
      } else {
        const allTopicIds = allTopics.map((x: any) => x.id);
        const { count: totalContentCount } = allTopicIds.length > 0
          ? await supabase.from('free_contents').select('*', { count: 'exact', head: true }).in('topic_id', allTopicIds)
          : { count: 0 };
        setSubjectProgress({ completed: 0, total: totalContentCount ?? 0 });
      }

      setSelectedTopic(initialTopic);
      resumeIndexRef.current = initialIndex;
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [subjectId, supabase, user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!selectedTopic) return;
    supabase
      .from('free_contents')
      .select('*')
      .eq('topic_id', selectedTopic.id)
      .order('order_index')
      .then(({ data }) => {
        const list = data || [];
        setContents(list);
        const idx = resumeIndexRef.current;
        resumeIndexRef.current = null;
        setContentIndex(idx !== null ? Math.min(idx, Math.max(0, list.length - 1)) : 0);
      });
  }, [selectedTopic?.id, supabase]);

  useEffect(() => {
    if (!selectedTopic || !user) return;
    fetch(`/api/free-content/progress?topic_id=${selectedTopic.id}`)
      .then(r => r.json())
      .then(d => setProgress(Array.isArray(d.progress) ? {} : (d.progress || {})))
      .catch(() => {});
  }, [selectedTopic?.id, user]);

  const currentContent = contents[contentIndex];
  const isGuest = !user;
  const showBlur = isGuest && contentIndex >= 3;

  const handleMarkComplete = async () => {
    if (!user || !currentContent) return;
    const wasCompleted = progress[currentContent.id]?.status === 'completed';
    await fetch('/api/free-content/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content_id: currentContent.id,
        status: 'completed',
        answer_given: null,
      }),
    });
    setProgress(p => ({ ...p, [currentContent.id]: { status: 'completed' } }));
    if (!wasCompleted) setSubjectProgress(prev => ({ ...prev, completed: prev.completed + 1 }));
    if (contentIndex < contents.length - 1) setContentIndex(i => i + 1);
  };

  const handleAnswerSubmit = async (answer: string, isCorrect?: boolean) => {
    if (!user || !currentContent) return;
    const wasCompleted = progress[currentContent.id]?.status === 'completed';
    await fetch('/api/free-content/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content_id: currentContent.id,
        status: 'completed',
        answer_given: answer,
        is_correct: isCorrect,
      }),
    });
    setProgress(p => ({
      ...p,
      [currentContent.id]: { status: 'completed', answer_given: answer, is_correct: isCorrect },
    }));
    if (!wasCompleted) setSubjectProgress(prev => ({ ...prev, completed: prev.completed + 1 }));
    if (contentIndex < contents.length - 1) setContentIndex(i => i + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500" size={48} />
      </div>
    );
  }

  const currentChapter = chapters.find(c => c.topics?.some((t: any) => t.id === selectedTopic?.id));

  return (
    <div className="min-h-screen pt-20 pb-12 font-bengali">
      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <div className={cn(
          "w-72 border-r border-slate-800 bg-[#0d1117] flex flex-col shrink-0 z-40",
          "max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:transform max-md:transition-transform max-md:duration-300 max-md:ease-out",
          sidebarOpen ? "max-md:translate-x-0" : "max-md:-translate-x-full"
        )}>
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-white">Topics</h3>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden p-2 text-slate-500">
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {chapters.map((ch) => (
              <div key={ch.id} className="mb-4">
                <div className="px-3 py-2 text-xs font-bold text-slate-500 uppercase">{ch.name}</div>
                {ch.topics?.map((t: any) => (
                  <button
                    key={t.id}
                    onClick={() => { setSelectedTopic(t); setSidebarOpen(false); }}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2",
                      selectedTopic?.id === t.id ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-white/5"
                    )}
                  >
                    {t.id === selectedTopic?.id && contents.length > 0 && contents.every((c: any) => progress[c.id]?.status === 'completed') ? (
                      <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                    ) : null}
                    {t.name}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Mobile menu + overlay */}
        {sidebarOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black/60 z-30"
            onClick={() => setSidebarOpen(false)}
            aria-hidden
          />
        )}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden fixed bottom-4 left-4 z-20 p-3 bg-indigo-600 rounded-xl text-white shadow-lg"
          aria-label="Toggle menu"
        >
          <Menu size={24} />
        </button>

        {/* Main */}
        <div className="flex-1 min-w-0 overflow-y-auto p-4 sm:p-6 md:p-10">
          <div className="max-w-3xl mx-auto">
            <nav className="text-sm text-slate-500 mb-6 flex items-center gap-2 flex-wrap">
              <Link href="/learn" className="hover:text-white">Learn</Link>
              <span className="mx-1">/</span>
              <Link href={`/learn/${classParam}`} className="hover:text-white">{classParam} Subjects</Link>
              <span className="mx-1">/</span>
              <span className="text-white">{subject?.name}</span>
              {currentChapter && (
                <>
                  <span className="mx-2">/</span>
                  <span>{currentChapter.name}</span>
                  <span className="mx-2">/</span>
                  <span className="text-indigo-400">{selectedTopic?.name}</span>
                </>
              )}
            </nav>

            {!selectedTopic ? (
              <p className="text-slate-500">Select a topic from the sidebar</p>
            ) : contents.length === 0 ? (
              <p className="text-slate-500">No content in this topic yet.</p>
            ) : (
              <div className="relative">
                {showBlur && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-2xl">
                    <div className="text-center p-8">
                      <Lock size={48} className="mx-auto text-amber-500 mb-4" />
                      <h3 className="text-xl font-bold text-white mb-2">Login to continue</h3>
                      <p className="text-slate-400 mb-6">First 3 contents are free. Login to access more.</p>
                      <Link
                        href="/login"
                        className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl"
                      >
                        Login
                      </Link>
                    </div>
                  </div>
                )}
                <div className={cn(showBlur && "blur-sm pointer-events-none")}>
                  <h2 className="text-2xl font-bold text-white mb-6">{currentContent?.title}</h2>
                  <FreeContentViewer
                    content={currentContent}
                    onSubmitAnswer={handleAnswerSubmit}
                    isCompleted={progress[currentContent?.id]?.status === 'completed'}
                    previousAnswer={progress[currentContent?.id]?.answer_given}
                    isCorrect={progress[currentContent?.id]?.is_correct}
                  />
                </div>

                <div className="mt-10 pt-6 border-t border-slate-800 space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">
                      {subjectProgress.completed} / {subjectProgress.total} completed
                    </span>
                    <button
                      type="button"
                      onClick={() => setSidebarOpen(true)}
                      className="text-indigo-400 hover:text-indigo-300 font-medium"
                    >
                      See All Topics
                    </button>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 transition-all duration-300"
                      style={{
                        width: `${subjectProgress.total > 0 ? (subjectProgress.completed / subjectProgress.total) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => setContentIndex(i => Math.max(0, i - 1))}
                      disabled={contentIndex === 0}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#161b22] text-slate-400 hover:text-white disabled:opacity-50 shrink-0"
                    >
                      <ChevronLeft size={18} /> Previous
                    </button>
                    <span className="text-sm text-slate-500 shrink-0">{contentIndex + 1} / {contents.length}</span>
                    <button
                      onClick={async () => {
                        if (user && currentContent) {
                          const wasCompleted = progress[currentContent.id]?.status === 'completed';
                          await fetch('/api/free-content/progress', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              content_id: currentContent.id,
                              status: 'completed',
                              answer_given: progress[currentContent.id]?.answer_given ?? null,
                              is_correct: progress[currentContent.id]?.is_correct ?? null,
                            }),
                          });
                          setProgress(p => ({ ...p, [currentContent.id]: { ...p[currentContent.id], status: 'completed' } }));
                          if (!wasCompleted) setSubjectProgress(prev => ({ ...prev, completed: prev.completed + 1 }));
                        }
                        setContentIndex(i => Math.min(contents.length - 1, i + 1));
                      }}
                      disabled={contentIndex === contents.length - 1}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#161b22] text-slate-400 hover:text-white disabled:opacity-50 shrink-0"
                    >
                      Next <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
