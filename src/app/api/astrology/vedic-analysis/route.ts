import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { calculateKundali } from '@/lib/astrology';
import {
  type PlanetPosition,
  type HouseData,
  type YogaData,
  type DoshaData,
  type ZodiacSign,
  type Planet,
} from '@/lib/astrology/types';
import {
  getSignLord,
  getHouseFromAscendant,
  isExalted,
  isDebilitated,
  isInOwnSign,
  isInMoolatrikona,
  EXALTATION,
  KENDRA_HOUSES,
  TRIKONA_HOUSES,
  getSignAttributes,
} from '@/lib/astrology/utils';
import { HOUSE_SIGNIFICANCES } from '@/lib/astrology/charts';
import { NAKSHATRAS } from '@/lib/astrology/nakshatra';
import { getDashaInterpretation } from '@/lib/astrology/dasha';

// ─── Deterministic Analysis Generators ────────────────────────────────────────

function getPlanetaryStrength(
  planet: Planet,
  sign: ZodiacSign
): 'Exalted' | 'Own Sign' | 'Moolatrikona' | 'Debilitated' | 'Neutral' {
  if (isExalted(planet, sign)) return 'Exalted';
  if (isInOwnSign(planet, sign)) return 'Own Sign';
  if (isInMoolatrikona(planet, sign)) return 'Moolatrikona';
  if (isDebilitated(planet, sign)) return 'Debilitated';
  return 'Neutral';
}

function getStrengthDescription(strength: string): string {
  switch (strength) {
    case 'Exalted':
      return 'at maximum power, bringing the highest expression of its energy';
    case 'Own Sign':
      return 'comfortably placed in its own territory, strong and stable';
    case 'Moolatrikona':
      return 'in its second-best placement, highly effective and authoritative';
    case 'Debilitated':
      return 'at its weakest placement, requiring effort and remedy to express positively';
    default:
      return 'in a neutral position, expressing its energy normally';
  }
}

function generateHouseAnalysis(
  houses: HouseData[],
  positions: Record<string, PlanetPosition>,
  ascendantSignIndex: number
): Array<{
  houseNumber: number;
  houseName: string;
  sign: string;
  lord: string;
  planets: string[];
  analysis: string;
}> {
  const houseAnalyses: Array<{
    houseNumber: number;
    houseName: string;
    sign: string;
    lord: string;
    planets: string[];
    analysis: string;
  }> = [];

  for (const house of houses) {
    const significance = HOUSE_SIGNIFICANCES.find(h => h.number === house.houseNumber);
    const houseName = significance?.name ?? `House ${house.houseNumber}`;
    const significations = significance?.significations ?? [];
    const houseLord = getSignLord(house.sign);
    const lordPos = positions[houseLord];

    const planetNames = house.planets.map(p => String(p));
    const planetStrengths = planetNames.map(p => {
      const pos = positions[p];
      if (!pos) return '';
      const strength = getPlanetaryStrength(p as Planet, pos.sign);
      return `${p} (${strength})`;
    });

    // Build deterministic analysis
    const parts: string[] = [];
    parts.push(`The ${houseName} house (${significance?.sanskritName ?? ''}) occupies the sign of ${house.sign}, ruled by ${houseLord}.`);
    parts.push(`This house governs: ${significations.join(', ')}.`);

    if (planetNames.length > 0) {
      parts.push(`Planets occupying this house: ${planetStrengths.join(', ')}.`);

      for (const planetName of planetNames) {
        const pos = positions[planetName];
        if (!pos) continue;
        const strength = getPlanetaryStrength(planetName as Planet, pos.sign);
        const desc = getStrengthDescription(strength);

        if (strength === 'Exalted') {
          parts.push(`${planetName} is exalted here — ${desc}. This greatly strengthens the affairs of this house.`);
        } else if (strength === 'Debilitated') {
          parts.push(`${planetName} is debilitated here — ${desc}. This challenges the affairs of this house but offers growth through effort.`);
        } else if (strength === 'Own Sign') {
          parts.push(`${planetName} is in its own sign — ${desc}. This provides stability and strength to this house.`);
        }
      }
    } else {
      parts.push('No planets occupy this house, so the house lord\'s position becomes the primary influence.');
    }

    if (lordPos) {
      const lordHouse = getHouseFromAscendant(lordPos.signIndex, ascendantSignIndex);
      const lordStrength = getPlanetaryStrength(houseLord, lordPos.sign);
      parts.push(`The house lord ${houseLord} is placed in the ${lordHouse}${getOrdinalSuffix(lordHouse)} house in ${lordPos.sign} (${lordStrength}).`);
    }

    houseAnalyses.push({
      houseNumber: house.houseNumber,
      houseName,
      sign: house.sign,
      lord: houseLord,
      planets: planetNames,
      analysis: parts.join(' '),
    });
  }

  return houseAnalyses;
}

function getOrdinalSuffix(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

function generateYogaInterpretations(yogas: YogaData[]): Array<{
  name: string;
  present: boolean;
  strength: string;
  description: string;
  involvingPlanets: string[];
  interpretation: string;
}> {
  return yogas.map(yoga => ({
    name: yoga.name,
    present: yoga.present,
    strength: yoga.strength,
    description: yoga.description,
    involvingPlanets: yoga.involvingPlanets,
    interpretation: yoga.present
      ? getYogaInterpretation(yoga.name, yoga.strength, yoga.involvingPlanets)
      : `This yoga is not present in the birth chart. ${getAbsentYogaNote(yoga.name)}`,
  }));
}

function getYogaInterpretation(name: string, strength: string, planets: Planet[]): string {
  const strengthNote = strength === 'Strong'
    ? 'This is a particularly strong formation, amplifying its positive effects significantly.'
    : strength === 'Moderate'
    ? 'This yoga operates at moderate strength, providing steady but not overwhelming results.'
    : 'This yoga is weakly formed, offering subtle benefits that may require conscious effort to activate.';

  const planetNote = planets.length > 0
    ? `The planets involved (${planets.join(', ')}) work together to create this combination.`
    : '';

  return `${strengthNote} ${planetNote}`;
}

function getAbsentYogaNote(name: string): string {
  const notes: Record<string, string> = {
    'Raj Yoga': 'The connection between kendra and trikona lords does not form in this chart, but other yogas may compensate.',
    'Gaj Kesari Yoga': 'Jupiter is not in a kendra from the Moon. Wisdom and reputation come through other planetary combinations.',
    'Neech Bhang Raj Yoga': 'No debilitated planet receives cancellation in this chart, indicating steadier planetary energies.',
    'Chandra Mangal Yoga': 'Moon and Mars do not form a significant relationship. Emotional drive comes from other sources.',
    'Budh Aditya Yoga': 'Sun and Mercury are not favorably conjunct. Intellect and authority operate independently.',
    'Hansa Yoga': 'Jupiter is not in own/exaltation sign in a kendra. Wisdom is developed through experience rather than innate gift.',
    'Malavya Yoga': 'Venus is not in own/exaltation sign in a kendra. Beauty and harmony are cultivated rather than innate.',
    'Shasha Yoga': 'Saturn is not in own/exaltation sign in a kendra. Endurance is built through life experience.',
    'Ruchaka Yoga': 'Mars is not in own/exaltation sign in a kendra. Courage develops through facing challenges.',
    'Bhadra Yoga': 'Mercury is not in own/exaltation sign in a kendra. Intellect sharpens through study and practice.',
    'Amala Yoga': 'Venus and Jupiter are not both in kendras from the Moon. Reputation is built through actions rather than inherent standing.',
    'Veshi Yoga': 'No planets occupy the 2nd from the Sun. Wealth comes through personal effort rather than speech or family.',
    'Voshi Yoga': 'No planets occupy the 12th from the Sun. Inner happiness develops through self-awareness rather than planetary support.',
    'Ubhayachari Yoga': 'The Sun is not flanked by planets on both sides. Status is achieved through merit rather than innate authority.',
    'Dhana Yoga': 'The wealth lords do not form a strong connection. Financial prosperity comes through effort and strategic planning.',
    'Vipreet Raj Yoga': 'No dushtana lord is placed in another dushtana house. Challenges do not automatically transform into opportunities.',
  };
  return notes[name] ?? 'This combination does not form in the current chart.';
}

function generateDoshaInterpretations(doshas: DoshaData[]): Array<{
  name: string;
  present: boolean;
  severity: string;
  description: string;
  remedies: string[];
  interpretation: string;
}> {
  return doshas.map(dosha => ({
    name: dosha.name,
    present: dosha.present,
    severity: dosha.severity,
    description: dosha.description,
    remedies: dosha.remedies,
    interpretation: dosha.present
      ? getDoshaInterpretation(dosha.name, dosha.severity)
      : `This dosha is not present in the birth chart. ${getAbsentDoshaNote(dosha.name)}`,
  }));
}

function getDoshaInterpretation(name: string, severity: string): string {
  const severityNote = severity === 'High'
    ? 'This is a significant affliction that requires attention and remedial measures.'
    : severity === 'Medium'
    ? 'This is a moderate affliction that can be managed with awareness and simple remedies.'
    : 'This is a mild affliction that provides lessons for growth rather than serious obstacles.';

  const notes: Record<string, string> = {
    'Mangal Dosha': 'The intense Martian energy in sensitive houses creates passion that needs conscious channeling. With awareness, this same energy becomes a source of courage and commitment.',
    'Kaal Sarp Dosha': 'All planets hemmed between the nodes indicate a concentrated karmic curriculum. The recurring patterns are invitations for deep transformation, not punishments.',
    'Pitra Dosha': 'Ancestral karmic patterns surface for conscious resolution. Awareness and gratitude practices help break inherited cycles.',
    'Shani Sade Sati': 'Saturn\'s transit over sensitive points brings restructuring and maturation. What is authentic endures; what is not is released.',
    'Grahan Dosha': 'Eclipse energy on the luminaries creates periods of identity questioning and emotional intensity. These phases are gateways to deeper self-understanding.',
    'Shrapit Dosha': 'The Saturn-Rahu combination indicates karmic debts from past actions. These obstacles are not punishments but opportunities to balance karmic accounts.',
  };

  return `${severityNote} ${notes[name] ?? ''}`;
}

function getAbsentDoshaNote(name: string): string {
  const notes: Record<string, string> = {
    'Mangal Dosha': 'Mars is well-placed, indicating balanced passion and healthy assertion in relationships.',
    'Kaal Sarp Dosha': 'Planets are distributed across the chart, providing a balanced karmic landscape.',
    'Pitra Dosha': 'No significant Sun-Rahu/Saturn affliction detected, indicating smoother ancestral karma.',
    'Shani Sade Sati': 'Saturn is not transiting the sensitive zone around the Moon, indicating a period of relative stability.',
    'Grahan Dosha': 'The luminaries are free from eclipse energy, supporting clear confidence and emotional stability.',
    'Shrapit Dosha': 'Saturn and Rahu do not form a difficult combination, reducing karmic obstacles from past lives.',
  };
  return notes[name] ?? 'No affliction detected in this area.';
}

function generateNakshatraPersonality(nakshatraName: string, pada: number, ruler: Planet): {
  nakshatra: string;
  pada: number;
  ruler: string;
  deity: string;
  symbol: string;
  gana: string;
  personalityTraits: string[];
  emotionalNature: string;
  lifePurpose: string;
} {
  const nakshatraInfo = NAKSHATRAS.find(n => n.name === nakshatraName);
  const deity = nakshatraInfo?.deity ?? 'Unknown';
  const symbol = nakshatraInfo?.symbol ?? 'Unknown';
  const gana = nakshatraInfo?.gana ?? 'Unknown';
  const element = nakshatraInfo?.element ?? 'Fire';

  // Deterministic personality based on nakshatra attributes
  const ganaTraits: Record<string, string[]> = {
    'Deva': ['compassionate', 'spiritual', 'generous', 'truthful'],
    'Manushya': ['practical', 'social', 'adaptable', 'ambitious'],
    'Rakshasa': ['independent', 'intense', 'protective', 'determined'],
  };

  const elementTraits: Record<string, string[]> = {
    'Fire': ['passionate', 'courageous', 'inspiring', 'dynamic'],
    'Earth': ['grounded', 'patient', 'reliable', 'nurturing'],
    'Air': ['intellectual', 'communicative', 'versatile', 'innovative'],
    'Water': ['emotional', 'intuitive', 'empathetic', 'creative'],
  };

  const padaTraits: Record<number, string> = {
    1: 'focused on personal growth and self-expression',
    2: 'emphasizing material security and practical achievement',
    3: 'oriented toward communication and social connection',
    4: 'deeply intuitive and spiritually inclined',
  };

  const personalityTraits = [
    ...(ganaTraits[gana] ?? ['adaptable']),
    ...(elementTraits[element] ?? ['balanced']),
  ];

  return {
    nakshatra: nakshatraName,
    pada,
    ruler,
    deity,
    symbol,
    gana,
    personalityTraits,
    emotionalNature: `Born under ${nakshatraName} (ruled by ${ruler}, presided by ${deity}), your emotional nature is shaped by the ${gana} temperament and ${element.toLowerCase()} element. The symbol "${symbol}" reflects your core psychological pattern. Pada ${pada} makes you ${padaTraits[pada] ?? 'multifaceted'}.`,
    lifePurpose: `Your nakshatra points to a life purpose connected to the energy of ${deity}. The ${symbol} symbol suggests your path involves transforming raw potential into meaningful expression. With ${ruler} as your nakshatra lord, your deepest fulfillment comes through ${getPlanetPurpose(ruler)}.`,
  };
}

function getPlanetPurpose(planet: Planet): string {
  const purposes: Record<string, string> = {
    'Sun': 'expressing your authentic self and illuminating the path for others',
    'Moon': 'nurturing emotional depth and creating safe spaces for healing',
    'Mars': 'channeling courage into constructive action and protecting what matters',
    'Mercury': 'bridging understanding through communication and analytical thinking',
    'Jupiter': 'expanding wisdom and guiding others toward higher truth',
    'Venus': 'bringing beauty, harmony, and love into the world',
    'Saturn': 'building lasting structures and mastering discipline and responsibility',
    'Rahu': 'breaking boundaries and exploring unconventional paths of growth',
    'Ketu': 'releasing attachments and finding spiritual liberation',
  };
  return purposes[planet] ?? 'fulfilling your unique cosmic purpose';
}

function generateAscendantLordAnalysis(
  ascendant: ZodiacSign,
  lordPos: PlanetPosition | undefined,
  ascendantSignIndex: number
): {
  ascendant: string;
  lord: string;
  lordSign: string;
  lordHouse: number;
  lordStrength: string;
  analysis: string;
} {
  const lord = getSignLord(ascendant);
  const lordSign = lordPos?.sign ?? 'Unknown';
  const lordHouse = lordPos ? getHouseFromAscendant(lordPos.signIndex, ascendantSignIndex) : 0;
  const lordStrength = lordPos ? getPlanetaryStrength(lord, lordPos.sign) : 'Unknown';

  const parts: string[] = [];
  parts.push(`Your ascendant is ${ascendant}, and its lord ${lord} is placed in the ${lordHouse}${getOrdinalSuffix(lordHouse)} house in the sign of ${lordSign}.`);

  if (lordStrength === 'Exalted') {
    parts.push(`The ascendant lord is exalted — this gives you a powerful personality, strong vitality, and a natural ability to overcome challenges. You carry yourself with confidence and purpose.`);
  } else if (lordStrength === 'Own Sign') {
    parts.push(`The ascendant lord is in its own sign — this provides stability, resilience, and a well-integrated sense of self. You are comfortable in your own skin and can handle life's ups and downs with grace.`);
  } else if (lordStrength === 'Debilitated') {
    parts.push(`The ascendant lord is debilitated — this indicates that self-confidence and identity may be areas of growth. Through conscious effort and self-awareness, you can transform this challenge into deep self-understanding and empathy.`);
  } else {
    parts.push(`The ascendant lord is in a neutral position — this gives you a balanced personality with room to develop your identity through life experiences.`);
  }

  // House-based analysis
  if ([1, 4, 7, 10].includes(lordHouse)) {
    parts.push('Being in a kendra house, the ascendant lord is angular and active, making you action-oriented and visible in the world.');
  } else if ([1, 5, 9].includes(lordHouse)) {
    parts.push('Being in a trikona house, the ascendant lord is in a position of dharma, giving you a sense of purpose and good fortune.');
  } else if ([6, 8, 12].includes(lordHouse)) {
    parts.push('Being in a dushtana house, the ascendant lord\'s energy is channeled into overcoming obstacles and transformation. This creates depth and resilience.');
  }

  return {
    ascendant,
    lord,
    lordSign,
    lordHouse,
    lordStrength,
    analysis: parts.join(' '),
  };
}

// ─── GET Handler ──────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId query parameter is required' },
        { status: 400 }
      );
    }

    // Fetch user data
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        astrology: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // If astrology data exists in DB, use it; otherwise recalculate
    let kundali: ReturnType<typeof calculateKundali> | null = null;

    if (user.profile) {
      try {
        kundali = calculateKundali(
          new Date(user.profile.dateOfBirth),
          user.profile.timeOfBirth,
          user.profile.latitude ?? 28.6139,
          user.profile.longitude ?? 77.2090,
          parseFloat(user.profile.timezone ?? '5.5')
        );
      } catch (error) {
        console.error('[Vedic Analysis] Recalculation error:', error);
      }
    }

    // Also try to parse existing astrology data from DB
    if (!kundali && user.astrology) {
      // We have stored data but need to recalculate for full analysis
      // Since stored data may not have all the new yogas/doshas
      if (user.profile) {
        try {
          kundali = calculateKundali(
            new Date(user.profile.dateOfBirth),
            user.profile.timeOfBirth,
            user.profile.latitude ?? 28.6139,
            user.profile.longitude ?? 77.2090,
            parseFloat(user.profile.timezone ?? '5.5')
          );
        } catch {
          // Fall through
        }
      }
    }

    if (!kundali) {
      return NextResponse.json(
        { success: false, error: 'Unable to calculate astrology data. Please ensure birth details are complete.' },
        { status: 400 }
      );
    }

    // ── Generate Deterministic Analysis ─────────────────────────────────────

    // 1. House-by-house analysis
    const houseAnalysis = generateHouseAnalysis(
      kundali.houses,
      kundali.planetaryPositions,
      kundali.ascendantData.signIndex
    );

    // 2. Yoga interpretations
    const yogaInterpretations = generateYogaInterpretations(kundali.yogas);

    // 3. Dosha interpretations
    const doshaInterpretations = generateDoshaInterpretations(kundali.doshas);

    // 4. Nakshatra personality
    const nakshatraPersonality = generateNakshatraPersonality(
      kundali.nakshatra.name,
      kundali.nakshatra.pada,
      kundali.nakshatra.ruler
    );

    // 5. Planetary strength assessment
    const planetaryStrengths = Object.entries(kundali.planetaryPositions).map(
      ([planet, pos]) => ({
        planet,
        sign: pos.sign,
        degree: pos.degreeInSign.toFixed(2),
        nakshatra: pos.nakshatra,
        nakshatraPada: pos.nakshatraPada,
        house: getHouseFromAscendant(pos.signIndex, kundali.ascendantData.signIndex),
        strength: getPlanetaryStrength(planet as Planet, pos.sign),
        isRetrograde: pos.isRetrograde,
        isCombust: pos.isCombust,
        analysis: getStrengthDescription(getPlanetaryStrength(planet as Planet, pos.sign)),
      })
    );

    // 6. Ascendant lord analysis
    const ascendantLord = getSignLord(kundali.ascendant);
    const ascendantLordPos = kundali.planetaryPositions[ascendantLord];
    const ascendantLordAnalysis = generateAscendantLordAnalysis(
      kundali.ascendant,
      ascendantLordPos,
      kundali.ascendantData.signIndex
    );

    // 7. Current Dasha interpretation
    const currentDasha = kundali.dashaPeriods.currentMahadasha;
    const currentAntardasha = kundali.dashaPeriods.currentAntardasha;

    let dashaInterpretation: {
      mahadashaPlanet: string | null;
      antardashaPlanet: string | null;
      mahadashaStartDate: string | null;
      mahadashaEndDate: string | null;
      generalEffect: string;
      areasAffected: string[];
      interpretation: string;
    };

    if (currentDasha) {
      const dashaInfo = getDashaInterpretation(currentDasha.planet);
      const antardashaInfo = currentAntardasha
        ? getDashaInterpretation(currentAntardasha.planet)
        : null;

      dashaInterpretation = {
        mahadashaPlanet: currentDasha.planet,
        antardashaPlanet: currentAntardasha?.planet ?? null,
        mahadashaStartDate: currentDasha.startDate.toISOString(),
        mahadashaEndDate: currentDasha.endDate.toISOString(),
        generalEffect: dashaInfo.generalEffect,
        areasAffected: dashaInfo.areasAffected,
        interpretation: `You are currently in the ${currentDasha.planet} Mahadasha${currentAntardasha ? ` with ${currentAntardasha.planet} Antardasha` : ''}. ${dashaInfo.generalEffect}. ${antardashaInfo ? `The ${currentAntardasha.planet} sub-period adds a layer of ${antardashaInfo.generalEffect.toLowerCase()}.` : ''} This period affects: ${dashaInfo.areasAffected.join(', ')}.`,
      };
    } else {
      dashaInterpretation = {
        mahadashaPlanet: null,
        antardashaPlanet: null,
        mahadashaStartDate: null,
        mahadashaEndDate: null,
        generalEffect: 'No current dasha period identified',
        areasAffected: [],
        interpretation: 'The current dasha period could not be determined from the birth chart data.',
      };
    }

    // 8. Summary counts
    const presentYogas = kundali.yogas.filter(y => y.present);
    const strongYogas = presentYogas.filter(y => y.strength === 'Strong');
    const moderateYogas = presentYogas.filter(y => y.strength === 'Moderate');
    const presentDoshas = kundali.doshas.filter(d => d.present);
    const highDoshas = presentDoshas.filter(d => d.severity === 'High');

    const processingTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      processingTimeMs: processingTime,
      data: {
        // Basic chart info
        sunSign: kundali.sunSign,
        moonSign: kundali.moonSign,
        ascendant: kundali.ascendant,
        ayanamsa: kundali.ayanamsa,

        // Comprehensive analyses
        houseAnalysis,
        yogaInterpretations,
        doshaInterpretations,
        nakshatraPersonality,
        planetaryStrengths,
        ascendantLordAnalysis,
        dashaInterpretation,

        // Summary
        summary: {
          totalYogas: kundali.yogas.length,
          presentYogas: presentYogas.length,
          strongYogas: strongYogas.length,
          moderateYogas: moderateYogas.length,
          absentYogas: kundali.yogas.length - presentYogas.length,
          totalDoshas: kundali.doshas.length,
          presentDoshas: presentDoshas.length,
          highSeverityDoshas: highDoshas.length,
          overallChartStrength: calculateOverallStrength(presentYogas, presentDoshas, planetaryStrengths),
        },
      },
    });
  } catch (error) {
    console.error('[Vedic Analysis API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate Vedic analysis' },
      { status: 500 }
    );
  }
}

// ─── Overall Strength Calculator ─────────────────────────────────────────────

function calculateOverallStrength(
  presentYogas: YogaData[],
  presentDoshas: DoshaData[],
  planetaryStrengths: Array<{ strength: string }>
): 'Excellent' | 'Good' | 'Average' | 'Challenging' {
  let score = 50; // Base score

  // Add points for yogas
  for (const yoga of presentYogas) {
    if (yoga.strength === 'Strong') score += 10;
    else if (yoga.strength === 'Moderate') score += 5;
    else score += 2;
  }

  // Subtract points for doshas
  for (const dosha of presentDoshas) {
    if (dosha.severity === 'High') score -= 10;
    else if (dosha.severity === 'Medium') score -= 5;
    else score -= 2;
  }

  // Add points for strong planets
  for (const ps of planetaryStrengths) {
    if (ps.strength === 'Exalted') score += 5;
    else if (ps.strength === 'Own Sign') score += 3;
    else if (ps.strength === 'Debilitated') score -= 3;
  }

  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Average';
  return 'Challenging';
}
