/**
 * AyuAstro - Divisional Charts (Vargas) Calculation
 *
 * Divisional charts are the backbone of depth in Vedic astrology.
 * Each varga divides a zodiac sign into equal parts and maps each
 * part to a different sign, revealing specific life themes.
 *
 * All calculations use sidereal (not tropical) longitudes from the D1 chart.
 * All calculations are DETERMINISTIC: same inputs always produce the same outputs.
 *
 * Key Vargas implemented:
 * - D1  (Rasi)            - Main birth chart (identity, overall life)
 * - D9  (Navamsha)        - Marriage, soul path, inner strength
 * - D10 (Dashamsha)       - Career, profession, public status
 * - D7  (Saptamsha)       - Children, progeny
 * - D12 (Dwadashamsha)    - Parents, ancestry
 * - D20 (Vimshamsha)      - Spiritual devotion, worship
 * - D24 (Chaturvimshamsha)- Education, learning
 * - D60 (Shashtiamsha)    - Deep karma, past life
 */

import {
  type Planet,
  type ZodiacSign,
  type PlanetPosition,
  type AscendantData,
  type Modality,
  ZODIAC_SIGNS,
} from './types';

import {
  normalizeLongitude,
  longitudeToSignIndex,
  longitudeToDegreeInSign,
  isExalted,
  isDebilitated,
  isInOwnSign,
  getSignByIndex,
  getHouseFromAscendant,
  getSignAttributes,
  NUM_SIGNS,
  DEGREES_PER_SIGN,
} from './utils';

// ─── Varga Types & Metadata ──────────────────────────────────────────────────

/** All supported divisional chart types */
export type VargaType = 'D1' | 'D9' | 'D10' | 'D7' | 'D12' | 'D20' | 'D24' | 'D60';

/** Divisional chart position data for a single planet */
export interface DivisionalPosition {
  planet: Planet;
  sign: ZodiacSign;
  signIndex: number;
  degreeInSign: number;
  isExalted: boolean;
  isDebilitated: boolean;
  isInOwnSign: boolean;
}

/** Complete divisional chart data */
export interface DivisionalChart {
  /** Which varga this chart represents */
  varga: VargaType;
  /** English name */
  name: string;
  /** Sanskrit name */
  sanskritName: string;
  /** What this chart reveals */
  description: string;
  /** Ascendant sign in this varga */
  ascendantSign: ZodiacSign;
  /** Ascendant sign index (0-11) */
  ascendantSignIndex: number;
  /** All planetary positions in this varga */
  positions: Record<string, DivisionalPosition>;
}

/** Metadata for each varga */
export const VARGA_METADATA: Record<VargaType, {
  name: string;
  sanskritName: string;
  description: string;
  divisor: number;
  degreesPerAmsa: number;
}> = {
  D1: {
    name: 'Rasi',
    sanskritName: 'Rasi',
    description: 'Main birth chart — identity, overall life path, and general tendencies',
    divisor: 1,
    degreesPerAmsa: 30,
  },
  D9: {
    name: 'Navamsha',
    sanskritName: 'Navamsha',
    description: 'Soul chart — marriage, partnerships, inner strength, and dharma',
    divisor: 9,
    degreesPerAmsa: 30 / 9, // 3°20'
  },
  D10: {
    name: 'Dashamsha',
    sanskritName: 'Dashamsha',
    description: 'Career chart — profession, public status, achievements, and karma',
    divisor: 10,
    degreesPerAmsa: 3,
  },
  D7: {
    name: 'Saptamsha',
    sanskritName: 'Saptamsha',
    description: 'Progeny chart — children, creativity, and legacy',
    divisor: 7,
    degreesPerAmsa: 30 / 7, // ~4°17'8.57"
  },
  D12: {
    name: 'Dwadashamsha',
    sanskritName: 'Dwadashamsha',
    description: 'Parental chart — parents, ancestry, and ancestral karma',
    divisor: 12,
    degreesPerAmsa: 2.5, // 2°30'
  },
  D20: {
    name: 'Vimshamsha',
    sanskritName: 'Vimshamsha',
    description: 'Spiritual devotion chart — worship, spiritual practices, and devotion',
    divisor: 20,
    degreesPerAmsa: 1.5, // 1°30'
  },
  D24: {
    name: 'Chaturvimshamsha',
    sanskritName: 'Chaturvimshamsha',
    description: 'Education chart — learning, knowledge, and academic achievements',
    divisor: 24,
    degreesPerAmsa: 1.25, // 1°15'
  },
  D60: {
    name: 'Shashtiamsha',
    sanskritName: 'Shashtiamsha',
    description: 'Deep karma chart — past life karma, hidden influences, and spiritual debts',
    divisor: 60,
    degreesPerAmsa: 0.5, // 0°30'
  },
};

// ─── Sign Classification ─────────────────────────────────────────────────────

/**
 * Get the modality of a sign by its index.
 * Aries, Cancer, Libra, Capricorn = Movable (0, 3, 6, 9)
 * Taurus, Leo, Scorpio, Aquarius = Fixed (1, 4, 7, 10)
 * Gemini, Virgo, Sagittarius, Pisces = Dual (2, 5, 8, 11)
 */
function getSignModality(signIndex: number): Modality {
  const mod = signIndex % 3;
  if (mod === 0) return 'Movable';
  if (mod === 1) return 'Fixed';
  return 'Dual';
}

/**
 * Check if a sign index is odd (1-based: Aries=1 is odd, Taurus=2 is even).
 * In Vedic astrology, sign oddness is determined by 1-based numbering.
 */
function isOddSign(signIndex: number): boolean {
  // signIndex is 0-based, so signIndex 0 = Aries = 1st sign (odd)
  return signIndex % 2 === 0; // 0-based: even index = odd sign number
}

// ─── Amsa Index Calculation ──────────────────────────────────────────────────

/**
 * Calculate the amsa (division) index within a sign for a given varga.
 *
 * For a planet at sidereal longitude L:
 * 1. Find which sign it's in (signIndex = floor(L / 30))
 * 2. Find degree within sign (degreeInSign = L % 30)
 * 3. Divide degreeInSign by the varga divisor to find the amsa index
 *
 * @param siderealLongitude - The sidereal longitude of the planet
 * @param varga - The varga type
 * @returns The amsa index (0-based) and the degree within the amsa
 */
function calculateAmsaIndex(
  siderealLongitude: number,
  varga: VargaType
): { amsaIndex: number; degreeInAmsa: number } {
  const normalizedLon = normalizeLongitude(siderealLongitude);
  const degreeInSign = normalizedLon % DEGREES_PER_SIGN;
  const divisor = VARGA_METADATA[varga].divisor;
  const degreesPerAmsa = VARGA_METADATA[varga].degreesPerAmsa;

  // amsaIndex is 0-based
  const amsaIndex = Math.min(
    Math.floor(degreeInSign / degreesPerAmsa),
    divisor - 1
  );
  const degreeInAmsa = degreeInSign - amsaIndex * degreesPerAmsa;

  return { amsaIndex, degreeInAmsa };
}

// ─── Varga Sign Mapping Rules ────────────────────────────────────────────────

/**
 * Map the original sign + amsa index to the varga sign.
 *
 * Each varga has specific rules for determining which sign an amsa falls into.
 * The rules are based on traditional Vedic astrology texts (Brihat Parashara Hora Shastra).
 *
 * @param originalSignIndex - The sign index (0-11) in D1
 * @param amsaIndex - The amsa index (0-based) within the division
 * @param varga - The varga type
 * @returns The sign index (0-11) in the divisional chart
 */
function mapVargaSign(
  originalSignIndex: number,
  amsaIndex: number,
  varga: VargaType
): number {
  switch (varga) {
    case 'D1':
      // D1 is the natal chart — no mapping needed
      return originalSignIndex;

    case 'D9': {
      // Navamsha mapping:
      // Movable signs (Aries, Cancer, Libra, Capricorn): Start from same sign
      // Fixed signs (Taurus, Leo, Scorpio, Aquarius): Start from 9th sign from it
      // Dual signs (Gemini, Virgo, Sagittarius, Pisces): Start from 5th sign from it
      const modality = getSignModality(originalSignIndex);
      let startSign: number;
      if (modality === 'Movable') {
        startSign = originalSignIndex;
      } else if (modality === 'Fixed') {
        startSign = (originalSignIndex + 8) % NUM_SIGNS; // 9th from it (0-based: +8)
      } else {
        // Dual
        startSign = (originalSignIndex + 4) % NUM_SIGNS; // 5th from it (0-based: +4)
      }
      return (startSign + amsaIndex) % NUM_SIGNS;
    }

    case 'D10': {
      // Dashamsha mapping:
      // For odd signs: Start from the sign itself, add amsa index
      // For even signs: Start from 9th sign from it, add amsa index
      if (isOddSign(originalSignIndex)) {
        return (originalSignIndex + amsaIndex) % NUM_SIGNS;
      } else {
        return (originalSignIndex + 8 + amsaIndex) % NUM_SIGNS; // 9th from it
      }
    }

    case 'D7': {
      // Saptamsha mapping:
      // For odd signs: Start from the sign itself, add amsa index
      // For even signs: Start from 7th sign from it, add amsa index
      if (isOddSign(originalSignIndex)) {
        return (originalSignIndex + amsaIndex) % NUM_SIGNS;
      } else {
        return (originalSignIndex + 6 + amsaIndex) % NUM_SIGNS; // 7th from it
      }
    }

    case 'D12': {
      // Dwadashamsha mapping: Start from the sign itself, add amsa index
      return (originalSignIndex + amsaIndex) % NUM_SIGNS;
    }

    case 'D20': {
      // Vimshamsha mapping:
      // For odd signs: Start from Aries (0), add amsa index
      // For even signs: Start from Capricorn (9), add amsa index
      if (isOddSign(originalSignIndex)) {
        return (0 + amsaIndex) % NUM_SIGNS; // Start from Aries
      } else {
        return (9 + amsaIndex) % NUM_SIGNS; // Start from Capricorn
      }
    }

    case 'D24': {
      // Chaturvimshamsha mapping:
      // For odd signs: Start from Leo (4), add amsa index
      // For even signs: Start from Cancer (3), add amsa index
      if (isOddSign(originalSignIndex)) {
        return (4 + amsaIndex) % NUM_SIGNS; // Start from Leo
      } else {
        return (3 + amsaIndex) % NUM_SIGNS; // Start from Cancer
      }
    }

    case 'D60': {
      // Shashtiamsha mapping: Start from the sign itself, add amsa index
      // (This is the basic approach; some traditions use Deha/Jeeva concepts
      // for odd/even signs, but the foundational rule starts from the same sign)
      return (originalSignIndex + amsaIndex) % NUM_SIGNS;
    }

    default:
      return originalSignIndex;
  }
}

// ─── Position Calculation ────────────────────────────────────────────────────

/**
 * Calculate the divisional chart position for a single planet.
 *
 * @param planet - The planet name
 * @param siderealLongitude - The sidereal longitude from D1
 * @param varga - The varga type
 * @returns The divisional position data
 */
function calculateDivisionalPosition(
  planet: Planet,
  siderealLongitude: number,
  varga: VargaType
): DivisionalPosition {
  // For D1, just return the natal position
  if (varga === 'D1') {
    const signIndex = longitudeToSignIndex(siderealLongitude);
    const sign = getSignByIndex(signIndex);
    const degreeInSign = longitudeToDegreeInSign(siderealLongitude);
    return {
      planet,
      sign,
      signIndex,
      degreeInSign,
      isExalted: isExalted(planet, sign),
      isDebilitated: isDebilitated(planet, sign),
      isInOwnSign: isInOwnSign(planet, sign),
    };
  }

  // For other vargas, calculate the amsa and map to new sign
  const normalizedLon = normalizeLongitude(siderealLongitude);
  const originalSignIndex = Math.floor(normalizedLon / DEGREES_PER_SIGN);
  const { amsaIndex, degreeInAmsa } = calculateAmsaIndex(siderealLongitude, varga);
  const vargaSignIndex = mapVargaSign(originalSignIndex, amsaIndex, varga);
  const vargaSign = getSignByIndex(vargaSignIndex);

  return {
    planet,
    sign: vargaSign,
    signIndex: vargaSignIndex,
    degreeInSign: degreeInAmsa,
    isExalted: isExalted(planet, vargaSign),
    isDebilitated: isDebilitated(planet, vargaSign),
    isInOwnSign: isInOwnSign(planet, vargaSign),
  };
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Calculate a single divisional chart from the D1 planetary positions.
 *
 * @param varga - The varga type to calculate
 * @param positions - The D1 planetary positions (from calculateKundali)
 * @param ascendantData - The D1 ascendant data
 * @returns The complete divisional chart
 *
 * @example
 * ```typescript
 * const navamsha = calculateDivisionalChart('D9', kundali.planetaryPositions, kundali.ascendantData);
 * console.log(navamsha.ascendantSign); // e.g., "Leo"
 * console.log(navamsha.positions['Venus'].sign); // Venus's Navamsha sign
 * ```
 */
export function calculateDivisionalChart(
  varga: VargaType,
  positions: Record<string, PlanetPosition>,
  ascendantData: AscendantData
): DivisionalChart {
  const metadata = VARGA_METADATA[varga];

  // Calculate ascendant position in the varga
  const ascVargaPos = calculateDivisionalPosition(
    'Sun' as Planet, // placeholder planet — we only need sign mapping
    ascendantData.siderealLongitude,
    varga
  );

  // Calculate all planetary positions in the varga
  const vargaPositions: Record<string, DivisionalPosition> = {};

  for (const [planetName, position] of Object.entries(positions)) {
    vargaPositions[planetName] = calculateDivisionalPosition(
      planetName as Planet,
      position.siderealLongitude,
      varga
    );
  }

  return {
    varga,
    name: metadata.name,
    sanskritName: metadata.sanskritName,
    description: metadata.description,
    ascendantSign: ascVargaPos.sign,
    ascendantSignIndex: ascVargaPos.signIndex,
    positions: vargaPositions,
  };
}

/**
 * Calculate all supported divisional charts from the D1 data.
 *
 * @param positions - The D1 planetary positions
 * @param ascendantData - The D1 ascendant data
 * @returns Record of all varga types to their divisional charts
 *
 * @example
 * ```typescript
 * const allVargas = calculateAllDivisionalCharts(kundali.planetaryPositions, kundali.ascendantData);
 * console.log(allVargas.D9.ascendantSign); // Navamsha ascendant
 * console.log(allVargas.D10.positions['Jupiter'].sign); // Jupiter in Dashamsha
 * ```
 */
export function calculateAllDivisionalCharts(
  positions: Record<string, PlanetPosition>,
  ascendantData: AscendantData
): Record<VargaType, DivisionalChart> {
  const vargaTypes: VargaType[] = ['D1', 'D9', 'D10', 'D7', 'D12', 'D20', 'D24', 'D60'];
  const result = {} as Record<VargaType, DivisionalChart>;

  for (const varga of vargaTypes) {
    result[varga] = calculateDivisionalChart(varga, positions, ascendantData);
  }

  return result;
}

// ─── Navamsha (D9) Specific Analysis ─────────────────────────────────────────

/**
 * Navamsha-specific analysis results.
 * The D9 chart is the most important divisional chart and deserves dedicated analysis.
 */
export interface NavamshaAnalysis {
  /** The Navamsha ascendant sign */
  ascendantSign: ZodiacSign;
  /** The Navamsha ascendant sign index */
  ascendantSignIndex: number;
  /** Vargottama planets (same sign in D1 and D9 — very strong) */
  vargottamaPlanets: Planet[];
  /** Planets in own sign in Navamsha (strong inner nature) */
  planetsInOwnSign: Planet[];
  /** Planets exalted in Navamsha (inner strength) */
  planetsExalted: Planet[];
  /** Planets debilitated in Navamsha (inner weakness) */
  planetsDebilitated: Planet[];
  /** Navamsha lord of the ascendant (inner self ruler) */
  navamshaAscendantLord: Planet;
  /** Navamsha sign of the D1 ascendant lord */
  d1AscendantLordInD9: { planet: Planet; sign: ZodiacSign; signIndex: number };
  /** Whether the Navamsha ascendant is a movable, fixed, or dual sign */
  ascendantModality: Modality;
  /** Interpretation of Navamsha strength */
  strengthSummary: string;
}

/**
 * Perform detailed Navamsha (D9) analysis.
 * The Navamsha is considered the most crucial varga — it reveals the soul's
 * inner strength and the true nature of planetary promises in the D1 chart.
 *
 * @param d1Positions - D1 planetary positions
 * @param ascendantData - D1 ascendant data
 * @returns Detailed Navamsha analysis
 */
export function analyzeNavamsha(
  d1Positions: Record<string, PlanetPosition>,
  ascendantData: AscendantData
): NavamshaAnalysis {
  const d9Chart = calculateDivisionalChart('D9', d1Positions, ascendantData);

  // Find Vargottama planets (same sign in D1 and D9)
  const vargottamaPlanets: Planet[] = [];
  for (const [planetName, d9Pos] of Object.entries(d9Chart.positions)) {
    const d1Pos = d1Positions[planetName];
    if (d1Pos && d1Pos.signIndex === d9Pos.signIndex) {
      vargottamaPlanets.push(planetName as Planet);
    }
  }

  // Find planets in own sign in D9
  const planetsInOwnSign: Planet[] = [];
  for (const [planetName, d9Pos] of Object.entries(d9Chart.positions)) {
    if (d9Pos.isInOwnSign) {
      planetsInOwnSign.push(planetName as Planet);
    }
  }

  // Find exalted and debilitated in D9
  const planetsExalted: Planet[] = [];
  const planetsDebilitated: Planet[] = [];
  for (const [planetName, d9Pos] of Object.entries(d9Chart.positions)) {
    if (d9Pos.isExalted) planetsExalted.push(planetName as Planet);
    if (d9Pos.isDebilitated) planetsDebilitated.push(planetName as Planet);
  }

  // Navamsha ascendant lord
  const navamshaAscendantLord = getSignAttributes(d9Chart.ascendantSign).ruler;

  // D1 ascendant lord's position in D9
  const d1AscendantLord = getSignAttributes(ascendantData.sign).ruler;
  const d1AscLordD9Pos = d9Chart.positions[d1AscendantLord];
  const d1AscendantLordInD9 = {
    planet: d1AscendantLord,
    sign: d1AscLordD9Pos?.sign ?? 'Aries',
    signIndex: d1AscLordD9Pos?.signIndex ?? 0,
  };

  // Navamsha ascendant modality
  const ascendantModality = getSignModality(d9Chart.ascendantSignIndex);

  // Generate strength summary
  const strengthSummary = generateNavamshaStrengthSummary(
    vargottamaPlanets,
    planetsExalted,
    planetsDebilitated,
    planetsInOwnSign,
    ascendantModality
  );

  return {
    ascendantSign: d9Chart.ascendantSign,
    ascendantSignIndex: d9Chart.ascendantSignIndex,
    vargottamaPlanets,
    planetsInOwnSign,
    planetsExalted,
    planetsDebilitated,
    navamshaAscendantLord,
    d1AscendantLordInD9,
    ascendantModality,
    strengthSummary,
  };
}

/**
 * Generate a qualitative strength summary for the Navamsha chart.
 */
function generateNavamshaStrengthSummary(
  vargottama: Planet[],
  exalted: Planet[],
  debilitated: Planet[],
  ownSign: Planet[],
  ascendantModality: Modality
): string {
  const strengths: string[] = [];
  const challenges: string[] = [];

  // Vargottama analysis
  if (vargottama.length > 0) {
    strengths.push(
      `Vargottama ${vargottama.join(', ')} — their D1 promises are strongly supported by inner resolve`
    );
  }

  // Exalted in D9
  if (exalted.length > 0) {
    strengths.push(
      `${exalted.join(', ')} exalted in Navamsha — inner strength and spiritual merit in these areas`
    );
  }

  // Own sign in D9
  if (ownSign.length > 0) {
    strengths.push(
      `${ownSign.join(', ')} in own sign in Navamsha — comfortable and empowered from within`
    );
  }

  // Debilitated in D9
  if (debilitated.length > 0) {
    challenges.push(
      `${debilitated.join(', ')} debilitated in Navamsha — inner vulnerabilities requiring conscious effort to overcome`
    );
  }

  // Ascendant modality interpretation
  if (ascendantModality === 'Movable') {
    strengths.push('Movable Navamsha ascendant — dynamic inner nature, adaptable and action-oriented');
  } else if (ascendantModality === 'Fixed') {
    strengths.push('Fixed Navamsha ascendant — steadfast inner resolve, determination and consistency');
  } else {
    strengths.push('Dual Navamsha ascendant — versatile inner nature, adaptable and communicative');
  }

  let summary = '';
  if (strengths.length > 0) {
    summary += 'Strengths: ' + strengths.join('. ') + '.';
  }
  if (challenges.length > 0) {
    summary += ' Challenges: ' + challenges.join('. ') + '.';
  }

  return summary || 'The Navamsha chart shows a balanced inner nature.';
}

// ─── Divisional Chart House Calculation ──────────────────────────────────────

/**
 * Calculate houses for a divisional chart.
 * Uses the whole sign house system (same as D1).
 *
 * @param divisionalChart - The divisional chart with ascendant and positions
 * @returns Array of 12 house data entries
 */
export function calculateDivisionalHouses(
  divisionalChart: DivisionalChart
): Array<{
  houseNumber: number;
  sign: ZodiacSign;
  signIndex: number;
  planets: Planet[];
}> {
  const houses: Array<{
    houseNumber: number;
    sign: ZodiacSign;
    signIndex: number;
    planets: Planet[];
  }> = [];

  const ascSignIndex = divisionalChart.ascendantSignIndex;

  for (let houseNum = 1; houseNum <= 12; houseNum++) {
    const signIndex = (ascSignIndex + houseNum - 1) % NUM_SIGNS;
    const sign = getSignByIndex(signIndex);

    // Find all planets in this house
    const planetsInHouse: Planet[] = [];
    for (const [planetName, pos] of Object.entries(divisionalChart.positions)) {
      if (pos.signIndex === signIndex) {
        planetsInHouse.push(planetName as Planet);
      }
    }

    houses.push({
      houseNumber: houseNum,
      sign,
      signIndex,
      planets: planetsInHouse,
    });
  }

  return houses;
}

// ─── Vargottama Detection ────────────────────────────────────────────────────

/**
 * Find all Vargottama planets (same sign in D1 and D9).
 * Vargottama is a very auspicious condition — the planet's external
 * and internal manifestations are aligned, giving it exceptional strength.
 *
 * @param d1Positions - D1 planetary positions
 * @param ascendantData - D1 ascendant data
 * @returns Array of Vargottama planets with details
 */
export function findVargottamaPlanets(
  d1Positions: Record<string, PlanetPosition>,
  ascendantData: AscendantData
): Array<{
  planet: Planet;
  sign: ZodiacSign;
  signIndex: number;
  interpretation: string;
}> {
  const d9Chart = calculateDivisionalChart('D9', d1Positions, ascendantData);
  const vargottama: Array<{
    planet: Planet;
    sign: ZodiacSign;
    signIndex: number;
    interpretation: string;
  }> = [];

  const VARGOTTAMA_INTERPRETATIONS: Record<string, string> = {
    Sun: 'Vargottama Sun — your authority, confidence, and life purpose have deep inner alignment. You naturally lead and inspire.',
    Moon: 'Vargottama Moon — your emotional nature is consistent and authentic. Inner peace and emotional intelligence are your gifts.',
    Mars: 'Vargottama Mars — your courage and drive are deeply rooted. You act with conviction and your efforts have lasting impact.',
    Mercury: 'Vargottama Mercury — your intellect and communication are authentic and powerful. Your words carry deep inner truth.',
    Jupiter: 'Vargottama Jupiter — your wisdom, optimism, and spiritual growth are deeply aligned. Teaching and guidance come naturally.',
    Venus: 'Vargottama Venus — your capacity for love, beauty, and harmony is genuine and deep. Relationships fulfill you at a soul level.',
    Saturn: 'Vargottama Saturn — your discipline and perseverance come from inner conviction. Your hard work leads to lasting achievements.',
    Rahu: 'Vargottama Rahu — your ambitions and unconventional path are deeply aligned with your inner calling.',
    Ketu: 'Vargottama Ketu — your spiritual detachment and past-life wisdom are deeply integrated into your being.',
  };

  for (const [planetName, d9Pos] of Object.entries(d9Chart.positions)) {
    const d1Pos = d1Positions[planetName];
    if (d1Pos && d1Pos.signIndex === d9Pos.signIndex) {
      vargottama.push({
        planet: planetName as Planet,
        sign: d9Pos.sign,
        signIndex: d9Pos.signIndex,
        interpretation: VARGOTTAMA_INTERPRETATIONS[planetName] ?? `${planetName} is Vargottama — its D1 and D9 positions align, giving it exceptional strength.`,
      });
    }
  }

  return vargottama;
}

// ─── Divisional Chart Strength Scoring ───────────────────────────────────────

/**
 * Calculate the overall strength of a divisional chart.
 * Based on the number of benefic conditions: exalted, own sign, vargottama planets.
 *
 * @param divisionalChart - The divisional chart to evaluate
 * @param d1Positions - D1 positions (for vargottama check in D9)
 * @returns Strength score (0-100) and qualitative label
 */
export function evaluateDivisionalStrength(
  divisionalChart: DivisionalChart,
  d1Positions?: Record<string, PlanetPosition>
): { score: number; label: string; details: string[] } {
  let points = 0;
  const maxPoints = Object.keys(divisionalChart.positions).length * 3;
  const details: string[] = [];

  for (const [planetName, pos] of Object.entries(divisionalChart.positions)) {
    if (pos.isExalted) {
      points += 3;
      details.push(`${planetName} exalted (+3)`);
    } else if (pos.isInOwnSign) {
      points += 2;
      details.push(`${planetName} in own sign (+2)`);
    }

    // Vargottama check (only for D9 and if D1 positions provided)
    if (divisionalChart.varga === 'D9' && d1Positions) {
      const d1Pos = d1Positions[planetName];
      if (d1Pos && d1Pos.signIndex === pos.signIndex) {
        points += 2;
        details.push(`${planetName} Vargottama (+2)`);
      }
    }

    if (pos.isDebilitated) {
      points -= 1;
      details.push(`${planetName} debilitated (-1)`);
    }
  }

  const score = Math.max(0, Math.min(100, Math.round((points / maxPoints) * 100)));

  let label: string;
  if (score >= 70) label = 'Strong';
  else if (score >= 45) label = 'Moderate';
  else label = 'Needs Strengthening';

  return { score, label, details };
}
