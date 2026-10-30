"use client";

import React, { forwardRef } from "react";
import { cn } from "@/shared/utils/cn";

const Input = forwardRef(function Input(
  {
    label,
    type = "text",
    placeholder,
    value,
    onChange,
    error,
    hint,
    icon,
    disabled = false,
    required = false,
    className,
    inputClassName,
    ...props
  },
  ref
) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label className="text-sm font-medium text-foreground flex items-center">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
            {React.isValidElement(icon) ? (
              icon
            ) : (
              <span className="material-symbols-outlined text-[18px]">
                {icon}
              </span>
            )}
          </div>
        )}
        <input
          ref={ref}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={cn(
            "flex h-9 w-full rounded-md border border-input bg-background/80 px-3 py-1 text-sm transition-colors",
            "placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary",
            "disabled:cursor-not-allowed disabled:opacity-50",
            icon && "pl-9",
            error && "border-destructive focus-visible:ring-destructive",
            inputClassName
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs text-destructive flex items-center gap-1 font-medium mt-0.5">
          <span className="material-symbols-outlined text-[14px]">error</span>
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>
      )}
    </div>
  );
});

Input.displayName = "Input";
export default Input;
