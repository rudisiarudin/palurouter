"use client";

import { cn } from "@/shared/utils/cn";

export default function Toggle({
  checked = false,
  onChange,
  label,
  description,
  disabled = false,
  size = "md",
  className,
}) {
  const sizes = {
    sm: { track: "w-7 h-4", thumb: "size-3", translate: "translate-x-3" },
    md: { track: "w-9 h-5", thumb: "size-4", translate: "translate-x-4" },
    lg: { track: "w-11 h-6", thumb: "size-5", translate: "translate-x-5" },
  };

  const handleClick = () => {
    if (!disabled && onChange) onChange(!checked);
  };

  const currentSize = sizes[size] || sizes.md;

  return (
    <div
      className={cn(
        "flex items-center gap-3",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={handleClick}
        className={cn(
          "peer relative inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          checked ? "bg-primary" : "bg-input",
          currentSize.track,
          disabled && "cursor-not-allowed"
        )}
      >
        <span
          className={cn(
            "pointer-events-none block rounded-full bg-background shadow-lg ring-0 transition-transform duration-200 ease-in-out",
            checked ? currentSize.translate : "translate-x-0",
            currentSize.thumb
          )}
        />
      </button>
      {(label || description) && (
        <div className="flex flex-col select-none">
          {label && (
            <span className="text-sm font-medium text-foreground">{label}</span>
          )}
          {description && (
            <span className="text-xs text-muted-foreground">{description}</span>
          )}
        </div>
      )}
    </div>
  );
}
