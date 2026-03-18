'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Save, 
  X, 
  Image as ImageIcon, 
  CheckCircle2, 
  Loader2,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Question, OptionChoice } from '@/lib/types';

const questionSchema = z.object({
  question_text: z.string().min(1, 'Question text is required'),
  question_image_url: z.string().url('Invalid image URL').optional().or(z.literal('')),
  option_a: z.string().min(1, 'Option A is required'),
  option_b: z.string().min(1, 'Option B is required'),
  option_c: z.string().min(1, 'Option C is required'),
  option_d: z.string().min(1, 'Option D is required'),
  option_a_image: z.string().url('Invalid image URL').optional().or(z.literal('')),
  option_b_image: z.string().url('Invalid image URL').optional().or(z.literal('')),
  option_c_image: z.string().url('Invalid image URL').optional().or(z.literal('')),
  option_d_image: z.string().url('Invalid image URL').optional().or(z.literal('')),
  correct_option: z.enum(['a', 'b', 'c', 'd']),
  order_index: z.number().default(0),
});

type QuestionFormValues = z.infer<typeof questionSchema>;

interface QuestionFormProps {
  initialData?: Partial<Question>;
  onSubmit: (values: QuestionFormValues) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function QuestionForm({ initialData, onSubmit, onCancel, loading }: QuestionFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      question_text: initialData?.question_text || '',
      question_image_url: initialData?.question_image_url || '',
      option_a: initialData?.option_a || '',
      option_b: initialData?.option_b || '',
      option_c: initialData?.option_c || '',
      option_d: initialData?.option_d || '',
      option_a_image: initialData?.option_a_image || '',
      option_b_image: initialData?.option_b_image || '',
      option_c_image: initialData?.option_c_image || '',
      option_d_image: initialData?.option_d_image || '',
      correct_option: initialData?.correct_option || 'a',
      order_index: initialData?.order_index || 0,
    }
  });

  const correctOption = watch('correct_option');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-[#161b22] border border-slate-800 rounded-3xl p-8 space-y-8 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">
          {initialData?.id ? 'Edit Question' : 'Add New Question'}
        </h3>
        <button 
          type="button"
          onClick={onCancel}
          className="p-2 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition-all"
        >
          <X size={24} />
        </button>
      </div>

      <div className="space-y-6">
        {/* Question Text */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Question Text (Markdown & KaTeX supported)</label>
            <textarea 
              {...register('question_text')}
              rows={3}
              placeholder="e.g. What is the value of $\pi$?"
              className={cn(
                "w-full bg-[#0d1117] border border-slate-800 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all",
                errors.question_text && "border-red-500 focus:ring-red-500"
              )}
            />
            {errors.question_text && <p className="mt-1 text-xs text-red-500">{errors.question_text.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Question Image URL (Optional)</label>
            <div className="relative">
              <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                {...register('question_image_url')}
                type="text" 
                placeholder="https://example.com/image.jpg"
                className="w-full bg-[#0d1117] border border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="grid md:grid-cols-2 gap-6">
          {(['a', 'b', 'c', 'd'] as const).map((opt) => (
            <div key={opt} className={cn(
              "p-6 rounded-2xl border transition-all space-y-4",
              correctOption === opt ? "bg-indigo-500/5 border-indigo-500/50" : "bg-[#0d1117] border-slate-800"
            )}>
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Option {opt.toUpperCase()}</label>
                <button 
                  type="button"
                  onClick={() => setValue('correct_option', opt)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all",
                    correctOption === opt ? "bg-indigo-500 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
                  )}
                >
                  {correctOption === opt ? <CheckCircle2 size={12} /> : null}
                  {correctOption === opt ? 'Correct Answer' : 'Mark as Correct'}
                </button>
              </div>
              
              <input 
                {...register(`option_${opt}` as any)}
                type="text" 
                placeholder={`Option ${opt.toUpperCase()} text`}
                className="w-full bg-[#161b22] border border-slate-800 rounded-xl py-2 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
              
              <div className="relative">
                <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                <input 
                  {...register(`option_${opt}_image` as any)}
                  type="text" 
                  placeholder="Image URL (Optional)"
                  className="w-full bg-[#161b22] border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-[10px] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-800">
        <button 
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 text-sm font-bold text-slate-400 hover:text-white transition-all"
        >
          Cancel
        </button>
        <button 
          type="submit"
          disabled={loading}
          className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          {initialData?.id ? 'Update Question' : 'Save Question'}
        </button>
      </div>
    </form>
  );
}
