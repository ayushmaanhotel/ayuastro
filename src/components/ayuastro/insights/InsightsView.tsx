'use client';

import { useAyuAstroStore, type TraitScore, type AstrologyInfo } from '@/store/ayuastro-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
} from 'lucide-react';

const ZODIAC_ICONS: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋', Leo: '♌', Virgo: '♍',
  Libra: '♎', Scorpio: '♏', Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
};

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
  return 'The Reflective Seeker';
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

export default function InsightsView() {
  const { traitScores, astrologyData, birthDetails, setView } = useAyuAstroStore();

  const topTraits = getTopTraits(traitScores);
  const archetype = getArchetype(traitScores);
  const strengths = getStrengths(traitScores);
  const blindSpots = getBlindSpots(traitScores);

  // Default tags from top traits
  const topTags =
    traitScores.length > 0
      ? topTraits.map((t) => t.label || t.name)
      : ['Reflective', 'Intuitive', 'Grounded'];

  return (
    <div className="bg-cream px-4 py-6 pb-24">
      <div className="mx-auto max-w-lg space-y-6">
        {/* Header Section */}
        <motion.div {...fadeInUp} transition={{ duration: 0.4 }}>
          <h1
            className="font-serif text-3xl font-bold text-brown-900 mb-1"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Your Emotional Resonance
          </h1>
          <p className="text-sm text-brown-400 mb-4">
            The architecture of your emotional world, mapped through cosmic and behavioral patterns.
          </p>
          <div className="flex flex-wrap gap-2">
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
          <Card className="border-0 shadow-sm bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-brown-900">
                <Compass className="size-5 text-gold" />
                The Anchor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-serif text-xl font-bold text-brown-900 mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                {archetype}
              </p>
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
          <Card className="border-0 shadow-sm bg-white">
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
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="size-3.5 text-sage-dark shrink-0" />
                          <span className="text-sm text-brown-700">Deep Empathy</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="size-3.5 text-sage-dark shrink-0" />
                          <span className="text-sm text-brown-700">Intuitive Wisdom</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="size-3.5 text-sage-dark shrink-0" />
                          <span className="text-sm text-brown-700">Emotional Resilience</span>
                        </div>
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
                        <div className="flex items-center gap-2">
                          <Shield className="size-3.5 text-gold-dark shrink-0" />
                          <span className="text-sm text-brown-700">Boundary Setting</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Shield className="size-3.5 text-gold-dark shrink-0" />
                          <span className="text-sm text-brown-700">Self-Advocacy</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Shield className="size-3.5 text-gold-dark shrink-0" />
                          <span className="text-sm text-brown-700">Delegation</span>
                        </div>
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
          <Card className="border-0 shadow-sm bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-brown-900">
                <Sparkles className="size-5 text-gold" />
                Trait Scores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(traitScores.length > 0 ? traitScores : getDefaultTraits()).map((trait, i) => (
                  <div key={trait.name} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-brown-800">{trait.label || trait.name}</span>
                      <Badge className={`${getTraitColor(trait.score)} border-0 text-xs px-2 py-0`}>
                        {Math.round(trait.score)}%
                      </Badge>
                    </div>
                    <div className="h-2 rounded-full bg-brown-100 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${trait.score}%` }}
                        transition={{ duration: 0.8, delay: 0.1 * i }}
                        className={`h-full rounded-full ${getTraitBarColor(trait.score)}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Astrology Summary Card */}
        <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.25 }}>
          <Card className="border-0 shadow-sm bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-brown-900">
                <Moon className="size-5 text-gold" />
                Vedic Astrology Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center rounded-xl bg-brown-50 p-3">
                  <Sun className="mx-auto mb-1 size-5 text-gold" />
                  <p className="text-[10px] uppercase tracking-wider text-brown-400">Sun</p>
                  <p className="text-sm font-semibold text-brown-900">
                    {astrologyData?.sunSign || 'Taurus'}
                  </p>
                  <span className="text-xs text-brown-300">
                    {ZODIAC_ICONS[astrologyData?.sunSign || 'Taurus']}
                  </span>
                </div>
                <div className="text-center rounded-xl bg-brown-50 p-3">
                  <Moon className="mx-auto mb-1 size-5 text-brown-400" />
                  <p className="text-[10px] uppercase tracking-wider text-brown-400">Moon</p>
                  <p className="text-sm font-semibold text-brown-900">
                    {astrologyData?.moonSign || 'Pisces'}
                  </p>
                  <span className="text-xs text-brown-300">
                    {ZODIAC_ICONS[astrologyData?.moonSign || 'Pisces']}
                  </span>
                </div>
                <div className="text-center rounded-xl bg-brown-50 p-3">
                  <Compass className="mx-auto mb-1 size-5 text-brown-500" />
                  <p className="text-[10px] uppercase tracking-wider text-brown-400">Ascendant</p>
                  <p className="text-sm font-semibold text-brown-900">
                    {astrologyData?.ascendant || 'Gemini'}
                  </p>
                  <span className="text-xs text-brown-300">
                    {ZODIAC_ICONS[astrologyData?.ascendant || 'Gemini']}
                  </span>
                </div>
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

        {/* CTA */}
        <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.3 }}>
          <Button
            onClick={() => setView('premium')}
            className="w-full bg-brown-700 py-6 text-base font-medium text-white hover:bg-brown-800"
          >
            <Heart className="mr-2 size-4" />
            Unlock Full Profile
            <ArrowRight className="ml-2 size-4" />
          </Button>
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
