"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw"; // <-- Parses the <u> tags safely
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Eye,
  Code,
  Quote,
  Link,
  Minus,
} from "lucide-react";

export function MarkdownEditor({
  id = "markdown-editor-textarea",
  name,
  value = "",
  onChange,
  error,
  placeholder = "Write something in markdown...",
  rows = 6,
}) {
  const [editorTab, setEditorTab] = useState("write");

  const injectMarkdown = (type) => {
    const textarea = document.getElementById(id);
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const sel = value.substring(start, end);

    const map = {
      h1: `\n# ${sel || "Heading 1"}\n`,
      h2: `\n## ${sel || "Heading 2"}\n`,
      h3: `\n### ${sel || "Heading 3"}\n`,
      bold: `**${sel || "bold text"}**`,
      italic: `*${sel || "italic text"}*`,
      underline: `<u>${sel || "underlined"}</u>`,
      quote: `\n> ${sel || "Quote"}\n`,
      link: `[${sel || "Link Text"}](https://example.com)`,
      "code-inline": `\`${sel || "inline code"}\``,
      "code-block": `\n\`\`\`\n${sel || "// code block"}\n\`\`\`\n`,
      ul: `\n- ${sel || "List item"}\n`,
      ol: `\n1. ${sel || "List item"}\n`,
      hr: `\n---\n`,
    };

    const replacement = map[type];
    if (!replacement) return;

    const updated = value.substring(0, start) + replacement + value.substring(end);
    
    if (onChange) {
      onChange({ target: { name, value: updated } });
    }

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + replacement.length, start + replacement.length);
    }, 0);
  };

  return (
    <div className="space-y-1.5 w-full">
      <div
        className={`w-full border rounded-xl bg-white overflow-hidden transition-all flex flex-col ${
          error
            ? "border-rose-400 focus-within:border-rose-500 focus-within:ring-rose-500/30"
            : "border-slate-200 focus-within:border-indigo-500 focus-within:ring-indigo-500/30"
        } focus-within:ring-1`}
      >
        {/* Toolbar */}
        <div className="bg-slate-50 border-b border-slate-200 px-3 py-1.5 flex items-center justify-between gap-4 flex-wrap select-none">
          <div className={`flex items-center gap-0.5 flex-wrap ${editorTab === "preview" ? "opacity-25 pointer-events-none" : ""}`}>
            {[{ icon: Heading1, type: "h1" }, { icon: Heading2, type: "h2" }, { icon: Heading3, type: "h3" }].map(({ icon: Icon, type }) => (
              <button key={type} type="button" onClick={() => injectMarkdown(type)} className="h-7 w-7 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-md flex items-center justify-center cursor-pointer">
                <Icon className="h-3.5 w-3.5" />
              </button>
            ))}
            <div className="w-px h-4 bg-slate-200 mx-1" />
            {[{ icon: Bold, type: "bold" }, { icon: Italic, type: "italic" }, { icon: Underline, type: "underline" }, { icon: Quote, type: "quote" }].map(({ icon: Icon, type }) => (
              <button key={type} type="button" onClick={() => injectMarkdown(type)} className="h-7 w-7 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-md flex items-center justify-center cursor-pointer">
                <Icon className="h-3.5 w-3.5" />
              </button>
            ))}
            <div className="w-px h-4 bg-slate-200 mx-1" />
            {[{ icon: List, type: "ul" }, { icon: ListOrdered, type: "ol" }, { icon: Link, type: "link" }, { icon: Minus, type: "hr" }].map(({ icon: Icon, type }) => (
              <button key={type} type="button" onClick={() => injectMarkdown(type)} className="h-7 w-7 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-md flex items-center justify-center cursor-pointer">
                <Icon className="h-3.5 w-3.5" />
              </button>
            ))}
          </div>

          {/* Mode Switcher */}
          <div className="flex bg-slate-200/70 p-0.5 rounded-lg border border-slate-200/30">
            <button type="button" onClick={() => setEditorTab("write")} className={`px-2.5 py-1 text-[11px] font-semibold rounded-md flex items-center gap-1 cursor-pointer ${editorTab === "write" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600"}`}>
              <Code className="h-3 w-3" /> Editing
            </button>
            <button type="button" onClick={() => setEditorTab("preview")} className={`px-2.5 py-1 text-[11px] font-semibold rounded-md flex items-center gap-1 cursor-pointer ${editorTab === "preview" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600"}`}>
              <Eye className="h-3 w-3" /> Preview
            </button>
          </div>
        </div>

        {/* Content Pane */}
        {editorTab === "write" ? (
          <textarea
            id={id}
            name={name}
            value={value}
            onChange={onChange}
            rows={rows}
            placeholder={placeholder}
            className="w-full p-4 focus:outline-none resize-y border-0 text-slate-700 leading-relaxed font-mono text-[11px] bg-transparent"
          />
        ) : (
          /* Explicit component overrides to ensure Headings, Quotes, and Underlines render visually */
          <div className="w-full p-5 min-h-[150px] max-h-70 overflow-y-auto bg-slate-50/40 text-slate-700 text-xs break-words
            [&_h1]:text-xl [&_h1]:font-bold [&_h1]:mt-3 [&_h1]:mb-1 [&_h1]:text-[#0b2574]
            [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mt-2.5 [&_h2]:mb-1 [&_h2]:text-[#0b2574]
            [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mt-2 [&_h3]:mb-0.5
            [&_blockquote]:border-l-4 [&_blockquote]:border-indigo-500 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:my-2 [&_blockquote]:text-slate-500
            [&_u]:underline
            [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2
            [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2
            [&_p]:mb-2 [&_p]:leading-relaxed"
          >
            {value.trim() ? (
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]} 
                rehypePlugins={[rehypeRaw]}
              >
                {value}
              </ReactMarkdown>
            ) : (
              <span className="text-slate-400 italic text-[11px]">Nothing to preview</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}