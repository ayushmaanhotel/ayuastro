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
  KENDRA_HOUSES,
  TRIKONA_HOUSES,
  NATURAL_BENEFICS,
  NATURAL_MALEFICS,
  getHouseFromAscendant,
  EXALTATION,
} from '@/lib/astrology/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PlanetPosInput {
  sign: string;
  degree: number;
  house: number;
  retrograde?: boolean;
}

interface BreakdownItem {
  score: number;
  label: string;
  description: string;
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
});

// ─── Helper: Get grade from score ─────────────────────────────────────────────

function getGrade(score: number): { grade: string; description: string } {
  if (score >= 90) return { grade: 'A+', description: 'Exceptional chart with rare strengths' };
  if (score >= 80) return { grade: 'A', description: 'Strong chart with powerful placements' };
  if (score >= 72) return { grade: 'B+', description: 'Good chart with some challenges' };
  if (score >= 64) return { grade: 'B', description: 'Decent chart — balanced strengths and weaknesses' };
  if (score >= 56) return { grade: 'C+', description: 'Average chart with notable challenges' };
  if (score >= 48) return { grade: 'C', description: 'Below average — significant challenges present' };
  if (score >= 35) return { grade: 'D', description: 'Difficult chart with multiple afflictions' };
  return { grade: 'D-', description: 'Heavily afflicted chart — but not a curse, just a harder path' };
}

// ─── Score Calculation Functions ──────────────────────────────────────────────

function calculatePlanetStrength(
  positions: Record<string, PlanetPosInput>
): BreakdownItem {
  const majorPlanets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
  let totalPoints = 0;
  let maxPoints = 0;
  const details: string[] = [];

  for (const planet of majorPlanets) {
    const pos = positions[planet];
    if (!pos) continue;
    maxPoints += 10;

    let points = 5; // Neutral baseline

    if (isExalted(planet as keyof typeof EXALTATION & string, pos.sign)) {
      points = 10;
      details.push(`${planet} is exalted — very strong`);
    } else if (isInOwnSign(planet as 'Sun' | 'Moon' | 'Mars' | 'Mercury' | 'Jupiter' | 'Venus' | 'Saturn', pos.sign)) {
      points = 9;
      details.push(`${planet} is in its own sign — strong`);
    } else if (isInMoolatrikona(planet as 'Sun' | 'Moon' | 'Mars' | 'Mercury' | 'Jupiter' | 'Venus' | 'Saturn', pos.sign)) {
      points = 8;
      details.push(`${planet} is in Moolatrikona — good strength`);
    } else if (isDebilitated(planet as 'Sun' | 'Moon' | 'Mars' | 'Mercury' | 'Jupiter' | 'Venus' | 'Saturn', pos.sign)) {
      points = 2;
      details.push(`${planet} is debilitated — weak placement`);
    } else if (pos.isCombust) {
      points = 3;
      details.push(`${planet} is combust — weakened`);
    } else {
      // Check if in friendly sign (simplified — neutral is the default)
      points = 6;
    }

    // Retrograde planets are considered stronger in Vedic astrology (they're closer to Earth)
    if (pos.retrograde) {
      points = Math.min(10, points + 1);
    }

    totalPoints += points;
  }

  const score = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 50;

  const worstPlanet = details.find(d => d.includes('debilitated'));
  const bestPlanet = details.find(d => d.includes('exalted') || d.includes('own sign'));

  let description = 'Most of your planets are reasonably placed.';
  if (worstPlanet && bestPlanet) {
    description = `${bestPlanet.split(' — ')[0]}. ${worstPlanet.split(' — ')[0]}.`;
  } else if (worstPlanet) {
    description = worstPlanet.replace(' — ', ' which brings some hardship. ');
  } else if (bestPlanet) {
    description = `${bestPlanet.split(' — ')[0]}. Overall decent planetary strength.`;
  }

  return { score, label: 'Planet Strength', description };
}

function calculateYogaScore(yogas: string[]): BreakdownItem {
  const yogaCount = yogas.length;

  // Score based on number of yogas and their significance
  // 0 yogas = 30, 1 = 45, 2 = 60, 3 = 72, 4+ = 80+
  let score: number;
  if (yogaCount === 0) score = 30;
  else if (yogaCount === 1) score = 48;
  else if (yogaCount === 2) score = 62;
  else if (yogaCount === 3) score = 74;
  else if (yogaCount === 4) score = 82;
  else score = Math.min(95, 82 + (yogaCount - 4) * 3);

  // Bonus for specific powerful yogas
  const powerfulYogas = ['Raj Yoga', 'Gaj Kesari Yoga', 'Hansa Yoga', 'Malavya Yoga', 'Ruchaka Yoga', 'Bhadra Yoga', 'Shasha Yoga'];
  const hasPowerfulYoga = yogas.some(y => powerfulYogas.includes(y));
  if (hasPowerfulYoga) score = Math.min(98, score + 10);

  let description: string;
  if (yogaCount === 0) {
    description = 'No significant yogas detected in your chart. This is common — most charts have 1-2 yogas at most.';
  } else if (yogaCount === 1) {
    description = `You have 1 auspicious yoga forming. This brings a specific gift to your life.`;
  } else if (yogaCount <= 3) {
    description = `You have ${yogaCount} auspicious yogas forming. This brings special gifts and areas of natural advantage.`;
  } else {
    description = `You have ${yogaCount} yogas in your chart — this is rare and indicates multiple areas of strength and opportunity.`;
  }

  return { score, label: 'Yogas & Blessings', description };
}

function calculateDoshaPenalty(doshas: string[]): BreakdownItem {
  // Start from 100 and subtract for each dosha
  let penalty = 0;
  const details: string[] = [];

  const doshaSeverity: Record<string, number> = {
    'Mangal Dosha': 18,
    'Kaal Sarp Dosha': 20,
    'Pitra Dosha': 12,
    'Shani Sade Sati': 15,
    'Grahan Dosha': 14,
    'Shrapit Dosha': 16,
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
    description = 'No significant doshas detected. Your chart is relatively clean of major afflictions.';
  } else if (doshas.length === 1) {
    description = `${doshas[0]} detected. This creates real challenges in specific life areas. Not a curse, but a pattern to be aware of.`;
  } else if (doshas.length === 2) {
    description = `${doshas[0]} and ${doshas[1]} detected. Multiple doshas mean multiple challenge areas. Awareness is your first tool.`;
  } else {
    description = `${doshas.length} doshas detected (${doshas.join(', ')}). This is a heavily challenged chart. Hard truths, but not hopeless — remedies and awareness matter.`;
  }

  return { score, label: 'Doshas & Challenges', description };
}

function calculateHousePlacement(
  positions: Record<string, PlanetPosInput>,
  ascendantSign: string
): BreakdownItem {
  const ascIndex = getSignIndex(ascendantSign as 'Aries' | 'Taurus' | 'Gemini' | 'Cancer' | 'Leo' | 'Virgo' | 'Libra' | 'Scorpio' | 'Sagittarius' | 'Capricorn' | 'Aquarius' | 'Pisces');
  if (ascIndex === -1) return { score: 50, label: 'House Layout', description: 'Unable to calculate house placements accurately.' };

  let points = 50; // Start at neutral
  const details: string[] = [];

  const benefics = NATURAL_BENEFICS;
  const malefics = NATURAL_MALEFICS;
  const kendra = KENDRA_HOUSES;
  const trikona = TRIKONA_HOUSES;
  const dusthana = [6, 8, 12]; // Difficult houses
  const upachaya = [3, 6, 10, 11]; // Houses of growth

  for (const [planet, pos] of Object.entries(positions)) {
    const house = pos.house;
    if (!house) continue;

    // Benefics in kendras/trikonas: good
    if (benefics.includes(planet as 'Jupiter' | 'Venus' | 'Mercury' | 'Moon')) {
      if (kendra.includes(house)) {
        points += 4;
        details.push(`${planet} in ${house}${getOrdinal(house)} house (kendra) — stabilizing`);
      } else if (trikona.includes(house)) {
        points += 4;
        details.push(`${planet} in ${house}${getOrdinal(house)} house (trikona) — auspicious`);
      } else if (dusthana.includes(house)) {
        points -= 3;
        details.push(`${planet} in ${house}${getOrdinal(house)} house (dusthana) — weakened`);
      }
    }

    // Malefics in dusthanas: actually good (they do well in 6, 8, 12)
    if (malefics.includes(planet as 'Sun' | 'Mars' | 'Saturn' | 'Rahu' | 'Ketu')) {
      if (house === 6) {
        points += 3; // Malefics in 6th destroy enemies
        details.push(`${planet} in 6th house — destroys opposition`);
      } else if (kendra.includes(house)) {
        points -= 1; // Malefics in kendras can be stressful
      } else if (dusthana.includes(house)) {
        points += 1;
      } else if (upachaya.includes(house)) {
        points += 2;
        details.push(`${planet} in ${house}${getOrdinal(house)} house — grows stronger over time`);
      }
    }
  }

  // Check for empty key houses
  const housesOccupied = new Set(Object.values(positions).map(p => p.house));
  if (!housesOccupied.has(7)) {
    details.push('7th house is empty — may indicate delay or less focus on partnerships');
  }
  if (!housesOccupied.has(10)) {
    details.push('10th house is empty — career direction may take time to clarify');
  }

  const score = Math.max(10, Math.min(100, points));
  const topDetail = details[0] || 'Your house layout is fairly standard with no extreme concentrations.';

  return { score, label: 'House Layout', description: topDetail };
}

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
    details.push('exalted');
  }
  // Own sign
  else if (isInOwnSign(lord, lordPos.sign)) {
    score = 88;
    details.push('in its own sign');
  }
  // Moolatrikona
  else if (isInMoolatrikona(lord, lordPos.sign)) {
    score = 85;
    details.push('in Moolatrikona');
  }
  // Debilitated
  else if (isDebilitated(lord, lordPos.sign)) {
    score = 25;
    details.push('debilitated — this is a real challenge');
  }
  // In kendra
  else if (KENDRA_HOUSES.includes(lordPos.house)) {
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
  // Neutral
  else {
    score = 55;
    details.push('in a neutral position');
  }

  // Retrograde bonus
  if (lordPos.retrograde) {
    score = Math.min(100, score + 5);
    details.push('retrograde (enhances inner strength)');
  }

  // Combust penalty
  if (lordPos.isCombust) {
    score = Math.max(10, score - 15);
    details.push('combust — significantly weakened');
  }

  let description: string;
  if (score >= 80) {
    description = `Your chart ruler (${lord}) is ${details.join(', ')}. You have natural leadership and self-direction. This is a genuine strength.`;
  } else if (score >= 60) {
    description = `Your chart ruler (${lord}) is ${details.join(', ')}. Decent self-confidence with room for growth.`;
  } else if (score >= 40) {
    description = `Your chart ruler (${lord}) is ${details.join(', ')}. You may struggle with self-direction and confidence. This is not permanent — awareness helps.`;
  } else {
    description = `Your chart ruler (${lord}) is ${details.join(', ')}. This is a significant challenge. You'll need to work harder for self-assurance, but the growth potential is immense.`;
  }

  return { score, label: 'Ascendant Lord', description };
}

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
    assessment = 'Your chart is genuinely strong.';
  } else if (overallScore >= 65) {
    assessment = 'Your chart is above average with some real challenges.';
  } else if (overallScore >= 50) {
    assessment = 'Your chart is average — neither particularly blessed nor particularly cursed.';
  } else if (overallScore >= 35) {
    assessment = 'Your chart has significant challenges. This is the honest truth.';
  } else {
    assessment = 'Your chart is heavily afflicted. This is not sugarcoating — you have a harder path than most.';
  }

  // Add specific observations
  const observations: string[] = [];
  if (doshas.length > 0) {
    observations.push(`The ${doshas[0]} will create turbulence in specific life areas. This is not a curse, it\'s a pattern to understand.`);
  }
  if (breakdown.ascendantLord.score >= 75) {
    observations.push('Your strong ascendant lord gives you resilience and self-direction.');
  }
  if (breakdown.yogaScore.score >= 70) {
    observations.push('Your yogas give you genuine advantages that others don\'t have.');
  }
  if (breakdown.planetStrength.score < 50) {
    observations.push('Weak planetary placements mean you\'ll need to work harder for things that come easily to others.');
  }

  if (observations.length > 0) {
    assessment += ' ' + observations.join(' ');
  }

  assessment += ' The key is awareness, not fear.';

  // Top strength
  const scores = [
    { key: 'planetStrength', val: breakdown.planetStrength.score, desc: breakdown.planetStrength.description },
    { key: 'yogaScore', val: breakdown.yogaScore.score, desc: breakdown.yogaScore.description },
    { key: 'housePlacement', val: breakdown.housePlacement.score, desc: breakdown.housePlacement.description },
    { key: 'ascendantLord', val: breakdown.ascendantLord.score, desc: breakdown.ascendantLord.description },
  ];
  scores.sort((a, b) => b.val - a.val);
  topStrength = scores[0].desc;

  // Top challenge
  const challenges = scores.filter(s => s.val < 70);
  if (breakdown.doshaPenalty.score < 70) {
    topChallenge = breakdown.doshaPenalty.description;
  } else if (challenges.length > 0) {
    challenges.sort((a, b) => a.val - b.val);
    topChallenge = challenges[0].desc;
  } else {
    topChallenge = 'No single dominant challenge — your chart is relatively balanced.';
  }

  // Remedies based on doshas
  if (doshas.includes('Mangal Dosha')) {
    remedies.push('Chant "Om Mangalaya Namaha" on Tuesdays');
    remedies.push('Practice patience in relationships — count to 10 before reacting');
    remedies.push('Channel Mars energy through physical exercise');
    remedies.push('Consider red coral only after consulting a qualified astrologer');
  }
  if (doshas.includes('Kaal Sarp Dosha')) {
    remedies.push('Chant "Om Rahuve Namaha" and "Om Ketuve Namaha"');
    remedies.push('Focus on one thing at a time — scattered energy is your enemy');
    remedies.push('Practice gratitude journaling daily');
    remedies.push('Visit a Rahu-Ketu temple on Amavasya (new moon) if possible');
  }
  if (doshas.includes('Pitra Dosha')) {
    remedies.push('Perform Shradh ceremonies for ancestors');
    remedies.push('Respect and care for elders');
    remedies.push('Donate to charity on Sundays');
    remedies.push('Practice forgiveness — holding grudges amplifies this dosha');
  }
  if (doshas.includes('Shani Sade Sati')) {
    remedies.push('Chant "Om Sham Shanicharaya Namah" on Saturdays');
    remedies.push('Light a mustard oil lamp under a Peepal tree on Saturdays');
    remedies.push('Donate black sesame seeds, iron, and oil on Saturdays');
    remedies.push('Recite Hanuman Chalisa daily for protection');
  }
  if (doshas.includes('Grahan Dosha')) {
    remedies.push('Chant Gayatri Mantra 108 times daily');
    remedies.push('Donate wheat, jaggery, and copper on Sundays');
    remedies.push('Perform Grahan Shanti Puja during eclipse periods');
  }
  if (doshas.includes('Shrapit Dosha')) {
    remedies.push('Chant "Om Sham Shanicharaya Namah" and "Om Raahave Namaha"');
    remedies.push('Light a mustard oil lamp for Saturn and burn camphor for Rahu on Saturdays');
    remedies.push('Recite Hanuman Chalisa daily for protection');
  }

  // General remedies if no specific dosha
  if (remedies.length === 0) {
    remedies.push('Meditate for 10 minutes daily to strengthen your mind');
    remedies.push('Express gratitude every morning — it rewires your brain');
    remedies.push('Wear your lucky gemstone after consulting a qualified astrologer');
  }

  // Limit remedies
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

    const { userId, sunSign, moonSign, ascendant, planetaryPositions, yogas, doshas } = parsed.data;

    // Safely cast planetary positions from unknown to PlanetPosInput
    let positions: Record<string, PlanetPosInput> = {};
    if (planetaryPositions) {
      for (const [key, val] of Object.entries(planetaryPositions)) {
        if (val && typeof val === 'object') {
          positions[key] = val as PlanetPosInput;
        }
      }
    }
    let yogaList = yogas || [] as string[];
    let doshaList = doshas || [] as string[];
    let ascSign = ascendant || '';

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

          // Use stored data as fallback if not provided
          if (Object.keys(positions).length === 0) positions = storedPositions as Record<string, PlanetPosInput>;
          if (yogaList.length === 0) yogaList = storedYogas.filter((y: { present: boolean; name: string }) => y.present).map((y: { name: string }) => y.name);
          if (doshaList.length === 0) doshaList = storedDoshas.filter((d: { present: boolean; name: string }) => d.present).map((d: { name: string }) => d.name);
          if (!ascSign) ascSign = astrologyData.ascendant;
        }
      } catch {
        // Database fetch failed — use provided data
      }
    }

    // If no data available at all, return a default/neutral score
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

    const breakdown = {
      planetStrength,
      yogaScore,
      doshaPenalty,
      housePlacement,
      ascendantLord,
    };

    // Calculate weighted overall score
    const overallScore = Math.round(
      planetStrength.score * 0.30 +
      yogaScore.score * 0.25 +
      doshaPenalty.score * 0.20 +
      housePlacement.score * 0.25 +
      ascendantLord.score * 0.20
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
