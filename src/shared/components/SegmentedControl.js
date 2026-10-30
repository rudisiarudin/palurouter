"use client";

import React from "react";
import { cn } from "@/shared/utils/cn";

export default function SegmentedControl({
  options = [],
  value,
  onChange,
  size = "md",
  className,
}) {
  const sizes = {
    sm: "h-7 text-xs px-2.5",
    md: "h-8 text-xs sm:text-sm px-3.5",
    lg: "h-10 text-sm px-4",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center p-1 rounded-lg overflow-x-auto bg-muted text-muted-foreground border border-border/50",
        className
      )}
    >
      {options.map((option) => {
        const isSelected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "inline-flex items-center justify-center shrink-0 rounded-md font-medium transition-all duration-150 cursor-pointer select-none",
              sizes[size] || sizes.md,
              isSelected
                ? "bg-background text-foreground shadow-2xs font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-background/40"
            )}
          >
            {option.icon && (
              React.isValidElement(option.icon) ? (
                <span className="mr-1.5">{option.icon}</span>
              ) : (
                <span className="material-symbols-outlined text-[15px] mr-1.5">
                  {option.icon}
                </span>
              )
            )}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
