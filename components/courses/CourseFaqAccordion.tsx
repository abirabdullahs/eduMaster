'use client';

import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import SafeMarkdown from '@/components/shared/SafeMarkdown';
import type { CourseFaqItem } from '@/lib/types';
import { cn } from '@/lib/utils';

export default function CourseFaqAccordion({
  items,
  dark = true,
}: {
  items: CourseFaqItem[];
  dark?: boolean;
}) {
  const [open, setOpen] = useState<Set<number>>(new Set());

  const toggle = (i: number) => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  if (!items.length) return null;

  return (
    <section
      className={cn(
        'rounded-[2.5rem] p-10 border space-y-4',
        dark
          ? 'bg-gradient-to-br from-slate-900 via-[#151d2e] to-slate-900 border-slate-700/80 text-white'
          : 'bg-slate-900 text-white border-transparent'
      )}
    >
      <div className="flex items-center gap-3 mb-2">
        <HelpCircle className="text-amber-400 shrink-0" size={28} />
        <h2 className="text-3xl font-bold">Frequently asked questions</h2>
      </div>
      <p className={cn('text-sm mb-6', dark ? 'text-slate-500' : 'text-slate-400')}>
        প্রশ্নের ওপর ক্লিক করলে উত্তর খুলবে বা বন্ধ হবে।
      </p>
      <div className="space-y-2">
        {items.map((f, i) => {
          const q = f.question?.trim() || `Question ${i + 1}`;
          const isOpen = open.has(i);
          return (
            <div
              key={i}
              className={cn(
                'rounded-2xl border overflow-hidden transition-colors',
                dark ? 'border-slate-700/80 bg-slate-950/40' : 'border-white/10 bg-white/5'
              )}
            >
              <button
                type="button"
                onClick={() => toggle(i)}
                className={cn(
                  'w-full flex items-center gap-4 text-left p-4 md:p-5 transition-colors',
                  dark ? 'hover:bg-white/[0.04]' : 'hover:bg-white/10'
                )}
              >
                <span className="flex-1 font-bold text-base md:text-lg pr-2 text-white">{q}</span>
                <div
                  className={cn(
                    'shrink-0 p-2 rounded-xl transition-transform duration-200',
                    isOpen && 'rotate-180',
                    dark ? 'bg-slate-800/90 text-amber-400' : 'bg-white/10 text-amber-300'
                  )}
                >
                  <ChevronDown size={22} />
                </div>
              </button>
              {isOpen && (
                <div
                  className={cn(
                    'px-4 md:px-5 pb-5 pt-0 border-t',
                    dark ? 'border-slate-800' : 'border-white/10'
                  )}
                >
                  <div className="pt-4 prose prose-invert prose-sm max-w-none prose-p:text-slate-300 prose-strong:text-white prose-a:text-indigo-400 prose-li:text-slate-300">
                    <SafeMarkdown>{f.answer || ''}</SafeMarkdown>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
