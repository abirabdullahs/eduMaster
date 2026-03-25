'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, Sparkles } from 'lucide-react';
import SafeMarkdown from '@/components/shared/SafeMarkdown';
import type { CourseCurriculumTopic } from '@/lib/types';
import { cn } from '@/lib/utils';

/** Visual themes — assignment per topic is seeded (course + index + title) so it looks random but stays stable. */
const THEMES = [
  {
    bar: 'from-violet-500 to-fuchsia-600',
    ring: 'ring-violet-500/30',
    bg: 'bg-violet-500/5',
    icon: 'text-violet-400',
    hover: 'hover:border-violet-500/40',
  },
  {
    bar: 'from-emerald-500 to-teal-600',
    ring: 'ring-emerald-500/30',
    bg: 'bg-emerald-500/5',
    icon: 'text-emerald-400',
    hover: 'hover:border-emerald-500/40',
  },
  {
    bar: 'from-amber-500 to-orange-600',
    ring: 'ring-amber-500/30',
    bg: 'bg-amber-500/5',
    icon: 'text-amber-400',
    hover: 'hover:border-amber-500/40',
  },
  {
    bar: 'from-rose-500 to-pink-600',
    ring: 'ring-rose-500/30',
    bg: 'bg-rose-500/5',
    icon: 'text-rose-400',
    hover: 'hover:border-rose-500/40',
  },
  {
    bar: 'from-cyan-500 to-blue-600',
    ring: 'ring-cyan-500/30',
    bg: 'bg-cyan-500/5',
    icon: 'text-cyan-400',
    hover: 'hover:border-cyan-500/40',
  },
  {
    bar: 'from-indigo-500 to-purple-600',
    ring: 'ring-indigo-500/30',
    bg: 'bg-indigo-500/5',
    icon: 'text-indigo-400',
    hover: 'hover:border-indigo-500/40',
  },
  {
    bar: 'from-lime-500 to-green-600',
    ring: 'ring-lime-500/25',
    bg: 'bg-lime-500/5',
    icon: 'text-lime-400',
    hover: 'hover:border-lime-500/35',
  },
  {
    bar: 'from-sky-500 to-indigo-600',
    ring: 'ring-sky-500/30',
    bg: 'bg-sky-500/5',
    icon: 'text-sky-400',
    hover: 'hover:border-sky-500/40',
  },
  {
    bar: 'from-red-500 to-rose-600',
    ring: 'ring-red-500/25',
    bg: 'bg-red-500/5',
    icon: 'text-red-400',
    hover: 'hover:border-red-500/35',
  },
  {
    bar: 'from-fuchsia-500 to-purple-700',
    ring: 'ring-fuchsia-500/30',
    bg: 'bg-fuchsia-500/5',
    icon: 'text-fuchsia-400',
    hover: 'hover:border-fuchsia-500/40',
  },
];

function stableHash(input: string): number {
  let h = 5381;
  for (let i = 0; i < input.length; i++) {
    h = (h * 33) ^ input.charCodeAt(i);
  }
  return Math.abs(h) >>> 0;
}

function themeIndexForTopic(seed: string, index: number, title: string): number {
  const mix = stableHash(`${seed}|${index}|${title}`);
  const salt = stableHash(`${title}|${seed}`) % 7;
  return (mix + salt + index * 13) % THEMES.length;
}

export default function CurriculumTopicsAccordion({
  topics,
  dark = true,
  themeSeed = '',
}: {
  topics: CourseCurriculumTopic[];
  dark?: boolean;
  /** e.g. course id — makes theme order unique per course, stable across renders */
  themeSeed?: string;
}) {
  const [open, setOpen] = useState<number | null>(0);

  const themeIndices = useMemo(() => {
    const seed = themeSeed || 'default';
    return topics.map((t, i) => themeIndexForTopic(seed, i, t.title || ''));
  }, [topics, themeSeed]);

  if (!topics.length) return null;

  const proseDark =
    'prose prose-invert prose-sm max-w-none prose-p:text-slate-300 prose-headings:text-white prose-strong:text-white prose-a:text-indigo-400 prose-li:text-slate-300';
  const proseLight =
    'prose prose-slate prose-sm max-w-none prose-p:text-slate-700 prose-headings:text-slate-900 prose-strong:text-slate-900 prose-a:text-primary';

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3">
        <Sparkles className={dark ? 'text-indigo-400' : 'text-primary'} size={28} />
        <h2 className={cn('text-3xl font-bold', dark ? 'text-white' : 'text-slate-900')}>
          Curriculum highlights
        </h2>
      </div>
      <p className={cn('text-sm', dark ? 'text-slate-500' : 'text-slate-600')}>
        প্রতিটি টপিকে ক্লিক করলে বিস্তারিত দেখতে পারবেন।
      </p>
      <div className="space-y-3">
        {topics.map((t, i) => {
          const theme = THEMES[themeIndices[i] ?? 0];
          const title = t.title?.trim() || `Topic ${i + 1}`;
          const isOpen = open === i;
          const hasBody = !!(t.body_md?.trim());

          return (
            <div
              key={i}
              className={cn(
                'rounded-2xl border overflow-hidden transition-all ring-1',
                dark
                  ? cn('bg-[#121820] border-slate-800', theme.ring, theme.hover)
                  : cn('bg-white border-slate-200 shadow-sm', 'ring-slate-200/80', theme.hover)
              )}
            >
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                className={cn(
                  'w-full flex items-center gap-4 text-left p-4 md:p-5 transition-colors',
                  dark ? 'hover:bg-white/[0.03]' : 'hover:bg-slate-50',
                  theme.bg
                )}
              >
                <div
                  className={cn(
                    'w-1.5 self-stretch min-h-[3rem] rounded-full bg-gradient-to-b shrink-0',
                    theme.bar
                  )}
                />
                <div className="flex-1 min-w-0">
                  <span
                    className={cn(
                      'text-[10px] font-bold uppercase tracking-widest mb-1 block',
                      theme.icon
                    )}
                  >
                    Module {i + 1}
                  </span>
                  <h3 className={cn('text-lg md:text-xl font-bold', dark ? 'text-white' : 'text-slate-900')}>
                    {title}
                  </h3>
                </div>
                <div className={cn('shrink-0 p-2 rounded-xl', dark ? 'bg-slate-800/80' : 'bg-slate-100')}>
                  {isOpen ? (
                    <ChevronDown className={theme.icon} size={22} />
                  ) : (
                    <ChevronRight className={theme.icon} size={22} />
                  )}
                </div>
              </button>
              {isOpen && hasBody && (
                <div
                  className={cn(
                    'px-4 md:px-5 pb-5 pt-0 border-t',
                    dark ? 'border-slate-800/80' : 'border-slate-100'
                  )}
                >
                  <div className={cn('pt-4 pl-2 md:pl-4', dark ? proseDark : proseLight)}>
                    <SafeMarkdown>{t.body_md || ''}</SafeMarkdown>
                  </div>
                </div>
              )}
              {isOpen && !hasBody && (
                <p className={cn('px-5 pb-4 text-sm italic', dark ? 'text-slate-600' : 'text-slate-500')}>
                  No extra details for this topic.
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
