# Task 1: Fix Deep Intelligence Report

## Agent
Main Developer

## Task
Fix the Deep Intelligence Report to include full planetary positions and auto-trigger for premium users.

## Work Log

### 1. Updated AIReportInput type (`src/lib/ai/types.ts`)
- Added `PlanetaryPosition` interface with: sign, degree, house, retrograde, nakshatra, nakshatraPada, isCombust
- Added optional `planetaryPositions` field to `AIReportInput`: `Record<string, PlanetaryPosition>`
- Exported `PlanetaryPosition` from index.ts

### 2. Updated Deep Intelligence API route (`src/app/api/ai/deep-intelligence/route.ts`)
- Added `planetaryPositionSchema` Zod schema matching the PlanetaryPosition type
- Added `planetaryPositions` as optional field in `deepIntelligenceSchema.astrologyData`
- Pass `planetaryPositions` from parsed data through to `AIReportInput`

### 3. Updated AI prompts (`src/lib/ai/prompts.ts`)
- Added `formatPlanetaryPositions()` helper function to format planet data as human-readable text
- Added `getOrdinal()` helper for house number suffixes (1st, 2nd, 3rd, etc.)
- Updated `buildReportPrompt()` to include planetary positions section when available
- Updated `buildDeepIntelligencePrompt()` to include:
  - Full planetary positions table with degree, house, nakshatra, retrograde, combust
  - Critical instructions for AI to reference house placements and nakshatras
  - Planetary highlights summary (retrograde and combust planets)
  - Requirement #10: Reference specific house placements and nakshatras throughout
- Updated `buildSectionPrompt()` to include planetary positions when available
- Updated `getSystemPrompt()` to include ASTROLOGICAL FOUNDATION section:
  - Swiss Ephemeris with Lahiri ayanamsa
  - Parashari system of Vedic astrology
  - Whole Sign house system
  - Nakshatra, retrograde, and combust interpretive guidance
- Updated `getDeepIntelligenceSystemPrompt()` with same ASTROLOGICAL FOUNDATION plus:
  - Must-reference nakshatra mythological significance
  - Retrograde = internalized expression explanation
  - Combust = weakened confidence explanation
  - Parashari principles of dignity, lordship, and aspects

### 4. Updated ReportView.tsx (`src/components/ayuastro/report/ReportView.tsx`)
- Added `planetaryPositions: astrologyData.planetaryPositions` to deep intelligence API call body
- Added auto-trigger useEffect for premium users:
  - Checks `hasPaid` is true
  - Checks `reportSections.length < 12` (no deep report yet)
  - Checks required data is available (userId, astrologyData, numerologyData)
  - Checks not already generating (`deepReportGenerating`)
  - Uses `autoTriggerRef` to prevent re-triggering
  - 1.5s delay before triggering to let view render first

### 5. Made report-generator.ts more robust (`src/lib/ai/report-generator.ts`)
- Added `tryExtractFromRawText()` fallback function:
  - Tries to find embedded JSON in raw AI response
  - Falls back to regex-based section extraction from markdown text
  - Returns partial report if any sections can be recovered
- Updated `parseAIResponse()` to call `tryExtractFromRawText()` on JSON parse failure
- Added timeout to `withRetry()`: 2-minute timeout per attempt via `Promise.race`
- Added warning log on each retry attempt
- Reduced batch size from 4 to 3 (`BATCH_SIZE = 3`)
- Added detailed logging throughout `generateDeepIntelligenceReport()`:
  - Start: logs input data summary and planetary positions availability
  - Free sections: logs completion time
  - Each premium batch: logs batch number, section IDs, completion time, running total
  - Fallback: logs when falling back to individual section generation
  - End: logs total sections generated and total time

## Files Modified
1. `/home/z/my-project/src/lib/ai/types.ts` - Added PlanetaryPosition interface and planetaryPositions field
2. `/home/z/my-project/src/app/api/ai/deep-intelligence/route.ts` - Added Zod schema and pass-through
3. `/home/z/my-project/src/lib/ai/prompts.ts` - Added planetary position formatting and prompt updates
4. `/home/z/my-project/src/components/ayuastro/report/ReportView.tsx` - Auto-trigger + planetaryPositions in API call
5. `/home/z/my-project/src/lib/ai/report-generator.ts` - Robust error handling, timeout, batch size 3, logging
6. `/home/z/my-project/src/lib/ai/index.ts` - Export PlanetaryPosition type

## Stage Summary
- Deep Intelligence Report now receives full planetary positions with houses, signs, degrees, nakshatras, retrograde status, and dignity
- AI prompts instruct the model to reference specific house placements and nakshatras using Swiss Ephemeris calculated data
- System prompts emphasize Parashari Vedic astrology tradition and Swiss Ephemeris accuracy
- Premium users get auto-triggered deep report generation
- Report generator is more robust with fallback text extraction, timeout per batch, reduced batch size, and detailed logging
- Lint passes with zero errors
