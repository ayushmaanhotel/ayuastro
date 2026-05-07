/**
 * AyuAstro - Astrology Utility Functions
 * Helper functions for zodiac signs, planetary relationships, and conversions
 */

import {
  type ZodiacSign,
  type Planet,
  type Element,
  type Modality,
  type Gender,
  type Relationship,
  type ZodiacSignAttributes,
  ZODIAC_SIGNS,
  PLANETS,
} from './types';

// Re-export constants from types for convenience
export { ZODIAC_SIGNS, PLANETS } from './types';

// ─── Constants ───────────────────────────────────────────────────────────────

/** Degrees per zodiac sign */
export const DEGREES_PER_SIGN = 30;

/** Total degrees in the zodiac */
export const TOTAL_DEGREES = 360;

/** Number of zodiac signs */
export const NUM_SIGNS = 12;

/** Number of nakshatras */
export const NUM_NAKSHATRAS = 27;

/** Degrees per nakshatra */
export const DEGREES_PER_NAKSHATRA = 360 / 27; // 13°20'

/** Degrees per nakshatra pada */
export const DEGREES_PER_PADA = DEGREES_PER_NAKSHATRA / 4; // 3°20'

// ─── Degree <-> Sign Conversions ─────────────────────────────────────────────

/** Normalize any longitude to 0-360 range */
export function normalizeLongitude(deg: number): number {
  const mod = deg % TOTAL_DEGREES;
  return mod < 0 ? mod + TOTAL_DEGREES : mod;
}

/** Convert sidereal longitude to zodiac sign index (0-11) */
export function longitudeToSignIndex(longitude: number): number {
  return Math.floor(normalizeLongitude(longitude) / DEGREES_PER_SIGN);
}

/** Convert sidereal longitude to zodiac sign name */
export function longitudeToSign(longitude: number): ZodiacSign {
  return ZODIAC_SIGNS[longitudeToSignIndex(longitude)];
}

/** Get degree within sign (0-30) */
export function longitudeToDegreeInSign(longitude: number): number {
  return normalizeLongitude(longitude) % DEGREES_PER_SIGN;
}

/** Convert sign index + degree to full longitude */
export function signIndexToLongitude(signIndex: number, degreeInSign: number = 0): number {
  return signIndex * DEGREES_PER_SIGN + degreeInSign;
}

// ─── Nakshatra Conversions ───────────────────────────────────────────────────

/** Convert longitude to nakshatra index (0-26) */
export function longitudeToNakshatraIndex(longitude: number): number {
  return Math.floor(normalizeLongitude(longitude) / DEGREES_PER_NAKSHATRA);
}

/** Get nakshatra pada (1-4) from longitude */
export function longitudeToPada(longitude: number): number {
  const degInNakshatra = normalizeLongitude(longitude) % DEGREES_PER_NAKSHATRA;
  return Math.floor(degInNakshatra / DEGREES_PER_PADA) + 1;
}

// ─── Sign Attributes ─────────────────────────────────────────────────────────

const SIGN_ATTRIBUTES: ZodiacSignAttributes[] = [
  { sign: 'Aries',       ruler: 'Mars',    element: 'Fire',  modality: 'Movable', gender: 'Male',   symbol: '♈', degrees: 0 },
  { sign: 'Taurus',      ruler: 'Venus',   element: 'Earth', modality: 'Fixed',   gender: 'Female', symbol: '♉', degrees: 0 },
  { sign: 'Gemini',      ruler: 'Mercury', element: 'Air',   modality: 'Dual',    gender: 'Male',   symbol: '♊', degrees: 0 },
  { sign: 'Cancer',      ruler: 'Moon',    element: 'Water', modality: 'Movable', gender: 'Female', symbol: '♋', degrees: 0 },
  { sign: 'Leo',         ruler: 'Sun',     element: 'Fire',  modality: 'Fixed',   gender: 'Male',   symbol: '♌', degrees: 0 },
  { sign: 'Virgo',       ruler: 'Mercury', element: 'Earth', modality: 'Dual',    gender: 'Female', symbol: '♍', degrees: 0 },
  { sign: 'Libra',       ruler: 'Venus',   element: 'Air',   modality: 'Movable', gender: 'Male',   symbol: '♎', degrees: 0 },
  { sign: 'Scorpio',     ruler: 'Mars',    element: 'Water', modality: 'Fixed',   gender: 'Female', symbol: '♏', degrees: 0 },
  { sign: 'Sagittarius', ruler: 'Jupiter', element: 'Fire',  modality: 'Dual',    gender: 'Male',   symbol: '♐', degrees: 0 },
  { sign: 'Capricorn',   ruler: 'Saturn',  element: 'Earth', modality: 'Movable', gender: 'Female', symbol: '♑', degrees: 0 },
  { sign: 'Aquarius',    ruler: 'Saturn',  element: 'Air',   modality: 'Fixed',   gender: 'Male',   symbol: '♒', degrees: 0 },
  { sign: 'Pisces',      ruler: 'Jupiter', element: 'Water', modality: 'Dual',    gender: 'Female', symbol: '♓', degrees: 0 },
];

export function getSignAttributes(sign: ZodiacSign): ZodiacSignAttributes {
  return SIGN_ATTRIBUTES[ZODIAC_SIGNS.indexOf(sign)];
}

export function getSignByIndex(index: number): ZodiacSign {
  return ZODIAC_SIGNS[index % NUM_SIGNS];
}

export function getSignIndex(sign: ZodiacSign): number {
  return ZODIAC_SIGNS.indexOf(sign);
}

/** Get the ruler (lord) of a zodiac sign */
export function getSignLord(sign: ZodiacSign): Planet {
  return SIGN_ATTRIBUTES[ZODIAC_SIGNS.indexOf(sign)].ruler;
}

/** Get the ruler of a house by its sign */
export function getHouseLord(houseSign: ZodiacSign): Planet {
  return getSignLord(houseSign);
}

// ─── Exaltation & Debilitation ───────────────────────────────────────────────

/** Planet exaltation sign and degree */
export const EXALTATION: Record<string, { sign: ZodiacSign; degree: number }> = {
  Sun:     { sign: 'Aries',       degree: 10 },
  Moon:    { sign: 'Taurus',      degree: 3 },
  Mars:    { sign: 'Capricorn',   degree: 28 },
  Mercury: { sign: 'Virgo',       degree: 15 },
  Jupiter: { sign: 'Cancer',      degree: 5 },
  Venus:   { sign: 'Pisces',      degree: 27 },
  Saturn:  { sign: 'Libra',       degree: 20 },
  Rahu:    { sign: 'Gemini',      degree: 15 },
  Ketu:    { sign: 'Sagittarius', degree: 15 },
};

/** Get debilitation sign for a planet (opposite of exaltation) */
export function getDebilitation(planet: string): { sign: ZodiacSign; degree: number } | null {
  const exalt = EXALTATION[planet];
  if (!exalt) return null;
  const exaltIndex = ZODIAC_SIGNS.indexOf(exalt.sign);
  const debilIndex = (exaltIndex + 6) % 12;
  return {
    sign: ZODIAC_SIGNS[debilIndex],
    degree: DEGREES_PER_SIGN - exalt.degree,
  };
}

/** Check if a planet is in its exaltation sign */
export function isExalted(planet: Planet, sign: ZodiacSign): boolean {
  return EXALTATION[planet]?.sign === sign;
}

/** Check if a planet is in its debilitation sign */
export function isDebilitated(planet: Planet, sign: ZodiacSign): boolean {
  return getDebilitation(planet)?.sign === sign;
}

/** Check if a planet is in its own sign */
export function isInOwnSign(planet: Planet, sign: ZodiacSign): boolean {
  return getSignLord(sign) === planet;
}

// ─── Moolatrikona Signs ─────────────────────────────────────────────────────

export const MOOLATRIKONA: Record<string, ZodiacSign> = {
  Sun:     'Leo',
  Moon:    'Taurus',
  Mars:    'Aries',
  Mercury: 'Virgo',
  Jupiter: 'Sagittarius',
  Venus:   'Libra',
  Saturn:  'Aquarius',
};

/** Check if a planet is in Moolatrikona */
export function isInMoolatrikona(planet: Planet, sign: ZodiacSign): boolean {
  return MOOLATRIKONA[planet] === sign;
}

// ─── Planetary Relationships (Permanent/Naisargik) ───────────────────────────

const PERMANENT_FRIENDS: Record<string, Planet[]> = {
  Sun:     ['Moon', 'Mars', 'Jupiter'],
  Moon:    ['Sun', 'Mercury'],
  Mars:    ['Sun', 'Moon', 'Jupiter'],
  Mercury: ['Sun', 'Venus'],
  Jupiter: ['Sun', 'Moon', 'Mars'],
  Venus:   ['Mercury', 'Saturn'],
  Saturn:  ['Mercury', 'Venus'],
  Rahu:    ['Mercury', 'Venus', 'Saturn'],
  Ketu:    ['Mercury', 'Venus', 'Saturn'],
};

const PERMANENT_ENEMIES: Record<string, Planet[]> = {
  Sun:     ['Venus', 'Saturn'],
  Moon:    ['Rahu', 'Ketu'],
  Mars:    ['Mercury'],
  Mercury: ['Moon', 'Mars'],
  Jupiter: ['Mercury', 'Venus'],
  Venus:   ['Sun', 'Moon'],
  Saturn:  ['Sun', 'Moon', 'Mars'],
  Rahu:    ['Sun', 'Moon', 'Mars'],
  Ketu:    ['Sun', 'Moon', 'Mars'],
};

/** Get permanent relationship between two planets */
export function getPermanentRelationship(planet1: Planet, planet2: Planet): Relationship {
  if (planet1 === planet2) return 'Neutral';
  const friends = PERMANENT_FRIENDS[planet1] || [];
  const enemies = PERMANENT_ENEMIES[planet1] || [];
  if (friends.includes(planet2)) return 'Friend';
  if (enemies.includes(planet2)) return 'Enemy';
  return 'Neutral';
}

/** Get temporary relationship based on house placement from the planet */
export function getTemporaryRelationship(
  planet1: Planet,
  planet1SignIndex: number,
  planet2SignIndex: number
): Relationship {
  // Temporary friends: planets in 2,3,4,10,11,12 houses from the reference planet
  const diff = ((planet2SignIndex - planet1SignIndex) % NUM_SIGNS + NUM_SIGNS) % NUM_SIGNS;
  // Houses are 1-based, diff is 0-based (so diff 0 = 1st house, etc.)
  const houseFromPlanet = diff + 1;
  const friendlyHouses = [2, 3, 4, 10, 11, 12];
  if (friendlyHouses.includes(houseFromPlanet)) return 'Friend';
  return 'Enemy';
}

/** Get combined (Panchadha) relationship */
export function getCombinedRelationship(
  permanent: Relationship,
  temporary: Relationship
): Relationship {
  const score = relationshipScore(permanent) + relationshipScore(temporary);
  if (score >= 5) return 'Great Friend';
  if (score >= 3) return 'Friend';
  if (score >= 1) return 'Neutral';
  if (score >= -1) return 'Enemy';
  return 'Great Enemy';
}

function relationshipScore(rel: Relationship): number {
  switch (rel) {
    case 'Great Friend': return 4;
    case 'Friend': return 3;
    case 'Neutral': return 2;
    case 'Enemy': return 1;
    case 'Great Enemy': return 0;
  }
}

// ─── Combustion ──────────────────────────────────────────────────────────────

/** Approximate combustion degrees for planets (from the Sun) */
export const COMBUSTION_DEGREES: Record<string, number> = {
  Moon:     12,
  Mars:     17,
  Mercury:  14, // varies with retrograde, using average
  Jupiter:  11,
  Venus:    10, // varies with retrograde, using average
  Saturn:   15,
};

/** Check if a planet is combust (too close to the Sun) */
export function isCombust(
  planet: Planet,
  planetLongitude: number,
  sunLongitude: number
): boolean {
  if (planet === 'Sun' || planet === 'Rahu' || planet === 'Ketu') return false;
  const diff = Math.abs(planetLongitude - sunLongitude);
  const normalizedDiff = Math.min(diff, TOTAL_DEGREES - diff);
  const combustDeg = COMBUSTION_DEGREES[planet];
  if (combustDeg === undefined) return false;
  return normalizedDiff < combustDeg;
}

// ─── House Calculations ──────────────────────────────────────────────────────

/** Get the house number (1-12) that a planet occupies relative to the ascendant */
export function getHouseFromAscendant(planetSignIndex: number, ascendantSignIndex: number): number {
  return ((planetSignIndex - ascendantSignIndex) % NUM_SIGNS + NUM_SIGNS) % NUM_SIGNS + 1;
}

/** Get the sign index for a given house number from ascendant */
export function getSignIndexForHouse(houseNumber: number, ascendantSignIndex: number): number {
  return (ascendantSignIndex + houseNumber - 1) % NUM_SIGNS;
}

// ─── Angular Distance ────────────────────────────────────────────────────────

/** Calculate the shortest angular distance between two longitudes */
export function angularDistance(lon1: number, lon2: number): number {
  const diff = Math.abs(lon1 - lon2);
  return Math.min(diff, TOTAL_DEGREES - diff);
}

// ─── Kendra & Trikona Houses ─────────────────────────────────────────────────

/** Kendra houses: 1, 4, 7, 10 (angular houses) */
export const KENDRA_HOUSES = [1, 4, 7, 10];

/** Trikona houses: 1, 5, 9 (trine houses) */
export const TRIKONA_HOUSES = [1, 5, 9];

/** Check if a house is a Kendra house */
export function isKendraHouse(house: number): boolean {
  return KENDRA_HOUSES.includes(house);
}

/** Check if a house is a Trikona house */
export function isTrikonaHouse(house: number): boolean {
  return TRIKONA_HOUSES.includes(house);
}

// ─── Benefic & Malefic Planets ───────────────────────────────────────────────

export const NATURAL_BENEFICS: Planet[] = ['Jupiter', 'Venus', 'Mercury', 'Moon'];
export const NATURAL_MALEFICS: Planet[] = ['Sun', 'Mars', 'Saturn', 'Rahu', 'Ketu'];

/** Functional benefic/malefic depends on ascendant */
export function getFunctionalBenefics(ascendant: ZodiacSign): Planet[] {
  const lord = getSignLord(ascendant);
  const benefics: Planet[] = [lord];

  // General rules for functional benefics based on ascendant lordship
  switch (ascendant) {
    case 'Aries':
      benefics.push('Jupiter', 'Sun', 'Mars');
      break;
    case 'Taurus':
      benefics.push('Saturn', 'Jupiter');
      break;
    case 'Gemini':
      benefics.push('Venus', 'Saturn');
      break;
    case 'Cancer':
      benefics.push('Jupiter', 'Mars');
      break;
    case 'Leo':
      benefics.push('Jupiter', 'Mars', 'Sun');
      break;
    case 'Virgo':
      benefics.push('Venus', 'Mercury');
      break;
    case 'Libra':
      benefics.push('Saturn', 'Mercury');
      break;
    case 'Scorpio':
      benefics.push('Jupiter', 'Moon', 'Mars');
      break;
    case 'Sagittarius':
      benefics.push('Jupiter', 'Mars', 'Sun');
      break;
    case 'Capricorn':
      benefics.push('Venus', 'Saturn', 'Mercury');
      break;
    case 'Aquarius':
      benefics.push('Venus', 'Saturn');
      break;
    case 'Pisces':
      benefics.push('Jupiter', 'Moon', 'Mars');
      break;
  }

  return Array.from(new Set(benefics));
}

// ─── Misc Helpers ────────────────────────────────────────────────────────────

/** Get the opposite sign (7th from given sign) */
export function getOppositeSign(sign: ZodiacSign): ZodiacSign {
  const idx = ZODIAC_SIGNS.indexOf(sign);
  return ZODIAC_SIGNS[(idx + 6) % 12];
}

/** Get sign that is N houses away */
export function getSignAtDistance(sign: ZodiacSign, housesAway: number): ZodiacSign {
  const idx = ZODIAC_SIGNS.indexOf(sign);
  return ZODIAC_SIGNS[(idx + housesAway) % 12];
}

/** Format degrees as D°M'S" */
export function formatDegrees(decimalDegrees: number): string {
  const d = Math.floor(decimalDegrees);
  const mFull = (decimalDegrees - d) * 60;
  const m = Math.floor(mFull);
  const s = Math.floor((mFull - m) * 60);
  return `${d}°${m}'${s}"`;
}

/** Dasha period in years for each planet in Vimshottari system */
export const VIMSHOTTARI_DASHA_YEARS: Record<string, number> = {
  Ketu:    7,
  Venus:   20,
  Sun:     6,
  Moon:    10,
  Mars:    7,
  Rahu:    18,
  Jupiter: 16,
  Saturn:  19,
  Mercury: 17,
};

/** Total Vimshottari Dasha cycle in years */
export const VIMSHOTTARI_TOTAL_YEARS = 120;

/** Dasha sequence order */
export const DASHA_SEQUENCE: Planet[] = [
  'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'
];

/** Planets that are considered for Panch Mahapurusha Yogas */
export const PANCH_MAHAPURUSHA_PLANETS: Planet[] = ['Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

/** Signs owned by each planet for Panch Mahapurusha Yoga check */
export const OWNED_SIGNS: Record<string, ZodiacSign[]> = {
  Mars:    ['Aries', 'Scorpio'],
  Mercury: ['Gemini', 'Virgo'],
  Jupiter: ['Sagittarius', 'Pisces'],
  Venus:   ['Taurus', 'Libra'],
  Saturn:  ['Capricorn', 'Aquarius'],
};

/** Element to sign mapping */
export function getSignsByElement(element: Element): ZodiacSign[] {
  return SIGN_ATTRIBUTES.filter(a => a.element === element).map(a => a.sign);
}

/** Modality to sign mapping */
export function getSignsByModality(modality: Modality): ZodiacSign[] {
  return SIGN_ATTRIBUTES.filter(a => a.modality === modality).map(a => a.sign);
}
