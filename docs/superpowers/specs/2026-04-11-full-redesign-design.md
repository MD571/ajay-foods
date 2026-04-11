# Ajay Foods — Full Website Redesign Design Spec

**Date:** 2026-04-11  
**Status:** Approved  
**Scope:** Complete visual redesign of all 5 pages + design system foundation

---

## 1. Design Direction

**Theme:** Warm Clay + Cream (C3) — Modern  
**Personality:** Premium traditional Indian catering. Warm, celebratory, approachable. Not flat/corporate — modern with rounded shapes, depth, and gold accents.

---

## 2. Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--primary` | `#5C0F0F` | Nav background, buttons, hero gradient start |
| `--primary-mid` | `#7A1A1A` | Gradient mid, hover darken |
| `--primary-light` | `#A33420` | Gradient end, active borders |
| `--gold` | `#D4A853` | Accent — prices, highlights, CTA text on dark, active nav |
| `--gold-light` | `#E8C97A` | Hover gold state |
| `--bg` | `#FDF5EC` | Page background (warm cream) |
| `--surface` | `#FFF8F2` | Cards, inputs, modals |
| `--border` | `#EAD9C0` | Card borders, dividers, input borders |
| `--text-dark` | `#3D0A0A` | Primary headings |
| `--text-mid` | `#7A4A3A` | Body text |
| `--text-muted` | `#9A6A5A` | Labels, metadata, placeholders |

**Veg/Non-Veg indicators (unchanged):**
- Veg: `#1E7A4A` green dot, `#e8f5ee` background
- Non-Veg: `#8B1A1A` red dot, `#fde8e8` background

---

## 3. Typography

| Role | Font | Size / Weight |
|------|------|---------------|
| Page hero headings | Playfair Display | 36–40px, bold |
| Section headings | Playfair Display | 20–24px, bold |
| Card headings | Playfair Display | 14–16px, bold |
| Body text | DM Sans | 15–16px, regular, line-height 1.65 |
| Labels / eyebrows | DM Sans | 11–12px, 600, uppercase, letter-spacing 2px |
| Prices | DM Sans | 14–16px, 700 |
| Buttons | DM Sans | 13–14px, 700, letter-spacing 0.3px |

Both fonts already loaded via Google Fonts in `app/layout.tsx` — no changes needed.

---

## 4. Shape Language (Modern)

| Element | Radius |
|---------|--------|
| Cards | `rounded-2xl` (16px) |
| Buttons (primary/pill) | `rounded-full` (50px) |
| Buttons (secondary/outline) | `rounded-full` |
| Input fields | `rounded-xl` (12px) |
| Icon boxes in cards | `rounded-xl` (12px) |
| Nav pill | `rounded-full` |
| Badge / chips | `rounded-full` |
| Admin stat cards | `rounded-2xl` |
| Modals / panels | `rounded-2xl` |

---

## 5. Depth & Shadow System

```css
/* Card default */
box-shadow: 0 2px 8px rgba(92,15,15,0.06);

/* Card hover / elevated */
box-shadow: 0 8px 24px rgba(92,15,15,0.12), 0 2px 6px rgba(0,0,0,0.06);

/* CTA gold button glow */
box-shadow: 0 4px 16px rgba(212,168,83,0.35);

/* Floating nav / stats card */
box-shadow: 0 8px 24px rgba(92,15,15,0.12), 0 2px 6px rgba(0,0,0,0.06);

/* Admin accent card (maroon) */
box-shadow: 0 4px 14px rgba(92,15,15,0.25);
```

---

## 6. Modular Theme Architecture

### `app/lib/theme.ts` (new file — single source of truth)
```ts
export const theme = {
  primary:      '#5C0F0F',
  primaryMid:   '#7A1A1A',
  primaryLight: '#A33420',
  gold:         '#D4A853',
  goldLight:    '#E8C97A',
  bg:           '#FDF5EC',
  surface:      '#FFF8F2',
  border:       '#EAD9C0',
  textDark:     '#3D0A0A',
  textMid:      '#7A4A3A',
  textMuted:    '#9A6A5A',
} as const

export type Theme = typeof theme
```

### `tailwind.config.ts` — extend colors
```ts
theme: {
  extend: {
    colors: {
      primary:  'var(--primary)',
      'primary-mid':   'var(--primary-mid)',
      'primary-light': 'var(--primary-light)',
      gold:     'var(--gold)',
      'gold-light': 'var(--gold-light)',
      surface:  'var(--surface)',
      'warm-bg': 'var(--bg)',
      'warm-border': 'var(--border)',
      'text-dark': 'var(--text-dark)',
      'text-mid':  'var(--text-mid)',
      'text-muted': 'var(--text-muted)',
    }
  }
}
```

### `app/globals.css` — CSS variables block
```css
:root {
  --primary:       #5C0F0F;
  --primary-mid:   #7A1A1A;
  --primary-light: #A33420;
  --gold:          #D4A853;
  --gold-light:    #E8C97A;
  --bg:            #FDF5EC;
  --surface:       #FFF8F2;
  --border:        #EAD9C0;
  --text-dark:     #3D0A0A;
  --text-mid:      #7A4A3A;
  --text-muted:    #9A6A5A;
}
```

**Future redesign = change values in `theme.ts` + `globals.css` only. Zero page edits needed.**

---

## 7. Shared UI Patterns

### Navigation
- Background: `linear-gradient(90deg, var(--primary), var(--primary-mid))`
- Logo: Playfair, `text-gold`
- Nav links: `text-white/55`
- CTA button: gold pill — `bg-gold text-primary rounded-full`
- Mobile: hamburger icon `bg-white/10 border border-white/15 rounded-lg`

### Hero Sections (all pages)
- Gradient: `linear-gradient(160deg, var(--primary) 0%, var(--primary-mid) 60%, var(--primary-light) 100%)`
- Decorative bg circles: `position:absolute`, `rounded-full`, `bg-gold/6` or `bg-white/3`
- Badge: pill with gold border — `bg-gold/12 border border-gold/25 rounded-full`
- H1: Playfair, white + gold split
- Sub: `text-white/55`, DM Sans
- Primary CTA: `bg-gold text-primary rounded-full font-bold shadow-[0_4px_16px_rgba(212,168,83,0.35)]`
- Secondary CTA: `bg-white/8 text-white/80 border border-white/15 rounded-full`

### Cards
- Background: `bg-surface` (white)
- Border: `border border-warm-border`
- Radius: `rounded-2xl`
- Shadow: `shadow-[0_2px_8px_rgba(92,15,15,0.06)]`
- Card heading: Playfair, `text-text-dark`
- Price: DM Sans 700, `text-gold`

### Buttons
- Primary (filled): `bg-primary text-gold rounded-full font-bold` + gold glow shadow
- Secondary (outline): `border border-warm-border text-primary rounded-full`
- Destructive: `bg-primary/8 border border-primary/15 text-primary rounded-full`

### Category / Filter Chips
- Active: `bg-primary text-gold rounded-full font-semibold shadow-[0_2px_8px_rgba(92,15,15,0.2)]`
- Inactive: `bg-surface text-text-muted border border-warm-border rounded-full`

---

## 8. Page-by-Page Spec

### 8.1 Home (`app/page.tsx`)

**Hero:**
- Floating nav pill inside gradient header
- Badge with gold dot + text
- H1 split: white line 1, gold line 2
- Sub text + two pill buttons
- Floating stats card (negative margin-top, white bg, shadow) showing 500+ Events / 50+ Dishes / 12+ Packages

**Sections (all on `bg-warm-bg`):**
- Services/Why Us: 2×2 grid of rounded feature cards with icon boxes
- Package highlights: vertical list of `rounded-2xl` cards, gold "Popular" badge on top pick, "Select →" pill button
- Menu highlights: horizontal scroll of category chips + 2-col card grid
- Booking/CTA section: maroon gradient `rounded-2xl` panel with gold pill CTA
- Testimonials: `rounded-2xl` cards, gold quote mark
- Footer: dark maroon background, gold logo, social links

### 8.2 Menu (`app/menu/page.tsx`)

- Maroon gradient mini-hero (shorter than home)
- **Floating search bar** (negative margin-top, white pill, shadow) with veg toggle pill inside
- Horizontal pill category chips (scrollable)
- 2-column card grid — `rounded-2xl` cards with Playfair name, gold price, veg/non-veg pill indicator
- 3D tilt on hover preserved (existing `onCardTilt`/`onCardTiltReset`)
- Staggered `useInView` reveal preserved

### 8.3 Packages (`app/packages/page.tsx`)

- Maroon gradient hero
- Package cards: `rounded-2xl`, gold top accent OR left border, guest slider below each
- "Popular" badge on recommended package
- Footer icon strip: `rounded-2xl` white cards with icon + label
- Tilt + stagger animations preserved

### 8.4 Order (`app/order/page.tsx`)

- Step indicator: pill steps — active = `bg-primary text-gold`, done = `bg-gold text-primary`, pending = `bg-warm-border text-text-muted`
- Extras picker: `rounded-2xl` item rows, qty `+`/`−` buttons in `bg-primary text-gold rounded-lg`
- Order summary sidebar / drawer: maroon header `rounded-2xl`, gold prices
- Details form: `rounded-xl` inputs with `border-warm-border focus:border-primary`
- Confirmation screen: gold checkmark, maroon gradient panel

### 8.5 Admin (`app/admin/page.tsx`)

**Header (unchanged structure, new styles):**
- Full-width maroon gradient header
- Avatar box: `bg-gold/18 border border-gold/30 rounded-xl`, gold letter
- Tab bar: pill tabs inside header — active = `bg-gold/18 border border-gold/30 text-gold`, inactive = `bg-white/6 text-white/45`

**Dashboard tab:**
- Welcome banner: maroon gradient `rounded-2xl` with decorative circle, "Good day!" in Playfair
- 2×2 stat card grid: `rounded-2xl` white cards, icon box (`rounded-xl`, muted primary bg), Playfair stat number
- One accent stat card in full maroon gradient

**Other tabs (Packages, Menu, Bookings, etc.):**
- Content area: `bg-warm-bg` (cream), `rounded-2xl` section cards
- Add button: gold pill — `bg-primary text-gold rounded-full`
- Edit/Delete: pill buttons — `rounded-full`, gold-tinted / maroon-tinted
- Form inputs: `rounded-xl border-warm-border`
- Section headers: Playfair heading + action button, separated by `border-warm-border`

---

## 9. Files to Change

| File | Change |
|------|--------|
| `app/lib/theme.ts` | **New file** — color + token constants |
| `tailwind.config.ts` | Extend `colors` with semantic token names |
| `app/globals.css` | CSS variables block, scrollbar color, keyframe accent colors |
| `app/page.tsx` | Full visual restyle |
| `app/menu/page.tsx` | Full visual restyle (preserve animations) |
| `app/packages/page.tsx` | Full visual restyle (preserve animations) |
| `app/order/page.tsx` | Full visual restyle |
| `app/admin/page.tsx` | Full visual restyle |

---

## 10. Constraints

- All pages are `"use client"` — no Server Component changes needed
- Existing animations (`useInView`, `onCardTilt`, `onCardTiltReset`, `heroFadeUp`) must be preserved
- `prefers-reduced-motion` guard in `globals.css` must be preserved
- TypeScript must pass `npx tsc --noEmit` with zero errors after every file edit
- No new dependencies — use existing Tailwind + inline styles only
- `app/lib/siteData.ts` data layer unchanged — only visual layer changes
- Admin PIN auth logic unchanged
- Mobile-first — test at 375px and 1440px breakpoints

---

## 11. Implementation Order (Option B — Design System First)

1. `app/lib/theme.ts` — create token file
2. `tailwind.config.ts` — extend colors  
3. `app/globals.css` — CSS variables + update keyframe/scrollbar colors
4. `app/page.tsx` — home page restyle
5. `app/menu/page.tsx` — menu restyle
6. `app/packages/page.tsx` — packages restyle
7. `app/order/page.tsx` — order restyle
8. `app/admin/page.tsx` — admin restyle
9. `npx tsc --noEmit` — final type check
10. `npm run build` — production build verification
