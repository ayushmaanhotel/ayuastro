/**
 * AyuAstro - Dosha Detection
 * 
 * Doshas are astrological afflictions that indicate challenges in a person's life.
 * This module detects the following 4 important doshas:
 * 
 * 1. Mangal Dosha (Manglik) - Mars in 1,4,7,8,12 houses
 * 2. Kaal Sarp Dosha - All planets between Rahu and Ketu
 * 3. Pitra Dosha - Sun-Rahu or Sun-Saturn affliction
 * 4. Shani Sade Sati - Saturn transiting 12th, 1st, 2nd from Moon
 */

import {
  type DoshaData,
  type DoshaType,
  type PlanetPosition,
  type Planet,
  type ZodiacSign,
} from './types';

import {
  getHouseFromAscendant,
  getSignIndex,
  angularDistance,
  normalizeLongitude,
  NUM_SIGNS,
} from './utils';

// ─── Helper ──────────────────────────────────────────────────────────────────

function createDosha(
  name: DoshaType,
  present: boolean,
  severity: 'High' | 'Medium' | 'Low',
  description: string,
  remedies: string[]
): DoshaData {
  return { name, present, severity, description, remedies };
}

// ─── 1. Mangal Dosha ─────────────────────────────────────────────────────────

/**
 * Mangal Dosha (Manglik Dosha):
 * Mars placed in houses 1, 4, 7, 8, or 12 from the ascendant.
 * Also checked from the Moon sign and Venus sign.
 * 
 * House 1: Affects personality and health of spouse
 * House 4: Affects domestic peace and property
 * House 7: Directly affects marriage and partnership
 * House 8: Affects longevity of marriage and hidden issues
 * House 12: Affects bed pleasures and expenses
 */
export function detectMangalDosha(
  positions: Record<string, PlanetPosition>,
  ascendantSignIndex: number
): DoshaData {
  const marsPos = positions['Mars'];
  if (!marsPos) {
    return createDosha('Mangal Dosha', false, 'Low', 'Mars position unknown', []);
  }
  
  const marsHouseFromLagna = getHouseFromAscendant(marsPos.signIndex, ascendantSignIndex);
  const doshaHouses = [1, 4, 7, 8, 12];
  
  const fromLagna = doshaHouses.includes(marsHouseFromLagna);
  
  // Also check from Moon
  const moonPos = positions['Moon'];
  let fromMoon = false;
  if (moonPos) {
    const marsHouseFromMoon = getHouseFromAscendant(marsPos.signIndex, moonPos.signIndex);
    fromMoon = doshaHouses.includes(marsHouseFromMoon);
  }
  
  // Also check from Venus
  const venusPos = positions['Venus'];
  let fromVenus = false;
  if (venusPos) {
    const marsHouseFromVenus = getHouseFromAscendant(marsPos.signIndex, venusPos.signIndex);
    fromVenus = doshaHouses.includes(marsHouseFromVenus);
  }
  
  const present = fromLagna || fromMoon || fromVenus;
  
  // Severity: from 7th house is highest, from Lagna is medium, from Moon/Venus only is lower
  let severity: 'High' | 'Medium' | 'Low' = 'Low';
  if (present) {
    if (marsHouseFromLagna === 7) severity = 'High';
    else if (fromLagna && fromMoon) severity = 'High';
    else if (fromLagna) severity = 'Medium';
    else if (fromMoon) severity = 'Medium';
    else severity = 'Low';
  }
  
  // Check for cancellation conditions
  // Mars in Aries or Scorpio (own sign) in certain houses reduces dosha
  const marsInOwnSign = marsPos.sign === 'Aries' || marsPos.sign === 'Scorpio';
  // Mars in Capricorn (exalted) cancels dosha
  const marsExalted = marsPos.sign === 'Capricorn';
  // Mars in conjunction with Jupiter or aspected by Jupiter reduces dosha
  const jupiterPos = positions['Jupiter'];
  const marsWithJupiter = jupiterPos && marsPos.signIndex === jupiterPos.signIndex;
  
  if (present && (marsInOwnSign || marsExalted || marsWithJupiter)) {
    severity = severity === 'High' ? 'Medium' : 'Low';
  }
  
  const remedies = [
    'Marry someone with Mangal Dosha for mutual cancellation',
    'Perform Mangal Shanti Puja before marriage',
    'Chant Mangal Mantra: "Om Angarkayai Namah"',
    'Worship Lord Hanuman on Tuesdays',
    'Donate red items on Tuesdays',
    'Wear a red coral gemstone after consultation',
  ];
  
  return createDosha(
    'Mangal Dosha',
    present,
    severity,
    `Mars in house ${marsHouseFromLagna} from Lagna${fromMoon ? ' and from Moon sign' : ''}${fromVenus ? ' and from Venus sign' : ''} creates challenges in marital harmony and domestic peace`,
    present ? remedies : []
  );
}

// ─── 2. Kaal Sarp Dosha ──────────────────────────────────────────────────────

/**
 * Kaal Sarp Dosha:
 * All planets are hemmed between Rahu and Ketu (i.e., between the lunar nodes).
 * This indicates karmic challenges and obstacles in life.
 * 
 * Types based on Rahu's position:
 * - Anant: Rahu in 1st house
 * - Kulik: Rahu in 2nd house
 * - Vasuki: Rahu in 3rd house
 * - Shankhpal: Rahu in 4th house
 * - Padma: Rahu in 5th house
 * - Mahapadma: Rahu in 6th house
 * - Takshak: Rahu in 7th house
 * - Karkotak: Rahu in 8th house
 * - Shankhachud: Rahu in 9th house
 * - Ghashtak: Rahu in 10th house
 * - Sheshnag: Rahu in 11th house
 * - Rudra: Rahu in 12th house
 */
export function detectKaalSarpDosha(
  positions: Record<string, PlanetPosition>,
  ascendantSignIndex: number
): DoshaData {
  const rahuPos = positions['Rahu'];
  const ketuPos = positions['Ketu'];
  
  if (!rahuPos || !ketuPos) {
    return createDosha('Kaal Sarp Dosha', false, 'Low', 'Rahu/Ketu positions unknown', []);
  }
  
  const rahuSignIndex = rahuPos.signIndex;
  const ketuSignIndex = ketuPos.signIndex;
  
  // Check if all planets are between Rahu and Ketu
  // "Between" means in the arc from Rahu to Ketu in the direction of zodiac progression
  // (or from Ketu to Rahu, depending on the type)
  
  let allBetweenRahuToKetu = true; // Moving from Rahu towards Ketu (in forward direction)
  let allBetweenKetuToRahu = true; // Moving from Ketu towards Rahu (in forward direction)
  
  const otherPlanets: Planet[] = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
  
  for (const planet of otherPlanets) {
    const pos = positions[planet];
    if (!pos) continue;
    
    const planetSign = pos.signIndex;
    
    // Check if planet is in the arc from Rahu to Ketu (going forward)
    if (!isInArc(planetSign, rahuSignIndex, ketuSignIndex)) {
      allBetweenRahuToKetu = false;
    }
    
    // Check if planet is in the arc from Ketu to Rahu (going forward)
    if (!isInArc(planetSign, ketuSignIndex, rahuSignIndex)) {
      allBetweenKetuToRahu = false;
    }
  }
  
  // Kaal Sarp Dosha: all planets between Rahu and Ketu (either direction)
  // But the traditional definition: all planets on one side of the Rahu-Ketu axis
  const present = allBetweenRahuToKetu || allBetweenKetuToRahu;
  
  // Determine severity
  let severity: 'High' | 'Medium' | 'Low' = 'Low';
  if (present) {
    // Count how many planets are exactly with Rahu or Ketu (reduces severity)
    const planetsWithRahuOrKetu = otherPlanets.filter(p => {
      const pos = positions[p];
      return pos && (pos.signIndex === rahuSignIndex || pos.signIndex === ketuSignIndex);
    });
    
    if (planetsWithRahuOrKetu.length >= 2) severity = 'Low';
    else if (allBetweenRahuToKetu && allBetweenKetuToRahu) severity = 'High'; // Extremely rare
    else severity = 'Medium';
  }
  
  // Determine the type of Kaal Sarp Dosha
  const rahuHouse = getHouseFromAscendant(rahuSignIndex, ascendantSignIndex);
  const doshaTypes: Record<number, string> = {
    1: 'Anant', 2: 'Kulik', 3: 'Vasuki', 4: 'Shankhpal',
    5: 'Padma', 6: 'Mahapadma', 7: 'Takshak', 8: 'Karkotak',
    9: 'Shankhachud', 10: 'Ghashtak', 11: 'Sheshnag', 12: 'Rudra',
  };
  
  const doshaType = doshaTypes[rahuHouse] || 'Unknown';
  
  const remedies = [
    'Perform Kaal Sarp Dosh Nivaran Puja at Trimbakeshwar or Kalahasti',
    'Chant Rahu-Ketu Mantras on Nag Panchami',
    'Wear a Gomed (Hessonite) for Rahu and Cat\'s Eye for Ketu after consultation',
    'Offer milk and water to a Shivalinga on Mondays',
    'Keep a silver snake idol at the puja place',
    'Chant "Om Namo Bhagavate Vasudevaya" 108 times daily',
  ];
  
  return createDosha(
    'Kaal Sarp Dosha',
    present,
    severity,
    present ? `${doshaType} Kaal Sarp Dosha with Rahu in house ${rahuHouse}. All planets hemmed between Rahu and Ketu, indicating karmic obstacles and struggles` : 'All planets are not hemmed between Rahu and Ketu',
    present ? remedies : []
  );
}

/** Check if a sign index is within the arc from startSign to endSign (going forward) */
function isInArc(planetSign: number, startSign: number, endSign: number): boolean {
  if (startSign <= endSign) {
    return planetSign >= startSign && planetSign <= endSign;
  } else {
    // Arc wraps around 0
    return planetSign >= startSign || planetSign <= endSign;
  }
}

// ─── 3. Pitra Dosha ──────────────────────────────────────────────────────────

/**
 * Pitra Dosha:
 * Caused by:
 * - Sun conjunct Rahu (eclipse on Sun)
 * - Sun conjunct Saturn (father-related afflictions)
 * - Sun in 9th house afflicted by Rahu or Saturn
 * - 9th lord afflicted
 * 
 * Indicates ancestral karma and father-related challenges.
 */
export function detectPitraDosha(
  positions: Record<string, PlanetPosition>,
  ascendantSignIndex: number
): DoshaData {
  const sunPos = positions['Sun'];
  const rahuPos = positions['Rahu'];
  const saturnPos = positions['Saturn'];
  
  if (!sunPos) {
    return createDosha('Pitra Dosha', false, 'Low', 'Sun position unknown', []);
  }
  
  const sunHouse = getHouseFromAscendant(sunPos.signIndex, ascendantSignIndex);
  let present = false;
  let severity: 'High' | 'Medium' | 'Low' = 'Low';
  const conditions: string[] = [];
  
  // Condition 1: Sun conjunct Rahu
  if (rahuPos && sunPos.signIndex === rahuPos.signIndex) {
    present = true;
    conditions.push('Sun conjunct Rahu (solar eclipse energy)');
    severity = 'High';
  }
  
  // Condition 2: Sun conjunct Saturn
  if (saturnPos && sunPos.signIndex === saturnPos.signIndex) {
    present = true;
    conditions.push('Sun conjunct Saturn');
    if (severity !== 'High') severity = 'Medium';
  }
  
  // Condition 3: Rahu in 9th house (house of father/dharma)
  if (rahuPos) {
    const rahuHouse = getHouseFromAscendant(rahuPos.signIndex, ascendantSignIndex);
    if (rahuHouse === 9) {
      present = true;
      conditions.push('Rahu in 9th house (house of father)');
      if (severity !== 'High') severity = 'Medium';
    }
  }
  
  // Condition 4: Sun in 9th house with Rahu or Saturn aspect
  if (sunHouse === 9) {
    if (rahuPos && rahuPos.signIndex === sunPos.signIndex) {
      present = true;
      conditions.push('Sun and Rahu in 9th house');
      severity = 'High';
    }
  }
  
  // Condition 5: Saturn aspecting Sun (7th aspect, 3rd aspect, 10th aspect)
  if (saturnPos) {
    const saturnToSunDiff = ((sunPos.signIndex - saturnPos.signIndex) % NUM_SIGNS + NUM_SIGNS) % NUM_SIGNS;
    if (saturnToSunDiff === 0 || saturnToSunDiff === 3 || saturnToSunDiff === 7 || saturnToSunDiff === 10) {
      present = true;
      conditions.push('Saturn aspecting Sun');
      if (severity === 'Low') severity = 'Medium';
    }
  }
  
  const remedies = [
    'Perform Pitra Shradh ceremonies during Pitra Paksha',
    'Offer water to Sun (Surya Arghya) daily at sunrise',
    'Perform Tarpan for ancestors on Amavasya',
    'Chant "Om Suryaya Namah" and "Om Raahave Namah"',
    'Donate food to Brahmins on Sundays',
    'Wear a copper coin or red coral after consultation',
    'Offer sesame seeds and water to a Peepal tree on Saturdays',
  ];
  
  return createDosha(
    'Pitra Dosha',
    present,
    severity,
    present ? `Pitra Dosha detected: ${conditions.join('; ')}. This indicates ancestral karmic debts and challenges related to father, authority, and dharma` : 'No Pitra Dosha detected',
    present ? remedies : []
  );
}

// ─── 4. Shani Sade Sati ──────────────────────────────────────────────────────

/**
 * Shani Sade Sati:
 * Saturn's 7.5-year transit through the 12th, 1st, and 2nd houses from the Moon.
 * This is a significant transit that brings challenges, learning, and transformation.
 * 
 * Phase 1 (Rising): Saturn in 12th from Moon (~2.5 years)
 * Phase 2 (Peak): Saturn in 1st from Moon (~2.5 years) - most challenging
 * Phase 3 (Setting): Saturn in 2nd from Moon (~2.5 years)
 */
export function detectSadeSati(
  positions: Record<string, PlanetPosition>,
  birthDate: Date
): DoshaData {
  const moonPos = positions['Moon'];
  const saturnPos = positions['Saturn'];
  
  if (!moonPos || !saturnPos) {
    return createDosha('Shani Sade Sati', false, 'Low', 'Moon/Saturn positions unknown', []);
  }
  
  // Current Saturn position is already calculated in the birth chart
  // For Sade Sati, we check the current transit position of Saturn relative to natal Moon
  // Since we calculate the birth chart, we check if Saturn is in 12th, 1st, or 2nd from natal Moon
  
  const saturnHouseFromMoon = getHouseFromAscendant(saturnPos.signIndex, moonPos.signIndex);
  
  const inSadeSati = saturnHouseFromMoon === 12 || saturnHouseFromMoon === 1 || saturnHouseFromMoon === 2;
  
  let phase = '';
  let severity: 'High' | 'Medium' | 'Low' = 'Low';
  
  if (inSadeSati) {
    if (saturnHouseFromMoon === 12) {
      phase = 'Rising Phase (Saturn in 12th from Moon)';
      severity = 'Medium';
    } else if (saturnHouseFromMoon === 1) {
      phase = 'Peak Phase (Saturn over Moon)';
      severity = 'High';
    } else if (saturnHouseFromMoon === 2) {
      phase = 'Setting Phase (Saturn in 2nd from Moon)';
      severity = 'Medium';
    }
  }
  
  // Also check for Dhaiya (Saturn in 4th or 8th from Moon)
  const inDhaiya = saturnHouseFromMoon === 4 || saturnHouseFromMoon === 8;
  
  const remedies = [
    'Chant Shani Mantra: "Om Sham Shanicharaya Namah" 108 times on Saturdays',
    'Light a mustard oil lamp under a Peepal tree on Saturdays',
    'Donate black sesame seeds, iron, and oil on Saturdays',
    'Wear a blue sapphire (Neelam) after expert consultation',
    'Recite Hanuman Chalisa daily for protection',
    'Feed the poor and crows on Saturdays',
    'Perform Shani Puja at Shani Shinganapur or nearby temple',
  ];
  
  if (inSadeSati) {
    return createDosha(
      'Shani Sade Sati',
      true,
      severity,
      `Currently in ${phase} of Sade Sati. This 7.5-year transit of Saturn brings lessons, challenges, and eventual growth`,
      remedies
    );
  }
  
  if (inDhaiya) {
    return createDosha(
      'Shani Sade Sati',
      false,
      'Low',
      `Not in Sade Sati, but Saturn is in house ${saturnHouseFromMoon} from Moon (Dhaiya period), which brings some challenges`,
      []
    );
  }
  
  return createDosha(
    'Shani Sade Sati',
    false,
    'Low',
    `Saturn is in house ${saturnHouseFromMoon} from Moon - not in Sade Sati period`,
    []
  );
}

// ─── Detect All Doshas ───────────────────────────────────────────────────────

/**
 * Detect all 4 doshas for the given planetary positions and ascendant.
 */
export function detectAllDoshas(
  positions: Record<string, PlanetPosition>,
  ascendantSignIndex: number,
  birthDate: Date
): DoshaData[] {
  return [
    detectMangalDosha(positions, ascendantSignIndex),
    detectKaalSarpDosha(positions, ascendantSignIndex),
    detectPitraDosha(positions, ascendantSignIndex),
    detectSadeSati(positions, birthDate),
  ];
}
