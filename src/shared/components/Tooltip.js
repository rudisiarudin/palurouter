"use client";

import { useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function Tooltip({ text, children, position = "top", color }) {
  const anchorRef = useRef(null);
  const [style, setStyle] = useState(null);

  const handleMouseEnter = () => {
    const rect = anchorRef.current?.getBoundingClientRect();
    if (!rect) return;
    const midX = rect.left + rect.width / 2;
    const midY = rect.top + rect.height / 2;
    let pos;
    if (position === "bottom") {
      pos = { top: rect.bottom + 6, left: midX, transform: "translateX(-50%)" };
    } else if (position === "left") {
      pos = { right: window.innerWidth - rect.left + 6, top: midY, transform: "translateY(-50%)" };
    } else if (position === "right") {
      pos = { left: rect.right + 6, top: midY, transform: "translateY(-50%)" };
    } else {
      pos = { bottom: window.innerHeight - rect.top + 6, left: midX, transform: "translateX(-50%)" };
    }
    setStyle({ position: "fixed", ...pos });
  };

  return (
    <div
      ref={anchorRef}
      className="relative inline-flex"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setStyle(null)}
    >
      {children}
      {style &&
        createPortal(
          <div
            className={`pointer-events-none z-50 w-max max-w-64 rounded-md border border-border px-2.5 py-1 text-xs font-medium shadow-md animate-in fade-in-0 zoom-in-95 leading-snug whitespace-normal ${
              color ? "" : "bg-popover text-popover-foreground"
            }`}
            style={{ ...style, ...(color ? { backgroundColor: color, color: "#fff" } : {}) }}
          >
            {text}
          </div>,
          document.body
        )}
    </div>
  );
}
