'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  ArrowLeft, 
  Save, 
  Image as ImageIcon, 
  Video, 
  GraduationCap, 
  Tag, 
  CheckCircle2, 
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn } from '@/lib/utils';
import { Profile } from '@/lib/types';

const courseSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  thumbnail_url: z.string().url('Invalid thumbnail URL'),
  intro_video_url: z.string(),
  main_price: z.number().min(0, 'Price must be positive'),
  discounted_price: z.number().min(0, 'Discounted price must be positive'),
  is_offline: z.boolean(),
  teacher_id: z.string().min(1, 'Please assign a teacher'),
  status: z.enum(['draft', 'published']),
});

type CourseFormValues = z.infer<typeof courseSchema>;

export default function NewCoursePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [teachers, setTeachers] = useState<Profile[]>([]);
  const router = useRouter();
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: '',
      description: '',
      thumbnail_url: '',
      intro_video_url: '',
      main_price: 0,
      discounted_price: 0,
      is_offline: false,
      teacher_id: '',
      status: 'draft',
    }
  });

  useEffect(() => {
    async function fetchTeachers() {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'teacher')
        .eq('status', 'active');
      setTeachers(data || []);
    }
    fetchTeachers();
  }, [supabase]);

  const onSubmit = async (values: CourseFormValues) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: insertError } = await supabase
        .from('courses')
        .insert({
          ...values,
          // Handle optional empty string for intro_video_url
          intro_video_url: values.intro_video_url || null,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      router.push(`/admin/courses/${data.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create course');
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
            <h1 className="text-3xl font-bold text-white tracking-tight">Create New Course</h1>
            <p className="text-slate-400 mt-1">Fill in the details to launch your new course.</p>
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
        {/* Basic Info */}
        <div className="bg-[#161b22] border border-slate-800 rounded-3xl p-8 space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Tag size={20} className="text-indigo-500" />
            Basic Information
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Course Title</label>
              <input 
                {...register('title')}
                type="text" 
                placeholder="e.g. Physics Masterclass for HSC 2026"
                className={cn(
                  "w-full bg-[#0d1117] border border-slate-800 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all",
                  errors.title && "border-red-500 focus:ring-red-500"
                )}
              />
              {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Description</label>
              <textarea 
                {...register('description')}
                rows={4}
                placeholder="Describe what students will learn in this course..."
                className={cn(
                  "w-full bg-[#0d1117] border border-slate-800 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all",
                  errors.description && "border-red-500 focus:ring-red-500"
                )}
              />
              {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
            </div>
          </div>
        </div>

        {/* Media */}
        <div className="bg-[#161b22] border border-slate-800 rounded-3xl p-8 space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <ImageIcon size={20} className="text-purple-500" />
            Media & Assets
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Thumbnail URL</label>
              <input 
                {...register('thumbnail_url')}
                type="text" 
                placeholder="https://example.com/image.jpg"
                className={cn(
                  "w-full bg-[#0d1117] border border-slate-800 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all",
                  errors.thumbnail_url && "border-red-500 focus:ring-red-500"
                )}
              />
              {errors.thumbnail_url && <p className="mt-1 text-xs text-red-500">{errors.thumbnail_url.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Intro Video URL (YouTube/Vimeo)</label>
              <input 
                {...register('intro_video_url')}
                type="text" 
                placeholder="https://youtube.com/watch?v=..."
                className={cn(
                  "w-full bg-[#0d1117] border border-slate-800 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all",
                  errors.intro_video_url && "border-red-500 focus:ring-red-500"
                )}
              />
              {errors.intro_video_url && <p className="mt-1 text-xs text-red-500">{errors.intro_video_url.message}</p>}
            </div>
          </div>
        </div>

        {/* Pricing & Teacher */}
        <div className="bg-[#161b22] border border-slate-800 rounded-3xl p-8 space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <GraduationCap size={20} className="text-emerald-500" />
            Pricing & Assignment
          </h3>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Main Price (৳)</label>
              <input 
                {...register('main_price', { valueAsNumber: true })}
                type="number" 
                placeholder="0"
                className={cn(
                  "w-full bg-[#0d1117] border border-slate-800 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all",
                  errors.main_price && "border-red-500 focus:ring-red-500"
                )}
              />
              {errors.main_price && <p className="mt-1 text-xs text-red-500">{errors.main_price.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Discounted Price (৳)</label>
              <input 
                {...register('discounted_price', { valueAsNumber: true })}
                type="number" 
                placeholder="0"
                className={cn(
                  "w-full bg-[#0d1117] border border-slate-800 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all",
                  errors.discounted_price && "border-red-500 focus:ring-red-500"
                )}
              />
              {errors.discounted_price && <p className="mt-1 text-xs text-red-500">{errors.discounted_price.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Assign Teacher</label>
              <select 
                {...register('teacher_id')}
                className={cn(
                  "w-full bg-[#0d1117] border border-slate-800 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all",
                  errors.teacher_id && "border-red-500 focus:ring-red-500"
                )}
              >
                <option value="">Select a teacher...</option>
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              {errors.teacher_id && <p className="mt-1 text-xs text-red-500">{errors.teacher_id.message}</p>}
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-[#0d1117] rounded-2xl border border-slate-800">
            <input 
              {...register('is_offline')}
              type="checkbox" 
              id="is_offline"
              className="w-5 h-5 rounded-lg bg-slate-800 border-slate-700 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="is_offline" className="text-sm font-medium text-white cursor-pointer select-none">
              This is an Offline Course (Monthly Payment Required)
            </label>
          </div>
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
            Publish Course
          </button>
        </div>
      </form>
    </div>
  );
}
