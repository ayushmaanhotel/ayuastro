/**
 * AyuAstro - Yoga Detection
 * 
 * Yogas are special planetary combinations that indicate specific life patterns.
 * This module detects the following 16 important yogas:
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
 * 11. Amala Yoga - Venus and Jupiter in Kendras from Moon
 * 12. Veshi Yoga - Planets in 2nd from Sun (not Moon)
 * 13. Voshi Yoga - Planets in 12th from Sun (not Moon)
 * 14. Ubhayachari Yoga - Planets in both 2nd AND 12th from Sun
 * 15. Dhana Yoga - Lords of 2nd and 11th in conjunction or mutual aspect
 * 16. Vipreet Raj Yoga - Lords of 6th, 8th, or 12th in 6th, 8th, or 12th house
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

// ─── 11. Amala Yoga ──────────────────────────────────────────────────────────

/**
 * Amala Yoga: Venus and Jupiter in Kendras (1,4,7,10) from the Moon.
 * Brings pure reputation and fame. The word "Amala" means "pure" or "spotless".
 * When benefics Venus and Jupiter occupy angular positions from the Moon,
 * the native enjoys a spotless reputation and moral standing.
 */
export function detectAmalaYoga(
  positions: Record<string, PlanetPosition>
): YogaData {
  const moonPos = positions['Moon'];
  const venusPos = positions['Venus'];
  const jupiterPos = positions['Jupiter'];

  if (!moonPos || !venusPos || !jupiterPos) {
    return createYoga('Amala Yoga', false, 'Venus and Jupiter in Kendras from Moon', []);
  }

  const venusInKendraFromMoon = isPlanetInKendraFromMoon(venusPos.signIndex, moonPos.signIndex);
  const jupiterInKendraFromMoon = isPlanetInKendraFromMoon(jupiterPos.signIndex, moonPos.signIndex);

  const present = venusInKendraFromMoon && jupiterInKendraFromMoon;

  const involvedPlanets: Planet[] = ['Moon', 'Venus', 'Jupiter'];

  // Stronger if both are in own sign or exalted
  const venusStrong = isInOwnSign('Venus', venusPos.sign) || isExalted('Venus', venusPos.sign);
  const jupiterStrong = isInOwnSign('Jupiter', jupiterPos.sign) || isExalted('Jupiter', jupiterPos.sign);
  const strength = present
    ? (venusStrong && jupiterStrong ? 'Strong' : venusStrong || jupiterStrong ? 'Moderate' : 'Moderate')
    : 'Weak';

  return createYoga(
    'Amala Yoga',
    present,
    'Venus and Jupiter in Kendras from the Moon bring a pure reputation, moral standing, and lasting fame',
    involvedPlanets,
    present ? strength : 'Weak'
  );
}

// ─── 12. Veshi Yoga ──────────────────────────────────────────────────────────

/**
 * Veshi Yoga: Planets (other than Moon) in the 2nd house from the Sun.
 * Brings wealth through speech and family connections.
 * The more planets in the 2nd from Sun, the stronger the yoga.
 */
export function detectVeshiYoga(
  positions: Record<string, PlanetPosition>
): YogaData {
  const sunPos = positions['Sun'];
  if (!sunPos) {
    return createYoga('Veshi Yoga', false, 'Planets in 2nd from Sun', []);
  }

  // Find planets in the 2nd sign from the Sun (not Moon)
  const secondFromSunSignIndex = (sunPos.signIndex + 1) % 12;
  const planetsInSecond: Planet[] = [];

  const planetsToCheck: Planet[] = ['Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

  for (const planet of planetsToCheck) {
    const pos = positions[planet];
    if (pos && pos.signIndex === secondFromSunSignIndex) {
      planetsInSecond.push(planet);
    }
  }

  const present = planetsInSecond.length > 0;
  const strength = planetsInSecond.length >= 3 ? 'Strong' : planetsInSecond.length >= 2 ? 'Moderate' : 'Weak';

  return createYoga(
    'Veshi Yoga',
    present,
    'Planets in the 2nd house from the Sun bring wealth through speech, family, and persuasive abilities',
    present ? planetsInSecond : [],
    present ? strength : 'Weak'
  );
}

// ─── 13. Voshi Yoga ──────────────────────────────────────────────────────────

/**
 * Voshi Yoga: Planets (other than Moon) in the 12th house from the Sun.
 * Brings happiness, comfort, and a contented life.
 * The more planets in the 12th from Sun, the stronger the yoga.
 */
export function detectVoshiYoga(
  positions: Record<string, PlanetPosition>
): YogaData {
  const sunPos = positions['Sun'];
  if (!sunPos) {
    return createYoga('Voshi Yoga', false, 'Planets in 12th from Sun', []);
  }

  // Find planets in the 12th sign from the Sun (1 sign before Sun)
  const twelfthFromSunSignIndex = (sunPos.signIndex + 11) % 12;
  const planetsInTwelfth: Planet[] = [];

  const planetsToCheck: Planet[] = ['Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

  for (const planet of planetsToCheck) {
    const pos = positions[planet];
    if (pos && pos.signIndex === twelfthFromSunSignIndex) {
      planetsInTwelfth.push(planet);
    }
  }

  const present = planetsInTwelfth.length > 0;
  const strength = planetsInTwelfth.length >= 3 ? 'Strong' : planetsInTwelfth.length >= 2 ? 'Moderate' : 'Weak';

  return createYoga(
    'Voshi Yoga',
    present,
    'Planets in the 12th house from the Sun bring happiness, comfort, and inner contentment',
    present ? planetsInTwelfth : [],
    present ? strength : 'Weak'
  );
}

// ─── 14. Ubhayachari Yoga ────────────────────────────────────────────────────

/**
 * Ubhayachari Yoga: Planets (other than Moon) in BOTH the 2nd AND 12th from the Sun.
 * This is the most powerful of the three Sun-based yogas (Veshi, Voshi, Ubhayachari).
 * Brings royal connections, high status, and a commanding personality.
 */
export function detectUbhayachariYoga(
  positions: Record<string, PlanetPosition>
): YogaData {
  const sunPos = positions['Sun'];
  if (!sunPos) {
    return createYoga('Ubhayachari Yoga', false, 'Planets in both 2nd and 12th from Sun', []);
  }

  const secondFromSunSignIndex = (sunPos.signIndex + 1) % 12;
  const twelfthFromSunSignIndex = (sunPos.signIndex + 11) % 12;

  const planetsInSecond: Planet[] = [];
  const planetsInTwelfth: Planet[] = [];

  const planetsToCheck: Planet[] = ['Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

  for (const planet of planetsToCheck) {
    const pos = positions[planet];
    if (!pos) continue;
    if (pos.signIndex === secondFromSunSignIndex) {
      planetsInSecond.push(planet);
    }
    if (pos.signIndex === twelfthFromSunSignIndex) {
      planetsInTwelfth.push(planet);
    }
  }

  const present = planetsInSecond.length > 0 && planetsInTwelfth.length > 0;
  const totalPlanets = planetsInSecond.length + planetsInTwelfth.length;
  const allInvolved: Planet[] = [...planetsInSecond, ...planetsInTwelfth];

  const strength = totalPlanets >= 4 ? 'Strong' : totalPlanets >= 2 ? 'Moderate' : 'Weak';

  return createYoga(
    'Ubhayachari Yoga',
    present,
    'Planets flanking the Sun in both the 2nd and 12th houses bring royal connections, high status, and a commanding presence',
    present ? allInvolved : [],
    present ? strength : 'Weak'
  );
}

// ─── 15. Dhana Yoga ──────────────────────────────────────────────────────────

/**
 * Dhana Yoga: Lords of the 2nd and 11th houses in conjunction or mutual aspect
 * with each other, or with lords of Kendra/Trikona houses.
 * Brings wealth and financial prosperity throughout life.
 */
export function detectDhanaYoga(
  positions: Record<string, PlanetPosition>,
  ascendantSignIndex: number
): YogaData {
  const involvedPlanets: Planet[] = [];
  let strongCondition = false;

  // Get the sign indices for the 2nd and 11th houses
  const secondHouseSignIndex = (ascendantSignIndex + 1) % 12;
  const eleventhHouseSignIndex = (ascendantSignIndex + 10) % 12;

  // Get lords of 2nd and 11th houses
  const secondLord = getSignLordByIndex(secondHouseSignIndex);
  const eleventhLord = getSignLordByIndex(eleventhHouseSignIndex);

  const secondLordPos = positions[secondLord];
  const eleventhLordPos = positions[eleventhLord];

  // Condition 1: Lords of 2nd and 11th in conjunction (same sign)
  if (secondLordPos && eleventhLordPos && secondLordPos.signIndex === eleventhLordPos.signIndex) {
    if (!involvedPlanets.includes(secondLord)) involvedPlanets.push(secondLord);
    if (!involvedPlanets.includes(eleventhLord)) involvedPlanets.push(eleventhLord);
    strongCondition = true;
  }

  // Condition 2: 2nd lord in 11th house or 11th lord in 2nd house
  if (secondLordPos) {
    const secondLordHouse = getPlanetHouse(secondLordPos.signIndex, ascendantSignIndex);
    if (secondLordHouse === 11) {
      if (!involvedPlanets.includes(secondLord)) involvedPlanets.push(secondLord);
      if (!involvedPlanets.includes(eleventhLord)) involvedPlanets.push(eleventhLord);
      strongCondition = true;
    }
  }

  if (eleventhLordPos) {
    const eleventhLordHouse = getPlanetHouse(eleventhLordPos.signIndex, ascendantSignIndex);
    if (eleventhLordHouse === 2) {
      if (!involvedPlanets.includes(secondLord)) involvedPlanets.push(secondLord);
      if (!involvedPlanets.includes(eleventhLord)) involvedPlanets.push(eleventhLord);
      strongCondition = true;
    }
  }

  // Condition 3: 2nd or 11th lord in conjunction with a Kendra or Trikona lord
  const kendraSignIndices = KENDRA_HOUSES.map(h => (ascendantSignIndex + h - 1) % 12);
  const trikonaSignIndices = TRIKONA_HOUSES.map(h => (ascendantSignIndex + h - 1) % 12);

  const kendraLords: Planet[] = kendraSignIndices.map(si => getSignLordByIndex(si));
  const trikonaLords: Planet[] = trikonaSignIndices.map(si => getSignLordByIndex(si));
  const angleTrineLords = Array.from(new Set([...kendraLords, ...trikonaLords]));

  for (const lord of angleTrineLords) {
    const lordPos = positions[lord];
    if (!lordPos) continue;

    // Check conjunction with 2nd lord
    if (secondLordPos && lordPos.signIndex === secondLordPos.signIndex && lord !== secondLord) {
      if (!involvedPlanets.includes(secondLord)) involvedPlanets.push(secondLord);
      if (!involvedPlanets.includes(lord)) involvedPlanets.push(lord);
    }

    // Check conjunction with 11th lord
    if (eleventhLordPos && lordPos.signIndex === eleventhLordPos.signIndex && lord !== eleventhLord) {
      if (!involvedPlanets.includes(eleventhLord)) involvedPlanets.push(eleventhLord);
      if (!involvedPlanets.includes(lord)) involvedPlanets.push(lord);
    }
  }

  // Also check for mutual aspect (7th aspect) between 2nd and 11th lords
  if (secondLordPos && eleventhLordPos) {
    const diff = ((secondLordPos.signIndex - eleventhLordPos.signIndex) % 12 + 12) % 12;
    if (diff === 6 || diff === 6) { // 7th aspect from each other
      if (!involvedPlanets.includes(secondLord)) involvedPlanets.push(secondLord);
      if (!involvedPlanets.includes(eleventhLord)) involvedPlanets.push(eleventhLord);
    }
  }

  const present = involvedPlanets.length >= 2;

  return createYoga(
    'Dhana Yoga',
    present,
    'Lords of wealth houses (2nd and 11th) in auspicious connection bring financial prosperity, material abundance, and wealth through multiple sources',
    involvedPlanets,
    present ? (strongCondition ? 'Strong' : 'Moderate') : 'Weak'
  );
}

// ─── 16. Vipreet Raj Yoga ────────────────────────────────────────────────────

/**
 * Vipreet Raj Yoga: Lords of the Dushtana houses (6th, 8th, 12th) occupy
 * other Dushtana houses (6th, 8th, 12th) from each other.
 * "Vipreet" means "opposite" or "contrary" — rise from adversity.
 * The very challenges and obstacles become the source of power and success.
 * 
 * Harsha Yoga: 6th lord in 6th, 8th, or 12th house
 * Sarala Yoga: 8th lord in 6th, 8th, or 12th house
 * Vimala Yoga: 12th lord in 6th, 8th, or 12th house
 */
export function detectVipreetRajYoga(
  positions: Record<string, PlanetPosition>,
  ascendantSignIndex: number
): YogaData {
  const involvedPlanets: Planet[] = [];
  const subYogasFound: string[] = [];

  // Get sign indices for Dushtana houses
  const sixthHouseSignIndex = (ascendantSignIndex + 5) % 12;
  const eighthHouseSignIndex = (ascendantSignIndex + 7) % 12;
  const twelfthHouseSignIndex = (ascendantSignIndex + 11) % 12;

  const dushtanaHouseNumbers = [6, 8, 12];

  // Get lords of Dushtana houses
  const sixthLord = getSignLordByIndex(sixthHouseSignIndex);
  const eighthLord = getSignLordByIndex(eighthHouseSignIndex);
  const twelfthLord = getSignLordByIndex(twelfthHouseSignIndex);

  // Check Harsha Yoga: 6th lord in 6th, 8th, or 12th house
  const sixthLordPos = positions[sixthLord];
  if (sixthLordPos) {
    const house = getPlanetHouse(sixthLordPos.signIndex, ascendantSignIndex);
    if (dushtanaHouseNumbers.includes(house)) {
      involvedPlanets.push(sixthLord);
      subYogasFound.push('Harsha');
    }
  }

  // Check Sarala Yoga: 8th lord in 6th, 8th, or 12th house
  const eighthLordPos = positions[eighthLord];
  if (eighthLordPos) {
    const house = getPlanetHouse(eighthLordPos.signIndex, ascendantSignIndex);
    if (dushtanaHouseNumbers.includes(house)) {
      if (!involvedPlanets.includes(eighthLord)) involvedPlanets.push(eighthLord);
      subYogasFound.push('Sarala');
    }
  }

  // Check Vimala Yoga: 12th lord in 6th, 8th, or 12th house
  const twelfthLordPos = positions[twelfthLord];
  if (twelfthLordPos) {
    const house = getPlanetHouse(twelfthLordPos.signIndex, ascendantSignIndex);
    if (dushtanaHouseNumbers.includes(house)) {
      if (!involvedPlanets.includes(twelfthLord)) involvedPlanets.push(twelfthLord);
      subYogasFound.push('Vimala');
    }
  }

  const present = subYogasFound.length > 0;
  const strength = subYogasFound.length >= 2 ? 'Strong' : 'Moderate';

  return createYoga(
    'Vipreet Raj Yoga',
    present,
    present
      ? `Vipreet Raj Yoga detected (${subYogasFound.join(' + ')}): lords of challenging houses placed in other challenging houses, bringing extraordinary rise from adversity and obstacles`
      : 'Lords of Dushtana houses (6th, 8th, 12th) in other Dushtana houses bring rise from adversity',
    involvedPlanets,
    present ? strength : 'Weak'
  );
}

// ─── Detect All Yogas ────────────────────────────────────────────────────────

/**
 * Detect all 16 yogas for the given planetary positions and ascendant.
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
    detectAmalaYoga(positions),
    detectVeshiYoga(positions),
    detectVoshiYoga(positions),
    detectUbhayachariYoga(positions),
    detectDhanaYoga(positions, ascendantSignIndex),
    detectVipreetRajYoga(positions, ascendantSignIndex),
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
