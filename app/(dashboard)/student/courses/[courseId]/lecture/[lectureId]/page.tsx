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
  BookOpen
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import LectureContentRenderer from '@/components/lectures/LectureContentRenderer';
import { Course, Subject, Chapter, Lecture, LectureProgress } from '@/lib/types';
import { useRouter } from 'next/navigation';

export default function StudentLecturePage({ params }: { params: Promise<{ courseId: string, lectureId: string }> }) {
  const { courseId, lectureId } = use(params);
  
  const [course, setCourse] = useState<Course | null>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [progress, setProgress] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);
  const [currentChapter, setCurrentChapter] = useState<any>(null);
  const [completing, setCompleting] = useState(false);
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

      // 3. Fetch Progress
      const { data: progressData } = await supabase
        .from('lecture_progress')
        .select('lecture_id')
        .eq('student_id', session.user.id);
      
      const completedIds = new Set(progressData?.map(p => p.lecture_id) || []);
      setProgress(completedIds);

      // 4. Find Selected Lecture and its Chapter
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

  const handleMarkComplete = async () => {
    if (!selectedLecture) return;
    setCompleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from('lecture_progress')
        .insert({
          student_id: session.user.id,
          lecture_id: selectedLecture.id
        });

      if (error && error.code !== '23505') throw error;

      setProgress(prev => new Set([...prev, selectedLecture.id]));
      
      // Auto-navigate to next lecture
      const allLectures = subjects.flatMap(s => s.chapters.flatMap((c: any) => c.lectures));
      const currentIndex = allLectures.findIndex(l => l.id === selectedLecture.id);
      if (currentIndex < allLectures.length - 1) {
        const nextLecture = allLectures[currentIndex + 1];
        router.push(`/student/courses/${courseId}/lecture/${nextLecture.id}`);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to mark as complete');
    } finally {
      setCompleting(false);
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
      <div className="flex h-[calc(100vh-120px)] -m-8 relative overflow-hidden font-bengali">
        {/* Sidebar: Content Tree */}
        <div className={cn(
          "bg-[#161b22] border-r border-slate-800 transition-all duration-300 flex flex-col absolute lg:relative z-20 h-full",
          sidebarOpen ? "w-80 translate-x-0" : "w-0 -translate-x-full lg:translate-x-0 lg:w-0 overflow-hidden"
        )}>
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-white flex items-center gap-2">
              <BookOpen size={18} className="text-indigo-500" />
              কোর্স কন্টেন্ট
            </h3>
            <button onClick={() => setSidebarOpen(false)} className="text-slate-500 hover:text-white lg:hidden">
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                        {chapter.lectures.map((lecture: any) => (
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
                            {progress.has(lecture.id) && (
                              <CheckCircle2 size={14} className={cn(selectedLecture?.id === lecture.id ? "text-white" : "text-emerald-500")} />
                            )}
                          </Link>
                        ))}
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
          <div className="sticky top-0 z-10 bg-[#0d1117]/80 backdrop-blur-md border-b border-slate-800 p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 bg-[#161b22] border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-all"
              >
                <Menu size={20} />
              </button>
              <div className="space-y-0.5">
                <h2 className="text-sm font-bold text-white line-clamp-1">{selectedLecture?.title || 'Lecture Content'}</h2>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{course?.title}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link 
                href={`/student/courses/${courseId}`}
                className="px-4 py-2 bg-[#161b22] border border-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2"
              >
                <ArrowLeft size={14} />
                Course Home
              </Link>
            </div>
          </div>

          {/* Content */}
          {selectedLecture ? (
            <div className="p-8 max-w-5xl mx-auto w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Video Player */}
              {selectedLecture.video_url && (
                <div className="aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
                  <iframe 
                    src={selectedLecture.video_url.replace('watch?v=', 'embed/')}
                    className="w-full h-full"
                    allowFullScreen
                  />
                </div>
              )}

              {/* Lecture Info */}
              <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-white tracking-tight">{selectedLecture.title}</h1>
                    <div className="flex flex-wrap gap-3">
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
                  <button 
                    onClick={handleMarkComplete}
                    disabled={completing || progress.has(selectedLecture.id)}
                    className={cn(
                      "px-8 py-4 rounded-2xl font-bold transition-all flex items-center gap-2 shadow-lg",
                      progress.has(selectedLecture.id)
                        ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 cursor-default"
                        : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20"
                    )}
                  >
                    {completing ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : progress.has(selectedLecture.id) ? (
                      <>
                        <CheckCircle2 size={20} />
                        Completed
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={20} />
                        Mark as Complete
                      </>
                    )}
                  </button>
                </div>

                {/* HTML Content - rendered as live page, not raw code */}
                {(selectedLecture.content_html || (selectedLecture as any).content) && (
                  <div className="bg-[#161b22] border border-slate-800 rounded-3xl p-8 shadow-xl">
                    <LectureContentRenderer 
                      content={selectedLecture.content_html || (selectedLecture as any).content} 
                    />
                  </div>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between pt-10 border-t border-slate-800">
                  {nav.prev ? (
                    <Link 
                      href={`/student/courses/${courseId}/lecture/${nav.prev.id}`}
                      className="flex items-center gap-4 group"
                    >
                      <div className="w-12 h-12 bg-[#161b22] border border-slate-800 rounded-2xl flex items-center justify-center text-slate-500 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all">
                        <ChevronLeft size={24} />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Previous</p>
                        <p className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">{nav.prev.title}</p>
                      </div>
                    </Link>
                  ) : <div />}

                  {nav.next ? (
                    <Link 
                      href={`/student/courses/${courseId}/lecture/${nav.next.id}`}
                      className="flex items-center gap-4 text-right group"
                    >
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Next</p>
                        <p className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">{nav.next.title}</p>
                      </div>
                      <div className="w-12 h-12 bg-[#161b22] border border-slate-800 rounded-2xl flex items-center justify-center text-slate-500 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all">
                        <ChevronRight size={24} />
                      </div>
                    </Link>
                  ) : <div />}
                </div>
              </div>
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
