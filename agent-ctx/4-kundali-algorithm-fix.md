# Task 4: Kundali Algorithm Fix

## Summary
Fixed the fundamental bug where planets showed in DIFFERENT houses in different sections of the AyuAstro app.

## Root Cause
Multiple API endpoints independently recalculated kundali from birth details instead of using stored DB data.

## Changes Made

### New File
- `/src/lib/astrology/kundali-provider.ts` — KundaliDataProvider with getKundaliData(), saveKundaliToDb(), getKundaliDataWithSave()

### Modified Files
1. `/src/lib/astrology/types.ts` — HouseData.planets: Planet[] → string[], PlanetPosition.house?: number → house: number
2. `/src/lib/astrology/charts.ts` — Removed `as any[]` cast on planetsInHouse
3. `/src/lib/astrology/calculator.ts` — Added `house: 0` default in both planet builders
4. `/src/app/api/astrology/vedic-analysis/route.ts` — Uses KundaliDataProvider instead of calculateKundali()
5. `/src/app/api/astrology/comprehensive-kundali/route.ts` — Uses KundaliDataProvider, fixed getPlanetHouse()
6. `/src/components/ayuastro/insights/KundaliChart.tsx` — Fixed sign mapping to always use ascendant

## Key Design Decision
All kundali data access now goes through KundaliDataProvider which:
1. Reads stored data from DB (single source of truth)
2. Ensures house fields are populated
3. Only recalculates as fallback
4. Auto-saves recalculated data for future consistency
