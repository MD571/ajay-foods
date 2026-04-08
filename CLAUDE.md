# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # start dev server (localhost:3000)
npm run build    # production build — also runs tsc; must pass before shipping
npm run lint     # next lint (ESLint)
npx tsc --noEmit # type-check only, no output — run after every edit

# Code graph (runs automatically after every edit via PostToolUse hook)
code-review-graph update   # incremental graph update
code-review-graph build    # full rebuild
code-review-graph status   # node/edge counts
code-review-graph visualize # regenerate code-graph.html
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

---

## Design System

### Color Palette (saffron-red theme — updated from coffee-brown)

| Token | Value | Usage |
|-------|-------|-------|
| Primary | `#D4380D` | Buttons, headings, active states, borders |
| Dark primary | `#8B1A0F` | Order summary header, dark sections |
| Very dark | `#5C1209` | Hero gradient start |
| Mid | `#9E2D1A` | Gradient mid points |
| Light | `#E5622B` | Gradient end, hover states |
| Accent gold | `#D4A853` | Highlights, prices, underlines |
| Background | `#FFF8F5` | Page background (warm white) |
| Border | `#FFE0D4` | Card borders, dividers |
| Border light | `#FFD0C0` | Subtle borders, inputs |

### Tailwind Equivalents

- `border-red-100 / border-red-200 / border-red-300` — card and input borders
- `bg-red-50 / bg-red-100` — section backgrounds, hover states
- `text-red-600 / text-red-700` — section labels, metadata

### Typography & Spacing

- Font: `font-playfair` (Playfair Display) for headings; DM Sans for body
- Always mobile-first; key breakpoints 375 px and 1440 px

---

## Code Rules

- **No emojis** in code unless already present in existing data constants
- **No inline components** — never define a component inside a render function (`rerender-no-inline-components`)
- **Ternary not `&&`** for JSX conditionals whose left side is non-boolean (`rendering-conditional-render`)
- **`useMemo` for derived state** — do not use `useEffect` + `setState` for values computable from existing state
- **Lazy state initialisers** — pass `() => expensiveFn()` to `useState`; avoid loading side-effects in `useEffect`
- **`useEffect` minimal** — scroll listeners, timers, and DOM mutations only
- **`memo()` on all tab components** — all admin tab components are wrapped in `React.memo`
- **`useCallback` for callbacks passed to memoised children** — prevents unnecessary re-renders
- **Functional `setState`** — always use `setState(prev => ...)` form when new state depends on previous

---

## Active Skills

Skills live in `.claude/skills/` and are loaded automatically by Claude Code.

### react-best-practices (`vercel-react-best-practices`)
- **File:** `.claude/skills/react-best-practices/SKILL.md`
- **Full rules:** `.claude/skills/react-best-practices/AGENTS.md` (68 rules, 3 700 lines)
- **Trigger:** Any React component write, refactor, or review
- **Key rules for this project:** `rerender-no-inline-components`, `rendering-conditional-render`, `rerender-memo`, `rerender-lazy-state-init`, `rerender-functional-setstate`, `js-combine-iterations`

### code-reviewer
- **File:** `.claude/skills/code-reviewer/SKILL.md`
- **Scripts:** `pr_analyzer.py`, `code_quality_checker.py`, `review_report_generator.py`
- **Trigger:** PR reviews, code quality checks, security scanning

### frontend-design
- **File:** `.claude/skills/frontend-design/SKILL.md`
- **Trigger:** Building new UI components or pages

### ui-ux-pro-max
- **File:** `.claude/skills/ui-ux-pro-max/SKILL.md`
- **Data:** 50 styles, 21 palettes, 50 font pairings, 20 charts (CSV files in `data/`)
- **Trigger:** Design system decisions, component styling, layout reviews

### owasp-security
- **File:** `.claude/skills/owasp-security/SKILL.md`
- **Trigger:** Auth, input handling, security review, OWASP Top 10 checks

---

## MCP Servers

Configured in `.mcp.json` — loaded automatically when Claude Code starts.

### code-review-graph
- **Command:** `code-review-graph serve`
- **Graph DB:** `.code-review-graph/graph.db` (SQLite, local only)
- **Stats:** ~291 nodes · ~1 131 edges · 10 files (TSX/TS/JS)
- **Auto-update:** PostToolUse hook fires `code-review-graph update` after every Write/Edit/Bash (async, silent)

**Available MCP tools (26):**

| Tool | Use |
|------|-----|
| `get_minimal_context` | Always call first — full picture in ~100 tokens |
| `detect_changes` | Risk-scored impact analysis before reviewing |
| `get_impact_radius` | Blast radius of a changed file |
| `get_review_context` | Token-optimised context for a specific change |
| `query_graph` | Callers, callees, tests, imports for any node |
| `semantic_search_nodes` | Search by name or meaning |
| `find_large_functions` | Functions exceeding a line threshold |
| `get_architecture_overview` | Auto-generated architecture map |
| `list_flows` / `get_flow` | Execution flows by criticality |
| `list_communities` / `get_community` | Logical code clusters |
| `refactor_tool` / `apply_refactor` | Rename preview + dead code |
| `generate_wiki` / `get_wiki_page` | Markdown wiki from communities |
| `build_or_update_graph` | Rebuild graph |
| `list_graph_stats` | Node/edge counts |

**Usage rule:** Always call `get_minimal_context` first (≤5 tool calls per task, ≤800 total tokens).

**Slash commands:**
- `/code-review-graph:build-graph` — rebuild
- `/code-review-graph:review-delta` — review uncommitted changes
- `/code-review-graph:review-pr` — full PR review with blast-radius

---

## Hooks (`.claude/settings.local.json`)

| Event | Matcher | Command |
|-------|---------|---------|
| `PostToolUse` | `Write\|Edit\|Bash` | `code-review-graph update 2>/dev/null \|\| true` (async) |

---

## Project Tooling Files

| File | Purpose |
|------|---------|
| `.mcp.json` | MCP server config — `code-review-graph serve` |
| `.claude/settings.local.json` | Hooks + permissions (gitignored, local only) |
| `.claude/skills/` | Skill definitions loaded by Claude Code |
| `.code-review-graph/graph.db` | SQLite graph database (gitignored) |
| `code-graph.html` | Interactive D3.js visualisation (gitignored, regenerate with `code-review-graph visualize`) |
| `skills-lock.json` | Skill version lock (gitignored) |
