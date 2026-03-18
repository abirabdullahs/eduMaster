'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Loader2,
  X,
  Send,
  HelpCircle,
  Menu
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Exam, Question, OptionChoice } from '@/lib/types';
import Markdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import ExamTimer from './ExamTimer';
import ResultCard from './ResultCard';

interface ExamPlayerProps {
  exam: Exam;
  isPractice?: boolean;
  practiceDuration?: number;
  onComplete: () => void;
}

export default function ExamPlayer({ exam, isPractice, practiceDuration, onComplete }: ExamPlayerProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, OptionChoice>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const supabase = createClient();

  const shuffleArray = <T,>(arr: T[]): T[] => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const shuffleOptions = (q: Question): Question => {
    const keys: (keyof Question)[] = ['option_a', 'option_b', 'option_c', 'option_d'];
    const labels: OptionChoice[] = ['a', 'b', 'c', 'd'];
    const entries = keys
      .map((k, i) => ({ key: k, val: (q as any)[k], label: labels[i] }))
      .filter(e => e.val != null && e.val !== '');
    const shuffled = shuffleArray(entries);
    const newQ = { ...q };
    const oldCorrectVal = (q as any)['option_' + q.correct_option];
    shuffled.forEach((e, i) => {
      (newQ as any)[keys[i]] = e.val;
      if (e.val === oldCorrectVal) {
        (newQ as any).correct_option = labels[i];
      }
    });
    return newQ;
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: questionData } = await supabase
        .from('exam_questions')
        .select('*')
        .eq('exam_id', exam.id)
        .order('order_index', { ascending: true });

      if (!questionData || questionData.length === 0) throw new Error('No questions found');

      const shuffledOrder = shuffleArray(questionData.map(q => q.id));
      const ordered = shuffledOrder
        .map(id => questionData.find(q => q.id === id))
        .filter(Boolean) as Question[];
      const withShuffledOptions = ordered.map(q => shuffleOptions(q));

      setQuestions(withShuffledOptions);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [supabase, exam.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOptionSelect = (option: OptionChoice) => {
    const questionId = questions[currentIndex].id;
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setShowConfirm(false);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const response = await fetch('/api/exam/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exam_id: exam.id,
          set_id: null,
          answers: Object.entries(answers).map(([question_id, selected_option]) => ({
            question_id,
            selected_option
          })),
          is_practice: isPractice,
          time_taken: 0, // Could track this with a ref
        })
      });

      const resultData = await response.json();
      if (resultData.error) throw new Error(resultData.error);
      setResult(resultData.data);
    } catch (err: any) {
      alert(err.message || 'Failed to submit exam');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#0a0e17] flex flex-col items-center justify-center gap-4 z-[100]">
        <Loader2 className="animate-spin text-indigo-500" size={48} />
        <p className="text-slate-400 font-medium tracking-wide">Loading questions...</p>
      </div>
    );
  }

  if (result) {
    return <ResultCard result={result} exam={exam} onRetry={onComplete} isPractice={isPractice} />;
  }

  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const isAnswered = currentQuestion.id in answers;

  return (
    <div className="fixed inset-0 bg-[#0a0e17] flex flex-col z-[100] font-bengali overflow-hidden">
      {/* Top Bar */}
      <header className="h-16 bg-[#161b22] border-b border-slate-800 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-all"
          >
            <Menu size={20} />
          </button>
          <h2 className="text-lg font-bold text-white truncate max-w-[200px] md:max-w-md">
            {exam.title}
          </h2>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2 text-slate-400 text-sm font-medium">
            <CheckCircle2 size={16} className="text-emerald-500" />
            <span>{answeredCount} / {questions.length} Answered</span>
          </div>
          <ExamTimer 
            durationMinutes={practiceDuration || exam.duration_minutes} 
            onTimeUp={handleSubmit} 
          />
          <button 
            onClick={() => setShowConfirm(true)}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2"
          >
            <Send size={16} />
            Submit
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Question Navigator */}
        <aside className={cn(
          "w-72 bg-[#161b22] border-r border-slate-800 flex flex-col transition-all duration-300",
          !isSidebarOpen && "-ml-72"
        )}>
          <div className="p-6 border-b border-slate-800">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Question Navigator</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-5 gap-3">
              {questions.map((q, i) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(i)}
                  className={cn(
                    "w-10 h-10 rounded-xl text-xs font-bold transition-all flex items-center justify-center",
                    currentIndex === i 
                      ? "bg-indigo-600 text-white ring-2 ring-indigo-500 ring-offset-2 ring-offset-[#161b22]" 
                      : q.id in answers 
                        ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30" 
                        : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                  )}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
          <div className="p-6 border-t border-slate-800 space-y-4">
            <div className="flex items-center gap-3 text-xs">
              <div className="w-3 h-3 rounded bg-indigo-600" />
              <span className="text-slate-400">Current</span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/30" />
              <span className="text-slate-400">Answered</span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="w-3 h-3 rounded bg-slate-800" />
              <span className="text-slate-400">Not Answered</span>
            </div>
          </div>
        </aside>

        {/* Main Content - Current Question */}
        <main className="flex-1 overflow-y-auto bg-[#0d1117] p-6 md:p-12">
          <div className="max-w-3xl mx-auto space-y-12">
            {/* Question Card */}
            <div className="space-y-8">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shrink-0 shadow-lg shadow-indigo-500/20">
                  {currentIndex + 1}
                </div>
                <div className="flex-1 space-y-6">
                  <div className="prose prose-invert prose-lg max-w-none font-medium text-white">
                    <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex({ strict: 'ignore', throwOnError: false })]}>
                      {currentQuestion.question_text}
                    </Markdown>
                  </div>
                  {currentQuestion.question_image_url && (
                    <div className="relative aspect-video max-w-2xl rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
                      <img 
                        src={currentQuestion.question_image_url} 
                        alt="Question" 
                        className="object-cover w-full h-full"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(['a', 'b', 'c', 'd'] as const).map((opt) => {
                  const optionText = currentQuestion[`option_${opt}` as keyof Question] as string;
                  const optionImage = currentQuestion[`option_${opt}_image` as keyof Question] as string;
                  const isSelected = answers[currentQuestion.id] === opt;

                  return (
                    <button
                      key={opt}
                      onClick={() => handleOptionSelect(opt)}
                      className={cn(
                        "p-6 rounded-3xl border text-left transition-all flex flex-col gap-4 group relative",
                        isSelected 
                          ? "bg-indigo-600 border-indigo-500 shadow-xl shadow-indigo-500/20" 
                          : "bg-[#161b22] border-slate-800 hover:border-slate-700 hover:bg-[#1c2128]"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <span className={cn(
                          "w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold uppercase transition-all",
                          isSelected ? "bg-white text-indigo-600" : "bg-slate-800 text-slate-400 group-hover:bg-slate-700"
                        )}>
                          {opt}
                        </span>
                        <span className={cn(
                          "font-medium transition-all",
                          isSelected ? "text-white" : "text-slate-300 group-hover:text-white"
                        )}>
                          {optionText}
                        </span>
                      </div>
                      {optionImage && (
                        <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-white/5">
                          <img src={optionImage} alt={`Option ${opt}`} className="object-cover w-full h-full" />
                        </div>
                      )}
                      {isSelected && (
                        <div className="absolute top-4 right-4 text-white">
                          <CheckCircle2 size={20} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-12 border-t border-slate-800">
              <button
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={20} />
                Previous
              </button>
              <div className="text-slate-500 text-sm font-bold uppercase tracking-widest">
                Question {currentIndex + 1} of {questions.length}
              </div>
              <button
                onClick={() => {
                  if (currentIndex === questions.length - 1) {
                    setShowConfirm(true);
                  } else {
                    setCurrentIndex(prev => prev + 1);
                  }
                }}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-500/20"
              >
                {currentIndex === questions.length - 1 ? 'Finish' : 'Next'}
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 z-[200] animate-in fade-in duration-300">
          <div className="bg-[#161b22] border border-slate-800 rounded-3xl p-8 max-w-md w-full space-y-6 shadow-2xl">
            <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 mx-auto">
              <HelpCircle size={32} />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold text-white">Submit Exam?</h3>
              <p className="text-slate-400">
                You have answered {answeredCount} out of {questions.length} questions. 
                Are you sure you want to finish?
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                Yes, Submit Now
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="w-full py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-all"
              >
                Wait, Go Back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
