/**
 * AyuAstro - Main Entry Point
 * 
 * This is the primary export file for the Vedic astrology calculation engine.
 * It provides the main `calculateKundali()` function that takes birth details
 * and returns comprehensive astrological data.
 * 
 * All calculations are DETERMINISTIC - same inputs always produce the same outputs.
 * No AI, no randomness, no hallucinations.
 */

// ─── Re-export all types ─────────────────────────────────────────────────────

export * from './types';

// ─── Re-export all modules ───────────────────────────────────────────────────

export { calculateLahiriAyanamsa, calculateAllPlanetaryPositions, getPlanetSiderealLongitude, dateToJulianDay, initializeSwissEphemeris, isSwissEphemerisReady, getCalculationMethod, getCalculatorHealthStatus } from './calculator';

export { calculateHouses, generateNorthIndianChart, getHouseLords, getSignToHouseMap, HOUSE_SIGNIFICANCES } from './charts';

export { NAKSHATRAS, getNakshatraInfo, getNakshatraLord, getNakshatraName, getNakshatraBalance, isGandaMoola } from './nakshatra';

export { calculateDashaData, calculateMahadashas, findCurrentDasha, getDashaInterpretation, calculatePratyantardashas } from './dasha';

export { detectAllYogas, detectRajYoga, detectGajKesariYoga, detectNeechBhangRajYoga, detectChandraMangalYoga, detectBudhAdityaYoga, detectHansaYoga, detectMalavyaYoga, detectShashaYoga, detectRuchakaYoga, detectBhadraYoga, detectAmalaYoga, detectVeshiYoga, detectVoshiYoga, detectUbhayachariYoga, detectDhanaYoga, detectVipreetRajYoga } from './yogas';

export { detectAllDoshas, detectMangalDosha, detectKaalSarpDosha, detectPitraDosha, detectSadeSati, detectGrahanDosha, detectShrapitDosha } from './doshas';

export {
  type VargaType,
  type DivisionalChart,
  type DivisionalPosition,
  type NavamshaAnalysis,
  VARGA_METADATA,
  calculateDivisionalChart,
  calculateAllDivisionalCharts,
  analyzeNavamsha,
  calculateDivisionalHouses,
  findVargottamaPlanets,
  evaluateDivisionalStrength,
} from './divisional';

export {
  type KarakaType,
  type KarakaData,
  type AtmakarakaNavamshaInfo,
  type JaiminiRajaYoga,
  JAIMINI_PLANETS,
  JAIMINI_SIGN_KARAKAS,
  calculateKarakas,
  getAtmakaraka,
  getDarakaraka,
  getAmatyakaraka,
  getSignFromAK,
  analyzeAtmakarakaNavamsha,
  detectJaiminiRajaYogas,
} from './jaimini';

export {
  normalizeLongitude,
  longitudeToSignIndex,
  longitudeToSign,
  longitudeToDegreeInSign,
  getSignLord,
  getSignAttributes,
  getHouseFromAscendant,
  isExalted,
  isDebilitated,
  isInOwnSign,
  formatDegrees,
  EXALTATION,
  VIMSHOTTARI_DASHA_YEARS,
  DASHA_SEQUENCE,
  ZODIAC_SIGNS,
  PLANETS,
} from './utils';

export {
  type SwephInitResult,
  type SwephHealthStatus,
  initSweph,
  isSwephReady,
  getSwephHealthStatus,
} from './swiss-ephemeris';

import {
  type KundaliData,
  type BirthDetails,
} from './types';

import { calculateAllPlanetaryPositions } from './calculator';

import { generateNorthIndianChart, calculateHouses } from './charts';

import { getNakshatraInfo } from './nakshatra';

import { calculateDashaData } from './dasha';

import { detectAllYogas } from './yogas';

import { detectAllDoshas } from './doshas';

/**
 * Calculate a complete Kundali (birth chart) from birth details.
 * 
 * This is the main entry point for the astrology engine.
 * Given a birth date, time, and location, it calculates:
 * - All planetary positions (sidereal, with Lahiri ayanamsa)
 * - Ascendant (Lagna)
 * - House placements (whole sign system)
 * - North Indian chart data
 * - Moon's nakshatra details
 * - Vimshottari Dasha periods
 * - Yoga detection (10 major yogas)
 * - Dosha detection (4 major doshas)
 * 
 * @param birthDate - Date of birth
 * @param birthTime - Time of birth as "HH:MM" string (24-hour format)
 * @param latitude - Birth latitude (-90 to 90)
 * @param longitude - Birth longitude (-180 to 180)
 * @param timezoneOffset - Timezone offset from UTC in hours (e.g., 5.5 for IST)
 * @returns Complete KundaliData with all calculations
 * 
 * @example
 * ```typescript
 * const kundali = calculateKundali(
 *   new Date(1990, 5, 15),  // June 15, 1990
 *   "14:30",                 // 2:30 PM
 *   28.6139,                 // New Delhi latitude
 *   77.2090,                 // New Delhi longitude
 *   5.5                      // IST timezone offset
 * );
 * ```
 */
export function calculateKundali(
  birthDate: Date,
  birthTime: string,
  latitude: number,
  longitude: number,
  timezoneOffset: number = 5.5
): KundaliData {
  // Parse birth time and combine with date in a timezone-independent manner
  const [hours, minutes] = birthTime.split(':').map(Number);
  const year = birthDate.getUTCFullYear();
  const month = birthDate.getUTCMonth();
  const dateNum = birthDate.getUTCDate();
  const fullBirthDate = new Date(Date.UTC(year, month, dateNum, hours || 0, minutes || 0, 0, 0));
  
  // Step 1: Calculate all planetary positions
  const { positions, ayanamsa, ascendant } = calculateAllPlanetaryPositions(
    fullBirthDate,
    latitude,
    longitude,
    timezoneOffset
  );
  
  // Step 1b: Assign house numbers to each planet using whole sign system
  // House = ((planetSignIndex - ascendantSignIndex) % 12 + 12) % 12 + 1
  const ascSignIndex = ascendant.signIndex;
  for (const planetName of Object.keys(positions)) {
    const pos = positions[planetName];
    if (pos) {
      pos.house = ((pos.signIndex - ascSignIndex) % 12 + 12) % 12 + 1;
    }
  }
  
  // Step 2: Generate chart and houses
  const chart = generateNorthIndianChart(ascendant, positions);
  const houses = calculateHouses(ascendant, positions);
  
  // Step 3: Calculate Moon's nakshatra details
  const moonSiderealLongitude = positions['Moon']?.siderealLongitude ?? 0;
  const nakshatra = getNakshatraInfo(moonSiderealLongitude);
  
  // Step 4: Calculate Vimshottari Dasha periods
  const dashaPeriods = calculateDashaData(fullBirthDate, moonSiderealLongitude);
  
  // Step 5: Detect yogas
  const yogas = detectAllYogas(positions, ascendant.signIndex);
  
  // Step 6: Detect doshas
  const doshas = detectAllDoshas(positions, ascendant.signIndex, fullBirthDate);
  
  // Build the complete KundaliData
  const kundaliData: KundaliData = {
    birthDate: fullBirthDate.toISOString().split('T')[0],
    birthTime,
    latitude,
    longitude,
    ayanamsa,
    sunSign: positions['Sun']?.sign ?? 'Aries',
    moonSign: positions['Moon']?.sign ?? 'Aries',
    ascendant: ascendant.sign,
    ascendantData: ascendant,
    planetaryPositions: positions,
    houses,
    chart,
    nakshatra,
    dashaPeriods,
    yogas,
    doshas,
  };
  
  return kundaliData;
}

/**
 * Convenience function to calculate kundali from a BirthDetails object.
 */
export function calculateKundaliFromDetails(details: BirthDetails): KundaliData {
  const timeString = `${String(details.date.getHours()).padStart(2, '0')}:${String(details.date.getMinutes()).padStart(2, '0')}`;
  return calculateKundali(
    details.date,
    timeString,
    details.latitude,
    details.longitude,
    details.timezoneOffset
  );
}
