'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  Loader2,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Eye,
  ChevronRight,
  GripVertical
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Question, Exam } from '@/lib/types';
import QuestionForm from '@/components/exams/QuestionForm';
import SafeMarkdown from '@/components/shared/SafeMarkdown';

export default function ExamQuestionsPage() {
  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;
  const examId = params.examId as string;
  const role = params.role as string;
  const supabase = createClient();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [examRes, questionsRes] = await Promise.all([
        supabase.from('exams').select('*').eq('id', examId).single(),
        supabase.from('exam_questions').select('*').eq('exam_id', examId).order('order_index', { ascending: true })
      ]);

      if (examRes.error) throw examRes.error;
      if (questionsRes.error) throw questionsRes.error;

      setExam(examRes.data);
      setQuestions(questionsRes.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [supabase, examId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateQuestion = async (values: any) => {
    try {
      const { error } = await supabase
        .from('exam_questions')
        .insert({
          ...values,
          exam_id: examId,
          order_index: questions.length,
        });

      if (error) throw error;
      setIsAdding(false);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to create question');
    }
  };

  const handleUpdateQuestion = async (values: any) => {
    if (!editingQuestion) return;
    try {
      const { error } = await supabase
        .from('exam_questions')
        .update(values)
        .eq('id', editingQuestion.id);

      if (error) throw error;
      setEditingQuestion(null);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to update question');
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    try {
      const { error } = await supabase
        .from('exam_questions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete question');
    }
  };

  const filteredQuestions = questions.filter(q => 
    q.question_text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-all"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              {exam?.title || 'Exam Questions'}
            </h1>
            <p className="text-slate-400 mt-1">Manage and organize questions for this exam.</p>
          </div>
        </div>
        {!isAdding && !editingQuestion && (
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-500/20"
          >
            <Plus size={20} />
            Add Question
          </button>
        )}
      </div>

      {/* Forms */}
      {isAdding && (
        <QuestionForm 
          onSubmit={handleCreateQuestion}
          onCancel={() => setIsAdding(false)}
        />
      )}

      {editingQuestion && (
        <QuestionForm 
          initialData={editingQuestion}
          onSubmit={handleUpdateQuestion}
          onCancel={() => setEditingQuestion(null)}
        />
      )}

      {/* List */}
      {!isAdding && !editingQuestion && (
        <div className="space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Search questions..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#161b22] border border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="animate-spin text-indigo-500" size={40} />
              <p className="text-slate-400 font-medium tracking-wide">Fetching questions...</p>
            </div>
          ) : error ? (
            <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-3xl flex flex-col items-center text-center gap-4">
              <AlertCircle className="text-red-500" size={48} />
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">Error Loading Data</h3>
                <p className="text-sm text-red-200">{error}</p>
              </div>
              <button onClick={fetchData} className="px-6 py-2 bg-red-500 text-white font-bold rounded-xl">Retry</button>
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="py-20 text-center bg-[#161b22] border border-dashed border-slate-800 rounded-3xl space-y-4">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-500">
                <HelpCircle size={32} />
              </div>
              <p className="text-slate-500 font-medium">No questions found. Start by adding one!</p>
              <button 
                onClick={() => setIsAdding(true)}
                className="px-6 py-2 bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600/20 font-bold rounded-xl transition-all"
              >
                Add First Question
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQuestions.map((question, index) => (
                <div key={question.id} className="bg-[#161b22] border border-slate-800 rounded-3xl p-6 group hover:border-indigo-500/50 transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 font-bold shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="prose prose-invert prose-sm max-w-none">
                          <SafeMarkdown>{String(question.question_text ?? '')}</SafeMarkdown>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          <button 
                            onClick={() => setEditingQuestion(question)}
                            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-all"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteQuestion(question.id)}
                            className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {question.question_image_url && (
                        <div className="relative aspect-video max-w-md rounded-xl overflow-hidden border border-slate-800">
                          <img 
                            src={question.question_image_url} 
                            alt="Question" 
                            className="object-cover w-full h-full"
                          />
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(['a', 'b', 'c', 'd'] as const).map((opt) => (
                          <div key={opt} className={cn(
                            "p-3 rounded-xl border text-sm flex items-center justify-between gap-3",
                            question.correct_option === opt 
                              ? "bg-emerald-500/5 border-emerald-500/30 text-emerald-200" 
                              : "bg-[#0d1117] border-slate-800 text-slate-400"
                          )}>
                            <div className="flex items-center gap-3">
                              <span className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-[10px] font-bold uppercase">
                                {opt}
                              </span>
                              <span>{question[`option_${opt}` as keyof Question] as string}</span>
                            </div>
                            {question.correct_option === opt && <CheckCircle2 size={14} className="text-emerald-500" />}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Footer Actions */}
      {!isAdding && !editingQuestion && questions.length > 0 && (
        <div className="flex items-center justify-end gap-4 pt-8 border-t border-slate-800">
          <button 
            onClick={() => router.push(`/${role}/courses/${courseId}`)}
            className="px-8 py-3 bg-white/5 text-white font-bold rounded-2xl hover:bg-white/10 transition-all"
          >
            Finish & Return
          </button>
          <button 
            onClick={() => router.push(`/${role}/courses/${courseId}/exams/${examId}/results`)}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2"
          >
            View Results Dashboard
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
