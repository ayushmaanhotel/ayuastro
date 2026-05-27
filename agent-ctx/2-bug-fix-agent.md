# Task 2 — Bug Fix Agent Work Record

## Task: Fix 4 critical runtime bugs

### Bugs Fixed

1. **BarChart3 is not defined** — Replaced `BarChart3` with `BarChart2` in InsightsView.tsx and TraitDashboardView.tsx
2. **Recharts ReferenceLine error** — Changed `LineChart` to `AreaChart` in TraitDashboardView.tsx (Area component needs AreaChart context)
3. **Logo SVG LCP Warning** — Added `priority` prop to Image component in Header.tsx
4. **onExitStart unknown event handler** — Added explicit `key` props to 6 AnimatePresence children across 6 files

### Files Modified
- `src/components/ayuastro/insights/InsightsView.tsx` — BarChart3 → BarChart2
- `src/components/ayuastro/dashboard/TraitDashboardView.tsx` — BarChart3 → BarChart2, LineChart → AreaChart
- `src/components/ayuastro/shared/Header.tsx` — priority prop, key="mood-dot"
- `src/app/page.tsx` — key="shimmer"
- `src/components/ayuastro/chat/ChatView.tsx` — key="suggestions"
- `src/components/ayuastro/sync/SyncView.tsx` — key="sign-dropdown", key="compat-result"
- `src/components/ayuastro/wellness/CosmicSoundsView.tsx` — key="rain-overlay", key="cosmic-overlay"
- `src/components/ayuastro/wellness/BreathingView.tsx` — key="meditation-overlay"

### Verification
- `bun run lint` passes with zero errors
