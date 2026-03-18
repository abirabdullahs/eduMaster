'use client';

import { useState, useEffect } from 'react';
import { 
  Trophy, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Clock, 
  ArrowRight, 
  RotateCcw,
  BarChart3,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Exam, Question } from '@/lib/types';
import Markdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import confetti from 'canvas-confetti';

interface ResultCardProps {
  result: any;
  exam: Exam;
  onRetry: () => void;
  isPractice?: boolean;
}

export default function ResultCard({ result, exam, onRetry, isPractice }: ResultCardProps) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  
  useEffect(() => {
    if (result.score > 0 && !isPractice) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#a855f7', '#10b981']
      });
    }
  }, [result.score, isPractice]);

  const unansweredCount = result.total_questions - result.correct_count - result.wrong_count;
  const accuracy = Math.round((result.correct_count / result.total_questions) * 100);

  return (
    <div className="fixed inset-0 bg-[#0a0e17] flex flex-col z-[100] font-bengali overflow-y-auto p-6 md:p-12">
      <div className="max-w-4xl mx-auto w-full space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-24 h-24 bg-indigo-500/10 rounded-3xl flex items-center justify-center text-indigo-500 mx-auto shadow-2xl shadow-indigo-500/10">
            <Trophy size={48} />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-white tracking-tight">Exam Completed!</h1>
            <p className="text-slate-400 text-lg">
              {isPractice ? 'Practice session finished.' : 'Your results have been recorded.'}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-[#161b22] border border-slate-800 rounded-3xl p-6 text-center space-y-2 shadow-xl">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Your Score</p>
            <p className="text-4xl font-bold text-indigo-400">{result.score.toFixed(2)}</p>
            <p className="text-[10px] text-slate-600">Out of {result.total_questions}</p>
          </div>
          <div className="bg-[#161b22] border border-slate-800 rounded-3xl p-6 text-center space-y-2 shadow-xl">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Accuracy</p>
            <p className="text-4xl font-bold text-emerald-400">{accuracy}%</p>
            <p className="text-[10px] text-slate-600">Correct answers</p>
          </div>
          <div className="bg-[#161b22] border border-slate-800 rounded-3xl p-6 text-center space-y-2 shadow-xl">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Correct</p>
            <p className="text-4xl font-bold text-emerald-500">{result.correct_count}</p>
            <p className="text-[10px] text-slate-600">Total correct</p>
          </div>
          <div className="bg-[#161b22] border border-slate-800 rounded-3xl p-6 text-center space-y-2 shadow-xl">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Wrong</p>
            <p className="text-4xl font-bold text-red-500">{result.wrong_count}</p>
            <p className="text-[10px] text-slate-600">Total incorrect</p>
          </div>
        </div>

        {/* Detailed Breakdown Toggle */}
        <div className="bg-[#161b22] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <button 
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-all"
          >
            <div className="flex items-center gap-3">
              <BarChart3 className="text-indigo-500" size={24} />
              <h3 className="text-xl font-bold text-white">View Answer Breakdown</h3>
            </div>
            {showBreakdown ? <ChevronUp size={24} className="text-slate-400" /> : <ChevronDown size={24} className="text-slate-400" />}
          </button>

          {showBreakdown && (
            <div className="p-6 border-t border-slate-800 space-y-8 animate-in slide-in-from-top-4 duration-500">
              {result.breakdown?.map((item: any, index: number) => (
                <div key={index} className="space-y-4 p-6 bg-[#0d1117] rounded-2xl border border-slate-800">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center font-bold shrink-0",
                      item.is_correct ? "bg-emerald-500/10 text-emerald-500" : item.selected_option ? "bg-red-500/10 text-red-500" : "bg-slate-800 text-slate-400"
                    )}>
                      {index + 1}
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="prose prose-invert prose-sm max-w-none">
                        <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex({ strict: 'ignore' })]}>
                          {item.question_text || 'Question content loading...'}
                        </Markdown>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className={cn(
                          "p-3 rounded-xl border text-sm flex items-center justify-between",
                          item.is_correct ? "bg-emerald-500/5 border-emerald-500/30 text-emerald-200" : "bg-red-500/5 border-red-500/30 text-red-200"
                        )}>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase text-slate-500">Your Answer:</span>
                            <span className="font-bold uppercase">{item.selected_option || 'None'}</span>
                          </div>
                          {item.is_correct ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                        </div>
                        
                        {!item.is_correct && (
                          <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-emerald-200 text-sm flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold uppercase text-slate-500">Correct Answer:</span>
                              <span className="font-bold uppercase">{item.correct_option || 'A'}</span>
                            </div>
                            <CheckCircle2 size={16} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
          <button 
            onClick={onRetry}
            className="w-full md:w-auto px-10 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw size={20} />
            {isPractice ? 'Try Again' : 'Return to Exam Page'}
          </button>
          <button 
            onClick={() => window.location.href = '/'}
            className="w-full md:w-auto px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-xl shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
          >
            Go to Home
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
