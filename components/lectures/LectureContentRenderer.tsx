'use client';

/** Decodes HTML entities. Works on both server and client. Handles double-escaping. */
function decodeHtmlEntities(str: string): string {
  const entities: [RegExp, string][] = [
    [/&lt;/g, '<'],
    [/&gt;/g, '>'],
    [/&amp;/g, '&'],
    [/&quot;/g, '"'],
    [/&#39;/g, "'"],
    [/&#x27;/g, "'"],
  ];
  let decoded = str;
  let prev = '';
  while (prev !== decoded) {
    prev = decoded;
    for (const [re, replacement] of entities) {
      decoded = decoded.replace(re, replacement);
    }
  }
  return decoded;
}

/**
 * Renders lecture HTML content as live DOM (not raw code).
 * Supports both content_html and content DB columns.
 * Decodes HTML entities if content was stored escaped.
 */
export default function LectureContentRenderer({ 
  content 
}: { 
  content?: string | null 
}) {
  if (!content || typeof content !== 'string') return null;

  let html = content.trim();
  if (!html) return null;

  // Decode escaped HTML so <p>Hello</p> renders as formatted text, not raw code
  if (html.includes('&lt;') || html.includes('&gt;') || html.includes('&amp;')) {
    html = decodeHtmlEntities(html);
  }

  return (
    <div 
      className="lecture-html-content prose prose-invert prose-indigo max-w-none prose-p:text-slate-300 prose-headings:text-white prose-strong:text-white prose-a:text-indigo-400 prose-li:text-slate-300 prose-code:text-indigo-400 prose-pre:bg-slate-900"
      dangerouslySetInnerHTML={{ __html: html }}
      suppressHydrationWarning
    />
  );
}
