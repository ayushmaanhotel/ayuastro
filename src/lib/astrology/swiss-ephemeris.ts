/**
 * AyuAstro - Swiss Ephemeris Wrapper Module
 *
 * Professional-grade planetary calculations using the Swiss Ephemeris (sweph).
 * Uses the built-in Moshier ephemeris (SEFLG_MOSEPH) so no external data files
 * are needed, while still providing arc-minute level accuracy — far superior to
 * the simplified Meeus approximations (~1-3° error).
 *
 * IMPORTANT: This module uses native N-API bindings and CANNOT be imported in
 * client-side code. Only use from API routes or server components.
 *
 * NOTE: The sweph native module may not work in all Next.js runtime environments
 * (e.g., Turbopack dev server). In such cases, the initSweph() function will
 * return { ready: false } and the Meeus fallback will be used instead.
 */

import type { Planet } from './types';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface SwephPlanetResult {
  /** Tropical ecliptic longitude 0-360° */
  longitude: number;
  /** Ecliptic latitude in degrees */
  latitude: number;
  /** Distance in AU */
  distanceAU: number;
  /** Longitudinal speed in degrees/day (negative = retrograde) */
  lonSpeed: number;
  /** Latitudinal speed in degrees/day */
  latSpeed: number;
  /** Distance speed in AU/day */
  distSpeed: number;
}

export interface SwephHousesResult {
  /** Ascendant longitude (tropical) */
  ascendant: number;
  /** Midheaven (MC) longitude (tropical) */
  mc: number;
  /** 12 house cusp longitudes (tropical) */
  houses: number[];
}

export interface SwephInitResult {
  ready: boolean;
  version?: string;
  error?: string;
}

// ─── Module Loading ─────────────────────────────────────────────────────────

/** Cached sweph module reference */
let swephModule: typeof import('sweph') | null = null;
let initResult: SwephInitResult | null = null;
type SwephConstants = typeof import('sweph')['constants'];

/**
 * Lazily load and initialize the sweph native module.
 * Returns an init result indicating whether the module is ready.
 * 
 * This function is designed to be resilient - if the native module
 * cannot be loaded (e.g., due to ABI mismatch or runtime restrictions),
 * it gracefully returns { ready: false } without crashing.
 */
export async function initSweph(): Promise<SwephInitResult> {
  if (initResult !== null) return initResult;

  try {
    // Use require() instead of dynamic import() for better compatibility
    // with Next.js server-side rendering
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const loadedSweph = require('sweph') as typeof import('sweph');
    swephModule = loadedSweph;

    // Test that the module actually works by calling a simple function
    const { utc_to_jd, constants } = loadedSweph;
    const testResult = utc_to_jd(2000, 1, 1, 12, 0, 0, constants.SE_GREG_CAL);
    if (!testResult || !testResult.data) {
      throw new Error('sweph utc_to_jd returned unexpected result');
    }

    initResult = {
      ready: true,
      version: '2.10.3',
    };
    console.log('[SwissEph] Initialized successfully - using Swiss Ephemeris for high-accuracy calculations');
    return initResult;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    // ═══════════════════════════════════════════════════════════════════════
    // ⚠️  CRITICAL WARNING: Swiss Ephemeris FAILED to load!
    // ═══════════════════════════════════════════════════════════════════════
    // This means the app is using Meeus fallback calculations which have
    // ~1-3° error. This is UNACCEPTABLE for a Vedic astrology app that
    // claims "arc-level accuracy". Planet sign placements may be WRONG.
    // ═══════════════════════════════════════════════════════════════════════
    console.error('╔══════════════════════════════════════════════════════════════════╗');
    console.error('║  ⚠️  Swiss Ephemeris FAILED to load!                            ║');
    console.error('║  Calculations will use Meeus fallback (~1-3° error).            ║');
    console.error('║  Planet sign placements may be INCORRECT at sign boundaries.    ║');
    console.error('║  This is a CRITICAL issue for a Vedic astrology application.     ║');
    console.error('╚══════════════════════════════════════════════════════════════════╝');
    console.error(`[SwissEph] Error: ${errorMsg}`);
    console.error('[SwissEph] The sweph native module could not be loaded. Possible causes:');
    console.error('[SwissEph]   1. N-API binary not compiled for this platform');
    console.error('[SwissEph]   2. Turbopack dev mode incompatible with native modules');
    console.error('[SwissEph]   3. Missing sweph package or corrupted installation');
    console.error('[SwissEph] Action: Run `npm rebuild sweph` or switch to webpack dev mode');
    swephModule = null;
    initResult = {
      ready: false,
      error: errorMsg,
    };
    return initResult;
  }
}

/**
 * Synchronous check if sweph module has been initialized and is ready.
 * Call initSweph() first.
 */
export function isSwephReady(): boolean {
  return initResult?.ready === true && swephModule !== null;
}

// ─── Planet ID Mapping ─────────────────────────────────────────────────────

/** Map our planet names to Swiss Ephemeris planet IDs */
function getSwephPlanetId(planet: Planet, constants: SwephConstants): number {
  switch (planet) {
    case 'Sun':     return constants.SE_SUN;
    case 'Moon':    return constants.SE_MOON;
    case 'Mars':    return constants.SE_MARS;
    case 'Mercury': return constants.SE_MERCURY;
    case 'Jupiter': return constants.SE_JUPITER;
    case 'Venus':   return constants.SE_VENUS;
    case 'Saturn':  return constants.SE_SATURN;
    case 'Rahu':    return constants.SE_MEAN_NODE; // Vedic standard: mean node
    case 'Ketu':    return constants.SE_MEAN_NODE; // Ketu = Rahu + 180°
    default:        return constants.SE_SUN;
  }
}

// ─── Core Calculation Functions ─────────────────────────────────────────────

/**
 * Calculate a single planet's position using Swiss Ephemeris.
 *
 * @param jd_et - Julian Day (Ephemeris Time / Terrestrial Time)
 * @param planet - Planet name from our type system
 * @returns Position data including longitude, latitude, distance, speeds
 */
export function swephCalcPlanet(jd_et: number, planet: Planet): SwephPlanetResult {
  if (!swephModule) {
    throw new Error('sweph module not initialized. Call initSweph() first.');
  }

  const { calc, constants } = swephModule;
  const planetId = getSwephPlanetId(planet, constants);
  const flags = constants.SEFLG_MOSEPH | constants.SEFLG_SPEED;

  const result = calc(jd_et, planetId, flags);

  if (!result || !result.data || result.data.length < 6) {
    throw new Error(`sweph calc failed for planet ${planet}`);
  }

  const [longitude, latitude, distanceAU, lonSpeed, latSpeed, distSpeed] = result.data;

  // For Ketu, the longitude is Rahu's longitude + 180°
  if (planet === 'Ketu') {
    const ketuLon = ((longitude + 180) % 360 + 360) % 360;
    return {
      longitude: ketuLon,
      latitude: -latitude, // Ketu's latitude is opposite to Rahu's
      distanceAU,
      lonSpeed: lonSpeed, // Same speed as Rahu (retrograde)
      latSpeed: -latSpeed,
      distSpeed,
    };
  }

  return {
    longitude: ((longitude % 360) + 360) % 360,
    latitude,
    distanceAU,
    lonSpeed,
    latSpeed,
    distSpeed,
  };
}

/**
 * Calculate all Vedic planet positions using Swiss Ephemeris.
 *
 * @param jd_et - Julian Day (Ephemeris Time / Terrestrial Time)
 * @returns Map of planet name to position data
 */
export function swephCalcAllPlanets(jd_et: number): Record<string, SwephPlanetResult> {
  const planets: Planet[] = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
  const results: Record<string, SwephPlanetResult> = {};

  for (const planet of planets) {
    results[planet] = swephCalcPlanet(jd_et, planet);
  }

  return results;
}

/**
 * Calculate house cusps and ascendant using Swiss Ephemeris.
 * Uses Whole Sign house system ('W') which is standard for Vedic astrology.
 *
 * @param jd_ut - Julian Day (Universal Time)
 * @param latitude - Geographic latitude (-90 to 90)
 * @param longitude - Geographic longitude (-180 to 180)
 * @returns House data including ascendant and MC in tropical longitude
 */
export function swephCalcHouses(jd_ut: number, latitude: number, longitude: number): SwephHousesResult {
  if (!swephModule) {
    throw new Error('sweph module not initialized. Call initSweph() first.');
  }

  const { houses_ex2, constants } = swephModule;
  const flags = constants.SEFLG_MOSEPH;

  // 'W' = Whole Sign house system (Vedic standard)
  const result = houses_ex2(jd_ut, flags, latitude, longitude, 'W');

  if (!result || !result.data) {
    throw new Error('sweph houses_ex2 failed');
  }

  const ascendant = result.data.points[0]; // Ascendant
  const mc = result.data.points[1];        // Midheaven
  const houses = result.data.houses as number[];

  return {
    ascendant: ((ascendant % 360) + 360) % 360,
    mc: ((mc % 360) + 360) % 360,
    houses: houses.map((h: number) => ((h % 360) + 360) % 360),
  };
}

/**
 * Get the Lahiri ayanamsa value for a given Julian Day (UT).
 * Sets the sidereal mode to Lahiri (SE_SIDM_LAHIRI) before calculation.
 *
 * @param jd_ut - Julian Day (Universal Time)
 * @returns Ayanamsa value in degrees
 */
export function swephGetAyanamsa(jd_ut: number): number {
  if (!swephModule) {
    throw new Error('sweph module not initialized. Call initSweph() first.');
  }

  const { get_ayanamsa_ut, set_sid_mode, constants } = swephModule;

  // Set Lahiri ayanamsa mode
  set_sid_mode(constants.SE_SIDM_LAHIRI, 0, 0);

  // get_ayanamsa_ut returns the ayanamsa value - may be a number or {data: number}
  const result = get_ayanamsa_ut(jd_ut);

  if (result === undefined || result === null || (typeof result === 'number' && isNaN(result))) {
    throw new Error('sweph get_ayanamsa_ut failed');
  }

  return typeof result === 'number' ? result : (result as { data: number }).data;
}

/**
 * Convert a UTC date to Julian Day using Swiss Ephemeris.
 *
 * @param year - UTC year
 * @param month - UTC month (1-12)
 * @param day - UTC day (1-31)
 * @param hour - UTC hour (0-23)
 * @param minute - UTC minute (0-59)
 * @param second - UTC second (0-59)
 * @returns Object with jd_et (Ephemeris Time) and jd_ut (Universal Time)
 */
export function swephDateToJD(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number
): { jd_et: number; jd_ut: number } {
  if (!swephModule) {
    throw new Error('sweph module not initialized. Call initSweph() first.');
  }

  const { utc_to_jd, constants } = swephModule;
  const result = utc_to_jd(year, month, day, hour, minute, second, constants.SE_GREG_CAL);

  if (!result || !result.data || result.data.length < 2) {
    throw new Error('sweph utc_to_jd failed');
  }

  return {
    jd_et: result.data[0], // Ephemeris Time (for planet calculations)
    jd_ut: result.data[1], // Universal Time (for house calculations)
  };
}

// ─── Health Check ────────────────────────────────────────────────────────────

export interface SwephHealthStatus {
  /** Whether Swiss Ephemeris is active and being used for calculations */
  ready: boolean;
  /** Which calculation method is being used */
  method: 'swiss-ephemeris' | 'meeus-fallback';
  /** Version of Swiss Ephemeris if loaded */
  version?: string;
  /** Error message if Swiss Ephemeris failed to load */
  error?: string;
  /** Whether initialization has been attempted */
  initAttempted: boolean;
}

/**
 * Get the health status of the Swiss Ephemeris module.
 * Can be called from API routes to report calculation method to the frontend.
 */
export function getSwephHealthStatus(): SwephHealthStatus {
  const ready = initResult?.ready === true && swephModule !== null;
  return {
    ready,
    method: ready ? 'swiss-ephemeris' : 'meeus-fallback',
    version: initResult?.version,
    error: initResult?.error,
    initAttempted: initResult !== null,
  };
}
