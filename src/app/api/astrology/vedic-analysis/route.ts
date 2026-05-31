import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { calculateKundali, initializeSwissEphemeris } from '@/lib/astrology';
import {
  type PlanetPosition,
  type HouseData,
  type YogaData,
  type DoshaData,
  type ZodiacSign,
  type Planet,
  ZODIAC_SIGNS,
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
  getPermanentRelationship,
  getDebilitation,
  MOOLATRIKONA,
  COMBUSTION_DEGREES,
  isCombust,
  angularDistance,
  NUM_SIGNS,
} from '@/lib/astrology/utils';
import { HOUSE_SIGNIFICANCES } from '@/lib/astrology/charts';
import { NAKSHATRAS, getYoniMatch } from '@/lib/astrology/nakshatra';
import { getDashaInterpretation } from '@/lib/astrology/dasha';

// ─── DUSHTANA HOUSES ─────────────────────────────────────────────────────────
const DUSHTANA_HOUSES = [6, 8, 12];
const UPAACHAYA_HOUSES = [3, 6, 10, 11];

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

// ─── 1. Planetary Aspects (Drishti) Analysis ──────────────────────────────────

/** Vedic planetary aspect houses: planet -> additional houses it aspects beyond 7th */
const PLANETARY_ASPECTS: Record<string, number[]> = {
  'Sun': [],
  'Moon': [],
  'Mars': [4, 8],
  'Mercury': [],
  'Jupiter': [5, 9],
  'Venus': [],
  'Saturn': [3, 10],
  'Rahu': [5, 9], // Rahu aspects like Jupiter in some traditions
  'Ketu': [5, 9], // Ketu aspects like Jupiter
};

function generatePlanetaryAspects(
  positions: Record<string, PlanetPosition>,
  ascendantSignIndex: number
): Array<{
  planet: string;
  sign: string;
  house: number;
  aspects: Array<{
    targetPlanet: string;
    targetSign: string;
    targetHouse: number;
    aspectType: string;
    interpretation: string;
  }>;
}> {
  const planetNames = Object.keys(positions);
  const results: Array<{
    planet: string;
    sign: string;
    house: number;
    aspects: Array<{
      targetPlanet: string;
      targetSign: string;
      targetHouse: number;
      aspectType: string;
      interpretation: string;
    }>;
  }> = [];

  for (const planet of planetNames) {
    const pos = positions[planet];
    if (!pos) continue;

    const planetHouse = getHouseFromAscendant(pos.signIndex, ascendantSignIndex);
    const aspectHouses = [7, ...(PLANETARY_ASPECTS[planet] ?? [])];
    const planetAspects: Array<{
      targetPlanet: string;
      targetSign: string;
      targetHouse: number;
      aspectType: string;
      interpretation: string;
    }> = [];

    for (const targetPlanet of planetNames) {
      if (targetPlanet === planet) continue;
      const targetPos = positions[targetPlanet];
      if (!targetPos) continue;

      const targetHouse = getHouseFromAscendant(targetPos.signIndex, ascendantSignIndex);
      const housesFromPlanet = ((targetHouse - planetHouse) % NUM_SIGNS + NUM_SIGNS) % NUM_SIGNS;

      // Check if this house is aspected
      if (housesFromPlanet === 7 || (PLANETARY_ASPECTS[planet] ?? []).includes(housesFromPlanet)) {
        const aspectType = housesFromPlanet === 7 ? '7th House (Full)' : `${housesFromPlanet}th House (Special)`;
        const isBenefic = ['Jupiter', 'Venus', 'Mercury', 'Moon'].includes(planet);
        const aspectInterpretation = getAspectInterpretation(planet, targetPlanet, aspectType, isBenefic);

        planetAspects.push({
          targetPlanet,
          targetSign: targetPos.sign,
          targetHouse,
          aspectType,
          interpretation: aspectInterpretation,
        });
      }
    }

    results.push({
      planet,
      sign: pos.sign,
      house: planetHouse,
      aspects: planetAspects,
    });
  }

  return results;
}

function getAspectInterpretation(
  aspectingPlanet: string,
  aspectedPlanet: string,
  aspectType: string,
  isBenefic: boolean
): string {
  const beneficNote = isBenefic
    ? `${aspectingPlanet}'s aspect brings supportive, growth-oriented energy to ${aspectedPlanet}`
    : `${aspectingPlanet}'s aspect brings challenging, transformative energy to ${aspectedPlanet}`;

  const typeNote = aspectType.includes('Full')
    ? 'through the full 7th house aspect (drishti), which is the most powerful planetary aspect.'
    : `through its special ${aspectType.split(' ')[0]} aspect, which is unique to ${aspectingPlanet} in Vedic astrology.`;

  const effectNote = isBenefic
    ? `This generally strengthens ${aspectedPlanet}'s positive expressions.`
    : `This may create tension that pushes ${aspectedPlanet} toward growth through challenge.`;

  return `${beneficNote} ${typeNote} ${effectNote}`;
}

// ─── 2. Planetary Dignity Details ─────────────────────────────────────────────

/** Friendly signs for each planet */
const FRIENDLY_SIGNS: Record<string, ZodiacSign[]> = {
  'Sun': ['Aries', 'Sagittarius', 'Leo', 'Cancer', 'Scorpio', 'Pisces'],
  'Moon': ['Aries', 'Leo', 'Sagittarius', 'Taurus', 'Gemini', 'Virgo'],
  'Mars': ['Aries', 'Leo', 'Sagittarius', 'Cancer', 'Scorpio', 'Pisces'],
  'Mercury': ['Taurus', 'Gemini', 'Virgo', 'Libra', 'Aquarius', 'Capricorn'],
  'Jupiter': ['Aries', 'Leo', 'Sagittarius', 'Cancer', 'Scorpio', 'Pisces'],
  'Venus': ['Taurus', 'Gemini', 'Virgo', 'Libra', 'Aquarius', 'Capricorn'],
  'Saturn': ['Taurus', 'Gemini', 'Virgo', 'Libra', 'Aquarius', 'Capricorn'],
  'Rahu': ['Gemini', 'Virgo', 'Aquarius', 'Taurus', 'Libra'],
  'Ketu': ['Sagittarius', 'Pisces', 'Scorpio', 'Aries', 'Leo'],
};

/** Enemy signs for each planet */
const ENEMY_SIGNS: Record<string, ZodiacSign[]> = {
  'Sun': ['Libra', 'Aquarius', 'Capricorn'],
  'Moon': ['Scorpio', 'Capricorn', 'Aquarius'],
  'Mars': ['Gemini', 'Virgo', 'Libra'],
  'Mercury': ['Aries', 'Leo', 'Sagittarius', 'Cancer', 'Scorpio', 'Pisces'],
  'Jupiter': ['Taurus', 'Gemini', 'Virgo', 'Libra', 'Capricorn', 'Aquarius'],
  'Venus': ['Aries', 'Leo', 'Sagittarius', 'Cancer', 'Scorpio', 'Pisces'],
  'Saturn': ['Aries', 'Leo', 'Sagittarius', 'Cancer', 'Scorpio', 'Pisces'],
  'Rahu': ['Aries', 'Leo', 'Sagittarius', 'Cancer', 'Scorpio', 'Pisces'],
  'Ketu': ['Taurus', 'Gemini', 'Virgo', 'Libra', 'Capricorn', 'Aquarius'],
};

function getSignRelationship(planet: string, sign: ZodiacSign): 'Friendly' | 'Enemy' | 'Neutral' {
  const friends = FRIENDLY_SIGNS[planet] ?? [];
  const enemies = ENEMY_SIGNS[planet] ?? [];
  if (friends.includes(sign)) return 'Friendly';
  if (enemies.includes(sign)) return 'Enemy';
  return 'Neutral';
}

function generateDignityDetails(
  positions: Record<string, PlanetPosition>,
  ascendantSignIndex: number
): Array<{
  planet: string;
  sign: string;
  degree: number;
  house: number;
  dignity: string;
  exaltedSign: string;
  exaltedDegree: number;
  debilitatedSign: string;
  debilitatedDegree: number;
  moolatrikonaSign: string;
  ownSigns: string[];
  signRelationship: string;
  isCombust: boolean;
  combustionDegree: number | null;
  distanceFromSun: number | null;
  isRetrograde: boolean;
  retrogradeNote: string;
  interpretation: string;
}> {
  const sunPos = positions['Sun'];
  const results: Array<{
    planet: string;
    sign: string;
    degree: number;
    house: number;
    dignity: string;
    exaltedSign: string;
    exaltedDegree: number;
    debilitatedSign: string;
    debilitatedDegree: number;
    moolatrikonaSign: string;
    ownSigns: string[];
    signRelationship: string;
    isCombust: boolean;
    combustionDegree: number | null;
    distanceFromSun: number | null;
    isRetrograde: boolean;
    retrogradeNote: string;
    interpretation: string;
  }> = [];

  for (const [planet, pos] of Object.entries(positions)) {
    const exaltData = EXALTATION[planet];
    const debilData = getDebilitation(planet);
    const moolatrikona = MOOLATRIKONA[planet] ?? '';
    const ownSigns = getOwnSigns(planet);
    const signRel = getSignRelationship(planet, pos.sign);
    const dignity = getPlanetaryStrength(planet as Planet, pos.sign);
    const house = getHouseFromAscendant(pos.signIndex, ascendantSignIndex);

    // Combustion details
    let isCombustPlanet = pos.isCombust;
    let combustDeg: number | null = COMBUSTION_DEGREES[planet] ?? null;
    let distFromSun: number | null = null;
    if (sunPos && planet !== 'Sun' && planet !== 'Rahu' && planet !== 'Ketu') {
      distFromSun = Math.round(angularDistance(pos.siderealLongitude, sunPos.siderealLongitude) * 10) / 10;
    }

    // Retrograde note
    const retroNote = pos.isRetrograde
      ? `${planet} is retrograde (Vakri), meaning its energy turns inward. This creates deep internalization of ${planet}'s qualities — what is normally expressed outward becomes a rich inner experience. Retrograde periods often revisit past karmic themes.`
      : `${planet} is direct (Margi), expressing its energy in the normal forward direction.`;

    // Build interpretation
    const parts: string[] = [];
    parts.push(`${planet} is in ${pos.sign} at ${pos.degreeInSign.toFixed(1)}° (${dignity}), occupying the ${house}${getOrdinalSuffix(house)} house.`);

    if (dignity === 'Exalted') {
      parts.push(`At its exaltation point (${exaltData?.sign} ${exaltData?.degree}°), ${planet} expresses its highest potential. The energy is powerful and constructive.`);
    } else if (dignity === 'Debilitated') {
      parts.push(`Debilitated in ${pos.sign}, ${planet}'s energy needs conscious effort to express positively. This is not a curse — it is an invitation for deep personal growth through the themes ${planet} governs.`);
    } else if (dignity === 'Own Sign') {
      parts.push(`In its own sign, ${planet} is strong and comfortable. It can express its core energy without obstruction.`);
    } else if (dignity === 'Moolatrikona') {
      parts.push(`In its Moolatrikona sign, ${planet} is nearly as strong as exaltation. It is authoritative and effective.`);
    }

    if (signRel === 'Friendly') {
      parts.push(`The sign ${pos.sign} is friendly to ${planet}, providing supportive conditions.`);
    } else if (signRel === 'Enemy') {
      parts.push(`The sign ${pos.sign} is inimical to ${planet}, creating some resistance that requires adaptation.`);
    }

    if (isCombustPlanet) {
      parts.push(`${planet} is combust (within ${combustDeg}° of the Sun), which weakens its independent expression. Combustion can make ${planet}'s energies feel overshadowed by the solar principle of self and authority.`);
    }

    results.push({
      planet,
      sign: pos.sign,
      degree: Math.round(pos.degreeInSign * 100) / 100,
      house,
      dignity,
      exaltedSign: exaltData?.sign ?? '',
      exaltedDegree: exaltData?.degree ?? 0,
      debilitatedSign: debilData?.sign ?? '',
      debilitatedDegree: debilData?.degree ?? 0,
      moolatrikonaSign: moolatrikona,
      ownSigns,
      signRelationship: signRel,
      isCombust: isCombustPlanet,
      combustionDegree: combustDeg,
      distanceFromSun: distFromSun,
      isRetrograde: pos.isRetrograde,
      retrogradeNote: retroNote,
      interpretation: parts.join(' '),
    });
  }

  return results;
}

function getOwnSigns(planet: string): string[] {
  const map: Record<string, string[]> = {
    'Sun': ['Leo'],
    'Moon': ['Cancer'],
    'Mars': ['Aries', 'Scorpio'],
    'Mercury': ['Gemini', 'Virgo'],
    'Jupiter': ['Sagittarius', 'Pisces'],
    'Venus': ['Taurus', 'Libra'],
    'Saturn': ['Capricorn', 'Aquarius'],
  };
  return map[planet] ?? [];
}

// ─── 3. Enhanced House Lord Placement Analysis ────────────────────────────────

function generateEnhancedHouseLordAnalysis(
  houses: HouseData[],
  positions: Record<string, PlanetPosition>,
  ascendantSignIndex: number
): Array<{
  houseNumber: number;
  houseName: string;
  houseSign: string;
  lord: string;
  lordSign: string;
  lordHouse: number;
  lordDignity: string;
  lordSignRelationship: string;
  lordHouseType: string;
  significance: string;
  interpretation: string;
}> {
  return houses.map(house => {
    const significance = HOUSE_SIGNIFICANCES.find(h => h.number === house.houseNumber);
    const houseName = significance?.name ?? `House ${house.houseNumber}`;
    const lord = getSignLord(house.sign);
    const lordPos = positions[lord];
    const lordSign = lordPos?.sign ?? 'Unknown';
    const lordHouse = lordPos ? getHouseFromAscendant(lordPos.signIndex, ascendantSignIndex) : 0;
    const lordDignity = lordPos ? getPlanetaryStrength(lord, lordPos.sign) : 'Unknown';
    const lordSignRel = lordPos ? getSignRelationship(lord, lordPos.sign) : 'Unknown';

    // Determine house type
    let lordHouseType = 'Ordinary';
    if (KENDRA_HOUSES.includes(lordHouse)) lordHouseType = 'Kendra (Angular)';
    else if (TRIKONA_HOUSES.includes(lordHouse)) lordHouseType = 'Trikona (Trinal)';
    else if (DUSHTANA_HOUSES.includes(lordHouse)) lordHouseType = 'Dushtana (Challenging)';
    else if (UPAACHAYA_HOUSES.includes(lordHouse)) lordHouseType = 'Upaachaya (Growth)';

    // Build interpretation
    const parts: string[] = [];
    parts.push(`The ${houseName} house (${house.sign}) is ruled by ${lord}, who is placed in the ${lordHouse}${getOrdinalSuffix(lordHouse)} house in ${lordSign}.`);

    // Dignity effect
    if (lordDignity === 'Exalted') {
      parts.push(`The lord is exalted — this is extremely favorable for the affairs of this house (${significance?.significations.slice(0, 3).join(', ')}). These areas of life receive powerful, positive energy.`);
    } else if (lordDignity === 'Debilitated') {
      parts.push(`The lord is debilitated — this creates challenges for the affairs of this house, but also provides the impetus for extraordinary growth through effort. The struggles in ${significance?.significations.slice(0, 2).join(' and ')} become the source of your deepest wisdom.`);
    } else if (lordDignity === 'Own Sign') {
      parts.push(`The lord is in its own sign — this provides stability and strength to the affairs of this house. ${significance?.significations.slice(0, 2).join(' and ')} are well-supported.`);
    } else if (lordDignity === 'Moolatrikona') {
      parts.push(`The lord is in its Moolatrikona — nearly as strong as exaltation, providing excellent support for the house's affairs.`);
    }

    // Sign relationship
    if (lordSignRel === 'Friendly') {
      parts.push(`The lord is in a friendly sign, adding comfort and ease to its expression.`);
    } else if (lordSignRel === 'Enemy') {
      parts.push(`The lord is in an inimical sign, requiring adjustment and effort for positive outcomes.`);
    }

    // House type effect
    if (lordHouseType === 'Kendra (Angular)') {
      parts.push(`Being placed in a kendra house, the lord's energy is active, visible, and action-oriented. The house's affairs manifest through direct effort and personal initiative.`);
    } else if (lordHouseType === 'Trikona (Trinal)') {
      parts.push(`Being placed in a trikona house, the lord's energy is dharmic — it brings natural blessings, good fortune, and a sense of purpose to the house's affairs.`);
    } else if (lordHouseType === 'Dushtana (Challenging)') {
      parts.push(`Being placed in a dushtana house, the lord's energy faces challenges. The affairs of this house may involve overcoming obstacles, but this also creates resilience and depth.`);
    } else if (lordHouseType === 'Upaachaya (Growth)') {
      parts.push(`Being placed in an upaachaya house, the lord's energy improves with time and effort. What starts as a challenge in the house's affairs grows stronger with experience.`);
    }

    return {
      houseNumber: house.houseNumber,
      houseName,
      houseSign: house.sign,
      lord,
      lordSign,
      lordHouse,
      lordDignity,
      lordSignRelationship: lordSignRel,
      lordHouseType,
      significance: significance?.significations.join(', ') ?? '',
      interpretation: parts.join(' '),
    };
  });
}

// ─── 4. Nakshatra Compatibility (Koota) ──────────────────────────────────────

function generateNakshatraCompatibility(
  moonNakshatraName: string
): {
  nakshatra: string;
  yoni: string;
  yoniDescription: string;
  gana: string;
  ganaDescription: string;
  nadi: string;
  nadiDescription: string;
  compatibilityNotes: string[];
} {
  const nakshatraInfo = NAKSHATRAS.find(n => n.name === moonNakshatraName);
  if (!nakshatraInfo) {
    return {
      nakshatra: moonNakshatraName,
      yoni: 'Unknown',
      yoniDescription: 'Nakshatra data not found.',
      gana: 'Unknown',
      ganaDescription: 'Nakshatra data not found.',
      nadi: 'Unknown',
      nadiDescription: 'Nakshatra data not found.',
      compatibilityNotes: [],
    };
  }

  const yoni = nakshatraInfo.yoni;
  const gana = nakshatraInfo.gana;

  // Determine Nadi based on nakshatra index
  const nadiIndex = nakshatraInfo.index % 3;
  const nadiTypes = ['Aadi (Vata)', 'Madhya (Pitta)', 'Antya (Kapha)'];
  const nadi = nadiTypes[nadiIndex];

  // Yoni descriptions and compatibility
  const yoniDescriptions: Record<string, string> = {
    'Horse': 'Independent, freedom-loving, energetic. You seek a partner who respects your need for space and matches your vitality.',
    'Elephant': 'Majestic, loyal, protective. You value deep commitment and provide steadfast support in relationships.',
    'Goat': 'Gentle, adaptable, persevering. You thrive in relationships built on mutual care and steady growth.',
    'Serpent': 'Mysterious, intuitive, transformative. You experience relationships as vehicles for deep emotional transformation.',
    'Dog': 'Faithful, protective, devoted. You bring loyalty and emotional security to partnerships.',
    'Cat': 'Independent yet affectionate, selective. You are particular about your partners and value quality over quantity in connections.',
    'Rat': 'Resourceful, adaptable, social. You navigate relationships with cleverness and practical wisdom.',
    'Cow': 'Nurturing, patient, reliable. You offer stability and emotional sustenance to your partnerships.',
    'Buffalo': 'Strong, determined, sensual. You bring intensity and persistence to relationships.',
    'Tiger': 'Bold, passionate, commanding. You need a partner who can match your intensity and respect your strength.',
    'Deer': 'Gentle, graceful, sensitive. You seek harmony and beauty in relationships, preferring gentle connection over intensity.',
    'Monkey': 'Playful, intelligent, versatile. You bring curiosity and adaptability to partnerships, needing mental stimulation.',
    'Lion': 'Regal, courageous, proud. You lead with confidence and seek a partner who appreciates your strength without challenging your dignity.',
  };

  // Gana descriptions
  const ganaDescriptions: Record<string, string> = {
    'Deva': 'Divine temperament — you approach relationships with compassion, generosity, and spiritual awareness. You naturally seek harmony and are inclined toward selfless love. Best matched with Deva or Manushya gana.',
    'Manushya': 'Human temperament — you approach relationships with practicality, social awareness, and ambition. You value mutual effort and shared goals. Compatible with all ganas but most naturally with Manushya or Deva.',
    'Rakshasa': 'Demonic temperament — you approach relationships with intensity, independence, and fierce protectiveness. This is not negative — it means you are self-reliant and deeply committed when you choose to be. Best matched with Rakshasa gana for mutual understanding.',
  };

  // Nadi descriptions
  const nadiDescriptions: Record<string, string> = {
    'Aadi (Vata)': 'Aadi Nadi (Vata-dominant) — your constitutional energy is light, mobile, and creative. In relationships, you bring innovation and quick thinking. Two Aadi Nadi partners may experience excessive restlessness together.',
    'Madhya (Pitta)': 'Madhya Nadi (Pitta-dominant) — your constitutional energy is intense, focused, and transformational. In relationships, you bring passion and depth. Two Madhya Nadi partners may experience excessive intensity.',
    'Antya (Kapha)': 'Antya Nadi (Kapha-dominant) — your constitutional energy is stable, nurturing, and enduring. In relationships, you bring loyalty and emotional depth. Two Antya Nadi partners may experience excessive stagnation.',
  };

  // Compatibility notes
  const notes: string[] = [];

  // Yoni compatibility note
  const yoniEnemyMap: Record<string, string> = {
    'Horse': 'Serpent', 'Serpent': 'Horse',
    'Elephant': 'Lion', 'Lion': 'Elephant',
    'Goat': 'Monkey', 'Monkey': 'Goat',
    'Dog': 'Deer', 'Deer': 'Dog',
    'Cat': 'Rat', 'Rat': 'Cat',
    'Cow': 'Tiger', 'Tiger': 'Cow',
    'Buffalo': 'Buffalo',
  };
  notes.push(`Your ${yoni} yoni suggests you are ${yoniDescriptions[yoni]?.split('.')[0] ?? 'unique in your approach to relationships'}. Best yoni matches: same yoni or ${yoniEnemyMap[yoni] ?? 'complementary animal type'} (opposite-attract dynamic).`);

  // Gana compatibility note
  if (gana === 'Deva') {
    notes.push('As a Deva gana, you seek spiritual connection in relationships. Partners with Deva or Manushya gana resonate naturally with your values.');
  } else if (gana === 'Manushya') {
    notes.push('As a Manushya gana, you value practical partnership and shared growth. You are the most flexible in gana compatibility, adapting well to Deva or Rakshasa partners.');
  } else {
    notes.push('As a Rakshasa gana, you need a partner who respects your fierce independence. Fellow Rakshasa gana partners understand your intensity best.');
  }

  // Nadi compatibility note
  if (nadiIndex === 0) {
    notes.push('With Aadi Nadi, avoid partners who also have Aadi Nadi — this combination traditionally indicates potential health concerns in the partnership. Madhya or Antya Nadi partners are preferred.');
  } else if (nadiIndex === 1) {
    notes.push('With Madhya Nadi, avoid partners who also have Madhya Nadi for the same reason. Aadi or Antya Nadi partners bring better constitutional balance.');
  } else {
    notes.push('With Antya Nadi, avoid partners who also have Antya Nadi. Aadi or Madhya Nadi partners create a more dynamic constitutional balance.');
  }

  return {
    nakshatra: moonNakshatraName,
    yoni,
    yoniDescription: yoniDescriptions[yoni] ?? `The ${yoni} yoni represents a unique approach to relationships.`,
    gana,
    ganaDescription: ganaDescriptions[gana] ?? `The ${gana} gana shapes your relationship approach.`,
    nadi,
    nadiDescription: nadiDescriptions[nadi] ?? `Your nadi type influences your constitutional energy in relationships.`,
    compatibilityNotes: notes,
  };
}

// ─── 5. Current Transit Influence ─────────────────────────────────────────────

function generateCurrentTransitInfluence(
  positions: Record<string, PlanetPosition>,
  moonSign: ZodiacSign,
  ascendantSignIndex: number
): {
  transitDate: string;
  transits: Array<{
    planet: string;
    transitSign: string;
    transitHouse: number;
    natalAspect: string;
    influence: string;
    isMajor: boolean;
  }>;
  sadeSatiStatus: {
    isActive: boolean;
    phase: string;
    description: string;
  };
  dhaiyaStatus: {
    isActive: boolean;
    description: string;
  };
  jupiterTransitToMoon: {
    house: number;
    description: string;
  };
} {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed

  // Deterministic transit positions based on current date
  // These are approximate sign positions for 2025-2027
  const transitPositions = getDeterministicTransitPositions(year, month);

  const transits: Array<{
    planet: string;
    transitSign: string;
    transitHouse: number;
    natalAspect: string;
    influence: string;
    isMajor: boolean;
  }> = [];

  for (const [planet, transitSign] of Object.entries(transitPositions)) {
    const transitSignIndex = ZODIAC_SIGNS.indexOf(transitSign as ZodiacSign);
    const transitHouse = getHouseFromAscendant(transitSignIndex, ascendantSignIndex);

    const natalPlanetPos = positions[planet];
    const natalAspect = natalPlanetPos
      ? `Transiting ${transitSign}, natal position: ${natalPlanetPos.sign}`
      : `Transiting ${transitSign}`;

    const influence = getTransitHouseInfluence(planet, transitHouse);
    const isMajor = ['Saturn', 'Jupiter', 'Rahu', 'Ketu'].includes(planet);

    transits.push({
      planet,
      transitSign,
      transitHouse,
      natalAspect,
      influence,
      isMajor,
    });
  }

  // Sade Sati check: Saturn transiting 12th, 1st, or 2nd from natal Moon
  const moonSignIndex = ZODIAC_SIGNS.indexOf(moonSign);
  const saturnTransitSign = transitPositions['Saturn'];
  const saturnTransitIndex = ZODIAC_SIGNS.indexOf(saturnTransitSign as ZodiacSign);
  const saturnFromMoon = ((saturnTransitIndex - moonSignIndex) % NUM_SIGNS + NUM_SIGNS) % NUM_SIGNS;

  let sadeSatiActive = false;
  let sadeSatiPhase = 'Not Active';
  let sadeSatiDesc = 'Saturn is not transiting the sensitive zone around your natal Moon. This is a period of relative stability.';

  if (saturnFromMoon === 11) {
    sadeSatiActive = true;
    sadeSatiPhase = 'Rising Phase (12th from Moon)';
    sadeSatiDesc = 'Saturn is in the 12th house from your natal Moon — the first phase of Sade Sati has begun. This phase focuses on expenses, losses, and letting go of what no longer serves you. It is a time for spiritual reflection and simplification.';
  } else if (saturnFromMoon === 0) {
    sadeSatiActive = true;
    sadeSatiPhase = 'Peak Phase (Over Moon)';
    sadeSatiDesc = 'Saturn is transiting over your natal Moon — the peak phase of Sade Sati. This is the most intense period, affecting mental peace, emotional stability, and domestic harmony. It demands patience, discipline, and self-care.';
  } else if (saturnFromMoon === 1) {
    sadeSatiActive = true;
    sadeSatiPhase = 'Setting Phase (2nd from Moon)';
    sadeSatiDesc = 'Saturn is in the 2nd house from your natal Moon — the final phase of Sade Sati. This phase affects finances, family relationships, and speech. The intensity is beginning to lift, and lessons learned are starting to integrate.';
  }

  // Dhaiya check: Saturn in 4th or 8th from Moon
  let dhaiyaActive = false;
  let dhaiyaDesc = 'Saturn is not in the 4th or 8th house from your natal Moon. No Dhaiya period is active.';

  if (saturnFromMoon === 3) {
    dhaiyaActive = true;
    dhaiyaDesc = 'Saturn is in the 4th house from your natal Moon (Kantaka Shani). This affects home life, emotional security, and peace of mind. Property matters and maternal relationships may need attention.';
  } else if (saturnFromMoon === 7) {
    dhaiyaActive = true;
    dhaiyaDesc = 'Saturn is in the 8th house from your natal Moon (Ashtama Shani). This affects transformation, hidden matters, and shared resources. This is a period of deep inner change that requires surrender and trust.';
  }

  // Jupiter transit to natal Moon
  const jupiterTransitSign = transitPositions['Jupiter'];
  const jupiterTransitIndex = ZODIAC_SIGNS.indexOf(jupiterTransitSign as ZodiacSign);
  const jupiterFromMoon = ((jupiterTransitIndex - moonSignIndex) % NUM_SIGNS + NUM_SIGNS) % NUM_SIGNS;
  const jupiterHouse = jupiterFromMoon + 1;

  const jupiterHouseDescriptions: Record<number, string> = {
    1: 'Jupiter transiting over your natal Moon brings optimism, emotional growth, and new beginnings. This is a positive period for mental well-being and self-improvement.',
    2: 'Jupiter in the 2nd from Moon enhances financial prospects and family harmony. Speech becomes more impactful and wealth opportunities increase.',
    3: 'Jupiter in the 3rd from Moon brings courage, improved communication, and opportunities through siblings or short travels.',
    4: 'Jupiter in the 4th from Moon brings domestic harmony, educational opportunities, and emotional fulfillment. Property matters are favored.',
    5: 'Jupiter in the 5th from Moon is excellent for creativity, romance, children, and intellectual pursuits. A period of joy and self-expression.',
    6: 'Jupiter in the 6th from Moon helps overcome enemies and diseases. Health improves through discipline, and service brings rewards.',
    7: 'Jupiter in the 7th from Moon favors partnerships, marriage, and business relationships. Social connections bring opportunities.',
    8: 'Jupiter in the 8th from Moon brings transformative experiences and potential inheritance. Research and occult studies are favored.',
    9: 'Jupiter in the 9th from Moon is highly auspicious — it brings fortune, spiritual growth, and higher learning. A period of blessings.',
    10: 'Jupiter in the 10th from Moon elevates career and public reputation. Professional opportunities and recognition increase.',
    11: 'Jupiter in the 11th from Moon brings gains, fulfillment of desires, and expanded social networks. Income and friendships flourish.',
    12: 'Jupiter in the 12th from Moon brings spiritual insights but may increase expenses. Meditation and charitable activities are favored.',
  };

  return {
    transitDate: now.toISOString().split('T')[0],
    transits,
    sadeSatiStatus: {
      isActive: sadeSatiActive,
      phase: sadeSatiPhase,
      description: sadeSatiDesc,
    },
    dhaiyaStatus: {
      isActive: dhaiyaActive,
      description: dhaiyaDesc,
    },
    jupiterTransitToMoon: {
      house: jupiterHouse,
      description: jupiterHouseDescriptions[jupiterHouse] ?? 'Jupiter transit brings growth and expansion to this area of life.',
    },
  };
}

/** Deterministic transit positions based on year and month */
function getDeterministicTransitPositions(year: number, month: number): Record<string, ZodiacSign> {
  // Approximate sidereal sign positions for slow-moving planets
  // Saturn ~2.5 years per sign, Jupiter ~1 year per sign, Rahu/Ketu ~1.5 years per sign

  // Saturn: Pisces (2025-2028)
  const saturnSign: ZodiacSign = 'Pisces';

  // Jupiter: Gemini (May 2025 - Oct 2025), then Cancer (Oct 2025 - Jun 2026), then Gemini (Jun 2026 - Oct 2026)
  let jupiterSign: ZodiacSign;
  if (year < 2025) {
    jupiterSign = 'Taurus';
  } else if (year === 2025) {
    jupiterSign = month < 9 ? 'Gemini' : 'Cancer';
  } else if (year === 2026) {
    jupiterSign = month < 5 ? 'Cancer' : 'Gemini';
  } else {
    jupiterSign = 'Cancer';
  }

  // Rahu: Pisces (2025-2026), Ketu: Virgo (2025-2026) — always opposite
  const rahuSign: ZodiacSign = 'Pisces';
  const ketuSign: ZodiacSign = 'Virgo';

  // Faster planets: deterministic based on date
  const dayOfYear = Math.floor((new Date(year, month, 1).getTime() - new Date(year, 0, 1).getTime()) / 86400000);
  const sunSignIndex = Math.floor((dayOfYear - 20 + 365) % 365 / 30.44) % 12; // Approximate
  const sunSign = ZODIAC_SIGNS[(sunSignIndex + 11) % 12]; // Offset for sidereal

  // Moon: changes sign every ~2.5 days
  const moonSignIndex = Math.floor(dayOfYear / 2.5) % 12;
  const moonSign = ZODIAC_SIGNS[moonSignIndex];

  // Mars: ~1.5 months per sign
  const marsSignIndex = Math.floor(month / 1.5) % 12;
  const marsSign = ZODIAC_SIGNS[marsSignIndex];

  // Mercury: ~1 month per sign (varies with retrograde)
  const mercurySignIndex = month % 12;
  const mercurySign = ZODIAC_SIGNS[mercurySignIndex];

  // Venus: ~1 month per sign (varies)
  const venusSignIndex = (month + 2) % 12;
  const venusSign = ZODIAC_SIGNS[venusSignIndex];

  return {
    'Saturn': saturnSign,
    'Jupiter': jupiterSign,
    'Rahu': rahuSign,
    'Ketu': ketuSign,
    'Sun': sunSign,
    'Moon': moonSign,
    'Mars': marsSign,
    'Mercury': mercurySign,
    'Venus': venusSign,
  };
}

function getTransitHouseInfluence(planet: string, house: number): string {
  const houseThemes: Record<number, string> = {
    1: 'affects self, personality, health, and new beginnings',
    2: 'affects wealth, speech, family, and values',
    3: 'affects courage, communication, siblings, and skills',
    4: 'affects home, mother, comfort, and education',
    5: 'affects creativity, romance, children, and intelligence',
    6: 'affects health, service, debts, and daily routines',
    7: 'affects partnerships, marriage, business, and foreign travel',
    8: 'affects transformation, inheritance, research, and hidden matters',
    9: 'affects fortune, spirituality, higher education, and dharma',
    10: 'affects career, reputation, authority, and public image',
    11: 'affects gains, friendships, income, and social networks',
    12: 'affects expenses, liberation, foreign travel, and sleep',
  };

  const planetEffects: Record<string, string> = {
    'Saturn': 'Saturn\'s transit brings discipline, delays, and maturation. It demands patience and rewards sustained effort.',
    'Jupiter': 'Jupiter\'s transit brings expansion, wisdom, and opportunities. It favors growth, learning, and spiritual development.',
    'Rahu': 'Rahu\'s transit brings ambition, illusions, and unconventional paths. It amplifies desires and can create obsession or innovation.',
    'Ketu': 'Ketu\'s transit brings detachment, spiritual insights, and letting go. It dissolves what is inessential and reveals deeper truths.',
    'Mars': 'Mars\'s transit brings energy, courage, and potential conflict. It activates drive and can create both initiative and impatience.',
    'Venus': 'Venus\'s transit brings harmony, beauty, and pleasure. It favors relationships, creativity, and material comfort.',
    'Mercury': 'Mercury\'s transit brings communication, analysis, and adaptability. It favors intellectual pursuits, business, and travel.',
    'Sun': 'Sun\'s transit brings vitality, authority, and self-expression. It illuminates the house it transits and brings recognition.',
    'Moon': 'Moon\'s transit brings emotional shifts, intuition, and domestic focus. It affects mental state and close relationships.',
  };

  const effect = planetEffects[planet] ?? `${planet}'s transit activates this area of life.`;
  const theme = houseThemes[house] ?? 'affects this area of life';

  return `${effect} Transiting the ${house}${getOrdinalSuffix(house)} house, it ${theme}.`;
}

// ─── 6. Shadbala (Simplified) ─────────────────────────────────────────────────

function generateShadbala(
  positions: Record<string, PlanetPosition>,
  ascendantSignIndex: number
): Array<{
  planet: string;
  sign: string;
  house: number;
  positionalStrength: number;
  directionalStrength: number;
  totalStrength: number;
  strengthRating: string;
  interpretation: string;
}> {
  const results: Array<{
    planet: string;
    sign: string;
    house: number;
    positionalStrength: number;
    directionalStrength: number;
    totalStrength: number;
    strengthRating: string;
    interpretation: string;
  }> = [];

  for (const [planet, pos] of Object.entries(positions)) {
    const house = getHouseFromAscendant(pos.signIndex, ascendantSignIndex);

    // Positional strength (based on sign placement)
    let positionalStrength = 3; // Neutral base
    const dignity = getPlanetaryStrength(planet as Planet, pos.sign);
    switch (dignity) {
      case 'Exalted': positionalStrength = 7; break;
      case 'Own Sign': positionalStrength = 6; break;
      case 'Moolatrikona': positionalStrength = 5.5; break;
      case 'Debilitated': positionalStrength = 1; break;
      default: positionalStrength = 3; break;
    }

    // Sign relationship bonus
    const signRel = getSignRelationship(planet, pos.sign);
    if (signRel === 'Friendly') positionalStrength += 1;
    else if (signRel === 'Enemy') positionalStrength -= 0.5;

    // Degree-based strength: closer to exaltation degree = stronger
    const exaltData = EXALTATION[planet];
    if (exaltData && exaltData.sign === pos.sign) {
      const degreeDiff = Math.abs(pos.degreeInSign - exaltData.degree);
      positionalStrength += Math.max(0, (15 - degreeDiff) / 15);
    }

    // Directional strength (Dig Bala)
    let directionalStrength = 0;
    switch (planet) {
      case 'Sun':
      case 'Mars':
        directionalStrength = house === 10 ? 1 : (KENDRA_HOUSES.includes(house) ? 0.5 : 0);
        break;
      case 'Moon':
      case 'Venus':
        directionalStrength = house === 4 ? 1 : (KENDRA_HOUSES.includes(house) ? 0.5 : 0);
        break;
      case 'Mercury':
      case 'Jupiter':
        directionalStrength = house === 1 ? 1 : (KENDRA_HOUSES.includes(house) ? 0.5 : 0);
        break;
      case 'Saturn':
        directionalStrength = house === 7 ? 1 : (KENDRA_HOUSES.includes(house) ? 0.5 : 0);
        break;
    }

    // Combustion penalty
    if (pos.isCombust) positionalStrength -= 1.5;

    // Retrograde adjustment (in Vedic astrology, retrograde planets are considered strong)
    if (pos.isRetrograde && planet !== 'Rahu' && planet !== 'Ketu') {
      positionalStrength += 0.5; // Chesta Bala (retrograde strength)
    }

    const totalStrength = Math.round((positionalStrength + directionalStrength) * 10) / 10;

    // Strength rating
    let strengthRating: string;
    if (totalStrength >= 7) strengthRating = 'Very Strong';
    else if (totalStrength >= 5.5) strengthRating = 'Strong';
    else if (totalStrength >= 4) strengthRating = 'Moderate';
    else if (totalStrength >= 2.5) strengthRating = 'Weak';
    else strengthRating = 'Very Weak';

    // Interpretation
    const parts: string[] = [];
    parts.push(`${planet} has a total strength of ${totalStrength}/8 (${strengthRating}).`);

    if (strengthRating === 'Very Strong' || strengthRating === 'Strong') {
      parts.push(`This means ${planet}'s significations are well-supported in your chart. Its energy manifests positively and reliably. The areas of life ruled by ${planet} tend to flow with less resistance.`);
    } else if (strengthRating === 'Moderate') {
      parts.push(`${planet} operates at average strength. Its significations require conscious effort to develop fully. With awareness, you can optimize ${planet}'s energy in your life.`);
    } else {
      parts.push(`${planet} operates below average strength. Its significations need extra attention and remedial effort. This is not a limitation — it is an area where conscious growth yields the most reward. Strengthening ${planet}'s qualities through deliberate practice is beneficial.`);
    }

    if (directionalStrength > 0) {
      parts.push(`${planet} gains directional strength from its house placement, adding potency to its expression.`);
    }

    results.push({
      planet,
      sign: pos.sign,
      house,
      positionalStrength: Math.round(positionalStrength * 10) / 10,
      directionalStrength: Math.round(directionalStrength * 10) / 10,
      totalStrength,
      strengthRating,
      interpretation: parts.join(' '),
    });
  }

  // Sort by total strength descending
  return results.sort((a, b) => b.totalStrength - a.totalStrength);
}

// ─── Original Analysis Generators (preserved) ─────────────────────────────────

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
    // Ensure Swiss Ephemeris is initialized before calculations
    await initializeSwissEphemeris();
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

    // 1. House-by-house analysis (original)
    const houseAnalysis = generateHouseAnalysis(
      kundali.houses,
      kundali.planetaryPositions,
      kundali.ascendantData.signIndex
    );

    // 2. Yoga interpretations (original)
    const yogaInterpretations = generateYogaInterpretations(kundali.yogas);

    // 3. Dosha interpretations (original)
    const doshaInterpretations = generateDoshaInterpretations(kundali.doshas);

    // 4. Nakshatra personality (original)
    const nakshatraPersonality = generateNakshatraPersonality(
      kundali.nakshatra.name,
      kundali.nakshatra.pada,
      kundali.nakshatra.ruler
    );

    // 5. Planetary strength assessment (original)
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

    // 6. Ascendant lord analysis (original)
    const ascendantLord = getSignLord(kundali.ascendant);
    const ascendantLordPos = kundali.planetaryPositions[ascendantLord];
    const ascendantLordAnalysis = generateAscendantLordAnalysis(
      kundali.ascendant,
      ascendantLordPos,
      kundali.ascendantData.signIndex
    );

    // 7. Current Dasha interpretation (original)
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

    // ── NEW: Comprehensive Analysis Sections ────────────────────────────────

    // 8. Planetary Aspects (Drishti)
    const planetaryAspects = generatePlanetaryAspects(
      kundali.planetaryPositions,
      kundali.ascendantData.signIndex
    );

    // 9. Planetary Dignity Details
    const dignityDetails = generateDignityDetails(
      kundali.planetaryPositions,
      kundali.ascendantData.signIndex
    );

    // 10. Enhanced House Lord Placement Analysis
    const enhancedHouseLordAnalysis = generateEnhancedHouseLordAnalysis(
      kundali.houses,
      kundali.planetaryPositions,
      kundali.ascendantData.signIndex
    );

    // 11. Nakshatra Compatibility (Koota)
    const nakshatraCompatibility = generateNakshatraCompatibility(
      kundali.nakshatra.name
    );

    // 12. Current Transit Influence
    const currentTransitInfluence = generateCurrentTransitInfluence(
      kundali.planetaryPositions,
      kundali.moonSign,
      kundali.ascendantData.signIndex
    );

    // 13. Shadbala (Simplified)
    const shadbala = generateShadbala(
      kundali.planetaryPositions,
      kundali.ascendantData.signIndex
    );

    // 14. Summary counts
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

        // Original analyses
        houseAnalysis,
        yogaInterpretations,
        doshaInterpretations,
        nakshatraPersonality,
        planetaryStrengths,
        ascendantLordAnalysis,
        dashaInterpretation,

        // NEW: Comprehensive analyses
        planetaryAspects,
        dignityDetails,
        enhancedHouseLordAnalysis,
        nakshatraCompatibility,
        currentTransitInfluence,
        shadbala,

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
