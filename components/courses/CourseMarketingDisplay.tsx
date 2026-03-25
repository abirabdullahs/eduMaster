'use client';

import SafeMarkdown from '@/components/shared/SafeMarkdown';
import type { CourseCurriculumTopic, CourseFaqItem } from '@/lib/types';

const prose =
  'prose prose-slate prose-lg max-w-none prose-headings:text-slate-900 prose-p:text-slate-700 prose-strong:text-slate-900 prose-a:text-primary prose-li:text-slate-700';

export default function CourseMarketingDisplay({
  details_markdown,
  curriculum_topics,
  faq_json,
}: {
  details_markdown?: string | null;
  curriculum_topics?: CourseCurriculumTopic[] | null;
  faq_json?: CourseFaqItem[] | null;
}) {
  const topics = Array.isArray(curriculum_topics) ? curriculum_topics : [];
  const faqs = Array.isArray(faq_json) ? faq_json : [];

  return (
    <div className="space-y-16">
      {details_markdown?.trim() && (
        <section className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">About this course</h2>
          <div className={prose}>
            <SafeMarkdown>{details_markdown}</SafeMarkdown>
          </div>
        </section>
      )}

      {topics.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-slate-900">Curriculum highlights</h2>
          <div className="space-y-4">
            {topics.map((t, i) => (
              <div
                key={i}
                className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-4"
              >
                {t.title?.trim() && (
                  <h3 className="text-xl font-bold text-slate-900">{t.title}</h3>
                )}
                {t.body_md?.trim() && (
                  <div className={`${prose} prose-sm`}>
                    <SafeMarkdown>{t.body_md}</SafeMarkdown>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {faqs.length > 0 && (
        <section className="bg-slate-900 text-white rounded-[2.5rem] p-10 space-y-6">
          <h2 className="text-3xl font-bold">Frequently asked questions</h2>
          <div className="space-y-6">
            {faqs.map((f, i) => (
              <div key={i} className="border-b border-white/10 pb-6 last:border-0 last:pb-0">
                <h3 className="font-bold text-lg text-white mb-2">{f.question}</h3>
                <div className="prose prose-invert prose-sm max-w-none prose-p:text-slate-300 prose-strong:text-white prose-a:text-primary">
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
