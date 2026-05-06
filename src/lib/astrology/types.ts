/**
 * AyuAstro - Vedic Astrology Type Definitions
 * All types for the deterministic astrology calculation engine
 */

// ─── Zodiac & Signs ──────────────────────────────────────────────────────────

export const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer',
  'Leo', 'Virgo', 'Libra', 'Scorpio',
  'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
] as const;

export type ZodiacSign = typeof ZODIAC_SIGNS[number];

export const PLANETS = [
  'Sun', 'Moon', 'Mars', 'Mercury',
  'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'
] as const;

export type Planet = typeof PLANETS[number];

export type Element = 'Fire' | 'Earth' | 'Air' | 'Water';
export type Modality = 'Movable' | 'Fixed' | 'Dual';
export type Gender = 'Male' | 'Female';

export interface ZodiacSignAttributes {
  sign: ZodiacSign;
  ruler: Planet;
  element: Element;
  modality: Modality;
  gender: Gender;
  symbol: string;
  degrees: number; // 0-30 within sign
}

// ─── Planetary Positions ─────────────────────────────────────────────────────

export interface PlanetPosition {
  planet: Planet;
  longitude: number;       // 0-360 tropical longitude
  siderealLongitude: number; // 0-360 sidereal (Lahiri) longitude
  sign: ZodiacSign;
  signIndex: number;       // 0-11
  degreeInSign: number;    // 0-30
  nakshatra: string;
  nakshatraIndex: number;  // 0-26
  nakshatraPada: number;   // 1-4
  isRetrograde: boolean;
  isCombust: boolean;
}

// ─── Houses ──────────────────────────────────────────────────────────────────

export interface HouseData {
  houseNumber: number;     // 1-12
  sign: ZodiacSign;
  signIndex: number;
  planets: Planet[];
}

// ─── North Indian Chart ──────────────────────────────────────────────────────

export interface NorthIndianChartData {
  /** 12 cells indexed 0-11, each cell contains the sign occupying that house */
  houses: HouseData[];
  /** Ascendant sign index (0-11) */
  ascendantIndex: number;
}

// ─── Nakshatra ───────────────────────────────────────────────────────────────

export interface NakshatraInfo {
  name: string;
  index: number;           // 0-26
  ruler: Planet;
  startDegree: number;     // 0-360
  endDegree: number;
  deity: string;
  symbol: string;
  nature: string;          // Rakshasa/Manushya/Deva
  gender: Gender;
  element: Element;
  gana: string;
  yoni: string;
}

export interface NakshatraData {
  name: string;
  index: number;
  pada: number;            // 1-4
  ruler: Planet;
  deity: string;
  symbol: string;
  startDegree: number;
  endDegree: number;
}

// ─── Vimshottari Dasha ───────────────────────────────────────────────────────

export interface DashaPeriod {
  planet: Planet;
  startDate: Date;
  endDate: Date;
  durationYears: number;
  level: 'Maha' | 'Antar' | 'Pratyantar';
}

export interface MahadashaPeriod {
  planet: Planet;
  startDate: Date;
  endDate: Date;
  durationYears: number;
  antardashas: AntardashaPeriod[];
}

export interface AntardashaPeriod {
  planet: Planet;
  startDate: Date;
  endDate: Date;
  durationYears: number;
}

export interface DashaData {
  currentMahadasha: MahadashaPeriod | null;
  currentAntardasha: AntardashaPeriod | null;
  allMahadashas: MahadashaPeriod[];
  moonNakshatraLord: Planet;
  dashaStartDate: Date;
}

// ─── Yogas ───────────────────────────────────────────────────────────────────

export type YogaType =
  | 'Raj Yoga'
  | 'Gaj Kesari Yoga'
  | 'Neech Bhang Raj Yoga'
  | 'Chandra Mangal Yoga'
  | 'Budh Aditya Yoga'
  | 'Hansa Yoga'
  | 'Malavya Yoga'
  | 'Shasha Yoga'
  | 'Ruchaka Yoga'
  | 'Bhadra Yoga';

export interface YogaData {
  name: YogaType;
  present: boolean;
  description: string;
  involvingPlanets: Planet[];
  strength: 'Strong' | 'Moderate' | 'Weak';
}

// ─── Doshas ──────────────────────────────────────────────────────────────────

export type DoshaType =
  | 'Mangal Dosha'
  | 'Kaal Sarp Dosha'
  | 'Pitra Dosha'
  | 'Shani Sade Sati';

export interface DoshaData {
  name: DoshaType;
  present: boolean;
  severity: 'High' | 'Medium' | 'Low';
  description: string;
  remedies: string[];
}

// ─── Ascendant ───────────────────────────────────────────────────────────────

export interface AscendantData {
  sign: ZodiacSign;
  signIndex: number;
  degreeInSign: number;
  siderealLongitude: number;
}

// ─── Main Kundali ────────────────────────────────────────────────────────────

export interface KundaliData {
  /** Birth details used for calculation */
  birthDate: string;
  birthTime: string;
  latitude: number;
  longitude: number;
  /** Lahiri Ayanamsa value in degrees */
  ayanamsa: number;
  /** Sun sign (sidereal) */
  sunSign: ZodiacSign;
  /** Moon sign (sidereal) */
  moonSign: ZodiacSign;
  /** Ascendant sign */
  ascendant: ZodiacSign;
  /** Ascendant details */
  ascendantData: AscendantData;
  /** All planetary positions */
  planetaryPositions: Record<string, PlanetPosition>;
  /** House data for all 12 houses */
  houses: HouseData[];
  /** North Indian chart representation */
  chart: NorthIndianChartData;
  /** Moon nakshatra details */
  nakshatra: NakshatraData;
  /** Vimshottari Dasha periods */
  dashaPeriods: DashaData;
  /** Detected yogas */
  yogas: YogaData[];
  /** Detected doshas */
  doshas: DoshaData[];
}

// ─── Planetary Relationships ─────────────────────────────────────────────────

export type Relationship = 'Friend' | 'Enemy' | 'Neutral' | 'Great Friend' | 'Great Enemy';

export interface PlanetRelationships {
  permanent: Record<string, Relationship>;
  temporary: Record<string, Relationship>;
  combined: Record<string, Relationship>;
}

// ─── Birth Input ─────────────────────────────────────────────────────────────

export interface BirthDetails {
  date: Date;
  latitude: number;
  longitude: number;
  timezoneOffset: number; // hours from UTC, e.g., 5.5 for IST
}
