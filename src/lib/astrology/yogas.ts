/**
 * AyuAstro - Yoga Detection
 * 
 * Yogas are special planetary combinations that indicate specific life patterns.
 * This module detects the following 10 important yogas:
 * 
 * 1. Raj Yoga - Planets in Kendra & Trikona from Lagna
 * 2. Gaj Kesari Yoga - Jupiter in Kendra from Moon
 * 3. Neech Bhang Raj Yoga - Debilitated planet gets cancelled
 * 4. Chandra Mangal Yoga - Moon and Mars together
 * 5. Budh Aditya Yoga - Sun and Mercury together
 * 6. Hansa Yoga - Jupiter in its own/exaltation sign in Kendra/Trikona
 * 7. Malavya Yoga - Venus in its own/exaltation sign in Kendra/Trikona
 * 8. Shasha Yoga - Saturn in its own/exaltation sign in Kendra/Trikona
 * 9. Ruchaka Yoga - Mars in its own/exaltation sign in Kendra/Trikona
 * 10. Bhadra Yoga - Mercury in its own/exaltation sign in Kendra/Trikona
 */

import {
  type YogaData,
  type YogaType,
  type PlanetPosition,
  type Planet,
  type ZodiacSign,
} from './types';

import {
  getSignLord,
  getHouseFromAscendant,
  isExalted,
  isDebilitated,
  isInOwnSign,
  isInMoolatrikona,
  isKendraHouse,
  isTrikonaHouse,
  getSignIndex,
  EXALTATION,
  OWNED_SIGNS,
  MOOLATRIKONA,
  angularDistance,
  KENDRA_HOUSES,
  TRIKONA_HOUSES,
} from './utils';

// ─── Helper Functions ────────────────────────────────────────────────────────

function createYoga(
  name: YogaType,
  present: boolean,
  description: string,
  involvingPlanets: Planet[],
  strength: 'Strong' | 'Moderate' | 'Weak' = 'Moderate'
): YogaData {
  return { name, present, description, involvingPlanets, strength };
}

/** Get the house number a planet occupies from the ascendant */
function getPlanetHouse(planetSignIndex: number, ascendantSignIndex: number): number {
  return getHouseFromAscendant(planetSignIndex, ascendantSignIndex);
}

/** Check if a planet is in a Kendra house (1,4,7,10) from the ascendant */
function isPlanetInKendra(planetSignIndex: number, ascendantSignIndex: number): boolean {
  const house = getPlanetHouse(planetSignIndex, ascendantSignIndex);
  return isKendraHouse(house);
}

/** Check if a planet is in a Trikona house (1,5,9) from the ascendant */
function isPlanetInTrikona(planetSignIndex: number, ascendantSignIndex: number): boolean {
  const house = getPlanetHouse(planetSignIndex, ascendantSignIndex);
  return isTrikonaHouse(house);
}

/** Check if a planet is in a Kendra house from the Moon */
function isPlanetInKendraFromMoon(planetSignIndex: number, moonSignIndex: number): boolean {
  const house = getHouseFromAscendant(planetSignIndex, moonSignIndex);
  return isKendraHouse(house);
}

/** Get sign index from positions */
function getPlanetSignIndex(positions: Record<string, PlanetPosition>, planet: string): number {
  return positions[planet]?.signIndex ?? -1;
}

// ─── 1. Raj Yoga ─────────────────────────────────────────────────────────────

/**
 * Raj Yoga: Formed when lords of Kendra (1,4,7,10) and Trikona (1,5,9) houses
 * are in mutual association (conjunction, aspect, or exchange).
 * Also formed when a Trikona lord is in a Kendra or vice versa.
 */
export function detectRajYoga(
  positions: Record<string, PlanetPosition>,
  ascendantSignIndex: number
): YogaData {
  const kendraSignIndices = KENDRA_HOUSES.map(h => (ascendantSignIndex + h - 1) % 12);
  const trikonaSignIndices = TRIKONA_HOUSES.map(h => (ascendantSignIndex + h - 1) % 12);
  
  // Get lords of Kendra and Trikona houses
  const kendraLords: Planet[] = kendraSignIndices.map(si => getSignLordByIndex(si));
  const trikonaLords: Planet[] = trikonaSignIndices.map(si => getSignLordByIndex(si));
  
  const involvedPlanets: Planet[] = [];
  let strongCondition = false;
  
  // Check if any Kendra lord is in a Trikona house or vice versa
  for (const lord of kendraLords) {
    const pos = positions[lord];
    if (!pos) continue;
    const house = getPlanetHouse(pos.signIndex, ascendantSignIndex);
    if (isTrikonaHouse(house) && !involvedPlanets.includes(lord)) {
      involvedPlanets.push(lord);
      strongCondition = true;
    }
  }
  
  for (const lord of trikonaLords) {
    const pos = positions[lord];
    if (!pos) continue;
    const house = getPlanetHouse(pos.signIndex, ascendantSignIndex);
    if (isKendraHouse(house) && !involvedPlanets.includes(lord)) {
      involvedPlanets.push(lord);
      strongCondition = true;
    }
  }
  
  // Check for conjunction of Kendra and Trikona lords in same sign
  for (const kendraLord of kendraLords) {
    for (const trikonaLord of trikonaLords) {
      if (kendraLord === trikonaLord) continue;
      const kendraPos = positions[kendraLord];
      const trikonaPos = positions[trikonaLord];
      if (kendraPos && trikonaPos && kendraPos.signIndex === trikonaPos.signIndex) {
        if (!involvedPlanets.includes(kendraLord)) involvedPlanets.push(kendraLord);
        if (!involvedPlanets.includes(trikonaLord)) involvedPlanets.push(trikonaLord);
        strongCondition = true;
      }
    }
  }
  
  const present = involvedPlanets.length >= 2;
  
  return createYoga(
    'Raj Yoga',
    present,
    'Formed by the association of Kendra and Trikona lords, bringing power, authority, and success in life',
    involvedPlanets,
    strongCondition ? 'Strong' : 'Moderate'
  );
}

// ─── 2. Gaj Kesari Yoga ──────────────────────────────────────────────────────

/**
 * Gaj Kesari Yoga: Jupiter in a Kendra (1,4,7,10) from the Moon.
 * Brings wisdom, respect, and financial prosperity.
 */
export function detectGajKesariYoga(
  positions: Record<string, PlanetPosition>,
  ascendantSignIndex: number
): YogaData {
  const moonPos = positions['Moon'];
  const jupiterPos = positions['Jupiter'];
  
  if (!moonPos || !jupiterPos) {
    return createYoga('Gaj Kesari Yoga', false, 'Jupiter in Kendra from Moon', []);
  }
  
  const isJupiterInKendraFromMoon = isPlanetInKendraFromMoon(
    jupiterPos.signIndex,
    moonPos.signIndex
  );
  
  // Jupiter should not be debilitated or in enemy sign for strong yoga
  const jupiterStrong = !isDebilitated('Jupiter', jupiterPos.sign) &&
    (isInOwnSign('Jupiter', jupiterPos.sign) || isExalted('Jupiter', jupiterPos.sign) ||
     isInMoolatrikona('Jupiter', jupiterPos.sign));
  
  const involvedPlanets: Planet[] = ['Moon', 'Jupiter'];
  const strength = jupiterStrong ? 'Strong' : isJupiterInKendraFromMoon ? 'Moderate' : 'Weak';
  
  return createYoga(
    'Gaj Kesari Yoga',
    isJupiterInKendraFromMoon,
    'Jupiter in a Kendra from the Moon brings wisdom, respect, prosperity, and a noble character',
    involvedPlanets,
    isJupiterInKendraFromMoon ? strength : 'Weak'
  );
}

// ─── 3. Neech Bhang Raj Yoga ─────────────────────────────────────────────────

/**
 * Neech Bhang Raj Yoga: A debilitated planet gets its debilitation cancelled.
 * Cancellation occurs when:
 * - The debilitated planet's dispositor is in a Kendra from Lagna or Moon
 * - The debilitated planet is aspected by its exaltation lord
 * - The debilitated planet is in exchange with its dispositor
 */
export function detectNeechBhangRajYoga(
  positions: Record<string, PlanetPosition>,
  ascendantSignIndex: number
): YogaData {
  const debilitatedPlanets: Planet[] = [];
  const involvedPlanets: Planet[] = [];
  let hasStrongCancellation = false;
  
  // Check each planet for debilitation
  const planetsToCheck: Planet[] = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
  
  for (const planet of planetsToCheck) {
    const pos = positions[planet];
    if (!pos) continue;
    
    if (isDebilitated(planet, pos.sign)) {
      debilitatedPlanets.push(planet);
      
      // Check for cancellation conditions
      const dispositor = getSignLord(pos.sign);
      const dispositorPos = positions[dispositor];
      
      // Condition 1: Dispositor in Kendra from Lagna
      if (dispositorPos && isPlanetInKendra(dispositorPos.signIndex, ascendantSignIndex)) {
        if (!involvedPlanets.includes(planet)) involvedPlanets.push(planet);
        if (!involvedPlanets.includes(dispositor)) involvedPlanets.push(dispositor);
        hasStrongCancellation = true;
      }
      
      // Condition 2: Dispositor in Kendra from Moon
      const moonPos = positions['Moon'];
      if (moonPos && dispositorPos && isPlanetInKendraFromMoon(dispositorPos.signIndex, moonPos.signIndex)) {
        if (!involvedPlanets.includes(planet)) involvedPlanets.push(planet);
        if (!involvedPlanets.includes(dispositor)) involvedPlanets.push(dispositor);
      }
      
      // Condition 3: Debilitated planet and its dispositor in exchange
      if (dispositorPos && dispositorPos.signIndex === getSignIndex(EXALTATION[planet]?.sign ?? 'Aries')) {
        if (!involvedPlanets.includes(planet)) involvedPlanets.push(planet);
        if (!involvedPlanets.includes(dispositor)) involvedPlanets.push(dispositor);
        hasStrongCancellation = true;
      }
    }
  }
  
  return createYoga(
    'Neech Bhang Raj Yoga',
    involvedPlanets.length > 0,
    'Cancellation of debilitation brings rise from difficulties to positions of power and respect',
    involvedPlanets,
    hasStrongCancellation ? 'Strong' : 'Moderate'
  );
}

// ─── 4. Chandra Mangal Yoga ──────────────────────────────────────────────────

/**
 * Chandra Mangal Yoga: Moon and Mars in conjunction or aspecting each other.
 * Brings wealth through self-effort, courage, and property.
 */
export function detectChandraMangalYoga(
  positions: Record<string, PlanetPosition>
): YogaData {
  const moonPos = positions['Moon'];
  const marsPos = positions['Mars'];
  
  if (!moonPos || !marsPos) {
    return createYoga('Chandra Mangal Yoga', false, 'Moon and Mars in conjunction', []);
  }
  
  // Check conjunction (same sign)
  const inConjunction = moonPos.signIndex === marsPos.signIndex;
  
  // Check mutual aspect (7th from each other)
  const inMutualAspect = angularDistance(moonPos.siderealLongitude, marsPos.siderealLongitude) >= 157 &&
    angularDistance(moonPos.siderealLongitude, marsPos.siderealLongitude) <= 180;
  
  const present = inConjunction || inMutualAspect;
  const strength = inConjunction ? 'Strong' : 'Moderate';
  
  return createYoga(
    'Chandra Mangal Yoga',
    present,
    'Conjunction or mutual aspect of Moon and Mars brings wealth through self-effort, property gains, and dynamic personality',
    ['Moon', 'Mars'],
    present ? strength : 'Weak'
  );
}

// ─── 5. Budh Aditya Yoga ────────────────────────────────────────────────────

/**
 * Budh Aditya Yoga: Sun and Mercury in conjunction.
 * Brings intelligence, communication skills, and success in intellectual pursuits.
 * Not valid if Mercury is combust.
 */
export function detectBudhAdityaYoga(
  positions: Record<string, PlanetPosition>
): YogaData {
  const sunPos = positions['Sun'];
  const mercuryPos = positions['Mercury'];
  
  if (!sunPos || !mercuryPos) {
    return createYoga('Budh Aditya Yoga', false, 'Sun and Mercury in conjunction', []);
  }
  
  const inConjunction = sunPos.signIndex === mercuryPos.signIndex;
  const mercuryNotCombust = !mercuryPos.isCombust;
  
  const present = inConjunction && mercuryNotCombust;
  const strength = present && !isDebilitated('Mercury', mercuryPos.sign) ? 'Strong' : 'Moderate';
  
  return createYoga(
    'Budh Aditya Yoga',
    present,
    'Conjunction of Sun and Mercury brings sharp intellect, communication skills, and success in education and business',
    ['Sun', 'Mercury'],
    present ? strength : 'Weak'
  );
}

// ─── 6-10. Panch Mahapurusha Yogas ───────────────────────────────────────────

/**
 * Panch Mahapurusha Yogas: Five great yogas formed by Mars, Mercury, Jupiter, Venus, or Saturn
 * in their own sign or exaltation sign, placed in a Kendra house from the Ascendant.
 * 
 * Hansa Yoga - Jupiter
 * Malavya Yoga - Venus
 * Shasha Yoga - Saturn
 * Ruchaka Yoga - Mars
 * Bhadra Yoga - Mercury
 */

function detectPanchMahapurushaYoga(
  planet: Planet,
  yogaName: YogaType,
  description: string,
  positions: Record<string, PlanetPosition>,
  ascendantSignIndex: number
): YogaData {
  const pos = positions[planet];
  
  if (!pos) {
    return createYoga(yogaName, false, description, []);
  }
  
  const inOwnOrExalted = isInOwnSign(planet, pos.sign) || isExalted(planet, pos.sign) || isInMoolatrikona(planet, pos.sign);
  const inKendra = isPlanetInKendra(pos.signIndex, ascendantSignIndex);
  
  const present = inOwnOrExalted && inKendra;
  const strength = isExalted(planet, pos.sign) ? 'Strong' : 'Moderate';
  
  return createYoga(
    yogaName,
    present,
    description,
    present ? [planet] : [],
    present ? strength : 'Weak'
  );
}

/** Hansa Yoga: Jupiter in own/exaltation sign in Kendra */
export function detectHansaYoga(
  positions: Record<string, PlanetPosition>,
  ascendantSignIndex: number
): YogaData {
  return detectPanchMahapurushaYoga(
    'Jupiter',
    'Hansa Yoga',
    'Jupiter in own/exaltation sign in a Kendra brings wisdom, wealth, beauty, and a virtuous character',
    positions,
    ascendantSignIndex
  );
}

/** Malavya Yoga: Venus in own/exaltation sign in Kendra */
export function detectMalavyaYoga(
  positions: Record<string, PlanetPosition>,
  ascendantSignIndex: number
): YogaData {
  return detectPanchMahapurushaYoga(
    'Venus',
    'Malavya Yoga',
    'Venus in own/exaltation sign in a Kendra brings beauty, luxury, artistic talent, and harmonious relationships',
    positions,
    ascendantSignIndex
  );
}

/** Shasha Yoga: Saturn in own/exaltation sign in Kendra */
export function detectShashaYoga(
  positions: Record<string, PlanetPosition>,
  ascendantSignIndex: number
): YogaData {
  return detectPanchMahapurushaYoga(
    'Saturn',
    'Shasha Yoga',
    'Saturn in own/exaltation sign in a Kendra brings leadership, organizational ability, and long-lasting success',
    positions,
    ascendantSignIndex
  );
}

/** Ruchaka Yoga: Mars in own/exaltation sign in Kendra */
export function detectRuchakaYoga(
  positions: Record<string, PlanetPosition>,
  ascendantSignIndex: number
): YogaData {
  return detectPanchMahapurushaYoga(
    'Mars',
    'Ruchaka Yoga',
    'Mars in own/exaltation sign in a Kendra brings courage, victory, property ownership, and a commanding personality',
    positions,
    ascendantSignIndex
  );
}

/** Bhadra Yoga: Mercury in own/exaltation sign in Kendra */
export function detectBhadraYoga(
  positions: Record<string, PlanetPosition>,
  ascendantSignIndex: number
): YogaData {
  return detectPanchMahapurushaYoga(
    'Mercury',
    'Bhadra Yoga',
    'Mercury in own/exaltation sign in a Kendra brings sharp intellect, eloquence, business acumen, and scholarly achievements',
    positions,
    ascendantSignIndex
  );
}

// ─── Detect All Yogas ────────────────────────────────────────────────────────

/**
 * Detect all 10 yogas for the given planetary positions and ascendant.
 */
export function detectAllYogas(
  positions: Record<string, PlanetPosition>,
  ascendantSignIndex: number
): YogaData[] {
  return [
    detectRajYoga(positions, ascendantSignIndex),
    detectGajKesariYoga(positions, ascendantSignIndex),
    detectNeechBhangRajYoga(positions, ascendantSignIndex),
    detectChandraMangalYoga(positions),
    detectBudhAdityaYoga(positions),
    detectHansaYoga(positions, ascendantSignIndex),
    detectMalavyaYoga(positions, ascendantSignIndex),
    detectShashaYoga(positions, ascendantSignIndex),
    detectRuchakaYoga(positions, ascendantSignIndex),
    detectBhadraYoga(positions, ascendantSignIndex),
  ];
}

// ─── Helper: Get sign lord by index ──────────────────────────────────────────

function getSignLordByIndex(signIndex: number): Planet {
  const lords: Planet[] = [
    'Mars',    // Aries
    'Venus',   // Taurus
    'Mercury', // Gemini
    'Moon',    // Cancer
    'Sun',     // Leo
    'Mercury', // Virgo
    'Venus',   // Libra
    'Mars',    // Scorpio
    'Jupiter', // Sagittarius
    'Saturn',  // Capricorn
    'Saturn',  // Aquarius
    'Jupiter', // Pisces
  ];
  return lords[signIndex % 12];
}
