/**
 * AyuAstro - Core Planetary Calculation Engine
 * 
 * Uses simplified astronomical algorithms based on orbital mechanics.
 * These approximations provide reasonable accuracy (within a few degrees)
 * for Vedic astrology purposes without requiring Swiss Ephemeris.
 * 
 * Key design decisions:
 * - Tropical longitudes computed from mean orbital elements + first-order perturbations
 * - Lahiri ayanamsa subtracted to get sidereal positions
 * - Ascendant calculated from local sidereal time
 * - Rahu/Ketu from mean lunar node with 18.6-year regression
 * 
 * All calculations are DETERMINISTIC: same inputs always produce same outputs.
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
  longitudeToSign,
  longitudeToDegreeInSign,
  longitudeToNakshatraIndex,
  longitudeToPada,
  isCombust,
  DEGREES_PER_SIGN,
} from './utils';

import { getNakshatraInfo, getNakshatraName } from './nakshatra';

// ─── Julian Day Calculation ──────────────────────────────────────────────────

/** Convert a JavaScript Date to Julian Day Number */
export function dateToJulianDay(date: Date): number {
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

// ─── Lahiri Ayanamsa ─────────────────────────────────────────────────────────

/**
 * Calculate Lahiri Ayanamsa for a given date.
 * Lahiri ayanamsa is based on the position of the star Spica (Chitra)
 * at 0° Libra in the sidereal zodiac.
 * 
 * Formula: Ayanamsa ≈ 23.85° + 0.0139° * (year - 2000)
 * This gives approximately 24° for year 2000 (standard Lahiri value: 23°51'11")
 * and increases by about 50.3 arcseconds per year.
 */
export function calculateLahiriAyanamsa(date: Date): number {
  const jd = dateToJulianDay(date);
  const T = julianCenturies(jd);
  // Lahiri ayanamsa formula (simplified)
  // Based on the Chitrapaksha system
  const ayanamsa = 23.85 + (50.2912694 / 3600) * (T * 100 + 0.5);
  // More precise: 23°51'11" at J2000 + precession
  // Using the IAU precession rate
  const omega = 259.18 - 1934.14 * T; // Mean longitude of ascending node of moon
  const ayanamsaPrecise = 23.85394444 + 0.01396222 * (T * 100) + 0.00156 * Math.sin(omega * Math.PI / 180);
  return ayanamsaPrecise;
}

// ─── Tropical Longitude Calculations ─────────────────────────────────────────

/**
 * Calculate the tropical longitude of the Sun.
 * Algorithm based on Meeus "Astronomical Algorithms" simplified.
 * Accuracy: within ~1 degree
 */
export function calculateSunLongitude(jd: number): number {
  const T = julianCenturies(jd);
  
  // Mean elements
  const L0 = normalizeLongitude(280.46646 + 36000.76983 * T + 0.0003032 * T * T); // Mean longitude
  const M = normalizeLongitude(357.52911 + 35999.05029 * T - 0.0001537 * T * T);   // Mean anomaly
  
  // Equation of center (first 3 terms)
  const Mrad = M * Math.PI / 180;
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mrad)
    + (0.019993 - 0.000101 * T) * Math.sin(2 * Mrad)
    + 0.000289 * Math.sin(3 * Mrad);
  
  return normalizeLongitude(L0 + C);
}

/**
 * Calculate the tropical longitude of the Moon.
 * Based on simplified lunar theory.
 * Accuracy: within ~2-3 degrees
 */
export function calculateMoonLongitude(jd: number): number {
  const T = julianCenturies(jd);
  
  // Mean elements
  const L = normalizeLongitude(218.3165 + 481267.8813 * T);     // Mean longitude
  const M = normalizeLongitude(134.9634 + 477198.8676 * T);     // Mean anomaly (Moon)
  const Ms = normalizeLongitude(357.5291 + 35999.0503 * T);     // Mean anomaly (Sun)
  const D = normalizeLongitude(297.8502 + 445267.1115 * T);     // Mean elongation
  const F = normalizeLongitude(93.2720 + 483202.0175 * T);      // Argument of latitude
  
  const Mrad = M * Math.PI / 180;
  const Msrad = Ms * Math.PI / 180;
  const Drad = D * Math.PI / 180;
  const Frad = F * Math.PI / 180;
  
  // Principal lunar longitude terms (first-order)
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

/**
 * Calculate tropical longitude for Mars.
 * Simplified orbital elements with first-order perturbations.
 */
export function calculateMarsLongitude(jd: number): number {
  const T = julianCenturies(jd);
  
  const L = normalizeLongitude(355.433 + 19140.2993 * T);  // Mean longitude
  const M = normalizeLongitude(19.373 + 19139.8585 * T);   // Mean anomaly
  
  const Mrad = M * Math.PI / 180;
  
  // Equation of center for Mars
  const C = 10.691 * Math.sin(Mrad)
    + 0.623 * Math.sin(2 * Mrad)
    + 0.050 * Math.sin(3 * Mrad)
    + 0.005 * Math.sin(4 * Mrad);
  
  return normalizeLongitude(L + C);
}

/**
 * Calculate tropical longitude for Mercury.
 */
export function calculateMercuryLongitude(jd: number): number {
  const T = julianCenturies(jd);
  
  const L = normalizeLongitude(252.251 + 149472.6746 * T);  // Mean longitude
  const M = normalizeLongitude(174.796 + 149472.5153 * T);  // Mean anomaly
  
  const Mrad = M * Math.PI / 180;
  
  const C = 23.44 * Math.sin(Mrad)
    + 2.90 * Math.sin(2 * Mrad)
    + 0.55 * Math.sin(3 * Mrad)
    + 0.12 * Math.sin(4 * Mrad);
  
  return normalizeLongitude(L + C);
}

/**
 * Calculate tropical longitude for Jupiter.
 */
export function calculateJupiterLongitude(jd: number): number {
  const T = julianCenturies(jd);
  
  const L = normalizeLongitude(34.351 + 3034.9057 * T);    // Mean longitude
  const M = normalizeLongitude(20.020 + 3034.6888 * T);    // Mean anomaly
  
  const Mrad = M * Math.PI / 180;
  
  const C = 5.555 * Math.sin(Mrad)
    + 0.168 * Math.sin(2 * Mrad)
    + 0.007 * Math.sin(3 * Mrad);
  
  return normalizeLongitude(L + C);
}

/**
 * Calculate tropical longitude for Venus.
 */
export function calculateVenusLongitude(jd: number): number {
  const T = julianCenturies(jd);
  
  const L = normalizeLongitude(181.980 + 58517.8157 * T);   // Mean longitude
  const M = normalizeLongitude(50.416 + 58517.8039 * T);    // Mean anomaly
  
  const Mrad = M * Math.PI / 180;
  
  const C = 0.775 * Math.sin(Mrad)
    + 0.004 * Math.sin(2 * Mrad);
  
  return normalizeLongitude(L + C);
}

/**
 * Calculate tropical longitude for Saturn.
 */
export function calculateSaturnLongitude(jd: number): number {
  const T = julianCenturies(jd);
  
  const L = normalizeLongitude(50.077 + 1222.1138 * T);    // Mean longitude
  const M = normalizeLongitude(317.021 + 1222.1116 * T);   // Mean anomaly
  
  const Mrad = M * Math.PI / 180;
  
  const C = 6.406 * Math.sin(Mrad)
    + 0.419 * Math.sin(2 * Mrad)
    + 0.036 * Math.sin(3 * Mrad);
  
  return normalizeLongitude(L + C);
}

/**
 * Calculate Rahu (Mean North Node of Moon) tropical longitude.
 * The mean node regresses through the zodiac in ~18.6 years.
 */
export function calculateRahuLongitude(jd: number): number {
  const T = julianCenturies(jd);
  
  // Mean longitude of ascending node (regresses)
  let omega = 125.0446 - 1934.1363 * T + 0.0021 * T * T;
  
  // True node correction (simplified)
  const D = normalizeLongitude(297.8502 + 445267.1115 * T);
  const M = normalizeLongitude(357.5291 + 35999.0503 * T);
  const Mm = normalizeLongitude(134.9634 + 477198.8676 * T);
  
  omega += -1.4979 * Math.sin(2 * D * Math.PI / 180)
    + 0.15 * Math.sin(M * Math.PI / 180)
    + 0.0064 * Math.sin(2 * Mm * Math.PI / 180);
  
  // Rahu = ascending node longitude
  return normalizeLongitude(omega);
}

/**
 * Calculate Ketu (South Node) = Rahu + 180°
 */
export function calculateKetuLongitude(jd: number): number {
  return normalizeLongitude(calculateRahuLongitude(jd) + 180);
}

// ─── Retrograde Detection ────────────────────────────────────────────────────

/**
 * Determine if a planet is retrograde.
 * For inner planets (Mercury, Venus), retrograde occurs near inferior conjunction.
 * For outer planets (Mars, Jupiter, Saturn), retrograde occurs near opposition.
 * Rahu and Ketu are always retrograde.
 */
export function isPlanetRetrograde(
  planet: Planet,
  tropicalLongitude: number,
  sunTropicalLongitude: number
): boolean {
  if (planet === 'Rahu' || planet === 'Ketu') return true;
  if (planet === 'Sun' || planet === 'Moon') return false;
  
  // Calculate elongation (angular distance from Sun)
  const elongation = normalizeLongitude(tropicalLongitude - sunTropicalLongitude);
  
  switch (planet) {
    case 'Mercury': {
      // Mercury retrograde when elongation is near 0° (inferior conjunction)
      // Approximate: retrograde when elongation < 22° or > 338°
      return elongation < 22 || elongation > 338;
    }
    case 'Venus': {
      // Venus retrograde when elongation is near 0° (inferior conjunction)
      return elongation < 10 || elongation > 350;
    }
    case 'Mars': {
      // Mars retrograde when near opposition (elongation near 180°)
      return elongation > 130 && elongation < 230;
    }
    case 'Jupiter': {
      // Jupiter retrograde when near opposition
      return elongation > 145 && elongation < 215;
    }
    case 'Saturn': {
      // Saturn retrograde when near opposition
      return elongation > 150 && elongation < 210;
    }
    default:
      return false;
  }
}

// ─── Ascendant (Lagna) Calculation ───────────────────────────────────────────

/**
 * Calculate the Ascendant (Lagna) based on birth time and location.
 * Uses local sidereal time to determine the rising sign.
 */
export function calculateAscendant(
  jd: number,
  latitude: number,
  longitude: number,
  timezoneOffset: number
): AscendantData {
  // Calculate local sidereal time
  const T = julianCenturies(jd);
  
  // Greenwich Mean Sidereal Time at 0h UT
  let gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0)
    + 0.000387933 * T * T - T * T * T / 38710000;
  gmst = normalizeLongitude(gmst);
  
  // Local sidereal time
  const lst = normalizeLongitude(gmst + longitude);
  
  // Convert to RAMC (Right Ascension of Midheaven)
  const ramc = lst * Math.PI / 180;
  const latRad = latitude * Math.PI / 180;
  const obliquity = (23.4393 - 0.0130 * T) * Math.PI / 180; // Earth's axial tilt
  
  // Calculate Ascendant using the standard formula
  const ascendantRad = Math.atan2(
    Math.cos(ramc),
    -(Math.sin(ramc) * Math.cos(obliquity) + Math.tan(latRad) * Math.sin(obliquity))
  );
  
  let ascendantDeg = ascendantRad * 180 / Math.PI;
  ascendantDeg = normalizeLongitude(ascendantDeg);
  
  // Convert to sidereal
  const ayanamsa = calculateLahiriAyanamsa(new Date(jd.valueOf() - jd.valueOf() % 86400000 + 12 * 3600000));
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

// ─── Complete Planetary Position ─────────────────────────────────────────────

/**
 * Calculate the complete position of a planet (both tropical and sidereal).
 */
export function calculatePlanetPosition(
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
  const retrograde = isPlanetRetrograde(planet, tropicalLongitude, sunTropicalLongitude);
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
  };
}

// ─── All Planetary Positions ─────────────────────────────────────────────────

/**
 * Calculate all planetary positions for a given date/time/location.
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
  // Adjust date to UTC
  const utcDate = new Date(date.getTime() - timezoneOffset * 3600000);
  const jd = dateToJulianDay(utcDate);
  
  // Calculate ayanamsa
  const ayanamsa = calculateLahiriAyanamsa(date);
  
  // Calculate tropical longitudes
  const sunTropical = calculateSunLongitude(jd);
  const moonTropical = calculateMoonLongitude(jd);
  const marsTropical = calculateMarsLongitude(jd);
  const mercuryTropical = calculateMercuryLongitude(jd);
  const jupiterTropical = calculateJupiterLongitude(jd);
  const venusTropical = calculateVenusLongitude(jd);
  const saturnTropical = calculateSaturnLongitude(jd);
  const rahuTropical = calculateRahuLongitude(jd);
  const ketuTropical = calculateKetuLongitude(jd);
  
  // Calculate sidereal positions
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
    positions[planet] = calculatePlanetPosition(
      planet,
      tropicalLon,
      ayanamsa,
      sunTropical
    );
  }
  
  // Calculate ascendant
  const ascendant = calculateAscendant(jd, latitude, longitude, timezoneOffset);
  
  return { positions, ayanamsa, ascendant };
}

// ─── Convenience: Sidereal longitude for a specific planet ───────────────────

/**
 * Get the sidereal longitude of a specific planet.
 */
export function getPlanetSiderealLongitude(
  planet: Planet,
  date: Date,
  timezoneOffset: number = 0
): number {
  const utcDate = new Date(date.getTime() - timezoneOffset * 3600000);
  const jd = dateToJulianDay(utcDate);
  const ayanamsa = calculateLahiriAyanamsa(date);
  
  let tropical: number;
  switch (planet) {
    case 'Sun':     tropical = calculateSunLongitude(jd); break;
    case 'Moon':    tropical = calculateMoonLongitude(jd); break;
    case 'Mars':    tropical = calculateMarsLongitude(jd); break;
    case 'Mercury': tropical = calculateMercuryLongitude(jd); break;
    case 'Jupiter': tropical = calculateJupiterLongitude(jd); break;
    case 'Venus':   tropical = calculateVenusLongitude(jd); break;
    case 'Saturn':  tropical = calculateSaturnLongitude(jd); break;
    case 'Rahu':    tropical = calculateRahuLongitude(jd); break;
    case 'Ketu':    tropical = calculateKetuLongitude(jd); break;
    default:        tropical = 0;
  }
  
  return normalizeLongitude(tropical - ayanamsa);
}
