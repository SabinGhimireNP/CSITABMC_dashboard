/**
 * Custom Strapi-Equivalent Markdown Parser Compiler
 * Converts structural Markdown tags cleanly into secure inline HTML formats.
 */
export const renderMarkdownToHtml = (mdText) => {
  if (!mdText) return '<p class="text-slate-400 italic">No content. Start typing code or markdown structure...</p>';
  
  let html = mdText
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Blockquotes (> Blockquote)
  html = html.replace(/^>\s+(.+)$/gm, '<blockquote class="border-l-4 border-slate-300 pl-3 italic text-slate-500 my-2">$1</blockquote>');

  // Headings (H1, H2, H3)
  html = html.replace(/^#\s+(.+)$/gm, '<h1 class="text-xl font-bold text-slate-900 mt-4 mb-2">$1</h1>');
  html = html.replace(/^##\s+(.+)$/gm, '<h2 class="text-lg font-bold text-slate-900 mt-3 mb-1.5">$1</h2>');
  html = html.replace(/^###\s+(.+)$/gm, '<h3 class="text-sm font-bold text-slate-800 mt-2 mb-1">$1</h3>');
  
  // Horizontal Rules (---)
  html = html.replace(/^---$/gm, '<hr class="border-t border-slate-200 my-4" />');

  // Code Blocks (```code```)
  html = html.replace(/```([\s\S]*?)```/g, '<pre class="bg-slate-900 text-slate-100 p-3 rounded-lg text-[11px] font-mono overflow-x-auto my-3"><code>$1</code></pre>');
  
  // Inline Code (`code`)
  html = html.replace(/`(.*?)`/g, '<code class="bg-slate-100 text-indigo-600 px-1 py-0.5 rounded font-mono text-[11px]">$1</code>');

  // Bold (**text**) & Italic (*text*)
  html = html.replace(/\*\*(.*?)\*\//g, '<strong class="font-bold text-slate-900">$1</strong>'); // Fixed fallback regex capture
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em class="italic text-slate-800">$1</em>');
  
  // Links ([text](url))
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-indigo-600 font-medium underline hover:text-indigo-700">$1</a>');

  // Lists (Unordered & Ordered)
  html = html.replace(/^\s*[-*]\s+(.+)$/gm, '<li class="list-disc ml-4 my-0.5 text-slate-600">$1</li>');
  html = html.replace(/^\s*\d+\.\s+(.+)$/gm, '<li class="list-decimal ml-4 my-0.5 text-slate-600">$1</li>');
  
  // Line breaks
  html = html.replace(/\n/g, "<br />");

  return html;
};