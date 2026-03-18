'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Loader2, Save, Plus, FileText, Video, BookOpen, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

// Markdown editor - use textarea + preview (avoids SSR/type issues with @uiw/react-md-editor)
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { rehypeFilterUndefined } from '@/lib/rehype-filter-undefined';
import 'katex/dist/katex.min.css';

const subjectSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
});

const chapterSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  suggestion_pdf_url: z.string().url('Invalid URL').optional().or(z.literal('')),
});

const lectureSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  topics: z.string().min(1, 'Topics are required'),
  video_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  content: z.string().optional(),
  tags: z.string().optional(),
});

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: any;
  title: string;
  type: 'subject' | 'chapter' | 'lecture';
}

export function SubjectForm({ isOpen, onClose, onSubmit, initialData }: Omit<FormModalProps, 'title' | 'type'>) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(subjectSchema),
    defaultValues: initialData || { title: '', description: '' }
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[#161b22] border border-slate-800 rounded-3xl p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400">
              <BookOpen size={24} />
            </div>
            <h3 className="text-xl font-bold text-white">{initialData ? 'Edit Subject' : 'Add New Subject'}</h3>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white p-2 hover:bg-white/5 rounded-xl transition-all">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Subject Title</label>
            <input 
              {...register('title')}
              className={cn(
                "w-full bg-[#0d1117] border border-slate-800 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all",
                errors.title && "border-red-500/50 ring-1 ring-red-500/20"
              )}
              placeholder="e.g. Physics"
            />
            {errors.title && <p className="text-[10px] text-red-500 font-bold">{errors.title.message as string}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Description (Optional)</label>
            <textarea 
              {...register('description')}
              rows={3}
              className="w-full bg-[#0d1117] border border-slate-800 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
              placeholder="Brief overview of the subject..."
            />
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            {initialData ? 'Update Subject' : 'Create Subject'}
          </button>
        </form>
      </div>
    </div>
  );
}

export function ChapterForm({ isOpen, onClose, onSubmit, initialData }: Omit<FormModalProps, 'title' | 'type'>) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(chapterSchema),
    defaultValues: initialData ? { title: initialData.title, description: initialData.description || '', suggestion_pdf_url: initialData.suggestion_pdf_url || '' } : { title: '', description: '', suggestion_pdf_url: '' }
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[#161b22] border border-slate-800 rounded-3xl p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400">
              <FolderOpen size={24} />
            </div>
            <h3 className="text-xl font-bold text-white">{initialData ? 'Edit Chapter' : 'Add New Chapter'}</h3>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white p-2 hover:bg-white/5 rounded-xl transition-all">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Chapter Title</label>
            <input 
              {...register('title')}
              className={cn(
                "w-full bg-[#0d1117] border border-slate-800 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all",
                errors.title && "border-red-500/50 ring-1 ring-red-500/20"
              )}
              placeholder="e.g. Vector"
            />
            {errors.title && <p className="text-[10px] text-red-500 font-bold">{errors.title.message as string}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Suggestion PDF URL (Optional)</label>
            <div className="relative">
              <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                {...register('suggestion_pdf_url')}
                className={cn(
                  "w-full bg-[#0d1117] border border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all",
                  errors.suggestion_pdf_url && "border-red-500/50 ring-1 ring-red-500/20"
                )}
                placeholder="https://..."
              />
            </div>
            {errors.suggestion_pdf_url && <p className="text-[10px] text-red-500 font-bold">{errors.suggestion_pdf_url.message as string}</p>}
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            {initialData ? 'Update Chapter' : 'Create Chapter'}
          </button>
        </form>
      </div>
    </div>
  );
}

export function LectureForm({ isOpen, onClose, onSubmit, initialData }: Omit<FormModalProps, 'title' | 'type'>) {
  const [content, setContent] = useState(initialData?.content ?? initialData?.content_markdown ?? '');
  const [tagsStr, setTagsStr] = useState(
    Array.isArray(initialData?.tags) ? initialData.tags.join(', ') : (initialData?.tags as string) || ''
  );

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(lectureSchema),
    defaultValues: initialData || { title: '', topics: '', video_url: '' }
  });

  const handleFormSubmit = (data: any) => {
    const tags = tagsStr.trim() ? tagsStr.split(',').map((t: string) => t.trim()).filter(Boolean) : [];
    onSubmit({ ...data, content, tags });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl bg-[#161b22] border border-slate-800 rounded-3xl p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
              <Video size={24} />
            </div>
            <h3 className="text-xl font-bold text-white">{initialData ? 'Edit Lecture' : 'Add New Lecture'}</h3>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white p-2 hover:bg-white/5 rounded-xl transition-all">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Lecture Title</label>
              <input 
                {...register('title')}
                className={cn(
                  "w-full bg-[#0d1117] border border-slate-800 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all",
                  errors.title && "border-red-500/50 ring-1 ring-red-500/20"
                )}
                placeholder="e.g. Vector Addition"
              />
              {errors.title && <p className="text-[10px] text-red-500 font-bold">{errors.title.message as string}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Topics (Comma separated)</label>
              <textarea 
                {...register('topics')}
                rows={3}
                className={cn(
                  "w-full bg-[#0d1117] border border-slate-800 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none",
                  errors.topics && "border-red-500/50 ring-1 ring-red-500/20"
                )}
                placeholder="Resultant, Triangle Law, Parallelogram Law..."
              />
              {errors.topics && <p className="text-[10px] text-red-500 font-bold">{errors.topics.message as string}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Video URL (YouTube)</label>
              <div className="relative">
                <Video className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  {...register('video_url')}
                  className={cn(
                    "w-full bg-[#0d1117] border border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all",
                    errors.video_url && "border-red-500/50 ring-1 ring-red-500/20"
                  )}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
              {errors.video_url && <p className="text-[10px] text-red-500 font-bold">{errors.video_url.message as string}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tags (comma separated)</label>
              <input 
                type="text"
                value={tagsStr}
                onChange={(e) => setTagsStr(e.target.value)}
                className="w-full bg-[#0d1117] border border-slate-800 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder="e.g. গতি, নিউটন, physics"
              />
            </div>
            {initialData?.mcq_count !== undefined && (
              <div className="text-xs text-slate-500">
                MCQs: {initialData.mcq_count} (auto-calculated from attached questions)
              </div>
            )}
            <div className="pt-4">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                {initialData ? 'Update Lecture' : 'Create Lecture'}
              </button>
            </div>
          </div>

          <div className="space-y-2 flex flex-col h-full">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Lecture Content (Markdown)</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-slate-500 mb-1">Edit</p>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full h-[320px] bg-[#0d1117] border border-slate-800 rounded-2xl p-4 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  placeholder="# Heading&#10;## Subheading&#10;Use **bold**, *italic*, $math$ for LaTeX"
                />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 mb-1">Preview</p>
                <div className="h-[320px] bg-[#0d1117] border border-slate-800 rounded-2xl p-4 overflow-y-auto prose prose-sm prose-invert prose-indigo max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeFilterUndefined(), rehypeKatex()]}>
                    {String(content ?? '_Preview will appear here_')}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
