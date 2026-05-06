'use client';

import { useState, useEffect } from 'react';
import { useAyuAstroStore, type TraitScore } from '@/store/ayuastro-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Star,
  Eye,
  ArrowRight,
  Sun,
  Moon,
  Compass,
  Shield,
  Heart,
  CheckCircle2,
  Zap,
  BookOpen,
  TrendingUp,
  Clock,
  Share2,
  ChevronDown,
  Flame,
  Droplets,
  Wind,
  Mountain,
  Orbit,
  Check,
  BarChart3,
  Calendar,
} from 'lucide-react';
import KundaliChart from './KundaliChart';
import ShareableCard from './ShareableCard';
import DashaTimeline, { generateDashaPeriods, type DashaPeriod } from './DashaTimeline';

const ZODIAC_ICONS: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋', Leo: '♌', Virgo: '♍',
  Libra: '♎', Scorpio: '♏', Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
};

const ZODIAC_ELEMENTS: Record<string, { element: string; modality: string; ruler: string; color: string }> = {
  Aries: { element: 'Fire', modality: 'Cardinal', ruler: 'Mars', color: 'text-red-500' },
  Taurus: { element: 'Earth', modality: 'Fixed', ruler: 'Venus', color: 'text-green-600' },
  Gemini: { element: 'Air', modality: 'Mutable', ruler: 'Mercury', color: 'text-yellow-500' },
  Cancer: { element: 'Water', modality: 'Cardinal', ruler: 'Moon', color: 'text-blue-400' },
  Leo: { element: 'Fire', modality: 'Fixed', ruler: 'Sun', color: 'text-orange-500' },
  Virgo: { element: 'Earth', modality: 'Mutable', ruler: 'Mercury', color: 'text-green-500' },
  Libra: { element: 'Air', modality: 'Cardinal', ruler: 'Venus', color: 'text-pink-400' },
  Scorpio: { element: 'Water', modality: 'Fixed', ruler: 'Pluto', color: 'text-purple-600' },
  Sagittarius: { element: 'Fire', modality: 'Mutable', ruler: 'Jupiter', color: 'text-purple-500' },
  Capricorn: { element: 'Earth', modality: 'Cardinal', ruler: 'Saturn', color: 'text-gray-600' },
  Aquarius: { element: 'Air', modality: 'Fixed', ruler: 'Uranus', color: 'text-cyan-500' },
  Pisces: { element: 'Water', modality: 'Mutable', ruler: 'Neptune', color: 'text-teal-400' },
};

const ELEMENT_ICONS: Record<string, React.ElementType> = {
  Fire: Flame,
  Earth: Mountain,
  Air: Wind,
  Water: Droplets,
};

// Daily cosmic insights based on current day of year
const COSMIC_INSIGHTS = [
  { title: 'Emotional Tide', message: 'The Moon\'s current transit amplifies your intuitive faculties. Trust the subtle signals your body sends today — they carry more cosmic weight than logic.', icon: Moon },
  { title: 'Cosmic Push', message: 'Mars activates your ambition sector. This is a day for bold emotional moves, not retreat. Express what you\'ve been holding back.', icon: Zap },
  { title: 'Inner Alignment', message: 'Venus harmonizes with your natal chart, creating a rare window for self-compassion. Today, be as gentle with yourself as you are with others.', icon: Heart },
  { title: 'Mental Clarity', message: 'Mercury\'s influence sharpens your communication pattern. Difficult conversations flow more naturally today — use this cosmic support.', icon: TrendingUp },
  { title: 'Deep Reflection', message: 'Saturn asks you to examine recurring patterns. The lesson you\'ve been avoiding is ready to be learned. Face it with courage.', icon: BookOpen },
  { title: 'Karmic Reset', message: 'Rahu-Ketu axis shifts perception today. What seemed like a weakness may reveal itself as your greatest emotional tool.', icon: Sparkles },
  { title: 'Nurturing Energy', message: 'Jupiter expands your emotional capacity. Today, you can hold space for others without depleting yourself. A rare gift — use it wisely.', icon: Shield },
];

// ─── Affirmation & Ritual Data ───────────────────────────────────────────────

const AFFIRMATIONS: Record<string, string[]> = {
  Aries: [
    'I honor my fire by choosing where to direct it, rather than letting it burn indiscriminately.',
    'My courage is a gift — today I use it to be gentle with myself.',
    'I am allowed to slow down without losing who I am.',
    'My strength includes the wisdom to know when to rest.',
    'I release the need to prove myself and settle into simply being myself.',
    'My passion is most powerful when paired with patience.',
    'I trust that acting with intention creates more impact than acting with speed.',
  ],
  Taurus: [
    'My need for stability is not stubbornness — it is wisdom that knows what matters.',
    'I am worthy of beautiful things, and I allow myself to receive them without guilt.',
    'I release what no longer serves my growth, even when it feels uncomfortable.',
    'My patience is a superpower that allows life to unfold perfectly.',
    'I am more than my possessions — my true wealth is inner peace.',
    'I trust the timing of my life and resist the urge to force outcomes.',
    'My sensitivity to beauty connects me to something sacred in every moment.',
  ],
  Gemini: [
    'My many interests are not scattered — they are the constellation of my brilliance.',
    'I trust my voice to carry what matters and release the need to explain everything.',
    'I am allowed to change my mind without apologizing for my evolution.',
    'My curiosity is a form of courage that keeps me growing.',
    'I honor both my need for connection and my need for space.',
    'The stories I tell myself matter — today I choose an empowering narrative.',
    'My adaptability is not inconsistency — it is intelligence in motion.',
  ],
  Cancer: [
    'My sensitivity is not a burden — it is the source of my deepest wisdom.',
    'I release the need to carry everyone\'s emotions and trust them to do their own work.',
    'I create safe spaces for others because I first learned to need one — now I give that to myself.',
    'My memory is a gift — today I use it to remember my strengths, not just my wounds.',
    'I am allowed to retreat and recharge without guilt.',
    'The love I give so freely to others, I now direct toward myself.',
    'My emotional depth is not too much — it is exactly enough for someone who truly sees me.',
  ],
  Leo: [
    'I shine brightest when I am authentic, not when I perform.',
    'My warmth is magnetic — I do not need to chase recognition; it finds me when I am real.',
    'I release the pressure to always be strong and allow myself to be human.',
    'My generosity flows from fullness, not from the need to be needed.',
    'I celebrate others without diminishing my own light.',
    'The stage I seek already exists within me — I am already enough.',
    'My courage to be seen inspires others to do the same.',
  ],
  Virgo: [
    'I release the need for perfection and embrace the beauty of being enough.',
    'My attention to detail is a gift — today I use it to notice what is going right.',
    'I am worthy of love and care exactly as I am, without needing to earn it through service.',
    'My desire to improve is beautiful, and so is accepting what already is.',
    'I trust that doing my best is always enough, even when it looks different than I imagined.',
    'I give myself the same compassion I so freely offer others.',
    'My standards are a form of self-respect, not self-criticism.',
  ],
  Libra: [
    'My desire for harmony is a gift — today I remember it must include harmony within myself.',
    'I am allowed to have preferences without weighing what others want first.',
    'Peace that requires me to silence my truth is not peace — it is self-abandonment.',
    'I trust my own judgment and release the need for constant external validation.',
    'My ability to see all sides is wisdom — today I let it guide me, not paralyze me.',
    'I choose relationships that are balanced, not ones where I do all the giving.',
    'My beauty is not just external — it radiates from the integrity of my choices.',
  ],
  Scorpio: [
    'My intensity is not too much — it is the depth that allows me to truly transform.',
    'I release what has died and trust that rebirth always follows endings.',
    'I do not need to control outcomes to be safe — surrender is my hidden power.',
    'My vulnerability is not weakness — it is the bravest thing I offer the world.',
    'I trust the process of transformation, even when I cannot see the other side yet.',
    'I allow myself to feel without needing to fix or understand everything immediately.',
    'My power comes from truth, not from secrets.',
  ],
  Sagittarius: [
    'My restlessness is the compass that leads me to growth — I trust its direction.',
    'I am allowed to commit without losing my freedom — the two are not enemies.',
    'My optimism is not naivety — it is the courage to believe in what is possible.',
    'I seek truth not just in faraway places, but in the depths of my own heart.',
    'I honor my need for adventure by finding it in both the extraordinary and the everyday.',
    'My humor is healing — today I let myself laugh at what usually feels heavy.',
    'I trust that meaning is always available, no matter where I am.',
  ],
  Capricorn: [
    'My ambition is fueled by purpose, not by the need to prove my worth.',
    'I am already worthy of respect — I do not need to earn it through achievement alone.',
    'I allow myself to rest without guilt, knowing rest is part of the architecture of success.',
    'My discipline is most powerful when it includes being gentle with myself.',
    'I celebrate how far I have come, not just how far I still have to go.',
    'I am more than my responsibilities — my heart deserves the same commitment I give my goals.',
    'I release the belief that struggle is the only path to success.',
  ],
  Aquarius: [
    'My vision for a better world begins with how I treat myself today.',
    'I honor my need for individuality without isolating myself from meaningful connection.',
    'My ideas matter, and I trust myself to express them even when they are unconventional.',
    'I am allowed to belong without conforming — the right people will appreciate the real me.',
    'My detachment is not coldness — it is the clarity that allows me to see what truly matters.',
    'I embrace my emotions as data, not disruptions, to my vision.',
    'The future I imagine starts with how I show up in this present moment.',
  ],
  Pisces: [
    'My empathy is a superpower — today I use it on myself first.',
    'I release the need to escape and trust that I am strong enough to be present.',
    'My sensitivity connects me to beauty that others miss — I honor this gift.',
    'I am grounded in my body even as my spirit reaches for something greater.',
    'I trust my intuition as a valid form of knowing, not just a feeling to override.',
    'My dreams are not impractical — they are blueprints for a life that feels true.',
    'I set boundaries not to keep people out, but to keep my energy available for what matters.',
  ],
};

const RITUAL_SUGGESTIONS = [
  { text: 'Write 3 things you\'re grateful for before getting out of bed', icon: '📝' },
  { text: 'Take 5 minutes of moon-gazing tonight', icon: '🌙' },
  { text: 'Journal your dream within 10 minutes of waking', icon: '💭' },
  { text: 'Light a candle and sit in silence for 3 minutes', icon: '🕯️' },
  { text: 'Write a letter to your future self — to open in 30 days', icon: '✉️' },
  { text: 'Take a mindful walk without your phone for 10 minutes', icon: '🚶' },
  { text: 'List 3 boundaries you\'d like to strengthen this week', icon: '🛡️' },
  { text: 'Place your hand on your heart and take 5 deep breaths', icon: '💗' },
  { text: 'Name one emotion you\'ve been avoiding, and let it be heard', icon: '🗣️' },
  { text: 'Create a small altar or sacred space with one meaningful object', icon: '🏛️' },
  { text: 'Drink a full glass of water with intention — "I nourish myself"', icon: '💧' },
  { text: 'Write down one thing you forgive yourself for today', icon: '🤍' },
  { text: 'Spend 2 minutes stretching while focusing on releasing tension', icon: '🧘' },
  { text: 'Look in the mirror and say one kind thing to yourself out loud', icon: '🪞' },
];

function deterministicHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

function getAffirmation(sunSign: string): string {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const hash = deterministicHash(today + sunSign);
  const pool = AFFIRMATIONS[sunSign] || AFFIRMATIONS['Capricorn'];
  return pool[hash % pool.length];
}

function getRitual(moonSign: string): typeof RITUAL_SUGGESTIONS[number] {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const hash = deterministicHash(String(dayOfYear) + moonSign);
  return RITUAL_SUGGESTIONS[hash % RITUAL_SUGGESTIONS.length];
}

const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const staggerItem = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function getTraitColor(score: number): string {
  if (score > 70) return 'bg-sage text-sage-dark';
  if (score >= 40) return 'bg-brown-700 text-white';
  return 'bg-gold text-brown-900';
}

function getTraitBarColor(score: number): string {
  if (score > 70) return 'bg-sage';
  if (score >= 40) return 'bg-brown-600';
  return 'bg-gold';
}

function getTopTraits(traits: TraitScore[], count: number = 3): TraitScore[] {
  return [...traits].sort((a, b) => b.score - a.score).slice(0, count);
}

function getArchetype(traits: TraitScore[]): string {
  if (traits.length === 0) return 'The Seeker';
  const top = getTopTraits(traits, 3);
  const names = top.map((t) => t.name.toLowerCase());
  if (names.includes('empathy') && names.includes('trust')) return 'The Empathic Guardian';
  if (names.includes('empathy')) return 'The Deep Feeler';
  if (names.includes('resilience')) return 'The Resilient Anchor';
  if (names.includes('communication')) return 'The Expressive Bridge';
  if (names.includes('ambition')) return 'The Driven Architect';
  if (names.includes('intuition')) return 'The Intuitive Oracle';
  return 'The Reflective Seeker';
}

function getArchetypeEmoji(archetype: string): string {
  const map: Record<string, string> = {
    'The Empathic Guardian': '🛡️',
    'The Deep Feeler': '🌊',
    'The Resilient Anchor': '⚓',
    'The Expressive Bridge': '🌉',
    'The Driven Architect': '🏗️',
    'The Intuitive Oracle': '🔮',
    'The Reflective Seeker': '🪞',
  };
  return map[archetype] || '✨';
}

function getStrengths(traits: TraitScore[]): string[] {
  return traits
    .filter((t) => t.score > 70)
    .slice(0, 4)
    .map((t) => t.label || t.name);
}

function getBlindSpots(traits: TraitScore[]): string[] {
  return traits
    .filter((t) => t.score < 40)
    .slice(0, 3)
    .map((t) => t.label || t.name);
}

function getDailyInsight() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return COSMIC_INSIGHTS[dayOfYear % COSMIC_INSIGHTS.length];
}

interface HoroscopeData {
  sunSign: string;
  moonSign: string;
  date: string;
  emotionalEnergy: string;
  focusArea: string;
  guidance: string;
  luckyElement: string;
}

interface TransitItem {
  planet: string;
  sign: string;
  house: number;
  type: 'major' | 'minor' | 'shadow';
  duration: string;
  effect: string;
  advice: string;
}

interface TransitsData {
  date: string;
  transits: TransitItem[];
  overallTheme: string;
  focusPeriod: string;
}

const PLANET_COLORS: Record<string, string> = {
  Saturn: 'bg-amber-900',
  Jupiter: 'bg-amber-500',
  Rahu: 'bg-purple-600',
  Ketu: 'bg-gray-500',
  Mercury: 'bg-emerald-500',
  Venus: 'bg-pink-400',
  Mars: 'bg-red-500',
  Sun: 'bg-yellow-500',
  Moon: 'bg-slate-400',
};

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mars: '♂', Mercury: '☿', Jupiter: '♃', Venus: '♀', Saturn: '♄', Rahu: '☊', Ketu: '☋',
};

const PLANET_DOT_COLORS: Record<string, string> = {
  Sun: 'bg-yellow-500', Moon: 'bg-slate-400', Mars: 'bg-red-500', Mercury: 'bg-emerald-500', Jupiter: 'bg-amber-500', Venus: 'bg-pink-400', Saturn: 'bg-amber-900', Rahu: 'bg-purple-600', Ketu: 'bg-gray-500',
};

const ELEMENT_COLORS: Record<string, { bar: string; bg: string; text: string; darkBar: string; darkBg: string; darkText: string }> = {
  Fire: { bar: 'bg-gradient-to-r from-red-500 to-orange-500', bg: 'bg-gradient-to-r from-red-50 to-orange-50', text: 'text-red-700', darkBar: 'dark:from-red-600 dark:to-orange-600', darkBg: 'dark:from-red-900/20 dark:to-orange-900/20', darkText: 'dark:text-red-300' },
  Earth: { bar: 'bg-gradient-to-r from-green-600 to-emerald-500', bg: 'bg-gradient-to-r from-green-50 to-emerald-50', text: 'text-green-700', darkBar: 'dark:from-green-600 dark:to-emerald-600', darkBg: 'dark:from-green-900/20 dark:to-emerald-900/20', darkText: 'dark:text-green-300' },
  Air: { bar: 'bg-gradient-to-r from-yellow-400 to-amber-400', bg: 'bg-gradient-to-r from-yellow-50 to-amber-50', text: 'text-yellow-700', darkBar: 'dark:from-yellow-500 dark:to-amber-500', darkBg: 'dark:from-yellow-900/20 dark:to-amber-900/20', darkText: 'dark:text-yellow-300' },
  Water: { bar: 'bg-gradient-to-r from-blue-500 to-teal-400', bg: 'bg-gradient-to-r from-blue-50 to-teal-50', text: 'text-blue-700', darkBar: 'dark:from-blue-500 dark:to-teal-500', darkBg: 'dark:from-blue-900/20 dark:to-teal-900/20', darkText: 'dark:text-blue-300' },
};

const ELEMENT_QUALITIES: Record<string, string> = {
  Fire: 'Passion, initiative, courage',
  Earth: 'Stability, patience, practicality',
  Air: 'Communication, adaptability, intellect',
  Water: 'Emotion, intuition, depth',
};

const TRANSIT_TYPE_STYLES: Record<string, string> = {
  major: 'bg-sage-muted text-sage-dark',
  shadow: 'bg-purple-100 text-purple-700',
  minor: 'bg-brown-50 text-brown-500',
};

export default function InsightsView() {
  const { traitScores, astrologyData, numerologyData, birthDetails, setView } = useAyuAstroStore();

  const [horoscope, setHoroscope] = useState<HoroscopeData | null>(null);
  const [horoscopeLoading, setHoroscopeLoading] = useState(true);
  const [horoscopeExpanded, setHoroscopeExpanded] = useState(false);
  const [dashaPeriods, setDashaPeriods] = useState<DashaPeriod[]>([]);

  const [transits, setTransits] = useState<TransitsData | null>(null);
  const [transitsLoading, setTransitsLoading] = useState(true);
  const [expandedTransits, setExpandedTransits] = useState<Record<string, boolean>>({});
  const [planetaryExpanded, setPlanetaryExpanded] = useState(false);
  const [ritualCompleted, setRitualCompleted] = useState(false);

  const topTraits = getTopTraits(traitScores);
  const archetype = getArchetype(traitScores);
  const strengths = getStrengths(traitScores);
  const blindSpots = getBlindSpots(traitScores);
  const dailyInsight = getDailyInsight();
  const DailyIcon = dailyInsight.icon;

  const topTags =
    traitScores.length > 0
      ? topTraits.map((t) => t.label || t.name)
      : ['Reflective', 'Intuitive', 'Grounded'];

  const sunSign = astrologyData?.sunSign || 'Capricorn';
  const moonSign = astrologyData?.moonSign || 'Gemini';
  const ascendant = astrologyData?.ascendant || 'Taurus';
  const sunElement = ZODIAC_ELEMENTS[sunSign];

  // Fetch daily horoscope
  useEffect(() => {
    async function fetchHoroscope() {
      setHoroscopeLoading(true);
      try {
        const res = await fetch(`/api/horoscope/daily?sunSign=${encodeURIComponent(sunSign)}&moonSign=${encodeURIComponent(moonSign)}`);
        if (res.ok) {
          const json = await res.json();
          setHoroscope(json.data);
        }
      } catch {
        // Silently fail — horoscope is a nice-to-have
      } finally {
        setHoroscopeLoading(false);
      }
    }
    fetchHoroscope();
  }, [sunSign, moonSign]);

  // Fetch planetary transits
  useEffect(() => {
    async function fetchTransits() {
      setTransitsLoading(true);
      try {
        const res = await fetch(`/api/transits/current?sunSign=${encodeURIComponent(sunSign)}&moonSign=${encodeURIComponent(moonSign)}&ascendant=${encodeURIComponent(ascendant)}`);
        if (res.ok) {
          const json = await res.json();
          setTransits(json.data);
        }
      } catch {
        // Silently fail — transits are a nice-to-have
      } finally {
        setTransitsLoading(false);
      }
    }
    fetchTransits();
  }, [sunSign, moonSign, ascendant]);

  const ElementIcon = ELEMENT_ICONS[sunElement?.element || 'Fire'] || Flame;

  // Deterministic daily affirmation and ritual
  const affirmation = getAffirmation(sunSign);
  const ritual = getRitual(moonSign);

  // Generate Dasha periods from birth date
  useEffect(() => {
    const dob = birthDetails?.dateOfBirth;
    if (dob) {
      setDashaPeriods(generateDashaPeriods(dob));
    } else {
      // Default to a reasonable birth date for demo purposes
      setDashaPeriods(generateDashaPeriods('1995-06-15'));
    }
  }, [birthDetails?.dateOfBirth]);

  return (
    <div className="bg-cream px-4 py-6 pb-24 relative">
      {/* Decorative star constellation pattern at top with twinkle */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-center gap-3 py-2 select-none pointer-events-none overflow-hidden" aria-hidden="true">
        {'♈♉♊♋♌♍♎♏♐♑♒♓'.split('').map((sym, i) => (
          <span
            key={i}
            className="text-brown-100/50 dark:text-brown-50/15 text-sm animate-twinkle"
            style={{ animationDelay: `${i * 0.25}s` }}
          >
            {sym}
          </span>
        ))}
      </div>
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="mx-auto max-w-lg space-y-6"
      >

        {/* Daily Cosmic Insight Card */}
        <motion.div variants={staggerItem}>
          <Card className="glass border-0 shadow-md overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-brown-100/20 dark:from-gold/3 dark:via-transparent dark:to-brown-50/10" />
            <CardContent className="relative p-5">
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gold/10">
                  <DailyIcon className="size-5 text-gold-dark" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className="bg-gold/10 text-gold-dark border-0 text-[10px] px-2 py-0 tracking-wider uppercase">
                      Today&apos;s Insight
                    </Badge>
                    <Clock className="size-3 text-brown-300" />
                  </div>
                  <h3
                    className="font-serif text-base font-bold text-brown-900 mb-1"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    {dailyInsight.title}
                  </h3>
                  <p className="text-sm text-brown-500 leading-relaxed">
                    {dailyInsight.message}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Daily Affirmation & Ritual Card — pulsing glow border */}
        <motion.div variants={staggerItem}>
          <Card className="border-0 shadow-md overflow-hidden relative animate-breathe-glow">
            {/* Decorative top accent bar */}
            <div className="h-1 bg-gradient-to-r from-gold via-sage to-gold-dark" />
            <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-sage-muted/10 dark:from-gold/3 dark:to-sage/5" />
            <CardContent className="relative p-5">
              {/* Affirmation Section */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-gold/10 text-gold-dark dark:bg-gold/15 dark:text-gold border-0 text-[10px] px-2 py-0 tracking-wider uppercase">
                    ✦ Today&apos;s Affirmation
                  </Badge>
                </div>
                <div className="relative pl-4">
                  <span
                    className="absolute -left-0.5 -top-1 text-gold/40 dark:text-gold/30 text-2xl font-serif select-none"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                    aria-hidden="true"
                  >
                    ✦
                  </span>
                  <p
                    className="italic text-brown-800 dark:text-brown-200 leading-relaxed text-[15px]"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    {affirmation}
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gold/10 dark:border-gold/5 my-3" />

              {/* Ritual Section */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="size-3.5 text-sage-dark dark:text-sage" />
                  <Badge className="bg-sage-muted text-sage-dark dark:bg-sage/20 dark:text-sage border-0 text-[10px] px-2 py-0 tracking-wider uppercase">
                    Today&apos;s Ritual
                  </Badge>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="text-lg shrink-0 mt-0.5">{ritual.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm text-brown-700 dark:text-brown-300 leading-relaxed">
                      {ritual.text}
                    </p>
                  </div>
                </div>

                {/* Mark as Done Button */}
                <div className="mt-3">
                  <AnimatePresence mode="wait">
                    {ritualCompleted ? (
                      <motion.div
                        key="completed"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, type: 'spring', stiffness: 300 }}
                        className="flex items-center gap-2"
                      >
                        <Badge className="bg-sage-muted text-sage-dark dark:bg-sage/20 dark:text-sage border-0 text-xs px-3 py-1 flex items-center gap-1.5">
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.1, type: 'spring', stiffness: 500 }}
                          >
                            <Check className="size-3.5" />
                          </motion.div>
                          Completed ✓
                        </Badge>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="button"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setRitualCompleted(true)}
                          className="border-sage/30 text-sage-dark dark:border-sage/30 dark:text-sage hover:bg-sage-muted/30 dark:hover:bg-sage/10 text-xs h-8 px-3"
                        >
                          <Sparkles className="size-3 mr-1.5" />
                          Mark as Done
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Daily Horoscope Card */}
        <motion.div variants={staggerItem}>
          <Card className="glass border-0 shadow-md bg-white dark:bg-white/5 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-sage via-gold to-brown-300" />
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-gold/10 to-sage-muted">
                  <span className="text-2xl">{ZODIAC_ICONS[sunSign]}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className="bg-sage-muted text-sage-dark border-0 text-[10px] px-2 py-0 tracking-wider uppercase">
                      Daily Horoscope
                    </Badge>
                    {sunElement && (
                      <Badge className="bg-brown-50 text-brown-500 border-0 text-[10px] px-2 py-0 flex items-center gap-1">
                        <ElementIcon className="size-2.5" />
                        {sunElement.element}
                      </Badge>
                    )}
                  </div>
                  <h3
                    className="font-serif text-base font-bold text-brown-900 mb-1"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    {sunSign} — Today
                  </h3>

                  {horoscopeLoading ? (
                    <div className="space-y-2">
                      <div className="h-3 w-full rounded bg-brown-100 animate-pulse" />
                      <div className="h-3 w-3/4 rounded bg-brown-100 animate-pulse" />
                    </div>
                  ) : horoscope ? (
                    <>
                      <p className="text-sm text-brown-500 leading-relaxed">
                        {horoscope.emotionalEnergy}
                      </p>
                      <Collapsible open={horoscopeExpanded} onOpenChange={setHoroscopeExpanded}>
                        <CollapsibleTrigger asChild>
                          <button className="mt-2 text-xs font-medium text-gold-dark hover:text-gold flex items-center gap-1 transition-colors">
                            {horoscopeExpanded ? 'Show Less' : 'Read More'}
                            <ChevronDown className={`size-3 transition-transform ${horoscopeExpanded ? 'rotate-180' : ''}`} />
                          </button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="mt-3 space-y-3">
                            <div className="rounded-lg bg-brown-50 p-3">
                              <p className="text-[10px] uppercase tracking-wider text-brown-400 mb-1">Focus Area</p>
                              <p className="text-sm text-brown-700">{horoscope.focusArea}</p>
                            </div>
                            <div className="rounded-lg bg-gold/5 p-3">
                              <p className="text-[10px] uppercase tracking-wider text-gold-dark mb-1">Guidance</p>
                              <p className="text-sm text-brown-700">{horoscope.guidance}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] uppercase tracking-wider text-brown-400">Lucky Element:</span>
                              <Badge className="bg-gold/10 text-gold-dark border-0 text-xs">
                                ✦ {horoscope.luckyElement}
                              </Badge>
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    </>
                  ) : (
                    <p className="text-sm text-brown-400">Unable to load horoscope. Try again later.</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Planetary Transits Card */}
        <motion.div variants={staggerItem}>
          <Card className="border-0 shadow-sm bg-white dark:bg-white/5 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-purple-400 via-amber-500 to-sage" />
            <CardContent className="p-5">
              <div className="flex items-start gap-3 mb-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-amber-100 dark:from-purple-900/30 dark:to-amber-900/30">
                  <Orbit className="size-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-0 text-[10px] px-2 py-0 tracking-wider uppercase">
                      Planetary Transits
                    </Badge>
                  </div>
                  <h3
                    className="font-serif text-base font-bold text-brown-900 mb-1"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    Current Cosmic Weather
                  </h3>
                </div>
              </div>

              {transitsLoading ? (
                <div className="space-y-3">
                  <div className="h-3 w-full rounded bg-brown-100 animate-pulse" />
                  <div className="h-3 w-3/4 rounded bg-brown-100 animate-pulse" />
                  <div className="h-12 w-full rounded-lg bg-brown-50 animate-pulse" />
                </div>
              ) : transits ? (
                <div className="space-y-3">
                  {/* Overall Theme */}
                  <div className="rounded-lg bg-gradient-to-r from-purple-50 to-amber-50 dark:from-purple-900/10 dark:to-amber-900/10 p-3">
                    <p className="text-xs font-semibold text-purple-700 dark:text-purple-300 mb-1 uppercase tracking-wider">Overall Theme</p>
                    <p className="text-sm text-brown-700 dark:text-brown-300 leading-relaxed">{transits.overallTheme}</p>
                    <p className="text-[10px] text-brown-400 mt-1">Focus: {transits.focusPeriod}</p>
                  </div>

                  {/* Transit List */}
                  <div className="space-y-2">
                    {transits.transits.map((transit) => (
                      <Collapsible
                        key={transit.planet}
                        open={expandedTransits[transit.planet] || false}
                        onOpenChange={(open) =>
                          setExpandedTransits((prev) => ({ ...prev, [transit.planet]: open }))
                        }
                      >
                        <div className="rounded-lg border border-brown-100 dark:border-brown-700/30 overflow-hidden">
                          <CollapsibleTrigger asChild>
                            <button className="w-full text-left p-3 hover:bg-brown-50 dark:hover:bg-brown-800/20 transition-colors">
                              <div className="flex items-center gap-2">
                                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${PLANET_COLORS[transit.planet] || 'bg-gray-400'}`} />
                                <span className="text-sm font-semibold text-brown-900 dark:text-brown-100">{transit.planet}</span>
                                <span className="text-xs text-brown-400">in {transit.sign}</span>
                                <span className="text-xs text-brown-300">• House {transit.house}</span>
                                <Badge className={`${TRANSIT_TYPE_STYLES[transit.type] || 'bg-brown-50 text-brown-500'} border-0 text-[9px] px-1.5 py-0 ml-auto`}>
                                  {transit.type === 'major' ? 'Major' : transit.type === 'shadow' ? 'Shadow' : 'Minor'}
                                </Badge>
                                <ChevronDown className={`size-3.5 text-brown-300 transition-transform ${expandedTransits[transit.planet] ? 'rotate-180' : ''}`} />
                              </div>
                              <p className="text-xs text-brown-500 dark:text-brown-400 mt-1 line-clamp-2">
                                {transit.effect}
                              </p>
                            </button>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="px-3 pb-3 pt-1 space-y-2 border-t border-brown-100 dark:border-brown-700/30">
                              <div className="rounded-lg bg-brown-50 dark:bg-brown-800/20 p-3">
                                <p className="text-[10px] uppercase tracking-wider text-brown-400 mb-1">Full Effect</p>
                                <p className="text-sm text-brown-700 dark:text-brown-300 leading-relaxed">{transit.effect}</p>
                              </div>
                              <div className="rounded-lg bg-gold/5 dark:bg-gold/10 p-3">
                                <p className="text-[10px] uppercase tracking-wider text-gold-dark dark:text-gold mb-1">Advice</p>
                                <p className="text-sm text-brown-700 dark:text-brown-300 leading-relaxed">{transit.advice}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-brown-400">Duration:</span>
                                <span className="text-xs font-medium text-brown-600 dark:text-brown-300">{transit.duration}</span>
                              </div>
                            </div>
                          </CollapsibleContent>
                        </div>
                      </Collapsible>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-brown-400">Unable to load planetary transits. Try again later.</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Cosmic Calendar Card */}
        <motion.div variants={staggerItem}>
          <Card
            className="border-0 shadow-md bg-white dark:bg-white/5 overflow-hidden card-hover cursor-pointer"
            onClick={() => setView('calendar')}
          >
            <div className="h-1 bg-gradient-to-r from-gold via-amber-400 to-sage" />
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-gold/20 to-sage/20 dark:from-gold/10 dark:to-sage/10">
                  <Calendar className="size-5 text-gold-dark dark:text-gold" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className="bg-gold/15 text-gold-dark dark:bg-gold/20 dark:text-gold border-0 text-[10px] px-2 py-0 tracking-wider uppercase">
                      Calendar
                    </Badge>
                  </div>
                  <h3
                    className="font-serif text-base font-bold text-brown-900 dark:text-brown-100"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    Cosmic Calendar
                  </h3>
                  <p className="text-xs text-brown-400 dark:text-brown-400 mt-0.5">
                    Upcoming cosmic events and their emotional impact
                  </p>
                </div>
                <ArrowRight className="size-4 text-brown-300 dark:text-brown-400 shrink-0 mt-1" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Header Section — with parallax scroll effect */}
        <motion.div variants={staggerItem} style={{ willChange: 'transform' }}>
          <div className="relative flex items-start justify-between">
            {/* Decorative zodiac constellation pattern behind header */}
            <div className="absolute -top-4 -left-2 text-brown-100/40 dark:text-brown-50/10 text-3xl tracking-[0.6em] leading-relaxed select-none pointer-events-none z-0" aria-hidden="true">
              <div>♈ ♉ ♊</div>
              <div className="ml-2">♋ ♌ ♍</div>
            </div>
            <div className="relative z-10">
              <h1
                className="font-serif text-3xl font-bold text-brown-900 mb-1"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Your Emotional Resonance
              </h1>
              <p className="text-sm text-brown-400 mb-4">
                The architecture of your emotional world, mapped through cosmic and behavioral patterns.
              </p>
            </div>
            {/* Share Profile Button */}
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0 border-gold/30 text-gold-dark hover:bg-gold/5 hover:text-gold-dark"
                >
                  <Share2 className="size-3.5 mr-1" />
                  Share
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-cream">
                <DialogHeader>
                  <DialogTitle
                    className="font-serif text-center text-xl"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    Share Your Cosmic Profile
                  </DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <ShareableCard />
                </div>
                <p className="text-center text-xs text-brown-400">
                  Screenshot this card to share on social media
                </p>
              </DialogContent>
            </Dialog>
          </div>
          <div className="relative z-10 flex flex-wrap gap-2">
            {topTags.map((tag, i) => (
              <Badge
                key={i}
                className={`${i === 0 ? 'bg-sage-muted text-sage-dark' : i === 1 ? 'bg-gold/10 text-gold-dark' : 'bg-brown-50 text-brown-600'} border-0 text-xs font-medium`}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </motion.div>

        {/* The Anchor Section */}
        <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.1 }}>
          <Card className="glass-premium zodiac-corner relative card-hover border-0 shadow-md overflow-hidden animate-border-shimmer">
            <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-gold/3 dark:from-gold/3 dark:via-transparent dark:to-gold/2 pointer-events-none" />
            <div className="h-1 bg-gradient-to-r from-gold via-brown-300 to-sage" />
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-brown-900">
                <Compass className="size-5 text-gold" />
                The Anchor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-3">
                <motion.span
                  className="text-3xl inline-block"
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                >{getArchetypeEmoji(archetype)}</motion.span>
                <p className="font-serif text-xl font-bold text-brown-900" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  {archetype}
                </p>
              </div>
              <p className="text-sm text-brown-500 leading-relaxed">
                {traitScores.length > 0
                  ? `Your emotional profile is anchored by ${topTraits[0]?.label || 'deep sensitivity'}. You process the world through a lens of ${topTraits[1]?.label || 'intuitive understanding'}, finding stability in ${topTraits[2]?.label || 'inner reflection'}. This triad forms the core of how you relate to yourself and others.`
                  : 'Your emotional profile is anchored by deep sensitivity and intuitive understanding. You process the world through a reflective lens, finding meaning in the patterns others miss.'}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Duality of Self Section */}
        <motion.div variants={staggerItem}>
          <Card className="glass-light card-hover border-0 shadow-md">
            <CardContent className="p-6">
              <h3
                className="font-serif text-lg font-bold text-brown-900 mb-4"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Duality of Self
              </h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Strengths */}
                <div className="rounded-xl bg-sage-muted/50 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="size-4 text-gold" />
                    <span className="text-sm font-semibold text-brown-900">Inherent Strengths</span>
                  </div>
                  <div className="space-y-2">
                    {strengths.length > 0 ? (
                      strengths.map((s, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <CheckCircle2 className="size-3.5 text-sage-dark shrink-0" />
                          <span className="text-sm text-brown-700">{s}</span>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="flex items-center gap-2"><CheckCircle2 className="size-3.5 text-sage-dark shrink-0" /><span className="text-sm text-brown-700">Deep Empathy</span></div>
                        <div className="flex items-center gap-2"><CheckCircle2 className="size-3.5 text-sage-dark shrink-0" /><span className="text-sm text-brown-700">Intuitive Wisdom</span></div>
                        <div className="flex items-center gap-2"><CheckCircle2 className="size-3.5 text-sage-dark shrink-0" /><span className="text-sm text-brown-700">Emotional Resilience</span></div>
                      </>
                    )}
                  </div>
                </div>

                {/* Decorative gold divider between sections */}
                <div className="hidden sm:block absolute left-1/2 top-8 bottom-8 w-px bg-gradient-to-b from-transparent via-gold/30 to-transparent" />

                {/* Blind Spots */}
                <div className="rounded-xl bg-gold/5 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Eye className="size-4 text-gold-dark" />
                    <span className="text-sm font-semibold text-brown-900">Subtle Blind Spots</span>
                  </div>
                  <div className="space-y-2">
                    {blindSpots.length > 0 ? (
                      blindSpots.map((s, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Shield className="size-3.5 text-gold-dark shrink-0" />
                          <span className="text-sm text-brown-700">{s}</span>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="flex items-center gap-2"><Shield className="size-3.5 text-gold-dark shrink-0" /><span className="text-sm text-brown-700">Boundary Setting</span></div>
                        <div className="flex items-center gap-2"><Shield className="size-3.5 text-gold-dark shrink-0" /><span className="text-sm text-brown-700">Self-Advocacy</span></div>
                        <div className="flex items-center gap-2"><Shield className="size-3.5 text-gold-dark shrink-0" /><span className="text-sm text-brown-700">Delegation</span></div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Trait Scores Display */}
        <motion.div variants={staggerItem}>
          <Card className="card-hover border-0 shadow-md bg-white dark:bg-white/5">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-brown-900">
                <Sparkles className="size-5 text-gold" />
                Emotional Trait Map
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(traitScores.length > 0 ? traitScores : getDefaultTraits()).map((trait, i) => (
                  <div key={trait.name} className="space-y-1.5 rounded-lg px-2 py-1 hover:bg-gold/5 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-brown-800">{trait.label || trait.name}</span>
                        {trait.score > 85 && <span className="text-gold text-xs" title="Exceptional">✦</span>}
                        {trait.description && (
                          <span className="text-[10px] text-brown-300 hidden sm:inline">— {trait.description}</span>
                        )}
                      </div>
                      <Badge className={`${getTraitColor(trait.score)} border-0 text-xs px-2 py-0`}>
                        {Math.round(trait.score)}%
                      </Badge>
                    </div>
                    <div className="h-2.5 rounded-full bg-brown-100 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${trait.score}%` }}
                        viewport={{ once: true, margin: '-20px' }}
                        transition={{ duration: 0.8, delay: 0.08 * i, ease: 'easeOut' }}
                        className={`h-full rounded-full ${getTraitBarColor(trait.score)}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
              {/* Legend */}
              <div className="mt-4 pt-3 border-t border-brown-100 flex items-center gap-4 text-[10px] text-brown-400">
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-sage" /> High (70+)</div>
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-brown-600" /> Moderate (40-70)</div>
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gold" /> Growth Area (&lt;40)</div>
              </div>
              {/* Expand to Dashboard */}
              <div className="mt-4 pt-3 border-t border-brown-100 dark:border-brown-700/30">
                <button
                  onClick={() => setView('dashboard')}
                  className="w-full flex items-center justify-between rounded-xl bg-gradient-to-r from-gold/5 to-sage-muted/30 dark:from-gold/10 dark:to-sage/10 px-4 py-3 group hover:from-gold/10 hover:to-sage-muted/40 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <BarChart3 className="size-4 text-gold-dark dark:text-gold" />
                    <span className="text-sm font-medium text-brown-800 dark:text-brown-200" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                      View Full Dashboard
                    </span>
                  </div>
                  <ArrowRight className="size-4 text-gold-dark dark:text-gold group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Numerology Summary Card */}
        {numerologyData && (
          <motion.div variants={staggerItem}>
            <Card className="glass-light card-hover border-0 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-brown-900">
                  <Sparkles className="size-5 text-gold" />
                  Numerology Blueprint
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Life Path', value: numerologyData.lifePathNumber, desc: numerologyData.lifePathDesc },
                    { label: 'Destiny', value: numerologyData.destinyNumber, desc: numerologyData.destinyDesc },
                    { label: 'Soul Urge', value: numerologyData.soulUrgeNumber, desc: numerologyData.soulUrgeDesc },
                    { label: 'Personality', value: numerologyData.personalityNumber, desc: '' },
                  ].map((item, i) => (
                    <div key={i} className="rounded-xl bg-gradient-to-br from-brown-50 to-cream-dark dark:from-brown-50/50 dark:to-cream-dark/50 p-4 text-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-radial-[at_50%_30%] from-gold/5 to-transparent pointer-events-none" />
                      <p className="text-[10px] uppercase tracking-widest text-brown-400 mb-1">{item.label}</p>
                      <p
                        className="font-serif text-3xl font-bold text-brown-900 mb-1"
                        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                      >
                        {item.value}
                      </p>
                      {item.desc && (
                        <p className="text-[10px] text-brown-400 leading-tight line-clamp-2">{item.desc.split('.')[0]}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Elemental Balance Card */}
        <motion.div variants={staggerItem}>
          <Card className="glass-light card-hover border-0 shadow-md overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-red-400 via-green-400 via-yellow-400 to-blue-400" />
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-brown-900">
                <Sparkles className="size-5 text-gold" />
                Elemental Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const signElements = [sunSign, moonSign, ascendant]
                  .map(s => ZODIAC_ELEMENTS[s]?.element)
                  .filter(Boolean);
                const counts: Record<string, number> = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
                signElements.forEach(el => { if (el) counts[el]++; });
                const dominantElement = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];

                return (
                  <div className="space-y-3">
                    {(['Fire', 'Earth', 'Air', 'Water'] as const).map((element) => {
                      const count = counts[element];
                      const pct = Math.round((count / 3) * 100);
                      const colors = ELEMENT_COLORS[element];
                      const ElIcon = ELEMENT_ICONS[element];
                      return (
                        <div key={element} className={`rounded-lg p-3 ${colors.bg} ${colors.darkBg}`}>
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <ElIcon className={`size-4 ${colors.text} ${colors.darkText}`} />
                              <span className={`text-sm font-semibold ${colors.text} ${colors.darkText}`}>{element}</span>
                            </div>
                            <span className={`text-xs font-bold ${colors.text} ${colors.darkText}`}>{pct}%</span>
                          </div>
                          <div className="h-2.5 rounded-full bg-white/50 dark:bg-white/10 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.8, ease: 'easeOut' }}
                              className={`h-full rounded-full ${colors.bar} ${colors.darkBar}`}
                            />
                          </div>
                          <p className="text-[10px] text-brown-400 dark:text-brown-300 mt-1">
                            {count} of 3 signs • {ELEMENT_QUALITIES[element]}
                          </p>
                        </div>
                      );
                    })}
                    <div className="rounded-lg bg-gold/5 dark:bg-gold/10 p-3 animate-breathe-glow">
                      <p className="text-[10px] uppercase tracking-wider text-gold-dark dark:text-gold mb-1">Dominant Element</p>
                      <div className="flex items-center gap-2">
                        {(() => { const DIcon = ELEMENT_ICONS[dominantElement]; return <DIcon className="size-4 text-gold-dark animate-pulse-soft" />; })()}
                        <span className="text-sm font-semibold text-brown-900 dark:text-brown-100">{dominantElement}</span>
                        <span className="text-xs text-brown-400">— {ELEMENT_QUALITIES[dominantElement]}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </motion.div>

        {/* Astrology Summary Card with Kundali Chart */}
        <motion.div variants={staggerItem}>
          <Card className="glass-premium zodiac-corner relative card-hover border-0 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-brown-900">
                <Moon className="size-5 text-gold" />
                Vedic Astrology Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Three Sign Cards */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { label: 'Sun', sign: sunSign, icon: <Sun className="mx-auto mb-1 size-5 text-gold" /> },
                  { label: 'Moon', sign: moonSign, icon: <Moon className="mx-auto mb-1 size-5 text-brown-400" /> },
                  { label: 'Ascendant', sign: ascendant, icon: <Compass className="mx-auto mb-1 size-5 text-brown-500" /> },
                ].map((item, i) => {
                  const info = ZODIAC_ELEMENTS[item.sign];
                  return (
                    <div key={i} className="text-center rounded-xl bg-brown-50 dark:bg-brown-50/50 p-3">
                      {item.icon}
                      <p className="text-[10px] uppercase tracking-wider text-brown-400">{item.label}</p>
                      <p className="text-sm font-semibold text-brown-900">{item.sign}</p>
                      <span className="text-lg">{ZODIAC_ICONS[item.sign]}</span>
                      {info && (
                        <div className="mt-1">
                          <Badge className="bg-white/60 text-brown-500 border-0 text-[8px] px-1.5 py-0">
                            {info.element}
                          </Badge>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Nakshatra & Dasha */}
              <Separator className="my-3 bg-brown-100" />
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-brown-400">Nakshatra</p>
                  <p className="text-sm font-medium text-brown-900">
                    {astrologyData?.nakshatra || 'Revati'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-brown-400">Current Dasha</p>
                  <p className="text-sm font-medium text-brown-900">
                    {astrologyData?.currentDasha || 'Venus/Sun'}
                  </p>
                </div>
              </div>

              {/* Kundali Chart */}
              <Separator className="my-3 bg-brown-100" />
              <div className="mb-3">
                <p className="text-xs font-medium text-brown-400 mb-3 uppercase tracking-wider">Birth Chart — North Indian Style</p>
                <KundaliChart
                  planetaryPositions={astrologyData?.planetaryPositions || {}}
                  ascendant={ascendant}
                  sunSign={sunSign}
                  moonSign={moonSign}
                />
              </div>

              {/* Planetary Positions Table */}
              <Separator className="my-3 bg-brown-100" />
              <Collapsible open={planetaryExpanded} onOpenChange={setPlanetaryExpanded}>
                <CollapsibleTrigger asChild>
                  <button className="w-full flex items-center justify-between py-2 hover:bg-brown-50 dark:hover:bg-brown-800/20 rounded-lg px-2 transition-colors">
                    <span className="text-xs font-medium text-brown-400 uppercase tracking-wider">Planetary Positions</span>
                    <ChevronDown className={`size-4 text-brown-300 transition-transform ${planetaryExpanded ? 'rotate-180' : ''}`} />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="overflow-x-auto -mx-1">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-brown-100 dark:border-brown-700/30">
                          <th className="text-left py-2 px-2 text-[10px] uppercase tracking-wider text-brown-400 font-medium">Planet</th>
                          <th className="text-left py-2 px-2 text-[10px] uppercase tracking-wider text-brown-400 font-medium">Sign</th>
                          <th className="text-center py-2 px-2 text-[10px] uppercase tracking-wider text-brown-400 font-medium">Degree</th>
                          <th className="text-center py-2 px-2 text-[10px] uppercase tracking-wider text-brown-400 font-medium">House</th>
                          <th className="text-center py-2 px-2 text-[10px] uppercase tracking-wider text-brown-400 font-medium">Retro</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(astrologyData?.planetaryPositions || {}).map(([planet, data]) => (
                          <tr key={planet} className="border-b border-brown-50 dark:border-brown-700/20 hover:bg-brown-50/50 dark:hover:bg-brown-800/10 transition-colors">
                            <td className="py-2 px-2">
                              <div className="flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full shrink-0 ${PLANET_DOT_COLORS[planet] || 'bg-gray-400'}`} />
                                <span className="text-base leading-none">{PLANET_SYMBOLS[planet] || '●'}</span>
                                <span className="font-medium text-brown-900 dark:text-brown-100">{planet}</span>
                              </div>
                            </td>
                            <td className="py-2 px-2">
                              <span className="text-brown-700 dark:text-brown-300">{ZODIAC_ICONS[data.sign] || ''} {data.sign}</span>
                            </td>
                            <td className="py-2 px-2 text-center text-brown-500 dark:text-brown-400">{data.degree.toFixed(1)}°</td>
                            <td className="py-2 px-2 text-center text-brown-500 dark:text-brown-400">{data.house}</td>
                            <td className="py-2 px-2 text-center">
                              {data.retrograde ? (
                                <span className="text-xs font-bold text-gold-dark dark:text-gold">℞</span>
                              ) : (
                                <span className="text-brown-200 dark:text-brown-600">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Yogas & Doshas — Clickable Link */}
              <Separator className="my-3 bg-brown-100 dark:bg-brown-100/20" />
              <button
                onClick={() => setView('yogaDosha')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-sage-muted/20 to-gold/5 dark:from-sage/10 dark:to-gold/5 hover:from-sage-muted/30 hover:to-gold/10 dark:hover:from-sage/15 dark:hover:to-gold/10 transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-gold/10 dark:bg-gold/15">
                    <Sparkles className="size-4 text-gold-dark dark:text-gold" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-brown-900 dark:text-brown-100">
                      View Your Yogas ({astrologyData?.yogas?.length || 0}) &amp; Doshas ({astrologyData?.doshas?.length || 0})
                    </p>
                    <p className="text-[10px] text-brown-400 dark:text-brown-500">
                      Cosmic blessings &amp; karmic lessons
                    </p>
                  </div>
                </div>
                <ArrowRight className="size-4 text-brown-300 dark:text-brown-500 group-hover:text-gold-dark dark:group-hover:text-gold transition-colors" />
              </button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Dasha Timeline */}
        {dashaPeriods.length > 0 && (
          <motion.div variants={staggerItem}>
            <DashaTimeline dashaPeriods={dashaPeriods} />
          </motion.div>
        )}

        {/* CTA — cosmic gradient background with floating dots */}
        <motion.div variants={staggerItem}>
          <Card className="card-hover border-0 shadow-md overflow-hidden relative">
            {/* Cosmic gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-gold/8 via-brown-700/5 to-sage/8 dark:from-gold/5 dark:via-brown-700/3 dark:to-sage/5" />
            {/* Floating decorative dots */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
              {[0,1,2,3,4,5].map(dot => (
                <motion.div
                  key={dot}
                  className="absolute rounded-full bg-gold/25"
                  style={{
                    width: 3 + (dot % 3),
                    height: 3 + (dot % 3),
                    left: `${10 + dot * 15}%`,
                    top: `${20 + (dot * 11) % 60}%`,
                  }}
                  animate={{
                    y: [0, -12, 0],
                    opacity: [0.3, 0.7, 0.3],
                  }}
                  transition={{
                    duration: 3 + dot * 0.5,
                    repeat: Infinity,
                    delay: dot * 0.4,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </div>
            <div className="h-1 bg-gradient-to-r from-gold via-gold-light to-gold-dark" />
            <CardContent className="relative p-5 text-center">
              <p
                className="font-serif text-lg font-bold text-brown-900 mb-2"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Ready to go deeper?
              </p>
              <p className="text-sm text-brown-400 mb-4">
                Unlock 4 premium sections including Money Psychology and Life Patterns.
              </p>
              <Button
                onClick={() => setView('premium')}
                className="bg-brown-700 px-8 text-base font-medium text-white hover:bg-brown-800 shadow-lg shadow-brown-700/20"
              >
                <Heart className="mr-2 size-4" />
                Unlock Full Profile
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}

function getDefaultTraits(): TraitScore[] {
  return [
    { name: 'empathy', label: 'Empathy', score: 78, description: '' },
    { name: 'resilience', label: 'Resilience', score: 65, description: '' },
    { name: 'communication', label: 'Communication', score: 72, description: '' },
    { name: 'trust', label: 'Trust Capacity', score: 55, description: '' },
    { name: 'emotional_awareness', label: 'Emotional Awareness', score: 82, description: '' },
    { name: 'adaptability', label: 'Adaptability', score: 48, description: '' },
    { name: 'patience', label: 'Patience', score: 61, description: '' },
    { name: 'leadership', label: 'Leadership', score: 35, description: '' },
    { name: 'creativity', label: 'Creativity', score: 73, description: '' },
    { name: 'loyalty', label: 'Loyalty', score: 85, description: '' },
    { name: 'independence', label: 'Independence', score: 42, description: '' },
    { name: 'harmony', label: 'Harmony Seeking', score: 68, description: '' },
    { name: 'intuition', label: 'Intuition', score: 76, description: '' },
    { name: 'discipline', label: 'Discipline', score: 38, description: '' },
  ];
}
