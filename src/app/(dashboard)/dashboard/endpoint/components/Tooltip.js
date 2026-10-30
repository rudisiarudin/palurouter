"use client";

import { HelpCircle } from "lucide-react";

/** Inline tooltip with clean shadcn styling */
export default function Tooltip({ text }) {
  return (
    <span className="relative group inline-flex items-center">
      <HelpCircle className="size-3.5 text-muted-foreground hover:text-foreground cursor-help transition-colors" />
      <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 z-50 w-64 rounded-md border border-border bg-popover text-popover-foreground text-xs px-2.5 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-md leading-normal">
        {text}
      </span>
    </span>
  );
}
