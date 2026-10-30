"use client";

import { CheckCircle2, AlertTriangle, Info, XCircle } from "lucide-react";

/** Reusable status alert with Lucide icons and shadcn styling */
export default function StatusAlert({ status, className = "" }) {
  if (!status) return null;

  const renderMessage = (msg) => {
    const parts = (msg || "").split(/(https?:\/\/[^\s]+)/g);
    return parts.map((part, i) =>
      /^https?:\/\//.test(part) ? (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noreferrer"
          className="underline font-semibold hover:opacity-80"
        >
          {part}
        </a>
      ) : (
        part
      )
    );
  };

  const config = {
    success: {
      icon: CheckCircle2,
      style: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400",
    },
    warning: {
      icon: AlertTriangle,
      style: "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400",
    },
    info: {
      icon: Info,
      style: "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400",
    },
    error: {
      icon: XCircle,
      style: "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400",
    },
  }[status.type] || {
    icon: XCircle,
    style: "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400",
  };

  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-2.5 p-3 rounded-lg border text-sm font-medium ${config.style} ${className}`}>
      <Icon className="size-4 shrink-0" />
      <div className="flex-1 leading-normal">{renderMessage(status.message)}</div>
    </div>
  );
}
