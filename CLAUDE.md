# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # start dev server (localhost:3000)
npm run build    # production build — also runs tsc; must pass before shipping
npm run lint     # next lint (ESLint)
npx tsc --noEmit # type-check only, no output — run after every edit
```

There are no tests. Type-check (`npx tsc --noEmit`) is the primary correctness gate.

## Architecture

**Stack:** Next.js 14 App Router · TypeScript · Tailwind CSS · localStorage (no backend, no DB).

### Route structure

| Route | File | Role |
|-------|------|------|
| `/` | `app/page.tsx` | Public landing — hero, services, menu highlights, booking form, testimonials |
| `/menu` | `app/menu/page.tsx` | Full menu with search + category + veg/non-veg filters |
| `/packages` | `app/packages/page.tsx` | Package selection with guest-count slider; Suspense-wrapped |
| `/order` | `app/order/page.tsx` | 3-step booking flow (Extras → Details → Confirmation); Suspense-wrapped |
| `/admin` | `app/admin/page.tsx` | PIN-authenticated dashboard with 7 management tabs |

`app/layout.tsx` is the only Server Component — all pages are `"use client"`.

### Data layer (`app/lib/siteData.ts`)

The single source of truth for all mutable data. Admin edits write to localStorage; every customer-facing page reads from it on first render.

**Pattern — lazy state initialiser (not useEffect):**
```tsx
const [packages] = useState(() => getPackages())       // ✓ one render
// not: useEffect(() => setPackages(getPackages()), []) // ✗ extra render
```

**localStorage keys** (bump version suffix when schema changes):
- `ajayfoods_packages_v2` — packages + choiceGroups
- `ajayfoods_menu_v1` — menu sections + items
- `ajayfoods_extras_v1` — extra dish categories
- `ajayfoods_admin_pin` — hashed PIN

`safeRead<T>(key, fallback)` guards every read: returns `fallback` when `window` is undefined (SSR) or JSON is corrupt.

### Admin → customer data flow

```
admin/page.tsx
  └─ setPackages() / setMenuSections() / setExtraCategories()
       └─ localStorage
            ├─ menu/page.tsx    ← getMenuSections()
            ├─ packages/page.tsx ← getPackages()
            └─ order/page.tsx   ← getPackages() + getExtraCategories() + getMenuSections() + addBooking()
```

`app/page.tsx` (home) holds its own static data inline and does **not** read from siteData.

### Booking flow (`app/order/page.tsx`)

Three internal steps controlled by `step: "extras" | "details" | "done"`:
1. **Extras** — `OrderItemPicker` (memoised) + sticky Order Summary sidebar (desktop) / bottom drawer (mobile)
2. **Details** — contact form with phone validation (`/^[6-9]\d{9}$/`)
3. **Done** — confirmation screen; `addBooking()` writes to localStorage

`OrderItemPicker` filter logic: diet filter (Veg/Non-Veg) works **within** section tabs; only a search query collapses sections into a flat list (`isSearching = !!q`).

## Design System

- Primary brown `#8B4513`, dark brown `#5c2a0e`
- Accent gold `#D4A853`
- Background cream `#FDF6EC`
- Amber borders `border-amber-200`, amber bg `bg-amber-50`
- Font: `font-playfair` (Playfair Display) for headings; DM Sans for body
- Always mobile-first; key breakpoints 375 px and 1440 px

## Code Rules

- **No emojis** in code unless already present in existing data constants
- **No inline components** — never define a component inside a render function (`rerender-no-inline-components`)
- **Ternary not `&&`** for JSX conditionals whose left side is non-boolean (`rendering-conditional-render`)
- **`useMemo` for derived state** — do not use `useEffect` + `setState` for values computable from existing state
- **Lazy state initialisers** — pass `() => expensiveFn()` to `useState`; avoid loading side-effects in `useEffect`
- **`useEffect` minimal** — scroll listeners, timers, and DOM mutations only

## Active Skills

- **react-best-practices** (`vercel-react-best-practices`) — 68 rules in `.claude/skills/react-best-practices/AGENTS.md`. Apply when writing or refactoring any component.
