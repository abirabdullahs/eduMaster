'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Loader2, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import type { FreeContentType } from '@/lib/types';

const baseSchema = z.object({ title: z.string().min(1, 'Title required') });

interface FreeContentFormsProps {
  topicId: string;
  contentType: FreeContentType;
  initialData?: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function FreeContentForms({ topicId, contentType, initialData, onClose, onSuccess }: FreeContentFormsProps) {
  const [isFreePreview, setIsFreePreview] = useState(initialData?.is_free_preview ?? false);
  const supabase = createClient();

  const getDefaultData = () => {
    switch (contentType) {
      case 'markdown': return { body: initialData?.content_data?.body ?? '' };
      case 'video': return { url: initialData?.content_data?.url ?? '', caption: initialData?.content_data?.caption ?? '' };
      case 'key_points': return { title: '', points: initialData?.content_data?.points ?? [''] };
      case 'mcq': return {
        question: initialData?.content_data?.question ?? '',
        options: initialData?.content_data?.options ?? [
          { id: 'a', text: '' }, { id: 'b', text: '' }, { id: 'c', text: '' }, { id: 'd', text: '' }
        ],
        correct_option: (initialData?.content_data?.correct_option ?? 'a') as 'a'|'b'|'c'|'d',
      };
      default: return {};
    }
  };

  const [formData, setFormData] = useState<any>(getDefaultData());
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        topic_id: topicId,
        title,
        content_type: contentType,
        content_data: formData,
        is_free_preview: isFreePreview,
        order_index: 0,
      };
      if (initialData?.id) {
        await supabase.from('free_contents').update(payload).eq('id', initialData.id);
      } else {
        const { data: contents } = await supabase.from('free_contents').select('id').eq('topic_id', topicId);
        payload.order_index = (contents?.length ?? 0);
        await supabase.from('free_contents').insert(payload);
      }
      onSuccess();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const renderForm = () => {
    switch (contentType) {
      case 'markdown':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Content (Markdown)</label>
              <textarea
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                rows={10}
                className="w-full bg-[#0d1117] border border-slate-800 rounded-xl p-4 text-white font-mono text-sm"
                placeholder="# Heading..."
              />
              <div className="mt-2 p-4 bg-[#0d1117] rounded-xl prose prose-invert prose-sm max-w-none">
                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex({ strict: 'ignore', throwOnError: false })]}>
                  {formData.body || '_Preview_'}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        );
      case 'video':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">YouTube URL</label>
              <input
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full bg-[#0d1117] border border-slate-800 rounded-xl py-3 px-4 text-white"
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Caption</label>
              <input
                value={formData.caption}
                onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                className="w-full bg-[#0d1117] border border-slate-800 rounded-xl py-3 px-4 text-white"
                placeholder="Optional caption"
              />
            </div>
          </div>
        );
      case 'key_points':
        return (
          <div className="space-y-4">
            {formData.points?.map((point: string, i: number) => (
              <div key={i} className="flex gap-2">
                <input
                  value={point}
                  onChange={(e) => {
                    const pts = [...formData.points];
                    pts[i] = e.target.value;
                    setFormData({ ...formData, points: pts });
                  }}
                  className="flex-1 bg-[#0d1117] border border-slate-800 rounded-xl py-3 px-4 text-white"
                  placeholder={`Point ${i + 1}`}
                />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, points: formData.points.filter((_: any, j: number) => j !== i) })}
                  className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setFormData({ ...formData, points: [...(formData.points || []), ''] })}
              className="text-indigo-400 text-sm font-bold"
            >
              + Add Point
            </button>
          </div>
        );
      case 'mcq':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Question</label>
              <textarea
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                rows={3}
                className="w-full bg-[#0d1117] border border-slate-800 rounded-xl py-3 px-4 text-white"
              />
            </div>
            {['a','b','c','d'].map(opt => {
              const opts = formData.options || [];
              const curr = opts.find((o: any) => o.id === opt) || { id: opt, text: '' };
              return (
                <div key={opt}>
                  <label className="block text-xs text-slate-500 mb-1">Option {opt.toUpperCase()}</label>
                  <input
                    value={curr.text}
                    onChange={(e) => {
                      const existing = opts.find((o: any) => o.id === opt);
                      const next = existing
                        ? opts.map((o: any) => o.id === opt ? { ...o, text: e.target.value } : o)
                        : [...opts, { id: opt, text: e.target.value }];
                      setFormData({ ...formData, options: next.length ? next : [{ id: 'a', text: '' }, { id: 'b', text: '' }, { id: 'c', text: '' }, { id: 'd', text: '' }] });
                    }}
                    className="w-full bg-[#0d1117] border border-slate-800 rounded-xl py-2 px-4 text-white"
                  />
                </div>
              );
            })}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Correct Option</label>
              <select
                value={formData.correct_option}
                onChange={(e) => setFormData({ ...formData, correct_option: e.target.value })}
                className="w-full bg-[#0d1117] border border-slate-800 rounded-xl py-3 px-4 text-white"
              >
                {['a','b','c','d'].map(o => <option key={o} value={o}>{o.toUpperCase()}</option>)}
              </select>
            </div>
          </div>
        );
      default:
        return (
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
            Form for &quot;{contentType}&quot; coming soon. Use markdown or other types for now.
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 p-4 overflow-y-auto">
      <div className="bg-[#161b22] border border-slate-800 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">{initialData ? 'Edit' : 'Add'} {contentType.replace('_', ' ')}</h3>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white rounded-xl">×</button>
        </div>
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#0d1117] border border-slate-800 rounded-xl py-3 px-4 text-white"
              placeholder="Content title"
            />
          </div>
          {renderForm()}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="free-preview"
              checked={isFreePreview}
              onChange={(e) => setIsFreePreview(e.target.checked)}
              className="rounded border-slate-700"
            />
            <label htmlFor="free-preview" className="text-sm text-slate-400">Free preview (guests can view)</label>
          </div>
          <button
            onClick={handleSubmit}
            disabled={submitting || !title}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Save</>}
          </button>
        </div>
      </div>
    </div>
  );
}
