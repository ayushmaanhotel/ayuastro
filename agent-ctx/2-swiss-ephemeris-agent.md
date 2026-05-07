# Task 2 - Swiss Ephemeris Integration Agent

## Task: Rewrite calculator.ts to use Swiss Ephemeris for high-accuracy planetary positions

## Work Completed

### Files Modified
1. **types.ts** - Added 3 new optional fields to `PlanetPosition`:
   - `eclipticLatitude?: number` - Ecliptic latitude in degrees from Swiss Ephemeris
   - `speed?: number` - Daily longitudinal speed (negative = retrograde)
   - `distanceAU?: number` - Distance from Earth in astronomical units

2. **swiss-ephemeris.ts** (NEW) - Swiss Ephemeris wrapper module:
   - `initSweph()` - Async lazy initialization with graceful fallback
   - `isSwephReady()` - Sync readiness check
   - `swephCalcPlanet()` - Single planet calc with SEFLG_MOSEPH | SEFLG_SPEED
   - `swephCalcAllPlanets()` - All 9 Vedic planets
   - `swephCalcHouses()` - Whole Sign houses via houses_ex2
   - `swephGetAyanamsa()` - Lahiri ayanamsa via SE_SIDM_LAHIRI
   - `swephDateToJD()` - Date-to-JD via utc_to_jd
   - SE_MEAN_NODE for Rahu; Ketu = Rahu + 180°

3. **calculator.ts** (REWRITTEN) - Dual-path architecture:
   - Swiss Ephemeris primary path (arc-minute accuracy)
   - Meeus fallback path (~1-3° accuracy) preserved as private functions
   - All original exported signatures unchanged
   - New exports: `initializeSwissEphemeris()`, `isSwissEphemerisReady()`
   - Auto-initialization on module load
   - Retrograde from actual speed (not elongation heuristic)
   - Ascendant from houses_ex2 (not manual LST formula)
   - Ayanamsa from get_ayanamsa_ut (not approximate formula)

## Key Decisions
- `get_ayanamsa_ut()` returns a number directly (not `{data}` object) - handled with type check
- SE_MEAN_NODE used for Rahu (Vedic standard, not true node)
- Ketu latitude inverted from Rahu's latitude
- Async init pattern with lazy loading to avoid blocking server startup
- All Meeus functions preserved as private fallbacks for environments where native module can't load

## Verification
- `bun run lint` passes with zero errors
- Swiss Ephemeris directly tested with node - returns accurate positions
- Backward compatibility maintained - all downstream modules (yogas, doshas, dasha, charts) work unchanged
