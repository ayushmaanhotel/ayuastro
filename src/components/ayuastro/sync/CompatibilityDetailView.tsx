'use client';

import { useAyuAstroStore } from '@/store/ayuastro-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Heart,
  Sun,
  Moon,
  Compass,
  Sparkles,
  MessageCircle,
  Shield,
  Flame,
  TrendingUp,
  Zap,
  Droplets,
  Wind,
  Mountain,
} from 'lucide-react';

// ─── Zodiac Data ────────────────────────────────────────────────────────────

const ZODIAC_SYMBOLS: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋', Leo: '♌', Virgo: '♍',
  Libra: '♎', Scorpio: '♏', Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
};

const ZODIAC_ELEMENTS: Record<string, string> = {
  Aries: 'Fire', Leo: 'Fire', Sagittarius: 'Fire',
  Taurus: 'Earth', Virgo: 'Earth', Capricorn: 'Earth',
  Gemini: 'Air', Libra: 'Air', Aquarius: 'Air',
  Cancer: 'Water', Scorpio: 'Water', Pisces: 'Water',
};

const ZODIAC_RULING_PLANETS: Record<string, string> = {
  Aries: 'Mars', Taurus: 'Venus', Gemini: 'Mercury', Cancer: 'Moon',
  Leo: 'Sun', Virgo: 'Mercury', Libra: 'Venus', Scorpio: 'Pluto',
  Sagittarius: 'Jupiter', Capricorn: 'Saturn', Aquarius: 'Uranus', Pisces: 'Neptune',
};

const ZODIAC_MODALITIES: Record<string, string> = {
  Aries: 'Cardinal', Cancer: 'Cardinal', Libra: 'Cardinal', Capricorn: 'Cardinal',
  Taurus: 'Fixed', Leo: 'Fixed', Scorpio: 'Fixed', Aquarius: 'Fixed',
  Gemini: 'Mutable', Virgo: 'Mutable', Sagittarius: 'Mutable', Pisces: 'Mutable',
};

// ─── Element Harmony Rules ─────────────────────────────────────────────────

type ElementCompatLevel = 'excellent' | 'good' | 'challenging' | 'neutral';

const ELEMENT_PAIR_COMPAT: Record<string, ElementCompatLevel> = {
  'Fire+Air': 'excellent',
  'Air+Fire': 'excellent',
  'Earth+Water': 'excellent',
  'Water+Earth': 'excellent',
  'Fire+Fire': 'good',
  'Earth+Earth': 'good',
  'Air+Air': 'good',
  'Water+Water': 'good',
  'Fire+Earth': 'challenging',
  'Earth+Fire': 'challenging',
  'Fire+Water': 'challenging',
  'Water+Fire': 'challenging',
  'Air+Earth': 'neutral',
  'Earth+Air': 'neutral',
  'Air+Water': 'neutral',
  'Water+Air': 'neutral',
};

const ELEMENT_HARMONY_DESCRIPTIONS: Record<ElementCompatLevel, (e1: string, e2: string) => string> = {
  excellent: (e1, e2) => `${e1} + ${e2} = Synergy — These elements naturally amplify each other, creating a powerful and harmonious dynamic. Energy flows freely between you.`,
  good: (e1, e2) => `${e1} + ${e2} = Resonance — Shared elemental qualities bring understanding and comfort. You naturally get each other, though occasional friction keeps things interesting.`,
  challenging: (e1, e2) => `${e1} + ${e2} = Catalyst — These elements create dynamic tension. While challenging, this friction generates growth and transformation when channeled consciously.`,
  neutral: (e1, e2) => `${e1} + ${e2} = Balance — These elements approach life differently, offering complementary perspectives. Understanding requires patience but yields unique insights.`,
};

const ELEMENT_COMPAT_SCORES: Record<ElementCompatLevel, number> = {
  excellent: 90,
  good: 75,
  challenging: 45,
  neutral: 60,
};

// ─── Communication Descriptions ─────────────────────────────────────────────

function getCommunicationStyle(userSign: string, partnerSign: string): { description: string; score: number } {
  const userPlanet = ZODIAC_RULING_PLANETS[userSign] || 'Mercury';
  const partnerPlanet = ZODIAC_RULING_PLANETS[partnerSign] || 'Mercury';

  const planetStyles: Record<string, string> = {
    Mars: 'direct, assertive, and action-oriented — you say what you mean',
    Venus: 'diplomatic, harmonious, and values-driven — you seek beauty in expression',
    Mercury: 'analytical, adaptable, and detail-oriented — you process information rapidly',
    Moon: 'intuitive, emotionally-charged, and nurturing — you communicate through feeling',
    Sun: 'expressive, confident, and warm — you communicate with authority and generosity',
    Pluto: 'intense, probing, and transformative — you seek deeper truth in every exchange',
    Jupiter: 'expansive, philosophical, and optimistic — you communicate with vision and breadth',
    Saturn: 'structured, disciplined, and measured — you value precision and responsibility',
    Uranus: 'innovative, unconventional, and electric — you challenge norms in conversation',
    Neptune: 'imaginative, empathetic, and subtle — you communicate through nuance and creativity',
  };

  const userStyle = planetStyles[userPlanet] || planetStyles.Mercury;
  const partnerStyle = planetStyles[partnerPlanet] || planetStyles.Mercury;

  const modalityCompat = ZODIAC_MODALITIES[userSign] === ZODIAC_MODALITIES[partnerSign] ? 'similar' : 'complementary';

  const description = `With ${userSign} ruled by ${userPlanet}, you are ${userStyle}. Meanwhile, ${partnerSign} (ruled by ${partnerPlanet}) is ${partnerStyle}. Your communication styles are ${modalityCompat} — ${modalityCompat === 'similar' ? 'you naturally understand each other\'s rhythm but may need to push beyond comfort zones' : 'you bring different strengths to conversations, creating a rich exchange when you respect each other\'s approach'}.`;

  // Deterministic score
  const scoreMap: Record<string, number> = {
    Mars: 1, Venus: 2, Mercury: 3, Moon: 4, Sun: 5,
    Pluto: 6, Jupiter: 7, Saturn: 8, Uranus: 9, Neptune: 10,
  };
  const diff = Math.abs((scoreMap[userPlanet] || 5) - (scoreMap[partnerPlanet] || 5));
  const baseScore = modalityCompat === 'similar' ? 70 : 65;
  const bonus = diff <= 2 ? 15 : diff <= 4 ? 8 : 0;
  const score = Math.min(95, baseScore + bonus);

  return { description, score };
}

// ─── Emotional Compatibility ────────────────────────────────────────────────

function getEmotionalCompatibility(userMoonSign: string, partnerSign: string): { description: string; score: number } {
  const userMoonElement = ZODIAC_ELEMENTS[userMoonSign] || 'Water';
  const partnerElement = ZODIAC_ELEMENTS[partnerSign] || 'Fire';

  const compatKey = `${userMoonElement}+${partnerElement}` as keyof typeof ELEMENT_PAIR_COMPAT;
  const level = ELEMENT_PAIR_COMPAT[compatKey] || 'neutral';
  const baseScore = ELEMENT_COMPAT_SCORES[level];

  // If same element, bonus
  const sameElement = userMoonElement === partnerElement;
  const score = sameElement ? Math.min(98, baseScore + 10) : baseScore;

  const levelDescriptions: Record<string, string> = {
    excellent: `Your Moon in ${userMoonSign} (${userMoonElement}) and their ${partnerSign} (${partnerElement}) create a deeply harmonious emotional connection. You instinctively understand each other's emotional needs and can provide the right kind of support without being asked. This is a placement for emotional safety.`,
    good: `Your Moon in ${userMoonSign} (${userMoonElement}) and their ${partnerSign} (${partnerElement}) share a natural emotional wavelength. While not identical, your emotional rhythms complement each other well. There's enough similarity to feel understood and enough difference to grow.`,
    challenging: `Your Moon in ${userMoonSign} (${userMoonElement}) and their ${partnerSign} (${partnerElement}) approach emotions from different worlds. This isn't incompatibility — it's an invitation to expand your emotional range. The key is validating each other's feelings even when they don't make sense to you.`,
    neutral: `Your Moon in ${userMoonSign} (${userMoonElement}) and their ${partnerSign} (${partnerElement}) have a balanced emotional dynamic. You process feelings differently but can find common ground through patience and honest communication about your needs.`,
  };

  return {
    description: levelDescriptions[level],
    score,
  };
}

// ─── Growth Areas ───────────────────────────────────────────────────────────

function getGrowthAreas(userSign: string, partnerSign: string): string[] {
  const userElement = ZODIAC_ELEMENTS[userSign] || 'Fire';
  const partnerElement = ZODIAC_ELEMENTS[partnerSign] || 'Fire';
  const userModality = ZODIAC_MODALITIES[userSign] || 'Cardinal';
  const partnerModality = ZODIAC_MODALITIES[partnerSign] || 'Cardinal';

  const areas: string[] = [];

  // Element-based growth areas
  if (userElement === partnerElement) {
    areas.push('Breaking familiar patterns — You share elemental qualities, which brings comfort but can lead to shared blind spots. Practice inviting outside perspectives to avoid echo chambers in your relationship.');
  }

  const compatKey = `${userElement}+${partnerElement}`;
  const level = ELEMENT_PAIR_COMPAT[compatKey];

  if (level === 'challenging') {
    areas.push('Bridging different worlds — Your elements naturally pull in different directions. The growth lies in not trying to convert each other, but in building a bridge between your worlds. Find activities that honor both elements.');
    areas.push('Patience with different timelines — You process experiences at fundamentally different speeds. Learning to wait for each other without resentment is your greatest teacher.');
  } else if (level === 'neutral') {
    areas.push('Finding emotional middle ground — You operate on different frequencies. The growth opportunity is in developing a shared emotional language that neither of you naturally speaks alone.');
  }

  if (level === 'excellent') {
    areas.push('Avoiding co-dependency — Your natural harmony can become too comfortable. Maintain individual interests and friendships to bring fresh energy into the relationship.');
  }

  // Modality-based growth areas
  if (userModality === partnerModality) {
    areas.push('Decision-making dynamics — You share the same action style, which can create power struggles. Practice alternating who takes the lead in different areas of your shared life.');
  } else {
    areas.push('Respecting different rhythms — One of you initiates while the other stabilizes or adapts. Growth comes from appreciating these complementary roles rather than resenting them.');
  }

  // Ensure at least 2-3 areas
  if (areas.length < 2) {
    areas.push('Deepening vulnerability — Allow yourselves to be truly seen by each other, especially in moments of uncertainty. This is where the deepest bonding happens.');
  }

  return areas.slice(0, 3);
}

// ─── Strengths ──────────────────────────────────────────────────────────────

function getStrengths(userSign: string, partnerSign: string): string[] {
  const userElement = ZODIAC_ELEMENTS[userSign] || 'Fire';
  const partnerElement = ZODIAC_ELEMENTS[partnerSign] || 'Fire';
  const userModality = ZODIAC_MODALITIES[userSign] || 'Cardinal';
  const partnerModality = ZODIAC_MODALITIES[partnerSign] || 'Cardinal';

  const strengths: string[] = [];

  // Element-based strengths
  const compatKey = `${userElement}+${partnerElement}`;
  const level = ELEMENT_PAIR_COMPAT[compatKey];

  if (level === 'excellent') {
    strengths.push('Natural synergy — Your elements amplify each other effortlessly. There\'s a flow and ease to your connection that feels destined. You inspire and energize each other naturally.');
  } else if (level === 'good') {
    strengths.push('Deep mutual understanding — Sharing elemental qualities means you instinctively "get" each other. This creates a foundation of trust and comfort that takes years to build in other pairings.');
  }

  if (level === 'challenging' || level === 'neutral') {
    strengths.push('Growth catalyst — Your differences are your greatest strength. This pairing has more potential for personal evolution than most. You push each other to become more complete versions of yourselves.');
  }

  // Modality strengths
  if (userModality !== partnerModality) {
    strengths.push('Complementary action styles — Your different approaches to initiating and completing things mean you cover each other\'s blind spots. What one starts, the other can refine or sustain.');
  } else {
    strengths.push('Shared determination — When you both commit to something, your combined willpower is formidable. You understand each other\'s persistence and can build remarkable things together.');
  }

  // Sign-specific strengths
  const signStrengths: Record<string, string> = {
    Aries: 'courage and initiative', Taurus: 'loyalty and stability', Gemini: 'adaptability and wit',
    Cancer: 'emotional depth and nurturing', Leo: 'generosity and warmth', Virgo: 'thoughtfulness and precision',
    Libra: 'diplomacy and aesthetic sense', Scorpio: 'intensity and devotion', Sagittarius: 'optimism and adventure',
    Capricorn: 'ambition and reliability', Aquarius: 'innovation and independence', Pisces: 'compassion and intuition',
  };

  const userGift = signStrengths[userSign] || 'unique perspective';
  const partnerGift = signStrengths[partnerSign] || 'unique perspective';
  strengths.push(`Gift exchange — ${userSign} brings ${userGift}, while ${partnerSign} brings ${partnerGift}. Together, you have a more complete emotional toolkit than either would alone.`);

  return strengths.slice(0, 3);
}

// ─── Circular Score Ring ────────────────────────────────────────────────────

function ScoreRing({ score, size = 140, strokeWidth = 10, color = '#D4AF37' }: { score: number; size?: number; strokeWidth?: number; color?: string }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E8E0D4"
          strokeWidth={strokeWidth}
          className="dark:stroke-brown-100"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-3xl font-bold text-brown-900 dark:text-brown-100"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          {score}
        </motion.span>
        <span className="text-[9px] uppercase tracking-wider text-brown-400 dark:text-brown-500">compatibility</span>
      </div>
    </div>
  );
}

// ─── Element Icon ───────────────────────────────────────────────────────────

function ElementIcon({ element }: { element: string }) {
  switch (element) {
    case 'Fire':
      return <Flame className="size-5 text-red-500" />;
    case 'Earth':
      return <Mountain className="size-5 text-emerald-600" />;
    case 'Air':
      return <Wind className="size-5 text-sky-500" />;
    case 'Water':
      return <Droplets className="size-5 text-indigo-500" />;
    default:
      return <Zap className="size-5 text-gold" />;
  }
}

// ─── Main Component ─────────────────────────────────────────────────────────

interface CompatibilityDetailViewProps {
  partnerSign: string;
  partnerName?: string;
  overallScore: number;
  emotionalScore: number;
  communicationScore: number;
  trustScore: number;
}

export default function CompatibilityDetailView({
  partnerSign,
  partnerName,
  overallScore,
  emotionalScore,
  communicationScore,
  trustScore,
}: CompatibilityDetailViewProps) {
  const { astrologyData, setView } = useAyuAstroStore();

  const userSunSign = astrologyData?.sunSign || 'Taurus';
  const userMoonSign = astrologyData?.moonSign || 'Pisces';

  // Compute detailed analysis
  const userElement = ZODIAC_ELEMENTS[userSunSign] || 'Fire';
  const partnerElement = ZODIAC_ELEMENTS[partnerSign] || 'Fire';
  const compatKey = `${userElement}+${partnerElement}` as keyof typeof ELEMENT_PAIR_COMPAT;
  const elementCompatLevel = ELEMENT_PAIR_COMPAT[compatKey] || 'neutral';
  const elementHarmonyDesc = ELEMENT_HARMONY_DESCRIPTIONS[elementCompatLevel](userElement, partnerElement);

  const communication = getCommunicationStyle(userSunSign, partnerSign);
  const emotional = getEmotionalCompatibility(userMoonSign, partnerSign);
  const growthAreas = getGrowthAreas(userSunSign, partnerSign);
  const strengths = getStrengths(userSunSign, partnerSign);

  const fadeInUp = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
  };

  const ELEMENT_BADGE_COLORS: Record<string, string> = {
    Fire: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
    Earth: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800',
    Air: 'bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-800',
    Water: 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800',
  };

  return (
    <div className="bg-cream dark:bg-[#1A1412] px-4 py-6 pb-24 min-h-screen">
      <div className="mx-auto max-w-lg space-y-6">
        {/* Header with back button */}
        <motion.div {...fadeInUp} transition={{ duration: 0.4 }} className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setView('sync')}
            className="size-10 rounded-full hover:bg-brown-50 dark:hover:bg-brown-800"
          >
            <ArrowLeft className="size-5 text-brown-700 dark:text-brown-300" />
          </Button>
          <div>
            <h1
              className="font-serif text-xl font-bold text-brown-900 dark:text-brown-100"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Compatibility Details
            </h1>
            <p className="text-xs text-brown-400 dark:text-brown-500">
              {userSunSign} × {partnerSign} — in depth
            </p>
          </div>
        </motion.div>

        {/* Overall Score Card */}
        <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.05 }}>
          <Card className="border-0 shadow-md bg-white dark:bg-white/5">
            <CardContent className="p-6">
              <div className="flex flex-col items-center">
                {/* Zodiac symbols */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex flex-col items-center">
                    <div className="flex size-14 items-center justify-center rounded-full bg-brown-50 dark:bg-brown-50/20 border border-brown-100 dark:border-brown-100/20">
                      <span className="text-2xl">{ZODIAC_SYMBOLS[userSunSign]}</span>
                    </div>
                    <span className="text-[10px] mt-1 font-medium text-brown-600 dark:text-brown-400">{userSunSign}</span>
                    <Badge className={`${ELEMENT_BADGE_COLORS[userElement]} border text-[8px] px-1.5 py-0 mt-0.5`}>
                      {userElement}
                    </Badge>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Heart className="size-5 text-gold" />
                    <span className="text-[10px] text-brown-400">&</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="flex size-14 items-center justify-center rounded-full bg-brown-50 dark:bg-brown-50/20 border border-brown-100 dark:border-brown-100/20">
                      <span className="text-2xl">{ZODIAC_SYMBOLS[partnerSign]}</span>
                    </div>
                    <span className="text-[10px] mt-1 font-medium text-brown-600 dark:text-brown-400">{partnerSign}</span>
                    <Badge className={`${ELEMENT_BADGE_COLORS[partnerElement]} border text-[8px] px-1.5 py-0 mt-0.5`}>
                      {partnerElement}
                    </Badge>
                  </div>
                </div>

                {/* Score Ring */}
                <ScoreRing score={overallScore} />

                {partnerName && (
                  <p className="mt-2 text-xs text-brown-400 dark:text-brown-500">
                    {partnerName} & You
                  </p>
                )}
              </div>

              {/* Sub-scores */}
              <div className="grid grid-cols-3 gap-3 mt-6">
                <div className="text-center rounded-xl bg-brown-50 dark:bg-brown-50/20 p-3">
                  <Heart className="mx-auto mb-1 size-4 text-gold" />
                  <p className="font-serif text-lg font-bold text-brown-900 dark:text-brown-100" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                    {emotionalScore}%
                  </p>
                  <p className="text-[9px] uppercase tracking-wider text-brown-400 dark:text-brown-500">Emotional</p>
                </div>
                <div className="text-center rounded-xl bg-brown-50 dark:bg-brown-50/20 p-3">
                  <MessageCircle className="mx-auto mb-1 size-4 text-gold" />
                  <p className="font-serif text-lg font-bold text-brown-900 dark:text-brown-100" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                    {communicationScore}%
                  </p>
                  <p className="text-[9px] uppercase tracking-wider text-brown-400 dark:text-brown-500">Communication</p>
                </div>
                <div className="text-center rounded-xl bg-brown-50 dark:bg-brown-50/20 p-3">
                  <Shield className="mx-auto mb-1 size-4 text-gold" />
                  <p className="font-serif text-lg font-bold text-brown-900 dark:text-brown-100" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                    {trustScore}%
                  </p>
                  <p className="text-[9px] uppercase tracking-wider text-brown-400 dark:text-brown-500">Trust</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Element Harmony Section */}
        <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.1 }}>
          <Card className="border-0 shadow-md bg-white dark:bg-white/5">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-brown-900 dark:text-brown-100">
                <div className="flex items-center gap-1.5">
                  <ElementIcon element={userElement} />
                  <span className="text-brown-400 text-sm">+</span>
                  <ElementIcon element={partnerElement} />
                </div>
                Element Harmony
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-3 flex items-center gap-2">
                <Badge className={`${elementCompatLevel === 'excellent' ? 'bg-sage-muted text-sage-dark' : elementCompatLevel === 'good' ? 'bg-gold/15 text-gold-dark dark:text-gold' : elementCompatLevel === 'challenging' ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300' : 'bg-brown-50 text-brown-600 dark:bg-brown-50/20 dark:text-brown-300'} border-0 text-xs px-3 py-1`}>
                  {elementCompatLevel === 'excellent' ? '✦ Excellent Synergy' : elementCompatLevel === 'good' ? '✦ Good Resonance' : elementCompatLevel === 'challenging' ? '⚡ Dynamic Tension' : '○ Balanced'}
                </Badge>
              </div>
              <p className="text-sm text-brown-600 dark:text-brown-300 leading-relaxed">
                {elementHarmonyDesc}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Communication Style Section */}
        <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.15 }}>
          <Card className="border-0 shadow-md bg-white dark:bg-white/5">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-brown-900 dark:text-brown-100">
                <MessageCircle className="size-5 text-gold" />
                Communication Style
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-brown-400 dark:text-brown-500">Communication Score</span>
                  <span className="text-sm font-semibold text-brown-900 dark:text-brown-100">{communication.score}%</span>
                </div>
                <div className="h-2 rounded-full bg-brown-100 dark:bg-brown-50/20 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${communication.score}%` }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="h-full rounded-full bg-gold"
                  />
                </div>
              </div>
              <p className="text-sm text-brown-600 dark:text-brown-300 leading-relaxed">
                {communication.description}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Emotional Compatibility Section */}
        <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.2 }}>
          <Card className="border-0 shadow-md bg-white dark:bg-white/5">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-brown-900 dark:text-brown-100">
                <Heart className="size-5 text-gold" />
                Emotional Compatibility
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-brown-400 dark:text-brown-500">
                    Moon ({userMoonSign}) × {partnerSign}
                  </span>
                  <span className="text-sm font-semibold text-brown-900 dark:text-brown-100">{emotional.score}%</span>
                </div>
                <div className="h-2 rounded-full bg-brown-100 dark:bg-brown-50/20 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${emotional.score}%` }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className={`h-full rounded-full ${emotional.score >= 70 ? 'bg-sage' : emotional.score >= 50 ? 'bg-gold' : 'bg-brown-400'}`}
                  />
                </div>
              </div>
              <p className="text-sm text-brown-600 dark:text-brown-300 leading-relaxed">
                {emotional.description}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Strengths Section */}
        <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.25 }}>
          <Card className="border-0 shadow-md bg-white dark:bg-white/5">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-brown-900 dark:text-brown-100">
                <TrendingUp className="size-5 text-sage-dark" />
                Natural Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {strengths.map((strength, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1, duration: 0.3 }}
                    className="flex gap-3 items-start"
                  >
                    <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-sage-muted/50 dark:bg-sage-muted/20 mt-0.5">
                      <Sparkles className="size-3 text-sage-dark" />
                    </div>
                    <p className="text-sm text-brown-600 dark:text-brown-300 leading-relaxed">
                      {strength}
                    </p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Growth Areas Section */}
        <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.3 }}>
          <Card className="border-0 shadow-md bg-white dark:bg-white/5">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-brown-900 dark:text-brown-100">
                <Flame className="size-5 text-gold" />
                Growth Areas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {growthAreas.map((area, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.1, duration: 0.3 }}
                    className="flex gap-3 items-start"
                  >
                    <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-gold/10 dark:bg-gold/10 mt-0.5">
                      <span className="text-gold text-xs font-bold">{i + 1}</span>
                    </div>
                    <p className="text-sm text-brown-600 dark:text-brown-300 leading-relaxed">
                      {area}
                    </p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Summary Insight */}
        <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.35 }}>
          <div className="rounded-xl bg-gold/5 dark:bg-gold/10 border border-gold/10 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="size-3.5 text-gold" />
              <span className="text-xs font-semibold text-gold-dark dark:text-gold">Cosmic Wisdom</span>
            </div>
            <p className="text-sm text-brown-700 dark:text-brown-300 leading-relaxed">
              Every cosmic pairing has unique gifts and challenges. What matters most is the conscious intention you bring to the connection. The stars reveal tendencies — your choices create the relationship.
            </p>
          </div>
        </motion.div>

        {/* Back to Sync View */}
        <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.4 }}>
          <Button
            onClick={() => setView('sync')}
            variant="outline"
            className="w-full border-brown-200 dark:border-brown-100/30 text-brown-600 dark:text-brown-300 hover:bg-brown-50 dark:hover:bg-brown-50/50"
          >
            <ArrowLeft className="mr-2 size-4" />
            Back to Cosmic Sync
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
