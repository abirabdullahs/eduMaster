'use client';

import { Plus, Trash2, BookOpen, HelpCircle, FileText } from 'lucide-react';
import type { CourseCurriculumTopic, CourseFaqItem } from '@/lib/types';
import { cn } from '@/lib/utils';

export interface CourseMarketingValues {
  details_markdown: string;
  curriculum_topics: CourseCurriculumTopic[];
  faq_json: CourseFaqItem[];
}

interface Props {
  value: CourseMarketingValues;
  onChange: (v: CourseMarketingValues) => void;
  className?: string;
}

export default function CourseMarketingFields({ value, onChange, className }: Props) {
  const set = (patch: Partial<CourseMarketingValues>) => onChange({ ...value, ...patch });

  const addTopic = () =>
    set({ curriculum_topics: [...value.curriculum_topics, { title: '', body_md: '' }] });
  const updateTopic = (i: number, patch: Partial<CourseCurriculumTopic>) => {
    const next = [...value.curriculum_topics];
    next[i] = { ...next[i], ...patch };
    set({ curriculum_topics: next });
  };
  const removeTopic = (i: number) =>
    set({ curriculum_topics: value.curriculum_topics.filter((_, j) => j !== i) });

  const addFaq = () => set({ faq_json: [...value.faq_json, { question: '', answer: '' }] });
  const updateFaq = (i: number, patch: Partial<CourseFaqItem>) => {
    const next = [...value.faq_json];
    next[i] = { ...next[i], ...patch };
    set({ faq_json: next });
  };
  const removeFaq = (i: number) => set({ faq_json: value.faq_json.filter((_, j) => j !== i) });

  return (
    <div className={cn('space-y-8', className)}>
      <div className="bg-[#161b22] border border-slate-800 rounded-3xl p-8 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <FileText size={20} className="text-cyan-500" />
          Course details (Markdown)
        </h3>
        <p className="text-xs text-slate-500">
          Long-form description for the course landing page. Supports Markdown.
        </p>
        <textarea
          value={value.details_markdown}
          onChange={(e) => set({ details_markdown: e.target.value })}
          rows={10}
          placeholder="## What you will learn&#10;&#10;- Point one&#10;- Point two"
          className="w-full bg-[#0d1117] border border-slate-800 rounded-2xl py-3 px-4 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-y min-h-[200px]"
        />
      </div>

      <div className="bg-[#161b22] border border-slate-800 rounded-3xl p-8 space-y-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen size={20} className="text-emerald-500" />
            Curriculum outline (topics)
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Marketing curriculum topics — title + Markdown body (e.g. module summaries).
          </p>
        </div>
        <div className="space-y-4">
          {value.curriculum_topics.length === 0 ? (
            <p className="text-sm text-slate-600 italic">No topics yet — use &quot;Add topic&quot; below.</p>
          ) : (
            value.curriculum_topics.map((t, i) => (
              <div key={i} className="p-4 rounded-2xl border border-slate-800 bg-[#0d1117] space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <input
                    value={t.title}
                    onChange={(e) => updateTopic(i, { title: e.target.value })}
                    placeholder="Topic title"
                    className="flex-1 bg-[#161b22] border border-slate-800 rounded-xl py-2 px-3 text-sm text-white"
                  />
                  <button
                    type="button"
                    onClick={() => removeTopic(i)}
                    className="p-2 text-slate-500 hover:text-red-400 rounded-lg"
                    title="Remove"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <textarea
                  value={t.body_md}
                  onChange={(e) => updateTopic(i, { body_md: e.target.value })}
                  rows={5}
                  placeholder="Markdown content for this topic..."
                  className="w-full bg-[#161b22] border border-slate-800 rounded-xl py-2 px-3 text-sm text-white font-mono resize-y"
                />
              </div>
            ))
          )}
        </div>
        <button
          type="button"
          onClick={addTopic}
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-3 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 rounded-xl text-xs font-bold border border-emerald-500/20"
        >
          <Plus size={16} /> Add topic
        </button>
      </div>

      <div className="bg-[#161b22] border border-slate-800 rounded-3xl p-8 space-y-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <HelpCircle size={20} className="text-amber-500" />
            FAQ
          </h3>
          <p className="text-xs text-slate-500 mt-1">Questions and answers (Markdown in answers).</p>
        </div>
        <div className="space-y-4">
          {value.faq_json.length === 0 ? (
            <p className="text-sm text-slate-600 italic">No FAQ items yet — use &quot;Add FAQ&quot; below.</p>
          ) : (
            value.faq_json.map((f, i) => (
              <div key={i} className="p-4 rounded-2xl border border-slate-800 bg-[#0d1117] space-y-3">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeFaq(i)}
                    className="p-2 text-slate-500 hover:text-red-400 rounded-lg"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <input
                  value={f.question}
                  onChange={(e) => updateFaq(i, { question: e.target.value })}
                  placeholder="Question"
                  className="w-full bg-[#161b22] border border-slate-800 rounded-xl py-2 px-3 text-sm text-white"
                />
                <textarea
                  value={f.answer}
                  onChange={(e) => updateFaq(i, { answer: e.target.value })}
                  rows={3}
                  placeholder="Answer (Markdown supported)"
                  className="w-full bg-[#161b22] border border-slate-800 rounded-xl py-2 px-3 text-sm text-white font-mono resize-y"
                />
              </div>
            ))
          )}
        </div>
        <button
          type="button"
          onClick={addFaq}
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-3 bg-amber-600/20 text-amber-400 hover:bg-amber-600/30 rounded-xl text-xs font-bold border border-amber-500/20"
        >
          <Plus size={16} /> Add FAQ
        </button>
      </div>
    </div>
  );
}

export function parseCourseMarketingFromDb(row: any): CourseMarketingValues {
  const topics = row?.curriculum_topics;
  const faq = row?.faq_json;
  return {
    details_markdown: row?.details_markdown || '',
    curriculum_topics: Array.isArray(topics)
      ? topics.map((t: any) => ({
          title: String(t?.title ?? ''),
          body_md: String(t?.body_md ?? t?.body ?? ''),
        }))
      : [],
    faq_json: Array.isArray(faq)
      ? faq.map((x: any) => ({
          question: String(x?.question ?? x?.q ?? ''),
          answer: String(x?.answer ?? x?.a ?? ''),
        }))
      : [],
  };
}
