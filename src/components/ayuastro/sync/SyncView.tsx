'use client';

import { useState, useCallback } from 'react';
import { useAyuAstroStore } from '@/store/ayuastro-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Sun,
  Moon,
  Compass,
  Sparkles,
  MessageCircle,
  Shield,
  Flame,
  ChevronDown,
  Star,
} from 'lucide-react';

// ─── Zodiac Data ────────────────────────────────────────────────────────────

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

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

const ZODIAC_MODALITIES: Record<string, string> = {
  Aries: 'Cardinal', Cancer: 'Cardinal', Libra: 'Cardinal', Capricorn: 'Cardinal',
  Taurus: 'Fixed', Leo: 'Fixed', Scorpio: 'Fixed', Aquarius: 'Fixed',
  Gemini: 'Mutable', Virgo: 'Mutable', Sagittarius: 'Mutable', Pisces: 'Mutable',
};

const ELEMENT_COLORS: Record<string, string> = {
  Fire: 'bg-red-100 text-red-700 border-red-200',
  Earth: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Air: 'bg-sky-100 text-sky-700 border-sky-200',
  Water: 'bg-indigo-100 text-indigo-700 border-indigo-200',
};

const ELEMENT_COMPAT: Record<string, string[]> = {
  Fire: ['Air', 'Fire'],
  Air: ['Fire', 'Air'],
  Earth: ['Water', 'Earth'],
  Water: ['Earth', 'Water'],
};

const MODALITY_COMPAT: Record<string, string[]> = {
  Cardinal: ['Fixed', 'Mutable'],
  Fixed: ['Cardinal', 'Mutable'],
  Mutable: ['Cardinal', 'Fixed'],
};

// ─── Compatibility Calculation ──────────────────────────────────────────────

interface CompatibilityResult {
  overall: number;
  emotional: number;
  communication: number;
  trust: number;
  insight: string;
  elementMatch: string;
  modalityMatch: string;
}

function calculateCompatibility(
  userSunSign: string,
  userMoonSign: string,
  partnerSign: string
): CompatibilityResult {
  const userElement = ZODIAC_ELEMENTS[userSunSign] || 'Fire';
  const partnerElement = ZODIAC_ELEMENTS[partnerSign] || 'Fire';
  const userModality = ZODIAC_MODALITIES[userSunSign] || 'Cardinal';
  const partnerModality = ZODIAC_MODALITIES[partnerSign] || 'Cardinal';
  const userMoonElement = ZODIAC_ELEMENTS[userMoonSign] || 'Water';
  const partnerMoonCompat = ZODIAC_ELEMENTS[partnerSign] || 'Fire';

  // Element compatibility score (0-40)
  let elementScore = 20; // base
  if (userElement === partnerElement) {
    elementScore = 38;
  } else if (ELEMENT_COMPAT[userElement]?.includes(partnerElement)) {
    elementScore = 32;
  } else {
    elementScore = 16;
  }

  // Modality compatibility (0-25)
  let modalityScore = 12;
  if (userModality !== partnerModality) {
    modalityScore = 22;
  } else {
    modalityScore = 14;
  }

  // Moon sign emotional compatibility (0-25)
  let moonScore = 12;
  if (userMoonElement === partnerElement) {
    moonScore = 22;
  } else if (ELEMENT_COMPAT[userMoonElement]?.includes(partnerMoonCompat)) {
    moonScore = 18;
  } else {
    moonScore = 10;
  }

  // Deterministic variation based on sign indices
  const userIdx = ZODIAC_SIGNS.indexOf(userSunSign);
  const partnerIdx = ZODIAC_SIGNS.indexOf(partnerSign);
  const phaseBonus = ((userIdx * 7 + partnerIdx * 13) % 11) - 5; // -5 to +5

  const overall = Math.max(15, Math.min(98, elementScore + modalityScore + moonScore + phaseBonus));
  const emotional = Math.max(15, Math.min(98, moonScore * 4 + phaseBonus + 5));
  const communication = Math.max(15, Math.min(98, modalityScore * 4 + elementScore + phaseBonus - 8));
  const trust = Math.max(15, Math.min(98, elementScore * 2.2 + moonScore * 1.5 + phaseBonus));

  const elementMatch =
    userElement === partnerElement
      ? 'Same Element — Deep Understanding'
      : ELEMENT_COMPAT[userElement]?.includes(partnerElement)
        ? 'Complementary Elements — Natural Balance'
        : 'Challenging Elements — Growth Opportunity';

  const modalityMatch =
    userModality === partnerModality
      ? 'Same Modality — Similar Approach'
      : 'Different Modalities — Complementary Action';

  const insights: Record<string, string> = {
    high: `Your ${userSunSign} Sun and ${partnerSign} energy create a powerful resonance. There's a natural flow of understanding between you — emotionally, intellectually, and spiritually. This connection invites both of you to grow while feeling deeply seen.`,
    moderate: `Your ${userSunSign} Sun and ${partnerSign} energy share a complementary bond. While you approach life differently, these differences create a dynamic balance. The key is honoring each other's emotional rhythms rather than trying to change them.`,
    low: `Your ${userSunSign} Sun and ${partnerSign} energy represent different elemental worlds. This doesn't mean incompatibility — it means your connection will be a journey of growth. The friction you feel is actually the universe asking you to expand beyond your comfort zone.`,
  };

  const insightLevel = overall >= 65 ? 'high' : overall >= 45 ? 'moderate' : 'low';

  return {
    overall: Math.round(overall),
    emotional: Math.round(emotional),
    communication: Math.round(communication),
    trust: Math.round(trust),
    insight: insights[insightLevel],
    elementMatch,
    modalityMatch,
  };
}

// ─── Circular Score Ring ────────────────────────────────────────────────────

function ScoreRing({ score, size = 120, strokeWidth = 8, color = '#D4AF37' }: { score: number; size?: number; strokeWidth?: number; color?: string }) {
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
          className="text-2xl font-bold text-brown-900"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          {score}
        </motion.span>
        <span className="text-[9px] uppercase tracking-wider text-brown-400">compatibility</span>
      </div>
    </div>
  );
}

// ─── Sub-Score Bar ──────────────────────────────────────────────────────────

function SubScoreBar({ label, score, icon: Icon, delay = 0 }: { label: string; score: number; icon: React.ElementType; delay?: number }) {
  const getBarColor = (s: number) => {
    if (s >= 70) return 'bg-sage';
    if (s >= 45) return 'bg-gold';
    return 'bg-brown-400';
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="size-3.5 text-brown-400" />
          <span className="text-xs font-medium text-brown-700">{label}</span>
        </div>
        <span className="text-xs font-semibold text-brown-900">{score}%</span>
      </div>
      <div className="h-2 rounded-full bg-brown-100 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, delay: 0.3 + delay * 0.15 }}
          className={`h-full rounded-full ${getBarColor(score)}`}
        />
      </div>
    </div>
  );
}

// ─── Zodiac Pairings Guide ──────────────────────────────────────────────────

const BEST_PAIRINGS: [string, string, string][] = [
  ['Aries', 'Leo', 'Passionate fire meets fearless flame'],
  ['Taurus', 'Cancer', 'Steady earth meets nurturing waters'],
  ['Gemini', 'Aquarius', 'Quick minds, shared horizons'],
  ['Cancer', 'Scorpio', 'Deep waters, unshakable loyalty'],
  ['Leo', 'Sagittarius', 'Radiant warmth meets adventurous fire'],
  ['Virgo', 'Taurus', 'Practical devotion, shared values'],
  ['Libra', 'Gemini', 'Social grace meets intellectual charm'],
  ['Scorpio', 'Pisces', 'Intuitive depths, soul-level trust'],
  ['Sagittarius', 'Aries', 'Bold adventures, endless energy'],
  ['Capricorn', 'Taurus', 'Ambitious earth, lasting foundations'],
  ['Aquarius', 'Libra', 'Progressive vision, harmonious ideals'],
  ['Pisces', 'Cancer', 'Emotional sanctuary, intuitive bond'],
];

// ─── Main SyncView ──────────────────────────────────────────────────────────

export default function SyncView() {
  const { astrologyData, birthDetails } = useAyuAstroStore();
  const [partnerName, setPartnerName] = useState('');
  const [partnerSign, setPartnerSign] = useState('');
  const [showSignDropdown, setShowSignDropdown] = useState(false);
  const [result, setResult] = useState<CompatibilityResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const userSunSign = astrologyData?.sunSign || 'Taurus';
  const userMoonSign = astrologyData?.moonSign || 'Pisces';
  const userAscendant = astrologyData?.ascendant || 'Gemini';

  const handleAnalyze = useCallback(() => {
    if (!partnerSign) return;
    setIsCalculating(true);
    setResult(null);

    // Simulate calculation delay for UX
    setTimeout(() => {
      const compat = calculateCompatibility(userSunSign, userMoonSign, partnerSign);
      setResult(compat);
      setIsCalculating(false);
    }, 800);
  }, [userSunSign, userMoonSign, partnerSign]);

  const handleReset = () => {
    setResult(null);
    setPartnerName('');
    setPartnerSign('');
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
  };

  return (
    <div className="bg-cream px-4 py-6 pb-24">
      <div className="mx-auto max-w-lg space-y-6">

        {/* Header */}
        <motion.div {...fadeInUp} transition={{ duration: 0.4 }}>
          <h1
            className="font-serif text-3xl font-bold text-brown-900 mb-1"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Cosmic Sync
          </h1>
          <p className="text-sm text-brown-400">
            Discover the resonance between your stars. Explore how your emotional and cosmic patterns align with others.
          </p>
        </motion.div>

        {/* Your Cosmic Profile Card */}
        <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.05 }}>
          <Card className="border-0 shadow-sm bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-brown-900">
                <Star className="size-5 text-gold" />
                Your Cosmic Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center rounded-xl bg-brown-50 p-3">
                  <Sun className="mx-auto mb-1 size-5 text-gold" />
                  <p className="text-[10px] uppercase tracking-wider text-brown-400">Sun</p>
                  <p className="text-sm font-semibold text-brown-900">{userSunSign}</p>
                  <span className="text-lg">{ZODIAC_SYMBOLS[userSunSign]}</span>
                  <div className="mt-1">
                    <Badge className={`${ELEMENT_COLORS[ZODIAC_ELEMENTS[userSunSign]]} border text-[8px] px-1.5 py-0`}>
                      {ZODIAC_ELEMENTS[userSunSign]}
                    </Badge>
                  </div>
                </div>
                <div className="text-center rounded-xl bg-brown-50 p-3">
                  <Moon className="mx-auto mb-1 size-5 text-brown-400" />
                  <p className="text-[10px] uppercase tracking-wider text-brown-400">Moon</p>
                  <p className="text-sm font-semibold text-brown-900">{userMoonSign}</p>
                  <span className="text-lg">{ZODIAC_SYMBOLS[userMoonSign]}</span>
                  <div className="mt-1">
                    <Badge className={`${ELEMENT_COLORS[ZODIAC_ELEMENTS[userMoonSign]]} border text-[8px] px-1.5 py-0`}>
                      {ZODIAC_ELEMENTS[userMoonSign]}
                    </Badge>
                  </div>
                </div>
                <div className="text-center rounded-xl bg-brown-50 p-3">
                  <Compass className="mx-auto mb-1 size-5 text-brown-500" />
                  <p className="text-[10px] uppercase tracking-wider text-brown-400">Ascendant</p>
                  <p className="text-sm font-semibold text-brown-900">{userAscendant}</p>
                  <span className="text-lg">{ZODIAC_SYMBOLS[userAscendant]}</span>
                  <div className="mt-1">
                    <Badge className={`${ELEMENT_COLORS[ZODIAC_ELEMENTS[userAscendant]]} border text-[8px] px-1.5 py-0`}>
                      {ZODIAC_ELEMENTS[userAscendant]}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Compatibility Check Section */}
        <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.1 }}>
          <Card className="border-0 shadow-sm bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-brown-900">
                <Heart className="size-5 text-gold" />
                Check Your Cosmic Compatibility
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Partner Name Input */}
              <div>
                <label className="text-xs font-medium text-brown-500 mb-1.5 block">
                  Partner&apos;s Name
                </label>
                <input
                  type="text"
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  placeholder="Enter their name..."
                  className="w-full rounded-xl border border-brown-200 bg-brown-50/50 px-4 py-3 text-sm text-brown-900 placeholder:text-brown-300 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50 transition-all"
                />
              </div>

              {/* Partner Sign Dropdown */}
              <div className="relative">
                <label className="text-xs font-medium text-brown-500 mb-1.5 block">
                  Partner&apos;s Zodiac Sign
                </label>
                <button
                  onClick={() => setShowSignDropdown(!showSignDropdown)}
                  className="w-full rounded-xl border border-brown-200 bg-brown-50/50 px-4 py-3 text-sm text-left flex items-center justify-between hover:border-gold/30 transition-all"
                >
                  <span className={partnerSign ? 'text-brown-900' : 'text-brown-300'}>
                    {partnerSign
                      ? `${ZODIAC_SYMBOLS[partnerSign]} ${partnerSign}`
                      : 'Select zodiac sign...'}
                  </span>
                  <ChevronDown className={`size-4 text-brown-400 transition-transform ${showSignDropdown ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {showSignDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -4, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: 'auto' }}
                      exit={{ opacity: 0, y: -4, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="absolute z-20 mt-1 w-full rounded-xl border border-brown-200 bg-white shadow-lg overflow-hidden"
                    >
                      <div className="max-h-56 overflow-y-auto custom-scrollbar p-1">
                        {ZODIAC_SIGNS.map((sign) => (
                          <button
                            key={sign}
                            onClick={() => {
                              setPartnerSign(sign);
                              setShowSignDropdown(false);
                            }}
                            className={`w-full rounded-lg px-3 py-2.5 text-sm text-left flex items-center gap-3 transition-colors ${
                              partnerSign === sign
                                ? 'bg-gold/10 text-gold-dark font-medium'
                                : 'text-brown-700 hover:bg-brown-50'
                            }`}
                          >
                            <span className="text-lg">{ZODIAC_SYMBOLS[sign]}</span>
                            <div>
                              <span className="font-medium">{sign}</span>
                              <span className="ml-2 text-[10px] text-brown-400">
                                {ZODIAC_ELEMENTS[sign]} · {ZODIAC_MODALITIES[sign]}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Analyze Button */}
              <Button
                onClick={handleAnalyze}
                disabled={!partnerSign || isCalculating}
                className="w-full bg-brown-700 py-5 text-sm font-medium text-white hover:bg-brown-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isCalculating ? (
                  <span className="flex items-center gap-2">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="inline-block"
                    >
                      <Sparkles className="size-4" />
                    </motion.span>
                    Analyzing Cosmic Alignment...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles className="size-4" />
                    Analyze Compatibility
                  </span>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Compatibility Results */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="border-0 shadow-sm bg-white">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base font-semibold text-brown-900">
                    <Flame className="size-5 text-gold" />
                    Compatibility Results
                    {partnerName && (
                      <span className="text-sm font-normal text-brown-400">
                        — with {partnerName}
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Overall Score */}
                  <div className="flex flex-col items-center py-2">
                    <ScoreRing score={result.overall} />
                    <div className="mt-3 text-center">
                      <p className="text-xs text-brown-400">
                        {userSunSign} {ZODIAC_SYMBOLS[userSunSign]} × {partnerSign} {ZODIAC_SYMBOLS[partnerSign]}
                      </p>
                    </div>
                  </div>

                  {/* Element & Modality Match */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-brown-50 p-3 text-center">
                      <p className="text-[10px] uppercase tracking-wider text-brown-400 mb-1">Element Match</p>
                      <p className="text-xs font-medium text-brown-800">{result.elementMatch}</p>
                    </div>
                    <div className="rounded-xl bg-brown-50 p-3 text-center">
                      <p className="text-[10px] uppercase tracking-wider text-brown-400 mb-1">Modality Match</p>
                      <p className="text-xs font-medium text-brown-800">{result.modalityMatch}</p>
                    </div>
                  </div>

                  {/* Sub-scores */}
                  <div className="space-y-3">
                    <SubScoreBar label="Emotional Sync" score={result.emotional} icon={Heart} delay={0} />
                    <SubScoreBar label="Communication Style" score={result.communication} icon={MessageCircle} delay={1} />
                    <SubScoreBar label="Trust & Loyalty" score={result.trust} icon={Shield} delay={2} />
                  </div>

                  {/* AI Insight */}
                  <div className="rounded-xl bg-gold/5 border border-gold/10 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="size-3.5 text-gold" />
                      <span className="text-xs font-semibold text-gold-dark">Cosmic Insight</span>
                    </div>
                    <p className="text-sm text-brown-700 leading-relaxed">
                      {result.insight}
                    </p>
                  </div>

                  {/* Reset Button */}
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    className="w-full border-brown-200 text-brown-600 hover:bg-brown-50"
                  >
                    Check Another Sign
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Zodiac Pairings Guide */}
        <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.15 }}>
          <Card className="border-0 shadow-sm bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-brown-900">
                <Heart className="size-5 text-gold" />
                Zodiac Pairings Guide
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-80 overflow-y-auto custom-scrollbar space-y-2">
                {BEST_PAIRINGS.map(([sign1, sign2, desc], i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i, duration: 0.3 }}
                    className="flex items-center gap-3 rounded-xl bg-brown-50/60 p-3"
                  >
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-lg">{ZODIAC_SYMBOLS[sign1]}</span>
                      <Heart className="size-3 text-gold mx-0.5" />
                      <span className="text-lg">{ZODIAC_SYMBOLS[sign2]}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-brown-800">
                        {sign1} & {sign2}
                      </p>
                      <p className="text-[11px] text-brown-500 truncate">{desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
