/**
 * AyuAstro - Nakshatra Calculations
 * All 27 nakshatras with their attributes, pada calculations, and nakshatra lords
 */

import {
  type NakshatraInfo,
  type NakshatraData,
  type Planet,
  ZODIAC_SIGNS,
} from './types';

import {
  normalizeLongitude,
  longitudeToNakshatraIndex,
  longitudeToPada,
  DEGREES_PER_NAKSHATRA,
  DEGREES_PER_PADA,
} from './utils';

// ─── Complete 27 Nakshatra Data ──────────────────────────────────────────────

export const NAKSHATRAS: NakshatraInfo[] = [
  { name: 'Ashwini',       index: 0,  ruler: 'Ketu',    startDegree: 0,      endDegree: 13.333,  deity: 'Ashwini Kumaras',  symbol: 'Horse Head',      nature: 'Rakshasa', gender: 'Male',   element: 'Fire',  gana: 'Rakshasa', yoni: 'Horse' },
  { name: 'Bharani',       index: 1,  ruler: 'Venus',   startDegree: 13.333, endDegree: 26.667,  deity: 'Yama',             symbol: 'Yoni',            nature: 'Manushya', gender: 'Female', element: 'Fire',  gana: 'Manushya', yoni: 'Elephant' },
  { name: 'Krittika',      index: 2,  ruler: 'Sun',     startDegree: 26.667, endDegree: 40,      deity: 'Agni',             symbol: 'Razor/Flame',     nature: 'Rakshasa', gender: 'Female', element: 'Fire',  gana: 'Rakshasa', yoni: 'Goat' },
  { name: 'Rohini',        index: 3,  ruler: 'Moon',    startDegree: 40,     endDegree: 53.333,  deity: 'Brahma',           symbol: 'Cart/Chariot',    nature: 'Manushya', gender: 'Female', element: 'Earth', gana: 'Manushya', yoni: 'Serpent' },
  { name: 'Mrigashirsha',  index: 4,  ruler: 'Mars',    startDegree: 53.333, endDegree: 66.667,  deity: 'Soma',             symbol: 'Deer Head',       nature: 'Deva',     gender: 'Male',   element: 'Earth', gana: 'Deva',     yoni: 'Serpent' },
  { name: 'Ardra',         index: 5,  ruler: 'Rahu',    startDegree: 66.667, endDegree: 80,      deity: 'Rudra',            symbol: 'Teardrop',        nature: 'Manushya', gender: 'Female', element: 'Earth', gana: 'Manushya', yoni: 'Dog' },
  { name: 'Punarvasu',     index: 6,  ruler: 'Jupiter', startDegree: 80,     endDegree: 93.333,  deity: 'Aditi',            symbol: 'Bow/Quiver',      nature: 'Deva',     gender: 'Male',   element: 'Air',   gana: 'Deva',     yoni: 'Cat' },
  { name: 'Pushya',        index: 7,  ruler: 'Saturn',  startDegree: 93.333, endDegree: 106.667, deity: 'Brihaspati',       symbol: 'Cow Udder',       nature: 'Deva',     gender: 'Male',   element: 'Fire',  gana: 'Deva',     yoni: 'Goat' },
  { name: 'Ashlesha',      index: 8,  ruler: 'Mercury', startDegree: 106.667, endDegree: 120,     deity: 'Nagas',            symbol: 'Serpent',         nature: 'Rakshasa', gender: 'Female', element: 'Water', gana: 'Rakshasa', yoni: 'Cat' },
  { name: 'Magha',         index: 9,  ruler: 'Ketu',    startDegree: 120,    endDegree: 133.333, deity: 'Pitris',           symbol: 'Royal Throne',    nature: 'Rakshasa', gender: 'Male',   element: 'Fire',  gana: 'Rakshasa', yoni: 'Rat' },
  { name: 'Purva Phalguni', index: 10, ruler: 'Venus',  startDegree: 133.333, endDegree: 146.667, deity: 'Bhaga',           symbol: 'Front Legs of Bed', nature: 'Manushya', gender: 'Female', element: 'Fire',  gana: 'Manushya', yoni: 'Rat' },
  { name: 'Uttara Phalguni', index: 11, ruler: 'Sun',   startDegree: 146.667, endDegree: 160,     deity: 'Aryaman',         symbol: 'Back Legs of Bed',  nature: 'Manushya', gender: 'Male',   element: 'Fire',  gana: 'Manushya', yoni: 'Cow' },
  { name: 'Hasta',         index: 12, ruler: 'Moon',    startDegree: 160,    endDegree: 173.333, deity: 'Savitar',          symbol: 'Hand',            nature: 'Deva',     gender: 'Male',   element: 'Earth', gana: 'Deva',     yoni: 'Buffalo' },
  { name: 'Chitra',        index: 13, ruler: 'Mars',    startDegree: 173.333, endDegree: 186.667, deity: 'Vishwakarma',     symbol: 'Bright Jewel',    nature: 'Rakshasa', gender: 'Female', element: 'Fire',  gana: 'Rakshasa', yoni: 'Tiger' },
  { name: 'Swati',         index: 14, ruler: 'Rahu',    startDegree: 186.667, endDegree: 200,     deity: 'Vayu',             symbol: 'Shoot/Sword',     nature: 'Deva',     gender: 'Male',   element: 'Air',   gana: 'Deva',     yoni: 'Buffalo' },
  { name: 'Vishakha',      index: 15, ruler: 'Jupiter', startDegree: 200,    endDegree: 213.333, deity: 'Indragni',         symbol: 'Triumphal Arch',  nature: 'Manushya', gender: 'Female', element: 'Fire',  gana: 'Manushya', yoni: 'Tiger' },
  { name: 'Anuradha',      index: 16, ruler: 'Saturn',  startDegree: 213.333, endDegree: 226.667, deity: 'Mitra',           symbol: 'Lotus',           nature: 'Deva',     gender: 'Male',   element: 'Fire',  gana: 'Deva',     yoni: 'Deer' },
  { name: 'Jyeshtha',      index: 17, ruler: 'Mercury', startDegree: 226.667, endDegree: 240,     deity: 'Indra',            symbol: 'Earring',         nature: 'Rakshasa', gender: 'Female', element: 'Water', gana: 'Rakshasa', yoni: 'Deer' },
  { name: 'Mula',          index: 18, ruler: 'Ketu',    startDegree: 240,    endDegree: 253.333, deity: 'Nirriti',          symbol: 'Root/Tied Bunch', nature: 'Rakshasa', gender: 'Female', element: 'Fire',  gana: 'Rakshasa', yoni: 'Dog' },
  { name: 'Purva Ashadha', index: 19, ruler: 'Venus',   startDegree: 253.333, endDegree: 266.667, deity: 'Apah',            symbol: 'Elephant Tusk',   nature: 'Manushya', gender: 'Male',   element: 'Water', gana: 'Manushya', yoni: 'Monkey' },
  { name: 'Uttara Ashadha', index: 20, ruler: 'Sun',    startDegree: 266.667, endDegree: 280,     deity: 'Vishvedevas',     symbol: 'Elephant Tusk',   nature: 'Manushya', gender: 'Male',   element: 'Fire',  gana: 'Manushya', yoni: 'Cow' },
  { name: 'Shravana',      index: 21, ruler: 'Moon',    startDegree: 280,    endDegree: 293.333, deity: 'Vishnu',           symbol: 'Ear/Three Footprints', nature: 'Deva', gender: 'Male',   element: 'Air',   gana: 'Deva',     yoni: 'Monkey' },
  { name: 'Dhanishtha',    index: 22, ruler: 'Mars',    startDegree: 293.333, endDegree: 306.667, deity: 'Vasus',           symbol: 'Drum',            nature: 'Rakshasa', gender: 'Female', element: 'Fire',  gana: 'Rakshasa', yoni: 'Lion' },
  { name: 'Shatabhisha',   index: 23, ruler: 'Rahu',    startDegree: 306.667, endDegree: 320,     deity: 'Varuna',           symbol: 'Empty Circle',    nature: 'Rakshasa', gender: 'Female', element: 'Air',   gana: 'Rakshasa', yoni: 'Horse' },
  { name: 'Purva Bhadrapada', index: 24, ruler: 'Jupiter', startDegree: 320,  endDegree: 333.333, deity: 'Aja Ekapada',    symbol: 'Front Legs of Funeral Cot', nature: 'Manushya', gender: 'Male', element: 'Fire',  gana: 'Manushya', yoni: 'Lion' },
  { name: 'Uttara Bhadrapada', index: 25, ruler: 'Saturn', startDegree: 333.333, endDegree: 346.667, deity: 'Ahir Budhnya', symbol: 'Back Legs of Funeral Cot', nature: 'Manushya', gender: 'Female', element: 'Water', gana: 'Manushya', yoni: 'Cow' },
  { name: 'Revati',        index: 26, ruler: 'Mercury', startDegree: 346.667, endDegree: 360,     deity: 'Pushan',           symbol: 'Fish/Pair of Fish', nature: 'Deva',   gender: 'Female', element: 'Water', gana: 'Deva',     yoni: 'Elephant' },
];

// ─── Nakshatra Calculation Functions ─────────────────────────────────────────

/** Get full nakshatra info for a given sidereal longitude */
export function getNakshatraInfo(longitude: number): NakshatraData {
  const siderealLon = normalizeLongitude(longitude);
  const nakshatraIndex = longitudeToNakshatraIndex(siderealLon);
  const nakshatra = NAKSHATRAS[nakshatraIndex];
  const pada = longitudeToPada(siderealLon);

  return {
    name: nakshatra.name,
    index: nakshatra.index,
    pada,
    ruler: nakshatra.ruler,
    deity: nakshatra.deity,
    symbol: nakshatra.symbol,
    startDegree: nakshatra.startDegree,
    endDegree: nakshatra.endDegree,
  };
}

/** Get nakshatra lord (dasha lord) for a given longitude */
export function getNakshatraLord(longitude: number): Planet {
  const index = longitudeToNakshatraIndex(normalizeLongitude(longitude));
  return NAKSHATRAS[index].ruler;
}

/** Get nakshatra name from index */
export function getNakshatraName(index: number): string {
  return NAKSHATRAS[index % 27]?.name ?? 'Unknown';
}

/** Get the sign that a nakshatra pada falls in */
export function getNakshatraPadaSign(nakshatraIndex: number, pada: number): string {
  const nakshatra = NAKSHATRAS[nakshatraIndex % 27];
  if (!nakshatra) return 'Aries';
  const padaStartDegree = nakshatra.startDegree + (pada - 1) * DEGREES_PER_PADA;
  const signIndex = Math.floor(padaStartDegree / 30);
  return ZODIAC_SIGNS[signIndex % 12];
}

/** Get all nakshatras that fall in a given sign */
export function getNakshatrasInSign(signIndex: number): NakshatraInfo[] {
  const signStart = signIndex * 30;
  const signEnd = signStart + 30;
  return NAKSHATRAS.filter(n => {
    // A nakshatra overlaps a sign if any part of it is within the sign's range
    return n.startDegree < signEnd && n.endDegree > signStart;
  });
}

/** Calculate nakshatra balance at birth (remaining degrees in current nakshatra) */
export function getNakshatraBalance(longitude: number): number {
  const siderealLon = normalizeLongitude(longitude);
  const nakshatraIndex = longitudeToNakshatraIndex(siderealLon);
  const nakshatra = NAKSHATRAS[nakshatraIndex];
  const remainingDegrees = nakshatra.endDegree - siderealLon;
  return remainingDegrees;
}

/** Calculate the fraction of the nakshatra already traversed at birth */
export function getNakshatraFractionTraversed(longitude: number): number {
  const siderealLon = normalizeLongitude(longitude);
  const nakshatraIndex = longitudeToNakshatraIndex(siderealLon);
  const nakshatra = NAKSHATRAS[nakshatraIndex];
  const traversed = siderealLon - nakshatra.startDegree;
  return traversed / DEGREES_PER_NAKSHATRA;
}

// ─── Nakshatra Compatibility ─────────────────────────────────────────────────

/** Get matching yoni (animal) for compatibility */
export function getYoniMatch(yoni1: string, yoni2: string): 'Excellent' | 'Good' | 'Neutral' | 'Poor' {
  const yoniPairs: Record<string, string> = {
    'Horse': 'Serpent',
    'Serpent': 'Horse',
    'Elephant': 'Lion',
    'Lion': 'Elephant',
    'Goat': 'Monkey',
    'Monkey': 'Goat',
    'Dog': 'Deer',
    'Deer': 'Dog',
    'Cat': 'Rat',
    'Rat': 'Cat',
    'Cow': 'Tiger',
    'Tiger': 'Cow',
    'Buffalo': 'Buffalo',
  };

  if (yoni1 === yoni2) return 'Excellent';
  if (yoniPairs[yoni1] === yoni2) return 'Good';
  return 'Neutral';
}

/** Get nakshatra info by name */
export function getNakshatraByName(name: string): NakshatraInfo | undefined {
  return NAKSHATRAS.find(n => n.name.toLowerCase() === name.toLowerCase());
}

/** Check if a nakshatra is a Ganda Moola nakshatra */
export function isGandaMoola(nakshatraName: string): boolean {
  const gandaMoola = ['Ashwini', 'Magha', 'Mula', 'Ashlesha', 'Jyeshtha', 'Revati'];
  return gandaMoola.some(n => nakshatraName === n);
}

/** Check if a nakshatra is an Abhukta Moola */
export function isAbhuktaMoola(nakshatraName: string, pada: number): boolean {
  return nakshatraName === 'Mula' && pada === 1;
}
