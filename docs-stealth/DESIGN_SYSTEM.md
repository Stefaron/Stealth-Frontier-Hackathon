# Design System

> Stealth's visual language — colors, typography, layout, and interaction patterns used repeatedly. Written for designers **and** frontend engineers; every token traces back to a CSS file or component.

---

## Table of Contents

- [Visual philosophy](#visual-philosophy)
- [Color tokens](#color-tokens)
- [Typography](#typography)
- [Layout patterns](#layout-patterns)
- [Components & CSS classes](#components--css-classes)
- [Motion & interaction](#motion--interaction)
- [Iconography](#iconography)
- [Personality](#personality)

---

## Visual philosophy

Stealth borrows from **Linear**, **Vercel**, and **21st.dev**. Not the literal look — the way they handle hierarchy:

- Pure-white background. Content rises on it, not white-on-dark.
- Large confident typography for display, tiny mono for metadata, indigo + emerald as restrained accents.
- Animation only when it confirms an action. No decorative motion.
- Each card or section has one *focal point* — no visual competition.

The ultimate goal is one feeling: users trust Stealth is safe and serious before they click the first button.

---

## Color tokens

Defined in `app/globals.css` (`@theme inline`) and consumed via Tailwind v4 utilities.

### Surface

| Token | Hex | Use |
|---|---|---|
| `--bg` | `#ffffff` | Page background |
| Body BG | `bg-white` | Explicit in `<body>` |
| Card | `bg-white` + `border-zinc-200` / `border-zinc-100` | Card surface |
| Card subtle | `bg-zinc-50/40` | Table headers, secondary areas |
| Hairline border | `border-zinc-100` | Subtle separators |
| Default border | `border-zinc-200` | Card borders |

### Text hierarchy

| Style | Class | For |
|---|---|---|
| Display | `text-zinc-900 font-bold tracking-tight` | Page headlines |
| Subhead | `text-zinc-900 font-semibold` | Section titles |
| Body | `text-zinc-700` | Primary paragraphs |
| Muted | `text-zinc-500` | Captions, helpers |
| Subtle | `text-zinc-400` | Metadata, footer info |
| Disabled | `text-zinc-300` | Disabled state |

### Accent colors

| Token | Hex | Used in |
|---|---|---|
| Primary indigo | `#6366f1` | CTAs, links, accents (`text-indigo-600`, `bg-indigo-50`) |
| Success emerald | `#10b981` | Status dots, copy-success (`text-emerald-600`, `bg-emerald-50`) |
| Warning amber | `#f59e0b` | Warning banners (`bg-amber-50`, `border-amber-200`) |
| Info sky | `#0ea5e9` | Secondary notifications |
| Danger red | (hover) | Disconnect button hover state |

### CTA variants

| Variant | Implementation |
|---|---|
| **Primary** | `.btn-primary` — `bg-zinc-900 text-white rounded-lg` (custom CSS) |
| **Secondary** | `.btn-secondary` — subtle outline |
| **Pill** | Rounded-full for wallet button & segmented control |
| **Press** | `.press` — `active:scale-[0.97]` micro-interaction |

---

## Typography

Three font families, all via `next/font/google`:

| Family | CSS variable | Used for |
|---|---|---|
| **Geist Sans** | `--font-geist-sans` | Default body, all UI text |
| **Geist Mono** | `--font-geist-mono` | Addresses, signatures, IDs, mono labels |
| **Playfair Display** | `--font-playfair` | Serif accent in the Welcome page (`font-serif-italic`) for words like "*Pick your role*" |

Common type styles:

```text
Display     clamp(2.25rem, 4.6vw, 3.5rem)   line-height 1.05   letter-spacing -0.025em
H1 page     clamp(1.875rem, 3.4vw, 2.5rem)  line-height 1.05   letter-spacing -0.02em
H2 section  17–22px  font-bold  tracking-tight
Body        13.5–14.5px  text-zinc-500/700
Eyebrow     10.5–11.5px  font-mono uppercase tracking-wider
Caption     11–12px  text-zinc-400
```

Helper classes:
- `.eyebrow` — inline-flex chip with a dot on the left.
- `.eyebrow-dot` — 4px indigo dot.

---

## Layout patterns

### Container

Most pages use:
```tsx
<div className="max-w-5xl mx-auto px-5 md:px-8 py-10 md:py-14">
```
or `max-w-7xl` for pages with long tables (auditor).

### Card

The dominant pattern: the `card` CSS class, which means:
```text
bg-white
border border-zinc-200
rounded-2xl (or rounded-xl)
shadow subtle (optional)
```

Variant: `.card-hover` adds a transition shadow + an indigo border on hover.

### Per-page grids

| Page | Grid |
|---|---|
| Welcome | Single column, `max-w-2xl` |
| Treasurer dashboard | `grid md:grid-cols-2 gap-4` for action cards |
| Pay page | `grid grid-cols-[1fr_auto_auto_auto]` for recipient table |
| Auditor dashboard | `space-y-3` for the grants list |
| Auditor [daoId] | `grid grid-cols-[1fr_auto_auto]` for the transaction table |
| Auditor decrypt | `grid md:grid-cols-2 gap-6` for two columns (Sync + Decrypt) |

### Eyebrow + headline pattern

Every key page opens with:
```tsx
<span className="eyebrow">
  <span className="eyebrow-dot" />
  Treasurer · Pay
</span>
<h1>Bulk private payout</h1>
<p className="text-zinc-500">Upload a CSV, preview recipients, then send privately via Umbra.</p>
```

Consistency in this pattern = every page feels like part of the same product.

---

## Components & CSS classes

Custom CSS classes in `globals.css` used in more than one place:

### Surface & card
- `.card` — bordered surface with rounded corners
- `.card-hover` — shadow transition on hover
- `.bento-card` — special variant for the landing bento grid

### Buttons & interactive
- `.btn-primary` — black primary
- `.btn-secondary` — outline
- `.press` — `active:scale-[0.97]` feedback
- `.icon-wiggle` — `iconWiggle` keyframe on icon hover

### Status & indicator
- `.eyebrow` + `.eyebrow-dot`
- `animate-soft-pulse` — `softPulse` keyframe for status dots
- `.aurora-line` — gradient line for empty states

### Decoration
- `.bg-dot-grid` — dot-grid background
- `.ambient-drift` — drift keyframe for halo gradients
- `.ambient-float` — float keyframe for icons
- `.mask-radial` — radial mask helper
- `.spotlight-glow` — glow behind a highlighted element

### Thumb / illustration
- `.thumb-scan-sweep`, `.thumb-ring-pulse`, `.thumb-dot-flow`, `.thumb-ready-pop` — landing-thumbnail animations

### Retro TV (ConnectGate)
- `.retrotv-wrap`, `.retrotv-unit`, `.retrotv-body`, `.retrotv-screen`
- `.retrotv-static`, `.retrotv-scanline`
- `@keyframes retrotvStatic`, `@keyframes retrotvScan`

### Tour
- `.tour-spotlight-target` — applied to the currently highlighted element
- `.tour-progress-dot.is-current` — width 24px
- `.tour-progress-dot.is-done` — light indigo
- `@keyframes tourPulse`

---

## Motion & interaction

### Scroll reveal
- `Reveal` wrapper in `components/landing/Reveal.tsx`, or hooks `useGsapEnter` / `useGsapStagger`.
- Default easing: `power3.out`.
- Y offset: `28–30px`.
- Duration: `0.6–0.7s`.
- Stagger: `0.05–0.08s`.

### Page mount
- Welcome page: a GSAP timeline running nav → headline → sub → segments → card.
- Treasurer dashboard: no entry animation (intentional — appears instantly).
- Modal dialog: GSAP fade + scale, exit via `triggerClose()`.

### Micro-interaction
- Press: the `.press` class adds `transition transform active:scale-[0.97]`.
- Card hover: a halo gradient appears via `radial-gradient(...)` with `transition-opacity duration-500`.
- Copy feedback: the label flips to "Copied" + emerald check for 1.5 seconds.
- Status pill dot: `animate-soft-pulse` keyframe — opacity bouncing.

### Tour spotlight
- SVG mask cuts a hole in the dark overlay (`rgba(0,0,0,0.45)`).
- Smooth transition when the target rect changes.
- Tooltip auto-flips top / bottom based on available space.

---

## Iconography

- **Lucide React** for common icons (`lucide-react@^1.14.0`).
- **Inline SVG** for icons that need specific stroke control (e.g., role icons on Welcome, stat icons on Treasurer onboarding).
- **No sprite, no icon font.**
- Size convention: `w-3 h-3` (12px), `w-4 h-4` (16px), `w-5 h-5` (20px) — `22px` is the most common for role icons.
- Default stroke: `currentColor`, `strokeWidth={1.5–1.7}`.

---

## Personality

If Stealth were a person:

| Trait | Character |
|---|---|
| **Voice** | Calm, terse, slightly serious. Doesn't tell jokes. |
| **Wardrobe** | Black and white, expensive sneakers. Indigo accent on the bag. |
| **Way of speaking** | "We don't hold your balance — you hold your balance." |
| **Avoids** | Excessive crypto jargon, emoji noise, gradient overload, forced dark mode. |
| **Keeps** | Small details that show respect for the user — a successful address copy gets a checkmark; a failed transaction surfaces a real error message. |

> No "Genie of the Cloud" energy. Stealth isn't magic. Stealth is a tool that does one thing well.

---

[← Back to index](./README.md) · [Next: Development Notes →](./DEVELOPMENT_NOTES.md)
