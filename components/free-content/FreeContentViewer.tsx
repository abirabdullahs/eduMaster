'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { cn } from '@/lib/utils';
import LatexRenderer from '@/components/shared/LatexRenderer';
import type { FreeContentType } from '@/lib/types';

interface FreeContentViewerProps {
  content: any;
  onMarkComplete?: () => void;
  onSubmitAnswer?: (answer: string) => void;
  isCompleted?: boolean;
}

export default function FreeContentViewer({ content, onMarkComplete, onSubmitAnswer, isCompleted }: FreeContentViewerProps) {
  if (!content) return null;
  const data = content.content_data || {};
  const type = content.content_type as FreeContentType;

  switch (type) {
    case 'markdown':
      return (
        <div className="prose prose-invert prose-indigo max-w-none">
          <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
            {data.body || ''}
          </ReactMarkdown>
          {onMarkComplete && !isCompleted && (
            <button
              onClick={onMarkComplete}
              className="mt-6 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl"
            >
              Mark as Read
            </button>
          )}
        </div>
      );

    case 'video':
      const url = data.url || '';
      const videoId = url.match(/(?:v=|\/)([\w-]{11})(?:\?|&|$)/)?.[1];
      return (
        <div className="space-y-4">
          {videoId && (
            <div className="aspect-video rounded-xl overflow-hidden bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                className="w-full h-full"
                allowFullScreen
              />
            </div>
          )}
          {data.caption && <p className="text-slate-400">{data.caption}</p>}
          {onMarkComplete && !isCompleted && (
            <button
              onClick={onMarkComplete}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl"
            >
              Mark as Watched
            </button>
          )}
        </div>
      );

    case 'key_points':
      return (
        <div className="space-y-4">
          <ul className="space-y-3">
            {(data.points || []).map((p: string, i: number) => (
              <li key={i} className="flex gap-3">
                <span className="text-indigo-400 font-bold">•</span>
                <span className="text-slate-300">{p}</span>
              </li>
            ))}
          </ul>
          {onMarkComplete && !isCompleted && (
            <button
              onClick={onMarkComplete}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl"
            >
              Mark as Read
            </button>
          )}
        </div>
      );

    case 'mcq':
      return <McqViewer data={data} onSubmitAnswer={onSubmitAnswer} isCompleted={isCompleted} />;

    case 'image_diagram':
      return (
        <div className="space-y-4">
          {data.image_url && (
            <img src={data.image_url} alt={data.caption} className="w-full rounded-xl" />
          )}
          {data.caption && <p className="text-slate-400">{data.caption}</p>}
          {data.description && (
            <div className="prose prose-invert prose-sm">
              <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{data.description}</ReactMarkdown>
            </div>
          )}
          {onMarkComplete && !isCompleted && (
            <button onClick={onMarkComplete} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl">
              Mark as Read
            </button>
          )}
        </div>
      );

    case 'latex_formula':
      return (
        <div className="space-y-4">
          <div className="p-6 bg-[#161b22] rounded-xl flex justify-center">
            <LatexRenderer content={data.formula || ''} />
          </div>
          {data.explanation && (
            <div className="prose prose-invert prose-sm">
              <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{data.explanation}</ReactMarkdown>
            </div>
          )}
          {onMarkComplete && !isCompleted && (
            <button onClick={onMarkComplete} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl">
              Mark as Read
            </button>
          )}
        </div>
      );

    default:
      return (
        <div className="p-6 bg-[#161b22] rounded-xl text-slate-400">
          Content type &quot;{type}&quot; preview not implemented yet.
        </div>
      );
  }
}

function McqViewer({ data, onSubmitAnswer, isCompleted }: { data: any; onSubmitAnswer?: (a: string) => void; isCompleted?: boolean }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  return (
    <div className="space-y-4">
      <p className="text-white font-medium">{data.question}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {(data.options || []).map((opt: any) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => !submitted && setSelected(opt.id)}
            disabled={submitted}
            className={cn(
              "p-4 rounded-xl text-left border transition-all",
              selected === opt.id ? "bg-indigo-600 border-indigo-500 text-white" : "bg-white/5 border-slate-800 text-slate-300 hover:border-slate-600"
            )}
          >
            <span className="font-bold mr-2">{opt.id?.toUpperCase()}.</span>{opt.text}
          </button>
        ))}
      </div>
      {!submitted && selected && onSubmitAnswer && (
        <button
          onClick={() => { onSubmitAnswer(selected); setSubmitted(true); }}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl"
        >
          Submit
        </button>
      )}
    </div>
  );
}
