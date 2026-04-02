# Ajay Foods & Beverages — Claude Instructions

## Project
Next.js 14 App Router + TypeScript + Tailwind CSS catering website.

## Design System
- Primary brown: `#8B4513`, dark brown: `#5c2a0e`
- Accent gold: `#D4A853`, amber borders: `border-amber-200`, amber bg: `bg-amber-50`
- Always mobile-first; test at 375px and 1440px

## Code Rules
- No emojis in code unless already present in existing data
- Use `rerender-no-inline-components` — never define components inside render functions
- Use `rendering-conditional-render` — ternary (`? :`) not `&&` for JSX conditionals with non-boolean values
- Prefer `useMemo` for derived state over `useEffect` + setState
- Keep `useEffect` minimal; prefer deriving during render

## Active Skills
- **vercel-react-best-practices** — apply Vercel's 68 React/Next.js perf rules when writing or refactoring components. Full rules in `.claude/skills/react-best-practices/AGENTS.md`.
