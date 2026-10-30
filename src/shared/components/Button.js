"use client";

import React, { forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/shared/utils/cn";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground font-medium hover:bg-primary/90 shadow-xs",
        default: "bg-primary text-primary-foreground font-medium hover:bg-primary/90 shadow-xs",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border/50 shadow-xs",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-xs",
        ghost: "hover:bg-accent hover:text-accent-foreground text-muted-foreground",
        danger: "bg-destructive text-destructive-foreground font-medium hover:bg-destructive/90 shadow-xs",
        destructive: "bg-destructive text-destructive-foreground font-medium hover:bg-destructive/90 shadow-xs",
        success: "bg-emerald-600 text-white font-medium hover:bg-emerald-700 shadow-xs",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        xs: "h-6 px-2.5 text-[11px] rounded-md gap-1.5",
        sm: "h-8 px-3 text-xs rounded-md",
        md: "h-9 px-4 text-sm rounded-md",
        default: "h-9 px-4 text-sm rounded-md",
        lg: "h-10 px-5 text-sm rounded-md",
        icon: "h-9 w-9 p-0 rounded-md",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

const Button = forwardRef(function Button(
  {
    children,
    variant = "primary",
    size = "md",
    icon,
    iconRight,
    disabled = false,
    loading = false,
    fullWidth = false,
    asChild = false,
    className,
    ...props
  },
  ref
) {
  const Comp = asChild ? Slot : "button";

  const renderIcon = (iconContent) => {
    if (!iconContent) return null;
    if (React.isValidElement(iconContent)) return iconContent;
    return (
      <span
        className={cn(
          "material-symbols-outlined",
          size === "xs" ? "text-[14px]" : "text-[18px]"
        )}
      >
        {iconContent}
      </span>
    );
  };

  return (
    <Comp
      ref={ref}
      className={cn(
        buttonVariants({ variant, size }),
        fullWidth && "w-full",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className={cn("animate-spin shrink-0", size === "xs" ? "h-3.5 w-3.5" : "h-4 w-4")} />
      ) : (
        renderIcon(icon)
      )}
      {children}
      {iconRight && !loading && renderIcon(iconRight)}
    </Comp>
  );
});

Button.displayName = "Button";
export default Button;
