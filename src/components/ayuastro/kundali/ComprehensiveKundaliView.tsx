'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAyuAstroStore } from '@/store/ayuastro-store';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Brain, RotateCcw, Briefcase, Heart, Activity,
  Clock, Eye, Users, Shield, Star, Grid3X3, Moon,
  ChevronDown, ChevronUp, ArrowLeft, Loader2, AlertCircle,
  MapPin, Calendar, Compass, Sun,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import KundaliChart from '@/components/ayuastro/insights/KundaliChart';

// ─── Types ──────────────────────────────────────────────────────────────────

interface ComprehensiveData {
  calculationInfo: { engine: string; ayanamsa: number; calculationDate: string };
  personalityBlueprint: Record<string, any>;
  karmaPatterns: Record<string, any>;
  careerDharma: Record<string, any>;
  marriageDynamics: Record<string, any>;
  healthTendencies: Record<string, any>;
  timingEvents: Record<string, any>;
  spiritualEvolution: Record<string, any>;
  familyKarma: Record<string, any>;
  hiddenPatterns: Record<string, any>;
  rareYogas: Record<string, any>;
  divisionalCharts: Record<string, any>;
  nakshatraDeepAnalysis: Record<string, any>;
}

const ZODIAC_SYMBOLS: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋', Leo: '♌', Virgo: '♍',
  Libra: '♎', Scorpio: '♏', Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
};

const ZODIAC_ELEMENTS: Record<string, string> = {
  Aries: 'Fire', Taurus: 'Earth', Gemini: 'Air', Cancer: 'Water', Leo: 'Fire', Virgo: 'Earth',
  Libra: 'Air', Scorpio: 'Water', Sagittarius: 'Fire', Capricorn: 'Earth', Aquarius: 'Air', Pisces: 'Water',
};

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mars: '♂', Mercury: '☿', Jupiter: '♃', Venus: '♀', Saturn: '♄', Rahu: '☊', Ketu: '☋',
};

const SECTIONS = [
  { key: 'personalityBlueprint', label: 'Your Personality', sub: 'How your stars shape who you are', icon: Brain, color: 'from-amber-500 to-orange-500', emoji: '🧠' },
  { key: 'karmaPatterns', label: 'Life Patterns', sub: 'Repeating themes in your life journey', icon: RotateCcw, color: 'from-purple-500 to-indigo-500', emoji: '♻️' },
  { key: 'careerDharma', label: 'Career & Money', sub: 'Your professional strengths and path', icon: Briefcase, color: 'from-emerald-500 to-green-500', emoji: '💼' },
  { key: 'marriageDynamics', label: 'Love & Relationships', sub: 'How you connect with partners', icon: Heart, color: 'from-rose-500 to-pink-500', emoji: '💕' },
  { key: 'healthTendencies', label: 'Health & Wellness', sub: "Your body's natural tendencies", icon: Activity, color: 'from-cyan-500 to-teal-500', emoji: '💊' },
  { key: 'timingEvents', label: 'Life Timing', sub: 'Current and upcoming life phases', icon: Clock, color: 'from-blue-500 to-sky-500', emoji: '⏳' },
  { key: 'spiritualEvolution', label: 'Inner Growth', sub: 'Your spiritual journey and lessons', icon: Eye, color: 'from-violet-500 to-purple-500', emoji: '👁️' },
  { key: 'familyKarma', label: 'Family & Home', sub: 'Patterns from your family background', icon: Users, color: 'from-amber-600 to-yellow-500', emoji: '👨‍👩‍👧‍👦' },
  { key: 'hiddenPatterns', label: 'Hidden Strengths', sub: 'Secret powers and blind spots', icon: Shield, color: 'from-red-500 to-orange-500', emoji: '🛡️' },
  { key: 'rareYogas', label: 'Special Combinations', sub: 'Unique planetary alignments in your chart', icon: Star, color: 'from-yellow-400 to-amber-500', emoji: '⭐' },
  { key: 'divisionalCharts', label: 'Deep Charts', sub: 'Detailed views of specific life areas', icon: Grid3X3, color: 'from-indigo-500 to-blue-500', emoji: '📊' },
  { key: 'nakshatraDeepAnalysis', label: 'Star Analysis', sub: "Your birth star's deep influence", icon: Moon, color: 'from-slate-500 to-gray-500', emoji: '🌙' },
];

// ─── Section Summary Extractor ──────────────────────────────────────────────

function getSectionSummary(key: string, data: Record<string, any>): string {
  if (!data) return 'Loading...';
  switch (key) {
    case 'personalityBlueprint':
      return data.personalityArchetype ? `${data.personalityArchetype} type` : 'How you think, feel, and act';
    case 'karmaPatterns':
      return data.pastLifeTendencies ? 'Repeating life themes found' : 'Life pattern analysis';
    case 'careerDharma':
      return data.naturalSkillPattern ? 'Your career strengths and money style' : 'Career analysis';
    case 'marriageDynamics':
      return data.attractionPattern ? 'How you love and connect' : 'Relationship analysis';
    case 'healthTendencies':
      return data.ayurvedicConstitution ? `${data.ayurvedicConstitution} body type` : 'Health analysis';
    case 'timingEvents':
      return data.currentMahadasha ? `Currently in ${data.currentMahadasha} period` : 'Life timing';
    case 'spiritualEvolution':
      return data.mokshaTendency ? 'Your spiritual path and inner peace' : 'Inner growth analysis';
    case 'familyKarma':
      return data.fatherRelationship ? 'Family patterns and home life' : 'Family analysis';
    case 'hiddenPatterns':
      return data.selfSabotage ? 'Your secret strengths and blind spots' : 'Hidden patterns';
    case 'rareYogas':
      return data.detectedYogas ? `${data.detectedYogas.filter((y: any) => y.present).length} special combinations found` : 'Special combination analysis';
    case 'divisionalCharts':
      return data.d9Navamsha ? 'Deep chart views' : 'Detailed charts';
    case 'nakshatraDeepAnalysis':
      return data.moonNakshatra ? `${data.moonNakshatra} star influence` : 'Star analysis';
    default:
      return 'Section available';
  }
}

// ─── Section Renderers ──────────────────────────────────────────────────────

function TextBlock({ label, text }: { label: string; text: string }) {
  if (!text) return null;
  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold text-brown-600 dark:text-brown-300 uppercase tracking-wider">{label}</p>
      <p className="text-sm text-brown-800 dark:text-brown-100 leading-relaxed">{text}</p>
    </div>
  );
}

function KeyFactorsGrid({ factors }: { factors: Record<string, string> }) {
  if (!factors || Object.keys(factors).length === 0) return null;
  return (
    <div className="grid grid-cols-1 gap-2 mt-3">
      {Object.entries(factors).map(([key, value]) => (
        <div key={key} className="bg-brown-50/50 dark:bg-brown-800/30 rounded-lg p-3">
          <p className="text-xs font-semibold text-gold dark:text-gold-light uppercase tracking-wider mb-1">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
          <p className="text-xs text-brown-700 dark:text-brown-200 leading-relaxed">{value}</p>
        </div>
      ))}
    </div>
  );
}

function ArchetypeCard({ archetype, description }: { archetype: string; description: string }) {
  const emojis: Record<string, string> = {
    Warrior: '⚔️', Sage: '📚', Artist: '🎨', Builder: '🏗️',
    Mystic: '🔮', Leader: '👑', Healer: '💚', Innovator: '🚀',
  };
  return (
    <div className="bg-gradient-to-br from-gold/20 via-gold/5 to-transparent border border-gold/30 rounded-xl p-4 text-center">
      <div className="text-3xl mb-2">{emojis[archetype] ?? '✨'}</div>
      <h4 className="font-serif text-lg font-bold text-gold-dark dark:text-gold">{archetype}</h4>
      <p className="text-xs text-brown-700 dark:text-brown-200 mt-1 leading-relaxed">{description}</p>
    </div>
  );
}

function AyurvedicCard({ dosha, note }: { dosha: string; note: string }) {
  const doshaColors: Record<string, string> = {
    Pitta: 'from-red-500/20 to-orange-500/20 border-red-400/30',
    Vata: 'from-blue-500/20 to-purple-500/20 border-blue-400/30',
    Kapha: 'from-green-500/20 to-emerald-500/20 border-green-400/30',
  };
  const colorClass = doshaColors[dosha] ?? 'from-gray-500/20 to-slate-500/20 border-gray-400/30';
  return (
    <div className={`bg-gradient-to-br ${colorClass} border rounded-xl p-4`}>
      <h4 className="font-serif text-lg font-bold text-brown-900 dark:text-brown-50">{dosha}</h4>
      <p className="text-xs text-brown-700 dark:text-brown-200 mt-1 leading-relaxed">{note}</p>
    </div>
  );
}

function VargaCard({ name, ascSign, analysis }: { name: string; ascSign: string; analysis: string }) {
  return (
    <div className="bg-brown-50/50 dark:bg-brown-800/30 rounded-lg p-3 border border-brown-100/30 dark:border-brown-700/30">
      <div className="flex items-center gap-2 mb-1">
        <Badge className="bg-gold/15 text-gold-dark dark:text-gold text-[10px]">{name}</Badge>
        <span className="text-xs font-semibold text-brown-800 dark:text-brown-100">{ascSign} Asc</span>
      </div>
      <p className="text-[11px] text-brown-600 dark:text-brown-300 leading-relaxed">{analysis}</p>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────

export default function ComprehensiveKundaliView() {
  const { userId, setView, birthDetails, astrologyData, numerologyData } = useAyuAstroStore();
  const [data, setData] = useState<ComprehensiveData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState(0);
  const [openSections, setOpenSections] = useState<Set<number>>(new Set([0]));
  const [viewedSections, setViewedSections] = useState<Set<number>>(new Set());
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userId) { setError('No user ID found. Please complete onboarding first.'); setLoading(false); return; }
    const fetchData = async () => {
      try {
        const res = await fetch('/api/astrology/comprehensive-kundali', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        });
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const json = await res.json();
        setData(json);
        setViewedSections(new Set([0]));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load analysis');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  const toggleSection = useCallback((idx: number) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
    setViewedSections(prev => new Set(prev).add(idx));
    setActiveSection(idx);
  }, []);

  // ─── Key Highlights ──────────────────────────────────────────────────────
  const getKeyHighlights = (): { icon: string; title: string; desc: string }[] => {
    if (!data) return [];
    const highlights: { icon: string; title: string; desc: string }[] = [];

    // 1. Personality archetype
    const pb = data.personalityBlueprint;
    if (pb?.personalityArchetype) {
      highlights.push({
        icon: '🧠',
        title: `${pb.personalityArchetype} Archetype`,
        desc: pb.archetypeDescription?.split('.')[0] + '.' || 'Your core personality pattern',
      });
    }

    // 2. Current Dasha
    const te = data.timingEvents;
    if (te?.currentMahadasha) {
      highlights.push({
        icon: '⏳',
        title: `${te.currentMahadasha} Dasha`,
        desc: te.dashaInterpretation?.split('.')[0] + '.' || 'Current planetary period',
      });
    }

    // 3. Detected Yogas
    const ry = data.rareYogas;
    if (ry?.detectedYogas) {
      const presentYogas = ry.detectedYogas.filter((y: any) => y.present);
      if (presentYogas.length > 0) {
        highlights.push({
          icon: '⭐',
          title: `${presentYogas.length} Yoga${presentYogas.length > 1 ? 's' : ''} Detected`,
          desc: presentYogas.map((y: any) => y.name).join(', '),
        });
      }
    }

    // Fallbacks if not enough highlights
    if (highlights.length === 0) {
      highlights.push({ icon: '✨', title: 'Full Analysis Ready', desc: '12 areas of your life mapped by the stars' });
    }
    if (highlights.length === 1) {
      const nk = data.nakshatraDeepAnalysis;
      if (nk?.moonNakshatra) {
        highlights.push({ icon: '🌙', title: `${nk.moonNakshatra} Star`, desc: nk.psychologicalCoding?.split('.')[0] + '.' || 'Deep lunar analysis' });
      }
    }
    if (highlights.length === 2) {
      const kd = data.karmaPatterns;
      if (kd?.pastLifeTendencies) {
        highlights.push({ icon: '♻️', title: 'Life Patterns Found', desc: 'Repeating themes and lessons to learn identified' });
      }
    }

    return highlights.slice(0, 3);
  };

  // ─── Loading State ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-cream dark:bg-brown-900 px-4">
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-4 border-gold/20 border-t-gold animate-spin" />
          <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gold w-8 h-8" />
        </div>
        <h2 className="mt-6 font-serif text-xl text-brown-800 dark:text-brown-100">Analyzing Your Birth Chart</h2>
        <p className="text-sm text-brown-500 dark:text-brown-400 mt-2">Mapping 12 areas of your life through the stars...</p>
      </div>
    );
  }

  // ─── Error State ────────────────────────────────────────────────────────
  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-cream dark:bg-brown-900 px-4">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <h2 className="font-serif text-xl text-brown-800 dark:text-brown-100">Unable to Load Analysis</h2>
        <p className="text-sm text-brown-500 dark:text-brown-400 mt-2 text-center">{error ?? 'Unknown error'}</p>
        <button onClick={() => setView('insights')} className="mt-6 px-4 py-2 bg-gold text-white rounded-lg text-sm font-semibold flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Insights
        </button>
      </div>
    );
  }

  const keyHighlights = getKeyHighlights();
  const sunSign = astrologyData?.sunSign || '';
  const moonSign = astrologyData?.moonSign || '';
  const ascendant = astrologyData?.ascendant || '';
  const nakshatra = astrologyData?.nakshatra || '';
  const lifePath = numerologyData?.lifePathNumber;

  // ─── Section Content Renderer ──────────────────────────────────────────
  const renderSectionContent = (key: string, sectionData: Record<string, any>) => {
    switch (key) {
      case 'personalityBlueprint':
        return (
          <div className="space-y-4">
            <ArchetypeCard archetype={sectionData.personalityArchetype} description={sectionData.archetypeDescription} />
            {sectionData.ayurvedicConstitution && (
              <AyurvedicCard dosha={sectionData.ayurvedicConstitution.dosha} note={sectionData.ayurvedicConstitution.note} />
            )}
            <div className="grid grid-cols-1 gap-3">
              <TextBlock label="How You Think" text={sectionData.mentalWiring} />
              <TextBlock label="How You Feel" text={sectionData.emotionalTendencies} />
              <TextBlock label="Bravery & Worries" text={sectionData.courageAndFear} />
              <TextBlock label="Leader or Supporter" text={sectionData.leadershipVsFollower} />
              <TextBlock label="Money vs Meaning" text={sectionData.materialisticVsSpiritual} />
              <TextBlock label="What Makes You Angry" text={sectionData.angerPatterns} />
              <TextBlock label="How You Make Decisions" text={sectionData.decisionStyle} />
              <TextBlock label="Secret Worries" text={sectionData.hiddenInsecurities} />
              <TextBlock label="How Others See You vs Real You" text={sectionData.publicVsPrivateSelf} />
              <TextBlock label="How You're Smart" text={sectionData.intelligenceType} />
              <TextBlock label="How You Talk & Listen" text={sectionData.communicationStyle} />
              <TextBlock label="Comfort with Risk" text={sectionData.riskAppetite} />
            </div>
            {sectionData.keyFactors && <KeyFactorsGrid factors={sectionData.keyFactors} />}
          </div>
        );
      case 'karmaPatterns':
        return (
          <div className="space-y-4">
            <TextBlock label="Patterns You Were Born With" text={sectionData.pastLifeTendencies} />
            <TextBlock label="Lessons Still to Learn" text={sectionData.unfinishedKarmas} />
            <TextBlock label="Why Some Pain Keeps Coming Back" text={sectionData.repeatingSufferingLoops} />
            {sectionData.debtsToward && (
              <div>
                <p className="text-xs font-semibold text-brown-600 dark:text-brown-300 uppercase tracking-wider mb-2">People You Owe Attention To</p>
                <div className="flex flex-wrap gap-2">
                  {sectionData.debtsToward.map((d: string, i: number) => (
                    <Badge key={i} className="bg-purple-500/10 text-purple-700 dark:text-purple-300 text-[10px]">{d}</Badge>
                  ))}
                </div>
              </div>
            )}
            <TextBlock label="Where Life Keeps You Grounded" text={sectionData.areasForcingHumility} />
            <TextBlock label="Why Some Problems Return" text={sectionData.whyCertainPainRepeats} />
            {sectionData.keyIndicators && <KeyFactorsGrid factors={sectionData.keyIndicators} />}
          </div>
        );
      case 'careerDharma':
        return (
          <div className="space-y-4">
            <TextBlock label="What Comes Naturally to You" text={sectionData.naturalSkillPattern} />
            <TextBlock label="How You Handle Money" text={sectionData.moneyBehavior} />
            <TextBlock label="Leadership Potential" text={sectionData.authorityPotential} />
            <TextBlock label="Business vs Job" text={sectionData.entrepreneurshipVsEmployment} />
            <TextBlock label="Chance of Getting Known" text={sectionData.famePotential} />
            <TextBlock label="How Much Risk You Can Take" text={sectionData.riskCapacity} />
            <TextBlock label="When Money Flows Best" text={sectionData.wealthCreationCycles} />
            {sectionData.industryCompatibility && (
              <div>
                <p className="text-xs font-semibold text-brown-600 dark:text-brown-300 uppercase tracking-wider mb-2">Compatible Industries</p>
                <div className="flex flex-wrap gap-2">
                  {sectionData.industryCompatibility.map((ind: string, i: number) => (
                    <Badge key={i} className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[10px]">{ind}</Badge>
                  ))}
                </div>
              </div>
            )}
            <div className="flex items-center gap-2 bg-brown-50/50 dark:bg-brown-800/30 rounded-lg p-3">
              <span className="text-sm">{sectionData.foreignLandsBenefit ? '🌍' : '🏠'}</span>
              <span className="text-xs text-brown-700 dark:text-brown-200">{sectionData.foreignLandsNote}</span>
            </div>
            {sectionData.keyFactors && <KeyFactorsGrid factors={sectionData.keyFactors} />}
          </div>
        );
      case 'marriageDynamics':
        return (
          <div className="space-y-4">
            <TextBlock label="Who You're Drawn To" text={sectionData.attractionPattern} />
            <TextBlock label="Emotional Connection Style" text={sectionData.emotionalCompatibility} />
            <TextBlock label="Power Balance in Relationships" text={sectionData.dominanceIssues} />
            <TextBlock label="How Loyal You Tend to Be" text={sectionData.loyaltyIndicators} />
            <TextBlock label="Possible Delays" text={sectionData.delays} />
            <TextBlock label="Relationship Challenges" text={sectionData.divorcePotential} />
            <TextBlock label="Who Holds More Power" text={sectionData.powerImbalance} />
            <TextBlock label="Your Partner's Inner World" text={sectionData.spousePsychology} />
            <TextBlock label="When Marriage Is Likely" text={sectionData.marriageTiming} />
            <TextBlock label="What Married Life Looks Like" text={sectionData.qualityOfMarriedLife} />
            <TextBlock label="Patterns in Relationships" text={sectionData.repeatingPatterns} />
            {sectionData.keyFactors && <KeyFactorsGrid factors={sectionData.keyFactors} />}
          </div>
        );
      case 'healthTendencies':
        return (
          <div className="space-y-4">
            <AyurvedicCard dosha={sectionData.ayurvedicConstitution} note={sectionData.ayurvedicNote} />
            {sectionData.weakOrgans && (
              <div>
                <p className="text-xs font-semibold text-brown-600 dark:text-brown-300 uppercase tracking-wider mb-2">Weak Organs / Vulnerabilities</p>
                <div className="flex flex-wrap gap-2">
                  {sectionData.weakOrgans.map((org: string, i: number) => (
                    <Badge key={i} className="bg-red-500/10 text-red-700 dark:text-red-300 text-[10px]">{org}</Badge>
                  ))}
                </div>
              </div>
            )}
            <TextBlock label="Long-term Health Patterns" text={sectionData.chronicDiseaseTendency} />
            <TextBlock label="How Stress Affects You" text={sectionData.stressPattern} />
            <TextBlock label="Mental Health Patterns" text={sectionData.mentalInstability} />
            <TextBlock label="Risk of Accidents" text={sectionData.accidentVulnerability} />
            <TextBlock label="Habit-Forming Tendencies" text={sectionData.addictionTendencies} />
            {sectionData.keyFactors && <KeyFactorsGrid factors={sectionData.keyFactors} />}
          </div>
        );
      case 'timingEvents':
        return (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-gold/15 to-gold/5 dark:from-gold/10 dark:to-gold/5 border border-gold/30 rounded-xl p-4">
              <p className="text-xs font-semibold text-gold-dark dark:text-gold uppercase tracking-wider mb-1">Current Main Period</p>
              <p className="text-sm font-semibold text-brown-900 dark:text-brown-50">{sectionData.currentMahadasha}</p>
              <p className="text-xs font-semibold text-gold-dark dark:text-gold uppercase tracking-wider mt-2 mb-1">Current Sub-Period</p>
              <p className="text-sm font-semibold text-brown-900 dark:text-brown-50">{sectionData.currentAntardasha}</p>
            </div>
            <TextBlock label="What This Period Means" text={sectionData.dashaInterpretation} />
            <TextBlock label="Current Planet Effects" text={sectionData.gocharInfluence} />
            {sectionData.upcomingPeriods && sectionData.upcomingPeriods.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-brown-600 dark:text-brown-300 uppercase tracking-wider mb-2">Upcoming Periods</p>
                {sectionData.upcomingPeriods.map((p: any, i: number) => (
                  <div key={i} className="bg-brown-50/50 dark:bg-brown-800/30 rounded-lg p-3 mb-2">
                    <p className="text-xs font-semibold text-brown-800 dark:text-brown-100">{p.period}</p>
                    <p className="text-[11px] text-brown-600 dark:text-brown-300">{p.startDate} → {p.endDate}</p>
                    <p className="text-[11px] text-brown-700 dark:text-brown-200 mt-1">{p.interpretation}</p>
                    {p.areasAffected && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {p.areasAffected.map((a: string, j: number) => (
                          <Badge key={j} className="bg-brown-100/50 dark:bg-brown-700/30 text-brown-600 dark:text-brown-300 text-[9px]">{a}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            <TextBlock label="Important Timing Factors" text={sectionData.keyTimingFactors} />
          </div>
        );
      case 'spiritualEvolution':
        return (
          <div className="space-y-4">
            <TextBlock label="Desire for Freedom" text={sectionData.mokshaTendency} />
            <TextBlock label="Spiritual Interest" text={sectionData.spiritualInclination} />
            <TextBlock label="Relationship with Teachers" text={sectionData.guruKarma} />
            <TextBlock label="Ability to Let Go" text={sectionData.detachmentLevel} />
            <TextBlock label="Meditation Potential" text={sectionData.meditationCapacity} />
            <TextBlock label="Pride Lessons" text={sectionData.egoLessons} />
            <TextBlock label="Worldly Success vs Inner Peace" text={sectionData.materialTrapVsLiberation} />
            {sectionData.keyFactors && <KeyFactorsGrid factors={sectionData.keyFactors} />}
          </div>
        );
      case 'familyKarma':
        return (
          <div className="space-y-4">
            <TextBlock label="Relationship with Father" text={sectionData.fatherRelationship} />
            <TextBlock label="Mother's Influence on You" text={sectionData.motherPsychology} />
            <TextBlock label="Family Legacy" text={sectionData.ancestorKarma} />
            <TextBlock label="Money Patterns in Family" text={sectionData.familyWealthPatterns} />
            <TextBlock label="Recurring Family Challenges" text={sectionData.familySufferingCycles} />
            <TextBlock label="Relationship with Children" text={sectionData.childKarma} />
            <TextBlock label="Heavy Responsibilities" text={sectionData.responsibilityBurdens} />
            {sectionData.keyFactors && <KeyFactorsGrid factors={sectionData.keyFactors} />}
          </div>
        );
      case 'hiddenPatterns':
        return (
          <div className="space-y-4">
            <TextBlock label="Ways You Hold Yourself Back" text={sectionData.selfSabotage} />
            <TextBlock label="Addictions" text={sectionData.addictions} />
            <TextBlock label="Controlling Tendencies" text={sectionData.manipulativeBehavior} />
            <TextBlock label="Pride Traps" text={sectionData.egoTraps} />
            <TextBlock label="Procrastination Patterns" text={sectionData.laziness} />
            <TextBlock label="Running from Problems" text={sectionData.escapism} />
            <TextBlock label="Fixation Tendencies" text={sectionData.obsession} />
            <TextBlock label="Withdrawing from Others" text={sectionData.isolation} />
            <TextBlock label="Trust Issues" text={sectionData.betrayalTendencies} />
            {sectionData.hiddenStrengths && (
              <div>
                <p className="text-xs font-semibold text-sage dark:text-sage-light uppercase tracking-wider mb-2">Hidden Strengths</p>
                {sectionData.hiddenStrengths.map((s: string, i: number) => (
                  <div key={i} className="flex items-start gap-2 mb-2">
                    <span className="text-sage text-sm mt-0.5">✦</span>
                    <p className="text-xs text-brown-700 dark:text-brown-200 leading-relaxed">{s}</p>
                  </div>
                ))}
              </div>
            )}
            {sectionData.keyFactors && <KeyFactorsGrid factors={sectionData.keyFactors} />}
          </div>
        );
      case 'rareYogas':
        return (
          <div className="space-y-4">
            {sectionData.detectedYogas && (
              <div>
                <p className="text-xs font-semibold text-brown-600 dark:text-brown-300 uppercase tracking-wider mb-2">Special Combinations Found</p>
                {sectionData.detectedYogas.filter((y: any) => y.present).map((y: any, i: number) => (
                  <div key={i} className="bg-gradient-to-r from-gold/10 to-gold/5 border border-gold/20 rounded-lg p-3 mb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-serif text-sm font-bold text-gold-dark dark:text-gold">{y.name}</span>
                      <Badge className={`text-[9px] ${y.strength === 'Strong' ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' : y.strength === 'Moderate' ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300' : 'bg-gray-500/15 text-gray-600 dark:text-gray-300'}`}>{y.strength}</Badge>
                    </div>
                    <p className="text-[11px] text-brown-700 dark:text-brown-200 leading-relaxed">{y.description}</p>
                    <p className="text-[10px] text-brown-500 dark:text-brown-400 mt-1 italic">{y.contextualNote}</p>
                  </div>
                ))}
                {sectionData.detectedYogas.filter((y: any) => y.present).length === 0 && (
                  <p className="text-sm text-brown-500 dark:text-brown-400">No major yogas detected in this chart.</p>
                )}
              </div>
            )}
            {sectionData.detectedDoshas && sectionData.detectedDoshas.filter((d: any) => d.present).length > 0 && (
              <div>
                <p className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider mb-2">Challenges Found</p>
                {sectionData.detectedDoshas.filter((d: any) => d.present).map((d: any, i: number) => (
                  <div key={i} className="bg-red-500/5 border border-red-400/20 rounded-lg p-3 mb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-serif text-sm font-bold text-red-700 dark:text-red-400">{d.name}</span>
                      <Badge className="text-[9px] bg-red-500/15 text-red-700 dark:text-red-300">{d.severity}</Badge>
                    </div>
                    <p className="text-[11px] text-brown-700 dark:text-brown-200 leading-relaxed">{d.description}</p>
                    {d.remedies && d.remedies.length > 0 && (
                      <div className="mt-2">
                        <p className="text-[10px] font-semibold text-brown-600 dark:text-brown-300 uppercase">Remedies</p>
                        <ul className="mt-1 space-y-1">
                          {d.remedies.map((r: string, j: number) => (
                            <li key={j} className="text-[10px] text-brown-600 dark:text-brown-300 flex items-start gap-1">
                              <span className="text-sage mt-0.5">•</span> {r}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {sectionData.yogaContextNote && (
              <div className="bg-brown-50/50 dark:bg-brown-800/30 rounded-lg p-3 border border-brown-100/30 dark:border-brown-700/30">
                <p className="text-[11px] text-brown-600 dark:text-brown-300 leading-relaxed italic">{sectionData.yogaContextNote}</p>
              </div>
            )}
          </div>
        );
      case 'divisionalCharts':
        return (
          <div className="space-y-4">
            {sectionData.d9Navamsha && (
              <div className="bg-gradient-to-r from-gold/10 to-gold/5 border border-gold/20 rounded-xl p-4">
                <p className="text-xs font-semibold text-gold-dark dark:text-gold uppercase tracking-wider mb-1">D9 Navamsha — Your Inner Self</p>
                <p className="text-sm text-brown-800 dark:text-brown-100">{sectionData.d9Navamsha.ascendantSign} Ascendant</p>
                <p className="text-[11px] text-brown-700 dark:text-brown-200 mt-1 leading-relaxed">{sectionData.d9Navamsha.analysis}</p>
                <p className="text-[11px] text-brown-600 dark:text-brown-300 mt-1">{sectionData.d9Navamsha.keyPlanets}</p>
                <p className="text-[11px] text-brown-600 dark:text-brown-300 mt-1">{sectionData.d9Navamsha.soulMaturity}</p>
              </div>
            )}
            {sectionData.d10Career && <VargaCard name="D10 Career" ascSign={sectionData.d10Career.ascendantSign} analysis={sectionData.d10Career.analysis} />}
            {sectionData.d7Children && <VargaCard name="D7 Children" ascSign={sectionData.d7Children.ascendantSign} analysis={sectionData.d7Children.analysis} />}
            {sectionData.d12Parents && <VargaCard name="D12 Parents" ascSign={sectionData.d12Parents.ascendantSign} analysis={sectionData.d12Parents.analysis} />}
            {sectionData.d20Spirituality && <VargaCard name="D20 Spirituality" ascSign={sectionData.d20Spirituality.ascendantSign} analysis={sectionData.d20Spirituality.analysis} />}
            {sectionData.d24Education && <VargaCard name="D24 Education" ascSign={sectionData.d24Education.ascendantSign} analysis={sectionData.d24Education.analysis} />}
            {sectionData.d60DeepKarma && <VargaCard name="D60 Deep Karma" ascSign={sectionData.d60DeepKarma.ascendantSign} analysis={sectionData.d60DeepKarma.analysis} />}
            {sectionData.vargottamaPlanets && sectionData.vargottamaPlanets.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gold-dark dark:text-gold uppercase tracking-wider mb-2">Planets in Same Sign (Very Strong)</p>
                <div className="flex flex-wrap gap-2">
                  {sectionData.vargottamaPlanets.map((p: string, i: number) => (
                    <Badge key={i} className="bg-gold/15 text-gold-dark dark:text-gold text-[10px]">✦ {p}</Badge>
                  ))}
                </div>
              </div>
            )}
            <TextBlock label="Main Birth Chart" text={sectionData.d1Main} />
          </div>
        );
      case 'nakshatraDeepAnalysis':
        return (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-slate-500/10 via-slate-500/5 to-transparent border border-slate-400/20 rounded-xl p-4 text-center">
              <Moon className="w-8 h-8 text-slate-500 dark:text-slate-300 mx-auto mb-2" />
              <h4 className="font-serif text-lg font-bold text-brown-900 dark:text-brown-50">{sectionData.moonNakshatra}</h4>
              <p className="text-[11px] text-brown-600 dark:text-brown-300 mt-1">{sectionData.symbol && `Symbol: ${sectionData.symbol}`} • Deity: {sectionData.deity}</p>
            </div>
            <TextBlock label="Your Mental Programming" text={sectionData.psychologicalCoding} />
            <TextBlock label="What You Deeply Want" text={sectionData.desireNature} />
            <TextBlock label="Secret Drivers" text={sectionData.hiddenMotivations} />
            <TextBlock label="Emotional Hurts" text={sectionData.emotionalWounds} />
            <TextBlock label="How You Act" text={sectionData.behavioralPatterns} />
            <TextBlock label="Divine Influence" text={sectionData.deityInfluence} />
            <TextBlock label="Meaning Behind Your Symbol" text={sectionData.symbolMeaning} />
            <TextBlock label="Quarter Analysis" text={sectionData.padaAnalysis} />
            <TextBlock label="Star Ruler's Effect" text={sectionData.nakshatraRulerInfluence} />
          </div>
        );
      default:
        return <p className="text-sm text-brown-500">Section content available.</p>;
    }
  };

  // Get element for cosmic identity card
  const getElement = (sign: string): string => ZODIAC_ELEMENTS[sign] || 'Fire';
  const getElementColor = (el: string): string => {
    switch (el) {
      case 'Fire': return 'from-red-500/20 to-orange-400/20';
      case 'Earth': return 'from-green-500/20 to-emerald-400/20';
      case 'Air': return 'from-yellow-400/20 to-amber-300/20';
      case 'Water': return 'from-blue-500/20 to-teal-400/20';
      default: return 'from-gold/20 to-amber-400/20';
    }
  };
  const getElementIcon = (el: string): string => {
    switch (el) {
      case 'Fire': return '🔥';
      case 'Earth': return '🌍';
      case 'Air': return '💨';
      case 'Water': return '🌊';
      default: return '✨';
    }
  };

  return (
    <div className="min-h-screen bg-cream dark:bg-brown-900 pb-20">
      {/* ─── Sticky Header ──────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-40 bg-cream/90 dark:bg-brown-900/90 backdrop-blur-sm border-b border-brown-100/30 dark:border-brown-700/30">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3 mb-3">
            <button onClick={() => setView('insights')} className="p-1.5 rounded-lg hover:bg-brown-100/50 dark:hover:bg-brown-800/50">
              <ArrowLeft className="w-5 h-5 text-brown-600 dark:text-brown-300" />
            </button>
            <div className="flex-1">
              <h1 className="font-serif text-lg font-bold text-brown-900 dark:text-brown-50">Your Complete Birth Chart</h1>
              <p className="text-[11px] text-brown-500 dark:text-brown-400">12 Areas of Your Life, Mapped by the Stars</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-gold-dark dark:text-gold">{viewedSections.size}/12</p>
              <p className="text-[10px] text-brown-400 dark:text-brown-500">sections</p>
            </div>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-brown-100/30 dark:bg-brown-700/30 rounded-full h-1.5 mb-3">
            <motion.div
              className="bg-gradient-to-r from-gold to-gold-dark h-1.5 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(viewedSections.size / 12) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          {/* Section tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            {SECTIONS.map((sec, i) => {
              const Icon = sec.icon;
              const isActive = i === activeSection;
              const isViewed = viewedSections.has(i);
              return (
                <button
                  key={sec.key}
                  onClick={() => { setActiveSection(i); toggleSection(i); }}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[10px] font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-gold/20 text-gold-dark dark:text-gold border border-gold/30'
                      : isViewed
                        ? 'bg-brown-100/50 dark:bg-brown-800/50 text-brown-600 dark:text-brown-300 border border-transparent'
                        : 'bg-transparent text-brown-400 dark:text-brown-500 border border-transparent'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {sec.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── Content ────────────────────────────────────────────────────────── */}
      <div ref={contentRef} className="max-w-2xl mx-auto px-4 py-4 space-y-4">

        {/* ═══════ BIRTH DETAILS SUMMARY CARD ═══════ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="overflow-hidden shadow-lg border-0 dark:bg-white/5">
            {/* Gold accent bar */}
            <div className="h-1.5 bg-gradient-to-r from-gold via-gold-dark to-gold" />
            <div className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex size-9 items-center justify-center rounded-xl bg-gold/10">
                  <Sparkles className="size-5 text-gold-dark dark:text-gold" />
                </div>
                <div>
                  <h2 className="font-serif text-base font-bold text-brown-900 dark:text-brown-50">Birth Details</h2>
                  <p className="text-[10px] text-brown-400 dark:text-brown-500 uppercase tracking-wider">The foundation of your birth chart</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {birthDetails?.name && (
                  <div className="bg-brown-50/50 dark:bg-brown-800/30 rounded-lg p-3">
                    <p className="text-[10px] font-semibold text-brown-400 dark:text-brown-500 uppercase tracking-wider mb-0.5">Name</p>
                    <p className="text-sm font-semibold text-brown-900 dark:text-brown-100">{birthDetails.name}</p>
                  </div>
                )}
                {birthDetails?.dateOfBirth && (
                  <div className="bg-brown-50/50 dark:bg-brown-800/30 rounded-lg p-3">
                    <p className="text-[10px] font-semibold text-brown-400 dark:text-brown-500 uppercase tracking-wider mb-0.5">Date of Birth</p>
                    <p className="text-sm font-semibold text-brown-900 dark:text-brown-100">
                      {new Date(birthDetails.dateOfBirth).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                )}
                {birthDetails?.timeOfBirth && (
                  <div className="bg-brown-50/50 dark:bg-brown-800/30 rounded-lg p-3">
                    <p className="text-[10px] font-semibold text-brown-400 dark:text-brown-500 uppercase tracking-wider mb-0.5">Time of Birth</p>
                    <p className="text-sm font-semibold text-brown-900 dark:text-brown-100">{birthDetails.timeOfBirth}</p>
                  </div>
                )}
                {birthDetails?.placeOfBirth && (
                  <div className="bg-brown-50/50 dark:bg-brown-800/30 rounded-lg p-3">
                    <p className="text-[10px] font-semibold text-brown-400 dark:text-brown-500 uppercase tracking-wider mb-0.5">Place of Birth</p>
                    <p className="text-sm font-semibold text-brown-900 dark:text-brown-100">{birthDetails.placeOfBirth}</p>
                  </div>
                )}
              </div>

              <div className="mt-3 flex items-center gap-3 text-[11px] text-brown-400 dark:text-brown-500">
                <span className="flex items-center gap-1">
                  <Compass className="size-3" />
                  Ayanamsa: {data.calculationInfo.ayanamsa.toFixed(4)}° (Lahiri)
                </span>
                <span className="text-brown-200 dark:text-brown-700">|</span>
                <span className="flex items-center gap-1">
                  <Shield className="size-3" />
                  Engine: {data.calculationInfo.engine}
                </span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* ═══════ COSMIC IDENTITY CARD ═══════ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="overflow-hidden shadow-lg border-0 dark:bg-white/5">
            <div className={`bg-gradient-to-br ${getElementColor(getElement(sunSign || 'Aries'))} p-5`}>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">{getElementIcon(getElement(sunSign || 'Aries'))}</span>
                <h2 className="font-serif text-base font-bold text-brown-900 dark:text-brown-50">Cosmic Identity</h2>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {/* Sun Sign */}
                <div className="bg-white/60 dark:bg-brown-900/60 rounded-xl p-3 text-center backdrop-blur-sm border border-gold/10 dark:border-gold/5">
                  <div className="text-3xl mb-1">{ZODIAC_SYMBOLS[sunSign] || '☉'}</div>
                  <p className="text-[9px] font-semibold text-gold-dark dark:text-gold uppercase tracking-wider">Sun Sign ☉</p>
                  <p className="text-xs font-bold text-brown-900 dark:text-brown-50 mt-0.5">{sunSign || '—'}</p>
                  <p className="text-[9px] text-brown-500 dark:text-brown-400">{getElement(sunSign || 'Aries')}</p>
                </div>

                {/* Moon Sign */}
                <div className="bg-white/60 dark:bg-brown-900/60 rounded-xl p-3 text-center backdrop-blur-sm border border-gold/10 dark:border-gold/5">
                  <div className="text-3xl mb-1">{ZODIAC_SYMBOLS[moonSign] || '☽'}</div>
                  <p className="text-[9px] font-semibold text-gold-dark dark:text-gold uppercase tracking-wider">Moon Sign ☽</p>
                  <p className="text-xs font-bold text-brown-900 dark:text-brown-50 mt-0.5">{moonSign || '—'}</p>
                  <p className="text-[9px] text-brown-500 dark:text-brown-400">{getElement(moonSign || 'Aries')}</p>
                </div>

                {/* Ascendant */}
                <div className="bg-white/60 dark:bg-brown-900/60 rounded-xl p-3 text-center backdrop-blur-sm border border-gold/10 dark:border-gold/5">
                  <div className="text-3xl mb-1">{ZODIAC_SYMBOLS[ascendant] || '⬆'}</div>
                  <p className="text-[9px] font-semibold text-gold-dark dark:text-gold uppercase tracking-wider">Ascendant ⬆</p>
                  <p className="text-xs font-bold text-brown-900 dark:text-brown-50 mt-0.5">{ascendant || '—'}</p>
                  <p className="text-[9px] text-brown-500 dark:text-brown-400">{getElement(ascendant || 'Aries')}</p>
                </div>
              </div>

              {/* Nakshatra & Life Path */}
              <div className="mt-3 flex items-center gap-3">
                {nakshatra && (
                  <div className="bg-white/60 dark:bg-brown-900/60 rounded-lg px-3 py-2 backdrop-blur-sm border border-gold/10 dark:border-gold/5 flex-1">
                    <p className="text-[9px] font-semibold text-gold-dark dark:text-gold uppercase tracking-wider">Nakshatra</p>
                    <p className="text-xs font-bold text-brown-900 dark:text-brown-50">{nakshatra}</p>
                  </div>
                )}
                {lifePath && (
                  <div className="bg-white/60 dark:bg-brown-900/60 rounded-lg px-3 py-2 backdrop-blur-sm border border-gold/10 dark:border-gold/5 flex-1">
                    <p className="text-[9px] font-semibold text-gold-dark dark:text-gold uppercase tracking-wider">Life Path</p>
                    <p className="text-xs font-bold text-brown-900 dark:text-brown-50">Number {lifePath}</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* ═══════ MINI KUNDALI CHART ═══════ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <Card className="overflow-hidden shadow-lg border-0 dark:bg-white/5">
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex size-8 items-center justify-center rounded-lg bg-gold/10">
                  <Grid3X3 className="size-4 text-gold-dark dark:text-gold" />
                </div>
                <div>
                  <h3 className="font-serif text-sm font-bold text-brown-900 dark:text-brown-50">Birth Chart</h3>
                  <p className="text-[10px] text-brown-400 dark:text-brown-500">North Indian Style</p>
                </div>
              </div>
              <KundaliChart
                planetaryPositions={astrologyData?.planetaryPositions || {}}
                ascendant={ascendant}
                ascendantDegree={undefined}
                sunSign={sunSign}
                moonSign={moonSign}
                birthDetails={birthDetails ? {
                  name: birthDetails.name,
                  dateOfBirth: birthDetails.dateOfBirth,
                  timeOfBirth: birthDetails.timeOfBirth,
                  placeOfBirth: birthDetails.placeOfBirth,
                } : undefined}
                nakshatra={nakshatra}
              />
            </div>
          </Card>
        </motion.div>

        {/* ═══════ KEY HIGHLIGHTS ═══════ */}
        {keyHighlights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card className="overflow-hidden shadow-lg border-0 dark:bg-white/5">
              <div className="h-1 bg-gradient-to-r from-gold via-sage to-gold-dark" />
              <div className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-gold/10">
                    <Star className="size-4 text-gold-dark dark:text-gold" />
                  </div>
                  <div>
                    <h3 className="font-serif text-sm font-bold text-brown-900 dark:text-brown-50">Key Highlights</h3>
                    <p className="text-[10px] text-brown-400 dark:text-brown-500">Most important findings from your Kundali</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {keyHighlights.map((h, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.1, duration: 0.3 }}
                      className="flex items-start gap-3 bg-gradient-to-r from-gold/5 to-transparent dark:from-gold/3 dark:to-transparent rounded-lg p-3 border border-gold/10 dark:border-gold/5"
                    >
                      <span className="text-xl shrink-0">{h.icon}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-brown-900 dark:text-brown-50">{h.title}</p>
                        <p className="text-[11px] text-brown-600 dark:text-brown-300 leading-relaxed mt-0.5">{h.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Section Navigation Dots (fixed sidebar on scroll) */}
        <div className="sticky top-28 z-30 flex justify-center gap-1.5 py-1 bg-cream/80 dark:bg-brown-900/80 backdrop-blur-sm">
          {SECTIONS.map((sec, i) => {
            const isActive = i === activeSection;
            const isViewed = viewedSections.has(i);
            return (
              <button
                key={`dot-${sec.key}`}
                onClick={() => { setActiveSection(i); toggleSection(i); }}
                className={`w-2 h-2 rounded-full transition-all ${
                  isActive
                    ? 'bg-gold w-4'
                    : isViewed
                      ? 'bg-gold/50'
                      : 'bg-brown-200 dark:bg-brown-700'
                }`}
                aria-label={`Go to ${sec.label}`}
              />
            );
          })}
        </div>

        {/* ═══════ SECTION CARDS ═══════ */}
        {SECTIONS.map((sec, i) => {
          const Icon = sec.icon;
          const sectionData = data[sec.key as keyof ComprehensiveData] as Record<string, any>;
          if (!sectionData) return null;
          const isOpen = openSections.has(i);
          const summary = getSectionSummary(sec.key, sectionData);

          return (
            <motion.div
              key={sec.key}
              id={`section-${i}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03, duration: 0.3 }}
            >
              <Collapsible open={isOpen} onOpenChange={() => toggleSection(i)}>
                <Card className="overflow-hidden shadow-md card-hover border-brown-100/30 dark:border-brown-700/30 dark:bg-white/5">
                  {/* Gradient accent bar */}
                  <div className={`h-1.5 bg-gradient-to-r ${sec.color}`} />
                  <CollapsibleTrigger className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-brown-50/30 dark:hover:bg-brown-800/20 transition-colors">
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${sec.color} flex items-center justify-center shrink-0 shadow-sm`}>
                      <Icon className="w-4.5 h-4.5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-serif text-sm font-bold text-brown-900 dark:text-brown-50">{sec.label}</h3>
                        <Badge className="bg-brown-100/50 dark:bg-brown-700/30 text-brown-500 dark:text-brown-400 text-[9px] px-1.5 py-0">
                          {i + 1}/12
                        </Badge>
                      </div>
                      {/* Section subtitle visible when collapsed */}
                      {!isOpen && (
                        <p className="text-[10px] text-brown-400 dark:text-brown-500 mt-0.5 truncate">{sec.sub || summary}</p>
                      )}
                    </div>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-brown-400 dark:text-brown-500 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-brown-400 dark:text-brown-500 shrink-0" />
                    )}
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="px-4 pb-4">
                      <Separator className="mb-4 bg-brown-100/30 dark:bg-brown-700/20" />
                      {renderSectionContent(sec.key, sectionData)}
                    </div>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            </motion.div>
          );
        })}

        {/* Footer note */}
        <div className="text-center py-6">
          <Separator className="mb-6 bg-brown-100/30 dark:bg-brown-700/20" />
          <p className="text-[11px] text-brown-400 dark:text-brown-500 italic">
            &ldquo;Grahas incline. They do not imprison.&rdquo; — Ancient Vedic Wisdom
          </p>
          <p className="text-[10px] text-brown-300 dark:text-brown-600 mt-1">
            Ayanamsa: {data.calculationInfo.ayanamsa.toFixed(4)}° (Lahiri) • Engine: {data.calculationInfo.engine}
          </p>
        </div>
      </div>
    </div>
  );
}
