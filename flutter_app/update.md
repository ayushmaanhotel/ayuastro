# AyuAstro App Updates

## Aesthetic & Icon Updates (May 30, 2026)
- **App Icon Updated**: Successfully updated the app icon using `flutter_launcher_icons` and the provided image file (`ayuastro_app_icon_1780152727874.png`). Configured the `flutter_icons` node in `pubspec.yaml` to overwrite both iOS and Android default icons.
- **Color Theme Modernized**: Upgraded the app's core background colors `AppColors.cream` and `AppColors.creamDark` in `lib/widgets/custom_widgets.dart` to a premium beige palette (`#FAF6F0` and `#F1EAE0`) to give the entire app a high-end, elegant aesthetic.
- **Text Alignment and Layout Improvements**:
  - Restructured the Hero Section in `lib/screens/landing_screen.dart`.
  - Improved letter spacing, font weight (`w800` for headers), and line heights (`1.2` for titles, `1.6` for subtitles) to ensure perfect reading rhythm and symmetry.
  - Added horizontal padding to description texts for balanced alignment and preventing edge overflow.
  - Centered typographic alignments were refined and contrasting colors (`white70`, `brown700`) were tweaked to ensure a polished look across both light and dark modes.

## Premium Report UI & PDF Overhaul (June 2026)
- **Mobile Overflow Fixes (Flutter)**: 
  - Fixed TextOverflow and out-of-bounds UI issues in `insights_screen.dart`, `dashboard_screen.dart`, `custom_widgets.dart`, and `pdf_viewer_screen.dart`.
  - Safely wrapped nested Rows and Texts with `Expanded` and `Flexible` widgets, and added constraints to animations/buttons to ensure the layout handles very small screens.
- **Premium Intelligence PDF Refactor (Backend)**: 
  - Complete overhaul of `src/app/api/reports/generate-pdf/route.ts`.
  - Added a "Nothing to Hide" Truth Disclosure transparency page outlining the nature of Vedic Sidereal shifts vs Tropical, free will vs determinism, and fear-based marketing.
  - Implemented an elegant Emotional Trait Radar Chart leveraging `pdfkit` geometric path drawing (`doc.moveTo`, `doc.circle`).
  - Added formatted Numerology and Vedic Astrology summary tables with alternating row colors and gold/brown accents.
  - Addressed blank page issues by properly tracking `doc.y` against page boundaries and injecting page breaks appropriately.
  - Included dynamic branding and labels specifically acknowledging "DEEPSEEK-V4-FLASH" for hyper-personalized premium segments.
