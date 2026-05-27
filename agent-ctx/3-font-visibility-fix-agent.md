# Task 3: Font & Visibility Fix Agent

## Task
Fix fonts not visible and card/content visibility issues across the AyuAstro app.

## Work Completed

### 1. Font System Fixes
- **globals.css**: Fixed `.font-serif` fallback from `'Cormorant Garamond'` to `Georgia` and `.font-display` fallback from `'Playfair Display'` to `Georgia`. Fixed h1/h2/h3 base styles to use `var(--font-playfair), Georgia, serif`.
- **Removed 110+ inline fontFamily styles** across 22 component files. All Playfair Display headings now use the `.font-serif` CSS class which references `var(--font-playfair)`.
- **KundaliChart.tsx**: Updated all SVG text fontFamily to use `var(--font-inter)` and `var(--font-playfair)` CSS variables.
- **LandingView.tsx**: Removed redundant inline fontFamily from hero h1.

### 2. Dark Mode Contrast Fixes
- `dark:text-brown-400` → `dark:text-brown-600` (65 instances, 12 files)
- `dark:text-brown-300` → `dark:text-brown-500` (8 instances, 7 files) 
- `dark:text-brown-200` → `dark:text-brown-400` (3 instances)
- `dark:text-brown-100` → `dark:text-brown-600` (28 instances, 22 files)
- `dark:text-brown-50` → `dark:text-brown-900` (16 instances in ComprehensiveKundaliView)
- `dark:bg-white/5` → `dark:bg-white/[0.08]` (21 files)

### 3. Result
- All lint checks pass
- App compiles and loads successfully
- Fonts now render correctly via CSS variables
- Dark mode text is visible with proper contrast ratios
