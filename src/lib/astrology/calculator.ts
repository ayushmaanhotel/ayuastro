/**
 * AyuAstro - Core Planetary Calculation Engine
 *
 * ═════════════════════════════════════════════════════════════════════════
 * VEDIC ASTROLOGY METHOD ENFORCEMENT
 * ═════════════════════════════════════════════════════════════════════════
 * This engine STRICTLY follows Vedic (sidereal) astrology per Parashari:
 *
 * 1. LAHIRI AYANAMSA (Chitrapaksha)
 *    - The official ayanamsa adopted by the Government of India
 *    - Used to convert tropical longitudes to sidereal longitudes
 *    - Expected range: ~23°-25° for modern dates (1900-2100)
 *    - Any value outside this range indicates a calculation error
 *
 * 2. WHOLE SIGN HOUSE SYSTEM
 *    - The standard house system in Vedic/Jyotish astrology
 *    - Each house = one complete zodiac sign (30°)
 *    - House 1 = the sign containing the ascendant (Lagna)
 *    - House N = sign N-1 positions away from ascendant sign
 *    - NOT Equal house, NOT Placidus, NOT Koch
 *
 * 3. VIMSHOTTARI DASHA SYSTEM
 *    - 120-year cycle based on Moon's nakshatra at birth
 *    - 9 Mahadasha periods: Ketu(7), Venus(20), Sun(6), Moon(10),
 *      Mars(7), Rahu(18), Jupiter(16), Saturn(19), Mercury(17)
 *    - Each Mahadasha contains Antardashas in the same sequence
 *
 * 4. PARASHARI PRINCIPLES
 *    - Traditional Vedic astrology as codified by Sage Parashara
 *    - Planet-centric analysis (graha-phala)
 *    - Emphasis on Moon sign (Rashi) and nakshatra for predictions
 *    - Yoga and dosha detection per classical texts
 * ═════════════════════════════════════════════════════════════════════════
 *
 * PRIMARY: Uses Swiss Ephemeris (sweph) for professional-grade accuracy
 * (arc-minute level). The Swiss Ephemeris uses Moshier built-in ephemeris
 * so no external data files are required.
 *
 * FALLBACK: If the native sweph module fails to load, falls back to
 * simplified Meeus orbital mechanics (~1-3° accuracy).
 *
 * Key design decisions:
 * - Swiss Ephemeris tropical longitudes via sweph calc()
 * - Lahiri ayanamsa from sweph get_ayanamsa_ut() (set_sid_mode SE_SIDM_LAHIRI)
 * - Ascendant from sweph houses_ex2() (Whole Sign system)
 * - Retrograde detected from actual speed value (negative = retrograde)
 * - SE_MEAN_NODE for Rahu (Vedic standard); Ketu = Rahu + 180°
 * - All calculations are DETERMINISTIC: same inputs always produce same outputs
 *
 * IMPORTANT: The sweph module uses native N-API bindings and can only be
 * used in server-side code. The `swephReady` flag indicates availability.
 */

import {
  type PlanetPosition,
  type AscendantData,
  type Planet,
  type ZodiacSign,
  ZODIAC_SIGNS,
} from './types';

import {
  normalizeLongitude,
  longitudeToSignIndex,
  longitudeToDegreeInSign,
  longitudeToNakshatraIndex,
  longitudeToPada,
  isCombust,
} from './utils';

import { getNakshatraName } from './nakshatra';

import {
  initSweph,
  isSwephReady,
  swephCalcPlanet,
  swephCalcAllPlanets,
  swephCalcHouses,
  swephGetAyanamsa,
  swephDateToJD,
  getSwephHealthStatus,
} from './swiss-ephemeris';

// ─── Module State ────────────────────────────────────────────────────────────

/** Whether the Swiss Ephemeris native module loaded successfully */
let swephReady = false;

/** Whether we've attempted initialization */
let swephInitAttempted = false;

/**
 * Initialize the Swiss Ephemeris module.
 * Should be called once at server startup (e.g., in API route initialization).
 * Returns true if sweph is ready for use.
 */
export async function initializeSwissEphemeris(): Promise<boolean> {
  if (swephInitAttempted) return swephReady;
  swephInitAttempted = true;

  try {
    const result = await initSweph();
    swephReady = result.ready;
    if (swephReady) {
      console.log('[Calculator] ✓ Swiss Ephemeris initialized successfully — using arc-minute accuracy');
    } else {
      console.error('[Calculator] ✗ Swiss Ephemeris UNAVAILABLE: %s', result.error);
      console.error('[Calculator] ✗ Falling back to Meeus calculations with ~1-3° error');
      console.error('[Calculator] ✗ THIS IS A CRITICAL ISSUE — planetary sign placements may be WRONG at sign boundaries');
    }
  } catch (err) {
    console.error('[Calculator] ✗ Swiss Ephemeris init error:', err);
    console.error('[Calculator] ✗ Falling back to Meeus calculations with ~1-3° error');
    swephReady = false;
  }

  return swephReady;
}

/**
 * Check if Swiss Ephemeris is ready for use.
 */
export function isSwissEphemerisReady(): boolean {
  return swephReady;
}

/**
 * Get the current calculation method being used.
 * Returns 'swiss-ephemeris' if the native module is loaded and active,
 * or 'meeus-fallback' if Swiss Ephemeris is unavailable.
 *
 * This can be called from API routes to inform the frontend which
 * calculation engine produced the results.
 */
export function getCalculationMethod(): 'swiss-ephemeris' | 'meeus-fallback' {
  return swephReady ? 'swiss-ephemeris' : 'meeus-fallback';
}

/**
 * Get detailed health status of the calculation engine.
 * Includes method, version, error info, and init state.
 */
export function getCalculatorHealthStatus() {
  return {
    ...getSwephHealthStatus(),
    calculatorInitialized: swephInitAttempted,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SWISS EPHEMERIS PATH (Primary - high accuracy)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Convert a JavaScript Date to Julian Day Number using Swiss Ephemeris.
 * Returns both jd_et (for planets) and jd_ut (for houses/ayanamsa).
 */
function dateToJDWithSweph(date: Date): { jd_et: number; jd_ut: number } {
  return swephDateToJD(
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds()
  );
}

/**
 * Build a PlanetPosition from Swiss Ephemeris raw data.
 */
function buildPlanetPositionFromSweph(
  planet: Planet,
  tropicalLongitude: number,
  eclipticLatitude: number,
  distanceAU: number,
  lonSpeed: number,
  ayanamsa: number,
  sunSiderealLongitude: number
): PlanetPosition {
  const siderealLongitude = normalizeLongitude(tropicalLongitude - ayanamsa);
  const signIndex = longitudeToSignIndex(siderealLongitude);
  const sign = ZODIAC_SIGNS[signIndex] as ZodiacSign;
  const degreeInSign = longitudeToDegreeInSign(siderealLongitude);
  const nakshatraIndex = longitudeToNakshatraIndex(siderealLongitude);
  const nakshatraPada = longitudeToPada(siderealLongitude);

  // Swiss Ephemeris provides actual speed: negative = retrograde
  const retrograde = planet === 'Rahu' || planet === 'Ketu'
    ? true // Nodes are always retrograde in Vedic astrology
    : lonSpeed < 0;

  const combust = isCombust(planet, siderealLongitude, sunSiderealLongitude);

  return {
    planet,
    longitude: tropicalLongitude,
    siderealLongitude,
    sign,
    signIndex,
    degreeInSign,
    nakshatra: getNakshatraName(nakshatraIndex),
    nakshatraIndex,
    nakshatraPada,
    isRetrograde: retrograde,
    isCombust: combust,
    eclipticLatitude,
    speed: lonSpeed,
    distanceAU,
  };
}

/**
 * Calculate all planetary positions using Swiss Ephemeris.
 */
function calculateAllPlanetaryPositionsSweph(
  date: Date,
  latitude: number,
  longitude: number
): {
  positions: Record<string, PlanetPosition>;
  ayanamsa: number;
  ascendant: AscendantData;
} {
  // Step 1: Convert date to Julian Day
  const { jd_et, jd_ut } = dateToJDWithSweph(date);

  // Step 2: Get Lahiri ayanamsa from Swiss Ephemeris
  const ayanamsa = swephGetAyanamsa(jd_ut);

  // Step 3: Calculate all planet positions
  const rawPlanets = swephCalcAllPlanets(jd_et);

  // Step 4: Calculate houses (ascendant)
  const houseData = swephCalcHouses(jd_ut, latitude, longitude);

  // Step 5: Convert raw positions to PlanetPosition objects
  const positions: Record<string, PlanetPosition> = {};
  const sunSidereal = normalizeLongitude(rawPlanets['Sun'].longitude - ayanamsa);

  for (const [planetName, rawData] of Object.entries(rawPlanets)) {
    positions[planetName] = buildPlanetPositionFromSweph(
      planetName as Planet,
      rawData.longitude,
      rawData.latitude,
      rawData.distanceAU,
      rawData.lonSpeed,
      ayanamsa,
      sunSidereal
    );
  }

  // Step 6: Build AscendantData from Swiss Ephemeris houses
  const ascTropical = houseData.ascendant;
  const ascSidereal = normalizeLongitude(ascTropical - ayanamsa);
  const ascSignIndex = longitudeToSignIndex(ascSidereal);
  const ascDegreeInSign = longitudeToDegreeInSign(ascSidereal);

  const ascendant: AscendantData = {
    sign: ZODIAC_SIGNS[ascSignIndex],
    signIndex: ascSignIndex,
    degreeInSign: ascDegreeInSign,
    siderealLongitude: ascSidereal,
  };

  return { positions, ayanamsa, ascendant };
}

/**
 * Calculate Lahiri ayanamsa using Swiss Ephemeris.
 */
function calculateLahiriAyanamsaSweph(date: Date): number {
  const { jd_ut } = dateToJDWithSweph(date);
  return swephGetAyanamsa(jd_ut);
}

/**
 * Calculate ascendant using Swiss Ephemeris houses.
 */
function calculateAscendantSweph(
  date: Date,
  latitude: number,
  longitude: number
): AscendantData {
  const { jd_ut } = dateToJDWithSweph(date);
  const ayanamsa = swephGetAyanamsa(jd_ut);
  const houseData = swephCalcHouses(jd_ut, latitude, longitude);

  const ascSidereal = normalizeLongitude(houseData.ascendant - ayanamsa);
  const signIndex = longitudeToSignIndex(ascSidereal);
  const degreeInSign = longitudeToDegreeInSign(ascSidereal);

  return {
    sign: ZODIAC_SIGNS[signIndex],
    signIndex,
    degreeInSign,
    siderealLongitude: ascSidereal,
  };
}

/**
 * Get sidereal longitude for a specific planet using Swiss Ephemeris.
 */
function getPlanetSiderealLongitudeSweph(
  planet: Planet,
  date: Date
): number {
  const { jd_et, jd_ut } = dateToJDWithSweph(date);
  const ayanamsa = swephGetAyanamsa(jd_ut);
  const rawData = swephCalcPlanet(jd_et, planet);
  return normalizeLongitude(rawData.longitude - ayanamsa);
}

// ═══════════════════════════════════════════════════════════════════════════════
// MEEUS FALLBACK PATH (Secondary - ~1-3° accuracy)
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Julian Day Calculation (Meeus) ──────────────────────────────────────────

/** Convert a JavaScript Date to Julian Day Number (Meeus algorithm) */
function dateToJulianDayMeeus(date: Date): number {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const hour = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;

  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }

  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);

  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + hour / 24 + B - 1524.5;
}

/** Julian centuries from J2000.0 */
function julianCenturies(jd: number): number {
  return (jd - 2451545.0) / 36525.0;
}

// ─── Lahiri Ayanamsa (Meeus) ─────────────────────────────────────────────────

/**
 * Calculate Lahiri Ayanamsa for a given date (simplified formula).
 * Accuracy: within ~0.1°
 */
function calculateLahiriAyanamsaMeeus(date: Date): number {
  const jd = dateToJulianDayMeeus(date);
  const T = julianCenturies(jd);
  const omega = 259.18 - 1934.14 * T;
  const ayanamsaPrecise = 23.85394444 + 0.01396222 * (T * 100) + 0.00156 * Math.sin(omega * Math.PI / 180);
  return ayanamsaPrecise;
}

// ─── Tropical Longitude Calculations (Meeus) ────────────────────────────────

function calculateSunLongitudeMeeus(jd: number): number {
  const T = julianCenturies(jd);
  const L0 = normalizeLongitude(280.46646 + 36000.76983 * T + 0.0003032 * T * T);
  const M = normalizeLongitude(357.52911 + 35999.05029 * T - 0.0001537 * T * T);
  const Mrad = M * Math.PI / 180;
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mrad)
    + (0.019993 - 0.000101 * T) * Math.sin(2 * Mrad)
    + 0.000289 * Math.sin(3 * Mrad);
  return normalizeLongitude(L0 + C);
}

function calculateMoonLongitudeMeeus(jd: number): number {
  const T = julianCenturies(jd);
  const L = normalizeLongitude(218.3165 + 481267.8813 * T);
  const M = normalizeLongitude(134.9634 + 477198.8676 * T);
  const Ms = normalizeLongitude(357.5291 + 35999.0503 * T);
  const D = normalizeLongitude(297.8502 + 445267.1115 * T);
  const F = normalizeLongitude(93.2720 + 483202.0175 * T);
  const Mrad = M * Math.PI / 180;
  const Msrad = Ms * Math.PI / 180;
  const Drad = D * Math.PI / 180;
  const Frad = F * Math.PI / 180;
  let lon = L
    + 6.289 * Math.sin(Mrad)
    + 1.274 * Math.sin(2 * Drad - Mrad)
    + 0.658 * Math.sin(2 * Drad)
    + 0.214 * Math.sin(2 * Mrad)
    - 0.186 * Math.sin(Msrad)
    - 0.114 * Math.sin(2 * Frad)
    + 0.059 * Math.sin(2 * Drad - 2 * Mrad)
    + 0.057 * Math.sin(2 * Drad - Msrad - Mrad)
    + 0.053 * Math.sin(2 * Drad + Mrad)
    + 0.046 * Math.sin(2 * Drad - Msrad)
    - 0.041 * Math.sin(Mrad - Msrad);
  return normalizeLongitude(lon);
}

function calculateMarsLongitudeMeeus(jd: number): number {
  const T = julianCenturies(jd);
  const L = normalizeLongitude(355.433 + 19140.2993 * T);
  const M = normalizeLongitude(19.373 + 19139.8585 * T);
  const Mrad = M * Math.PI / 180;
  const C = 10.691 * Math.sin(Mrad)
    + 0.623 * Math.sin(2 * Mrad)
    + 0.050 * Math.sin(3 * Mrad)
    + 0.005 * Math.sin(4 * Mrad);
  return normalizeLongitude(L + C);
}

function calculateMercuryLongitudeMeeus(jd: number): number {
  const T = julianCenturies(jd);
  const L = normalizeLongitude(252.251 + 149472.6746 * T);
  const M = normalizeLongitude(174.796 + 149472.5153 * T);
  const Mrad = M * Math.PI / 180;
  const C = 23.44 * Math.sin(Mrad)
    + 2.90 * Math.sin(2 * Mrad)
    + 0.55 * Math.sin(3 * Mrad)
    + 0.12 * Math.sin(4 * Mrad);
  return normalizeLongitude(L + C);
}

function calculateJupiterLongitudeMeeus(jd: number): number {
  const T = julianCenturies(jd);
  const L = normalizeLongitude(34.351 + 3034.9057 * T);
  const M = normalizeLongitude(20.020 + 3034.6888 * T);
  const Mrad = M * Math.PI / 180;
  const C = 5.555 * Math.sin(Mrad)
    + 0.168 * Math.sin(2 * Mrad)
    + 0.007 * Math.sin(3 * Mrad);
  return normalizeLongitude(L + C);
}

function calculateVenusLongitudeMeeus(jd: number): number {
  const T = julianCenturies(jd);
  const L = normalizeLongitude(181.980 + 58517.8157 * T);
  const M = normalizeLongitude(50.416 + 58517.8039 * T);
  const Mrad = M * Math.PI / 180;
  const C = 0.775 * Math.sin(Mrad)
    + 0.004 * Math.sin(2 * Mrad);
  return normalizeLongitude(L + C);
}

function calculateSaturnLongitudeMeeus(jd: number): number {
  const T = julianCenturies(jd);
  const L = normalizeLongitude(50.077 + 1222.1138 * T);
  const M = normalizeLongitude(317.021 + 1222.1116 * T);
  const Mrad = M * Math.PI / 180;
  const C = 6.406 * Math.sin(Mrad)
    + 0.419 * Math.sin(2 * Mrad)
    + 0.036 * Math.sin(3 * Mrad);
  return normalizeLongitude(L + C);
}

function calculateRahuLongitudeMeeus(jd: number): number {
  const T = julianCenturies(jd);
  let omega = 125.0446 - 1934.1363 * T + 0.0021 * T * T;
  const D = normalizeLongitude(297.8502 + 445267.1115 * T);
  const M = normalizeLongitude(357.5291 + 35999.0503 * T);
  const Mm = normalizeLongitude(134.9634 + 477198.8676 * T);
  omega += -1.4979 * Math.sin(2 * D * Math.PI / 180)
    + 0.15 * Math.sin(M * Math.PI / 180)
    + 0.0064 * Math.sin(2 * Mm * Math.PI / 180);
  return normalizeLongitude(omega);
}

function calculateKetuLongitudeMeeus(jd: number): number {
  return normalizeLongitude(calculateRahuLongitudeMeeus(jd) + 180);
}

// ─── Retrograde Detection (Meeus) ────────────────────────────────────────────

function isPlanetRetrogradeMeeus(
  planet: Planet,
  tropicalLongitude: number,
  sunTropicalLongitude: number
): boolean {
  if (planet === 'Rahu' || planet === 'Ketu') return true;
  if (planet === 'Sun' || planet === 'Moon') return false;
  const elongation = normalizeLongitude(tropicalLongitude - sunTropicalLongitude);
  switch (planet) {
    case 'Mercury': return elongation < 22 || elongation > 338;
    case 'Venus':   return elongation < 10 || elongation > 350;
    case 'Mars':    return elongation > 130 && elongation < 230;
    case 'Jupiter': return elongation > 145 && elongation < 215;
    case 'Saturn':  return elongation > 150 && elongation < 210;
    default:        return false;
  }
}

// ─── Ascendant Calculation (Meeus) ───────────────────────────────────────────

function calculateAscendantMeeus(
  jd: number,
  latitude: number,
  longitude: number
): AscendantData {
  const T = julianCenturies(jd);
  let gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0)
    + 0.000387933 * T * T - T * T * T / 38710000;
  gmst = normalizeLongitude(gmst);
  const lst = normalizeLongitude(gmst + longitude);
  const ramc = lst * Math.PI / 180;
  const latRad = latitude * Math.PI / 180;
  const obliquity = (23.4393 - 0.0130 * T) * Math.PI / 180;
  const ascendantRad = Math.atan2(
    Math.cos(ramc),
    -(Math.sin(ramc) * Math.cos(obliquity) + Math.tan(latRad) * Math.sin(obliquity))
  );
  let ascendantDeg = ascendantRad * 180 / Math.PI;
  ascendantDeg = normalizeLongitude(ascendantDeg);
  const ayanamsa = calculateLahiriAyanamsaMeeus(new Date(jd.valueOf() - jd.valueOf() % 86400000 + 12 * 3600000));
  const siderealAscendant = normalizeLongitude(ascendantDeg - ayanamsa);
  const signIndex = longitudeToSignIndex(siderealAscendant);
  const degreeInSign = longitudeToDegreeInSign(siderealAscendant);
  return {
    sign: ZODIAC_SIGNS[signIndex],
    signIndex,
    degreeInSign,
    siderealLongitude: siderealAscendant,
  };
}

// ─── Planet Position (Meeus) ─────────────────────────────────────────────────

function calculatePlanetPositionMeeus(
  planet: Planet,
  tropicalLongitude: number,
  ayanamsa: number,
  sunTropicalLongitude: number
): PlanetPosition {
  const siderealLongitude = normalizeLongitude(tropicalLongitude - ayanamsa);
  const signIndex = longitudeToSignIndex(siderealLongitude);
  const sign = ZODIAC_SIGNS[signIndex] as ZodiacSign;
  const degreeInSign = longitudeToDegreeInSign(siderealLongitude);
  const nakshatraIndex = longitudeToNakshatraIndex(siderealLongitude);
  const nakshatraPada = longitudeToPada(siderealLongitude);
  const retrograde = isPlanetRetrogradeMeeus(planet, tropicalLongitude, sunTropicalLongitude);
  const combust = isCombust(planet, siderealLongitude, normalizeLongitude(sunTropicalLongitude - ayanamsa));

  return {
    planet,
    longitude: tropicalLongitude,
    siderealLongitude,
    sign,
    signIndex,
    degreeInSign,
    nakshatra: getNakshatraName(nakshatraIndex),
    nakshatraIndex,
    nakshatraPada,
    isRetrograde: retrograde,
    isCombust: combust,
    // No eclipticLatitude, speed, distanceAU from Meeus fallback
  };
}

/**
 * Calculate all planetary positions using Meeus fallback.
 */
function calculateAllPlanetaryPositionsMeeus(
  date: Date,
  latitude: number,
  longitude: number,
  timezoneOffset: number
): {
  positions: Record<string, PlanetPosition>;
  ayanamsa: number;
  ascendant: AscendantData;
} {
  const utcDate = new Date(date.getTime() - timezoneOffset * 3600000);
  const jd = dateToJulianDayMeeus(utcDate);
  const ayanamsa = calculateLahiriAyanamsaMeeus(date);

  const sunTropical = calculateSunLongitudeMeeus(jd);
  const moonTropical = calculateMoonLongitudeMeeus(jd);
  const marsTropical = calculateMarsLongitudeMeeus(jd);
  const mercuryTropical = calculateMercuryLongitudeMeeus(jd);
  const jupiterTropical = calculateJupiterLongitudeMeeus(jd);
  const venusTropical = calculateVenusLongitudeMeeus(jd);
  const saturnTropical = calculateSaturnLongitudeMeeus(jd);
  const rahuTropical = calculateRahuLongitudeMeeus(jd);
  const ketuTropical = calculateKetuLongitudeMeeus(jd);

  const positions: Record<string, PlanetPosition> = {};
  const planetData: [Planet, number][] = [
    ['Sun', sunTropical],
    ['Moon', moonTropical],
    ['Mars', marsTropical],
    ['Mercury', mercuryTropical],
    ['Jupiter', jupiterTropical],
    ['Venus', venusTropical],
    ['Saturn', saturnTropical],
    ['Rahu', rahuTropical],
    ['Ketu', ketuTropical],
  ];

  for (const [planet, tropicalLon] of planetData) {
    positions[planet] = calculatePlanetPositionMeeus(
      planet,
      tropicalLon,
      ayanamsa,
      sunTropical
    );
  }

  const ascendant = calculateAscendantMeeus(jd, latitude, longitude);
  return { positions, ayanamsa, ascendant };
}

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC API - Unified interface with Swiss Ephemeris primary + Meeus fallback
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Julian Day Calculation ──────────────────────────────────────────────────

/** Convert a JavaScript Date to Julian Day Number */
export function dateToJulianDay(date: Date): number {
  if (swephReady) {
    try {
      const { jd_ut } = dateToJDWithSweph(date);
      return jd_ut;
    } catch {
      // Fall through to Meeus
    }
  }
  return dateToJulianDayMeeus(date);
}

// ─── Lahiri Ayanamsa ─────────────────────────────────────────────────────────

/**
 * Calculate Lahiri Ayanamsa for a given date.
 * Uses Swiss Ephemeris if available, otherwise falls back to simplified formula.
 */
export function calculateLahiriAyanamsa(date: Date): number {
  if (swephReady) {
    try {
      return calculateLahiriAyanamsaSweph(date);
    } catch {
      // Fall through to Meeus
    }
  }
  return calculateLahiriAyanamsaMeeus(date);
}

// ─── Ascendant (Lagna) Calculation ───────────────────────────────────────────

/**
 * Calculate the Ascendant (Lagna) based on birth time and location.
 * Uses Swiss Ephemeris houses_ex2 if available, otherwise manual formula.
 */
export function calculateAscendant(
  jd: number,
  latitude: number,
  longitude: number,
  timezoneOffset: number
): AscendantData {
  if (swephReady) {
    try {
      // Reconstruct the Date from JD for Swiss Ephemeris
      // Swiss Ephemeris needs the original date, so we convert back
      // jd is based on UTC date; we reconstruct it
      const dateFromJD = new Date((jd - 2440587.5) * 86400000);
      return calculateAscendantSweph(dateFromJD, latitude, longitude);
    } catch {
      // Fall through to Meeus
    }
  }
  return calculateAscendantMeeus(jd, latitude, longitude);
}

// ─── All Planetary Positions ─────────────────────────────────────────────────

/**
 * Calculate all planetary positions for a given date/time/location.
 * Uses Swiss Ephemeris (primary) or Meeus fallback (secondary).
 */
export function calculateAllPlanetaryPositions(
  date: Date,
  latitude: number,
  longitude: number,
  timezoneOffset: number
): {
  positions: Record<string, PlanetPosition>;
  ayanamsa: number;
  ascendant: AscendantData;
} {
  let result: { positions: Record<string, PlanetPosition>; ayanamsa: number; ascendant: AscendantData };

  if (swephReady) {
    try {
      // Adjust date to UTC for Swiss Ephemeris
      const utcDate = new Date(date.getTime() - timezoneOffset * 3600000);
      result = calculateAllPlanetaryPositionsSweph(utcDate, latitude, longitude);
    } catch (err) {
      console.error('[Calculator] Swiss Ephemeris calculation FAILED, falling back to Meeus:', err);
      result = calculateAllPlanetaryPositionsMeeus(date, latitude, longitude, timezoneOffset);
    }
  } else {
    result = calculateAllPlanetaryPositionsMeeus(date, latitude, longitude, timezoneOffset);
  }

  // ── Validate Ayanamsa Value ──────────────────────────────────────────────
  // Lahiri Ayanamsa for modern dates (1900-2100) should be approximately
  // 23°-25°. Values outside this range indicate a calculation error.
  const ayanamsa = result.ayanamsa;
  if (ayanamsa < 22 || ayanamsa > 26) {
    console.error(
      `[Calculator] ⚠️ AYANAMSA VALUE SEEMS WRONG: ${ayanamsa.toFixed(4)}° — ` +
      `expected ~23°-25° for modern dates (Lahiri/Chitrapaksha). ` +
      `This may cause INCORRECT sidereal positions! Calculation method: ${getCalculationMethod()}`
    );
  } else if (ayanamsa < 23 || ayanamsa > 25) {
    console.warn(
      `[Calculator] Ayanamsa value ${ayanamsa.toFixed(4)}° is within acceptable range ` +
      `but outside the ideal 23°-25° range for modern dates.`
    );
  }

  return result;
}

// ─── Convenience: Sidereal longitude for a specific planet ───────────────────

/**
 * Get the sidereal longitude of a specific planet.
 * Uses Swiss Ephemeris if available, otherwise Meeus fallback.
 */
export function getPlanetSiderealLongitude(
  planet: Planet,
  date: Date,
  timezoneOffset: number = 0
): number {
  if (swephReady) {
    try {
      const utcDate = new Date(date.getTime() - timezoneOffset * 3600000);
      return getPlanetSiderealLongitudeSweph(planet, utcDate);
    } catch {
      // Fall through to Meeus
    }
  }

  // Meeus fallback
  const utcDate = new Date(date.getTime() - timezoneOffset * 3600000);
  const jd = dateToJulianDayMeeus(utcDate);
  const ayanamsa = calculateLahiriAyanamsaMeeus(date);

  let tropical: number;
  switch (planet) {
    case 'Sun':     tropical = calculateSunLongitudeMeeus(jd); break;
    case 'Moon':    tropical = calculateMoonLongitudeMeeus(jd); break;
    case 'Mars':    tropical = calculateMarsLongitudeMeeus(jd); break;
    case 'Mercury': tropical = calculateMercuryLongitudeMeeus(jd); break;
    case 'Jupiter': tropical = calculateJupiterLongitudeMeeus(jd); break;
    case 'Venus':   tropical = calculateVenusLongitudeMeeus(jd); break;
    case 'Saturn':  tropical = calculateSaturnLongitudeMeeus(jd); break;
    case 'Rahu':    tropical = calculateRahuLongitudeMeeus(jd); break;
    case 'Ketu':    tropical = calculateKetuLongitudeMeeus(jd); break;
    default:        tropical = 0;
  }

  return normalizeLongitude(tropical - ayanamsa);
}

// ─── Auto-initialize on module load ──────────────────────────────────────────

// Attempt to initialize Swiss Ephemeris when the module loads.
// This runs once; subsequent calls are no-ops if already attempted.
initializeSwissEphemeris().catch(() => {
  // Silently fail — Meeus fallback will be used
});
