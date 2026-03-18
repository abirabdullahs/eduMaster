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
      className="lecture-html-content prose prose-sm sm:prose-base prose-invert prose-indigo max-w-none prose-p:text-slate-300 prose-headings:text-white prose-strong:text-white prose-a:text-indigo-400 prose-li:text-slate-300 prose-code:text-indigo-400 prose-pre:bg-slate-900 prose-img:max-w-full prose-img:h-auto prose-img:w-auto [&_img]:max-w-full [&_img]:h-auto [&_iframe]:max-w-full [&_iframe]:w-full [&_table]:block [&_table]:overflow-x-auto [&_table]:max-w-full [&_pre]:overflow-x-auto [&_pre]:max-w-full overflow-x-auto w-full"
      style={{ wordBreak: 'break-word' } as React.CSSProperties}
      dangerouslySetInnerHTML={{ __html: html }}
      suppressHydrationWarning
    />
  );
}
