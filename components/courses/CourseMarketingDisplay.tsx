'use client';

import SafeMarkdown from '@/components/shared/SafeMarkdown';
import type { CourseCurriculumTopic, CourseFaqItem } from '@/lib/types';
import CurriculumTopicsAccordion from '@/components/courses/CurriculumTopicsAccordion';
import CourseFaqAccordion from '@/components/courses/CourseFaqAccordion';
import { cn } from '@/lib/utils';

export default function CourseMarketingDisplay({
  details_markdown,
  curriculum_topics,
  faq_json,
  dark = false,
  themeSeed,
}: {
  details_markdown?: string | null;
  curriculum_topics?: CourseCurriculumTopic[] | null;
  faq_json?: CourseFaqItem[] | null;
  /** When true, use dashboard-style dark surfaces (public course page). */
  dark?: boolean;
  /** Stable id (e.g. course id) so topic colors vary per course but stay consistent. */
  themeSeed?: string;
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

      {topics.length > 0 && (
        <CurriculumTopicsAccordion topics={topics} dark={dark} themeSeed={themeSeed} />
      )}

      {faqs.length > 0 && <CourseFaqAccordion items={faqs} dark={dark} />}
    </div>
  );
}
