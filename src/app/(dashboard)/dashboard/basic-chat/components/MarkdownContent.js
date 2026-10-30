"use client";

import { useMemo, useState } from "react";
import { marked } from "marked";
import { Check, Copy } from "lucide-react";

marked.setOptions({
  gfm: true,
  breaks: true,
});

export default function MarkdownContent({ content = "", className = "" }) {
  const html = useMemo(() => {
    if (!content) return "";
    try {
      return marked.parse(content);
    } catch {
      return content;
    }
  }, [content]);

  return (
    <div
      className={`prose-chat text-sm leading-relaxed text-[#FCFCFE] ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
