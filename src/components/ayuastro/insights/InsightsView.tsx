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
import { motion } from 'framer-motion';
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

const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
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
    <div className="bg-cream px-4 py-6 pb-24">
      <div className="mx-auto max-w-lg space-y-6">

        {/* Daily Cosmic Insight Card */}
        <motion.div {...fadeInUp} transition={{ duration: 0.4 }}>
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

        {/* Daily Horoscope Card */}
        <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.02 }}>
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
        <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.04 }}>
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

        {/* Header Section */}
        <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.05 }}>
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
          <Card className="card-hover border-0 shadow-md bg-white dark:bg-white/5 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-gold via-brown-300 to-sage" />
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-brown-900">
                <Compass className="size-5 text-gold" />
                The Anchor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{getArchetypeEmoji(archetype)}</span>
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
        <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.15 }}>
          <Card className="card-hover border-0 shadow-md bg-white dark:bg-white/5">
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
        <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.2 }}>
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
                  <div key={trait.name} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-brown-800">{trait.label || trait.name}</span>
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
                        animate={{ width: `${trait.score}%` }}
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
            </CardContent>
          </Card>
        </motion.div>

        {/* Numerology Summary Card */}
        {numerologyData && (
          <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.22 }}>
            <Card className="card-hover border-0 shadow-md bg-white dark:bg-white/5">
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
                    <div key={i} className="rounded-xl bg-gradient-to-br from-brown-50 to-cream-dark dark:from-brown-50/50 dark:to-cream-dark/50 p-4 text-center">
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
        <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.23 }}>
          <Card className="card-hover border-0 shadow-md bg-white dark:bg-white/5 overflow-hidden">
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
                    <div className="rounded-lg bg-gold/5 dark:bg-gold/10 p-3">
                      <p className="text-[10px] uppercase tracking-wider text-gold-dark dark:text-gold mb-1">Dominant Element</p>
                      <div className="flex items-center gap-2">
                        {(() => { const DIcon = ELEMENT_ICONS[dominantElement]; return <DIcon className="size-4 text-gold-dark" />; })()}
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
        <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.25 }}>
          <Card className="card-hover border-0 shadow-md bg-white dark:bg-white/5">
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

              {/* Yogas & Doshas */}
              {(astrologyData?.yogas?.length > 0 || astrologyData?.doshas?.length > 0) && (
                <>
                  <Separator className="my-3 bg-brown-100" />
                  <div className="space-y-2">
                    {astrologyData?.yogas?.length > 0 && (
                      <div>
                        <p className="text-xs text-brown-400 mb-1">Key Yogas</p>
                        <div className="flex flex-wrap gap-1">
                          {astrologyData.yogas.map((yoga, i) => (
                            <Badge key={i} className="bg-sage-muted text-sage-dark border-0 text-xs">
                              {yoga}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {astrologyData?.doshas?.length > 0 && (
                      <div>
                        <p className="text-xs text-brown-400 mb-1">Doshas</p>
                        <div className="flex flex-wrap gap-1">
                          {astrologyData.doshas.map((dosha, i) => (
                            <Badge key={i} className="bg-gold/10 text-gold-dark border-0 text-xs">
                              {dosha}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Dasha Timeline */}
        {dashaPeriods.length > 0 && (
          <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.28 }}>
            <DashaTimeline dashaPeriods={dashaPeriods} />
          </motion.div>
        )}

        {/* CTA */}
        <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.3 }}>
          <Card className="card-hover border-0 shadow-md overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-gold via-gold-light to-gold-dark" />
            <CardContent className="p-5 text-center">
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
      </div>
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
