'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import DashboardShell from '@/components/layout/DashboardShell';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn } from '@/lib/utils';

const LANGUAGES = [
  { value: 'bangla', label: 'বাংলা (Bangla)' },
  { value: 'hindi', label: 'हिन्दी (Hindi)' },
  { value: 'siliguri', label: 'Siliguri' },
] as const;

const schema = z.object({
  name: z.string().min(1, 'Name required'),
  description: z.string().optional(),
  thumbnail_url: z.string().url().optional().or(z.literal('')),
  language: z.enum(['bangla', 'hindi', 'siliguri']).optional(),
});

type FormData = z.infer<typeof schema>;

export default function NewFreeSubjectPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const classParam = searchParams.get('class') || 'SSC';
  const [classId, setClassId] = useState<string | null>(null);
  const supabase = createClient();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '', thumbnail_url: '', language: 'bangla' },
  });

  useEffect(() => {
    supabase
      .from('free_classes')
      .select('id')
      .eq('name', classParam)
      .single()
      .then(({ data }) => setClassId(data?.id ?? null));
  }, [classParam, supabase]);

  const onSubmit = async (data: FormData) => {
    if (!classId) return;
    const { data: subj, error } = await supabase
      .from('free_subjects')
      .insert({
        class_id: classId,
        name: data.name,
        description: data.description || null,
        thumbnail_url: data.thumbnail_url || null,
        language: data.language ?? 'bangla',
        order_index: 999,
      })
      .select('id')
      .single();
    if (error) {
      alert(error.message);
      return;
    }
    const { logAdminActivity } = await import('@/lib/admin-activity');
    logAdminActivity({ activity_type: 'free_subject_created', title: `Added free subject: ${data.name}`, entity_type: 'free_content', entity_id: subj.id, href: `/admin/free-content/${subj.id}` });
    router.push(`/admin/free-content/${subj.id}`);
  };

  return (
    <DashboardShell>
      <div className="max-w-2xl">
        <Link
          href="/admin/free-content"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6"
        >
          <ArrowLeft size={18} /> Back
        </Link>
        <h1 className="text-2xl font-bold text-white mb-6">Add {classParam} Subject</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-[#161b22] border border-slate-800 rounded-2xl p-8">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Name</label>
            <input
              {...register('name')}
              className={cn(
                "w-full bg-[#0d1117] border rounded-xl py-3 px-4 text-white",
                errors.name ? "border-red-500" : "border-slate-800"
              )}
              placeholder="e.g. Physics, Chemistry"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">ভাষা / Language</label>
            <select
              {...register('language')}
              className="w-full bg-[#0d1117] border border-slate-800 rounded-xl py-3 px-4 text-white"
            >
              {LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Description</label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full bg-[#0d1117] border border-slate-800 rounded-xl py-3 px-4 text-white"
              placeholder="Brief description"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Thumbnail URL</label>
            <input
              {...register('thumbnail_url')}
              className="w-full bg-[#0d1117] border border-slate-800 rounded-xl py-3 px-4 text-white"
              placeholder="https://..."
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting || !classId}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Create Subject'}
          </button>
        </form>
      </div>
    </DashboardShell>
  );
}
