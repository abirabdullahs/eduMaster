'use client';

import SafeMarkdown from '@/components/shared/SafeMarkdown';

interface MarkdownContentRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownContentRenderer({ content, className = '' }: MarkdownContentRendererProps) {
  if (!content || typeof content !== 'string') return null;
  const trimmed = content.trim();
  if (!trimmed) return null;

  return (
    <div
      className={`prose prose-sm sm:prose-base prose-invert prose-indigo max-w-none prose-p:text-slate-300 prose-headings:text-white prose-strong:text-white prose-a:text-indigo-400 prose-li:text-slate-300 prose-code:text-indigo-400 prose-pre:bg-slate-900 ${className}`}
    >
      <SafeMarkdown>{trimmed}</SafeMarkdown>
    </div>
  );
}
