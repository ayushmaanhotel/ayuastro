'use client';
import { useState, useEffect } from 'react';
import { useAyuAstroStore } from '@/store/ayuastro-store';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  ChevronDown,
  Sparkles,
  Shield,
  Target,
  Lightbulb,
  TrendingUp,
  TrendingDown,
  Crown,
  Eye,
  Flame,
  Moon,
  Gem,
  HandHeart,
  Sun,
  Utensils,
  Compass,
} from 'lucide-react';
// ─── Types ────────────────────────────────────────────────────────────────────
interface BreakdownItem {
  score: number;
  label: string;
  description: string;
  details?: string[];
  subScores?: Record<string, number>;
}
interface ShadbalaDetails {
  sthanaBala: number;
  digBala: number;
  chestaBala: number;
  navamshaBonus: number;
}
interface VedicRemedies {
  gemstones: string[];
  mantras: string[];
  dayPractices: string[];
  fasting: string[];
  disclaimer: string;
}
interface KundaliScoreData {
  overallScore: number;
  grade: string;
  gradeDescription: string;
  breakdown: {
    planetStrength: BreakdownItem;
    yogaScore: BreakdownItem;
    doshaPenalty: BreakdownItem;
    housePlacement: BreakdownItem;
    ascendantLord: BreakdownItem;
    nakshatraStrength?: BreakdownItem;
    elementalBalance?: BreakdownItem;
  };
  honestAssessment: string;
  topStrength: string;
  topChallenge: string;
  remedies: string[];
  shadbalaDetails?: ShadbalaDetails;
  vedicRemedies?: VedicRemedies;
}
// ─── Helper Functions ─────────────────────────────────────────────────────────
function getScoreColor(score: number): string {
  if (score >= 70) return 'text-sage-dark dark:text-sage';
  if (score >= 50) return 'text-gold-dark dark:text-gold';
  return 'text-red-500 dark:text-red-400';
}
function getBarColor(score: number): string {
  if (score >= 70) return 'bg-sage';
  if (score >= 50) return 'bg-gold';
  return 'bg-red-500';
}
function getBarBg(score: number): string {
  if (score >= 70) return 'bg-sage-muted/30 dark:bg-sage/10';
  if (score >= 50) return 'bg-gold/10 dark:bg-gold/10';
  return 'bg-red-100 dark:bg-red-900/20';
}
function getGradeColor(grade: string): string {
  if (grade === 'Exceptional' || grade === 'Strong') return 'text-sage-dark dark:text-sage bg-sage-muted/30 dark:bg-sage/10';
  if (grade === 'Good' || grade === 'Average') return 'text-gold-dark dark:text-gold bg-gold/10';
  return 'text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
}
function getRingStroke(score: number): string {
  if (score >= 70) return '#5B7553'; // sage-dark
  if (score >= 50) return '#8B6914'; // gold-dark
  return '#EF4444'; // red-500
}
const BREAKDOWN_ICONS: Record<string, React.ElementType> = {
  'Graha Strength (Shadbala)': Star,
  'Planet Strength': Star,
  'Yogas & Blessings': Sparkles,
  'Doshas & Challenges': Shield,
  'Bhava Strength': Target,
  'House Layout': Target,
  'Lagna Lord': Crown,
  'Ascendant Lord': Crown,
  'Nakshatra Strength': Moon,
  'Elemental Balance': Flame,
};
// ─── SVG Ring Component ───────────────────────────────────────────────────────
function ScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const strokeColor = getRingStroke(score);
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-brown-100 dark:text-brown-800"
        />
        {/* Progress ring */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
        />
      </svg>
      {/* Score text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="font-serif text-3xl font-bold"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.5, type: 'spring' }}
        >
          <span className={getScoreColor(score)}>{score}</span>
        </motion.span>
        <span className="text-[11px] tracking-wider text-brown-500 dark:text-brown-600 font-semibold">
          out of 100
        </span>
      </div>
    </div>
  );
}
// ─── Breakdown Bar Component ──────────────────────────────────────────────────
function BreakdownBar({ item, delay = 0 }: { item: BreakdownItem; delay?: number }) {
  const Icon = BREAKDOWN_ICONS[item.label] || Star;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Icon className="size-3 text-brown-400 dark:text-brown-500" />
          <span className="text-xs font-medium text-brown-700 dark:text-brown-400">{item.label}</span>
        </div>
        <span className={`text-sm font-bold ${getScoreColor(item.score)}`}>{item.score}</span>
      </div>
      <div className={`h-2 rounded-full overflow-hidden ${getBarBg(item.score)}`}>
        <motion.div
          className={`h-full rounded-full ${getBarColor(item.score)}`}
          initial={{ width: 0 }}
          animate={{ width: `${item.score}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: delay + 0.5 }}
        />
      </div>
      <p className="text-[11px] text-brown-500 dark:text-brown-600 leading-relaxed">{item.description}</p>
      {/* Shabdala sub-scores for Planet Strength */}
      {item.subScores && (
        <div className="flex gap-2 mt-1">
          {Object.entries(item.subScores).map(([key, val]) => (
            <span key={key} className="text-[9px] px-1.5 py-0.5 rounded bg-brown-50 dark:bg-brown-800/50 text-brown-500 dark:text-brown-400 font-medium">
              {key}: {val}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
// ─── Skeleton ─────────────────────────────────────────────────────────────────
function KundaliScoreSkeleton() {
  return (
    <Card className="border-0 shadow-md overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-gold via-gold-dark to-gold" />
      <CardContent className="p-5">
        <div className="flex items-center justify-center mb-4">
          <div className="size-28 rounded-full bg-brown-100 dark:bg-brown-800 animate-pulse" />
        </div>
        <div className="h-4 w-24 bg-brown-100 dark:bg-brown-800 rounded animate-pulse mx-auto mb-2" />
        <div className="h-3 w-48 bg-brown-100 dark:bg-brown-800 rounded animate-pulse mx-auto mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between">
                <div className="h-3 w-24 bg-brown-100 dark:bg-brown-800 rounded animate-pulse" />
                <div className="h-3 w-8 bg-brown-100 dark:bg-brown-800 rounded animate-pulse" />
              </div>
              <div className="h-2 bg-brown-100 dark:bg-brown-800 rounded-full animate-pulse" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
// ─── Main Component ───────────────────────────────────────────────────────────
export default function KundaliScoreCard() {
  const { astrologyData, userId } = useAyuAstroStore();
  const [scoreData, setScoreData] = useState<KundaliScoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [remediesExpanded, setRemediesExpanded] = useState(false);
  const [vedicRemediesExpanded, setVedicRemediesExpanded] = useState(false);
  const sunSign = astrologyData?.sunSign || '';
  const moonSign = astrologyData?.moonSign || '';
  const ascendant = astrologyData?.ascendant || '';
  const planetaryPositions = astrologyData?.planetaryPositions || {};
  const yogas = astrologyData?.yogas || [];
  const doshas = astrologyData?.doshas || [];
  const nakshatra = astrologyData?.nakshatra || '';
  useEffect(() => {
    async function fetchKundaliScore() {
      setLoading(true);
      try {
        const res = await fetch('/api/astrology/kundali-score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: userId || undefined,
            sunSign,
            moonSign,
            ascendant,
            planetaryPositions,
            yogas,
            doshas,
            nakshatra,
          }),
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setScoreData(json.data);
          }
        }
      } catch {
        // Silently fail — kundali score is a nice-to-have
      } finally {
        setLoading(false);
      }
    }
    // Only fetch if we have some data
    if (ascendant || Object.keys(planetaryPositions).length > 0) {
      fetchKundaliScore();
    } else {
      setLoading(false);
    }
  }, [userId, sunSign, moonSign, ascendant, planetaryPositions, yogas, doshas, nakshatra]);
  if (loading) return <KundaliScoreSkeleton />;
  if (!scoreData) {
    // Fallback: show a simplified card if no data
    return (
      <Card className="border-0 shadow-md overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-gold via-gold-dark to-gold" />
        <CardContent className="p-5 text-center">
          <div className="flex size-12 items-center justify-center rounded-xl bg-gold/10 mx-auto mb-3">
            <Star className="size-6 text-gold-dark" />
          </div>
          <h3
            className="font-serif text-base font-bold text-brown-900 dark:text-brown-600 mb-1"
          >
            Kundali Score
          </h3>
          <p className="text-xs text-brown-500 dark:text-brown-600">
            Complete your birth details to see your Kundali Score
          </p>
        </CardContent>
      </Card>
    );
  }
  const breakdownItems = [
    scoreData.breakdown.planetStrength,
    scoreData.breakdown.yogaScore,
    scoreData.breakdown.doshaPenalty,
    scoreData.breakdown.housePlacement,
    scoreData.breakdown.ascendantLord,
    scoreData.breakdown.nakshatraStrength,
    scoreData.breakdown.elementalBalance,
  ].filter((item): item is BreakdownItem => !!item);

  const hasVedicRemedies = scoreData.vedicRemedies && (
    scoreData.vedicRemedies.gemstones.length > 0 ||
    scoreData.vedicRemedies.mantras.length > 0 ||
    scoreData.vedicRemedies.dayPractices.length > 0 ||
    scoreData.vedicRemedies.fasting.length > 0
  );

  return (
    <Card className="border-0 shadow-md overflow-hidden">
      {/* Gold accent bar */}
      <div className="h-1 bg-gradient-to-r from-gold via-gold-dark to-gold" />
      <CardContent className="p-5">
        {/* Score Ring & Grade */}
        <div className="flex flex-col items-center mb-4">
          <ScoreRing score={scoreData.overallScore} />
          {/* Grade Badge */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mt-2"
          >
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold ${getGradeColor(scoreData.grade)}`}
            >
              {scoreData.grade}
            </span>
          </motion.div>
          <p className="text-[11px] text-brown-500 dark:text-brown-600 mt-1 text-center leading-relaxed">
            {scoreData.gradeDescription}
          </p>
        </div>

        {/* Shadbala Summary (if available) */}
        {scoreData.shadbalaDetails && (
          <div className="bg-brown-50/50 dark:bg-brown-800/30 rounded-lg p-2.5 mb-4 border border-brown-100/50 dark:border-brown-700/30">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Compass className="size-3 text-brown-500 dark:text-brown-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-brown-600 dark:text-brown-400">
                Shadbala Components
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <div className="text-center">
                <div className="text-xs font-bold text-brown-800 dark:text-brown-300">{scoreData.shadbalaDetails.sthanaBala}</div>
                <div className="text-[9px] text-brown-500 dark:text-brown-500">Sthana</div>
              </div>
              <div className="text-center">
                <div className="text-xs font-bold text-brown-800 dark:text-brown-300">{scoreData.shadbalaDetails.digBala}</div>
                <div className="text-[9px] text-brown-500 dark:text-brown-500">Dig Bala</div>
              </div>
              <div className="text-center">
                <div className="text-xs font-bold text-brown-800 dark:text-brown-300">{scoreData.shadbalaDetails.chestaBala}</div>
                <div className="text-[9px] text-brown-500 dark:text-brown-500">Cheshta</div>
              </div>
              <div className="text-center">
                <div className={`text-xs font-bold ${scoreData.shadbalaDetails.navamshaBonus >= 0 ? 'text-sage-dark dark:text-sage' : 'text-red-500'}`}>
                  {scoreData.shadbalaDetails.navamshaBonus >= 0 ? '+' : ''}{scoreData.shadbalaDetails.navamshaBonus}
                </div>
                <div className="text-[9px] text-brown-500 dark:text-brown-500">Navamsha</div>
              </div>
            </div>
          </div>
        )}

        {/* Honest Assessment */}
        <div className="bg-gold/5 dark:bg-gold/5 rounded-lg p-3 mb-4 border border-gold/10 dark:border-gold/10">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Eye className="size-3 text-gold-dark dark:text-gold" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-gold-dark dark:text-gold">
              Honest Assessment
            </span>
          </div>
          <p className="text-sm text-brown-800 dark:text-brown-400 leading-relaxed">
            {scoreData.honestAssessment}
          </p>
        </div>
        {/* Top Strength & Challenge */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-sage-muted/20 dark:bg-sage/10 rounded-lg p-2.5">
            <div className="flex items-center gap-1 mb-1">
              <TrendingUp className="size-3 text-sage-dark dark:text-sage" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-sage-dark dark:text-sage">
                Top Strength
              </span>
            </div>
            <p className="text-xs text-brown-700 dark:text-brown-500 leading-relaxed">
              {scoreData.topStrength}
            </p>
          </div>
          <div className="bg-red-50 dark:bg-red-900/10 rounded-lg p-2.5">
            <div className="flex items-center gap-1 mb-1">
              <TrendingDown className="size-3 text-red-500 dark:text-red-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-500 dark:text-red-400">
                Top Challenge
              </span>
            </div>
            <p className="text-xs text-brown-700 dark:text-brown-500 leading-relaxed">
              {scoreData.topChallenge}
            </p>
          </div>
        </div>
        {/* Breakdown Bars */}
        <Collapsible open={detailsExpanded} onOpenChange={setDetailsExpanded}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between text-xs font-semibold text-brown-500 dark:text-brown-600 hover:text-brown-700 dark:hover:text-brown-200 px-0 py-1 h-auto mb-2"
            >
              <span className="flex items-center gap-1.5">
                <Target className="size-3" />
                Score Breakdown
              </span>
              <ChevronDown className={`size-3 transition-transform ${detailsExpanded ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <AnimatePresence>
              {detailsExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-3 pb-2">
                    {breakdownItems.map((item, i) => (
                      <BreakdownBar key={item.label} item={item} delay={i * 0.1} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CollapsibleContent>
        </Collapsible>
        {/* Always show mini breakdown */}
        {!detailsExpanded && (
          <div className="flex items-center gap-1 flex-wrap mb-2">
            {breakdownItems.map(item => (
              <div key={item.label} className="flex items-center gap-1 text-[10px]">
                <span className="text-brown-400 dark:text-brown-500">{item.label}:</span>
                <span className={`font-bold ${getScoreColor(item.score)}`}>{item.score}</span>
              </div>
            ))}
          </div>
        )}
        {/* Basic Remedies */}
        {scoreData.remedies.length > 0 && (
          <Collapsible open={remediesExpanded} onOpenChange={setRemediesExpanded}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-between text-xs font-semibold text-gold-dark dark:text-gold hover:text-gold-dark dark:hover:text-gold px-0 py-1 h-auto"
              >
                <span className="flex items-center gap-1.5">
                  <Lightbulb className="size-3" />
                  Recommended Upaya (Remedies)
                </span>
                <ChevronDown className={`size-3 transition-transform ${remediesExpanded ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <AnimatePresence>
                {remediesExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <ul className="space-y-1.5 pb-1">
                      {scoreData.remedies.map((remedy, i) => (
                        <li key={i} className="text-xs text-brown-700 dark:text-brown-500 leading-relaxed flex items-start gap-1.5">
                          <span className="text-gold-dark dark:text-gold mt-0.5 shrink-0 text-[10px]">✦</span>
                          {remedy}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Vedic-Specific Remedies */}
        {hasVedicRemedies && (
          <Collapsible open={vedicRemediesExpanded} onOpenChange={setVedicRemediesExpanded}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-between text-xs font-semibold text-brown-600 dark:text-brown-300 hover:text-brown-800 dark:hover:text-brown-100 px-0 py-1 h-auto mt-1"
              >
                <span className="flex items-center gap-1.5">
                  <Gem className="size-3" />
                  Vedic Remedies (Ratna, Mantra, Vrata)
                </span>
                <ChevronDown className={`size-3 transition-transform ${vedicRemediesExpanded ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <AnimatePresence>
                {vedicRemediesExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-3 pb-2 pt-1">
                      {/* Gemstones */}
                      {scoreData.vedicRemedies!.gemstones.length > 0 && (
                        <div>
                          <div className="flex items-center gap-1 mb-1">
                            <Gem className="size-3 text-gold-dark dark:text-gold" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gold-dark dark:text-gold">Ratna (Gemstones)</span>
                          </div>
                          <ul className="space-y-1 ml-4">
                            {scoreData.vedicRemedies!.gemstones.map((g, i) => (
                              <li key={i} className="text-[11px] text-brown-700 dark:text-brown-500 leading-relaxed flex items-start gap-1.5">
                                <span className="text-gold-dark dark:text-gold mt-0.5 shrink-0 text-[9px]">◆</span>
                                {g}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Mantras */}
                      {scoreData.vedicRemedies!.mantras.length > 0 && (
                        <div>
                          <div className="flex items-center gap-1 mb-1">
                            <HandHeart className="size-3 text-sage-dark dark:text-sage" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-sage-dark dark:text-sage">Mantra (Chants)</span>
                          </div>
                          <ul className="space-y-1 ml-4">
                            {scoreData.vedicRemedies!.mantras.map((m, i) => (
                              <li key={i} className="text-[11px] text-brown-700 dark:text-brown-500 leading-relaxed flex items-start gap-1.5">
                                <span className="text-sage-dark dark:text-sage mt-0.5 shrink-0 text-[9px]">ॐ</span>
                                {m}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Day Practices */}
                      {scoreData.vedicRemedies!.dayPractices.length > 0 && (
                        <div>
                          <div className="flex items-center gap-1 mb-1">
                            <Sun className="size-3 text-brown-600 dark:text-brown-400" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-brown-600 dark:text-brown-400">Day-Specific Practices</span>
                          </div>
                          <ul className="space-y-1 ml-4">
                            {scoreData.vedicRemedies!.dayPractices.map((d, i) => (
                              <li key={i} className="text-[11px] text-brown-700 dark:text-brown-500 leading-relaxed flex items-start gap-1.5">
                                <span className="text-brown-500 dark:text-brown-400 mt-0.5 shrink-0 text-[9px]">☀</span>
                                {d}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Fasting */}
                      {scoreData.vedicRemedies!.fasting.length > 0 && (
                        <div>
                          <div className="flex items-center gap-1 mb-1">
                            <Utensils className="size-3 text-brown-500 dark:text-brown-400" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-brown-500 dark:text-brown-400">Vrata (Fasting)</span>
                          </div>
                          <ul className="space-y-1 ml-4">
                            {scoreData.vedicRemedies!.fasting.map((f, i) => (
                              <li key={i} className="text-[11px] text-brown-700 dark:text-brown-500 leading-relaxed flex items-start gap-1.5">
                                <span className="text-brown-500 dark:text-brown-400 mt-0.5 shrink-0 text-[9px]">•</span>
                                {f}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Disclaimer */}
                      <div className="bg-gold/5 dark:bg-gold/5 rounded-md p-2 border border-gold/10 dark:border-gold/10 mt-2">
                        <p className="text-[10px] text-brown-500 dark:text-brown-600 leading-relaxed italic">
                          {scoreData.vedicRemedies!.disclaimer}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
}
