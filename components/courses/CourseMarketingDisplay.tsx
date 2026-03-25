'use client';

import SafeMarkdown from '@/components/shared/SafeMarkdown';
import type { CourseCurriculumTopic, CourseFaqItem } from '@/lib/types';
import CurriculumTopicsAccordion from '@/components/courses/CurriculumTopicsAccordion';
import { cn } from '@/lib/utils';

export default function CourseMarketingDisplay({
  details_markdown,
  curriculum_topics,
  faq_json,
  dark = false,
}: {
  details_markdown?: string | null;
  curriculum_topics?: CourseCurriculumTopic[] | null;
  faq_json?: CourseFaqItem[] | null;
  /** When true, use dashboard-style dark surfaces (public course page). */
  dark?: boolean;
}) {
  const topics = Array.isArray(curriculum_topics) ? curriculum_topics : [];
  const faqs = Array.isArray(faq_json) ? faq_json : [];

  const proseLight =
    'prose prose-slate prose-lg max-w-none prose-headings:text-slate-900 prose-p:text-slate-700 prose-strong:text-slate-900 prose-a:text-primary prose-li:text-slate-700';
  const proseDark =
    'prose prose-invert prose-lg max-w-none prose-headings:text-white prose-p:text-slate-300 prose-strong:text-white prose-a:text-indigo-400 prose-li:text-slate-300';

  return (
    <div className="space-y-16">
      {details_markdown?.trim() && (
        <section
          className={cn(
            'rounded-[2.5rem] p-10 border',
            dark
              ? 'bg-[#121820] border-slate-800 shadow-xl shadow-black/20'
              : 'bg-white border-slate-100 shadow-sm'
          )}
        >
          <h2 className={cn('text-3xl font-bold mb-6', dark ? 'text-white' : 'text-slate-900')}>
            About this course
          </h2>
          <div className={dark ? proseDark : proseLight}>
            <SafeMarkdown>{details_markdown}</SafeMarkdown>
          </div>
        </section>
      )}

      {topics.length > 0 && <CurriculumTopicsAccordion topics={topics} dark={dark} />}

      {faqs.length > 0 && (
        <section
          className={cn(
            'rounded-[2.5rem] p-10 space-y-6 border',
            dark
              ? 'bg-gradient-to-br from-slate-900 via-[#151d2e] to-slate-900 border-slate-700/80 text-white'
              : 'bg-slate-900 text-white border-transparent'
          )}
        >
          <h2 className="text-3xl font-bold">Frequently asked questions</h2>
          <div className="space-y-6">
            {faqs.map((f, i) => (
              <div
                key={i}
                className={cn(
                  'pb-6 last:border-0 last:pb-0',
                  dark ? 'border-b border-white/10' : 'border-b border-white/10'
                )}
              >
                <h3 className="font-bold text-lg text-white mb-2">{f.question}</h3>
                <div className="prose prose-invert prose-sm max-w-none prose-p:text-slate-300 prose-strong:text-white prose-a:text-indigo-400">
                  <SafeMarkdown>{f.answer || ''}</SafeMarkdown>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
