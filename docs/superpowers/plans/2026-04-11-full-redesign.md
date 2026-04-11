# Full Website Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the saffron-red design system with a Deep Maroon + Antique Gold + Warm Cream theme across all 5 pages, using a modular CSS-variable architecture so future redesigns require changing only one file.

**Architecture:** A new `app/lib/theme.ts` exports typed color constants as the single source of truth. `globals.css` consumes those values as CSS custom properties. `tailwind.config.ts` maps semantic token names to those CSS variables. All 5 pages are then restyled to use semantic class names and the new shape language (rounded-2xl cards, rounded-full pills, subtle maroon-tinted shadows).

**Tech Stack:** Next.js 14 App Router · TypeScript · Tailwind CSS · CSS custom properties

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `app/lib/theme.ts` | **Create** | Typed color token constants — single source of truth |
| `tailwind.config.ts` | **Modify** | Extend colors with semantic names mapped to CSS vars |
| `app/globals.css` | **Modify** | CSS custom property block + update animation colors |
| `app/page.tsx` | **Modify** | Home page — full visual restyle |
| `app/menu/page.tsx` | **Modify** | Menu page — full visual restyle (preserve animations) |
| `app/packages/page.tsx` | **Modify** | Packages page — full visual restyle (preserve animations) |
| `app/order/page.tsx` | **Modify** | Order/booking page — full visual restyle |
| `app/admin/page.tsx` | **Modify** | Admin portal — full visual restyle |

---

## Task 1: Create theme token file

**Files:**
- Create: `app/lib/theme.ts`

- [ ] **Step 1.1: Create `app/lib/theme.ts`**

```typescript
// app/lib/theme.ts
// Single source of truth for the design system.
// To redesign the site: change values here + matching CSS vars in globals.css.

export const theme = {
  // Brand colours
  primary:      '#5C0F0F',
  primaryMid:   '#7A1A1A',
  primaryLight: '#A33420',

  // Accent
  gold:         '#D4A853',
  goldLight:    '#E8C97A',

  // Backgrounds
  bg:           '#FDF5EC',   // page background
  surface:      '#FFF8F2',   // cards, inputs

  // Borders
  border:       '#EAD9C0',

  // Text
  textDark:     '#3D0A0A',
  textMid:      '#7A4A3A',
  textMuted:    '#9A6A5A',

  // Diet indicators (unchanged)
  vegGreen:     '#1E7A4A',
  vegBg:        '#e8f5ee',
  nonVegRed:    '#8B1A1A',
  nonVegBg:     '#fde8e8',
} as const

export type ThemeKey = keyof typeof theme
export type ThemeValue = (typeof theme)[ThemeKey]
```

- [ ] **Step 1.2: Type-check**

```bash
npx tsc --noEmit
```

Expected: exit 0, no errors.

- [ ] **Step 1.3: Commit**

```bash
git add app/lib/theme.ts
git commit -m "feat: add design token file for modular theming"
```

---

## Task 2: Update Tailwind config with semantic color names

**Files:**
- Modify: `tailwind.config.ts`

- [ ] **Step 2.1: Replace `tailwind.config.ts` entirely**

```typescript
import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Semantic tokens — mapped to CSS variables set in globals.css.
        // Change globals.css :root block to retheme the whole site.
        primary:        'var(--primary)',
        'primary-mid':  'var(--primary-mid)',
        'primary-light':'var(--primary-light)',
        gold:           'var(--gold)',
        'gold-light':   'var(--gold-light)',
        'warm-bg':      'var(--bg)',
        surface:        'var(--surface)',
        'warm-border':  'var(--border)',
        'text-dark':    'var(--text-dark)',
        'text-mid':     'var(--text-mid)',
        'text-muted':   'var(--text-muted)',
      },
      fontFamily: {
        playfair: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
}
export default config
```

- [ ] **Step 2.2: Type-check**

```bash
npx tsc --noEmit
```

Expected: exit 0.

- [ ] **Step 2.3: Commit**

```bash
git add tailwind.config.ts
git commit -m "feat: extend tailwind with semantic color tokens"
```

---

## Task 3: Update globals.css — CSS variables + animation colors

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 3.1: Replace the `:root` block and update animation accent colors**

Find and replace the existing `:root` block (lines 5–8):

```css
/* BEFORE */
:root {
  --background: #FFF8F5;
  --foreground: #1a1a1a;
}
```

```css
/* AFTER */
:root {
  /* ── Design tokens — change here to retheme the site ── */
  --primary:        #5C0F0F;
  --primary-mid:    #7A1A1A;
  --primary-light:  #A33420;
  --gold:           #D4A853;
  --gold-light:     #E8C97A;
  --bg:             #FDF5EC;
  --surface:        #FFF8F2;
  --border:         #EAD9C0;
  --text-dark:      #3D0A0A;
  --text-mid:       #7A4A3A;
  --text-muted:     #9A6A5A;

  /* Legacy aliases kept for body tag */
  --background: var(--bg);
  --foreground: var(--text-dark);
}
```

- [ ] **Step 3.2: Update `pulseRing` animation (old red → new maroon)**

Find:
```css
@keyframes pulseRing {
  0%   { box-shadow: 0 0 0  0   rgba(212,56,13,0.55); transform: scale(1);    }
  60%  { box-shadow: 0 0 0 14px rgba(212,56,13,0);    transform: scale(1.06); }
  100% { box-shadow: 0 0 0  0   rgba(212,56,13,0);    transform: scale(1);    }
}
```

Replace with:
```css
@keyframes pulseRing {
  0%   { box-shadow: 0 0 0  0   rgba(92,15,15,0.55); transform: scale(1);    }
  60%  { box-shadow: 0 0 0 14px rgba(92,15,15,0);    transform: scale(1.06); }
  100% { box-shadow: 0 0 0  0   rgba(92,15,15,0);    transform: scale(1);    }
}
```

- [ ] **Step 3.3: Update `card-tilt` hover shadow (old red → new maroon)**

Find:
```css
  .card-tilt:hover {
    box-shadow: 0 20px 50px rgba(212,56,13,0.12), 0 4px 16px rgba(0,0,0,0.06);
    border-color: #D4A853 !important;
  }
```

Replace with:
```css
  .card-tilt:hover {
    box-shadow: 0 20px 50px rgba(92,15,15,0.12), 0 4px 16px rgba(0,0,0,0.06);
    border-color: #D4A853 !important;
  }
```

- [ ] **Step 3.4: Update scrollbar colors**

Find:
```css
::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-track { background: #FFF8F5; }
::-webkit-scrollbar-thumb { background: #FFE0D4; border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: #D4380D; }
```

Replace with:
```css
::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-track { background: var(--bg); }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: var(--primary-mid); }
```

- [ ] **Step 3.5: Type-check and commit**

```bash
npx tsc --noEmit
git add app/globals.css
git commit -m "feat: add CSS variable tokens and update animation colors to maroon"
```

---

## Task 4: Restyle Home page (`app/page.tsx`)

**Files:**
- Modify: `app/page.tsx`

The home page holds all its data inline (no siteData reads). Key structural sections to restyle:

### Navigation

- [ ] **Step 4.1: Update nav background and elements**

Find the `<nav>` or top header element. Replace its className with:
```tsx
// Nav wrapper
className="sticky top-0 z-50 bg-gradient-to-r from-primary to-primary-mid border-b border-white/10 shadow-lg"

// Logo text
className="font-playfair text-gold font-bold text-lg tracking-wide"

// Nav links
className="text-white/55 text-sm hover:text-white/90 transition-colors"

// Book Now CTA
className="bg-gold text-primary text-sm font-bold px-4 py-2 rounded-full hover:bg-gold-light transition-colors shadow-[0_4px_16px_rgba(212,168,83,0.35)]"
```

### Hero Section

- [ ] **Step 4.2: Update hero gradient and content**

Hero wrapper className:
```tsx
className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-mid to-primary-light"
```

Add decorative circles inside the hero (before content):
```tsx
{/* Decorative depth circles */}
<div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-gold/5 pointer-events-none" />
<div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-white/[0.03] pointer-events-none" />
```

Badge pill:
```tsx
<div className="hero-badge inline-flex items-center gap-2 bg-gold/[0.12] border border-gold/25 rounded-full px-4 py-1.5 mb-5">
  <div className="w-1.5 h-1.5 rounded-full bg-gold" />
  <span className="text-gold text-xs font-semibold tracking-widest uppercase">Est. 2010 · Premium Catering</span>
</div>
```

H1 pattern:
```tsx
<h1 className="font-playfair text-4xl md:text-5xl font-bold text-white leading-tight">
  Food That Feels<br />
  <span className="text-gold">Like Home</span>
</h1>
```

Sub text:
```tsx
<p className="hero-sub text-white/55 text-base leading-relaxed mt-4 max-w-md">
  Traditional Indian catering for weddings, events & every precious celebration
</p>
```

Buttons:
```tsx
<div className="hero-cta flex gap-3 mt-6 flex-wrap">
  <button className="bg-gold text-primary font-bold text-sm px-6 py-3 rounded-full shadow-[0_4px_16px_rgba(212,168,83,0.35)] hover:bg-gold-light transition-colors">
    Explore Packages
  </button>
  <button className="bg-white/[0.08] text-white/80 border border-white/15 text-sm px-6 py-3 rounded-full hover:bg-white/15 transition-colors">
    View Menu
  </button>
</div>
```

Floating stats card (place after hero div, using negative margin-top):
```tsx
<div className="relative z-10 mx-4 -mt-7">
  <div className="bg-white rounded-2xl shadow-[0_8px_24px_rgba(92,15,15,0.12)] border border-warm-border flex divide-x divide-warm-border">
    {[
      { num: '500+', label: 'Events' },
      { num: '50+',  label: 'Dishes' },
      { num: '12+',  label: 'Packages' },
    ].map(({ num, label }) => (
      <div key={label} className="flex-1 py-4 text-center">
        <div className="font-playfair text-2xl font-bold text-text-dark">{num}</div>
        <div className="text-text-muted text-xs uppercase tracking-widest mt-0.5">{label}</div>
      </div>
    ))}
  </div>
</div>
```

### Package Highlight Cards

- [ ] **Step 4.3: Update package cards**

Card wrapper:
```tsx
className="bg-white rounded-2xl border border-warm-border shadow-[0_2px_8px_rgba(92,15,15,0.06)] p-5 hover:shadow-[0_8px_24px_rgba(92,15,15,0.12)] transition-shadow"
```

Card heading: `className="font-playfair text-lg font-bold text-text-dark"`  
Price: `className="text-gold font-bold text-sm mt-1"`  
Description: `className="text-text-muted text-sm leading-relaxed mt-2"`  
Select button: `className="mt-4 bg-primary text-gold text-xs font-bold px-4 py-2 rounded-full hover:bg-primary-mid transition-colors"`

"Popular" badge:
```tsx
<span className="badge-glow bg-gold/[0.15] border border-gold/30 text-[#8B6A1A] text-xs font-semibold px-3 py-1 rounded-full">
  Popular
</span>
```

### Section Backgrounds and Eyebrows

- [ ] **Step 4.4: Update section backgrounds and eyebrows throughout**

Page background: `className="bg-warm-bg"` (replaces `bg-[#FFF8F5]`)

Section eyebrow pattern:
```tsx
<p className="text-gold text-xs font-semibold uppercase tracking-[0.2em] mb-2">Our Services</p>
```

Section heading: `className="font-playfair text-2xl md:text-3xl font-bold text-text-dark"`

Feature/why-us icon box:
```tsx
<div className="w-10 h-10 bg-primary/[0.08] rounded-xl flex items-center justify-center mb-3">
  {/* SVG icon in text-primary */}
</div>
```

### Testimonial Cards

- [ ] **Step 4.5: Update testimonial cards**

```tsx
className="bg-white rounded-2xl border border-warm-border shadow-[0_2px_8px_rgba(92,15,15,0.06)] p-6"
```

Quote mark: `className="text-gold/40 font-playfair text-5xl leading-none"`

### CTA / Booking Banner

- [ ] **Step 4.6: Update CTA banner**

```tsx
className="bg-gradient-to-br from-primary via-primary-mid to-primary-light rounded-2xl p-8 text-center relative overflow-hidden"
```

Add decorative circle inside:
```tsx
<div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-gold/[0.08] pointer-events-none" />
```

CTA button inside:
```tsx
className="bg-gold text-primary font-bold px-8 py-3 rounded-full shadow-[0_4px_16px_rgba(212,168,83,0.35)] hover:bg-gold-light transition-colors"
```

### Footer

- [ ] **Step 4.7: Update footer**

```tsx
className="bg-primary text-white/60"
// Logo in footer
className="font-playfair text-gold font-bold text-xl"
// Social links
className="text-white/40 hover:text-gold transition-colors"
// Divider
className="border-white/10"
```

- [ ] **Step 4.8: Type-check and commit**

```bash
npx tsc --noEmit
git add app/page.tsx
git commit -m "feat: restyle home page with maroon/gold/cream design system"
```

---

## Task 5: Restyle Menu page (`app/menu/page.tsx`)

**Files:**
- Modify: `app/menu/page.tsx`

Existing animations (`useInView`, `onCardTilt`, `onCardTiltReset`, stagger delays) must be **preserved unchanged**. Only className values change.

### Hero

- [ ] **Step 5.1: Update menu hero**

```tsx
// Hero wrapper
className="bg-gradient-to-br from-primary via-primary-mid to-primary-light relative overflow-hidden"

// Decorative circle
<div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-gold/[0.06] pointer-events-none" />

// Title
<h1 className="heroFadeUp font-playfair text-3xl md:text-4xl font-bold text-white">Full Menu</h1>
// Sub
<p className="hero-sub text-white/55 text-sm mt-2">50+ authentic dishes</p>
```

### Floating Search Bar

- [ ] **Step 5.2: Replace inline search bar with floating pill**

Replace the current search input wrapper with:
```tsx
<div className="relative z-10 mx-4 -mt-6 mb-3">
  <div className="bg-white rounded-full shadow-[0_4px_16px_rgba(92,15,15,0.12)] border border-warm-border flex items-center gap-3 px-4 py-3">
    <svg className="w-4 h-4 text-text-muted shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
    <input
      className="flex-1 bg-transparent text-sm text-text-dark placeholder:text-text-muted outline-none"
      placeholder="Search dishes..."
      value={query}
      onChange={e => setQuery(e.target.value)}
    />
    {/* Veg toggle stays as-is, restyle only */}
  </div>
</div>
```

### Category Chips

- [ ] **Step 5.3: Update category chip styles**

Active chip:
```tsx
className="bg-primary text-gold text-xs font-semibold px-4 py-2 rounded-full whitespace-nowrap shadow-[0_2px_8px_rgba(92,15,15,0.2)] transition-all"
```

Inactive chip:
```tsx
className="bg-surface text-text-muted border border-warm-border text-xs px-4 py-2 rounded-full whitespace-nowrap hover:border-primary/30 transition-all cursor-pointer"
```

### Menu Cards (MenuCard component)

- [ ] **Step 5.4: Update MenuCard styles**

Card wrapper (preserve existing `card-tilt`, `onMouseMove`, `onMouseLeave`, opacity/translate reveal):
```tsx
className={`card-tilt bg-white rounded-2xl border border-warm-border shadow-[0_2px_8px_rgba(92,15,15,0.06)] p-4 transition-all duration-500 ${
  visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
}`}
```

Item name: `className="font-playfair text-sm font-bold text-text-dark"`  
Price: `className="text-gold font-bold text-sm mt-1"`

Veg indicator pill (replace text label with dot + pill):
```tsx
// Veg
<div className="inline-flex items-center gap-1.5 bg-[#e8f5ee] rounded-lg px-2 py-0.5 mt-2">
  <div className="w-2 h-2 rounded-full bg-[#1E7A4A]" />
  <span className="text-[#1a6b3a] text-xs font-semibold">Veg</span>
</div>

// Non-Veg
<div className="inline-flex items-center gap-1.5 bg-[#fde8e8] rounded-lg px-2 py-0.5 mt-2">
  <div className="w-2 h-2 rounded-full bg-[#8B1A1A]" />
  <span className="text-[#8B1A1A] text-xs font-semibold">Non-Veg</span>
</div>
```

"Included" label: `className="text-gold text-xs font-semibold"`

- [ ] **Step 5.5: Update page background and section headings**

Page wrapper: `className="min-h-screen bg-warm-bg"`  
Section heading: `className="font-playfair text-xl font-bold text-text-dark"`

- [ ] **Step 5.6: Type-check and commit**

```bash
npx tsc --noEmit
git add app/menu/page.tsx
git commit -m "feat: restyle menu page with maroon/gold/cream design"
```

---

## Task 6: Restyle Packages page (`app/packages/page.tsx`)

**Files:**
- Modify: `app/packages/page.tsx`

Existing animations (`useInView`, tilt, stagger) must be **preserved**.

### Hero

- [ ] **Step 6.1: Update packages hero — same pattern as menu hero (Task 5.1)**

```tsx
className="bg-gradient-to-br from-primary via-primary-mid to-primary-light relative overflow-hidden"
// Decorative circle
<div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-gold/[0.06] pointer-events-none" />
// H1
<h1 className="heroFadeUp font-playfair text-3xl md:text-4xl font-bold text-white">Our Packages</h1>
// Sub
<p className="hero-sub text-white/55 text-sm mt-2">Crafted for every occasion</p>
```

### Package Cards

- [ ] **Step 6.2: Update package card styles**

Card wrapper (preserve tilt + stagger):
```tsx
className={`card-tilt bg-white rounded-2xl border border-warm-border shadow-[0_2px_8px_rgba(92,15,15,0.06)] p-6 hover:shadow-[0_8px_24px_rgba(92,15,15,0.12)] transition-all duration-500 ${
  cardsView.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
}`}
style={{ transitionDelay: `${pkgIdx * 120}ms` }}
```

Package name: `className="font-playfair text-xl font-bold text-text-dark"`  
Price: `className="text-gold font-bold text-base mt-1"`  
Description: `className="text-text-muted text-sm leading-relaxed mt-2"`

Popular badge (use existing `badge-glow` class):
```tsx
<span className="badge-glow bg-gold/[0.15] border border-gold/30 text-[#8B6A1A] text-xs font-semibold px-3 py-1 rounded-full">
  Most Popular
</span>
```

Select button:
```tsx
className="w-full mt-5 bg-primary text-gold font-bold text-sm py-3 rounded-full shadow-[0_4px_16px_rgba(92,15,15,0.2)] hover:bg-primary-mid transition-colors"
```

Guest count slider section:
```tsx
// Label
className="text-text-muted text-xs uppercase tracking-widest"
// Guest count display
className="font-playfair text-2xl font-bold text-text-dark"
// Slider input
className="w-full accent-primary"
```

### Footer Icon Strip

- [ ] **Step 6.3: Update footer icon strip cards**

```tsx
className={`bg-white rounded-2xl border border-warm-border shadow-[0_2px_8px_rgba(92,15,15,0.05)] p-4 text-center transition-all duration-500 ${
  footerView.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
}`}
style={{ transitionDelay: `${i * 100}ms` }}
```

Icon box: `className="w-10 h-10 bg-primary/[0.08] rounded-xl flex items-center justify-center mx-auto mb-3"`  
Icon: `className="text-primary"` (or use `stroke="currentColor"` with `text-primary`)  
Label: `className="text-text-dark text-sm font-semibold"`  
Sub label: `className="text-text-muted text-xs mt-0.5"`

- [ ] **Step 6.4: Type-check and commit**

```bash
npx tsc --noEmit
git add app/packages/page.tsx
git commit -m "feat: restyle packages page with maroon/gold/cream design"
```

---

## Task 7: Restyle Order page (`app/order/page.tsx`)

**Files:**
- Modify: `app/order/page.tsx`

### Step Indicator

- [ ] **Step 7.1: Update step indicator**

```tsx
// Step number circle — active
className="w-7 h-7 rounded-full bg-primary text-gold text-xs font-bold flex items-center justify-center"

// Step number circle — completed
className="w-7 h-7 rounded-full bg-gold text-primary text-xs font-bold flex items-center justify-center"

// Step number circle — pending
className="w-7 h-7 rounded-full bg-warm-border text-text-muted text-xs font-bold flex items-center justify-center"

// Step label — active
className="text-primary text-xs font-semibold uppercase tracking-wide mt-1"

// Step label — pending
className="text-text-muted text-xs uppercase tracking-wide mt-1"
```

### Extras Picker (Step 1)

- [ ] **Step 7.2: Update extras item rows**

Section heading: `className="font-playfair text-xl font-bold text-text-dark border-b border-warm-border pb-3 mb-4"`

Item row:
```tsx
className="bg-white rounded-2xl border border-warm-border shadow-[0_1px_4px_rgba(92,15,15,0.05)] px-4 py-3 flex items-center justify-between mb-2"
```

Item name: `className="text-sm font-semibold text-text-dark"`  
Item sub: `className="text-xs text-text-muted mt-0.5"`

Qty buttons:
```tsx
// Minus / Plus
className="w-7 h-7 bg-primary text-gold rounded-lg text-base font-bold flex items-center justify-center hover:bg-primary-mid transition-colors"

// Count display
className="text-sm font-bold text-text-dark w-5 text-center"
```

### Order Summary Sidebar / Drawer

- [ ] **Step 7.3: Update order summary panel**

Summary header:
```tsx
className="bg-gradient-to-r from-primary to-primary-mid rounded-t-2xl px-5 py-4 flex items-center justify-between"
// Title
className="font-playfair text-white font-bold text-lg"
// Total price
className="text-gold font-bold text-xl"
```

Summary body:
```tsx
className="bg-white rounded-b-2xl border border-warm-border border-t-0 px-5 py-4"
```

Line item price: `className="text-gold font-bold text-sm"`  
Package name: `className="font-playfair font-bold text-text-dark"`

Continue button:
```tsx
className="w-full bg-primary text-gold font-bold py-4 rounded-full shadow-[0_4px_16px_rgba(92,15,15,0.25)] hover:bg-primary-mid transition-colors mt-4"
```

### Details Form (Step 2)

- [ ] **Step 7.4: Update form styles**

Input fields:
```tsx
className="w-full bg-surface border border-warm-border rounded-xl px-4 py-3 text-sm text-text-dark placeholder:text-text-muted focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition"
```

Label: `className="text-text-dark text-sm font-semibold mb-1.5 block"`

Form section heading: `className="font-playfair text-lg font-bold text-text-dark mb-4"`

Submit button: same pill style as continue button above.

### Confirmation Screen (Step 3)

- [ ] **Step 7.5: Update confirmation screen**

Success icon container:
```tsx
<div className="w-16 h-16 bg-gold/[0.12] border-2 border-gold/30 rounded-full flex items-center justify-center mx-auto mb-5">
  <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
</div>
```

Confirmation panel:
```tsx
className="bg-gradient-to-br from-primary to-primary-light rounded-2xl p-6 text-center"
```

Booking ID: `className="text-gold font-bold font-playfair text-xl"`

- [ ] **Step 7.6: Type-check and commit**

```bash
npx tsc --noEmit
git add app/order/page.tsx
git commit -m "feat: restyle order page with maroon/gold/cream design"
```

---

## Task 8: Restyle Admin portal (`app/admin/page.tsx`)

**Files:**
- Modify: `app/admin/page.tsx`

Admin uses the same maroon/gold theme as the public site (Option A from design spec).

### Header

- [ ] **Step 8.1: Update admin header**

Header wrapper (already maroon from previous session — verify and update to new tokens):
```tsx
className="bg-gradient-to-r from-primary via-primary-mid to-primary-mid border-b border-white/10 shadow-lg"
```

Avatar box:
```tsx
className="w-9 h-9 bg-gold/[0.18] border border-gold/30 rounded-xl flex items-center justify-center"
// Letter inside
className="font-playfair text-gold font-bold text-base"
```

Title: `className="font-playfair text-white font-bold text-base"`  
Subtitle: `className="text-white/40 text-xs"`

Hamburger button:
```tsx
className="w-9 h-9 bg-white/[0.08] border border-white/[0.12] rounded-lg flex flex-col items-center justify-center gap-1 hover:bg-white/15 transition-colors"
```

### Tab Bar

- [ ] **Step 8.2: Update tab pills inside header**

Tab bar wrapper:
```tsx
className="flex gap-2 px-4 pb-3 overflow-x-auto"
```

Active tab:
```tsx
className="bg-gold/[0.18] border border-gold/30 text-gold text-xs font-semibold px-4 py-2 rounded-full whitespace-nowrap transition-colors"
```

Inactive tab:
```tsx
className="bg-white/[0.06] text-white/45 text-xs px-4 py-2 rounded-full whitespace-nowrap hover:bg-white/10 hover:text-white/70 transition-colors cursor-pointer"
```

### Login Card

- [ ] **Step 8.3: Update login card**

Login card wrapper (preserve `heroFadeUp` animation):
```tsx
className="bg-white rounded-2xl shadow-[0_8px_32px_rgba(92,15,15,0.15)] border border-warm-border p-8 w-full max-w-sm mx-auto"
```

Logo in login:
```tsx
<div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-light rounded-2xl flex items-center justify-center mx-auto mb-5">
  <span className="font-playfair text-gold font-bold text-2xl">A</span>
</div>
```

PIN input:
```tsx
className="w-full bg-warm-bg border border-warm-border rounded-xl px-4 py-3 text-center text-xl font-bold text-text-dark tracking-[0.5em] focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition"
```

Login button:
```tsx
className="w-full bg-primary text-gold font-bold py-3 rounded-full shadow-[0_4px_16px_rgba(92,15,15,0.25)] hover:bg-primary-mid transition-colors"
```

### Dashboard Welcome Banner

- [ ] **Step 8.4: Update dashboard welcome banner**

```tsx
<div className="bg-gradient-to-r from-primary via-primary-mid to-primary-light rounded-2xl px-6 py-5 flex items-center justify-between relative overflow-hidden shadow-[0_4px_14px_rgba(92,15,15,0.25)] mb-5">
  <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-gold/[0.08] pointer-events-none" />
  <div>
    <h2 className="font-playfair text-2xl font-bold text-white">Good day!</h2>
    <p className="text-white/55 text-sm mt-0.5">Manage your business below</p>
  </div>
  <div className="text-right hidden sm:block">
    <p className="text-gold font-bold text-sm">Ajay Foods</p>
    <p className="text-white/35 text-xs mt-0.5">Owner Dashboard</p>
  </div>
</div>
```

### Stat Cards

- [ ] **Step 8.5: Update stat cards**

Regular stat card:
```tsx
className="bg-white rounded-2xl border border-warm-border shadow-[0_2px_8px_rgba(92,15,15,0.05)] p-4"
// Icon box
className="w-9 h-9 bg-primary/[0.08] rounded-xl flex items-center justify-center mb-3"
// Number
className="font-playfair text-2xl font-bold text-text-dark"
// Label
className="text-text-muted text-xs uppercase tracking-[0.08em] mt-1"
```

Accent stat card (one card in full maroon — e.g. Bookings or quick-action):
```tsx
className="bg-gradient-to-br from-primary to-primary-light rounded-2xl shadow-[0_4px_14px_rgba(92,15,15,0.25)] p-4"
// Icon box
className="w-9 h-9 bg-gold/[0.15] rounded-xl flex items-center justify-center mb-3"
// Number
className="font-playfair text-2xl font-bold text-white"
// Label
className="text-white/50 text-xs uppercase tracking-[0.08em] mt-1"
```

### All Other Admin Tabs (Packages, Menu, Bookings, Charity, Stalls, Settings)

- [ ] **Step 8.6: Update shared content area patterns used in all tabs**

Content area wrapper (cream bg, tabs animate in with `key={activeTab}` + `heroFadeUp` — preserve):
```tsx
className="bg-warm-bg min-h-screen px-4 py-5"
```

Tab section header row (title + add button):
```tsx
// Heading
className="font-playfair text-xl font-bold text-text-dark"
// Add / primary action button
className="bg-primary text-gold text-xs font-bold px-4 py-2 rounded-full hover:bg-primary-mid transition-colors"
```

Content cards (packages, menu items, bookings, etc.):
```tsx
className="bg-white rounded-2xl border border-warm-border shadow-[0_2px_8px_rgba(92,15,15,0.05)] p-4 mb-3"
```

Item name in cards: `className="font-playfair font-bold text-text-dark"`  
Item meta: `className="text-text-muted text-xs mt-0.5"`  
Price / key value: `className="text-gold font-bold text-sm"`

Edit / Delete pill buttons:
```tsx
// Edit
className="bg-gold/[0.12] border border-gold/25 text-[#8B6A1A] text-xs font-semibold px-3 py-1 rounded-full hover:bg-gold/20 transition-colors cursor-pointer"

// Delete
className="bg-primary/[0.08] border border-primary/15 text-primary text-xs font-semibold px-3 py-1 rounded-full hover:bg-primary/15 transition-colors cursor-pointer"
```

Form inputs inside admin tabs:
```tsx
className="w-full bg-surface border border-warm-border rounded-xl px-4 py-2.5 text-sm text-text-dark placeholder:text-text-muted focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition"
```

Form label: `className="text-text-dark text-xs font-semibold uppercase tracking-wide mb-1.5 block"`

Save / submit button (forms):
```tsx
className="bg-primary text-gold font-bold text-sm px-6 py-3 rounded-full shadow-[0_4px_16px_rgba(92,15,15,0.2)] hover:bg-primary-mid transition-colors"
```

- [ ] **Step 8.7: Type-check and commit**

```bash
npx tsc --noEmit
git add app/admin/page.tsx
git commit -m "feat: restyle admin portal with maroon/gold/cream design"
```

---

## Task 9: Production build verification

- [ ] **Step 9.1: Full type-check**

```bash
npx tsc --noEmit
```

Expected: exit 0, zero errors.

- [ ] **Step 9.2: Production build**

```bash
npm run build
```

Expected: exit 0. Check for any Tailwind purge warnings or class name issues in output.

- [ ] **Step 9.3: Lint**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 9.4: Final commit**

```bash
git add -A
git commit -m "feat: complete full website redesign — maroon/gold/cream theme

- Modular CSS variable design tokens in globals.css
- Semantic Tailwind color names in tailwind.config.ts
- app/lib/theme.ts as typed single source of truth
- All 5 pages restyled: home, menu, packages, order, admin
- Rounded-2xl cards, pill buttons, floating elements, subtle shadows
- All animations preserved (useInView, card tilt, heroFadeUp)"
```

---

## Self-Review

### Spec coverage check
- [x] Color palette (Task 1–3) — all 11 tokens defined
- [x] Typography (Tasks 4–8) — Playfair headings + DM Sans body applied throughout
- [x] Shape language (Tasks 4–8) — rounded-2xl cards, rounded-full pills everywhere
- [x] Shadow system (Tasks 4–8) — maroon-tinted shadows applied to cards, CTAs, panels
- [x] Modular architecture (Tasks 1–3) — theme.ts + CSS vars + Tailwind tokens
- [x] Home page (Task 4) — hero, stats card, packages, features, CTA, footer
- [x] Menu page (Task 5) — hero, floating search, chips, cards, veg indicators
- [x] Packages page (Task 6) — hero, cards, badges, guest slider, footer strip
- [x] Order page (Task 7) — step indicator, extras, summary, form, confirmation
- [x] Admin portal (Task 8) — header, tabs, login, dashboard, all tab content areas
- [x] Animations preserved — noted explicitly in Tasks 5, 6; key={activeTab} in Task 8
- [x] TypeScript gate — tsc --noEmit after every task
- [x] Build verification — Task 9

### No placeholders found — all code blocks are complete.

### Type consistency
- `theme` object keys in `theme.ts` match CSS variable names in `globals.css` ✓
- Tailwind color names (`primary`, `gold`, `warm-bg`, etc.) used consistently across all tasks ✓
- CSS variable names consistent: `--primary`, `--primary-mid`, `--primary-light`, `--gold`, `--gold-light`, `--bg`, `--surface`, `--border`, `--text-dark`, `--text-mid`, `--text-muted` ✓
