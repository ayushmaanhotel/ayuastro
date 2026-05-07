'use client';

import { useState } from 'react';
import { useAyuAstroStore, type TraitScore } from '@/store/ayuastro-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion } from 'framer-motion';
import {
  User,
  Sun,
  Moon,
  Compass,
  Hash,
  RotateCcw,
  Calendar,
  Clock,
  MapPin,
  Heart,
  Star,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Sparkles,
  FileText,
  Lock,
  BookHeart,
  Infinity,
  Wind,
  Share2,
  HelpCircle,
  Download,
} from 'lucide-react';
import { cosmicToast } from '@/lib/toast';

const ZODIAC_ICONS: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋', Leo: '♌', Virgo: '♍',
  Libra: '♎', Scorpio: '♏', Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
};

const ZODIAC_ELEMENTS: Record<string, { element: string; gradientFrom: string; gradientTo: string }> = {
  Aries: { element: 'Fire', gradientFrom: 'from-red-500/10', gradientTo: 'to-orange-500/5' },
  Taurus: { element: 'Earth', gradientFrom: 'from-green-600/10', gradientTo: 'to-emerald-500/5' },
  Gemini: { element: 'Air', gradientFrom: 'from-yellow-500/10', gradientTo: 'to-amber-400/5' },
  Cancer: { element: 'Water', gradientFrom: 'from-blue-400/10', gradientTo: 'to-cyan-400/5' },
  Leo: { element: 'Fire', gradientFrom: 'from-orange-500/10', gradientTo: 'to-amber-500/5' },
  Virgo: { element: 'Earth', gradientFrom: 'from-green-500/10', gradientTo: 'to-lime-500/5' },
  Libra: { element: 'Air', gradientFrom: 'from-pink-400/10', gradientTo: 'to-rose-400/5' },
  Scorpio: { element: 'Water', gradientFrom: 'from-purple-600/10', gradientTo: 'to-indigo-500/5' },
  Sagittarius: { element: 'Fire', gradientFrom: 'from-purple-500/10', gradientTo: 'to-violet-400/5' },
  Capricorn: { element: 'Earth', gradientFrom: 'from-gray-600/10', gradientTo: 'to-slate-500/5' },
  Aquarius: { element: 'Air', gradientFrom: 'from-cyan-500/10', gradientTo: 'to-teal-400/5' },
  Pisces: { element: 'Water', gradientFrom: 'from-teal-400/10', gradientTo: 'to-emerald-400/5' },
};

function getArchetype(traits: TraitScore[]): string {
  if (traits.length === 0) return 'The Seeker';
  const top = [...traits].sort((a, b) => b.score - a.score).slice(0, 3);
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

const COSMIC_AGE_DESCRIPTIONS: Record<number, string> = {
  1: 'The Pioneer Soul — eternally forging new paths across the cosmos',
  2: 'The Harmonic Soul — weaving connections between the stars',
  3: 'The Creative Soul — painting the universe with expression',
  4: 'The Architect Soul — building foundations that span galaxies',
  5: 'The Nomadic Soul — exploring every corner of the cosmic expanse',
  6: 'The Nurturing Soul — tending to the garden of the universe',
  7: 'The Mystic Soul — seeking truth beyond the veil of stars',
  8: 'The Sovereign Soul — commanding the cosmic tides of power',
  9: 'The Universal Soul — embracing all that the cosmos offers',
  11: 'The Illumined Soul — a channel for cosmic radiance',
  22: 'The Master Builder Soul — architect of cosmic dreams',
  33: 'The Christed Soul — pure compassion in cosmic form',
};

function getCosmicAge(lifePathNumber: number): { age: number; description: string } {
  const cosmicAge = lifePathNumber * 7 + 100;
  const description = COSMIC_AGE_DESCRIPTIONS[lifePathNumber] || COSMIC_AGE_DESCRIPTIONS[9];
  return { age: cosmicAge, description };
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

export default function ProfileView() {
  const { birthDetails, astrologyData, numerologyData, traitScores, hasPaid, reportSections, reset, setView, userId, resetKundaliData, setOnboardingStep, setBirthDetails, reportLoading } = useAyuAstroStore();
  const [isExporting, setIsExporting] = useState(false);

  const handleExportData = async () => {
    if (!userId) {
      cosmicToast.warning('No user data found', 'Please complete onboarding first');
      return;
    }
    setIsExporting(true);
    try {
      const response = await fetch(`/api/user/export?userId=${encodeURIComponent(userId)}`);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || data.message || 'Export failed');
      }
      const data = await response.json();
      // Create downloadable JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ayuastro-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      cosmicToast.success('Data Exported! ✦', 'Your cosmic data has been downloaded');
    } catch (err) {
      cosmicToast.warning('Export Failed', err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsExporting(false);
    }
  };

  const handleReset = () => {
    cosmicToast.cosmic('Starting fresh ✦', 'Your cosmic journey awaits anew');
    reset();
    setView('landing');
  };

  const handleCreateNewKundali = () => {
    const savedName = birthDetails?.name || '';
    resetKundaliData();
    setBirthDetails({ name: savedName });
    setOnboardingStep('birth');
    setView('onboarding');
    cosmicToast.cosmic('New Kundali ✦', 'Enter new birth details — your name is saved');
  };

  const sunSign = astrologyData?.sunSign || 'Capricorn';
  const moonSign = astrologyData?.moonSign || 'Gemini';
  const ascendant = astrologyData?.ascendant || 'Taurus';
  const signInfo = ZODIAC_ELEMENTS[sunSign];
  const archetype = getArchetype(traitScores);
  const archetypeEmoji = getArchetypeEmoji(archetype);

  // Trait highlights
  const sortedTraits = [...traitScores].sort((a, b) => b.score - a.score);
  const top3 = sortedTraits.slice(0, 3);
  const bottom3 = sortedTraits.slice(-3).reverse();

  // Cosmic Score: average of top 5 traits
  const top5 = sortedTraits.slice(0, 5);
  const cosmicScore = top5.length > 0
    ? Math.round(top5.reduce((sum, t) => sum + t.score, 0) / top5.length)
    : 0;

  // Account stats
  const analysisDate = birthDetails?.dateOfBirth || '—';
  const questionsAnswered = 8; // based on fixed questionnaire
  const sectionsUnlocked = hasPaid ? reportSections.length : reportSections.filter(s => s.insightLevel === 'free').length;

  return (
    <div className="bg-cream px-4 py-6 pb-24">
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="mx-auto max-w-lg space-y-6"
      >

        {/* Cosmic Identity Card */}
        <motion.div variants={staggerItem}>
          <Card className="border-0 shadow-md overflow-hidden relative">
            {/* Radial gradient glow behind card */}
            <div className="absolute -inset-4 bg-radial-[at_50%_30%] from-gold/10 to-transparent pointer-events-none blur-xl" aria-hidden="true" />
            <div className={`relative bg-gradient-to-br ${signInfo?.gradientFrom || 'from-gold/10'} ${signInfo?.gradientTo || 'to-brown-100/5'} dark:from-gold/5 dark:to-brown-50/5 p-6`}>
              {/* Decorative zodiac pattern */}
              <div className="absolute top-2 right-3 text-gold/10 text-xs tracking-[0.5em] leading-relaxed select-none">
                <div>♈ ♉ ♊ ♋</div>
                <div>♌ ♍ ♎ ♏</div>
                <div>♐ ♑ ♒ ♓</div>
              </div>
              <div className="absolute bottom-2 left-3 text-gold/10 text-xs tracking-[0.5em] leading-relaxed select-none">
                <div>☉ ☽ ☿ ♀</div>
                <div>♂ ♃ ♄ ♅</div>
              </div>

              {/* Decorative border */}
              <div className="absolute inset-2 border border-gold/10 rounded-xl pointer-events-none" />

              <div className="relative text-center">
                <div className="mb-3 flex justify-center">
                  <div className="flex size-20 items-center justify-center rounded-full bg-white/60 border-2 border-gold/20">
                    <span className="text-4xl">{ZODIAC_ICONS[sunSign]}</span>
                  </div>
                </div>
                <h1
                  className="font-serif text-2xl font-bold text-brown-900"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  {birthDetails?.name || 'Seeker'}
                </h1>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span className="text-lg">{archetypeEmoji}</span>
                  <p
                    className="font-serif text-sm font-semibold text-gold-dark"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    {archetype}
                  </p>
                </div>
                <div className="flex items-center justify-center gap-4 mt-3">
                  <div className="text-center">
                    <div className="flex size-10 items-center justify-center rounded-full bg-white/50 border border-gold/15 mx-auto mb-1">
                      <Sun className="size-4 text-gold" />
                    </div>
                    <p className="text-[9px] uppercase tracking-wider text-brown-400">Sun</p>
                    <p className="text-xs font-semibold text-brown-900">{sunSign}</p>
                  </div>
                  <div className="text-center">
                    <div className="flex size-10 items-center justify-center rounded-full bg-white/50 border border-brown-200 mx-auto mb-1">
                      <Moon className="size-4 text-brown-400" />
                    </div>
                    <p className="text-[9px] uppercase tracking-wider text-brown-400">Moon</p>
                    <p className="text-xs font-semibold text-brown-900">{moonSign}</p>
                  </div>
                  <div className="text-center">
                    <div className="flex size-10 items-center justify-center rounded-full bg-white/50 border border-sage/20 mx-auto mb-1">
                      <Compass className="size-4 text-brown-500" />
                    </div>
                    <p className="text-[9px] uppercase tracking-wider text-brown-400">Asc</p>
                    <p className="text-xs font-semibold text-brown-900">{ascendant}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Cosmic Score Section */}
        <motion.div variants={staggerItem}>
          <Card className="card-hover border-0 shadow-md bg-white dark:bg-white/5 transition-all hover:-translate-y-[3px] hover:shadow-lg">
            <CardContent className="p-6">
              <div className="flex flex-col items-center">
                {/* SVG Progress Ring */}
                <div className="relative mb-4">
                  <svg width="200" height="200" viewBox="0 0 200 200" className="-rotate-90">
                    <defs>
                      <linearGradient id="cosmicScoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#B8960C" />
                        <stop offset="50%" stopColor="#D4AF37" />
                        <stop offset="100%" stopColor="#F0C14B" />
                      </linearGradient>
                    </defs>
                    {/* Background circle */}
                    <circle
                      cx="100" cy="100" r="85"
                      fill="none"
                      stroke="rgba(93,64,55,0.08)"
                      strokeWidth="10"
                    />
                    {/* Progress circle */}
                    <motion.circle
                      cx="100" cy="100" r="85"
                      fill="none"
                      stroke="url(#cosmicScoreGradient)"
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 85}`}
                      initial={{ strokeDashoffset: 2 * Math.PI * 85 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 85 * (1 - (cosmicScore / 100)) }}
                      transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
                    />
                  </svg>
                  {/* Center text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center rotate-0">
                    <motion.span
                      className="text-gold-gradient font-serif text-5xl font-bold"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.8, type: 'spring', stiffness: 200 }}
                    >
                      {cosmicScore}
                    </motion.span>
                    <span className="text-xs text-brown-400 dark:text-brown-300 mt-1">/100</span>
                  </div>
                </div>

                {/* Score label */}
                <h3
                  className="font-serif text-lg font-semibold text-brown-900 dark:text-brown-100 mb-1 text-center"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  Your Cosmic Score: {cosmicScore}/100
                </h3>

                {/* What this means tooltip */}
                <div className="flex items-center gap-1.5 mb-4">
                  <p className="text-xs text-brown-400 dark:text-brown-300">
                    Based on your top 5 emotional traits
                  </p>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="text-brown-300 hover:text-gold dark:text-brown-500 dark:hover:text-gold transition-colors" aria-label="What does this score mean?">
                          <HelpCircle className="size-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[240px] bg-white dark:bg-brown-800 text-brown-700 dark:text-brown-200 text-xs border border-gold/10">
                        <p>Your Cosmic Score reflects the overall alignment of your top emotional traits. A higher score indicates stronger self-awareness and emotional harmony across key dimensions of your personality.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                {/* Share Score Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => cosmicToast.info('Cosmic Score shared! ✦', `My Cosmic Score is ${cosmicScore}/100`)}
                  className="border-gold/30 text-gold-dark dark:text-gold hover:bg-gold/5 text-xs"
                >
                  <Share2 className="size-3.5 mr-1.5" />
                  Share Score
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Trait Highlights */}
        {traitScores.length > 0 && (
          <motion.div variants={staggerItem}>
            <Card className="card-hover border-0 shadow-md bg-white dark:bg-white/5 transition-all hover:-translate-y-[3px] hover:shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-brown-900 dark:text-brown-100">
                  <BarChart3 className="size-5 text-gold" />
                  Trait Highlights
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Top 3 Traits */}
                <div className="mb-4">
                  <div className="flex items-center gap-1.5 mb-2">
                    <TrendingUp className="size-3.5 text-sage-dark" />
                    <span className="text-xs font-semibold text-sage-dark uppercase tracking-wider">Strongest Traits</span>
                  </div>
                  <div className="space-y-2">
                    {top3.map((trait, i) => (
                      <div key={trait.name} className="flex items-center gap-3">
                        <span className="text-xs font-medium text-brown-700 w-24 truncate">{trait.label || trait.name}</span>
                        <div className="flex-1 h-2 rounded-full bg-sage-muted/30 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${trait.score}%` }}
                            transition={{ duration: 0.6, delay: 0.1 * i, ease: 'easeOut' }}
                            className="h-full rounded-full bg-sage"
                          />
                        </div>
                        <span className="text-xs font-semibold text-sage-dark w-8 text-right">{Math.round(trait.score)}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator className="my-3 bg-brown-100" />

                {/* Bottom 3 Traits */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <TrendingDown className="size-3.5 text-gold-dark" />
                    <span className="text-xs font-semibold text-gold-dark uppercase tracking-wider">Growth Areas</span>
                  </div>
                  <div className="space-y-2">
                    {bottom3.map((trait, i) => (
                      <div key={trait.name} className="flex items-center gap-3">
                        <span className="text-xs font-medium text-brown-700 w-24 truncate">{trait.label || trait.name}</span>
                        <div className="flex-1 h-2 rounded-full bg-gold/10 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${trait.score}%` }}
                            transition={{ duration: 0.6, delay: 0.1 * i, ease: 'easeOut' }}
                            className="h-full rounded-full bg-gold"
                          />
                        </div>
                        <span className="text-xs font-semibold text-gold-dark w-8 text-right">{Math.round(trait.score)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Birth Details */}
        <motion.div variants={staggerItem}>
          <Card className="card-hover border-0 shadow-md bg-white dark:bg-white/5 transition-all hover:-translate-y-[3px] hover:shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-brown-900 dark:text-brown-100">
                <User className="size-5 text-brown-500" />
                Birth Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="size-4 text-brown-300" />
                  <div>
                    <p className="text-xs text-brown-400">Date of Birth</p>
                    <p className="text-sm font-medium text-brown-900">
                      {birthDetails?.dateOfBirth || 'Not provided'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="size-4 text-brown-300" />
                  <div>
                    <p className="text-xs text-brown-400">Time of Birth</p>
                    <p className="text-sm font-medium text-brown-900">
                      {birthDetails?.timeOfBirth || 'Not provided'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="size-4 text-brown-300" />
                  <div>
                    <p className="text-xs text-brown-400">Place of Birth</p>
                    <p className="text-sm font-medium text-brown-900">
                      {birthDetails?.placeOfBirth || 'Not provided'}
                    </p>
                  </div>
                </div>
                {birthDetails?.relationshipStatus && (
                  <div className="flex items-center gap-3">
                    <Heart className="size-4 text-brown-300" />
                    <div>
                      <p className="text-xs text-brown-400">Relationship Status</p>
                      <p className="text-sm font-medium text-brown-900">
                        {birthDetails.relationshipStatus}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Astrology Summary */}
        <motion.div variants={staggerItem}>
          <Card className="card-hover border-0 shadow-md bg-white dark:bg-white/5 transition-all hover:-translate-y-[3px] hover:shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-brown-900 dark:text-brown-100">
                <Moon className="size-5 text-gold" />
                Vedic Astrology
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center rounded-xl bg-brown-50 dark:bg-brown-50/20 p-3">
                  <Sun className="mx-auto mb-1 size-4 text-gold" />
                  <p className="text-[10px] uppercase tracking-wider text-brown-400">Sun</p>
                  <p className="text-sm font-semibold text-brown-900">
                    {astrologyData?.sunSign || '—'}
                  </p>
                </div>
                <div className="text-center rounded-xl bg-brown-50 dark:bg-brown-50/20 p-3">
                  <Moon className="mx-auto mb-1 size-4 text-brown-400" />
                  <p className="text-[10px] uppercase tracking-wider text-brown-400">Moon</p>
                  <p className="text-sm font-semibold text-brown-900">
                    {astrologyData?.moonSign || '—'}
                  </p>
                </div>
                <div className="text-center rounded-xl bg-brown-50 dark:bg-brown-50/20 p-3">
                  <Compass className="mx-auto mb-1 size-4 text-brown-500" />
                  <p className="text-[10px] uppercase tracking-wider text-brown-400">Ascendant</p>
                  <p className="text-sm font-semibold text-brown-900">
                    {astrologyData?.ascendant || '—'}
                  </p>
                </div>
              </div>

              {astrologyData?.nakshatra && (
                <>
                  <Separator className="my-3 bg-brown-100" />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-brown-400">Nakshatra</p>
                      <p className="text-sm font-medium text-brown-900">{astrologyData.nakshatra}</p>
                    </div>
                    {astrologyData.currentDasha && (
                      <div className="text-right">
                        <p className="text-xs text-brown-400">Current Dasha</p>
                        <p className="text-sm font-medium text-brown-900">{astrologyData.currentDasha}</p>
                      </div>
                    )}
                  </div>
                </>
              )}

              {astrologyData?.yogas && astrologyData.yogas.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-brown-400 mb-1">Yogas</p>
                  <div className="flex flex-wrap gap-1">
                    {astrologyData.yogas.map((yoga, i) => (
                      <Badge key={i} className="bg-sage-muted text-sage-dark border-0 text-xs">
                        {yoga}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Numerology Summary */}
        <motion.div variants={staggerItem}>
          <Card className="card-hover border-0 shadow-md bg-white dark:bg-white/5 transition-all hover:-translate-y-[3px] hover:shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-brown-900 dark:text-brown-100">
                <Hash className="size-5 text-gold" />
                Numerology
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-brown-50 dark:bg-brown-50/20 p-3 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-brown-400">Life Path</p>
                  <p
                    className="font-serif text-3xl font-bold text-brown-900"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    {numerologyData?.lifePathNumber || '—'}
                  </p>
                </div>
                <div className="rounded-xl bg-brown-50 dark:bg-brown-50/20 p-3 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-brown-400">Destiny</p>
                  <p
                    className="font-serif text-3xl font-bold text-brown-900"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    {numerologyData?.destinyNumber || '—'}
                  </p>
                </div>
                <div className="rounded-xl bg-brown-50 dark:bg-brown-50/20 p-3 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-brown-400">Soul Urge</p>
                  <p
                    className="font-serif text-3xl font-bold text-brown-900"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    {numerologyData?.soulUrgeNumber || '—'}
                  </p>
                </div>
                <div className="rounded-xl bg-brown-50 dark:bg-brown-50/20 p-3 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-brown-400">Personality</p>
                  <p
                    className="font-serif text-3xl font-bold text-brown-900"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    {numerologyData?.personalityNumber || '—'}
                  </p>
                </div>
              </div>

              {numerologyData?.lifePathDesc && (
                <div className="mt-3">
                  <p className="text-xs text-brown-400 mb-1">Life Path Description</p>
                  <p className="text-sm text-brown-600 leading-relaxed">
                    {numerologyData.lifePathDesc}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Payment Status Section */}
        <motion.div variants={staggerItem}>
          <Card className="card-hover border-0 shadow-md bg-white dark:bg-white/5 transition-all hover:-translate-y-[3px] hover:shadow-lg overflow-hidden">
            <div className={`h-1 ${hasPaid ? 'bg-gradient-to-r from-gold via-gold-light to-gold-dark' : 'bg-gradient-to-r from-brown-200 via-brown-300 to-brown-200'}`} />
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-brown-900 dark:text-brown-100">
                {hasPaid ? (
                  <Star className="size-5 text-gold" />
                ) : (
                  <Lock className="size-5 text-brown-400" />
                )}
                Payment Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {hasPaid ? (
                <div className="flex items-center gap-3">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-gold/10 dark:bg-gold/15 border border-gold/20">
                    <Star className="size-6 text-gold" />
                  </div>
                  <div className="flex-1">
                    <Badge className="bg-gold/15 text-gold-dark dark:bg-gold/20 dark:text-gold border border-gold/20 dark:border-gold/15 text-xs font-semibold px-3 py-1">
                      Premium Member ✓
                    </Badge>
                    <p className="text-xs text-brown-400 dark:text-brown-500 mt-1.5">
                      Full access to all premium sections and reports unlocked.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brown-50 dark:bg-brown-50/20 border border-brown-200 dark:border-brown-100/30">
                      <Lock className="size-5 text-brown-300 dark:text-brown-500" />
                    </div>
                    <div className="flex-1">
                      <Badge className="bg-brown-50 dark:bg-brown-50/20 text-brown-400 dark:text-brown-500 border border-brown-200 dark:border-brown-100/30 text-xs font-medium px-3 py-1">
                        Free Plan
                      </Badge>
                      <p className="text-xs text-brown-400 dark:text-brown-500 mt-1.5">
                        Upgrade to unlock all premium sections and deep analysis.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => setView('premium')}
                      size="sm"
                      className="flex-1 bg-brown-700 dark:bg-gold dark:text-brown-900 text-white hover:bg-brown-800 dark:hover:bg-gold-light text-xs"
                    >
                      <Star className="mr-1.5 size-3.5" />
                      Upgrade to Premium
                    </Button>
                    <Button
                      onClick={() => setView('premium')}
                      variant="ghost"
                      size="sm"
                      className="text-brown-400 dark:text-brown-500 hover:text-gold-dark dark:hover:text-gold text-xs"
                    >
                      Verify Payment
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Account Stats */}
        <motion.div variants={staggerItem}>
          <Card className="card-hover border-0 shadow-md bg-white dark:bg-white/5 transition-all hover:-translate-y-[3px] hover:shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-brown-900 dark:text-brown-100">
                <Sparkles className="size-5 text-gold" />
                Account Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center rounded-xl bg-brown-50 dark:bg-brown-50/20 p-3">
                  <FileText className="mx-auto mb-1 size-4 text-brown-400" />
                  <p className="text-[10px] uppercase tracking-wider text-brown-400">Analysis</p>
                  <p className="text-sm font-semibold text-brown-900 dark:text-brown-100">{analysisDate !== '—' ? 'Complete' : 'Pending'}</p>
                </div>
                <div className="text-center rounded-xl bg-brown-50 dark:bg-brown-50/20 p-3">
                  <BarChart3 className="mx-auto mb-1 size-4 text-brown-400" />
                  <p className="text-[10px] uppercase tracking-wider text-brown-400">Questions</p>
                  <p className="text-sm font-semibold text-brown-900 dark:text-brown-100">{questionsAnswered}</p>
                </div>
                <div className="text-center rounded-xl bg-brown-50 dark:bg-brown-50/20 p-3">
                  {hasPaid ? (
                    <Star className="mx-auto mb-1 size-4 text-gold" />
                  ) : (
                    <Lock className="mx-auto mb-1 size-4 text-brown-300" />
                  )}
                  <p className="text-[10px] uppercase tracking-wider text-brown-400">Unlocked</p>
                  <p className="text-sm font-semibold text-brown-900 dark:text-brown-100">{sectionsUnlocked}/{reportSections.length || 7}</p>
                </div>
              </div>
              {!hasPaid && (
                <div className="mt-3">
                  <Button
                    onClick={() => setView('premium')}
                    variant="outline"
                    size="sm"
                    className="w-full border-gold/30 text-gold-dark hover:bg-gold/5"
                  >
                    <Star className="mr-1 size-3.5" />
                    Unlock All Sections
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Mood Journal Card */}
        <motion.div variants={staggerItem} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
          <Card
            className="card-hover border-0 shadow-md bg-gradient-to-br from-gold/5 to-sage-muted/10 dark:from-gold/5 dark:to-sage-muted/5 cursor-pointer transition-shadow hover:shadow-[0_8px_30px_rgba(139,111,71,0.12)]"
            onClick={() => setView('mood')}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white/80 dark:bg-brown-50/20 border border-gold/20">
                  <BookHeart className="size-6 text-gold" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-serif text-base font-semibold text-brown-900 dark:text-brown-100"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                    Mood Journal
                  </h3>
                  <p className="text-xs text-brown-400 dark:text-brown-500 mt-0.5">
                    Track your emotional patterns
                  </p>
                </div>
                <span className="text-2xl">🤩</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Breathing & Meditation Card */}
        <motion.div variants={staggerItem} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
          <Card
            className="card-hover border-0 shadow-md bg-gradient-to-br from-sage-muted/15 to-gold/10 dark:from-sage-muted/10 dark:to-gold/5 cursor-pointer transition-shadow hover:shadow-[0_8px_30px_rgba(139,111,71,0.12)]"
            onClick={() => setView('breathing')}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white/80 dark:bg-brown-50/20 border border-sage/20">
                  <Wind className="size-6 text-sage-dark dark:text-sage" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-serif text-base font-semibold text-brown-900 dark:text-brown-100"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                    Breathing & Meditation
                  </h3>
                  <p className="text-xs text-brown-400 dark:text-brown-500 mt-0.5">
                    Find your cosmic calm
                  </p>
                </div>
                <span className="text-2xl">🌬️</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Cosmic Age Card */}
        {numerologyData?.lifePathNumber && (
          <motion.div variants={staggerItem}>
            <Card className="card-hover border-0 shadow-md overflow-hidden bg-white dark:bg-white/5 transition-all hover:-translate-y-[3px] hover:shadow-lg">
              <div className="h-1 bg-gradient-to-r from-gold via-gold-light to-gold-dark" />
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-brown-900 dark:text-brown-100">
                  <Infinity className="size-5 text-gold" />
                  Cosmic Age
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const cosmicAge = getCosmicAge(numerologyData.lifePathNumber);
                  return (
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <span
                          className="text-gold-gradient font-serif text-5xl font-bold"
                          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                        >
                          {cosmicAge.age}
                        </span>
                        <span className="text-sm text-brown-400 dark:text-brown-300">cosmic<br/>years</span>
                      </div>
                      <p className="text-sm text-brown-500 dark:text-brown-300 leading-relaxed mt-2">
                        {cosmicAge.description}
                      </p>
                      <p className="text-[10px] text-brown-300 dark:text-brown-400 mt-2">
                        Based on Life Path {numerologyData.lifePathNumber} — your soul has traversed {cosmicAge.age} cosmic years of evolution
                      </p>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Decorative section divider */}
        <div className="section-divider">
          <span className="text-gold text-lg zodiac-glow">✦</span>
        </div>

        {/* Create New Kundali Button — prominent */}
        <motion.div variants={staggerItem}>
          <Button
            onClick={handleCreateNewKundali}
            className="w-full bg-brown-700 dark:bg-gold dark:text-brown-900 text-white hover:bg-brown-800 dark:hover:bg-gold-light"
          >
            <Sparkles className="mr-2 size-4" />
            Create New Kundali
          </Button>
        </motion.div>

        {/* Export My Data Button */}
        <motion.div variants={staggerItem}>
          <Button
            onClick={handleExportData}
            disabled={isExporting}
            variant="outline"
            className="w-full border-gold/30 text-gold-dark dark:text-gold hover:bg-gold/5 disabled:opacity-50"
          >
            {isExporting ? (
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="inline-block mr-2"
              >
                <Sparkles className="size-4" />
              </motion.span>
            ) : (
              <Download className="mr-2 size-4" />
            )}
            {isExporting ? 'Exporting...' : 'Export My Data'}
          </Button>
        </motion.div>

        {/* Report Loading Indicator */}
        {reportLoading && (
          <motion.div variants={staggerItem}>
            <Card className="card-hover border-0 shadow-md bg-gradient-to-r from-gold/5 to-sage-muted/10 dark:from-gold/5 dark:to-sage-muted/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-full bg-gold/10">
                    <Sparkles className="size-4 text-gold animate-pulse" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-brown-900 dark:text-brown-100">AI Report Generating...</p>
                    <p className="text-xs text-brown-400 dark:text-brown-500">Your personalized report is being written in the background</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Start Over — with shake on hover */}
        <motion.div variants={staggerItem}>
          <motion.div
            whileHover={{ x: [0, -3, 3, -3, 3, 0] }}
            transition={{ duration: 0.4 }}
          >
            <Button
              onClick={handleReset}
              variant="outline"
              className="w-full border-brown-200 text-brown-500 hover:bg-brown-50 hover:text-brown-700"
            >
              <RotateCcw className="mr-2 size-4" />
              Start Over
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
