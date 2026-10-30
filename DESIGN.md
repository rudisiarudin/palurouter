# Design System: temp.udi.web.id

> Extracted & Implemented: 2026-10-29

---

## 1. Design Language Overview

- **Vibe:** Vibrant · Soft · Dark Theme
- **Built with:** shadcn/ui & Tailwind CSS
- **Design Rhythm:** 4px grid · Subtly rounded · Soft elevation

---

## 2. Color System

| Role | Hex | Semantic CSS Variable | Usage |
|---|---|---|---|
| **Primary** | `#14B8A5` | `--primary`, `--color-primary` | CTAs, active states, key interactive indicators |
| **Primary FG** | `#001A1A` | `--primary-foreground` | High-contrast text on primary teal buttons |
| **Primary Soft** | `rgba(20,184,166,0.13)` | `--color-primary-soft` | Focus glow, subtle badge backgrounds, active pill tints |
| **Accent / Destructive** | `#D03232` | `--accent`, `--destructive` | Highlights, error states, delete actions |
| **Surface** | `#09090B` / `#27272A` | `--color-surface`, `--color-surface-2` | Main page background and card containers |
| **Elevated** | `#38383B` | `--color-surface-3` | Raised containers, dialog overlays, popovers |
| **Text** | `#FAFAFA` | `--foreground`, `--color-text` | Primary body text and headings |
| **Muted Text** | `#A1A1AA` | `--muted-foreground`, `--color-text-muted` | Captions, secondary labels, metadata |
| **Border** | `#27272A` | `--border`, `--input`, `--color-border` | Subtle component dividers and input outlines |

### Named Color Tokens (CSS Custom Properties)
```css
:root, .dark {
  --background: #09090b;
  --foreground: #fafafa;
  --card: #09090b;
  --card-foreground: #fafafa;
  --primary: #14b8a5;
  --primary-foreground: #001a1a;
  --primary-soft: rgba(20, 184, 166, 0.13);
  --secondary: #27272a;
  --secondary-foreground: #fafafa;
  --muted: #27272a;
  --muted-foreground: #a1a1aa;
  --accent: #d03232;
  --accent-foreground: #fafafa;
  --destructive: #d03232;
  --destructive-foreground: #fafafa;
  --border: #27272a;
  --input: #27272a;
  --ring: #14b8a5;
  --radius: 0.625rem;
}
```

---

## 3. Typography Hierarchy

- **H1 / Hero:** Inter 24px / font-weight 700, line-height 1.3
- **H2 / Section Title:** Inter 16px / font-weight 600, line-height 1.5, letter-spacing -0.16px
- **H3 / Card Header:** Inter 14px / font-weight 600, line-height 1.4
- **Body:** Inter 13px / font-weight 400, line-height 1.5
- **Small / Metadata:** Inter 12px / font-weight 500, line-height 1.4

---

## 4. Spacing & Radius Scale

- **Spacing Scale:** `8px`, `12px`, `16px`, `24px` (4px grid foundation)
- **Border Radius Hierarchy:**
  - **Button:** `8px` (`rounded-lg` / `--radius-xs`)
  - **Card:** `14px` (`rounded-[14px]` / `--radius-sm`)
  - **Input:** `8px` (`rounded-lg`, or `8px 0px 0px 8px` when paired with an attached action button)
  - **Chip / Badge:** `8px` (`rounded-md`)

---

## 5. Elevation & Shadows

- **Subtle Elevation:** `0px 1px 2px 0px rgba(0, 0, 0, 0.3)`
- **Warm Glow Elevation:** `0 2px 14px -2px rgba(20, 184, 165, 0.28)`
- **Focus Ring:** `0 0 0 2px #09090B, 0 0 0 4px #14B8A5`

---

## 6. Implementation Rules

### DO:
- Use `#14B8A5` for all primary CTAs, links, and active navigation indicators.
- Text on primary `#14B8A5` backgrounds **must** use `#001A1A` for WCAG AAA contrast ratio (~9.1:1).
- Reserve `#D03232` for destructive actions, warnings, and high-impact accent moments.
- Stick strictly to the spacing scale (`8`, `12`, `16`, `24px`).
- Match the radius vocabulary (`8px` buttons, `14px` cards, `8px` inputs).
- Pair `Inter 600/700` titles with `Inter 13px/14px 400` body text.

### DON'T:
- Never use white text (`#ffffff`) on `#14B8A5` buttons; always use `#001A1A` to avoid contrast degradation.
- Do not mix in competing primary colors (e.g. orange, blue).
- Do not introduce arbitrary radius values (e.g. 5px, 11px, 20px).
- Do not skip focus indicators on interactive elements.
