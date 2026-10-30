"use client";

import { AlertTriangle } from "lucide-react";

/** Security warning banner with optional action link */
export default function SecurityWarning({ message, action }) {
  return (
    <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-400 text-xs">
      <AlertTriangle className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
      <p className="flex-1 font-medium leading-relaxed">{message}</p>
      {action && (
        <a
          href={action.href}
          className="font-semibold underline shrink-0 hover:text-amber-900 dark:hover:text-amber-200 transition-colors ml-2"
          onClick={
            action.href.startsWith("#")
              ? (e) => {
                  e.preventDefault();
                  document.getElementById(action.href.slice(1))?.scrollIntoView({ behavior: "smooth" });
                }
              : undefined
          }
        >
          {action.label}
        </a>
      )}
    </div>
  );
}
