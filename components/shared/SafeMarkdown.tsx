'use client';

import React, { Component, type ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

import type { PluggableList } from 'unified';

interface SafeMarkdownProps {
  children: string;
  className?: string;
  components?: Record<string, React.ComponentType<any>>;
}

/** Catches rehype-katex "children in undefined" and falls back to plain markdown */
class MarkdownErrorBoundary extends Component<
  { children: ReactNode; fallback: (content: string) => ReactNode; content: string },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {
    // Error logged for debugging
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback(this.props.content);
    }
    return this.props.children;
  }
}

export default function SafeMarkdown({
  children,
  className = '',
  components,
}: SafeMarkdownProps) {
  const content = String(children ?? '');
  const hasMath = /\$\$|\$|\\\[|\\\]|\\frac|```math/.test(content);
  const remarkPlugins: PluggableList = [remarkGfm, ...(hasMath ? [remarkMath] : [])];
  const rehypePlugins: PluggableList = hasMath ? [rehypeKatex({ throwOnError: false, strict: false })] : [];
  const fallback = (text: string) => (
    <div
      className={className}
      dangerouslySetInnerHTML={{
        __html: text.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br/>'),
      }}
    />
  );
  return (
    <MarkdownErrorBoundary key={content} content={content} fallback={fallback}>
      <ReactMarkdown
        remarkPlugins={remarkPlugins}
        rehypePlugins={rehypePlugins}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </MarkdownErrorBoundary>
  );
}
