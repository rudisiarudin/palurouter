"use client";

import React, { forwardRef } from "react";
import { cn } from "@/shared/utils/cn";

const paddings = {
  none: "",
  xs: "p-3",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

const Card = forwardRef(function Card(
  {
    children,
    title,
    subtitle,
    icon,
    action,
    padding = "md",
    hover = false,
    elev = false,
    className,
    ...props
  },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn(
        "bg-card text-card-foreground border border-border rounded-xl shadow-xs transition-all duration-150",
        hover &&
          "hover:border-zinc-700 hover:shadow-sm transition-colors cursor-pointer",
        paddings[padding],
        className
      )}
      {...props}
    >
      {(title || action) && (
        <div className="flex items-center justify-between mb-4 gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {icon && (
              <div className="flex items-center justify-center p-2 rounded-lg bg-secondary text-muted-foreground border border-border/50 shrink-0">
                {React.isValidElement(icon) ? (
                  icon
                ) : (
                  <span className="material-symbols-outlined text-[18px]">
                    {icon}
                  </span>
                )}
              </div>
            )}
            <div className="min-w-0">
              {title && (
                <h3 className="text-foreground font-semibold text-base leading-none tracking-tight truncate">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs text-muted-foreground mt-1">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
});

Card.displayName = "Card";

Card.Section = function CardSection({ children, className, ...props }) {
  return (
    <div
      className={cn(
        "p-4 rounded-lg bg-muted/40 border border-border/60",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

Card.Row = function CardRow({ children, className, ...props }) {
  return (
    <div
      className={cn(
        "p-3 -mx-3 px-3 transition-colors duration-150 border-b border-border/60 last:border-b-0 hover:bg-muted/50",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

Card.ListItem = function CardListItem({
  children,
  actions,
  className,
  ...props
}) {
  return (
    <div
      className={cn(
        "group flex items-center justify-between p-3 -mx-3 px-3 border-b border-border/60 last:border-b-0 hover:bg-muted/50 transition-colors duration-150",
        className
      )}
      {...props}
    >
      <div className="flex-1 min-w-0">{children}</div>
      {actions && (
        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {actions}
        </div>
      )}
    </div>
  );
};

export default Card;
