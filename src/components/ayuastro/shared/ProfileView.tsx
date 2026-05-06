'use client';

import { useAyuAstroStore, type TraitScore } from '@/store/ayuastro-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
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
} from 'lucide-react';

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

const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

export default function ProfileView() {
  const { birthDetails, astrologyData, numerologyData, traitScores, hasPaid, reportSections, reset, setView } = useAyuAstroStore();

  const handleReset = () => {
    reset();
    setView('landing');
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

  // Account stats
  const analysisDate = birthDetails?.dateOfBirth || '—';
  const questionsAnswered = 8; // based on fixed questionnaire
  const sectionsUnlocked = hasPaid ? reportSections.length : reportSections.filter(s => s.insightLevel === 'free').length;

  return (
    <div className="bg-cream px-4 py-6 pb-24">
      <div className="mx-auto max-w-lg space-y-6">

        {/* Cosmic Identity Card */}
        <motion.div {...fadeInUp} transition={{ duration: 0.4 }}>
          <Card className="border-0 shadow-sm overflow-hidden">
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

        {/* Trait Highlights */}
        {traitScores.length > 0 && (
          <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.05 }}>
            <Card className="border-0 shadow-sm bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-brown-900">
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
        <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.1 }}>
          <Card className="border-0 shadow-sm bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-brown-900">
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
        <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.15 }}>
          <Card className="border-0 shadow-sm bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-brown-900">
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
        <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.2 }}>
          <Card className="border-0 shadow-sm bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-brown-900">
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

        {/* Account Stats */}
        <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.25 }}>
          <Card className="border-0 shadow-sm bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-brown-900">
                <Sparkles className="size-5 text-gold" />
                Account Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center rounded-xl bg-brown-50 dark:bg-brown-50/20 p-3">
                  <FileText className="mx-auto mb-1 size-4 text-brown-400" />
                  <p className="text-[10px] uppercase tracking-wider text-brown-400">Analysis</p>
                  <p className="text-sm font-semibold text-brown-900">{analysisDate !== '—' ? 'Complete' : 'Pending'}</p>
                </div>
                <div className="text-center rounded-xl bg-brown-50 dark:bg-brown-50/20 p-3">
                  <BarChart3 className="mx-auto mb-1 size-4 text-brown-400" />
                  <p className="text-[10px] uppercase tracking-wider text-brown-400">Questions</p>
                  <p className="text-sm font-semibold text-brown-900">{questionsAnswered}</p>
                </div>
                <div className="text-center rounded-xl bg-brown-50 dark:bg-brown-50/20 p-3">
                  {hasPaid ? (
                    <Star className="mx-auto mb-1 size-4 text-gold" />
                  ) : (
                    <Lock className="mx-auto mb-1 size-4 text-brown-300" />
                  )}
                  <p className="text-[10px] uppercase tracking-wider text-brown-400">Unlocked</p>
                  <p className="text-sm font-semibold text-brown-900">{sectionsUnlocked}/{reportSections.length || 7}</p>
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

        {/* Start Over */}
        <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.3 }}>
          <Button
            onClick={handleReset}
            variant="outline"
            className="w-full border-brown-200 text-brown-500 hover:bg-brown-50 hover:text-brown-700"
          >
            <RotateCcw className="mr-2 size-4" />
            Start Over
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
