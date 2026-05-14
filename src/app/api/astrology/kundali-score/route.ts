import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import {
  isExalted,
  isDebilitated,
  isInOwnSign,
  isInMoolatrikona,
  getSignLord,
  getSignIndex,
  getPermanentRelationship,
  KENDRA_HOUSES,
  TRIKONA_HOUSES,
  NATURAL_BENEFICS,
  NATURAL_MALEFICS,
  getHouseFromAscendant,
  EXALTATION,
  COMBUSTION_DEGREES,
  angularDistance,
} from '@/lib/astrology/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PlanetPosInput {
  sign: string;
  degree: number;
  house: number;
  retrograde?: boolean;
  isCombust?: boolean;
  nakshatra?: string;
  nakshatraPada?: number;
}

interface BreakdownItem {
  score: number;
  label: string;
  description: string;
  details?: string[];
}

interface KundaliScoreResponse {
  overallScore: number;
  grade: string;
  gradeDescription: string;
  breakdown: {
    planetStrength: BreakdownItem;
    yogaScore: BreakdownItem;
    doshaPenalty: BreakdownItem;
    housePlacement: BreakdownItem;
    ascendantLord: BreakdownItem;
    nakshatraStrength: BreakdownItem;
    elementalBalance: BreakdownItem;
  };
  honestAssessment: string;
  topStrength: string;
  topChallenge: string;
  remedies: string[];
}

// ─── Zod Schema ───────────────────────────────────────────────────────────────

const kundaliScoreSchema = z.object({
  userId: z.string().optional(),
  sunSign: z.string().optional(),
  moonSign: z.string().optional(),
  ascendant: z.string().optional(),
  planetaryPositions: z.record(z.string(), z.unknown()).optional(),
  yogas: z.array(z.string()).optional(),
  doshas: z.array(z.string()).optional(),
  nakshatra: z.string().optional(),
});

// ─── Helper: Get grade from score ─────────────────────────────────────────────

function getGrade(score: number): { grade: string; description: string } {
  if (score >= 90) return { grade: 'A+', description: 'Exceptional chart with rare strengths — genuinely powerful placements' };
  if (score >= 80) return { grade: 'A', description: 'Strong chart with powerful placements — real advantages exist' };
  if (score >= 72) return { grade: 'B+', description: 'Good chart with some real challenges — mostly solid foundation' };
  if (score >= 64) return { grade: 'B', description: 'Decent chart — balanced strengths and weaknesses, neither blessed nor cursed' };
  if (score >= 56) return { grade: 'C+', description: 'Average chart with notable challenges — you\'ll work harder for some things' };
  if (score >= 48) return { grade: 'C', description: 'Below average — significant challenges exist, awareness is your first tool' };
  if (score >= 35) return { grade: 'D', description: 'Difficult chart with multiple afflictions — honest truth, harder path' };
  return { grade: 'D-', description: 'Heavily afflicted chart — not a curse, just a much harder path that demands more from you' };
}

// ─── 1. Planet Strength Calculation (revised & more accurate) ──────────────────

/**
 * Evaluates the dignity and strength of each major planet.
 * 
 * Scoring per planet (0-10 scale):
 * - Exalted: 10
 * - Own sign: 9
 * - Moolatrikona: 8.5
 * - Great Friend's sign: 7.5
 * - Friend's sign: 7
 * - Neutral sign: 5
 * - Enemy's sign: 3.5
 * - Great Enemy's sign: 2.5
 * - Debilitated: 1.5
 * 
 * Modifiers:
 * - Retrograde: +0.5 (Vedic considers retrograde planets stronger/cheshta)
 * - Combust: -2.0 (severely weakened by proximity to Sun)
 */
function calculatePlanetStrength(
  positions: Record<string, PlanetPosInput>
): BreakdownItem {
  const majorPlanets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
  let totalPoints = 0;
  let maxPoints = 0;
  const details: string[] = [];
  const planetScores: { planet: string; score: number; dignity: string }[] = [];

  for (const planet of majorPlanets) {
    const pos = positions[planet];
    if (!pos) continue;
    maxPoints += 10;

    let points = 5; // Neutral baseline
    let dignity = 'neutral';

    // Check exaltation first (highest priority)
    if (isExalted(planet as keyof typeof EXALTATION & string, pos.sign)) {
      points = 10;
      dignity = 'exalted';
      details.push(`${planet} is exalted in ${pos.sign} — very strong`);
    } else if (isInOwnSign(planet as 'Sun' | 'Moon' | 'Mars' | 'Mercury' | 'Jupiter' | 'Venus' | 'Saturn', pos.sign)) {
      points = 9;
      dignity = 'own sign';
      details.push(`${planet} is in its own sign ${pos.sign} — strong`);
    } else if (isInMoolatrikona(planet as 'Sun' | 'Moon' | 'Mars' | 'Mercury' | 'Jupiter' | 'Venus' | 'Saturn', pos.sign)) {
      points = 8.5;
      dignity = 'moolatrikona';
      details.push(`${planet} is in Moolatrikona (${pos.sign}) — good strength`);
    } else if (isDebilitated(planet as 'Sun' | 'Moon' | 'Mars' | 'Mercury' | 'Jupiter' | 'Venus' | 'Saturn', pos.sign)) {
      points = 1.5;
      dignity = 'debilitated';
      details.push(`${planet} is debilitated in ${pos.sign} — weak placement`);
    } else {
      // Check dignity based on relationship with sign lord
      try {
        const signLord = getSignLord(pos.sign as 'Aries' | 'Taurus' | 'Gemini' | 'Cancer' | 'Leo' | 'Virgo' | 'Libra' | 'Scorpio' | 'Sagittarius' | 'Capricorn' | 'Aquarius' | 'Pisces');
        const relationship = getPermanentRelationship(
          planet as 'Sun' | 'Moon' | 'Mars' | 'Mercury' | 'Jupiter' | 'Venus' | 'Saturn' | 'Rahu' | 'Ketu',
          signLord as 'Sun' | 'Moon' | 'Mars' | 'Mercury' | 'Jupiter' | 'Venus' | 'Saturn' | 'Rahu' | 'Ketu'
        );
        
        switch (relationship) {
          case 'Great Friend':
            points = 7.5;
            dignity = 'great friend\'s sign';
            details.push(`${planet} in ${pos.sign} (lord ${signLord} is great friend) — strong support`);
            break;
          case 'Friend':
            points = 7;
            dignity = 'friend\'s sign';
            details.push(`${planet} in ${pos.sign} (lord ${signLord} is friend) — comfortable`);
            break;
          case 'Neutral':
            points = 5;
            dignity = 'neutral sign';
            // No detail needed for neutral — keeps output clean
            break;
          case 'Enemy':
            points = 3.5;
            dignity = 'enemy\'s sign';
            details.push(`${planet} in ${pos.sign} (lord ${signLord} is enemy) — uncomfortable`);
            break;
          case 'Great Enemy':
            points = 2.5;
            dignity = 'great enemy\'s sign';
            details.push(`${planet} in ${pos.sign} (lord ${signLord} is great enemy) — very uncomfortable`);
            break;
        }
      } catch {
        // If relationship lookup fails, keep neutral score
        points = 5;
        dignity = 'neutral';
      }
    }

    // Combustion penalty (severe weakness)
    if (pos.isCombust) {
      points = Math.max(0.5, points - 2);
      dignity += ' (combust)';
      details.push(`${planet} is combust — significantly weakened by proximity to Sun`);
    }

    // Retrograde bonus — Vedic astrology considers retrograde planets as having
    // enhanced "cheshta bala" (effort/motion strength) because they are closer to Earth
    if (pos.retrograde && planet !== 'Sun' && planet !== 'Moon') {
      points = Math.min(10, points + 0.5);
    }

    planetScores.push({ planet, score: points, dignity });
    totalPoints += points;
  }

  const score = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 50;

  // Find strongest and weakest planets for description
  const sortedByScore = [...planetScores].sort((a, b) => b.score - a.score);
  const strongest = sortedByScore[0];
  const weakest = sortedByScore[sortedByScore.length - 1];

  let description: string;
  if (score >= 75) {
    description = `Your planets are well-placed overall. ${strongest.planet} is your strongest planet (${strongest.dignity}).`;
  } else if (score >= 55) {
    description = `Mixed planetary strength. ${strongest.planet} supports you (${strongest.dignity}), but ${weakest.planet} needs work (${weakest.dignity}).`;
  } else {
    description = `Several planets are uncomfortable in their signs. ${weakest.planet} is weakest (${weakest.dignity}). You'll need to put in more effort where others have natural advantages.`;
  }

  return { score, label: 'Planet Strength', description, details: details.slice(0, 4) };
}

// ─── 2. Yoga Score Calculation ────────────────────────────────────────────────

function calculateYogaScore(yogas: string[]): BreakdownItem {
  const yogaCount = yogas.length;

  // Raj Yogas and Panch Mahapurusha Yogas are more powerful
  const POWERFUL_YOGAS = ['Raj Yoga', 'Gaj Kesari Yoga', 'Hansa Yoga', 'Malavya Yoga', 'Ruchaka Yoga', 'Bhadra Yoga', 'Shasha Yoga', 'Neech Bhang Raj Yoga', 'Vipreet Raj Yoga'];
  const GOOD_YOGAS = ['Chandra Mangal Yoga', 'Budh Aditya Yoga', 'Amala Yoga', 'Dhana Yoga', 'Veshi Yoga', 'Voshi Yoga', 'Ubhayachari Yoga'];

  let yogaPoints = 0;
  const details: string[] = [];

  if (yogaCount === 0) {
    yogaPoints = 25;
    details.push('No significant yogas detected — this is normal, most charts have 0-2 yogas');
  } else {
    for (const yoga of yogas) {
      if (POWERFUL_YOGAS.includes(yoga)) {
        yogaPoints += 20;
        details.push(`${yoga} — powerful combination, genuine advantage`);
      } else if (GOOD_YOGAS.includes(yoga)) {
        yogaPoints += 12;
        details.push(`${yoga} — helpful combination`);
      } else {
        yogaPoints += 8;
        details.push(`${yoga} — minor combination`);
      }
    }
  }

  // Cap at 100
  const score = Math.min(100, Math.max(10, yogaPoints));

  let description: string;
  if (yogaCount === 0) {
    description = 'No significant yogas detected. This is common — most charts have 1-2 yogas at most. It means your strengths come from individual planet placements, not special combinations.';
  } else if (yogaCount === 1) {
    description = `1 auspicious yoga: ${yogas[0]}. This activates a special area of natural advantage in your chart.`;
  } else if (yogaCount <= 3) {
    description = `${yogaCount} auspicious yogas: ${yogas.join(', ')}. These bring genuine gifts and areas of natural advantage.`;
  } else {
    description = `${yogaCount} yogas detected: ${yogas.join(', ')}. This is rare and indicates multiple areas of strength.`;
  }

  return { score, label: 'Yogas & Blessings', description, details };
}

// ─── 3. Dosha Penalty Calculation ─────────────────────────────────────────────

function calculateDoshaPenalty(doshas: string[]): BreakdownItem {
  let penalty = 0;
  const details: string[] = [];

  const doshaSeverity: Record<string, number> = {
    'Kaal Sarp Dosha': 22,
    'Mangal Dosha': 18,
    'Shani Sade Sati': 16,
    'Shrapit Dosha': 15,
    'Grahan Dosha': 14,
    'Pitra Dosha': 12,
    'Nadi Dosha': 18,
  };

  for (const dosha of doshas) {
    const severity = doshaSeverity[dosha] || 10;
    penalty += severity;
    details.push(dosha);
  }

  const score = Math.max(10, 100 - penalty);

  let description: string;
  if (doshas.length === 0) {
    description = 'No significant doshas detected. Your chart is relatively clean of major afflictions — this is genuinely good.';
  } else if (doshas.length === 1) {
    description = `${doshas[0]} detected. This creates real challenges in specific life areas. Not a curse, but a pattern that demands awareness.`;
  } else if (doshas.length === 2) {
    description = `${doshas[0]} and ${doshas[1]} detected. Multiple doshas mean multiple challenge areas. Awareness is your first tool, remedies are your second.`;
  } else {
    description = `${doshas.length} doshas detected (${doshas.join(', ')}). This is a heavily challenged chart. Hard truths — but not hopeless. Remedies and awareness matter enormously.`;
  }

  return { score, label: 'Doshas & Challenges', description, details };
}

// ─── 4. House Placement Score (revised) ────────────────────────────────────────

/**
 * Evaluates house placement quality.
 * 
 * Scoring approach:
 * - Start from 0 (no planets) to 100 (perfect placement)
 * - Benefics in kendra/trikona: +5 each
 * - Benefics in dusthana (6,8,12): -4 each  
 * - Malefics in 6th (destroy enemies): +4
 * - Malefics in 3rd/11th (upachaya growth): +3
 * - Malefics in kendra: -2
 * - Malefics in dusthana 8/12: -1 (except 6th which is +4)
 * - Empty important houses: small penalty
 * - Many planets in one house: concentration bonus/penalty
 */
function calculateHousePlacement(
  positions: Record<string, PlanetPosInput>,
  ascendantSign: string
): BreakdownItem {
  const ascIndex = getSignIndex(ascendantSign as 'Aries' | 'Taurus' | 'Gemini' | 'Cancer' | 'Leo' | 'Virgo' | 'Libra' | 'Scorpio' | 'Sagittarius' | 'Capricorn' | 'Aquarius' | 'Pisces');
  if (ascIndex === -1) return { score: 50, label: 'House Layout', description: 'Unable to calculate house placements accurately.' };

  let points = 50; // Start at neutral baseline
  const details: string[] = [];
  const benefics = NATURAL_BENEFICS;
  const malefics = NATURAL_MALEFICS;
  const kendra = KENDRA_HOUSES;
  const trikona = TRIKONA_HOUSES;
  const dusthana = [6, 8, 12];
  const upachaya = [3, 6, 10, 11];

  // Track house occupancy for concentration check
  const houseOccupancy: Record<number, string[]> = {};

  for (const [planet, pos] of Object.entries(positions)) {
    const house = pos.house;
    if (!house) continue;

    if (!houseOccupancy[house]) houseOccupancy[house] = [];
    houseOccupancy[house].push(planet);

    const isBenefic = benefics.includes(planet as 'Jupiter' | 'Venus' | 'Mercury' | 'Moon');
    const isMalefic = malefics.includes(planet as 'Sun' | 'Mars' | 'Saturn' | 'Rahu' | 'Ketu');

    if (isBenefic) {
      if (kendra.includes(house)) {
        points += 5;
        details.push(`${planet} in ${house}${getOrdinal(house)} house (kendra) — stabilizing`);
      } else if (trikona.includes(house)) {
        points += 5;
        details.push(`${planet} in ${house}${getOrdinal(house)} house (trikona) — auspicious`);
      } else if (dusthana.includes(house)) {
        points -= 4;
        details.push(`${planet} in ${house}${getOrdinal(house)} house (dusthana) — weakened`);
      } else if (upachaya.includes(house)) {
        points += 2;
      }
    }

    if (isMalefic) {
      if (house === 6) {
        points += 4;
        details.push(`${planet} in 6th house — destroys opposition (good for malefics)`);
      } else if (house === 3 || house === 11) {
        points += 3;
        details.push(`${planet} in ${house}${getOrdinal(house)} house — grows stronger over time`);
      } else if (kendra.includes(house)) {
        points -= 2;
        // Malefics in kendras create stress but also determination — minor penalty
      } else if (dusthana.includes(house) && house !== 6) {
        points -= 1;
        // Malefics in 8th/12th are not ideal but not terrible
      }
    }
  }

  // Check for house concentration (too many planets in one house)
  for (const [house, planets] of Object.entries(houseOccupancy)) {
    if (planets.length >= 4) {
      points -= 3;
      details.push(`${planets.length} planets in ${house}${getOrdinal(Number(house))} house — over-concentration`);
    }
  }

  // Check for empty important houses
  const housesOccupied = new Set(Object.values(positions).map(p => p.house));
  if (!housesOccupied.has(1)) {
    details.push('1st house is empty — self-identity may need more conscious effort');
  }
  if (!housesOccupied.has(7)) {
    points -= 2;
    details.push('7th house is empty — partnerships may take more work');
  }
  if (!housesOccupied.has(10)) {
    points -= 2;
    details.push('10th house is empty — career direction may take time to clarify');
  }
  if (!housesOccupied.has(9)) {
    points -= 1;
    details.push('9th house is empty — fortune and dharma require more effort');
  }

  // Kendra-Trikona check: having benefics in kendra AND trikona is a major plus
  const beneficsInKendra = Object.entries(positions).filter(([p, pos]) =>
    benefics.includes(p as 'Jupiter' | 'Venus' | 'Mercury' | 'Moon') && kendra.includes(pos.house)
  ).length;
  const beneficsInTrikona = Object.entries(positions).filter(([p, pos]) =>
    benefics.includes(p as 'Jupiter' | 'Venus' | 'Mercury' | 'Moon') && trikona.includes(pos.house)
  ).length;
  if (beneficsInKendra >= 2 && beneficsInTrikona >= 1) {
    points += 5;
    details.push('Benefics well-distributed in kendra and trikona houses — strong foundation');
  }

  const score = Math.max(10, Math.min(100, points));
  const topDetail = details[0] || 'Your house layout is fairly standard with no extreme concentrations.';

  return { score, label: 'House Layout', description: topDetail, details: details.slice(0, 5) };
}

// ─── 5. Ascendant Lord Strength (revised) ─────────────────────────────────────

function calculateAscendantLordStrength(
  positions: Record<string, PlanetPosInput>,
  ascendantSign: string
): BreakdownItem {
  const ascIndex = getSignIndex(ascendantSign as 'Aries' | 'Taurus' | 'Gemini' | 'Cancer' | 'Leo' | 'Virgo' | 'Libra' | 'Scorpio' | 'Sagittarius' | 'Capricorn' | 'Aquarius' | 'Pisces');
  if (ascIndex === -1) return { score: 50, label: 'Ascendant Lord', description: 'Ascendant sign could not be determined.' };

  const lord = getSignLord(ascendantSign as 'Aries' | 'Taurus' | 'Gemini' | 'Cancer' | 'Leo' | 'Virgo' | 'Libra' | 'Scorpio' | 'Sagittarius' | 'Capricorn' | 'Aquarius' | 'Pisces');
  const lordPos = positions[lord];

  if (!lordPos) return { score: 50, label: 'Ascendant Lord', description: 'Ascendant lord position not available.' };

  let score = 50;
  const details: string[] = [];

  // Exalted
  if (isExalted(lord, lordPos.sign)) {
    score = 95;
    details.push('exalted — extremely powerful');
  }
  // Own sign
  else if (isInOwnSign(lord, lordPos.sign)) {
    score = 88;
    details.push('in its own sign — very strong');
  }
  // Moolatrikona
  else if (isInMoolatrikona(lord, lordPos.sign)) {
    score = 85;
    details.push('in Moolatrikona — strong');
  }
  // Check dignity by sign lord relationship
  else if (isDebilitated(lord, lordPos.sign)) {
    score = 20;
    details.push('debilitated — this is a genuine challenge');
  } else {
    // Check relationship with sign lord for more nuanced scoring
    try {
      const signLord = getSignLord(lordPos.sign as 'Aries' | 'Taurus' | 'Gemini' | 'Cancer' | 'Leo' | 'Virgo' | 'Libra' | 'Scorpio' | 'Sagittarius' | 'Capricorn' | 'Aquarius' | 'Pisces');
      const relationship = getPermanentRelationship(
        lord as 'Sun' | 'Moon' | 'Mars' | 'Mercury' | 'Jupiter' | 'Venus' | 'Saturn' | 'Rahu' | 'Ketu',
        signLord as 'Sun' | 'Moon' | 'Mars' | 'Mercury' | 'Jupiter' | 'Venus' | 'Saturn' | 'Rahu' | 'Ketu'
      );

      switch (relationship) {
        case 'Great Friend':
          score = 78;
          details.push(`in great friend's sign (${lordPos.sign}) — well-supported`);
          break;
        case 'Friend':
          score = 72;
          details.push(`in friend's sign (${lordPos.sign}) — comfortable`);
          break;
        case 'Neutral':
          score = 55;
          details.push('in a neutral position');
          break;
        case 'Enemy':
          score = 38;
          details.push(`in enemy's sign (${lordPos.sign}) — uncomfortable`);
          break;
        case 'Great Enemy':
          score = 28;
          details.push(`in great enemy's sign (${lordPos.sign}) — very challenging`);
          break;
      }
    } catch {
      // In kendra
      if (KENDRA_HOUSES.includes(lordPos.house)) {
        score = 72;
        details.push('in a kendra house — well-positioned');
      }
      // In trikona
      else if (TRIKONA_HOUSES.includes(lordPos.house)) {
        score = 75;
        details.push('in a trikona house — auspicious');
      }
      // In dusthana
      else if ([6, 8, 12].includes(lordPos.house)) {
        score = 30;
        details.push(`in the ${lordPos.house}${getOrdinal(lordPos.house)} house — weak placement`);
      }
      else {
        score = 55;
        details.push('in a neutral position');
      }
    }
  }

  // House placement modifiers (on top of dignity)
  if (KENDRA_HOUSES.includes(lordPos.house) && score < 72) {
    score = Math.min(score + 8, 72);
    details.push('kendra house placement provides stability');
  }
  if (TRIKONA_HOUSES.includes(lordPos.house) && score < 75) {
    score = Math.min(score + 5, 75);
    details.push('trikona house placement adds fortune');
  }
  if ([6, 8, 12].includes(lordPos.house) && !details.some(d => d.includes('house'))) {
    score = Math.max(score - 10, 15);
    details.push(`in dusthana house ${lordPos.house} — weakens the lord`);
  }

  // Retrograde bonus for ascendant lord
  if (lordPos.retrograde) {
    score = Math.min(100, score + 5);
    details.push('retrograde (enhances inner strength and self-reflection)');
  }

  // Combust penalty
  if (lordPos.isCombust) {
    score = Math.max(10, score - 15);
    details.push('combust — significantly weakened by Sun');
  }

  let description: string;
  if (score >= 80) {
    description = `Your chart ruler ${lord} is ${details.join(', ')}. This gives you natural leadership, self-direction, and inner confidence. This is a genuine strength — lean into it.`;
  } else if (score >= 60) {
    description = `Your chart ruler ${lord} is ${details.join(', ')}. Decent self-confidence with room for growth. You have enough inner drive, but doubt creeps in more than it should.`;
  } else if (score >= 40) {
    description = `Your chart ruler ${lord} is ${details.join(', ')}. You may struggle with self-direction and confidence. Not permanent — awareness and deliberate self-trust practice help enormously.`;
  } else {
    description = `Your chart ruler ${lord} is ${details.join(', ')}. This is a significant challenge. You'll need to work harder for self-assurance, but the growth potential is immense. Many great leaders had difficult ascendant lords.`;
  }

  return { score, label: 'Ascendant Lord', description };
}

// ─── 6. Nakshatra Strength (NEW) ──────────────────────────────────────────────

/**
 * Evaluates the Moon's nakshatra and its influence.
 * The Moon nakshatra is crucial in Vedic astrology — it defines your
 * emotional programming, mental tendencies, and dasha sequence.
 */
function calculateNakshatraStrength(
  positions: Record<string, PlanetPosInput>,
  moonNakshatra?: string
): BreakdownItem {
  const moonPos = positions['Moon'];
  if (!moonPos && !moonNakshatra) {
    return { score: 50, label: 'Nakshatra Strength', description: 'Moon nakshatra data not available.' };
  }

  const nakshatra = moonNakshatra || moonPos?.nakshatra;
  if (!nakshatra) {
    return { score: 50, label: 'Nakshatra Strength', description: 'Nakshatra data not available.' };
  }

  let score = 55; // Baseline
  const details: string[] = [];

  // Nakshatra ruler strength affects the nakshatra's overall influence
  const NAKSHATRA_LORDS: Record<string, string> = {
    'Ashwini': 'Ketu', 'Bharani': 'Venus', 'Krittika': 'Sun',
    'Rohini': 'Moon', 'Mrigashira': 'Mars', 'Ardra': 'Rahu',
    'Punarvasu': 'Jupiter', 'Pushya': 'Saturn', 'Ashlesha': 'Mercury',
    'Magha': 'Ketu', 'Purva Phalguni': 'Venus', 'Uttara Phalguni': 'Sun',
    'Hasta': 'Moon', 'Chitra': 'Mars', 'Swati': 'Rahu',
    'Vishakha': 'Jupiter', 'Anuradha': 'Saturn', 'Jyeshtha': 'Mercury',
    'Moola': 'Ketu', 'Purva Ashadha': 'Venus', 'Uttara Ashadha': 'Sun',
    'Shravana': 'Moon', 'Dhanishta': 'Mars', 'Shatabhisha': 'Rahu',
    'Purva Bhadrapada': 'Jupiter', 'Uttara Bhadrapada': 'Saturn', 'Revati': 'Mercury',
  };

  // Nakshatra nature classifications
  const DEVAS_NAKSHATRAS = ['Ashwini', 'Mrigashira', 'Punarvasu', 'Pushya', 'Hasta', 'Swati', 'Anuradha', 'Shravana', 'Revati'];
  const MANUSHYA_NAKSHATRAS = ['Bharani', 'Rohini', 'Ardra', 'Purva Phalguni', 'Uttara Phalguni', 'Purva Ashadha', 'Uttara Ashadha', 'Purva Bhadrapada', 'Uttara Bhadrapada'];
  const RAJAS_NAKSHATRAS = ['Krittika', 'Chitra', 'Vishakha', 'Jyeshtha', 'Moola', 'Dhanishta', 'Shatabhisha', 'Ashlesha', 'Magha'];

  const lord = NAKSHATRA_LORDS[nakshatra];

  // Pushya is the most auspicious nakshatra
  if (nakshatra === 'Pushya') {
    score += 15;
    details.push('Pushya nakshatra — the most auspicious star, brings nourishment and growth');
  }
  // Deva nakshatras are generally more harmonious
  else if (DEVAS_NAKSHATRAS.includes(nakshatra)) {
    score += 8;
    details.push(`${nakshatra} is a Deva (divine) nakshatra — harmonious and growth-oriented`);
  }
  // Manushya nakshatras are balanced
  else if (MANUSHYA_NAKSHATRAS.includes(nakshatra)) {
    score += 3;
    details.push(`${nakshatra} is a Manushya (human) nakshatra — balanced and pragmatic`);
  }
  // Rajas nakshatras are intense and transformational
  else if (RAJAS_NAKSHATRAS.includes(nakshatra)) {
    score -= 2;
    details.push(`${nakshatra} is a Rakshasa (intense) nakshatra — powerful but demanding`);
  }

  // Check if the nakshatra lord is well-placed
  if (lord && positions[lord]) {
    const lordPos = positions[lord];
    if (isExalted(lord as keyof typeof EXALTATION & string, lordPos.sign)) {
      score += 10;
      details.push(`Nakshatra lord ${lord} is exalted — strengthens your emotional foundation`);
    } else if (isInOwnSign(lord as 'Sun' | 'Moon' | 'Mars' | 'Mercury' | 'Jupiter' | 'Venus' | 'Saturn', lordPos.sign)) {
      score += 7;
      details.push(`Nakshatra lord ${lord} is in own sign — stable emotional base`);
    } else if (isDebilitated(lord as 'Sun' | 'Moon' | 'Mars' | 'Mercury' | 'Jupiter' | 'Venus' | 'Saturn', lordPos.sign)) {
      score -= 10;
      details.push(`Nakshatra lord ${lord} is debilitated — emotional challenges are amplified`);
    }
  }

  // Moon's house placement matters
  if (moonPos?.house) {
    if (TRIKONA_HOUSES.includes(moonPos.house)) {
      score += 5;
      details.push('Moon in trikona house — emotionally fortunate');
    } else if (KENDRA_HOUSES.includes(moonPos.house)) {
      score += 3;
      details.push('Moon in kendra house — emotionally stable');
    } else if ([6, 8, 12].includes(moonPos.house)) {
      score -= 8;
      details.push(`Moon in ${moonPos.house}${getOrdinal(moonPos.house)} house — emotional turbulence`);
    }
  }

  score = Math.max(10, Math.min(100, score));

  let description: string;
  if (score >= 75) {
    description = `Your Moon nakshatra ${nakshatra} is well-supported. You have a strong emotional foundation and intuitive capacity. Trust your feelings — they're usually right.`;
  } else if (score >= 55) {
    description = `Your Moon nakshatra ${nakshatra} gives you a balanced emotional nature. Some things feel easy, others require more emotional maturity. You're learning to trust yourself.`;
  } else {
    description = `Your Moon nakshatra ${nakshatra} indicates emotional challenges. You may struggle with inner peace or emotional regulation. This is not permanent — meditation, self-awareness, and patience are your strongest tools.`;
  }

  return { score, label: 'Nakshatra Strength', description, details };
}

// ─── 7. Elemental Balance Score (NEW) ─────────────────────────────────────────

/**
 * Evaluates the balance of Fire, Earth, Air, and Water elements
 * in the chart based on planetary placements.
 * A balanced chart (all 4 elements represented) scores higher.
 */
function calculateElementalBalance(
  positions: Record<string, PlanetPosInput>
): BreakdownItem {
  const ELEMENT_MAP: Record<string, string> = {
    'Aries': 'Fire', 'Leo': 'Fire', 'Sagittarius': 'Fire',
    'Taurus': 'Earth', 'Virgo': 'Earth', 'Capricorn': 'Earth',
    'Gemini': 'Air', 'Libra': 'Air', 'Aquarius': 'Air',
    'Cancer': 'Water', 'Scorpio': 'Water', 'Pisces': 'Water',
  };

  const elementCounts: Record<string, number> = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
  const majorPlanets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

  for (const planet of majorPlanets) {
    const pos = positions[planet];
    if (!pos) continue;
    const element = ELEMENT_MAP[pos.sign];
    if (element) elementCounts[element]++;
  }

  const elements = Object.values(elementCounts);
  const totalPlanets = elements.reduce((sum, count) => sum + count, 0);
  if (totalPlanets === 0) return { score: 50, label: 'Elemental Balance', description: 'No planetary data available for element analysis.' };

  // Calculate how balanced the elements are
  // Perfect balance = 1.75 each (7 planets / 4 elements)
  // Score higher when all elements are represented
  const represented = elements.filter(count => count > 0).length;
  const maxCount = Math.max(...elements);
  const minCount = Math.min(...elements);
  const spread = maxCount - minCount;

  let score = 40; // Base
  // Reward representation
  score += represented * 10; // 40 points for all 4 elements represented
  // Penalize extreme concentration
  if (spread >= 4) score -= 15;
  else if (spread >= 3) score -= 8;
  // Slight bonus for moderate balance
  if (spread <= 2 && represented === 4) score += 10;

  score = Math.max(10, Math.min(100, score));

  const dominant = Object.entries(elementCounts).sort(([, a], [, b]) => b - a)[0];
  const missing = Object.entries(elementCounts).filter(([, count]) => count === 0).map(([el]) => el);

  let description: string;
  const details: string[] = [];
  Object.entries(elementCounts).forEach(([el, count]) => {
    details.push(`${el}: ${count} planet${count !== 1 ? 's' : ''}`);
  });

  if (represented === 4 && spread <= 2) {
    description = `Well-balanced chart with all 4 elements represented. ${dominant[0]} is slightly dominant (${dominant[1]} planets). You have versatility and adaptability.`;
  } else if (represented === 4) {
    description = `All 4 elements present but ${dominant[0]} dominates heavily (${dominant[1]} planets). You lean strongly in one direction — that's not wrong, just pronounced.`;
  } else if (missing.length > 0) {
    description = `Missing ${missing.join(' and ')} element${missing.length > 1 ? 's' : ''}. This creates an imbalance — you may struggle with qualities those elements represent. This is honest, not a judgment.`;
  } else {
    description = `Your elemental distribution is fairly typical. ${dominant[0]} element leads with ${dominant[1]} planets.`;
  }

  return { score, label: 'Elemental Balance', description, details };
}

// ─── Helper: Ordinal suffix ───────────────────────────────────────────────────

function getOrdinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

// ─── Generate Honest Assessment ───────────────────────────────────────────────

function generateHonestAssessment(
  overallScore: number,
  breakdown: KundaliScoreResponse['breakdown'],
  doshas: string[],
  yogas: string[]
): { assessment: string; topStrength: string; topChallenge: string; remedies: string[] } {
  let assessment = '';
  let topStrength = '';
  let topChallenge = '';
  const remedies: string[] = [];

  // Overall assessment
  if (overallScore >= 80) {
    assessment = 'Your chart is genuinely strong. You have real astrological advantages that others don\'t. Don\'t waste them — but also don\'t become complacent.';
  } else if (overallScore >= 65) {
    assessment = 'Your chart is above average with some real challenges. You have genuine strengths, but specific areas need deliberate work.';
  } else if (overallScore >= 50) {
    assessment = 'Your chart is average — neither particularly blessed nor particularly cursed. Most things in life will require effort, but that effort will pay off.';
  } else if (overallScore >= 35) {
    assessment = 'Your chart has significant challenges. This is the honest truth — you have a harder path than most. But harder paths build stronger people.';
  } else {
    assessment = 'Your chart is heavily afflicted. This is not sugarcoating — you have a much harder path than most. But this is not a life sentence. Awareness and consistent effort can transform even the most difficult charts.';
  }

  // Add specific observations
  const observations: string[] = [];
  if (doshas.length > 0) {
    observations.push(`The ${doshas[0]} affects specific life areas. It shows up as a pattern — not a curse. Awareness is your first tool.`);
  }
  if (breakdown.ascendantLord.score >= 75) {
    observations.push('Your strong ascendant lord gives you genuine resilience and self-direction.');
  }
  if (breakdown.yogaScore.score >= 70) {
    observations.push('Your yogas give you real advantages that others don\'t have — use them wisely.');
  }
  if (breakdown.planetStrength.score < 50) {
    observations.push('Weak planetary placements mean you\'ll need to work harder for things that come easily to others. This builds character, even if it doesn\'t feel fair.');
  }
  if (breakdown.nakshatraStrength.score < 50) {
    observations.push('Your Moon nakshatra indicates emotional challenges — meditation and self-awareness practices are not optional for you, they\'re essential.');
  }
  if (breakdown.elementalBalance.score < 50) {
    observations.push('Your chart has elemental imbalances — you may over-rely on certain qualities while missing others.');
  }

  if (observations.length > 0) {
    assessment += ' ' + observations.join(' ');
  }

  assessment += ' Remember: the chart shows tendencies, not certainties. Free will exists.';

  // Top strength
  const scores = [
    { key: 'planetStrength', val: breakdown.planetStrength.score, desc: breakdown.planetStrength.description },
    { key: 'yogaScore', val: breakdown.yogaScore.score, desc: breakdown.yogaScore.description },
    { key: 'housePlacement', val: breakdown.housePlacement.score, desc: breakdown.housePlacement.description },
    { key: 'ascendantLord', val: breakdown.ascendantLord.score, desc: breakdown.ascendantLord.description },
    { key: 'nakshatraStrength', val: breakdown.nakshatraStrength.score, desc: breakdown.nakshatraStrength.description },
    { key: 'elementalBalance', val: breakdown.elementalBalance.score, desc: breakdown.elementalBalance.description },
  ];
  scores.sort((a, b) => b.val - a.val);
  topStrength = scores[0].desc;

  // Top challenge
  const challenges = scores.filter(s => s.val < 65);
  if (breakdown.doshaPenalty.score < 65) {
    topChallenge = breakdown.doshaPenalty.description;
  } else if (challenges.length > 0) {
    challenges.sort((a, b) => a.val - b.val);
    const lowest = challenges[0];
    // Yoga score is semantically inverted: low score means few/weak yogas,
    // so rephrase as a challenge rather than using the blessing-oriented description
    if (lowest.key === 'yogaScore') {
      topChallenge = yogas.length > 0
        ? `Only ${yogas.length} minor yoga${yogas.length > 1 ? 's' : ''} detected (${yogas.join(', ')}). No powerful combinations like Raj Yoga or Panch Mahapurusha Yoga are present — your chart lacks the major boosters that make certain things come effortlessly.`
        : 'No significant yogas detected. Your chart lacks the powerful planetary combinations that create effortless advantages. This means you\'ll need to build success through sustained effort rather than natural gifts.';
    } else {
      topChallenge = lowest.desc;
    }
  } else {
    topChallenge = 'No single dominant challenge — your chart is relatively balanced. This is actually good, even if it means no one area shines dramatically.';
  }

  // Personalized remedies based on chart analysis
  if (doshas.includes('Mangal Dosha')) {
    remedies.push('Chant "Om Mangalaya Namaha" on Tuesdays — this isn\'t superstition, it\'s a focus practice for Mars energy');
    remedies.push('Practice patience in relationships — count to 10 before reacting, especially when provoked');
    remedies.push('Channel Mars energy through physical exercise or competitive activities');
    remedies.push('Consider red coral only after consulting a qualified astrologer — don\'t self-prescribe');
  }
  if (doshas.includes('Kaal Sarp Dosha')) {
    remedies.push('Chant "Om Rahuve Namaha" and "Om Ketuve Namaha" on Saturdays');
    remedies.push('Focus on one thing at a time — scattered energy is your enemy');
    remedies.push('Practice gratitude journaling daily — trains the mind toward abundance thinking');
    remedies.push('Visit a Rahu-Ketu temple on Amavasya (new moon) if possible');
  }
  if (doshas.includes('Pitra Dosha')) {
    remedies.push('Perform Shradh ceremonies for ancestors with genuine respect');
    remedies.push('Respect and care for elders — this dosha heals through service to lineage');
    remedies.push('Donate to charity on Sundays — specifically to support elderly or ancestral causes');
    remedies.push('Practice forgiveness — holding grudges amplifies this dosha');
  }
  if (doshas.includes('Shani Sade Sati')) {
    remedies.push('Chant "Om Sham Shanicharaya Namah" on Saturdays — builds patience and endurance');
    remedies.push('Light a mustard oil lamp under a Peepal tree on Saturdays');
    remedies.push('Donate black sesame seeds, iron, and oil on Saturdays');
    remedies.push('Recite Hanuman Chalisa daily for protection and courage during this period');
  }
  if (doshas.includes('Grahan Dosha')) {
    remedies.push('Chant Gayatri Mantra 108 times daily — strengthens the Sun-Moon axis');
    remedies.push('Donate wheat, jaggery, and copper on Sundays');
    remedies.push('Perform Grahan Shanti Puja during eclipse periods if possible');
  }
  if (doshas.includes('Shrapit Dosha')) {
    remedies.push('Chant "Om Sham Shanicharaya Namah" and "Om Raahave Namaha" on Saturdays');
    remedies.push('Light a mustard oil lamp for Saturn and burn camphor for Rahu on Saturdays');
    remedies.push('Practice selfless service (seva) — this dosha responds to genuine giving');
  }

  // General remedies based on weak areas
  if (breakdown.planetStrength.score < 50) {
    remedies.push('Strengthen weak planets through their associated activities (e.g., Jupiter: teaching/learning, Venus: arts/beauty, Mars: exercise/discipline)');
    remedies.push('Wear gemstones only after consulting a qualified Vedic astrologer — wrong gems can harm');
  }
  if (breakdown.nakshatraStrength.score < 50) {
    remedies.push('Daily meditation (even 5 minutes) — your Moon needs it more than most');
    remedies.push('Practice journaling your emotions — builds emotional awareness and regulation');
  }

  // General remedies if no specific ones
  if (remedies.length === 0) {
    remedies.push('Meditate for 10 minutes daily — strengthens the mind regardless of chart');
    remedies.push('Express gratitude every morning — it genuinely rewires your brain toward positivity');
    remedies.push('Serve others selflessly at least once a week — builds good karma and humility');
    remedies.push('Consult a qualified Vedic astrologer before wearing any gemstone');
  }

  // Limit remedies to top 6
  return { assessment, topStrength, topChallenge, remedies: remedies.slice(0, 6) };
}

// ─── POST Handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = kundaliScoreSchema.safeParse(body);

    if (!parsed.success) {
      console.error('[Kundali Score API] Validation failed:', parsed.error.flatten().fieldErrors);
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { userId, sunSign, moonSign, ascendant, planetaryPositions, yogas, doshas, nakshatra } = parsed.data;

    // Safely cast planetary positions from unknown to PlanetPosInput
    let positions: Record<string, PlanetPosInput> = {};
    if (planetaryPositions) {
      for (const [key, val] of Object.entries(planetaryPositions)) {
        if (val && typeof val === 'object') {
          const v = val as Record<string, unknown>;
          positions[key] = {
            sign: (v.sign as string) || '',
            degree: (v.degree as number) || 0,
            house: (v.house as number) || 1,
            retrograde: (v.retrograde as boolean) || false,
            isCombust: (v.isCombust as boolean) || false,
            nakshatra: (v.nakshatra as string) || undefined,
            nakshatraPada: (v.nakshatraPada as number) || undefined,
          };
        }
      }
    }
    let yogaList = yogas || [] as string[];
    let doshaList = doshas || [] as string[];
    let ascSign = ascendant || '';
    let moonNakshatra = nakshatra || '';

    // If userId provided, try to fetch from database
    if (userId) {
      try {
        const astrologyData = await db.astrologyData.findUnique({
          where: { userId },
        });
        if (astrologyData) {
          // Parse stored JSON data
          const storedPositions = JSON.parse(astrologyData.planetaryPositions);
          const storedYogas = JSON.parse(astrologyData.yogas);
          const storedDoshas = JSON.parse(astrologyData.doshas);
          const storedNakshatra = JSON.parse(astrologyData.nakshatra);

          // Use stored data as fallback if not provided
          if (Object.keys(positions).length === 0) positions = storedPositions as Record<string, PlanetPosInput>;
          if (yogaList.length === 0) yogaList = storedYogas.filter((y: { present: boolean; name: string }) => y.present).map((y: { name: string }) => y.name);
          if (doshaList.length === 0) doshaList = storedDoshas.filter((d: { present: boolean; name: string }) => d.present).map((d: { name: string }) => d.name);
          if (!ascSign) ascSign = astrologyData.ascendant;
          if (!moonNakshatra && storedNakshatra?.name) moonNakshatra = storedNakshatra.name;
        }
      } catch {
        // Database fetch failed — use provided data
      }
    }

    // If no data available at all, return error
    if (Object.keys(positions).length === 0 && !ascSign) {
      return NextResponse.json(
        { success: false, error: 'No astrology data available. Please provide planetaryPositions, yogas, doshas, and ascendant, or a valid userId.' },
        { status: 400 }
      );
    }

    // Ensure we have at least ascendant
    if (!ascSign) ascSign = 'Aries'; // Fallback

    // Calculate breakdown scores
    const planetStrength = calculatePlanetStrength(positions);
    const yogaScore = calculateYogaScore(yogaList);
    const doshaPenalty = calculateDoshaPenalty(doshaList);
    const housePlacement = calculateHousePlacement(positions, ascSign);
    const ascendantLord = calculateAscendantLordStrength(positions, ascSign);
    const nakshatraStrength = calculateNakshatraStrength(positions, moonNakshatra);
    const elementalBalance = calculateElementalBalance(positions);

    const breakdown = {
      planetStrength,
      yogaScore,
      doshaPenalty,
      housePlacement,
      ascendantLord,
      nakshatraStrength,
      elementalBalance,
    };

    // Calculate weighted overall score
    // Weights must sum to 1.0
    // Planet Strength: 25% — core foundation
    // Yoga Score: 15% — special combinations
    // Dosha Penalty: 15% — challenges
    // House Placement: 15% — layout quality
    // Ascendant Lord: 15% — self-direction capacity
    // Nakshatra Strength: 10% — emotional foundation
    // Elemental Balance: 5% — overall balance
    const overallScore = Math.round(
      planetStrength.score * 0.25 +
      yogaScore.score * 0.15 +
      doshaPenalty.score * 0.15 +
      housePlacement.score * 0.15 +
      ascendantLord.score * 0.15 +
      nakshatraStrength.score * 0.10 +
      elementalBalance.score * 0.05
    );

    // Clamp to 0-100
    const clampedScore = Math.max(0, Math.min(100, overallScore));

    // Get grade
    const { grade, description: gradeDescription } = getGrade(clampedScore);

    // Generate honest assessment
    const { assessment, topStrength, topChallenge, remedies } = generateHonestAssessment(
      clampedScore,
      breakdown,
      doshaList,
      yogaList
    );

    const response: KundaliScoreResponse = {
      overallScore: clampedScore,
      grade,
      gradeDescription,
      breakdown,
      honestAssessment: assessment,
      topStrength,
      topChallenge,
      remedies,
    };

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('[Kundali Score API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to calculate Kundali score' },
      { status: 500 }
    );
  }
}
