import { NextRequest, NextResponse } from 'next/server';

// In-memory cache for daily horoscopes
const horoscopeCache: Record<string, { data: HoroscopeData; date: string }> = {};

interface HoroscopeData {
  sunSign: string;
  moonSign: string;
  date: string;
  emotionalEnergy: string;
  focusArea: string;
  guidance: string;
  luckyElement: string;
}

const ZODIAC_ELEMENTS: Record<string, { element: string; lucky: string[] }> = {
  Aries: { element: 'Fire', lucky: ['Ruby', 'Candle flame', 'Red Jasper'] },
  Taurus: { element: 'Earth', lucky: ['Emerald', 'Moss Agate', 'Copper'] },
  Gemini: { element: 'Air', lucky: ['Agate', 'Feather', 'Citrine'] },
  Cancer: { element: 'Water', lucky: ['Moonstone', 'Pearl', 'Silver'] },
  Leo: { element: 'Fire', lucky: ['Sunstone', 'Gold', 'Tiger Eye'] },
  Virgo: { element: 'Earth', lucky: ['Peridot', 'Sage', 'Jasper'] },
  Libra: { element: 'Air', lucky: ['Opal', 'Rose Quartz', 'Pink Salt'] },
  Scorpio: { element: 'Water', lucky: ['Obsidian', 'Garnet', 'Iron'] },
  Sagittarius: { element: 'Fire', lucky: ['Turquoise', 'Amethyst', 'Oak'] },
  Capricorn: { element: 'Earth', lucky: ['Onyx', 'Hematite', 'Lead'] },
  Aquarius: { element: 'Air', lucky: ['Amethyst', 'Uranium Glass', 'Aluminum'] },
  Pisces: { element: 'Water', lucky: ['Aquamarine', 'Sea Salt', 'Abalone'] },
};

const EMOTIONAL_ENERGIES: Record<string, string[]> = {
  Fire: [
    'Your emotional engine runs hot today — channel this intensity into creative expression rather than impulsive reactions.',
    'A surge of passionate energy courses through you. Direct it toward a cause you believe in.',
    'Your inner fire demands movement. Physical activity will help process today\'s emotional intensity.',
    'Today brings a spark of inspiration that can ignite meaningful change. Trust the flame.',
    'Your enthusiasm is contagious. Use this magnetic energy to uplift those around you.',
  ],
  Earth: [
    'Ground yourself today — your emotional stability is your superpower. Resist the urge to rush.',
    'A practical approach to feelings serves you well. Let patience be your emotional anchor.',
    'Your connection to the material world deepens. Tend to your physical space and watch your inner world bloom.',
    'Today favors steady, incremental emotional growth. Trust the slow process.',
    'Your reliability is tested today. Show up for yourself the way you show up for others.',
  ],
  Air: [
    'Your mind races with new perspectives. Write them down before they evaporate like morning mist.',
    'Communication flows naturally today. Share your thoughts — they carry more weight than you realize.',
    'A day of mental clarity allows you to see emotional patterns you\'ve been missing.',
    'Your social intelligence peaks. Navigate conversations with your characteristic grace.',
    'Ideas collide today to create unexpected emotional insights. Let curiosity lead.',
  ],
  Water: [
    'Your emotional depths are especially accessible today. Journaling or meditation can surface valuable insights.',
    'Intuition speaks louder than logic. Trust the whispers of your inner knowing.',
    'A wave of empathy washes through you. Honor it without drowning in others\' feelings.',
    'Your dreams carry important messages. Pay attention to recurring themes.',
    'Emotional healing accelerates today. Old wounds may surface for final release.',
  ],
};

const FOCUS_AREAS: string[] = [
  'Self-care rituals and emotional boundaries',
  'Deepening an important relationship',
  'Career aspirations and professional identity',
  'Creative expression and artistic pursuits',
  'Financial planning and security building',
  'Spiritual growth and inner exploration',
  'Physical health and body awareness',
  'Community connection and social impact',
  'Learning and intellectual expansion',
  'Home environment and personal sanctuary',
  'Romantic partnerships and intimacy',
  'Family dynamics and ancestral healing',
];

const GUIDANCE_MESSAGES: string[] = [
  'The stars suggest you pause before reacting. A moment of stillness can transform your response.',
  'Today is ideal for setting intentions. Write down three emotional goals for the week ahead.',
  'Let go of the need to control outcomes. Trust that the universe is rearranging things in your favor.',
  'Reach out to someone you trust. Vulnerability shared is vulnerability halved.',
  'Spend time near water or in nature today. Your element calls you home.',
  'A difficult conversation you\'ve been avoiding holds the key to emotional freedom.',
  'Practice saying no without guilt. Your boundaries are an act of self-love.',
  'Something you\'ve been waiting for is closer than you think. Stay patient and receptive.',
  'Release the need to be perfect. Progress matters more than perfection today.',
  'Your emotional intelligence is your greatest asset. Use it to navigate today\'s challenges.',
  'An unexpected encounter could shift your perspective. Stay open to surprise.',
  'Forgive yourself for past emotional missteps. Every feeling was a teacher.',
];

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function generateHoroscope(sunSign: string, moonSign: string): HoroscopeData {
  const today = getTodayString();
  const cacheKey = `${sunSign}-${moonSign}-${today}`;

  // Check cache
  if (horoscopeCache[cacheKey] && horoscopeCache[cacheKey].date === today) {
    return horoscopeCache[cacheKey].data;
  }

  // Generate deterministic daily seed
  const dateNum = today.split('-').reduce((acc, part, i) => acc + parseInt(part) * (i === 0 ? 365 : i === 1 ? 30 : 1), 0);
  const signNum = sunSign.charCodeAt(0) + (sunSign.length * 7);
  const moonNum = moonSign.charCodeAt(0) + (moonSign.length * 3);
  const baseSeed = dateNum + signNum + moonNum;

  const sunElement = ZODIAC_ELEMENTS[sunSign]?.element || 'Fire';
  const energies = EMOTIONAL_ENERGIES[sunElement] || EMOTIONAL_ENERGIES.Fire;

  const data: HoroscopeData = {
    sunSign,
    moonSign,
    date: today,
    emotionalEnergy: energies[Math.floor(seededRandom(baseSeed) * energies.length)],
    focusArea: FOCUS_AREAS[Math.floor(seededRandom(baseSeed + 1) * FOCUS_AREAS.length)],
    guidance: GUIDANCE_MESSAGES[Math.floor(seededRandom(baseSeed + 2) * GUIDANCE_MESSAGES.length)],
    luckyElement: ZODIAC_ELEMENTS[sunSign]?.lucky?.[Math.floor(seededRandom(baseSeed + 3) * (ZODIAC_ELEMENTS[sunSign]?.lucky?.length || 1))] || 'Quartz Crystal',
  };

  // Cache the result
  horoscopeCache[cacheKey] = { data, date: today };

  return data;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sunSign = searchParams.get('sunSign');
    const moonSign = searchParams.get('moonSign');

    if (!sunSign) {
      return NextResponse.json(
        { error: 'sunSign query parameter is required' },
        { status: 400 }
      );
    }

    const horoscope = generateHoroscope(sunSign, moonSign || sunSign);

    return NextResponse.json({
      success: true,
      data: horoscope,
    });
  } catch (error) {
    console.error('Horoscope generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate horoscope' },
      { status: 500 }
    );
  }
}
