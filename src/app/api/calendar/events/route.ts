import { NextRequest, NextResponse } from 'next/server';

// In-memory cache by month key "YYYY-MM"
const cache = new Map<string, CosmicEvent[]>();

export type CosmicEventType = 'retrograde' | 'eclipse' | 'transit' | 'moonPhase' | 'specialYoga';

export interface CosmicEvent {
  date: string; // YYYY-MM-DD
  title: string;
  type: CosmicEventType;
  description: string;
  emotionalImpact: number; // 1-5
  emoji: string;
  guidance: string;
}

// Approximate 2025-2026 astronomical dates
// Mercury Retrograde periods (3 per year)
const MERCURY_RETRO_2025: [string, string, string][] = [
  ['2025-03-15', '2025-04-07', 'Mercury Retrograde in Pisces/Aries'],
  ['2025-07-18', '2025-08-11', 'Mercury Retrograde in Leo'],
  ['2025-11-10', '2025-11-29', 'Mercury Retrograde in Sagittarius'],
];

const MERCURY_RETRO_2026: [string, string, string][] = [
  ['2026-02-25', '2026-03-18', 'Mercury Retrograde in Pisces'],
  ['2026-06-15', '2026-07-09', 'Mercury Retrograde in Cancer/Gemini'],
  ['2026-10-10', '2026-11-02', 'Mercury Retrograde in Scorpio/Libra'],
];

// Venus Retrograde
const VENUS_RETRO: [string, string, string][] = [
  ['2025-07-06', '2025-09-04', 'Venus Retrograde in Leo/Virgo'],
];

// Eclipses 2025
const ECLIPSES_2025: [string, string, string][] = [
  ['2025-03-14', 'Lunar Eclipse', 'Full Moon lunar eclipse in Virgo — emotional completions surface'],
  ['2025-03-29', 'Solar Eclipse', 'New Moon solar eclipse in Aries — bold new beginnings awaken'],
  ['2025-09-07', 'Lunar Eclipse', 'Full Moon lunar eclipse in Pisces — spiritual insights deepen'],
  ['2025-09-21', 'Solar Eclipse', 'New Moon solar eclipse in Virgo — refined intentions take root'],
];

// Eclipses 2026
const ECLIPSES_2026: [string, string, string][] = [
  ['2026-02-17', 'Lunar Eclipse', 'Full Moon lunar eclipse in Leo — creative self-expression illuminates'],
  ['2026-03-03', 'Solar Eclipse', 'New Moon solar eclipse in Pisces — visionary seeds planted'],
  ['2026-08-12', 'Lunar Eclipse', 'Full Moon lunar eclipse in Aquarius — community and purpose align'],
  ['2026-08-28', 'Solar Eclipse', 'New Moon solar eclipse in Virgo — healing routines begin'],
];

// Major planetary transits
const TRANSITS_2025: [string, string, string][] = [
  ['2025-01-01', 'Saturn in Pisces', 'Deep structural lessons in spirituality and boundaries continue'],
  ['2025-05-15', 'Jupiter enters Cancer', 'Expansion of emotional intelligence, home, and nurturing energy'],
  ['2025-06-01', 'Rahu in Pisces', 'Illusions dissolve; spiritual ambition intensifies'],
  ['2025-06-01', 'Ketu in Virgo', 'Release from perfectionism; surrender to cosmic flow'],
  ['2025-10-15', 'Saturn retrograde in Pisces', 'Revisiting emotional foundations and karmic debts'],
];

const TRANSITS_2026: [string, string, string][] = [
  ['2026-01-01', 'Saturn in Pisces', 'Continued deep spiritual restructuring and discipline'],
  ['2026-05-20', 'Jupiter enters Leo', 'Creative confidence blossoms; leadership potential expands'],
  ['2026-04-01', 'Rahu in Aquarius', 'Collective vision sharpens; humanitarian impulses rise'],
  ['2026-04-01', 'Ketu in Leo', 'Releasing ego-driven pursuits for inner authenticity'],
  ['2026-09-10', 'Saturn retrograde in Pisces', 'Final karmic review of emotional lessons'],
];

// Full Moon (Purnima) and New Moon (Amavasya) approximate dates 2025
const MOON_PHASES_2025: [string, string, string][] = [
  ['2025-01-13', 'Purnima', 'Full Moon in Cancer — emotional fulfillment peak'],
  ['2025-01-29', 'Amavasya', 'New Moon in Capricorn — planting ambitious seeds'],
  ['2025-02-12', 'Purnima', 'Full Moon in Leo — creative expression illuminated'],
  ['2025-02-27', 'Amavasya', 'New Moon in Aquarius — collective dreams ignited'],
  ['2025-03-14', 'Purnima', 'Full Moon in Virgo — eclipse clarity on service'],
  ['2025-03-29', 'Amavasya', 'New Moon in Aries — eclipse-fueled new cycle'],
  ['2025-04-13', 'Purnima', 'Full Moon in Libra — relationship balance sought'],
  ['2025-04-27', 'Amavasya', 'New Moon in Aries — independent beginnings'],
  ['2025-05-12', 'Purnima', 'Full Moon in Scorpio — deep transformation released'],
  ['2025-05-27', 'Amavasya', 'New Moon in Taurus — grounded intentions set'],
  ['2025-06-11', 'Purnima', 'Full Moon in Sagittarius — truth and expansion'],
  ['2025-06-25', 'Amavasya', 'New Moon in Gemini — communication seeds planted'],
  ['2025-07-10', 'Purnima', 'Full Moon in Capricorn — ambition and achievement'],
  ['2025-07-25', 'Amavasya', 'New Moon in Cancer — emotional new beginnings'],
  ['2025-08-09', 'Purnima', 'Full Moon in Aquarius — community vision'],
  ['2025-08-23', 'Amavasya', 'New Moon in Leo — creative rebirth'],
  ['2025-09-07', 'Purnima', 'Full Moon in Pisces — eclipse spiritual release'],
  ['2025-09-21', 'Amavasya', 'New Moon in Virgo — eclipse healing rituals'],
  ['2025-10-06', 'Purnima', 'Full Moon in Aries — bold completions'],
  ['2025-10-21', 'Amavasya', 'New Moon in Libra — relationship reset'],
  ['2025-11-05', 'Purnima', 'Full Moon in Taurus — sensual fulfillment'],
  ['2025-11-20', 'Amavasya', 'New Moon in Scorpio — deep renewal'],
  ['2025-12-04', 'Purnima', 'Full Moon in Gemini — communication clarity'],
  ['2025-12-19', 'Amavasya', 'New Moon in Sagittarius — adventurous intentions'],
];

const MOON_PHASES_2026: [string, string, string][] = [
  ['2026-01-03', 'Purnima', 'Full Moon in Cancer — emotional peak of winter'],
  ['2026-01-18', 'Amavasya', 'New Moon in Capricorn — structured new year goals'],
  ['2026-02-02', 'Purnima', 'Full Moon in Leo — creative fullness'],
  ['2026-02-17', 'Amavasya', 'New Moon in Aquarius — eclipse collective reset'],
  ['2026-03-03', 'Amavasya', 'New Moon in Pisces — eclipse spiritual beginning'],
  ['2026-03-18', 'Purnima', 'Full Moon in Virgo — service and healing'],
  ['2026-04-02', 'Amavasya', 'New Moon in Aries — bold fresh start'],
  ['2026-04-17', 'Purnima', 'Full Moon in Libra — harmony restored'],
  ['2026-05-01', 'Amavasya', 'New Moon in Taurus — material foundations'],
  ['2026-05-16', 'Purnima', 'Full Moon in Scorpio — deep emotional release'],
  ['2026-05-31', 'Amavasya', 'New Moon in Gemini — mental clarity renewed'],
  ['2026-06-14', 'Purnima', 'Full Moon in Sagittarius — philosophical heights'],
  ['2026-06-29', 'Amavasya', 'New Moon in Cancer — home and heart reset'],
  ['2026-07-14', 'Purnima', 'Full Moon in Capricorn — professional milestones'],
  ['2026-07-28', 'Amavasya', 'New Moon in Leo — creative courage awakened'],
  ['2026-08-12', 'Purnima', 'Full Moon in Aquarius — eclipse collective clarity'],
  ['2026-08-28', 'Amavasya', 'New Moon in Virgo — eclipse purification'],
  ['2026-09-11', 'Purnima', 'Full Moon in Pisces — spiritual culmination'],
  ['2026-09-26', 'Amavasya', 'New Moon in Libra — balance restored'],
  ['2026-10-10', 'Purnima', 'Full Moon in Aries — independent power'],
  ['2026-10-25', 'Amavasya', 'New Moon in Scorpio — transformative depths'],
  ['2026-11-09', 'Purnima', 'Full Moon in Taurus — material gratitude'],
  ['2026-11-24', 'Amavasya', 'New Moon in Sagittarius — wisdom quest begins'],
  ['2026-12-08', 'Purnima', 'Full Moon in Gemini — year-end reflections'],
  ['2026-12-23', 'Amavasya', 'New Moon in Capricorn — disciplined closure'],
];

// Special Yogas — one per month, on a specific date
const SPECIAL_YOGAS_2025: [string, string, string][] = [
  ['2025-01-14', 'Makara Sankranti Yoga', 'Sun enters Capricorn — spiritual light increases'],
  ['2025-02-13', 'Kumbha Mela Yoga', 'Rare planetary alignment amplifying spiritual merit'],
  ['2025-03-14', 'Gajakesari Yoga', 'Jupiter-Moon auspicious angle — wisdom and fortune align'],
  ['2025-04-06', 'Raja Yoga Window', 'Planetary combination supporting leadership and authority'],
  ['2025-05-12', 'Budhaditya Yoga', 'Mercury-Sun conjunction — intellectual brilliance peaks'],
  ['2025-06-11', 'Guru Purnima Yoga', 'Sacred full moon honoring teachers and wisdom'],
  ['2025-07-10', 'Hamsa Yoga', 'Jupiter in exaltation — grace and spiritual expansion'],
  ['2025-08-09', 'Malavya Yoga', 'Venus in own sign — beauty, harmony, and love intensify'],
  ['2025-09-07', 'Maha Shivaratri Yoga', 'Deep meditation and transformation energy peaks'],
  ['2025-10-20', 'Dhanvantari Yoga', 'Healing energy amplified — health and wellness focus'],
  ['2025-11-05', 'Lakshmi Narayan Yoga', 'Venus-Jupiter conjunction — abundance and love converge'],
  ['2025-12-19', 'Moola Shakti Yoga', 'Root energy awakens — profound karmic release possible'],
];

const SPECIAL_YOGAS_2026: [string, string, string][] = [
  ['2026-01-14', 'Makara Sankranti Yoga', 'Sun enters Capricorn — days of spiritual growth begin'],
  ['2026-02-13', 'Shani Pratyanta Yoga', 'Saturn aspect intensifies discipline and endurance'],
  ['2026-03-03', 'Gajakesari Yoga', 'Jupiter-Moon grace — fortune and emotional wisdom peak'],
  ['2026-04-02', 'Chandra-Mangal Yoga', 'Moon-Mars combination — courage and initiative unite'],
  ['2026-05-16', 'Budhaditya Yoga', 'Mercury-Sun conjunction — communication and intelligence soar'],
  ['2026-06-14', 'Guru Purnima Yoga', 'Sacred full moon of gratitude and spiritual learning'],
  ['2026-07-14', 'Raja Yoga Window', 'Planetary alignment empowering leadership and dharma'],
  ['2026-08-12', 'Hamsa Yoga', 'Jupiter grace period — spirituality and prosperity align'],
  ['2026-09-11', 'Viparita Raja Yoga', 'Challenges transform into unexpected strength and success'],
  ['2026-10-10', 'Dhanvantari Yoga', 'Cosmic healing window — body and mind rejuvenation'],
  ['2026-11-09', 'Lakshmi Narayan Yoga', 'Venus-Jupiter abundance — love and wealth blessings'],
  ['2026-12-08', 'Moola Shakti Yoga', 'Year-end karmic release — deep roots transformed'],
];

function getRetrogradeGuidance(title: string): string {
  if (title.includes('Mercury')) return 'Slow down communications. Revisit, revise, and reflect rather than start new ventures.';
  if (title.includes('Venus')) return 'Reassess relationships and values. Avoid major purchases or beauty changes during this period.';
  return 'Use this period for deep introspection. Outer delays often bring inner clarity.';
}

function getEclipseGuidance(title: string): string {
  if (title.includes('Lunar')) return 'Emotional completions arrive. Release what no longer serves your growth with gratitude.';
  if (title.includes('Solar')) return 'New chapters begin. Set clear intentions for the next six months of your journey.';
  return 'A powerful portal of transformation. Stay centered and open to unexpected shifts.';
}

function getTransitGuidance(title: string): string {
  if (title.includes('Jupiter')) return 'Expansion and opportunity are incoming. Stay open to growth in the area Jupiter touches.';
  if (title.includes('Saturn')) return 'Discipline and structure are being tested. Commit to your responsibilities with patience.';
  if (title.includes('Rahu')) return 'Desires intensify. Channel ambition wisely and question illusions around what you chase.';
  if (title.includes('Ketu')) return 'Detachment and spiritual insight grow. Let go of what is completing its karmic cycle.';
  return 'Significant shifts in cosmic energy. Stay grounded and observe the changes within.';
}

function getMoonPhaseGuidance(title: string): string {
  if (title.includes('Purnima')) return 'Celebrate completions and express gratitude. Emotional clarity is at its peak tonight.';
  return 'Plant seeds of intention in silence. This is a powerful time for new beginnings.';
}

function getSpecialYogaGuidance(): string {
  return 'A rare auspicious alignment. Meditate, set intentions, or perform spiritual practices for amplified results.';
}

function generateEventsForMonth(year: number, month: number): CosmicEvent[] {
  const events: CosmicEvent[] = [];

  // Helper to check if a date range overlaps with this month
  const overlapsMonth = (start: string, end: string): boolean => {
    const s = new Date(start);
    const e = new Date(end);
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0);
    return s <= monthEnd && e >= monthStart;
  };

  // Mercury Retrograde
  const mercuryRetro = year === 2025 ? MERCURY_RETRO_2025 : MERCURY_RETRO_2026;
  for (const [start, end, title] of mercuryRetro) {
    if (overlapsMonth(start, end)) {
      // Show the event at the start date or the 1st of the month, whichever is later
      const sDate = new Date(start);
      const monthStart = new Date(year, month - 1, 1);
      const eventDate = sDate > monthStart ? sDate : monthStart;
      const dateStr = eventDate.toISOString().slice(0, 10);
      events.push({
        date: dateStr,
        title,
        type: 'retrograde',
        description: `Communication planet Mercury goes retrograde from ${start} to ${end}. Expect delays, misunderstandings, and revisiting past conversations. This is a time for reflection, not new beginnings.`,
        emotionalImpact: 4,
        emoji: '☿',
        guidance: getRetrogradeGuidance(title),
      });
    }
  }

  // Venus Retrograde
  for (const [start, end, title] of VENUS_RETRO) {
    if (overlapsMonth(start, end)) {
      const sDate = new Date(start);
      const monthStart = new Date(year, month - 1, 1);
      const eventDate = sDate > monthStart ? sDate : monthStart;
      const dateStr = eventDate.toISOString().slice(0, 10);
      events.push({
        date: dateStr,
        title,
        type: 'retrograde',
        description: `Venus retrograde from ${start} to ${end}. Relationships, values, and aesthetics come under review. Reconnect with past loves or reassess what truly brings you joy.`,
        emotionalImpact: 5,
        emoji: '♀',
        guidance: getRetrogradeGuidance(title),
      });
    }
  }

  // Eclipses
  const eclipses = year === 2025 ? ECLIPSES_2025 : ECLIPSES_2026;
  for (const [date, title, desc] of eclipses) {
    const d = new Date(date);
    if (d.getFullYear() === year && d.getMonth() + 1 === month) {
      events.push({
        date,
        title,
        type: 'eclipse',
        description: desc,
        emotionalImpact: title.includes('Solar') ? 4 : 5,
        emoji: title.includes('Solar') ? '🌑' : '🌕',
        guidance: getEclipseGuidance(title),
      });
    }
  }

  // Major transits
  const transits = year === 2025 ? TRANSITS_2025 : TRANSITS_2026;
  for (const [date, title, desc] of transits) {
    const d = new Date(date);
    if (d.getFullYear() === year && d.getMonth() + 1 === month) {
      events.push({
        date,
        title,
        type: 'transit',
        description: desc,
        emotionalImpact: title.includes('Jupiter') ? 3 : title.includes('Saturn') ? 4 : 3,
        emoji: title.includes('Jupiter') ? '♃' : title.includes('Saturn') ? '♄' : title.includes('Rahu') ? '☊' : '☋',
        guidance: getTransitGuidance(title),
      });
    }
  }

  // Moon phases
  const moonPhases = year === 2025 ? MOON_PHASES_2025 : MOON_PHASES_2026;
  for (const [date, title, desc] of moonPhases) {
    const d = new Date(date);
    if (d.getFullYear() === year && d.getMonth() + 1 === month) {
      events.push({
        date,
        title: title === 'Purnima' ? `Purnima (Full Moon)` : `Amavasya (New Moon)`,
        type: 'moonPhase',
        description: desc,
        emotionalImpact: title === 'Purnima' ? 3 : 2,
        emoji: title === 'Purnima' ? '🌕' : '🌑',
        guidance: getMoonPhaseGuidance(title),
      });
    }
  }

  // Special yogas
  const yogas = year === 2025 ? SPECIAL_YOGAS_2025 : SPECIAL_YOGAS_2026;
  for (const [date, title, desc] of yogas) {
    const d = new Date(date);
    if (d.getFullYear() === year && d.getMonth() + 1 === month) {
      events.push({
        date,
        title,
        type: 'specialYoga',
        description: desc,
        emotionalImpact: 3,
        emoji: '✦',
        guidance: getSpecialYogaGuidance(),
      });
    }
  }

  // Sort by date
  events.sort((a, b) => a.date.localeCompare(b.date));

  return events;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const monthParam = searchParams.get('month');
  const yearParam = searchParams.get('year');

  if (!monthParam || !yearParam) {
    return NextResponse.json(
      { error: 'Missing required query params: month and year' },
      { status: 400 }
    );
  }

  const month = parseInt(monthParam, 10);
  const year = parseInt(yearParam, 10);

  if (isNaN(month) || isNaN(year) || month < 1 || month > 12 || year < 2025 || year > 2026) {
    return NextResponse.json(
      { error: 'Invalid params. Month must be 1-12, year must be 2025 or 2026.' },
      { status: 400 }
    );
  }

  const cacheKey = `${year}-${String(month).padStart(2, '0')}`;

  // Check cache
  if (cache.has(cacheKey)) {
    return NextResponse.json({ events: cache.get(cacheKey), month, year });
  }

  const events = generateEventsForMonth(year, month);

  // Store in cache
  cache.set(cacheKey, events);

  return NextResponse.json({ events, month, year });
}
