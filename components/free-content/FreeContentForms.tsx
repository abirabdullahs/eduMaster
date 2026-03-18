'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Loader2, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import SafeMarkdown from '@/components/shared/SafeMarkdown';
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
        explanation: initialData?.content_data?.explanation ?? '',
      };
      case 'short_answer': return {
        question: initialData?.content_data?.question ?? '',
        correct_answer: initialData?.content_data?.correct_answer ?? '',
        case_sensitive: initialData?.content_data?.case_sensitive ?? false,
        explanation: initialData?.content_data?.explanation ?? '',
      };
      case 'true_false': return {
        statement: initialData?.content_data?.statement ?? '',
        correct_answer: initialData?.content_data?.correct_answer ?? false,
        explanation: initialData?.content_data?.explanation ?? '',
      };
      case 'fill_blank': return {
        sentence: initialData?.content_data?.sentence ?? '',
        correct_answer: initialData?.content_data?.correct_answer ?? '',
        hint: initialData?.content_data?.hint ?? '',
      };
      case 'flashcard': return {
        front: initialData?.content_data?.front ?? '',
        back: initialData?.content_data?.back ?? '',
      };
      case 'match_following': return {
        title: initialData?.content_data?.title ?? '',
        left: initialData?.content_data?.left ?? ['', ''],
        right: initialData?.content_data?.right ?? ['', ''],
        correct_pairs: initialData?.content_data?.correct_pairs ?? {},
      };
      case 'code_snippet': return {
        language: initialData?.content_data?.language ?? 'plaintext',
        code: initialData?.content_data?.code ?? '',
        explanation: initialData?.content_data?.explanation ?? '',
      };
      case 'mnemonic': return {
        topic: initialData?.content_data?.topic ?? '',
        mnemonic: initialData?.content_data?.mnemonic ?? '',
        breakdown: initialData?.content_data?.breakdown ?? '',
      };
      case 'latex_formula': return {
        formula: initialData?.content_data?.formula ?? '',
        explanation: initialData?.content_data?.explanation ?? '',
      };
      case 'image_diagram': return {
        image_url: initialData?.content_data?.image_url ?? '',
        caption: initialData?.content_data?.caption ?? '',
        description: initialData?.content_data?.description ?? '',
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
      let contentData = formData;
      if (contentType === 'match_following' && Array.isArray(formData.left) && Array.isArray(formData.right)) {
        const pairs: Record<string, string> = {};
        formData.left.forEach((l: string, i: number) => {
          if (formData.right[i]) pairs[l] = formData.right[i];
        });
        contentData = { ...formData, correct_pairs: pairs };
      }
      const payload = {
        topic_id: topicId,
        title,
        content_type: contentType,
        content_data: contentData,
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
                <SafeMarkdown>{String(formData.body ?? '_Preview_')}</SafeMarkdown>
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
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Explanation (optional)</label>
              <textarea
                value={formData.explanation}
                onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                rows={2}
                className="w-full bg-[#0d1117] border border-slate-800 rounded-xl py-3 px-4 text-white"
                placeholder="Shown after submit"
              />
            </div>
          </div>
        );
      case 'short_answer':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Question</label>
              <textarea value={formData.question} onChange={(e) => setFormData({ ...formData, question: e.target.value })} rows={2} className="w-full bg-[#0d1117] border border-slate-800 rounded-xl py-3 px-4 text-white" placeholder="Question text" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Correct Answer</label>
              <input value={formData.correct_answer} onChange={(e) => setFormData({ ...formData, correct_answer: e.target.value })} className="w-full bg-[#0d1117] border border-slate-800 rounded-xl py-3 px-4 text-white" placeholder="Exact answer" />
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-400">
              <input type="checkbox" checked={formData.case_sensitive} onChange={(e) => setFormData({ ...formData, case_sensitive: e.target.checked })} className="rounded" />
              Case sensitive
            </label>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Explanation (optional)</label>
              <textarea value={formData.explanation} onChange={(e) => setFormData({ ...formData, explanation: e.target.value })} rows={2} className="w-full bg-[#0d1117] border border-slate-800 rounded-xl py-3 px-4 text-white" />
            </div>
          </div>
        );
      case 'true_false':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Statement</label>
              <textarea value={formData.statement} onChange={(e) => setFormData({ ...formData, statement: e.target.value })} rows={3} className="w-full bg-[#0d1117] border border-slate-800 rounded-xl py-3 px-4 text-white" placeholder="True or false statement" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Correct Answer</label>
              <select value={String(formData.correct_answer)} onChange={(e) => setFormData({ ...formData, correct_answer: e.target.value === 'true' })} className="w-full bg-[#0d1117] border border-slate-800 rounded-xl py-3 px-4 text-white">
                <option value="true">True</option>
                <option value="false">False</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Explanation (optional)</label>
              <textarea value={formData.explanation} onChange={(e) => setFormData({ ...formData, explanation: e.target.value })} rows={2} className="w-full bg-[#0d1117] border border-slate-800 rounded-xl py-3 px-4 text-white" />
            </div>
          </div>
        );
      case 'fill_blank':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Sentence (use ___blank___ for the gap)</label>
              <input value={formData.sentence} onChange={(e) => setFormData({ ...formData, sentence: e.target.value })} className="w-full bg-[#0d1117] border border-slate-800 rounded-xl py-3 px-4 text-white" placeholder="The capital of France is ___blank___" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Correct Answer</label>
              <input value={formData.correct_answer} onChange={(e) => setFormData({ ...formData, correct_answer: e.target.value })} className="w-full bg-[#0d1117] border border-slate-800 rounded-xl py-3 px-4 text-white" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Hint (optional)</label>
              <input value={formData.hint} onChange={(e) => setFormData({ ...formData, hint: e.target.value })} className="w-full bg-[#0d1117] border border-slate-800 rounded-xl py-3 px-4 text-white" />
            </div>
          </div>
        );
      case 'flashcard':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Front (HTML)</label>
              <textarea value={formData.front} onChange={(e) => setFormData({ ...formData, front: e.target.value })} rows={4} className="w-full bg-[#0d1117] border border-slate-800 rounded-xl py-3 px-4 text-white font-mono text-sm" placeholder="<p>Question or term</p>" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Back (HTML)</label>
              <textarea value={formData.back} onChange={(e) => setFormData({ ...formData, back: e.target.value })} rows={4} className="w-full bg-[#0d1117] border border-slate-800 rounded-xl py-3 px-4 text-white font-mono text-sm" placeholder="<p>Answer or definition</p>" />
            </div>
          </div>
        );
      case 'match_following':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Left items (one per line)</label>
              <textarea value={(formData.left || []).join('\n')} onChange={(e) => setFormData({ ...formData, left: e.target.value.split('\n').filter(Boolean) })} rows={4} className="w-full bg-[#0d1117] border border-slate-800 rounded-xl py-3 px-4 text-white" placeholder="Item 1&#10;Item 2" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Right items (one per line, same order as correct pairs)</label>
              <textarea value={(formData.right || []).join('\n')} onChange={(e) => setFormData({ ...formData, right: e.target.value.split('\n').filter(Boolean) })} rows={4} className="w-full bg-[#0d1117] border border-slate-800 rounded-xl py-3 px-4 text-white" placeholder="Match 1&#10;Match 2" />
            </div>
            <p className="text-slate-500 text-sm">Order items so left[i] matches right[i]. Pairs are built by index.</p>
          </div>
        );
      case 'code_snippet':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Language</label>
              <input value={formData.language} onChange={(e) => setFormData({ ...formData, language: e.target.value })} className="w-full bg-[#0d1117] border border-slate-800 rounded-xl py-3 px-4 text-white" placeholder="javascript, python, etc" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Code</label>
              <textarea value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} rows={8} className="w-full bg-[#0d1117] border border-slate-800 rounded-xl py-3 px-4 text-white font-mono text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Explanation (optional)</label>
              <textarea value={formData.explanation} onChange={(e) => setFormData({ ...formData, explanation: e.target.value })} rows={2} className="w-full bg-[#0d1117] border border-slate-800 rounded-xl py-3 px-4 text-white" />
            </div>
          </div>
        );
      case 'mnemonic':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Topic</label>
              <input value={formData.topic} onChange={(e) => setFormData({ ...formData, topic: e.target.value })} className="w-full bg-[#0d1117] border border-slate-800 rounded-xl py-3 px-4 text-white" placeholder="Topic name" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Mnemonic</label>
              <input value={formData.mnemonic} onChange={(e) => setFormData({ ...formData, mnemonic: e.target.value })} className="w-full bg-[#0d1117] border border-slate-800 rounded-xl py-3 px-4 text-white" placeholder="e.g. My Very Elderly Mother..." />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Breakdown (Markdown)</label>
              <textarea value={formData.breakdown} onChange={(e) => setFormData({ ...formData, breakdown: e.target.value })} rows={4} className="w-full bg-[#0d1117] border border-slate-800 rounded-xl py-3 px-4 text-white" />
            </div>
          </div>
        );
      case 'latex_formula':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">LaTeX Formula</label>
              <input value={formData.formula} onChange={(e) => setFormData({ ...formData, formula: e.target.value })} className="w-full bg-[#0d1117] border border-slate-800 rounded-xl py-3 px-4 text-white font-mono" placeholder="E = mc^2" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Explanation (optional)</label>
              <textarea value={formData.explanation} onChange={(e) => setFormData({ ...formData, explanation: e.target.value })} rows={3} className="w-full bg-[#0d1117] border border-slate-800 rounded-xl py-3 px-4 text-white" />
            </div>
          </div>
        );
      case 'image_diagram':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Image URL</label>
              <input value={formData.image_url} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} className="w-full bg-[#0d1117] border border-slate-800 rounded-xl py-3 px-4 text-white" placeholder="https://..." />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Caption</label>
              <input value={formData.caption} onChange={(e) => setFormData({ ...formData, caption: e.target.value })} className="w-full bg-[#0d1117] border border-slate-800 rounded-xl py-3 px-4 text-white" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Description (optional, Markdown)</label>
              <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full bg-[#0d1117] border border-slate-800 rounded-xl py-3 px-4 text-white" />
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
