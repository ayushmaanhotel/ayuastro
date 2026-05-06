/**
 * AyuAstro - Vimshottari Dasha Calculations
 * 
 * Vimshottari Dasha is the most widely used dasha system in Vedic astrology.
 * It is based on the Moon's nakshatra at birth, with a total cycle of 120 years.
 * 
 * Each of the 9 planets rules 3 nakshatras and has a specific dasha period:
 * - Ketu: 7 years    - Venus: 20 years   - Sun: 6 years
 * - Moon: 10 years   - Mars: 7 years     - Rahu: 18 years
 * - Jupiter: 16 years - Saturn: 19 years  - Mercury: 17 years
 * 
 * The sequence follows the nakshatra order: Ketu, Venus, Sun, Moon, Mars, Rahu, Jupiter, Saturn, Mercury
 */

import {
  type DashaData,
  type MahadashaPeriod,
  type AntardashaPeriod,
  type Planet,
} from './types';

import {
  DASHA_SEQUENCE,
  VIMSHOTTARI_DASHA_YEARS,
  VIMSHOTTARI_TOTAL_YEARS,
  longitudeToNakshatraIndex,
  normalizeLongitude,
  DEGREES_PER_NAKSHATRA,
} from './utils';

import { getNakshatraFractionTraversed, NAKSHATRAS } from './nakshatra';

// ─── Helper: Add years to a Date ─────────────────────────────────────────────

function addYearsToDate(date: Date, years: number): Date {
  const result = new Date(date);
  // Use approximate: 1 year = 365.25 days for accuracy with leap years
  const milliseconds = years * 365.25 * 24 * 60 * 60 * 1000;
  result.setTime(result.getTime() + milliseconds);
  return result;
}

function addDaysToDate(date: Date, days: number): Date {
  const result = new Date(date);
  result.setTime(result.getTime() + days * 24 * 60 * 60 * 1000);
  return result;
}

// ─── Dasha Period Calculation ────────────────────────────────────────────────

/**
 * Calculate the balance of the first dasha at birth.
 * This is the remaining portion of the nakshatra lord's mahadasha.
 * 
 * @param moonSiderealLongitude - Moon's sidereal longitude (0-360)
 * @returns Object with the starting dasha lord and the fraction already elapsed
 */
function calculateBirthDashaBalance(moonSiderealLongitude: number): {
  startLord: Planet;
  fractionElapsed: number;
  fractionRemaining: number;
} {
  const nakshatraIndex = longitudeToNakshatraIndex(moonSiderealLongitude);
  const nakshatraLord = NAKSHATRAS[nakshatraIndex].ruler as Planet;
  const fractionElapsed = getNakshatraFractionTraversed(moonSiderealLongitude);
  const fractionRemaining = 1 - fractionElapsed;

  return {
    startLord: nakshatraLord,
    fractionElapsed,
    fractionRemaining,
  };
}

// ─── Mahadasha Calculations ──────────────────────────────────────────────────

/**
 * Calculate all Mahadasha periods for a 120-year cycle starting from birth.
 * The first dasha is the Moon's nakshatra lord, with balance proportionally reduced.
 */
export function calculateMahadashas(
  birthDate: Date,
  moonSiderealLongitude: number
): MahadashaPeriod[] {
  const { startLord, fractionRemaining } = calculateBirthDashaBalance(moonSiderealLongitude);
  const dashas: MahadashaPeriod[] = [];
  
  // Find the starting position in the dasha sequence
  const startIndex = DASHA_SEQUENCE.indexOf(startLord);
  if (startIndex === -1) return dashas;
  
  let currentDate = new Date(birthDate);
  
  // First mahadasha has reduced duration (balance at birth)
  const firstDurationYears = VIMSHOTTARI_DASHA_YEARS[startLord] * fractionRemaining;
  const firstEndDate = addYearsToDate(currentDate, firstDurationYears);
  
  dashas.push({
    planet: startLord,
    startDate: new Date(currentDate),
    endDate: firstEndDate,
    durationYears: firstDurationYears,
    antardashas: [], // Will be calculated below
  });
  
  currentDate = new Date(firstEndDate);
  
  // Subsequent mahadashas follow the standard sequence
  for (let i = 1; i < 9; i++) {
    const planetIndex = (startIndex + i) % 9;
    const planet = DASHA_SEQUENCE[planetIndex];
    const duration = VIMSHOTTARI_DASHA_YEARS[planet];
    const endDate = addYearsToDate(currentDate, duration);
    
    dashas.push({
      planet,
      startDate: new Date(currentDate),
      endDate,
      durationYears: duration,
      antardashas: [],
    });
    
    currentDate = new Date(endDate);
  }
  
  // Calculate antardashas for each mahadasha
  for (const dasha of dashas) {
    dasha.antardashas = calculateAntardashas(dasha);
  }
  
  return dashas;
}

// ─── Antardasha Calculations ─────────────────────────────────────────────────

/**
 * Calculate Antardasha (sub-periods) within a Mahadasha.
 * The antardasha sequence starts from the mahadasha lord itself,
 * then follows the standard dasha sequence.
 * 
 * Duration: Each antardasha is proportional to the planet's mahadasha years
 * relative to the total 120-year cycle.
 */
export function calculateAntardashas(mahadasha: MahadashaPeriod): AntardashaPeriod[] {
  const antardashas: AntardashaPeriod[] = [];
  const mahadashaPlanet = mahadasha.planet;
  const mahadashaDurationMs = mahadasha.endDate.getTime() - mahadasha.startDate.getTime();
  
  // Antardasha starts from the mahadasha lord itself
  const startIndex = DASHA_SEQUENCE.indexOf(mahadashaPlanet);
  
  let currentDate = new Date(mahadasha.startDate);
  
  for (let i = 0; i < 9; i++) {
    const planetIndex = (startIndex + i) % 9;
    const planet = DASHA_SEQUENCE[planetIndex];
    
    // Antardasha duration = (Mahadasha years * Antardasha planet years) / 120
    const antardashaYears = (mahadasha.durationYears * VIMSHOTTARI_DASHA_YEARS[planet]) / VIMSHOTTARI_TOTAL_YEARS;
    
    // Use proportional time from the mahadasha duration
    const proportion = VIMSHOTTARI_DASHA_YEARS[planet] / VIMSHOTTARI_TOTAL_YEARS;
    const antardashaDurationMs = mahadashaDurationMs * proportion;
    
    const endDate = new Date(currentDate.getTime() + antardashaDurationMs);
    
    antardashas.push({
      planet,
      startDate: new Date(currentDate),
      endDate,
      durationYears: antardashaYears,
    });
    
    currentDate = new Date(endDate);
  }
  
  return antardashas;
}

// ─── Current Dasha ───────────────────────────────────────────────────────────

/**
 * Find the currently running Mahadasha and Antardasha for a given date.
 */
export function findCurrentDasha(
  mahadashas: MahadashaPeriod[],
  referenceDate: Date = new Date()
): { currentMahadasha: MahadashaPeriod | null; currentAntardasha: AntardashaPeriod | null } {
  let currentMahadasha: MahadashaPeriod | null = null;
  let currentAntardasha: AntardashaPeriod | null = null;
  
  for (const dasha of mahadashas) {
    if (referenceDate >= dasha.startDate && referenceDate < dasha.endDate) {
      currentMahadasha = dasha;
      
      // Find the current antardasha within this mahadasha
      for (const antardasha of dasha.antardashas) {
        if (referenceDate >= antardasha.startDate && referenceDate < antardasha.endDate) {
          currentAntardasha = antardasha;
          break;
        }
      }
      break;
    }
  }
  
  return { currentMahadasha, currentAntardasha };
}

// ─── Pratyantardasha (Sub-sub period) ────────────────────────────────────────

/**
 * Calculate Pratyantardasha periods within an Antardasha.
 * Similar logic to Antardasha within Mahadasha.
 */
export function calculatePratyantardashas(
  antardasha: AntardashaPeriod,
  mahadashaPlanet: Planet
): Array<{ planet: Planet; startDate: Date; endDate: Date; durationYears: number }> {
  const pratyantardashas: Array<{ planet: Planet; startDate: Date; endDate: Date; durationYears: number }> = [];
  const antardashaDurationMs = antardasha.endDate.getTime() - antardasha.startDate.getTime();
  
  const startIndex = DASHA_SEQUENCE.indexOf(antardasha.planet);
  let currentDate = new Date(antardasha.startDate);
  
  for (let i = 0; i < 9; i++) {
    const planetIndex = (startIndex + i) % 9;
    const planet = DASHA_SEQUENCE[planetIndex];
    
    const proportion = VIMSHOTTARI_DASHA_YEARS[planet] / VIMSHOTTARI_TOTAL_YEARS;
    const durationMs = antardashaDurationMs * proportion;
    const durationYears = (antardasha.durationYears * VIMSHOTTARI_DASHA_YEARS[planet]) / VIMSHOTTARI_TOTAL_YEARS;
    
    const endDate = new Date(currentDate.getTime() + durationMs);
    
    pratyantardashas.push({
      planet,
      startDate: new Date(currentDate),
      endDate,
      durationYears,
    });
    
    currentDate = new Date(endDate);
  }
  
  return pratyantardashas;
}

// ─── Complete Dasha Data ─────────────────────────────────────────────────────

/**
 * Calculate the complete Dasha data for a birth chart.
 */
export function calculateDashaData(
  birthDate: Date,
  moonSiderealLongitude: number
): DashaData {
  const mahadashas = calculateMahadashas(birthDate, moonSiderealLongitude);
  const { currentMahadasha, currentAntardasha } = findCurrentDasha(mahadashas);
  
  const nakshatraIndex = longitudeToNakshatraIndex(moonSiderealLongitude);
  const moonNakshatraLord = NAKSHATRAS[nakshatraIndex].ruler as Planet;
  
  // The dasha start date is the birth date (first dasha begins at birth)
  const dashaStartDate = new Date(birthDate);
  
  return {
    currentMahadasha,
    currentAntardasha,
    allMahadashas: mahadashas,
    moonNakshatraLord,
    dashaStartDate,
  };
}

// ─── Dasha Interpretation ────────────────────────────────────────────────────

/**
 * Get a brief interpretation of a Mahadasha period.
 */
export function getDashaInterpretation(planet: Planet): {
  generalEffect: string;
  areasAffected: string[];
} {
  const interpretations: Record<string, { generalEffect: string; areasAffected: string[] }> = {
    Sun: {
      generalEffect: 'Period of authority, self-expression, and spiritual growth',
      areasAffected: ['Career', 'Government', 'Father', 'Health', 'Vitality'],
    },
    Moon: {
      generalEffect: 'Period of emotional sensitivity, domestic life, and public relations',
      areasAffected: ['Mind', 'Mother', 'Home', 'Public Life', 'Emotions'],
    },
    Mars: {
      generalEffect: 'Period of energy, courage, property, and potential conflicts',
      areasAffected: ['Energy', 'Property', 'Siblings', 'Courage', 'Accidents'],
    },
    Mercury: {
      generalEffect: 'Period of intellectual pursuits, communication, and business',
      areasAffected: ['Education', 'Business', 'Communication', 'Intellect', 'Friends'],
    },
    Jupiter: {
      generalEffect: 'Period of wisdom, expansion, spirituality, and good fortune',
      areasAffected: ['Wisdom', 'Children', 'Wealth', 'Spirituality', 'Education'],
    },
    Venus: {
      generalEffect: 'Period of love, luxury, creativity, and material pleasures',
      areasAffected: ['Marriage', 'Luxury', 'Creativity', 'Arts', 'Relationships'],
    },
    Saturn: {
      generalEffect: 'Period of discipline, hard work, delays, and life lessons',
      areasAffected: ['Career', 'Longevity', 'Discipline', 'Service', 'Challenges'],
    },
    Rahu: {
      generalEffect: 'Period of ambition, worldly desires, sudden changes, and illusions',
      areasAffected: ['Ambition', 'Foreign', 'Technology', 'Sudden Events', 'Desires'],
    },
    Ketu: {
      generalEffect: 'Period of spirituality, detachment, liberation, and past-life influences',
      areasAffected: ['Spirituality', 'Detachment', 'Past Life', 'Moksha', 'Research'],
    },
  };
  
  return interpretations[planet] || { generalEffect: 'Unknown period', areasAffected: [] };
}
