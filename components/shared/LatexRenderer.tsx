'use client';

import { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface LatexRendererProps {
  content: string;
  className?: string;
}

export default function LatexRenderer({ content, className }: LatexRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      // Replace $...$ with inline math and $$...$$ with block math
      const katexOpts = { throwOnError: false, strict: false };
      const processLatex = (text: string) => {
        const trimmed = text.trim();
        if (!trimmed) return '';

        // If no $ delimiters, treat entire content as display math (raw LaTeX)
        if (!trimmed.includes('$')) {
          try {
            return katex.renderToString(trimmed, { ...katexOpts, displayMode: true });
          } catch (e) {
            console.error('KaTeX error:', e);
            return trimmed;
          }
        }

        // Block math $$...$$
        let processed = trimmed.replace(/\$\$([\s\S]*?)\$\$/g, (match, p1) => {
          try {
            return katex.renderToString(p1.trim(), { ...katexOpts, displayMode: true });
          } catch (e) {
            console.error('KaTeX error:', e);
            return match;
          }
        });

        // Inline math $...$
        processed = processed.replace(/\$([^$]+?)\$/g, (match, p1) => {
          try {
            return katex.renderToString(p1.trim(), { ...katexOpts, displayMode: false });
          } catch (e) {
            console.error('KaTeX error:', e);
            return match;
          }
        });

        return processed;
      };

      containerRef.current.innerHTML = processLatex(content);
    }
  }, [content]);

  return (
    <div 
      ref={containerRef} 
      className={className}
    />
  );
}
