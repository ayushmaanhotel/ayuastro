import { NextRequest, NextResponse } from 'next/server';

// In-memory cache for transit data (date-keyed)
const transitCache: Record<string, { data: TransitResponse; date: string }> = {};

interface TransitData {
  planet: string;
  sign: string;
  house: number;
  type: 'major' | 'minor' | 'shadow';
  duration: string;
  effect: string;
  advice: string;
}

interface TransitResponse {
  date: string;
  transits: TransitData[];
  overallTheme: string;
  focusPeriod: string;
}

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

// Calculate which house a transiting planet is in based on the ascendant
function getHouse(ascendant: string, transitingSign: string): number {
  const ascIndex = ZODIAC_SIGNS.indexOf(ascendant);
  const signIndex = ZODIAC_SIGNS.indexOf(transitingSign);
  if (ascIndex === -1 || signIndex === -1) return 1;
  // Whole-sign house system: the ascendant sign is the 1st house
  return ((signIndex - ascIndex + 12) % 12) + 1;
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

// Approximate planetary positions for 2025-2026
// Based on actual astronomical ephemeris data
const PLANETARY_POSITIONS: Record<string, {
  sign: string;
  type: 'major' | 'minor' | 'shadow';
  duration: string;
  approximatePeriod: string; // for validation
}> = {
  Saturn: {
    sign: 'Pisces',
    type: 'major',
    duration: '2.5 years',
    approximatePeriod: '2025-2028',
  },
  Jupiter: {
    sign: 'Gemini',
    type: 'major',
    duration: '1 year',
    approximatePeriod: '2025-2026',
  },
  Rahu: {
    sign: 'Pisces',
    type: 'shadow',
    duration: '1.5 years',
    approximatePeriod: '2025-2026',
  },
  Ketu: {
    sign: 'Virgo',
    type: 'shadow',
    duration: '1.5 years',
    approximatePeriod: '2025-2026',
  },
  Mercury: {
    sign: 'Taurus',
    type: 'minor',
    duration: '3 weeks',
    approximatePeriod: 'May 2026',
  },
  Venus: {
    sign: 'Aries',
    type: 'minor',
    duration: '4 weeks',
    approximatePeriod: 'May 2026',
  },
};

// Jupiter shifts to Cancer around mid-2026 — check date for this
function getJupiterSign(dateStr: string): string {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-indexed
  // Jupiter enters Cancer around May-June 2026
  if (year > 2026 || (year === 2026 && month >= 5)) {
    return 'Cancer';
  }
  return 'Gemini';
}

// Mercury moves fast — approximate its sign based on date seed
function getMercurySign(dateStr: string): string {
  const date = new Date(dateStr);
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  const signIndex = Math.floor((dayOfYear / 30.4) % 12);
  return ZODIAC_SIGNS[signIndex];
}

// Venus also moves fast — approximate its sign based on date seed
function getVenusSign(dateStr: string): string {
  const date = new Date(dateStr);
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  // Offset Venus from Mercury by roughly 2 signs
  const signIndex = Math.floor(((dayOfYear / 30.4) + 2) % 12);
  return ZODIAC_SIGNS[signIndex];
}

// House-specific effects for each planet (psychologically grounded, not superstitious)
// These are keyed by planet + house number
const SATURN_EFFECTS: Record<number, { effect: string; advice: string }> = {
  1: {
    effect: 'Saturn transiting your 1st house brings a period of self-restructuring. You may feel the weight of responsibility more acutely, but this is the foundation for lasting personal authority. Old identity patterns are being solidified or released.',
    advice: 'Embrace discipline as self-love. Build routines that honor your physical and emotional limits. This transit rewards patience with unshakeable self-knowledge.',
  },
  2: {
    effect: 'Saturn in your 2nd house asks you to reevaluate your relationship with security and self-worth. Financial discipline increases, and you may confront limiting beliefs about what you deserve.',
    advice: 'Audit your values — not your bank account. Saturn here teaches that true security comes from within, not from external validation.',
  },
  3: {
    effect: 'Saturn transiting your 3rd house sharpens your communication but asks for more precision. Learning may feel slower but is deeper. Sibling or neighborhood dynamics may require mature handling.',
    advice: 'Write, study, and speak with intention. Short courses and structured learning pay off now. Avoid superficial conversations.',
  },
  4: {
    effect: 'Saturn in the 4th house brings deep work around home, family, and emotional foundations. You may revisit childhood patterns or restructure your living situation to better support your emotional needs.',
    advice: 'Create emotional architecture that lasts. Address family patterns with compassion, not avoidance. Your inner foundation is being rebuilt stronger.',
  },
  5: {
    effect: 'Saturn transiting your 5th house brings maturity to creativity and romance. Play may feel like work, but this transit teaches the discipline required for true creative mastery and authentic joy.',
    advice: 'Take your creative gifts seriously. Structure your play. Romantic relationships require emotional maturity now — choose depth over excitement.',
  },
  6: {
    effect: 'Saturn in the 6th house focuses on health, daily routines, and service. This is a period for building sustainable habits and addressing health concerns that you may have been avoiding.',
    advice: 'Invest in your body — it is your vehicle for everything else. Establish routines you can maintain for decades, not just weeks.',
  },
  7: {
    effect: 'Saturn transiting your 7th house brings serious themes to partnerships. Commitments may be tested, and relationships that lack substance will be revealed. New connections tend to be long-lasting.',
    advice: 'Honor your commitments. Relationships require effort now, but the bonds formed during this transit are built to last.',
  },
  8: {
    effect: 'Saturn\'s transit through your 8th house brings deep psychological transformation. Old emotional patterns surface for final release. This is a period of intense inner work that ultimately leads to profound emotional freedom.',
    advice: 'Embrace the discomfort — it\'s the price of transformation. Journaling and meditation are especially powerful now.',
  },
  9: {
    effect: 'Saturn in the 9th house asks you to build a philosophy that can withstand scrutiny. Belief systems that lack substance may crumble, making way for genuine wisdom.',
    advice: 'Study deeply rather than broadly. Travel with purpose. Seek teachers who challenge your assumptions, not those who confirm them.',
  },
  10: {
    effect: 'Saturn transiting your 10th house marks a peak period for career and public reputation. Professional responsibilities increase, and you are being called to step into greater authority.',
    advice: 'Accept leadership with humility. This is your time to build a professional legacy. Avoid shortcuts — Saturn rewards only genuine effort.',
  },
  11: {
    effect: 'Saturn in the 11th house restructures your social circles and long-term goals. Friendships that lack authenticity may fade, while connections built on shared values strengthen.',
    advice: 'Quality over quantity in all social connections. Align your goals with your true values, not social expectations.',
  },
  12: {
    effect: 'Saturn transiting your 12th house brings a period of spiritual maturation and letting go. Unconscious patterns are illuminated, and solitude becomes a powerful teacher.',
    advice: 'Embrace solitude without isolation. Meditation, therapy, and reflective practices are especially potent now. Release what no longer serves you.',
  },
};

const JUPITER_EFFECTS: Record<number, { effect: string; advice: string }> = {
  1: {
    effect: 'Jupiter expanding your 1st house amplifies your personal presence and optimism. You may feel more confident and willing to take up space. Physical vitality often improves during this transit.',
    advice: 'Step into visibility. This is your year to be seen, heard, and recognized. Expand your sense of what\'s possible for yourself.',
  },
  2: {
    effect: 'Jupiter in your 2nd house expands your resources and self-worth. Financial opportunities may increase, but so can spending. This transit teaches the relationship between abundance and gratitude.',
    advice: 'Practice conscious spending. Invest in experiences and tools that genuinely expand your capabilities, not just your possessions.',
  },
  3: {
    effect: 'Jupiter transiting your 3rd house expands communication, learning, and local connections. Your ideas gain reach, and teaching or writing opportunities may emerge.',
    advice: 'Share your knowledge generously. Short trips, courses, and community engagement bring unexpected growth.',
  },
  4: {
    effect: 'Jupiter in the 4th house brings expansion to home, family, and emotional foundations. This is a favorable time for real estate, family reconciliation, or creating a more nurturing living space.',
    advice: 'Invest in your sanctuary. Make your home a true reflection of your inner values. Family healing is strongly supported now.',
  },
  5: {
    effect: 'Jupiter transiting your 5th house amplifies creativity, joy, and romantic possibilities. This is one of the most pleasurable transits, bringing opportunities for authentic self-expression.',
    advice: 'Say yes to joy. Create boldly, love openly, and let your inner child guide you toward what genuinely delights you.',
  },
  6: {
    effect: 'Jupiter in the 6th house expands your capacity for service and improves health outcomes. Work opportunities increase, but be mindful of overcommitting.',
    advice: 'Balance service with self-care. Expand your wellness practices, but avoid the trap of making health another arena for perfectionism.',
  },
  7: {
    effect: 'Jupiter transiting your 7th house brings growth through partnerships. Significant relationships may form or deepen. Existing partnerships can expand through shared adventures.',
    advice: 'Be open to partnership in all forms. Business collaborations and romantic connections both benefit from Jupiter\'s expansive touch.',
  },
  8: {
    effect: 'Jupiter in the 8th house expands your emotional capacity for holding space for others. Your emotional wisdom is needed now. This transit often brings opportunities through shared resources or investments.',
    advice: 'Network authentically. Say yes to gatherings that feel aligned. Your emotional wisdom is needed now.',
  },
  9: {
    effect: 'Jupiter transiting your 9th house expands your horizons through travel, philosophy, and higher learning. This is a period of inspired exploration and meaning-making.',
    advice: 'Follow your curiosity across borders — physical and intellectual. Study, travel, and seek diverse perspectives.',
  },
  10: {
    effect: 'Jupiter in the 10th house brings professional expansion and recognition. Career opportunities may seem to arrive effortlessly, but this is the result of past effort finally bearing fruit.',
    advice: 'Accept the spotlight with grace. Say yes to career opportunities that align with your deeper purpose.',
  },
  11: {
    effect: 'Jupiter expands your social connections and brings opportunities through community. Your emotional capacity for holding space for others increases significantly.',
    advice: 'Network authentically. Say yes to gatherings that feel aligned. Your emotional wisdom is needed now.',
  },
  12: {
    effect: 'Jupiter in the 12th house expands your spiritual awareness and connection to the unconscious. Dreams become more vivid, and solitude feels enriching rather than isolating.',
    advice: 'Explore meditation, dream work, and spiritual practice. This transit rewards inner exploration over outer achievement.',
  },
};

const RAHU_EFFECTS: Record<number, { effect: string; advice: string }> = {
  1: {
    effect: 'Rahu in your 1st house intensifies your desire for personal reinvention. You may feel an urgent need to redefine yourself, but beware of identity experimentation that lacks substance.',
    advice: 'Channel the desire for transformation into structured self-improvement. Avoid chasing external validation for your sense of identity.',
  },
  2: {
    effect: 'Rahu in the 2nd house amplifies desires around wealth and security. You may experience unusual financial opportunities or obsessions with accumulation.',
    advice: 'Practice mindful consumption. Investigate the emotional roots of your spending patterns rather than simply acquiring more.',
  },
  3: {
    effect: 'Rahu transiting your 3rd house amplifies communication and curiosity. You may feel drawn to learn many things at once, but depth may suffer.',
    advice: 'Choose one area of study and go deep. Resist the illusion that breadth equals knowledge.',
  },
  4: {
    effect: 'Rahu in the 4th house creates restlessness around home and emotional security. You may feel an insatiable desire for the "perfect" living situation or emotional state.',
    advice: 'Acknowledge that inner peace cannot be achieved through external arrangements. Practice being present with what is.',
  },
  5: {
    effect: 'Rahu transiting your 5th house intensifies creative and romantic desires. You may experience powerful attractions or creative obsessions.',
    advice: 'Enjoy the creative surge, but maintain boundaries in romance. Not every intense feeling requires action.',
  },
  6: {
    effect: 'Rahu in the 6th house amplifies health anxieties and work obsessions. You may feel driven to optimize everything, which can lead to burnout.',
    advice: 'Balance the drive for improvement with acceptance. Not every problem needs to be solved immediately.',
  },
  7: {
    effect: 'Rahu transiting your 7th house intensifies partnership desires. You may feel drawn to unconventional relationships or experience sudden attractions.',
    advice: 'Take time before committing. Rahu creates illusions in the 7th house — what seems fated may simply be intense.',
  },
  8: {
    effect: 'Rahu in the 8th house intensifies your desire for hidden knowledge and taboo subjects. You may feel drawn to explore the depths of your psyche.',
    advice: 'Channel this obsessive energy into structured spiritual practice. Avoid escapism.',
  },
  9: {
    effect: 'Rahu transiting your 9th house amplifies the search for meaning. You may feel drawn to unconventional spiritual paths or foreign cultures.',
    advice: 'Explore diverse philosophies but maintain discernment. Not every exotic teaching is deeper than what you already know.',
  },
  10: {
    effect: 'Rahu in the 10th house creates an intense drive for professional recognition. You may feel an urgent need to achieve public visibility.',
    advice: 'Pursue excellence for its own sake, not for applause. Rahu\'s ambitions can lead to burnout if unchecked.',
  },
  11: {
    effect: 'Rahu transiting your 11th house amplifies social ambitions. You may feel drawn to influential circles or unusual community affiliations.',
    advice: 'Network with authenticity. Connections made during this transit should be mutually nourishing, not transactional.',
  },
  12: {
    effect: 'Rahu in the 12th house amplifies unconscious desires and may create a pull toward escapism. Dreams and intuitive flashes intensify.',
    advice: 'Ground your spiritual experiences in daily practice. Avoid using spirituality as an escape from practical responsibilities.',
  },
};

const KETU_EFFECTS: Record<number, { effect: string; advice: string }> = {
  1: { effect: 'Ketu in your 1st house creates a sense of detachment from your personal identity. You may feel less concerned with how others perceive you.', advice: 'Use this detachment constructively — explore who you are beyond external roles and labels.' },
  2: { effect: 'Ketu in the 2nd house brings detachment from material accumulation. You may find less satisfaction in possessions and more in experiences.', advice: 'Simplify your relationship with money. This transit teaches that enough is truly enough.' },
  3: { effect: 'Ketu transiting your 3rd house brings introspection to communication. You may prefer listening over speaking and writing over talking.', advice: 'Trust the power of silence. Your quiet observations carry more wisdom than unfiltered expression.' },
  4: { effect: 'Ketu in the 4th house creates emotional detachment from the past. You may feel ready to release old family patterns.', advice: 'Let go gracefully. This transit supports healing ancestral wounds through acceptance, not analysis.' },
  5: { effect: 'Ketu transiting your 5th house brings a contemplative quality to creativity and romance. You may seek depth over excitement.', advice: 'Create for the joy of creation, not for recognition. Inner fulfillment matters more than outer applause.' },
  6: { effect: 'Ketu in the 6th house brings a spiritual approach to health and service. You may find alternative healing modalities effective.', advice: 'Trust intuitive approaches to wellness. Your body knows what it needs — learn to listen.' },
  7: { effect: 'Ketu transiting your 7th house creates a desire for spiritual partnership. Superficial connections lose their appeal.', advice: 'Seek soul-level connections. This transit supports partnerships rooted in shared values, not shared activities.' },
  8: { effect: 'Ketu in the 8th house facilitates natural psychological release. Old fears and traumas may dissolve without intense effort.', advice: 'Allow the letting go. This transit supports effortless healing when you stop resisting the process.' },
  9: { effect: 'Ketu transiting your 9th house brings an inner knowing that transcends formal teaching. Your spiritual wisdom comes from direct experience.', advice: 'Trust your inner guru. Formal study has less appeal now, but lived wisdom is profound.' },
  10: { effect: 'Ketu in the 10th house creates detachment from professional status. You may question whether your career aligns with your deeper purpose.', advice: 'Realign your work with your values. Success without meaning feels empty during this transit.' },
  11: { effect: 'Ketu transiting your 11th house brings detachment from social ambition. You may prefer smaller, more authentic circles.', advice: 'Cultivate a few deep friendships. The quality of connection matters more than the quantity.' },
  12: { effect: 'Ketu in the 12th house supports deep meditation and spiritual liberation. You may experience profound states of peace.', advice: 'Dedicate time to contemplative practice. This transit is a rare window for genuine spiritual breakthrough.' },
};

const MERCURY_EFFECTS: Record<number, { effect: string; advice: string }> = {
  1: { effect: 'Mercury in your 1st house sharpens your communication and mental agility. Conversations flow more easily, and you may feel mentally stimulated.', advice: 'Use this clarity for important conversations. Your words carry extra persuasive power now.' },
  3: { effect: 'Mercury in your 3rd house amplifies learning and communication. Short trips and connections with siblings or neighbors may increase.', advice: 'Start that writing project. Your mental energy is perfect for learning and teaching.' },
  5: { effect: 'Mercury transiting your 5th house brings playful intelligence and creative communication. Flirtation and wit are enhanced.', advice: 'Express yourself creatively. Write, speak, or create — your ideas sparkle now.' },
  7: { effect: 'Mercury in the 7th house brings important conversations to partnerships. Clarity in relationships increases.', advice: 'Have that conversation you\'ve been postponing. Communication in relationships is favored now.' },
  9: { effect: 'Mercury in the 9th house expands your thinking through new philosophies or study. Your worldview may shift through intellectual discovery.', advice: 'Take a course or read deeply. Your mind is hungry for expansive ideas.' },
  10: { effect: 'Mercury transiting your 10th house brings professional communication opportunities. Presentations, negotiations, and career conversations are favored.', advice: 'Pitch your ideas. Professional communication is sharp and persuasive during this transit.' },
  11: { effect: 'Mercury in the 11th house brings mental stimulation through social connections. Group discussions and collaborative thinking thrive.', advice: 'Engage in group conversations. Brainstorming with others leads to breakthrough ideas.' },
};

const VENUS_EFFECTS: Record<number, { effect: string; advice: string }> = {
  1: { effect: 'Venus in your 1st house enhances your charm and attractiveness — emotional and physical. Self-love practices are especially potent now.', advice: 'Invest in self-care that makes you feel beautiful from the inside out.' },
  2: { effect: 'Venus in the 2nd house brings ease with finances and self-worth. You may attract resources or discover new sources of value.', advice: 'Appreciate what you have. Gratitude amplifies abundance during this transit.' },
  4: { effect: 'Venus transiting your 4th house brings harmony to home and family. Domestic pleasures and emotional comfort increase.', advice: 'Beautify your space. Small changes at home can shift your entire emotional landscape.' },
  5: { effect: 'Venus in the 5th house is one of the most enjoyable transits — romance, creativity, and pleasure are all enhanced.', advice: 'Let yourself play. Joy is not frivolous — it\'s essential for emotional health.' },
  7: { effect: 'Venus in the 7th house brings harmony and beauty to partnerships. Romantic connections deepen and conflicts soften.', advice: 'Open your heart to connection. This transit favors genuine intimacy and partnership.' },
  11: { effect: 'Venus transiting your 11th house brings warmth to friendships and social connections. Group activities and community engagement feel fulfilling.', advice: 'Say yes to social invitations. Connection with like-minded others nourishes your spirit.' },
  12: { effect: 'Venus in the 12th house brings a private, spiritual quality to love and beauty. You may find beauty in solitude or discover hidden creative talents.', advice: 'Explore art, music, or beauty in private. Your aesthetic sensibilities are heightened in quiet spaces.' },
};

// Default effect for house numbers not specifically listed
function getDefaultEffect(planet: string, house: number): { effect: string; advice: string } {
  return {
    effect: `${planet} transiting your ${house} house influences matters related to this area of life. Pay attention to themes that arise around ${house === 1 ? 'identity' : house === 2 ? 'values' : house === 3 ? 'communication' : house === 4 ? 'home' : house === 5 ? 'creativity' : house === 6 ? 'health' : house === 7 ? 'partnerships' : house === 8 ? 'transformation' : house === 9 ? 'philosophy' : house === 10 ? 'career' : house === 11 ? 'community' : 'spirituality'}.`,
    advice: 'Observe the patterns that emerge. This transit offers valuable insights when approached with awareness rather than reactivity.',
  };
}

function getSaturnEffect(house: number): { effect: string; advice: string } {
  return SATURN_EFFECTS[house] || getDefaultEffect('Saturn', house);
}

function getJupiterEffect(house: number): { effect: string; advice: string } {
  return JUPITER_EFFECTS[house] || getDefaultEffect('Jupiter', house);
}

function getRahuEffect(house: number): { effect: string; advice: string } {
  return RAHU_EFFECTS[house] || getDefaultEffect('Rahu', house);
}

function getKetuEffect(house: number): { effect: string; advice: string } {
  return KETU_EFFECTS[house] || getDefaultEffect('Ketu', house);
}

function getMercuryEffect(house: number): { effect: string; advice: string } {
  return MERCURY_EFFECTS[house] || getDefaultEffect('Mercury', house);
}

function getVenusEffect(house: number): { effect: string; advice: string } {
  return VENUS_EFFECTS[house] || getDefaultEffect('Venus', house);
}

// Overall theme generation based on transit combination
function generateOverallTheme(
  saturnHouse: number,
  jupiterHouse: number,
  rahuHouse: number,
  seed: number
): string {
  const themes = [
    `A period of deep transformation and social expansion. The cosmos asks you to do the inner work while staying connected to community.`,
    `Structure meets opportunity. Saturn demands discipline in your ${saturnHouse === 8 ? 'inner world' : saturnHouse === 10 ? 'career' : 'foundations'} while Jupiter opens doors through ${jupiterHouse === 11 ? 'community' : jupiterHouse === 7 ? 'partnership' : 'growth'}.`,
    `This is a bridge period — between who you were and who you are becoming. Rahu pushes for evolution, Saturn provides the structure, and Jupiter offers the grace.`,
    `An emotionally rich period where inner work and outer expansion coexist. The key is balancing depth with lightness, solitude with connection.`,
    `Transformation through integration. The major transits align to help you synthesize past lessons into future wisdom. Trust the process.`,
  ];
  return themes[Math.floor(seededRandom(seed) * themes.length)];
}

function generateFocusPeriod(dateStr: string): string {
  const date = new Date(dateStr);
  const month = date.getMonth();
  const year = date.getFullYear();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  // 6-month focus period from current date
  const endMonth = (month + 5) % 12;
  const endYear = month + 5 > 11 ? year + 1 : year;

  return `${monthNames[month]} ${year} — ${monthNames[endMonth]} ${endYear}`;
}

function generateTransits(sunSign: string, moonSign: string, ascendant: string): TransitResponse {
  const today = getTodayString();
  const cacheKey = `${sunSign}-${moonSign}-${ascendant}-${today}`;

  // Check cache
  if (transitCache[cacheKey] && transitCache[cacheKey].date === today) {
    return transitCache[cacheKey].data;
  }

  // Generate deterministic seed
  const dateNum = today.split('-').reduce((acc, part, i) => acc + parseInt(part) * (i === 0 ? 365 : i === 1 ? 30 : 1), 0);
  const signNum = (sunSign.charCodeAt(0) + moonSign.charCodeAt(0) + ascendant.charCodeAt(0));
  const baseSeed = dateNum + signNum;

  // Get current planetary positions
  const jupiterSign = getJupiterSign(today);
  const mercurySign = getMercurySign(today);
  const venusSign = getVenusSign(today);

  // Calculate houses for each planet
  const saturnHouse = getHouse(ascendant, PLANETARY_POSITIONS.Saturn.sign);
  const jupiterHouse = getHouse(ascendant, jupiterSign);
  const rahuHouse = getHouse(ascendant, PLANETARY_POSITIONS.Rahu.sign);
  const ketuHouse = getHouse(ascendant, PLANETARY_POSITIONS.Ketu.sign);
  const mercuryHouse = getHouse(ascendant, mercurySign);
  const venusHouse = getHouse(ascendant, venusSign);

  // Get effects for each planet
  const saturnEffect = getSaturnEffect(saturnHouse);
  const jupiterEffect = getJupiterEffect(jupiterHouse);
  const rahuEffect = getRahuEffect(rahuHouse);
  const ketuEffect = getKetuEffect(ketuHouse);
  const mercuryEffect = getMercuryEffect(mercuryHouse);
  const venusEffect = getVenusEffect(venusHouse);

  const transits: TransitData[] = [
    {
      planet: 'Saturn',
      sign: PLANETARY_POSITIONS.Saturn.sign,
      house: saturnHouse,
      type: 'major',
      duration: PLANETARY_POSITIONS.Saturn.duration,
      effect: saturnEffect.effect,
      advice: saturnEffect.advice,
    },
    {
      planet: 'Jupiter',
      sign: jupiterSign,
      house: jupiterHouse,
      type: 'major',
      duration: PLANETARY_POSITIONS.Jupiter.duration,
      effect: jupiterEffect.effect,
      advice: jupiterEffect.advice,
    },
    {
      planet: 'Rahu',
      sign: PLANETARY_POSITIONS.Rahu.sign,
      house: rahuHouse,
      type: 'shadow',
      duration: PLANETARY_POSITIONS.Rahu.duration,
      effect: rahuEffect.effect,
      advice: rahuEffect.advice,
    },
    {
      planet: 'Ketu',
      sign: PLANETARY_POSITIONS.Ketu.sign,
      house: ketuHouse,
      type: 'shadow',
      duration: PLANETARY_POSITIONS.Ketu.duration,
      effect: ketuEffect.effect,
      advice: ketuEffect.advice,
    },
    {
      planet: 'Mercury',
      sign: mercurySign,
      house: mercuryHouse,
      type: 'minor',
      duration: PLANETARY_POSITIONS.Mercury.duration,
      effect: mercuryEffect.effect,
      advice: mercuryEffect.advice,
    },
    {
      planet: 'Venus',
      sign: venusSign,
      house: venusHouse,
      type: 'minor',
      duration: PLANETARY_POSITIONS.Venus.duration,
      effect: venusEffect.effect,
      advice: venusEffect.advice,
    },
  ];

  const overallTheme = generateOverallTheme(saturnHouse, jupiterHouse, rahuHouse, baseSeed);
  const focusPeriod = generateFocusPeriod(today);

  const response: TransitResponse = {
    date: today,
    transits,
    overallTheme,
    focusPeriod,
  };

  // Cache the result
  transitCache[cacheKey] = { data: response, date: today };

  return response;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sunSign = searchParams.get('sunSign');
    const moonSign = searchParams.get('moonSign');
    const ascendant = searchParams.get('ascendant');

    if (!sunSign) {
      return NextResponse.json(
        { error: 'sunSign query parameter is required' },
        { status: 400 }
      );
    }

    if (!ascendant) {
      return NextResponse.json(
        { error: 'ascendant query parameter is required' },
        { status: 400 }
      );
    }

    // Validate zodiac sign names
    const validSigns = new Set(ZODIAC_SIGNS);
    if (!validSigns.has(sunSign)) {
      return NextResponse.json(
        { error: `Invalid sunSign: ${sunSign}. Must be one of: ${ZODIAC_SIGNS.join(', ')}` },
        { status: 400 }
      );
    }
    if (moonSign && !validSigns.has(moonSign)) {
      return NextResponse.json(
        { error: `Invalid moonSign: ${moonSign}. Must be one of: ${ZODIAC_SIGNS.join(', ')}` },
        { status: 400 }
      );
    }
    if (!validSigns.has(ascendant)) {
      return NextResponse.json(
        { error: `Invalid ascendant: ${ascendant}. Must be one of: ${ZODIAC_SIGNS.join(', ')}` },
        { status: 400 }
      );
    }

    const transits = generateTransits(sunSign, moonSign || sunSign, ascendant);

    return NextResponse.json({
      success: true,
      data: transits,
    });
  } catch (error) {
    console.error('Transit calculation error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate planetary transits' },
      { status: 500 }
    );
  }
}
