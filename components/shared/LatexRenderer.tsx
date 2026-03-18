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
      const processLatex = (text: string) => {
        // First handle block math $$...$$
        let processed = text.replace(/\$\$([\s\S]*?)\$\$/g, (match, p1) => {
          try {
            return katex.renderToString(p1, { displayMode: true, throwOnError: false });
          } catch (e) {
            console.error('KaTeX error:', e);
            return match;
          }
        });

        // Then handle inline math $...$
        processed = processed.replace(/\$(.*?)\$/g, (match, p1) => {
          try {
            return katex.renderToString(p1, { displayMode: false, throwOnError: false });
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
