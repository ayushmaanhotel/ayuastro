/**
 * AyuAstro - Jaimini Karaka System
 *
 * Jaimini astrology is a parallel system to Parashara that uses karakas
 * (significators) based on the highest degree of planets within their signs.
 *
 * The 7 visible planets (Sun through Saturn) are ranked by their degree
 * within their current sign. Rahu and Ketu are NOT included in the
 * Jaimini karaka scheme (they are shadow planets / chaya grahas).
 *
 * Rankings:
 * 1. Atmakaraka  (AK) — Soul significator, highest degree planet
 * 2. Amatyakaraka (AmK) — Minister/career advisor, 2nd highest
 * 3. Bhratrikaraka (BK) — Siblings, 3rd highest
 * 4. Matrikaraka (MK) — Mother, 4th highest
 * 5. Putrakaraka (PK) — Children, 5th highest
 * 6. Gnatikaraka (GK) — Obstacles/disease, 6th highest
 * 7. Darakaraka (DK) — Spouse, lowest degree
 *
 * Special rule: If two planets have the same degree, the one with the
 * higher minute/second takes precedence. In practice, exact ties are
 * extremely rare. When they occur, both planets share the karaka role.
 *
 * Some traditions include an 8th karaka — Pitrukaraka (father) — but
 * this is used only when 8 planets are considered. In the 7-planet
 * scheme, Pitrukaraka is often absorbed into Bhratrikaraka or Matrikaraka.
 *
 * All calculations are DETERMINISTIC: same inputs always produce the same outputs.
 */

import {
  type Planet,
  type ZodiacSign,
  type PlanetPosition,
  ZODIAC_SIGNS,
} from './types';

import {
  getSignAttributes,
  getHouseFromAscendant,
  longitudeToDegreeInSign,
} from './utils';

// ─── Karaka Types ────────────────────────────────────────────────────────────

/** All Jaimini karaka types */
export type KarakaType =
  | 'Atmakaraka'     // Soul, self — the highest degree planet
  | 'Amatyakaraka'   // Minister, career advisor — 2nd highest
  | 'Bhratrikaraka'  // Siblings — 3rd highest
  | 'Matrikaraka'    // Mother — 4th highest
  | 'Putrakaraka'    // Children — 5th highest
  | 'Gnatikaraka'    // Obstacles, disease — 6th highest
  | 'Darakaraka';    // Spouse — lowest degree

/** The 7 visible planets used in Jaimini karaka calculations */
export const JAIMINI_PLANETS: Planet[] = [
  'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'
];

/** Karaka data with interpretation */
export interface KarakaData {
  /** Which karaka type this is */
  type: KarakaType;
  /** The planet serving as this karaka */
  planet: Planet;
  /** Degree of the planet within its sign */
  degree: number;
  /** The sign the planet is in */
  sign: ZodiacSign;
  /** The sign index (0-11) the planet is in */
  signIndex: number;
  /** The house the planet occupies (from ascendant) */
  house: number;
  /** Short description of this karaka's role */
  description: string;
  /** Detailed interpretation based on the planet serving as this karaka */
  interpretation: string;
}

// ─── Karaka Descriptions ─────────────────────────────────────────────────────

/** Role descriptions for each karaka type */
const KARAKA_DESCRIPTIONS: Record<KarakaType, string> = {
  Atmakaraka: 'The soul significator — reveals the soul\'s deepest desire and life purpose. The AK planet shows what the soul came to experience and master in this lifetime.',
  Amatyakaraka: 'The minister significator — reveals career path, professional achievements, and the guiding intelligence behind your life direction.',
  Bhratrikaraka: 'The sibling significator — reveals the nature of siblings, close friendships, and your relationship with courage and initiative.',
  Matrikaraka: 'The mother significator — reveals the nature of your relationship with your mother, maternal figures, and emotional foundation.',
  Putrakaraka: 'The children significator — reveals the nature of children, creative expression, intelligence, and what you bring into the world.',
  Gnatikaraka: 'The obstacle significator — reveals areas of challenge, disease potential, and the karmic obstacles you must overcome for growth.',
  Darakaraka: 'The spouse significator — reveals the nature of your marriage partner, the qualities you seek in partnership, and the path of intimate relationship.',
};

// ─── Atmakaraka Planet Interpretations ───────────────────────────────────────

/** Atmakaraka interpretations for each planet */
const ATMAKARAKA_INTERPRETATIONS: Record<string, string> = {
  Sun: 'Soul desires authority, recognition, and self-expression. You are here to develop leadership, confidence, and the ability to shine independently. Your life purpose involves stepping into your power and inspiring others through your presence. The challenge is to lead without ego and to serve through authority rather than dominate.',
  Moon: 'Soul desires emotional fulfillment, nurturing, and public connection. You are here to develop emotional intelligence, compassion, and the ability to nurture others. Your life purpose involves creating emotional security and connecting deeply with the collective. The challenge is to maintain emotional balance without becoming dependent on others\' validation.',
  Mars: 'Soul desires courage, protection, and decisive action. You are here to develop strength, assertiveness, and the willingness to fight for what is right. Your life purpose involves taking bold action and protecting those who cannot protect themselves. The challenge is to channel aggression constructively and avoid unnecessary conflict.',
  Mercury: 'Soul desires intellectual mastery, communication, and adaptability. You are here to develop sharp intellect, effective communication, and the ability to bridge different worlds through ideas. Your life purpose involves learning, teaching, and using knowledge as a tool for transformation. The challenge is to avoid overthinking and to turn knowledge into wisdom.',
  Jupiter: 'Soul desires wisdom, teaching, and spiritual expansion. You are here to develop higher understanding, generosity, and the ability to guide others toward truth. Your life purpose involves expanding consciousness and sharing the fruits of your spiritual journey. The challenge is to remain humble despite wisdom and to practice what you preach.',
  Venus: 'Soul desires harmony, beauty, and deep relationships. You are here to develop artistic sensibility, the capacity for love, and the ability to create beauty in the world. Your life purpose involves learning about love, partnership, and the transformative power of aesthetic experience. The challenge is to avoid indulgence and to find beauty in substance, not just form.',
  Saturn: 'Soul desires discipline, endurance, and service through struggle. You are here to develop patience, responsibility, and the capacity to endure hardship for meaningful purposes. Your life purpose involves learning through experience, accepting limitations, and finding liberation through discipline. The challenge is to avoid despair and to trust that struggles are the path to spiritual growth.',
};

// ─── Darakaraka Planet Interpretations ───────────────────────────────────────

/** Darakaraka interpretations for each planet */
const DARAKARAKA_INTERPRETATIONS: Record<string, string> = {
  Sun: 'Your spouse is likely authoritative, confident, and charismatic. They may come from a government, noble, or leadership background. They have a strong personality and bring warmth and vitality to the relationship. You seek a partner who radiates confidence and who you can look up to with respect.',
  Moon: 'Your spouse is likely nurturing, emotional, and intuitive. They may be from a caring profession or have strong public connections. They bring emotional depth and sensitivity to the relationship. You seek a partner who is compassionate, understanding, and who creates a sense of home and belonging.',
  Mars: 'Your spouse is likely energetic, athletic, and assertive. They may work in technical, engineering, or defense fields. They bring passion and drive to the relationship. You seek a partner who is strong, decisive, and who matches your energy and enthusiasm for life.',
  Mercury: 'Your spouse is likely intellectual, communicative, and versatile. They may be in business, writing, teaching, or analytical fields. They bring wit, humor, and stimulating conversation to the relationship. You seek a partner who challenges you mentally and with whom you can share ideas endlessly.',
  Jupiter: 'Your spouse is likely wise, traditional, and spiritually inclined. They may be a teacher, counselor, or come from a religious or philosophical background. They bring wisdom, optimism, and moral grounding to the relationship. You seek a partner who expands your horizons and shares your values.',
  Venus: 'Your spouse is likely artistic, refined, and romantic. They may work in creative, design, luxury, or entertainment fields. They bring beauty, grace, and sensuality to the relationship. You seek a partner who appreciates the finer things in life and who shares your love of beauty and harmony.',
  Saturn: 'Your spouse is likely mature, hardworking, and disciplined. They may be older than you or work in structured, government, or technical professions. They bring stability, commitment, and endurance to the relationship. You seek a partner who is reliable and with whom you can build something lasting over time.',
};

// ─── Amatyakaraka Planet Interpretations ─────────────────────────────────────

/** Amatyakaraka interpretations for each planet */
const AMATYAKARAKA_INTERPRETATIONS: Record<string, string> = {
  Sun: 'Your career path involves leadership, government, authority, or positions of visibility. You are drawn to roles where you can shine and be recognized for your individual contributions. Success comes through self-confidence and taking initiative.',
  Moon: 'Your career path involves nurturing, public relations, healthcare, or fields requiring emotional intelligence. You are drawn to roles that involve caring for others or connecting with the public. Success comes through empathy and adaptability.',
  Mars: 'Your career path involves engineering, defense, sports, surgery, or competitive fields. You are drawn to roles requiring courage, initiative, and the ability to act decisively. Success comes through determination and competitive drive.',
  Mercury: 'Your career path involves communication, business, writing, analysis, or technology. You are drawn to roles requiring intellectual agility and the ability to process information. Success comes through adaptability and continuous learning.',
  Jupiter: 'Your career path involves teaching, law, finance, spirituality, or advisory roles. You are drawn to roles requiring wisdom, mentorship, and the ability to guide others. Success comes through knowledge, ethics, and generosity.',
  Venus: 'Your career path involves arts, design, luxury, entertainment, or relationship counseling. You are drawn to roles requiring aesthetic sense, diplomacy, and the ability to create harmony. Success comes through creativity and building beautiful things.',
  Saturn: 'Your career path involves structure, governance, engineering, research, or long-term projects. You are drawn to roles requiring discipline, patience, and the ability to work within systems. Success comes through persistence and mastery over time.',
};

// ─── Bhratrikaraka Planet Interpretations ────────────────────────────────────

const BHRATRIKARAKA_INTERPRETATIONS: Record<string, string> = {
  Sun: 'Your siblings are likely authoritative, confident, and independent. You share a dynamic of mutual respect but potential rivalry. Courage and initiative are the gifts of your sibling relationships.',
  Moon: 'Your siblings are likely emotionally sensitive, caring, and imaginative. You share a nurturing bond with emotional depth. Empathy and intuitive understanding characterize these relationships.',
  Mars: 'Your siblings are likely energetic, competitive, and action-oriented. You share a bond of mutual challenge and growth through action. Physical activities and shared adventures strengthen your connection.',
  Mercury: 'Your siblings are likely intellectual, communicative, and curious. You share a bond built on conversation, shared learning, and intellectual exchange. Communication is the key to maintaining these relationships.',
  Jupiter: 'Your siblings are likely wise, supportive, and protective. They may serve as mentors or guides in your life. Wisdom and shared values form the foundation of your sibling bonds.',
  Venus: 'Your siblings are likely artistic, harmonious, and socially skilled. You share a bond of mutual appreciation and aesthetic enjoyment. Beauty and shared pleasures bring you together.',
  Saturn: 'Your siblings may be older, more disciplined, or distant. There may be a sense of responsibility or separation in the relationship. Patience and time build the deepest bonds with siblings.',
};

// ─── Matrikaraka Planet Interpretations ──────────────────────────────────────

const MATRIKARAKA_INTERPRETATIONS: Record<string, string> = {
  Sun: 'Your mother is a strong, authoritative figure. She may have been the dominant parent, providing both warmth and discipline. Your emotional foundation is built on self-respect and confidence.',
  Moon: 'Your mother is deeply nurturing and emotionally connected. She may be your primary emotional anchor. Your emotional foundation is built on empathy and intuitive understanding.',
  Mars: 'Your mother is energetic, protective, and assertive. She may have been a fighter who shielded you from harm. Your emotional foundation is built on courage and resilience.',
  Mercury: 'Your mother is intellectual, communicative, and versatile. She may have emphasized education and adaptability. Your emotional foundation is built on knowledge and mental flexibility.',
  Jupiter: 'Your mother is wise, generous, and spiritually inclined. She may have been a teacher or guide in your life. Your emotional foundation is built on faith and optimism.',
  Venus: 'Your mother is refined, loving, and aesthetically oriented. She may have emphasized beauty, culture, and refinement. Your emotional foundation is built on love and harmony.',
  Saturn: 'Your mother may have been strict, disciplined, or emotionally reserved. There may have been emotional distance or a sense of responsibility early in life. Your emotional foundation is built on self-reliance and patience.',
};

// ─── Putrakaraka Planet Interpretations ──────────────────────────────────────

const PUTRAKARAKA_INTERPRETATIONS: Record<string, string> = {
  Sun: 'Your children are likely confident, expressive, and independent. They may achieve positions of authority or prominence. Creative self-expression and leadership are themes in your relationship with them.',
  Moon: 'Your children are likely emotionally sensitive, intuitive, and nurturing. They may be drawn to caring professions or public life. Emotional depth and empathy characterize your bond with them.',
  Mars: 'Your children are likely energetic, adventurous, and competitive. They may excel in sports, engineering, or fields requiring courage. Dynamic energy and mutual challenge characterize your bond.',
  Mercury: 'Your children are likely intelligent, curious, and communicative. They may excel in academics, writing, or technology. Intellectual stimulation and shared learning characterize your bond.',
  Jupiter: 'Your children are likely wise, generous, and spiritually inclined. They may become teachers, counselors, or community leaders. Wisdom and shared values characterize your bond with them.',
  Venus: 'Your children are likely artistic, charming, and refined. They may excel in creative fields or social roles. Beauty, creativity, and mutual appreciation characterize your bond.',
  Saturn: 'Your children may be disciplined, mature, or serious. They may take longer to find their path but achieve lasting success. Patience, responsibility, and long-term commitment characterize your bond.',
};

// ─── Gnatikaraka Planet Interpretations ──────────────────────────────────────

const GNATIKARAKA_INTERPRETATIONS: Record<string, string> = {
  Sun: 'Obstacles may come through authority figures, ego conflicts, or overconfidence. Health challenges may relate to vitality, heart, or bones. Overcome through humility and service to others.',
  Moon: 'Obstacles may come through emotional instability, over-sensitivity, or dependency. Health challenges may relate to digestion, fluids, or mental health. Overcome through emotional discipline and self-nurturing.',
  Mars: 'Obstacles may come through impulsiveness, anger, or accidents. Health challenges may relate to blood, inflammation, or injuries. Overcome through patience, strategic thinking, and channeling energy constructively.',
  Mercury: 'Obstacles may come through overthinking, miscommunication, or indecisiveness. Health challenges may relate to nervous system, skin, or respiratory issues. Overcome through decisive action and grounding ideas in practice.',
  Jupiter: 'Obstacles may come through over-optimism, excess, or misplaced trust. Health challenges may relate to liver, weight, or metabolic issues. Overcome through moderation, discernment, and practical wisdom.',
  Venus: 'Obstacles may come through indulgence, relationship conflicts, or seeking pleasure over purpose. Health challenges may relate to reproductive system, kidneys, or sugar. Overcome through discipline in relationships and finding beauty in simplicity.',
  Saturn: 'Obstacles may come through delays, limitations, or isolation. Health challenges may relate to joints, bones, or chronic conditions. Overcome through acceptance, persistent effort, and finding meaning in struggle.',
};

// ─── Combined Interpretation Map ─────────────────────────────────────────────

/** All karaka interpretations combined by karaka type */
const KARAKA_INTERPRETATIONS: Record<KarakaType, Record<string, string>> = {
  Atmakaraka: ATMAKARAKA_INTERPRETATIONS,
  Amatyakaraka: AMATYAKARAKA_INTERPRETATIONS,
  Bhratrikaraka: BHRATRIKARAKA_INTERPRETATIONS,
  Matrikaraka: MATRIKARAKA_INTERPRETATIONS,
  Putrakaraka: PUTRAKARAKA_INTERPRETATIONS,
  Gnatikaraka: GNATIKARAKA_INTERPRETATIONS,
  Darakaraka: DARAKARAKA_INTERPRETATIONS,
};

// ─── Karaka Calculation ──────────────────────────────────────────────────────

/** The ordered sequence of karaka types from highest to lowest degree */
const KARAKA_ORDER: KarakaType[] = [
  'Atmakaraka',    // 1st — highest degree
  'Amatyakaraka',  // 2nd
  'Bhratrikaraka', // 3rd
  'Matrikaraka',   // 4th
  'Putrakaraka',   // 5th
  'Gnatikaraka',   // 6th
  'Darakaraka',    // 7th — lowest degree
];

/**
 * Calculate all Jaimini Karakas from planetary positions.
 *
 * The 7 visible planets (Sun through Saturn) are ranked by their degree
 * within their current sign. Rahu and Ketu are excluded as they are
 * shadow planets (chaya grahas).
 *
 * @param positions - The D1 planetary positions
 * @param ascendantSignIndex - The ascendant sign index (0-11) for house calculation
 * @returns Array of KarakaData with all 7 karakas
 *
 * @example
 * ```typescript
 * const karakas = calculateKarakas(kundali.planetaryPositions, kundali.ascendantData.signIndex);
 * const atmakaraka = karakas.find(k => k.type === 'Atmakaraka');
 * console.log(`Atmakaraka: ${atmakaraka.planet} at ${atmakaraka.degree}° in ${atmakaraka.sign}`);
 * ```
 */
export function calculateKarakas(
  positions: Record<string, PlanetPosition>,
  ascendantSignIndex: number
): KarakaData[] {
  // Step 1: Extract degree-in-sign for each of the 7 visible planets
  const planetDegrees: Array<{
    planet: Planet;
    degree: number;
    sign: ZodiacSign;
    signIndex: number;
  }> = [];

  for (const planetName of JAIMINI_PLANETS) {
    const pos = positions[planetName];
    if (pos) {
      planetDegrees.push({
        planet: planetName as Planet,
        degree: pos.degreeInSign,
        sign: pos.sign,
        signIndex: pos.signIndex,
      });
    }
  }

  // Step 2: Sort by degree in descending order (highest degree first)
  // If two planets have the exact same degree, sort by planet name for determinism
  planetDegrees.sort((a, b) => {
    if (b.degree !== a.degree) return b.degree - a.degree;
    return a.planet.localeCompare(b.planet);
  });

  // Step 3: Assign karaka types based on ranking
  const karakas: KarakaData[] = [];

  for (let i = 0; i < Math.min(planetDegrees.length, KARAKA_ORDER.length); i++) {
    const { planet, degree, sign, signIndex } = planetDegrees[i];
    const karakaType = KARAKA_ORDER[i];
    const house = getHouseFromAscendant(signIndex, ascendantSignIndex);

    karakas.push({
      type: karakaType,
      planet,
      degree,
      sign,
      signIndex,
      house,
      description: KARAKA_DESCRIPTIONS[karakaType],
      interpretation: KARAKA_INTERPRETATIONS[karakaType][planet] ??
        `${planet} as ${karakaType} — this planet serves as your ${karakaType.toLowerCase()}, influencing the areas of life this karaka represents.`,
    });
  }

  return karakas;
}

// ─── Convenience Functions ───────────────────────────────────────────────────

/**
 * Get the Atmakaraka (soul significator) — the planet with the highest degree.
 * This is the most important karaka as it represents the soul's deepest desire.
 *
 * @param positions - The D1 planetary positions
 * @returns The Atmakaraka planet
 */
export function getAtmakaraka(positions: Record<string, PlanetPosition>): Planet {
  let highestDegree = -1;
  let atmakaraka: Planet = 'Sun';

  for (const planetName of JAIMINI_PLANETS) {
    const pos = positions[planetName];
    if (pos && pos.degreeInSign > highestDegree) {
      highestDegree = pos.degreeInSign;
      atmakaraka = planetName as Planet;
    }
  }

  return atmakaraka;
}

/**
 * Get the Darakaraka (spouse significator) — the planet with the lowest degree.
 * This reveals the nature of the marriage partner and relationship dynamics.
 *
 * @param positions - The D1 planetary positions
 * @returns The Darakaraka planet
 */
export function getDarakaraka(positions: Record<string, PlanetPosition>): Planet {
  let lowestDegree = 31; // Higher than max 30
  let darakaraka: Planet = 'Sun';

  for (const planetName of JAIMINI_PLANETS) {
    const pos = positions[planetName];
    if (pos && pos.degreeInSign < lowestDegree) {
      lowestDegree = pos.degreeInSign;
      darakaraka = planetName as Planet;
    }
  }

  return darakaraka;
}

/**
 * Get the Amatyakaraka (career significator) — the planet with the 2nd highest degree.
 * This reveals career path and professional achievements.
 *
 * @param positions - The D1 planetary positions
 * @returns The Amatyakaraka planet
 */
export function getAmatyakaraka(positions: Record<string, PlanetPosition>): Planet {
  const planetDegrees: Array<{ planet: Planet; degree: number }> = [];

  for (const planetName of JAIMINI_PLANETS) {
    const pos = positions[planetName];
    if (pos) {
      planetDegrees.push({
        planet: planetName as Planet,
        degree: pos.degreeInSign,
      });
    }
  }

  // Sort descending by degree
  planetDegrees.sort((a, b) => {
    if (b.degree !== a.degree) return b.degree - a.degree;
    return a.planet.localeCompare(b.planet);
  });

  // Return 2nd highest (index 1)
  return planetDegrees.length >= 2 ? planetDegrees[1].planet : planetDegrees[0]?.planet ?? 'Jupiter';
}

// ─── Jaimini Sign Karakas ────────────────────────────────────────────────────

/**
 * In Jaimini astrology, signs also serve as karakas based on their
 * position from the Atmakaraka. This is used for Jaimini sign aspects
 * and chara karaka analysis.
 */
export const JAIMINI_SIGN_KARAKAS: Record<number, string> = {
  1: 'AK Sign (Self)',
  2: 'DK Sign (Family/Wealth)',
  3: 'BK Sign (Siblings/Effort)',
  4: 'MK Sign (Mother/Comforts)',
  5: 'PK Sign (Children/Intelligence)',
  6: 'GK Sign (Obstacles/Service)',
  7: 'Partner Sign (Marriage)',
  8: 'Longevity Sign (Transformation)',
  9: 'Father Sign (Fortune/Dharma)',
  10: 'Career Sign (Profession)',
  11: 'Gain Sign (Income/Elders)',
  12: 'Loss Sign (Liberation/Expenses)',
};

/**
 * Get the sign that is N houses away from the Atmakaraka sign.
 * Used in Jaimini analysis to determine sign-based karakas.
 *
 * @param atmakarakaSignIndex - The sign index of the Atmakaraka
 * @param housesAway - Number of houses away (1-12)
 * @returns The sign and its index
 */
export function getSignFromAK(
  atmakarakaSignIndex: number,
  housesAway: number
): { sign: ZodiacSign; signIndex: number } {
  const signIndex = (atmakarakaSignIndex + housesAway - 1) % 12;
  return {
    sign: ZODIAC_SIGNS[signIndex],
    signIndex,
  };
}

// ─── Atmakaraka Navamsha Analysis ────────────────────────────────────────────

/**
 * The Atmakaraka's Navamsha sign and its lord provide crucial insights
 * into the soul's purpose and the planet that can help fulfill it.
 */
export interface AtmakarakaNavamshaInfo {
  /** The Atmakaraka planet */
  atmakaraka: Planet;
  /** The AK's degree in its D1 sign */
  degreeInD1: number;
  /** The AK's sign in D1 */
  signInD1: ZodiacSign;
  /** The AK's Navamsha sign */
  navamshaSign: ZodiacSign;
  /** The lord of the AK's Navamsha sign */
  navamshaLord: Planet;
  /** Whether the AK is Vargottama (same sign in D1 and D9) */
  isVargottama: boolean;
  /** Interpretation of the AK's Navamsha position */
  interpretation: string;
}

/** Navamsha interpretations for each Atmakaraka + Navamsha sign combination */
const AK_NAVAMSHA_LORD_INTERPRETATIONS: Record<string, string> = {
  Sun: 'The soul\'s purpose is fulfilled through leadership, self-expression, and gaining recognition. Your path involves developing authority and confidence.',
  Moon: 'The soul\'s purpose is fulfilled through emotional connection, nurturing, and public service. Your path involves developing compassion and emotional intelligence.',
  Mars: 'The soul\'s purpose is fulfilled through courageous action, protection, and technical mastery. Your path involves developing strength and decisive initiative.',
  Mercury: 'The soul\'s purpose is fulfilled through intellectual achievement, communication, and adaptability. Your path involves developing wisdom through learning and teaching.',
  Jupiter: 'The soul\'s purpose is fulfilled through wisdom, spiritual growth, and guiding others. Your path involves developing higher knowledge and generosity of spirit.',
  Venus: 'The soul\'s purpose is fulfilled through creativity, love, and creating harmony. Your path involves developing aesthetic sensitivity and the capacity for deep relationship.',
  Saturn: 'The soul\'s purpose is fulfilled through discipline, endurance, and service. Your path involves developing patience and finding liberation through persistent effort.',
};

/**
 * Analyze the Atmakaraka's position in the Navamsha chart.
 * The Navamsha sign of the AK is called the "Karakamsha" and is one of
 * the most important positions in Jaimini astrology.
 *
 * @param positions - D1 planetary positions
 * @param ascendantSignIndex - The ascendant sign index
 * @param d9Positions - D9 (Navamsha) planetary positions (optional, for Vargottama check)
 * @returns Atmakaraka Navamsha analysis
 */
export function analyzeAtmakarakaNavamsha(
  positions: Record<string, PlanetPosition>,
  ascendantSignIndex: number,
  d9Positions?: Record<string, PlanetPosition>
): AtmakarakaNavamshaInfo {
  const karakas = calculateKarakas(positions, ascendantSignIndex);
  const akData = karakas.find(k => k.type === 'Atmakaraka');

  if (!akData) {
    // Fallback (should never happen if positions has all 7 planets)
    return {
      atmakaraka: 'Sun',
      degreeInD1: 0,
      signInD1: 'Aries',
      navamshaSign: 'Aries',
      navamshaLord: 'Mars',
      isVargottama: false,
      interpretation: 'Unable to determine Atmakaraka.',
    };
  }

  // Calculate the Navamsha sign of the AK
  const akPosition = positions[akData.planet];
  const akSiderealLon = akPosition?.siderealLongitude ?? 0;

  // Use the D9 calculation to find the AK's Navamsha sign
  let navamshaSign: ZodiacSign = akData.sign;
  let navamshaSignIndex = akData.signIndex;

  if (d9Positions) {
    const akD9Pos = d9Positions[akData.planet];
    if (akD9Pos) {
      navamshaSign = akD9Pos.sign;
      navamshaSignIndex = akD9Pos.signIndex;
    }
  } else {
    // Calculate Navamsha sign directly from D1 data
    const normalizedLon = akSiderealLon;
    const signIndex = Math.floor(normalizedLon / 30);
    const degreeInSign = normalizedLon % 30;
    const amsaIndex = Math.min(Math.floor(degreeInSign / (30 / 9)), 8);

    // Navamsha mapping rules
    const signMod = signIndex % 3;
    let startSign: number;
    if (signMod === 0) {
      startSign = signIndex; // Movable
    } else if (signMod === 1) {
      startSign = (signIndex + 8) % 12; // Fixed
    } else {
      startSign = (signIndex + 4) % 12; // Dual
    }
    navamshaSignIndex = (startSign + amsaIndex) % 12;
    navamshaSign = ZODIAC_SIGNS[navamshaSignIndex];
  }

  const navamshaLord = getSignAttributes(navamshaSign).ruler;
  const isVargottama = akData.signIndex === navamshaSignIndex;

  const vargottamaText = isVargottama
    ? ' The Atmakaraka is Vargottama, making the soul\'s purpose exceptionally strong and well-supported.'
    : '';

  const interpretation =
    (ATMAKARAKA_INTERPRETATIONS[akData.planet] ?? '') + ' ' +
    (AK_NAVAMSHA_LORD_INTERPRETATIONS[navamshaLord] ?? '') +
    vargottamaText;

  return {
    atmakaraka: akData.planet,
    degreeInD1: akData.degree,
    signInD1: akData.sign,
    navamshaSign,
    navamshaLord,
    isVargottama,
    interpretation: interpretation.trim(),
  };
}

// ─── Jaimini Raja Yoga Detection ─────────────────────────────────────────────

/**
 * Jaimini Raja Yoga conditions based on karaka placements.
 * These are different from Parashara Raja Yogas.
 */
export interface JaiminiRajaYoga {
  name: string;
  present: boolean;
  description: string;
  involvingPlanets: Planet[];
}

/**
 * Detect Jaimini Raja Yogas based on karaka positions.
 *
 * Key Jaimini Raja Yogas:
 * 1. AK and AmK in Kendra (1,4,7,10) or Trikona (1,5,9) from each other
 * 2. AK and DK in beneficial houses
 * 3. AmK in Kendra from AK
 * 4. Multiple karakas in Kendra from Lagna
 *
 * @param positions - D1 planetary positions
 * @param ascendantSignIndex - The ascendant sign index
 * @returns Array of detected Jaimini Raja Yogas
 */
export function detectJaiminiRajaYogas(
  positions: Record<string, PlanetPosition>,
  ascendantSignIndex: number
): JaiminiRajaYoga[] {
  const karakas = calculateKarakas(positions, ascendantSignIndex);
  const yogas: JaiminiRajaYoga[] = [];

  const ak = karakas.find(k => k.type === 'Atmakaraka');
  const amk = karakas.find(k => k.type === 'Amatyakaraka');
  const dk = karakas.find(k => k.type === 'Darakaraka');
  const pk = karakas.find(k => k.type === 'Putrakaraka');

  if (!ak) return yogas;

  // Yoga 1: AK-AmK Kendra/Trikona relationship
  if (amk) {
    const diff = ((amk.signIndex - ak.signIndex) % 12 + 12) % 12 + 1;
    const isKendraTrikona = [1, 4, 5, 7, 9, 10].includes(diff);
    yogas.push({
      name: 'AK-AmK Kendra/Trikona Yoga',
      present: isKendraTrikona,
      description: isKendraTrikona
        ? `Atmakaraka (${ak.planet}) and Amatyakaraka (${amk.planet}) are in Kendra/Trikona from each other — the soul\'s purpose and career path are aligned, creating powerful professional success.`
        : `Atmakaraka (${ak.planet}) and Amatyakaraka (${amk.planet}) are not in Kendra/Trikona from each other.`,
      involvingPlanets: [ak.planet, amk.planet],
    });
  }

  // Yoga 2: AK in Kendra from Lagna
  const akFromLagna = ak.house;
  const akInKendra = [1, 4, 7, 10].includes(akFromLagna);
  yogas.push({
    name: 'AK in Kendra Yoga',
    present: akInKendra,
    description: akInKendra
      ? `Atmakaraka (${ak.planet}) is in a Kendra house (${akFromLagna}) from the ascendant — the soul\'s purpose is strongly expressed in life, giving focus and direction.`
      : `Atmakaraka (${ak.planet}) is in house ${akFromLagna}, not in a Kendra from the ascendant.`,
    involvingPlanets: [ak.planet],
  });

  // Yoga 3: AK and PK in beneficial relationship
  if (pk) {
    const diffPK = ((pk.signIndex - ak.signIndex) % 12 + 12) % 12 + 1;
    const isBeneficial = [1, 5, 9].includes(diffPK); // Trikona
    yogas.push({
      name: 'AK-PK Trikona Yoga',
      present: isBeneficial,
      description: isBeneficial
        ? `Atmakaraka (${ak.planet}) and Putrakaraka (${pk.planet}) are in Trikona from each other — the soul\'s purpose and creative intelligence are aligned, supporting children, education, and creative pursuits.`
        : `Atmakaraka (${ak.planet}) and Putrakaraka (${pk.planet}) are not in Trikona from each other.`,
      involvingPlanets: [ak.planet, pk.planet],
    });
  }

  // Yoga 4: DK in beneficial houses (1, 4, 7, 10, 5, 9)
  if (dk) {
    const dkInBeneficial = [1, 4, 5, 7, 9, 10].includes(dk.house);
    yogas.push({
      name: 'DK in Beneficial House Yoga',
      present: dkInBeneficial,
      description: dkInBeneficial
        ? `Darakaraka (${dk.planet}) is in house ${dk.house}, a beneficial house — marriage and partnerships bring growth, harmony, and support.`
        : `Darakaraka (${dk.planet}) is in house ${dk.house}, which may bring challenges in partnerships.`,
      involvingPlanets: [dk.planet],
    });
  }

  // Yoga 5: Multiple karakas in Kendra from Lagna
  const karakasInKendra = karakas.filter(k => [1, 4, 7, 10].includes(k.house));
  const multipleInKendra = karakasInKendra.length >= 3;
  yogas.push({
    name: 'Multiple Karakas in Kendra Yoga',
    present: multipleInKendra,
    description: multipleInKendra
      ? `${karakasInKendra.length} karakas (${karakasInKendra.map(k => k.planet).join(', ')}) are in Kendra houses — exceptional strength in life direction and purpose. This is a powerful Jaimini Raja Yoga.`
      : `${karakasInKendra.length} karakas are in Kendra houses (need 3+ for this yoga).`,
    involvingPlanets: karakasInKendra.map(k => k.planet),
  });

  return yogas;
}
