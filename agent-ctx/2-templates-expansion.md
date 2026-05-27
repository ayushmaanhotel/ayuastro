# Task ID: 2 - AI Templates Expansion Agent

## Task
Completely rewrite `/home/z/my-project/src/lib/ai/templates.ts` to expand from 7 sections to 15+ sections with deeply comprehensive, brutally honest guidance.

## Work Log

### What Was Done
1. **Read existing files** — Reviewed `templates.ts`, `types.ts`, `prompts.ts`, `index.ts` to understand current structure and interfaces
2. **Wrote complete expanded `templates.ts`** — 15 sections total (3 free + 12 premium)
3. **Updated `prompts.ts`** — Changed word count references from "150-250 words" to "200-300 words for free, 300-500 words for premium"
4. **Updated `index.ts`** — Added `getDeepIntelligenceTemplates` to exports
5. **Verified lint** — Zero errors

### Section Summary

**Free Sections (3) — expanded guidance:**
1. `emotional-personality` — "Your Emotional Truth" (Heart icon)
2. `relationship-style` — "Your Relationship Reality" (Users icon)
3. `communication-patterns` — "How You Really Communicate" (MessageCircle icon)

**Premium Sections (12) — 4 expanded + 8 new:**
4. `hidden-strengths` — "Powers You Don't Know You Have" (Sparkles icon) — EXPANDED
5. `emotional-blind-spots` — "What You Refuse to See" (Eye icon) — EXPANDED
6. `money-psychology` — "Your Money Story — The Whole Truth" (Wallet icon) — EXPANDED
7. `recurring-life-patterns` — "Patterns That Keep Repeating" (RotateCw icon) — EXPANDED
8. `your-dark-side` — "Your Shadow Self" (Ghost icon) — NEW
9. `love-heartbreak-timeline` — "Your Love & Heartbreak Timeline" (HeartCrack icon) — NEW
10. `career-truth` — "What You're Actually Meant to Do" (Briefcase icon) — NEW
11. `family-karma` — "What You Inherited From Your Family" (Home icon) — NEW
12. `health-warnings` — "What Your Body Is Prone To" (HeartPulse icon) — NEW
13. `life-phase-roadmap` — "Your Life Phase Roadmap" (Map icon) — NEW
14. `financial-timeline` — "When Money Flows & When It Doesn't" (BarChart3 icon) — NEW
15. `spiritual-purpose` — "Why Your Soul Chose This Life" (Flame icon) — NEW

### Helper Functions Added
- `getFreeTemplates()` — returns free templates (3 sections)
- `getPremiumTemplates()` — returns premium templates only (12 sections)
- `getTemplateById(id)` — find template by id
- `getSectionOrder()` — returns ordered section ids
- `getDeepIntelligenceTemplates()` — returns ALL premium templates for the deep intelligence report

### Key Design Decisions
- All guidance uses HUMAN, CONVERSATIONAL tone — "like a wise friend who tells you the truth even when it hurts"
- "Nothing to hide" mentality — no sugarcoating, direct naming of patterns
- Life-phase sections explicitly break down by age ranges: 20s, 30s, 40s, 50s, 60s+
- Timeline sections instruct AI to give YEAR ranges based on dasha data
- Every section references specific data points (planet positions, trait scores, dasha periods, numerology)
- Premium sections have 300-500 word guidance vs. free sections at 200-300 words
- All icons verified to exist in the project's lucide-react installation

### Files Modified
- `/home/z/my-project/src/lib/ai/templates.ts` — Complete rewrite (7→15 sections)
- `/home/z/my-project/src/lib/ai/prompts.ts` — Updated word count guidelines (3 locations)
- `/home/z/my-project/src/lib/ai/index.ts` — Added `getDeepIntelligenceTemplates` export

### Lint Status
✅ Zero errors
