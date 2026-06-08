export const maxDuration = 300;
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireApiUser } from '@/lib/api-auth';
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
  navamshaSign?: string; // D9 sign for vargottama check
}

interface BreakdownItem {
  score: number;
  label: string;
  description: string;
  details?: string[];
  subScores?: Record<string, number>; // Sub-dimension scores for transparency
}

interface KundaliScoreResponse {
  overallScore: number;
  grade: string;
  gradeDescription: string;
  breakdown: {
    planetStrength: BreakdownItem;
    yogaScore: BreakdownItem;
    doshaPenalty: BreakdownItem;
    housePlacement: BreakdownItem; // Kept for API compatibility — now Bhava Strength
    ascendantLord: BreakdownItem;
    nakshatraStrength: BreakdownItem;
    elementalBalance: BreakdownItem;
  };
  honestAssessment: string;
  topStrength: string;
  topChallenge: string;
  remedies: string[];
  shadbalaDetails?: {
    sthanaBala: number;
    digBala: number;
    chestaBala: number;
    navamshaBonus: number;
    navamshaDetails?: string[];
  };
  vedicRemedies?: {
    gemstones: string[];
    mantras: string[];
    dayPractices: string[];
    fasting: string[];
    disclaimer: string;
  };
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

// ─── Helper: Vedic Grade (replaces letter grades with Vedic-appropriate terms) ─

function getGrade(score: number): { grade: string; description: string } {
  if (score >= 85) return { grade: 'Exceptional', description: 'An exceptionally powerful chart — rare genuine strengths across multiple dimensions. Such charts belong to those with remarkable destinies, though even they must act on their advantages.' };
  if (score >= 75) return { grade: 'Strong', description: 'A strong chart with real advantages — certain areas of life come naturally to you. Some challenges exist but your overall cosmic foundation is solid.' };
  if (score >= 65) return { grade: 'Good', description: 'A good chart with mostly solid placements — specific weak spots exist, but you have genuine strengths to leverage. Conscious effort fills the gaps.' };
  if (score >= 55) return { grade: 'Average', description: 'A balanced chart with roughly equal strengths and weaknesses — neither particularly blessed nor particularly challenged. Most things require effort, but that effort reliably pays off.' };
  if (score >= 45) return { grade: 'Below Average', description: 'More challenges than average exist in this chart. You will work harder for outcomes others achieve effortlessly — but this builds depth, resilience, and wisdom.' };
  if (score >= 35) return { grade: 'Challenged', description: 'Significant difficulties indicated — this is the honest truth. Multiple areas demand sustained effort. But Vedic wisdom teaches that awareness and right action (karma) can transform any chart.' };
  return { grade: 'Heavily Challenged', description: 'A deeply challenging chart — this is not sugarcoating. The path is hard, but not hopeless. Vedic tradition holds that conscious effort, remedies, and dharma can reshape even the most difficult planetary patterns.' };
}

// ─── Helper: Ordinal suffix ───────────────────────────────────────────────────

function getOrdinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

// ─── Dig Bala (Directional Strength) ──────────────────────────────────────────

/**
 * In Vedic astrology, each planet has a direction of maximum strength:
 * - Jupiter & Mercury: strongest in 1st house (East/Purva)
 * - Sun & Mars: strongest in 10th house (Zenith/Madhya)
 * - Venus & Moon: strongest in 4th house (Nadir/Patala)
 * - Saturn: strongest in 7th house (West/Paschima)
 *
 * Returns: +2 for exact Dig Bala house, +1 for adjacent houses, 0 otherwise
 */
function getDigBala(planet: string, house: number): { bonus: number; description: string } {
  const DIG_BALA_HOUSES: Record<string, number> = {
    'Jupiter': 1,
    'Mercury': 1,
    'Sun': 10,
    'Mars': 10,
    'Venus': 4,
    'Moon': 4,
    'Saturn': 7,
  };

  const targetHouse = DIG_BALA_HOUSES[planet];
  if (targetHouse === undefined) return { bonus: 0, description: '' };

  if (house === targetHouse) {
    const DIRECTIONS: Record<number, string> = { 1: 'East', 4: 'Nadir', 7: 'West', 10: 'Zenith' };
    return {
      bonus: 2,
      description: `${planet} has full Dig Bala in ${house}${getOrdinal(house)} house (${DIRECTIONS[targetHouse]} direction) — directional strength maximized`,
    };
  }

  // Adjacent houses (one before and one after, wrapping around)
  const adjacent1 = targetHouse === 1 ? 12 : targetHouse - 1;
  const adjacent2 = targetHouse === 12 ? 1 : targetHouse + 1;
  if (house === adjacent1 || house === adjacent2) {
    return {
      bonus: 1,
      description: `${planet} has partial Dig Bala (adjacent to ${targetHouse}${getOrdinal(targetHouse)} house) — moderate directional strength`,
    };
  }

  return { bonus: 0, description: '' };
}

// ─── Degree-Based Strength (Proximity to Exaltation Degree) ───────────────────

/**
 * Planets near their exact exaltation degree are stronger.
 * Returns a bonus of 0 to +1.0 based on proximity.
 * Within 3° of exaltation degree: full +1.0
 * Within 10°: +0.7
 * Within 20°: +0.3
 * Beyond 20°: 0
 */
function getDegreeBasedStrength(planet: string, degree: number): { bonus: number; description: string } {
  const exaltData = EXALTATION[planet];
  if (!exaltData) return { bonus: 0, description: '' };

  const diff = Math.abs(degree - exaltData.degree);
  // The closer the planet is to the exact exaltation degree, the stronger
  if (diff <= 3) {
    return { bonus: 1.0, description: `${planet} near exact exaltation degree (${degree.toFixed(1)}° vs ${exaltData.degree}°) — peak strength` };
  } else if (diff <= 10) {
    return { bonus: 0.7, description: `${planet} reasonably close to exaltation degree — strong positional strength` };
  } else if (diff <= 20) {
    return { bonus: 0.3, description: `${planet} moderately placed from exaltation degree — moderate positional strength` };
  }
  return { bonus: 0, description: '' };
}

// ─── 1. Planet Strength Calculation (Shadbala-inspired) ───────────────────────

/**
 * Evaluates the dignity and strength of each major planet using
 * simplified Shadbala (six-fold strength) components:
 *
 * Sthana Bala (Positional Strength):
 * - Exalted: 10 points
 * - Own sign: 9 points
 * - Moolatrikona: 8.5 points
 * - Great Friend's sign: 7.5
 * - Friend's sign: 7
 * - Neutral sign: 5
 * - Enemy's sign: 3.5
 * - Great Enemy's sign: 2.5
 * - Debilitated: 1.5
 * - Kendra (Angular) bonus: +1.5
 * - Trikona (Trine) bonus: +1.0
 * - Degree-based strength: up to +1.0
 *
 * Dig Bala (Directional Strength):
 * - Full Dig Bala house: +2
 * - Adjacent to Dig Bala house: +1
 *
 * Chesta Bala (Motional Strength):
 * - Retrograde: +1.5 (Vedic considers retrograde planets stronger)
 * - Combust: -2.5 (severely weakened by proximity to Sun)
 */
function calculatePlanetStrength(
  positions: Record<string, PlanetPosInput>
): BreakdownItem & { shadbalaComponents: { sthanaBala: number; digBala: number; chestaBala: number } } {
  const majorPlanets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
  let totalPoints = 0;
  let maxPoints = 0;
  const details: string[] = [];
  const planetScores: { planet: string; score: number; dignity: string }[] = [];

  // Track Shadbala components for reporting
  let totalSthanaBala = 0;
  let totalDigBala = 0;
  let totalChestaBala = 0;

  for (const planet of majorPlanets) {
    const pos = positions[planet];
    if (!pos) continue;
    maxPoints += 13.5; // Max possible per planet: 10 (exalted) + 1.5 (kendra) + 1.0 (trikona overlap) + 1.0 (degree) + 2 (dig bala) — capped reasonably

    let points = 5; // Neutral baseline
    let dignity = 'neutral';

    // ── Sthana Bala (Positional Strength) ──
    if (isExalted(planet as any, pos.sign as any)) {
      points = 10;
      dignity = 'exalted';
      details.push(`${planet} is exalted in ${pos.sign} — Uccha, very strong (Sthana Bala)`);
    } else if (isInOwnSign(planet as any, pos.sign as any)) {
      points = 9;
      dignity = 'own sign';
      details.push(`${planet} is in Swakshetra ${pos.sign} — strong (Sthana Bala)`);
    } else if (isInMoolatrikona(planet as any, pos.sign as any)) {
      points = 8.5;
      dignity = 'moolatrikona';
      details.push(`${planet} is in Moolatrikona (${pos.sign}) — good strength (Sthana Bala)`);
    } else if (isDebilitated(planet as any, pos.sign as any)) {
      points = 1.5;
      dignity = 'debilitated';
      details.push(`${planet} is Neecha (debilitated) in ${pos.sign} — weak (Sthana Bala)`);
    } else {
      // Check dignity based on relationship with sign lord
      try {
        const signLord = getSignLord(pos.sign as any);
        const relationship = getPermanentRelationship(
          planet as any,
          signLord as any
        );

        switch (relationship) {
          case 'Great Friend':
            points = 7.5;
            dignity = 'Adhimitra\'s sign';
            details.push(`${planet} in ${pos.sign} (lord ${signLord} is Adhimitra/great friend) — strong support`);
            break;
          case 'Friend':
            points = 7;
            dignity = 'Mitra\'s sign';
            details.push(`${planet} in ${pos.sign} (lord ${signLord} is Mitra/friend) — comfortable`);
            break;
          case 'Neutral':
            points = 5;
            dignity = 'Sama (neutral)';
            break;
          case 'Enemy':
            points = 3.5;
            dignity = 'Shatru\'s sign';
            details.push(`${planet} in ${pos.sign} (lord ${signLord} is Shatru/enemy) — uncomfortable`);
            break;
          case 'Great Enemy':
            points = 2.5;
            dignity = 'Adhishatru\'s sign';
            details.push(`${planet} in ${pos.sign} (lord ${signLord} is Adhishatru/great enemy) — very uncomfortable`);
            break;
        }
      } catch {
        points = 5;
        dignity = 'neutral';
      }
    }

    // ── Kendra (Angular) Bonus — Sthana Bala component ──
    if (KENDRA_HOUSES.includes(pos.house)) {
      points += 1.5;
      if (dignity === 'neutral') dignity = 'neutral (kendra)';
      details.push(`${planet} in ${pos.house}${getOrdinal(pos.house)} house (Kendra) — angular strength bonus +1.5`);
    }

    // ── Trikona (Trine) Bonus — Sthana Bala component ──
    // Note: 1st house is both Kendra AND Trikona — both bonuses apply
    if (TRIKONA_HOUSES.includes(pos.house)) {
      points += 1.0;
      if (dignity === 'neutral' && !KENDRA_HOUSES.includes(pos.house)) dignity = 'neutral (trikona)';
      details.push(`${planet} in ${pos.house}${getOrdinal(pos.house)} house (Trikona) — trine strength bonus +1.0`);
    }

    // ── Degree-Based Strength — Sthana Bala component ──
    // Only apply for planets in their exaltation sign
    if (isExalted(planet as any, pos.sign as any)) {
      const degreeStrength = getDegreeBasedStrength(planet, pos.degree);
      if (degreeStrength.bonus > 0) {
        points += degreeStrength.bonus;
        details.push(degreeStrength.description);
      }
    }

    totalSthanaBala += points;

    // ── Dig Bala (Directional Strength) ──
    const digBala = getDigBala(planet, pos.house);
    if (digBala.bonus > 0) {
      points += digBala.bonus;
      totalDigBala += digBala.bonus;
      details.push(digBala.description);
    }

    // ── Chesta Bala (Motional Strength) ──
    // Combustion penalty (severe weakness) — part of Chesta Bala
    if (pos.isCombust) {
      points = Math.max(0.5, points - 2.5);
      dignity += ' (combust/Asta)';
      totalChestaBala -= 2.5;
      details.push(`${planet} is combust (Asta) — severely weakened by proximity to Surya, Chesta Bala penalty -2.5`);
    }

    // Retrograde bonus — Vedic considers retrograde (Vakri) planets as having
    // enhanced "Cheshta Bala" (motional/effort strength) because they appear
    // brighter and closer to Earth
    if (pos.retrograde && planet !== 'Sun' && planet !== 'Moon') {
      points = Math.min(13.5, points + 1.5);
      totalChestaBala += 1.5;
      details.push(`${planet} is Vakri (retrograde) — enhanced Cheshta Bala +1.5`);
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
    description = `Strong Sthana Bala overall. ${strongest.planet} is your strongest Graha (${strongest.dignity}). Shadbala foundation is solid.`;
  } else if (score >= 55) {
    description = `Mixed Graha strength. ${strongest.planet} supports you (${strongest.dignity}), but ${weakest.planet} needs strengthening (${weakest.dignity}). Some Shadbala dimensions are weaker.`;
  } else {
    description = `Several Grahas are uncomfortable. ${weakest.planet} is weakest (${weakest.dignity}). You'll need to strengthen weak planets through their associated remedies and activities.`;
  }

  return {
    score,
    label: 'Graha Strength (Shadbala)',
    description,
    details: details.slice(0, 6),
    subScores: {
      sthanaBala: Math.round(totalSthanaBala),
      digBala: Math.round(totalDigBala),
      chestaBala: Math.round(totalChestaBala),
    },
    shadbalaComponents: {
      sthanaBala: Math.round(totalSthanaBala),
      digBala: Math.round(totalDigBala),
      chestaBala: Math.round(totalChestaBala),
    },
  };
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
        details.push(`${yoga} — Maha Yoga, powerful combination, genuine advantage`);
      } else if (GOOD_YOGAS.includes(yoga)) {
        yogaPoints += 12;
        details.push(`${yoga} — Shubha Yoga, helpful combination`);
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
    description = 'No significant yogas detected. This is common — most charts have 1-2 yogas at most. It means your strengths come from individual Graha placements, not special combinations.';
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
    description = 'No significant doshas detected. Your chart is relatively clean of major afflictions (Papa Graha influences) — this is genuinely good.';
  } else if (doshas.length === 1) {
    description = `${doshas[0]} detected. This creates real challenges in specific life areas. Not a curse (shaapa), but a karmic pattern that demands awareness.`;
  } else if (doshas.length === 2) {
    description = `${doshas[0]} and ${doshas[1]} detected. Multiple doshas mean multiple challenge areas. Awareness is your first tool, upaya (remedies) are your second.`;
  } else {
    description = `${doshas.length} doshas detected (${doshas.join(', ')}). This is a heavily challenged chart. Hard truths — but not hopeless. Vedic upaya and awareness matter enormously.`;
  }

  return { score, label: 'Doshas & Challenges', description, details };
}

// ─── 4. Bhava (House) Lord Analysis (replaces simple House Placement) ──────────

/**
 * Vedic Bhava Lord Analysis: For each important house (1, 4, 7, 10, 9, 5),
 * check where the house lord is placed, whether it's in a friendly/neutral/enemy
 * sign, and whether it's in a good house (Kendra/Trikona) or bad house (Dusthana).
 *
 * This replaces the simple "House Placement" metric with a more Vedic-accurate
 * Bhava Strength assessment.
 *
 * Key houses analyzed:
 * - 1st (Lagna/Tanu): Self, body, personality
 * - 5th (Putra/Suta): Intelligence, creativity, children
 * - 9th (Dharma/Bhagya): Fortune, dharma, higher learning
 * - 4th (Sukha/Matru): Home, mother, inner peace
 * - 7th (Kalatra/Marriage): Partnerships, marriage
 * - 10th (Karma/Rajya): Career, public image, duty
 */
function calculateBhavaStrength(
  positions: Record<string, PlanetPosInput>,
  ascendantSign: string
): BreakdownItem {
  const VALID_SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  const ascIndex = VALID_SIGNS.indexOf(ascendantSign);
  if (ascIndex === -1) return { score: 50, label: 'Bhava Strength', description: 'Unable to calculate Bhava lord placements accurately.' };

  const IMPORTANT_HOUSES = [
    { num: 1, name: 'Lagna (Self)', weight: 2.0 },
    { num: 5, name: 'Putra (Intelligence)', weight: 1.2 },
    { num: 9, name: 'Dharma (Fortune)', weight: 1.5 },
    { num: 4, name: 'Sukha (Home)', weight: 1.2 },
    { num: 7, name: 'Kalatra (Partnership)', weight: 1.3 },
    { num: 10, name: 'Karma (Career)', weight: 1.3 },
  ];

  const dusthana = [6, 8, 12];
  let totalWeight = 0;
  let totalScore = 0;
  const details: string[] = [];

  for (const house of IMPORTANT_HOUSES) {
    // Find the sign occupying this house from ascendant
    const houseSignIndex = (ascIndex + house.num - 1) % 12;
    const houseSign = VALID_SIGNS[houseSignIndex] as 'Aries' | 'Taurus' | 'Gemini' | 'Cancer' | 'Leo' | 'Virgo' | 'Libra' | 'Scorpio' | 'Sagittarius' | 'Capricorn' | 'Aquarius' | 'Pisces';

    // Get the lord of this house
    const houseLord = getSignLord(houseSign);
    const lordPos = positions[houseLord];

    let houseScore = 50; // Neutral baseline
    const weight = house.weight;
    totalWeight += weight;

    if (!lordPos) {
      details.push(`${house.num}${getOrdinal(house.num)} house (${house.name}) lord ${houseLord}: position unknown — neutral assumption`);
      totalScore += houseScore * weight;
      continue;
    }

    // ── Dignity of the house lord ──
    if (isExalted(houseLord as any, lordPos.sign as any)) {
      houseScore = 92;
      details.push(`${house.num}${getOrdinal(house.num)} house (${house.name}) lord ${houseLord} is Uccha (exalted) — very strong Bhava`);
    } else if (isInOwnSign(houseLord as any, lordPos.sign as any)) {
      houseScore = 85;
      details.push(`${house.num}${getOrdinal(house.num)} house (${house.name}) lord ${houseLord} in Swakshetra (own sign) — strong Bhava`);
    } else if (isInMoolatrikona(houseLord as any, lordPos.sign as any)) {
      houseScore = 80;
      details.push(`${house.num}${getOrdinal(house.num)} house (${house.name}) lord ${houseLord} in Moolatrikona — good Bhava strength`);
    } else if (isDebilitated(houseLord as any, lordPos.sign as any)) {
      houseScore = 20;
      details.push(`${house.num}${getOrdinal(house.num)} house (${house.name}) lord ${houseLord} is Neecha (debilitated) — weak Bhava`);
    } else {
      // Check relationship
      try {
        const signLord = getSignLord(lordPos.sign as any);
        const relationship = getPermanentRelationship(
          houseLord as any,
          signLord as any
        );

        switch (relationship) {
          case 'Great Friend':
            houseScore = 72;
            break;
          case 'Friend':
            houseScore = 65;
            break;
          case 'Neutral':
            houseScore = 50;
            break;
          case 'Enemy':
            houseScore = 35;
            break;
          case 'Great Enemy':
            houseScore = 25;
            break;
        }
      } catch {
        houseScore = 50;
      }
    }

    // ── House placement modifier for the lord ──
    if (KENDRA_HOUSES.includes(lordPos.house)) {
      houseScore = Math.min(houseScore + 8, 95);
      if (houseScore < 75) details.push(`${house.name} lord ${houseLord} in Kendra — stabilizes this Bhava`);
    } else if (TRIKONA_HOUSES.includes(lordPos.house)) {
      houseScore = Math.min(houseScore + 5, 95);
      if (houseScore < 75) details.push(`${house.name} lord ${houseLord} in Trikona — auspicious placement`);
    } else if (dusthana.includes(lordPos.house)) {
      houseScore = Math.max(houseScore - 12, 10);
      details.push(`${house.name} lord ${houseLord} in Dusthana house ${lordPos.house} — weakens this Bhava`);
    }

    // ── Retrograde bonus ──
    if (lordPos.retrograde) {
      houseScore = Math.min(100, houseScore + 3);
    }

    // ── Combust penalty ──
    if (lordPos.isCombust) {
      houseScore = Math.max(10, houseScore - 10);
      details.push(`${house.name} lord ${houseLord} is combust — significantly weakened`);
    }

    totalScore += houseScore * weight;
  }

  const score = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 50;
  const clampedScore = Math.max(10, Math.min(100, score));

  let description: string;
  if (clampedScore >= 75) {
    description = `Strong Bhava lords — key life areas (self, dharma, karma, relationships) have solid planetary support. Your Kendra and Trikona lords are well-placed.`;
  } else if (clampedScore >= 55) {
    description = `Mixed Bhava strength — some houses have well-placed lords while others face challenges. Focus on strengthening weak Bhava lords through targeted upaya.`;
  } else {
    description = `Multiple weak Bhava lords — key life areas face challenges. Dusthana placements of lords indicate areas needing conscious effort and remedies.`;
  }

  return { score: clampedScore, label: 'Bhava Strength', description, details: details.slice(0, 5) };
}

// ─── 5. Ascendant Lord Strength (revised with Shadbala terminology) ───────────

function calculateAscendantLordStrength(
  positions: Record<string, PlanetPosInput>,
  ascendantSign: string
): BreakdownItem {
  const VALID_SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  const ascIndex = VALID_SIGNS.indexOf(ascendantSign);
  if (ascIndex === -1) return { score: 50, label: 'Lagna Lord', description: 'Lagna sign could not be determined.' };

  const lord = getSignLord(ascendantSign as 'Aries' | 'Taurus' | 'Gemini' | 'Cancer' | 'Leo' | 'Virgo' | 'Libra' | 'Scorpio' | 'Sagittarius' | 'Capricorn' | 'Aquarius' | 'Pisces');
  const lordPos = positions[lord];

  if (!lordPos) return { score: 50, label: 'Lagna Lord', description: 'Lagna lord position not available.' };

  let score = 50;
  const details: string[] = [];

  // Exalted
  if (isExalted(lord as any, lordPos.sign as any)) {
    score = 95;
    details.push('Uccha (exalted) — extremely powerful Lagna lord');
  }
  // Own sign
  else if (isInOwnSign(lord as any, lordPos.sign as any)) {
    score = 88;
    details.push('Swakshetra (own sign) — very strong Lagna lord');
  }
  // Moolatrikona
  else if (isInMoolatrikona(lord as any, lordPos.sign as any)) {
    score = 85;
    details.push('Moolatrikona — strong Lagna lord');
  }
  // Debilitated
  else if (isDebilitated(lord as any, lordPos.sign as any)) {
    score = 20;
    details.push('Neecha (debilitated) — this is a genuine challenge for the Lagna lord');
  } else {
    // Check relationship with sign lord
    try {
      const signLord = getSignLord(lordPos.sign as any);
      const relationship = getPermanentRelationship(
        lord as any,
        signLord as any
      );

      switch (relationship) {
        case 'Great Friend':
          score = 78;
          details.push(`in Adhimitra's sign (${lordPos.sign}) — well-supported`);
          break;
        case 'Friend':
          score = 72;
          details.push(`in Mitra's sign (${lordPos.sign}) — comfortable`);
          break;
        case 'Neutral':
          score = 55;
          details.push('in Sama (neutral) position');
          break;
        case 'Enemy':
          score = 38;
          details.push(`in Shatru's sign (${lordPos.sign}) — uncomfortable`);
          break;
        case 'Great Enemy':
          score = 28;
          details.push(`in Adhishatru's sign (${lordPos.sign}) — very challenging`);
          break;
      }
    } catch {
      // In kendra
      if (KENDRA_HOUSES.includes(lordPos.house)) {
        score = 72;
        details.push('in a Kendra house — well-positioned');
      }
      // In trikona
      else if (TRIKONA_HOUSES.includes(lordPos.house)) {
        score = 75;
        details.push('in a Trikona house — auspicious');
      }
      // In dusthana
      else if ([6, 8, 12].includes(lordPos.house)) {
        score = 30;
        details.push(`in the ${lordPos.house}${getOrdinal(lordPos.house)} house (Dusthana) — weak placement`);
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
    details.push('Kendra placement provides stability');
  }
  if (TRIKONA_HOUSES.includes(lordPos.house) && score < 75) {
    score = Math.min(score + 5, 75);
    details.push('Trikona placement adds Dharma strength');
  }
  if ([6, 8, 12].includes(lordPos.house) && !details.some(d => d.includes('Dusthana'))) {
    score = Math.max(score - 10, 15);
    details.push(`in Dusthana house ${lordPos.house} — weakens the Lagna lord`);
  }

  // Dig Bala check for Lagna lord
  const digBala = getDigBala(lord, lordPos.house);
  if (digBala.bonus > 0) {
    score = Math.min(100, score + digBala.bonus * 3); // Amplify for Lagna lord importance
    details.push(digBala.description);
  }

  // Retrograde bonus for Lagna lord (Cheshta Bala)
  if (lordPos.retrograde) {
    score = Math.min(100, score + 5);
    details.push('Vakri (retrograde) — enhances inner strength and self-reflection (Cheshta Bala)');
  }

  // Combust penalty
  if (lordPos.isCombust) {
    score = Math.max(10, score - 15);
    details.push('Asta (combust) — significantly weakened by Surya');
  }

  let description: string;
  if (score >= 80) {
    description = `Your Lagna lord ${lord} is ${details.join(', ')}. This gives you natural leadership (Rajatva), self-direction, and inner confidence. This is a genuine strength — lean into it.`;
  } else if (score >= 60) {
    description = `Your Lagna lord ${lord} is ${details.join(', ')}. Decent Atma-balam (self-strength) with room for growth. You have enough inner drive, but doubt creeps in more than it should.`;
  } else if (score >= 40) {
    description = `Your Lagna lord ${lord} is ${details.join(', ')}. You may struggle with self-direction and confidence. Not permanent — awareness and deliberate self-trust practice (Atma-vishwas) help enormously.`;
  } else {
    description = `Your Lagna lord ${lord} is ${details.join(', ')}. This is a significant challenge. You'll need to work harder for self-assurance, but the growth potential is immense. Many Maha-purushas had difficult Lagna lords.`;
  }

  return { score, label: 'Lagna Lord', description };
}

// ─── 6. Nakshatra Strength ────────────────────────────────────────────────────

/**
 * Evaluates the Moon's nakshatra and its influence.
 * The Moon nakshatra (Janma Nakshatra) is crucial in Vedic astrology —
 * it defines your emotional programming, mental tendencies, and Dasha sequence.
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

  // Nakshatra nature classifications (Gana)
  const DEVAS_NAKSHATRAS = ['Ashwini', 'Mrigashira', 'Punarvasu', 'Pushya', 'Hasta', 'Swati', 'Anuradha', 'Shravana', 'Revati'];
  const MANUSHYA_NAKSHATRAS = ['Bharani', 'Rohini', 'Ardra', 'Purva Phalguni', 'Uttara Phalguni', 'Purva Ashadha', 'Uttara Ashadha', 'Purva Bhadrapada', 'Uttara Bhadrapada'];
  const RAKSHASA_NAKSHATRAS = ['Krittika', 'Chitra', 'Vishakha', 'Jyeshtha', 'Moola', 'Dhanishta', 'Shatabhisha', 'Ashlesha', 'Magha'];

  const lord = NAKSHATRA_LORDS[nakshatra];

  // Pushya is the most auspicious nakshatra
  if (nakshatra === 'Pushya') {
    score += 15;
    details.push('Pushya nakshatra — the most auspicious star (Maha-nakshatra), brings nourishment and growth');
  }
  // Deva nakshatras are generally more harmonious
  else if (DEVAS_NAKSHATRAS.includes(nakshatra)) {
    score += 8;
    details.push(`${nakshatra} is a Deva Gana (divine) nakshatra — harmonious and growth-oriented`);
  }
  // Manushya nakshatras are balanced
  else if (MANUSHYA_NAKSHATRAS.includes(nakshatra)) {
    score += 3;
    details.push(`${nakshatra} is a Manushya Gana (human) nakshatra — balanced and pragmatic`);
  }
  // Rakshasa nakshatras are intense and transformational
  else if (RAKSHASA_NAKSHATRAS.includes(nakshatra)) {
    score -= 2;
    details.push(`${nakshatra} is a Rakshasa Gana (intense) nakshatra — powerful but demanding`);
  }

  // Check if the nakshatra lord is well-placed
  if (lord && positions[lord]) {
    const lordPos = positions[lord];
    if (isExalted(lord as any, lordPos.sign as any)) {
      score += 10;
      details.push(`Nakshatra lord ${lord} is Uccha (exalted) — strengthens your emotional foundation`);
    } else if (isInOwnSign(lord as any, lordPos.sign as any)) {
      score += 7;
      details.push(`Nakshatra lord ${lord} is in Swakshetra — stable emotional base`);
    } else if (isDebilitated(lord as any, lordPos.sign as any)) {
      score -= 10;
      details.push(`Nakshatra lord ${lord} is Neecha (debilitated) — emotional challenges are amplified`);
    }
  }

  // Moon's house placement matters
  if (moonPos?.house) {
    if (TRIKONA_HOUSES.includes(moonPos.house)) {
      score += 5;
      details.push('Chandra in Trikona house — emotionally fortunate');
    } else if (KENDRA_HOUSES.includes(moonPos.house)) {
      score += 3;
      details.push('Chandra in Kendra house — emotionally stable');
    } else if ([6, 8, 12].includes(moonPos.house)) {
      score -= 8;
      details.push(`Chandra in ${moonPos.house}${getOrdinal(moonPos.house)} house (Dusthana) — emotional turbulence`);
    }
  }

  score = Math.max(10, Math.min(100, score));

  let description: string;
  if (score >= 75) {
    description = `Your Janma Nakshatra ${nakshatra} is well-supported. You have a strong Manas (emotional foundation) and intuitive capacity. Trust your feelings — they're usually right.`;
  } else if (score >= 55) {
    description = `Your Janma Nakshatra ${nakshatra} gives you a balanced Manas (emotional nature). Some things feel easy, others require more emotional maturity. You're learning to trust yourself.`;
  } else {
    description = `Your Janma Nakshatra ${nakshatra} indicates emotional challenges. You may struggle with inner peace or Manas shanti (emotional peace). This is not permanent — Dhyana (meditation), self-awareness, and patience are your strongest tools.`;
  }

  return { score, label: 'Nakshatra Strength', description, details };
}

// ─── 7. Elemental Balance Score ───────────────────────────────────────────────

/**
 * Evaluates the balance of Fire (Agni), Earth (Prithvi), Air (Vayu),
 * and Water (Jala) elements in the chart based on planetary placements.
 * A balanced chart (all 4 elements represented) scores higher.
 */
function calculateElementalBalance(
  positions: Record<string, PlanetPosInput>
): BreakdownItem {
  const ELEMENT_MAP: Record<string, string> = {
    'Aries': 'Agni (Fire)', 'Leo': 'Agni (Fire)', 'Sagittarius': 'Agni (Fire)',
    'Taurus': 'Prithvi (Earth)', 'Virgo': 'Prithvi (Earth)', 'Capricorn': 'Prithvi (Earth)',
    'Gemini': 'Vayu (Air)', 'Libra': 'Vayu (Air)', 'Aquarius': 'Vayu (Air)',
    'Cancer': 'Jala (Water)', 'Scorpio': 'Jala (Water)', 'Pisces': 'Jala (Water)',
  };

  const elementCounts: Record<string, number> = { 'Agni (Fire)': 0, 'Prithvi (Earth)': 0, 'Vayu (Air)': 0, 'Jala (Water)': 0 };
  const majorPlanets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

  for (const planet of majorPlanets) {
    const pos = positions[planet];
    if (!pos) continue;
    const element = ELEMENT_MAP[pos.sign];
    if (element) elementCounts[element]++;
  }

  const elements = Object.values(elementCounts);
  const totalPlanets = elements.reduce((sum, count) => sum + count, 0);
  if (totalPlanets === 0) return { score: 50, label: 'Elemental Balance', description: 'No planetary data available for Tatva (element) analysis.' };

  // Calculate how balanced the elements are
  const represented = elements.filter(count => count > 0).length;
  const maxCount = Math.max(...elements);
  const minCount = Math.min(...elements);
  const spread = maxCount - minCount;

  let score = 40; // Base
  score += represented * 10;
  if (spread >= 4) score -= 15;
  else if (spread >= 3) score -= 8;
  if (spread <= 2 && represented === 4) score += 10;

  score = Math.max(10, Math.min(100, score));

  const dominant = Object.entries(elementCounts).sort(([, a], [, b]) => b - a)[0];
  const missing = Object.entries(elementCounts).filter(([, count]) => count === 0).map(([el]) => el);

  let description: string;
  const details: string[] = [];
  Object.entries(elementCounts).forEach(([el, count]) => {
    details.push(`${el}: ${count} Graha${count !== 1 ? 's' : ''}`);
  });

  if (represented === 4 && spread <= 2) {
    description = `Well-balanced chart with all 4 Tatvas (elements) represented. ${dominant[0]} is slightly dominant (${dominant[1]} Grahas). You have versatility and adaptability.`;
  } else if (represented === 4) {
    description = `All 4 Tatvas present but ${dominant[0]} dominates heavily (${dominant[1]} Grahas). You lean strongly in one direction — that's not wrong, just pronounced.`;
  } else if (missing.length > 0) {
    description = `Missing ${missing.join(' and ')} Tatva${missing.length > 1 ? 's' : ''}. This creates an imbalance — you may struggle with qualities those elements represent.`;
  } else {
    description = `Your Tatva distribution is fairly typical. ${dominant[0]} leads with ${dominant[1]} Grahas.`;
  }

  return { score, label: 'Elemental Balance', description, details };
}

// ─── Divisional Chart Strength (Navamsha/Vargottama) ──────────────────────────

/**
 * Evaluates the strength of the Navamsha (D9) chart:
 * - Is the Navamsha Lagna lord strong?
 * - Are key planets Vargottama (same sign in D1 and D9)?
 * Returns a bonus/penalty of ±5 points on the overall score.
 */
function calculateNavamshaBonus(
  positions: Record<string, PlanetPosInput>
): { bonus: number; details: string[] } {
  let bonus = 0;
  const details: string[] = [];
  const majorPlanets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

  // Check for Vargottama planets (same sign in D1 and D9)
  let vargottamaCount = 0;
  for (const planet of majorPlanets) {
    const pos = positions[planet];
    if (!pos) continue;
    if (pos.navamshaSign && pos.navamshaSign === pos.sign) {
      vargottamaCount++;
      bonus += 1.0;
      details.push(`${planet} is Vargottama (same Rashi in D1 & D9) — significantly strengthened`);
    }
  }

  // Multiple Vargottama planets is very rare and powerful
  if (vargottamaCount >= 3) {
    bonus += 2;
    details.push(`${vargottamaCount} Vargottama Grahas — exceptionally rare and powerful`);
  }

  // Cap bonus/penalty at ±5
  bonus = Math.max(-5, Math.min(5, bonus));

  if (details.length === 0) {
    details.push('No Navamsha data available — no Vargottama analysis possible. Provide navamshaSign for each planet to enable this feature.');
  }

  return { bonus, details };
}

// ─── Generate Vedic Remedies ──────────────────────────────────────────────────

/**
 * Generates Vedic-specific remedy recommendations:
 * - Gemstone recommendations based on weak planets
 * - Mantra recommendations based on planet deities
 * - Day-specific practices
 * - Fasting recommendations
 * - Always includes disclaimer
 */
function generateVedicRemedies(
  positions: Record<string, PlanetPosInput>,
  breakdown: KundaliScoreResponse['breakdown'],
  doshas: string[]
): KundaliScoreResponse['vedicRemedies'] {
  const gemstones: string[] = [];
  const mantras: string[] = [];
  const dayPractices: string[] = [];
  const fasting: string[] = [];

  // Planet-specific gemstones, mantras, and practices
  const PLANET_REMEDIES: Record<string, {
    gemstone: string;
    mantra: string;
    day: string;
    dayPractice: string;
    fasting: string;
  }> = {
    'Sun': {
      gemstone: 'Ruby (Manikya) — strengthens Surya energy, leadership, vitality',
      mantra: 'Om Suryaya Namaha — connects to solar consciousness and self-confidence',
      day: 'Sunday (Ravivaar)',
      dayPractice: 'Surya Namaskar (Sun Salutation) at sunrise — awakens Surya energy and builds self-confidence',
      fasting: 'Fast on Sundays — eat only one meal before sunset to strengthen Surya',
    },
    'Moon': {
      gemstone: 'Pearl (Moti) — strengthens Chandra energy, emotional stability, intuition',
      mantra: 'Om Chandraya Namaha — calms the mind and enhances emotional intelligence',
      day: 'Monday (Somvaar)',
      dayPractice: 'Meditate in moonlight on Mondays — strengthens Chandra and emotional balance',
      fasting: 'Fast on Mondays — consume only milk and fruits to calm Chandra',
    },
    'Mars': {
      gemstone: 'Red Coral (Moonga) — strengthens Mangal energy, courage, willpower',
      mantra: 'Om Mangalaya Namaha — builds courage and channels competitive energy constructively',
      day: 'Tuesday (Mangalvaar)',
      dayPractice: 'Physical exercise or martial arts on Tuesdays — channels Mangal energy productively',
      fasting: 'Fast on Tuesdays — avoid salt and non-vegetarian food to pacify Mangal',
    },
    'Mercury': {
      gemstone: 'Emerald (Panna) — strengthens Budh energy, intellect, communication',
      mantra: 'Om Budhaya Namaha — enhances intellectual clarity and communicative abilities',
      day: 'Wednesday (Budhvaar)',
      dayPractice: 'Study sacred texts or practice writing on Wednesdays — strengthens Budh and learning',
      fasting: 'Fast on Wednesdays — eat only green vegetables to strengthen Budh',
    },
    'Jupiter': {
      gemstone: 'Yellow Sapphire (Pukhraj) — strengthens Guru energy, wisdom, prosperity',
      mantra: 'Om Gurave Namaha — invokes Jnana (wisdom) and divine grace',
      day: 'Thursday (Guruvaar)',
      dayPractice: 'Teach or study something new on Thursdays — strengthens Guru and expands wisdom',
      fasting: 'Fast on Thursdays — eat only yellow foods (chana dal, turmeric rice) to strengthen Guru',
    },
    'Venus': {
      gemstone: 'Diamond or White Sapphire (Shukra Ratna) — strengthens Shukra energy, beauty, harmony',
      mantra: 'Om Shukraya Namaha — enhances creativity, love, and aesthetic sense',
      day: 'Friday (Shukravaar)',
      dayPractice: 'Create art, beautify your space, or practice self-care on Fridays — strengthens Shukra',
      fasting: 'Fast on Fridays — consume only sweet foods and dairy to strengthen Shukra',
    },
    'Saturn': {
      gemstone: 'Blue Sapphire (Neelam) — strengthens Shani energy (use with extreme caution)',
      mantra: 'Om Sham Shanicharaya Namah — builds patience, endurance, and karmic awareness',
      day: 'Saturday (Shanivaar)',
      dayPractice: 'Serve the poor and elderly on Saturdays — Shani responds to selfless service (Seva)',
      fasting: 'Fast on Saturdays — eat only once, after sunset, to strengthen Shani discipline',
    },
  };

  // Identify weak planets for targeted remedies
  const majorPlanets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
  const weakPlanets: string[] = [];
  for (const planet of majorPlanets) {
    const pos = positions[planet];
    if (!pos) continue;

    // Check if debilitated
    if (isDebilitated(planet as any, pos.sign as any)) {
      weakPlanets.push(planet);
      continue;
    }

    // Check if combust
    if (pos.isCombust) {
      weakPlanets.push(planet);
      continue;
    }

    // Check if in enemy sign with low house placement
    try {
      const signLord = getSignLord(pos.sign as any);
      const relationship = getPermanentRelationship(
        planet as any,
        signLord as any
      );
      if ((relationship === 'Enemy' || relationship === 'Great Enemy') && [6, 8, 12].includes(pos.house)) {
        weakPlanets.push(planet);
      }
    } catch {
      // Skip relationship check if it fails
    }
  }

  // Generate remedies for the 2-3 weakest planets
  const planetsToRemedy = weakPlanets.slice(0, 3);
  for (const planet of planetsToRemedy) {
    const remedy = PLANET_REMEDIES[planet];
    if (!remedy) continue;

    gemstones.push(remedy.gemstone);
    mantras.push(remedy.mantra);
    dayPractices.push(`[${remedy.day}] ${remedy.dayPractice}`);
    fasting.push(remedy.fasting);
  }

  // Dosha-specific remedies
  if (doshas.includes('Mangal Dosha')) {
    mantras.push('Om Mangalaya Namaha — 108 times on Tuesdays for Mangal Dosha');
    fasting.push('Tuesday fasting with Hanuman Chalisa recitation — specifically for Mangal Dosha pacification');
  }
  if (doshas.includes('Kaal Sarp Dosha')) {
    mantras.push('Om Rahuve Namaha & Om Ketave Namaha — on Amavasya for Kaal Sarp Dosha');
    dayPractices.push('[Saturday] Visit a Shiva temple and offer milk abhishekam — specifically for Kaal Sarp Dosha');
  }
  if (doshas.includes('Shani Sade Sati')) {
    mantras.push('Om Sham Shanicharaya Namah — 108 times daily during Sade Sati');
    dayPractices.push('[Saturday] Light a mustard oil diya under a Peepal tree — traditional Sade Sati remedy');
    fasting.push('Saturday fasting with donation of black sesame, iron, and oil — specifically for Sade Sati');
  }

  // If no specific weak planets identified, give general strengthening advice
  if (gemstones.length === 0) {
    gemstones.push('No critical gemstone recommendations — your Graha placements are reasonably balanced. Consult a Jyotishi before wearing any Ratna (gemstone).');
  }

  if (mantras.length === 0) {
    mantras.push('Gayatri Mantra — the universal Vedic mantra that strengthens all planetary energies');
    mantras.push('Om Namah Shivaya — calms all planetary afflictions through Shiva consciousness');
  }

  if (dayPractices.length === 0) {
    dayPractices.push('[Daily] 10-minute Dhyana (meditation) — strengthens the mind regardless of chart');
    dayPractices.push('[Any day] Express gratitude each morning — rewires consciousness toward positivity');
  }

  if (fasting.length === 0) {
    fasting.push('Ekadashi fasting (11th day of each lunar half-month) — universal Vedic purification practice');
  }

  return {
    gemstones: gemstones.slice(0, 4),
    mantras: mantras.slice(0, 4),
    dayPractices: dayPractices.slice(0, 4),
    fasting: fasting.slice(0, 3),
    disclaimer: 'These Vedic remedies (Upaya) are traditional suggestions based on Jyotisha principles, not medical or psychological advice. Always consult a qualified Jyotishi (Vedic astrologer) before wearing any Ratna (gemstone) — incorrect gemstones can amplify negative effects. These practices work through intention, discipline, and mindfulness — not superstition. The chart shows tendencies (Sanskara), not certainties. Purushartha (right effort) always supersedes Daiva (destiny).',
  };
}

// ─── Generate Honest Assessment ───────────────────────────────────────────────

function generateHonestAssessment(
  overallScore: number,
  breakdown: KundaliScoreResponse['breakdown'],
  doshas: string[],
  yogas: string[],
  positions: Record<string, PlanetPosInput>
): { assessment: string; topStrength: string; topChallenge: string; remedies: string[] } {
  let assessment = '';
  let topStrength = '';
  let topChallenge = '';
  const remedies: string[] = [];

  // Overall assessment with Vedic terminology
  if (overallScore >= 85) {
    assessment = 'Your Kundali is genuinely exceptional — rare Shadbala strength across multiple dimensions. You have real astrological advantages (Yoga-sampatti) that others don\'t. Don\'t waste them — but also don\'t become complacent. Great charts carry great responsibility (Dharma).';
  } else if (overallScore >= 75) {
    assessment = 'Your Kundali is strong with genuine Yoga-sampatti (astrological wealth). You have real advantages in key areas, though specific challenges exist. Lean into your strengths while working on weak areas through Upaya (remedies).';
  } else if (overallScore >= 65) {
    assessment = 'Your Kundali is above average with some real challenges. You have genuine Shadbala strengths, but specific Bhavas need deliberate work. Purushartha (right effort) fills the gaps.';
  } else if (overallScore >= 55) {
    assessment = 'Your Kundali is average — neither particularly blessed (Shubha) nor particularly cursed (Ashubha). Most things in life will require effort, but that effort reliably pays off. This is the most common chart pattern.';
  } else if (overallScore >= 45) {
    assessment = 'Your Kundali has more challenges than average. This is the honest truth — you have a harder path than most in certain areas. But harder paths (Kathina marg) build stronger people. Vedic wisdom emphasizes that Purushartha always overcomes Daiva.';
  } else if (overallScore >= 35) {
    assessment = 'Your Kundali has significant afflictions (Papa-graha influences). This is not sugarcoating — you have a harder path than most. But Vedic tradition teaches that awareness (Bodha), right action (Karma), and remedies (Upaya) can transform any chart.';
  } else {
    assessment = 'Your Kundali is heavily challenged. This is not a Shaapa (curse) — it is a karmic map requiring extraordinary effort. Vedic wisdom holds that even the most afflicted charts can produce extraordinary lives through sustained Dharma, Seva, and Tapas.';
  }

  // Add specific observations
  const observations: string[] = [];
  if (doshas.length > 0) {
    observations.push(`The ${doshas[0]} affects specific life areas. It manifests as a karmic pattern — not a Shaapa (curse). Awareness (Bodha) is your first Upaya (remedy).`);
  }
  if (breakdown.ascendantLord.score >= 75) {
    observations.push('Your strong Lagna lord gives you genuine Atma-balam (inner strength) and self-direction.');
  }
  if (breakdown.yogaScore.score >= 70) {
    observations.push('Your Yogas give you real advantages (Yoga-sampatti) that others don\'t have — use them wisely (Yukti).');
  }
  if (breakdown.planetStrength.score < 50) {
    observations.push('Weak Graha placements (low Shadbala) mean you\'ll need to work harder for things that come easily to others. This builds character (Charitra), even if it doesn\'t feel fair.');
  }
  if (breakdown.nakshatraStrength.score < 50) {
    observations.push('Your Janma Nakshatra indicates Manas (emotional) challenges — Dhyana (meditation) and self-awareness practices are not optional for you, they\'re essential.');
  }
  if (breakdown.elementalBalance.score < 50) {
    observations.push('Your chart has Tatva (elemental) imbalances — you may over-rely on certain qualities while missing others.');
  }

  if (observations.length > 0) {
    assessment += ' ' + observations.join(' ');
  }

  assessment += ' Remember: the Kundali shows Samskara (tendencies), not certainties. Purushartha (conscious effort) always supersedes Daiva (destiny).';

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
    if (lowest.key === 'yogaScore') {
      topChallenge = yogas.length > 0
        ? `Only ${yogas.length} minor Yoga${yogas.length > 1 ? 's' : ''} detected (${yogas.join(', ')}). No Maha Yogas like Raj Yoga or Panch Mahapurusha Yoga are present — your chart lacks the major boosters that make certain things come effortlessly.`
        : 'No significant Yogas detected. Your chart lacks the powerful Graha combinations (Yoga-sampatti) that create effortless advantages. This means you\'ll need to build success through sustained Purushartha (effort) rather than natural gifts.';
    } else {
      topChallenge = lowest.desc;
    }
  } else {
    topChallenge = 'No single dominant challenge — your Kundali is relatively balanced across dimensions. This is actually good, even if it means no one area shines dramatically.';
  }

  // Personalized remedies based on chart analysis (simplified — Vedic remedies are in generateVedicRemedies)
  if (doshas.includes('Mangal Dosha')) {
    remedies.push('Chant "Om Mangalaya Namaha" on Tuesdays — focus practice for Mangal energy');
    remedies.push('Practice patience in relationships — count to 10 before reacting');
    remedies.push('Channel Mangal energy through physical exercise or competitive activities');
  }
  if (doshas.includes('Kaal Sarp Dosha')) {
    remedies.push('Chant "Om Rahuve Namaha" and "Om Ketave Namaha" on Saturdays');
    remedies.push('Focus on one thing at a time — scattered energy (Vikshepa) is your enemy');
    remedies.push('Practice gratitude journaling daily — trains the Manas toward abundance thinking');
  }
  if (doshas.includes('Pitra Dosha')) {
    remedies.push('Perform Shradh ceremonies for ancestors with genuine respect');
    remedies.push('Respect and care for elders — this Dosha heals through Pitru Seva (service to lineage)');
  }
  if (doshas.includes('Shani Sade Sati')) {
    remedies.push('Chant "Om Sham Shanicharaya Namah" on Saturdays — builds Dhairya (patience) and endurance');
    remedies.push('Donate black sesame seeds, iron, and oil on Saturdays — traditional Shani Upaya');
    remedies.push('Recite Hanuman Chalisa daily for protection and courage during this Dasha');
  }
  if (doshas.includes('Grahan Dosha')) {
    remedies.push('Chant Gayatri Mantra 108 times daily — strengthens the Surya-Chandra axis');
  }
  if (doshas.includes('Shrapit Dosha')) {
    remedies.push('Practice selfless service (Nishkama Seva) — this Dosha responds to genuine giving');
  }

  // General remedies based on weak areas
  if (breakdown.planetStrength.score < 50) {
    remedies.push('Strengthen weak Grahas through their associated activities (Guru: teaching/learning, Shukra: arts/beauty, Mangal: exercise/discipline)');
    remedies.push('Wear Ratna (gemstones) ONLY after consulting a qualified Jyotishi — wrong gems can harm');
  }
  if (breakdown.nakshatraStrength.score < 50) {
    remedies.push('Daily Dhyana (meditation, even 5 minutes) — your Chandra needs it more than most');
    remedies.push('Practice journaling your emotions — builds Manas awareness and regulation');
  }

  // General remedies if no specific ones
  if (remedies.length === 0) {
    remedies.push('Dhyana (meditate) for 10 minutes daily — strengthens the Manas regardless of chart');
    remedies.push('Express Kritajnata (gratitude) every morning — rewires consciousness toward positivity');
    remedies.push('Practice Nishkama Seva (selfless service) at least once a week — builds Punya (merit)');
    remedies.push('Consult a qualified Jyotishi before wearing any Ratna (gemstone)');
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

    let { userId, sunSign, moonSign, ascendant, planetaryPositions, yogas, doshas, nakshatra } = parsed.data;
    if (userId) {
      const auth = await requireApiUser(request, userId);
      if (!auth.ok) return auth.response;
      userId = auth.userId;
    }

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
            navamshaSign: (v.navamshaSign as string) || undefined,
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

    // Calculate breakdown scores with Shadbala-inspired algorithm
    const planetStrengthResult = calculatePlanetStrength(positions);
    const { shadbalaComponents, ...planetStrength } = planetStrengthResult;
    const yogaScore = calculateYogaScore(yogaList);
    const doshaPenalty = calculateDoshaPenalty(doshaList);
    const housePlacement = calculateBhavaStrength(positions, ascSign); // Now uses Bhava Lord Analysis
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

    // Calculate weighted overall score — Vedic-accurate weights
    // Planet Strength (Shadbala): 25% — core foundation
    // Ascendant Lord (Lagna Lord): 20% — most important in Vedic
    // Yoga Score: 15% — special combinations
    // Dosha Penalty: 15% — challenges
    // Bhava Strength (House Placement): 10% — house lord analysis
    // Nakshatra Strength: 10% — emotional foundation
    // Elemental Balance: 5% — overall Tatva balance
    let overallScore = Math.round(
      planetStrength.score * 0.25 +
      ascendantLord.score * 0.20 +
      yogaScore.score * 0.15 +
      doshaPenalty.score * 0.15 +
      housePlacement.score * 0.10 +
      nakshatraStrength.score * 0.10 +
      elementalBalance.score * 0.05
    );

    // Apply Navamsha/Vargottama bonus (±5 points)
    const navamshaResult = calculateNavamshaBonus(positions);
    overallScore = Math.max(0, Math.min(100, overallScore + navamshaResult.bonus));

    // Get Vedic grade
    const { grade, description: gradeDescription } = getGrade(overallScore);

    // Generate honest assessment with Vedic remedies
    const { assessment, topStrength, topChallenge, remedies } = generateHonestAssessment(
      overallScore,
      breakdown,
      doshaList,
      yogaList,
      positions
    );

    // Generate Vedic-specific remedies
    const vedicRemedies = generateVedicRemedies(positions, breakdown, doshaList);

    const response: KundaliScoreResponse = {
      overallScore,
      grade,
      gradeDescription,
      breakdown,
      honestAssessment: assessment,
      topStrength,
      topChallenge,
      remedies,
      shadbalaDetails: {
        sthanaBala: shadbalaComponents.sthanaBala,
        digBala: shadbalaComponents.digBala,
        chestaBala: shadbalaComponents.chestaBala,
        navamshaBonus: navamshaResult.bonus,
        navamshaDetails: navamshaResult.details,
      },
      vedicRemedies,
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
