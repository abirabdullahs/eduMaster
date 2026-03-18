'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  X, 
  Plus, 
  Trash2, 
  Edit3, 
  GripVertical, 
  Save, 
  Loader2, 
  CheckCircle2, 
  Image as ImageIcon,
  Eye,
  Type,
  HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

interface LectureQuestionsProps {
  lecture: any;
  onClose: () => void;
}

export default function LectureQuestions({ lecture, onClose }: LectureQuestionsProps) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const supabase = createClient();

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('lecture_id', lecture.id)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setQuestions(data || []);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }, [lecture.id, supabase]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    try {
      const { error } = await supabase.from('questions').delete().eq('id', id);
      if (error) throw error;
      fetchQuestions();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = questions.findIndex(q => q.id === active.id);
    const newIndex = questions.findIndex(q => q.id === over.id);
    const newQuestions = arrayMove(questions, oldIndex, newIndex);
    
    setQuestions(newQuestions);

    // Update order_index in Supabase
    const updates = newQuestions.map((q, index) => ({
      id: q.id,
      order_index: index
    }));

    try {
      const { error } = await supabase.from('questions').upsert(updates);
      if (error) throw error;
    } catch (err: any) {
      alert('Failed to update order: ' + err.message);
      fetchQuestions(); // Revert on error
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-5xl h-[90vh] bg-[#161b22] border border-slate-800 rounded-3xl flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-[#1c2128]">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
              <HelpCircle size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Lecture MCQs</h3>
              <p className="text-xs text-slate-500 mt-1">{lecture.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20"
            >
              <Plus size={18} />
              Add Question
            </button>
            <button onClick={onClose} className="text-slate-500 hover:text-white p-2 hover:bg-white/5 rounded-xl transition-all">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <Loader2 className="animate-spin text-indigo-500" size={40} />
              <p className="text-slate-500 font-medium">Loading questions...</p>
            </div>
          ) : questions.length === 0 && !isAdding ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-40">
              <HelpCircle size={64} />
              <p className="text-lg font-bold">No questions added yet.</p>
              <button 
                onClick={() => setIsAdding(true)}
                className="text-indigo-400 font-bold hover:underline"
              >
                Create your first MCQ
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <DndContext 
                sensors={sensors} 
                collisionDetection={closestCenter} 
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={questions.map(q => q.id)} strategy={verticalListSortingStrategy}>
                  {questions.map((question) => (
                    <SortableQuestionItem 
                      key={question.id} 
                      question={question} 
                      onEdit={() => setEditingQuestion(question)}
                      onDelete={() => handleDelete(question.id)}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </div>
          )}
        </div>

        {/* Question Form Modal */}
        {(isAdding || editingQuestion) && (
          <QuestionForm 
            lectureId={lecture.id}
            initialData={editingQuestion}
            onClose={() => {
              setIsAdding(false);
              setEditingQuestion(null);
            }}
            onSuccess={() => {
              setIsAdding(false);
              setEditingQuestion(null);
              fetchQuestions();
            }}
          />
        )}
      </div>
    </div>
  );
}

function SortableQuestionItem({ question, onEdit, onDelete }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="bg-[#0d1117] border border-slate-800 rounded-2xl overflow-hidden group">
      <div className="p-4 flex items-start gap-4">
        <div {...attributes} {...listeners} className="p-2 text-slate-600 hover:text-slate-400 cursor-grab active:cursor-grabbing rounded-lg hover:bg-white/5 transition-colors mt-1">
          <GripVertical size={16} />
        </div>
        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="text-sm text-white font-medium leading-relaxed">
                <LatexRenderer text={question.question_text} />
              </div>
              {question.image_url && (
                <img src={question.image_url} alt="Question" className="max-h-40 rounded-lg border border-slate-800" />
              )}
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={onEdit} className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                <Edit3 size={16} />
              </button>
              <button onClick={onDelete} className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/5 rounded-lg transition-all">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {['a', 'b', 'c', 'd'].map((opt) => (
              <div key={opt} className={cn(
                "p-3 rounded-xl border text-xs flex items-center gap-3",
                question.correct_answer === opt 
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                  : "bg-white/5 border-white/5 text-slate-400"
              )}>
                <span className="w-6 h-6 rounded-lg bg-black/20 flex items-center justify-center font-bold uppercase">{opt}</span>
                <div className="flex-1">
                  <LatexRenderer text={question[`option_${opt}`]} />
                  {question[`option_${opt}_image`] && (
                    <img src={question[`option_${opt}_image`]} alt={`Option ${opt}`} className="mt-2 max-h-20 rounded-md" />
                  )}
                </div>
                {question.correct_answer === opt && <CheckCircle2 size={14} />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function QuestionForm({ lectureId, initialData, onClose, onSuccess }: any) {
  const [formData, setFormData] = useState({
    question_text: initialData?.question_text || '',
    image_url: initialData?.image_url || '',
    option_a: initialData?.option_a || '',
    option_a_image: initialData?.option_a_image || '',
    option_b: initialData?.option_b || '',
    option_b_image: initialData?.option_b_image || '',
    option_c: initialData?.option_c || '',
    option_c_image: initialData?.option_c_image || '',
    option_d: initialData?.option_d || '',
    option_d_image: initialData?.option_d_image || '',
    correct_answer: initialData?.correct_answer || 'a',
    explanation: initialData?.explanation || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (initialData) {
        const { error } = await supabase
          .from('questions')
          .update(formData)
          .eq('id', initialData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('questions')
          .insert({ ...formData, lecture_id: lectureId });
        if (error) throw error;
      }
      onSuccess();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="w-full max-w-4xl max-h-[90vh] bg-[#161b22] border border-slate-800 rounded-3xl flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-[#1c2128]">
          <h3 className="text-xl font-bold text-white">{initialData ? 'Edit Question' : 'Add New Question'}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white p-2 hover:bg-white/5 rounded-xl transition-all">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column: Question & Explanation */}
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Type size={14} /> Question Text (Supports $LaTeX$)
                </label>
                <textarea 
                  value={formData.question_text}
                  onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
                  required
                  rows={4}
                  className="w-full bg-[#0d1117] border border-slate-800 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                  placeholder="Enter question text. Use $...$ for inline math and $$...$$ for block math."
                />
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-[10px] text-slate-500 uppercase font-bold mb-2 flex items-center gap-2">
                    <Eye size={12} /> Live Preview
                  </p>
                  <div className="text-sm text-slate-300 min-h-[20px]">
                    <LatexRenderer text={formData.question_text || 'Preview will appear here...'} />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <ImageIcon size={14} /> Question Image URL (Optional)
                </label>
                <input 
                  type="text"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full bg-[#0d1117] border border-slate-800 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Explanation (Optional)</label>
                <textarea 
                  value={formData.explanation}
                  onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                  rows={3}
                  className="w-full bg-[#0d1117] border border-slate-800 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                  placeholder="Explain the correct answer..."
                />
              </div>
            </div>

            {/* Right Column: Options */}
            <div className="space-y-6">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Options & Correct Answer</label>
              <div className="space-y-4">
                {['a', 'b', 'c', 'd'].map((opt) => (
                  <div key={opt} className={cn(
                    "p-4 rounded-2xl border transition-all",
                    formData.correct_answer === opt 
                      ? "bg-indigo-500/10 border-indigo-500/30" 
                      : "bg-[#0d1117] border-slate-800"
                  )}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-sm font-bold uppercase text-white">{opt}</span>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="radio" 
                            name="correct_answer" 
                            checked={formData.correct_answer === opt}
                            onChange={() => setFormData({ ...formData, correct_answer: opt })}
                            className="w-4 h-4 text-indigo-600 bg-slate-800 border-slate-700 focus:ring-indigo-500"
                          />
                          <span className="text-xs font-bold text-slate-400">Correct Answer</span>
                        </label>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <input 
                        type="text"
                        value={formData[`option_${opt}` as keyof typeof formData]}
                        onChange={(e) => setFormData({ ...formData, [`option_${opt}`]: e.target.value })}
                        required
                        className="w-full bg-black/20 border border-white/5 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                        placeholder={`Option ${opt.toUpperCase()} text...`}
                      />
                      <input 
                        type="text"
                        value={formData[`option_${opt}_image` as keyof typeof formData]}
                        onChange={(e) => setFormData({ ...formData, [`option_${opt}_image`]: e.target.value })}
                        className="w-full bg-black/20 border border-white/5 rounded-xl py-2 px-3 text-xs text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                        placeholder="Image URL (optional)"
                      />
                      <div className="text-[10px] text-slate-500 italic">
                        <LatexRenderer text={formData[`option_${opt}` as keyof typeof formData] || '...'} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              {initialData ? 'Update Question' : 'Save Question'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function LatexRenderer({ text }: { text: string }) {
  if (!text) return null;

  // Split text by $...$ and $$...$$
  const parts = text.split(/(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/g);

  return (
    <span>
      {parts.map((part, i) => {
        if (part.startsWith('$$') && part.endsWith('$$')) {
          return <BlockMath key={i}>{part.slice(2, -2)}</BlockMath>;
        } else if (part.startsWith('$') && part.endsWith('$')) {
          return <InlineMath key={i}>{part.slice(1, -1)}</InlineMath>;
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}
