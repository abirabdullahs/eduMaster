'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  ArrowLeft, 
  Save, 
  Clock, 
  Target, 
  Calendar, 
  Layers, 
  Link as LinkIcon,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';

const examSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  exam_type: z.enum(['course', 'public']),
  duration_minutes: z.number().min(1, 'Duration must be at least 1 minute'),
  negative_marking: z.boolean(),
  negative_value: z.number().min(0),
  start_time: z.string().min(1, 'Start time is required'),
  end_time: z.string().min(1, 'End time is required'),
  status: z.enum(['draft', 'published']),
});

type ExamFormValues = z.infer<typeof examSchema>;

export default function NewExamPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accessLink, setAccessLink] = useState('');
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;
  const role = params.role as string;
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ExamFormValues>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      title: '',
      exam_type: 'course',
      duration_minutes: 30,
      negative_marking: false,
      negative_value: 0.25,
      start_time: '',
      end_time: '',
      status: 'draft',
    }
  });

  const isNegativeMarking = watch('negative_marking');

  useEffect(() => {
    setAccessLink(uuidv4());
  }, []);

  const onSubmit = async (values: ExamFormValues) => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error: insertError } = await supabase
        .from('exams')
        .insert({
          ...values,
          course_id: courseId,
          created_by: user.id,
          access_link: accessLink,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // If sets > 1, we might want to trigger set generation, 
      // but usually sets are generated after questions are added.
      // For now, just redirect to questions page.
      router.push(`/${role}/courses/${courseId}/exams/${data.id}/questions`);
    } catch (err: any) {
      setError(err.message || 'Failed to create exam');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-all"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Create New Exam</h1>
            <p className="text-slate-400 mt-1">Configure your exam settings and schedule.</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3">
          <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 pb-20">
        {/* Basic Config */}
        <div className="bg-[#161b22] border border-slate-800 rounded-3xl p-8 space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Target size={20} className="text-indigo-500" />
            Exam Configuration
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Exam Title</label>
              <input 
                {...register('title')}
                type="text" 
                placeholder="e.g. Physics Final Exam - Term 1"
                className={cn(
                  "w-full bg-[#0d1117] border border-slate-800 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all",
                  errors.title && "border-red-500 focus:ring-red-500"
                )}
              />
              {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Exam Type</label>
              <select 
                {...register('exam_type')}
                className="w-full bg-[#0d1117] border border-slate-800 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              >
                <option value="course">Course Exam (Enrolled Only)</option>
                <option value="public">Public Exam (All Users)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Duration (Minutes)</label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  {...register('duration_minutes', { valueAsNumber: true })}
                  type="number" 
                  className="w-full bg-[#0d1117] border border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
              {errors.duration_minutes && <p className="mt-1 text-xs text-red-500">{errors.duration_minutes.message}</p>}
            </div>
          </div>
        </div>

        {/* Scheduling */}
        <div className="bg-[#161b22] border border-slate-800 rounded-3xl p-8 space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Calendar size={20} className="text-emerald-500" />
            Schedule Window
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Start Date & Time</label>
              <input 
                {...register('start_time')}
                type="datetime-local" 
                className="w-full bg-[#0d1117] border border-slate-800 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
              {errors.start_time && <p className="mt-1 text-xs text-red-500">{errors.start_time.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">End Date & Time</label>
              <input 
                {...register('end_time')}
                type="datetime-local" 
                className="w-full bg-[#0d1117] border border-slate-800 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
              {errors.end_time && <p className="mt-1 text-xs text-red-500">{errors.end_time.message}</p>}
            </div>
          </div>
          <p className="text-xs text-slate-500 italic">
            * After the end time, the exam will automatically transition to Practice Mode.
          </p>
        </div>

        {/* Advanced Rules */}
        <div className="bg-[#161b22] border border-slate-800 rounded-3xl p-8 space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers size={20} className="text-purple-500" />
            Advanced Rules
          </h3>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-[#0d1117] rounded-2xl border border-slate-800">
              <div className="space-y-1">
                <p className="text-sm font-bold text-white">Negative Marking</p>
                <p className="text-xs text-slate-500">Deduct marks for incorrect answers.</p>
              </div>
              <button 
                type="button"
                onClick={() => setValue('negative_marking', !isNegativeMarking)}
                className="text-indigo-500"
              >
                {isNegativeMarking ? <ToggleRight size={32} /> : <ToggleLeft size={32} className="text-slate-600" />}
              </button>
            </div>

            {isNegativeMarking && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Negative Value (per wrong answer)</label>
                <input 
                  {...register('negative_value', { valueAsNumber: true })}
                  type="number" 
                  step="0.01"
                  className="w-full max-w-[200px] bg-[#0d1117] border border-slate-800 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            )}

            <div className="p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl">
              <p className="text-sm font-bold text-indigo-300">Auto Shuffle</p>
              <p className="mt-1 text-xs text-slate-400">
                Questions and options will be shuffled automatically for each student when they start the exam.
              </p>
            </div>
          </div>
        </div>

        {/* Access Link */}
        <div className="bg-[#161b22] border border-slate-800 rounded-3xl p-8 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <LinkIcon size={20} className="text-blue-500" />
            Access Link
          </h3>
          <div className="flex items-center gap-3 p-4 bg-[#0d1117] rounded-2xl border border-slate-800">
            <code className="text-sm text-indigo-400 font-mono flex-1 break-all">
              {window.location.origin}/exam/{accessLink}
            </code>
            <button 
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/exam/${accessLink}`);
                // Could add a toast here
              }}
              className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-all"
            >
              <Save size={18} />
            </button>
          </div>
          <p className="text-xs text-slate-500">
            This link will be active once the exam is published.
          </p>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-4">
          <button 
            type="button"
            onClick={() => setValue('status', 'draft')}
            className={cn(
              "px-8 py-4 rounded-2xl font-bold transition-all",
              watch('status') === 'draft' ? "bg-white text-black" : "bg-white/5 text-white hover:bg-white/10"
            )}
          >
            Save as Draft
          </button>
          <button 
            type="submit"
            onClick={() => setValue('status', 'published')}
            disabled={loading}
            className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
            Publish & Add Questions
          </button>
        </div>
      </form>
    </div>
  );
}
