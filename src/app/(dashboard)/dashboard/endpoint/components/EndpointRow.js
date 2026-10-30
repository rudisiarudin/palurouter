"use client";

import { Input } from "@/shared/components";
import { Copy, Check } from "lucide-react";

/** Reusable endpoint row component with shadcn styling */
export default function EndpointRow({ label, url, copyId, copied, onCopy, badge, actions }) {
  const isCopied = copied === copyId;

  return (
    <div className="flex items-center gap-2">
      <span
        className={`text-xs font-mono font-medium px-2.5 py-1 rounded-md shrink-0 min-w-[90px] text-center border ${
          badge === "CF" || badge === "TS" || label === "Local"
            ? "bg-secondary text-foreground border-border font-semibold"
            : "bg-muted/50 text-muted-foreground border-border"
        }`}
      >
        {label}
      </span>
      <Input
        value={url}
        readOnly
        className="flex-1 font-mono text-sm bg-background border-border text-foreground selection:bg-primary/20"
      />
      <button
        type="button"
        onClick={() => onCopy(url, copyId)}
        aria-label={`Copy ${label} endpoint URL`}
        className="inline-flex items-center justify-center size-9 rounded-md border border-border bg-card hover:bg-accent hover:text-accent-foreground text-text-muted hover:text-foreground transition-colors shrink-0 cursor-pointer"
        title={isCopied ? "Copied!" : "Copy to clipboard"}
      >
        {isCopied ? (
          <Check className="size-4 text-primary animate-in zoom-in-50 duration-200" />
        ) : (
          <Copy className="size-4" />
        )}
      </button>
      {actions}
    </div>
  );
}
