# Task 6: Guided Breathing & Meditation Feature

## Agent: Breathing & Meditation Agent

## Work Log:

### Created Files
- `/src/components/ayuastro/wellness/BreathingView.tsx` — Complete breathing & meditation component

### Modified Files
- `/src/store/ayuastro-store.ts` — Added 'breathing' to AppView type
- `/src/app/page.tsx` — Imported BreathingView, added 'breathing' case to renderView switch, added 'breathing' to showBottomNav conditions
- `/src/components/ayuastro/shared/ProfileView.tsx` — Added Wind icon import, added "Breathing & Meditation" entry card with gradient background and "Find your cosmic calm" subtitle
- `/src/components/ayuastro/shared/BottomNav.tsx` — Added 'breathing' to visibleViews array

### BreathingView.tsx Features

1. **Breathing Exercise Section** — 3 breathing techniques:
   - "Cosmic Calm" (4-7-8 breathing): 4s inhale, 7s hold, 8s exhale — for anxiety/stress
   - "Moon Rhythm" (4-4-4-4 box breathing): 4s each phase — for focus/clarity
   - "Solar Breath" (6-2-6 breathing): 6s inhale, 2s hold, 6s exhale — for emotional balance
   - Technique selector with pill-style buttons showing emoji + name + subtitle
   - Each technique has description text and distinct gradient color

2. **Animated Breathing Circle** (`BreathingCircleWithControls`):
   - 200px central circle with gold-to-sage gradient that pulses with breath phases
   - 210px outer glow ring with radial gradient animation
   - 6 orbiting particles around the circle that animate with opacity/scale
   - Phase label text inside ("Breathe In", "Hold", "Breathe Out")
   - Countdown timer showing seconds remaining in current phase
   - Cycle counter (Badge component) showing completed rounds
   - Play/pause button (gold, round) and reset button (RotateCcw icon)
   - `animate-breathe-glow` CSS class for glow effect
   - Smooth framer-motion scale transitions timed to phase durations
   - Component uses `key={selectedTechnique.id}` to reset state on technique change

3. **Quick Meditation Cards** — 4 meditation cards:
   - "Morning Intention" (2 min) — Sun icon, 🌅 emoji, daily cosmic intention
   - "Emotional Release" (3 min) — Heart icon, 🕊️ emoji, letting go of trapped emotions
   - "Gratitude Flow" (2 min) — Sparkles icon, 🙏 emoji, appreciation meditation
   - "Sleep Harmony" (5 min) — BedDouble icon, 🌙 emoji, pre-sleep relaxation
   - 2x2 grid layout with gradient backgrounds, emoji, title, description, duration badge, start button
   - When started, shows a full-screen MeditationOverlay with:
     - Dark background (brown-900/95)
     - Animated breathing orb (radial gradient, scale/opacity pulsing on 8s cycle)
     - Inner glow orb with separate animation
     - Circular SVG progress indicator (52px radius, gold stroke)
     - Countdown timer (MM:SS format)
     - Pause/Resume toggle
     - "Namaste ✦" completion message when timer reaches 0

4. **Daily Mindfulness Prompt**:
   - Deterministic daily prompt based on day-of-year + sun sign
   - 144 total prompts (12 per zodiac sign × 12 signs)
   - Each sign has 12 unique, psychologically grounded mindfulness prompts
   - Decorative card with gradient top accent bar (gold → sage → gold-dark)
   - Zodiac sign badge, "Today's cosmic guidance" label
   - Prompt displayed in serif font with quotation marks
   - "I Practiced Today" button with success animation (CheckCircle2 icon, sage color)
   - `zodiac-corner` class for decorative ✦ symbols

### Styling Details
- Cream background (`bg-cream`, `dark:bg-[#1a1410]`)
- Gold and sage accent colors throughout
- Cards use `shadow-md` and `card-hover` class
- `animate-breathe-glow` on the breathing circle for glow effect
- `brown-900` for headings, `brown-400` for descriptions in both light/dark
- `dark:bg-white/5` for all cards
- `dark:bg-brown-50/20` for grid items and icon backgrounds
- Premium, cinematic feel matching the rest of the app
- Responsive 2-column grid for meditation cards
- Back button navigates to 'profile' view
- Full dark mode support on all elements

### Integration
- Added 'breathing' to AppView type union
- Added 'breathing' case to renderView switch in page.tsx
- Added 'breathing' to showBottomNav conditions
- Added 'breathing' to BottomNav visibleViews
- Added entry card in ProfileView between Mood Journal and Cosmic Age cards
- Uses Wind icon from lucide-react for the entry card

### Lint Status
- Zero errors, zero warnings
- All files pass ESLint check
