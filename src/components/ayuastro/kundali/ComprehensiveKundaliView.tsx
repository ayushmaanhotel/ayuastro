'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAyuAstroStore } from '@/store/ayuastro-store';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Brain, RotateCcw, Briefcase, Heart, Activity,
  Clock, Eye, Users, Shield, Star, Grid3X3, Moon,
  ChevronDown, ChevronUp, ArrowLeft, Loader2, AlertCircle,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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

const SECTIONS = [
  { key: 'personalityBlueprint', label: 'Personality', icon: Brain, color: 'from-amber-500 to-orange-500' },
  { key: 'karmaPatterns', label: 'Karma', icon: RotateCcw, color: 'from-purple-500 to-indigo-500' },
  { key: 'careerDharma', label: 'Career', icon: Briefcase, color: 'from-emerald-500 to-green-500' },
  { key: 'marriageDynamics', label: 'Marriage', icon: Heart, color: 'from-rose-500 to-pink-500' },
  { key: 'healthTendencies', label: 'Health', icon: Activity, color: 'from-cyan-500 to-teal-500' },
  { key: 'timingEvents', label: 'Timing', icon: Clock, color: 'from-blue-500 to-sky-500' },
  { key: 'spiritualEvolution', label: 'Spiritual', icon: Eye, color: 'from-violet-500 to-purple-500' },
  { key: 'familyKarma', label: 'Family', icon: Users, color: 'from-amber-600 to-yellow-500' },
  { key: 'hiddenPatterns', label: 'Hidden', icon: Shield, color: 'from-red-500 to-orange-500' },
  { key: 'rareYogas', label: 'Yogas', icon: Star, color: 'from-yellow-400 to-amber-500' },
  { key: 'divisionalCharts', label: 'Vargas', icon: Grid3X3, color: 'from-indigo-500 to-blue-500' },
  { key: 'nakshatraDeepAnalysis', label: 'Nakshatra', icon: Moon, color: 'from-slate-500 to-gray-500' },
];

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
  const { userId, setView } = useAyuAstroStore();
  const [data, setData] = useState<ComprehensiveData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState(0);
  const [openSections, setOpenSections] = useState<Set<number>>(new Set([0]));
  const [viewedSections, setViewedSections] = useState<Set<number>>(new Set());

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
  }, []);

  // ─── Loading State ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-cream dark:bg-brown-900 px-4">
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-4 border-gold/20 border-t-gold animate-spin" />
          <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gold w-8 h-8" />
        </div>
        <h2 className="mt-6 font-serif text-xl text-brown-800 dark:text-brown-100">Analyzing Your Cosmic Blueprint</h2>
        <p className="text-sm text-brown-500 dark:text-brown-400 mt-2">Calculating 12 dimensions of your Vedic Kundali...</p>
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
              <TextBlock label="Mental Wiring" text={sectionData.mentalWiring} />
              <TextBlock label="Emotional Tendencies" text={sectionData.emotionalTendencies} />
              <TextBlock label="Courage & Fear" text={sectionData.courageAndFear} />
              <TextBlock label="Leadership vs Follower" text={sectionData.leadershipVsFollower} />
              <TextBlock label="Materialistic vs Spiritual" text={sectionData.materialisticVsSpiritual} />
              <TextBlock label="Anger Patterns" text={sectionData.angerPatterns} />
              <TextBlock label="Decision Style" text={sectionData.decisionStyle} />
              <TextBlock label="Hidden Insecurities" text={sectionData.hiddenInsecurities} />
              <TextBlock label="Public vs Private Self" text={sectionData.publicVsPrivateSelf} />
              <TextBlock label="Intelligence Type" text={sectionData.intelligenceType} />
              <TextBlock label="Communication Style" text={sectionData.communicationStyle} />
              <TextBlock label="Risk Appetite" text={sectionData.riskAppetite} />
            </div>
            {sectionData.keyFactors && <KeyFactorsGrid factors={sectionData.keyFactors} />}
          </div>
        );
      case 'karmaPatterns':
        return (
          <div className="space-y-4">
            <TextBlock label="Past Life Tendencies" text={sectionData.pastLifeTendencies} />
            <TextBlock label="Unfinished Karmas" text={sectionData.unfinishedKarmas} />
            <TextBlock label="Repeating Suffering Loops" text={sectionData.repeatingSufferingLoops} />
            {sectionData.debtsToward && (
              <div>
                <p className="text-xs font-semibold text-brown-600 dark:text-brown-300 uppercase tracking-wider mb-2">Karmic Debts Toward</p>
                <div className="flex flex-wrap gap-2">
                  {sectionData.debtsToward.map((d: string, i: number) => (
                    <Badge key={i} className="bg-purple-500/10 text-purple-700 dark:text-purple-300 text-[10px]">{d}</Badge>
                  ))}
                </div>
              </div>
            )}
            <TextBlock label="Areas Forcing Humility" text={sectionData.areasForcingHumility} />
            <TextBlock label="Why Certain Pain Repeats" text={sectionData.whyCertainPainRepeats} />
            {sectionData.keyIndicators && <KeyFactorsGrid factors={sectionData.keyIndicators} />}
          </div>
        );
      case 'careerDharma':
        return (
          <div className="space-y-4">
            <TextBlock label="Natural Skill Pattern" text={sectionData.naturalSkillPattern} />
            <TextBlock label="Money Behavior" text={sectionData.moneyBehavior} />
            <TextBlock label="Authority Potential" text={sectionData.authorityPotential} />
            <TextBlock label="Entrepreneurship vs Employment" text={sectionData.entrepreneurshipVsEmployment} />
            <TextBlock label="Fame Potential" text={sectionData.famePotential} />
            <TextBlock label="Risk Capacity" text={sectionData.riskCapacity} />
            <TextBlock label="Wealth Creation Cycles" text={sectionData.wealthCreationCycles} />
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
            <TextBlock label="Attraction Pattern" text={sectionData.attractionPattern} />
            <TextBlock label="Emotional Compatibility" text={sectionData.emotionalCompatibility} />
            <TextBlock label="Dominance Issues" text={sectionData.dominanceIssues} />
            <TextBlock label="Loyalty Indicators" text={sectionData.loyaltyIndicators} />
            <TextBlock label="Delays" text={sectionData.delays} />
            <TextBlock label="Divorce Potential" text={sectionData.divorcePotential} />
            <TextBlock label="Power Imbalance" text={sectionData.powerImbalance} />
            <TextBlock label="Spouse Psychology" text={sectionData.spousePsychology} />
            <TextBlock label="Marriage Timing" text={sectionData.marriageTiming} />
            <TextBlock label="Quality of Married Life" text={sectionData.qualityOfMarriedLife} />
            <TextBlock label="Repeating Patterns" text={sectionData.repeatingPatterns} />
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
            <TextBlock label="Chronic Disease Tendency" text={sectionData.chronicDiseaseTendency} />
            <TextBlock label="Stress Pattern" text={sectionData.stressPattern} />
            <TextBlock label="Mental Stability" text={sectionData.mentalInstability} />
            <TextBlock label="Accident Vulnerability" text={sectionData.accidentVulnerability} />
            <TextBlock label="Addiction Tendencies" text={sectionData.addictionTendencies} />
            {sectionData.keyFactors && <KeyFactorsGrid factors={sectionData.keyFactors} />}
          </div>
        );
      case 'timingEvents':
        return (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-gold/15 to-gold/5 dark:from-gold/10 dark:to-gold/5 border border-gold/30 rounded-xl p-4">
              <p className="text-xs font-semibold text-gold-dark dark:text-gold uppercase tracking-wider mb-1">Current Mahadasha</p>
              <p className="text-sm font-semibold text-brown-900 dark:text-brown-50">{sectionData.currentMahadasha}</p>
              <p className="text-xs font-semibold text-gold-dark dark:text-gold uppercase tracking-wider mt-2 mb-1">Current Antardasha</p>
              <p className="text-sm font-semibold text-brown-900 dark:text-brown-50">{sectionData.currentAntardasha}</p>
            </div>
            <TextBlock label="Dasha Interpretation" text={sectionData.dashaInterpretation} />
            <TextBlock label="Gochar Influence" text={sectionData.gocharInfluence} />
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
            <TextBlock label="Key Timing Factors" text={sectionData.keyTimingFactors} />
          </div>
        );
      case 'spiritualEvolution':
        return (
          <div className="space-y-4">
            <TextBlock label="Moksha Tendency" text={sectionData.mokshaTendency} />
            <TextBlock label="Spiritual Inclination" text={sectionData.spiritualInclination} />
            <TextBlock label="Guru Karma" text={sectionData.guruKarma} />
            <TextBlock label="Detachment Level" text={sectionData.detachmentLevel} />
            <TextBlock label="Meditation Capacity" text={sectionData.meditationCapacity} />
            <TextBlock label="Ego Lessons" text={sectionData.egoLessons} />
            <TextBlock label="Material Trap vs Liberation" text={sectionData.materialTrapVsLiberation} />
            {sectionData.keyFactors && <KeyFactorsGrid factors={sectionData.keyFactors} />}
          </div>
        );
      case 'familyKarma':
        return (
          <div className="space-y-4">
            <TextBlock label="Father Relationship" text={sectionData.fatherRelationship} />
            <TextBlock label="Mother Psychology" text={sectionData.motherPsychology} />
            <TextBlock label="Ancestor Karma" text={sectionData.ancestorKarma} />
            <TextBlock label="Family Wealth Patterns" text={sectionData.familyWealthPatterns} />
            <TextBlock label="Family Suffering Cycles" text={sectionData.familySufferingCycles} />
            <TextBlock label="Child Karma" text={sectionData.childKarma} />
            <TextBlock label="Responsibility Burdens" text={sectionData.responsibilityBurdens} />
            {sectionData.keyFactors && <KeyFactorsGrid factors={sectionData.keyFactors} />}
          </div>
        );
      case 'hiddenPatterns':
        return (
          <div className="space-y-4">
            <TextBlock label="Self-Sabotage" text={sectionData.selfSabotage} />
            <TextBlock label="Addictions" text={sectionData.addictions} />
            <TextBlock label="Manipulative Behavior" text={sectionData.manipulativeBehavior} />
            <TextBlock label="Ego Traps" text={sectionData.egoTraps} />
            <TextBlock label="Laziness" text={sectionData.laziness} />
            <TextBlock label="Escapism" text={sectionData.escapism} />
            <TextBlock label="Obsession" text={sectionData.obsession} />
            <TextBlock label="Isolation" text={sectionData.isolation} />
            <TextBlock label="Betrayal Tendencies" text={sectionData.betrayalTendencies} />
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
                <p className="text-xs font-semibold text-brown-600 dark:text-brown-300 uppercase tracking-wider mb-2">Detected Yogas</p>
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
                <p className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider mb-2">Detected Doshas</p>
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
                <p className="text-xs font-semibold text-gold-dark dark:text-gold uppercase tracking-wider mb-1">D9 Navamsha — Soul Chart</p>
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
                <p className="text-xs font-semibold text-gold-dark dark:text-gold uppercase tracking-wider mb-2">Vargottama Planets (Same Sign in D1 & D9)</p>
                <div className="flex flex-wrap gap-2">
                  {sectionData.vargottamaPlanets.map((p: string, i: number) => (
                    <Badge key={i} className="bg-gold/15 text-gold-dark dark:text-gold text-[10px]">✦ {p}</Badge>
                  ))}
                </div>
              </div>
            )}
            <TextBlock label="D1 Main Chart" text={sectionData.d1Main} />
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
            <TextBlock label="Psychological Coding" text={sectionData.psychologicalCoding} />
            <TextBlock label="Desire Nature" text={sectionData.desireNature} />
            <TextBlock label="Hidden Motivations" text={sectionData.hiddenMotivations} />
            <TextBlock label="Emotional Wounds" text={sectionData.emotionalWounds} />
            <TextBlock label="Behavioral Patterns" text={sectionData.behavioralPatterns} />
            <TextBlock label="Deity Influence" text={sectionData.deityInfluence} />
            <TextBlock label="Symbol Meaning" text={sectionData.symbolMeaning} />
            <TextBlock label="Pada Analysis" text={sectionData.padaAnalysis} />
            <TextBlock label="Nakshatra Ruler Influence" text={sectionData.nakshatraRulerInfluence} />
          </div>
        );
      default:
        return <p className="text-sm text-brown-500">Section content available.</p>;
    }
  };

  return (
    <div className="min-h-screen bg-cream dark:bg-brown-900 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-cream/90 dark:bg-brown-900/90 backdrop-blur-sm border-b border-brown-100/30 dark:border-brown-700/30">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3 mb-3">
            <button onClick={() => setView('insights')} className="p-1.5 rounded-lg hover:bg-brown-100/50 dark:hover:bg-brown-800/50">
              <ArrowLeft className="w-5 h-5 text-brown-600 dark:text-brown-300" />
            </button>
            <div className="flex-1">
              <h1 className="font-serif text-lg font-bold text-brown-900 dark:text-brown-50">Comprehensive Kundali</h1>
              <p className="text-[11px] text-brown-500 dark:text-brown-400">12 Dimensions of Vedic Analysis</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-gold-dark dark:text-gold">{viewedSections.size}/12</p>
              <p className="text-[10px] text-brown-400 dark:text-brown-500">sections</p>
            </div>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-brown-100/30 dark:bg-brown-700/30 rounded-full h-1 mb-3">
            <div className="bg-gradient-to-r from-gold to-gold-dark h-1 rounded-full transition-all duration-500" style={{ width: `${(viewedSections.size / 12) * 100}%` }} />
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

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-3">
        {SECTIONS.map((sec, i) => {
          const Icon = sec.icon;
          const sectionData = data[sec.key as keyof ComprehensiveData] as Record<string, any>;
          if (!sectionData) return null;
          const isOpen = openSections.has(i);

          return (
            <motion.div
              key={sec.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
            >
              <Collapsible open={isOpen} onOpenChange={() => toggleSection(i)}>
                <Card className="overflow-hidden shadow-md card-hover border-brown-100/30 dark:border-brown-700/30 dark:bg-white/5">
                  {/* Accent bar */}
                  <div className={`h-1 bg-gradient-to-r ${sec.color}`} />
                  <CollapsibleTrigger className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-brown-50/30 dark:hover:bg-brown-800/20 transition-colors">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${sec.color} flex items-center justify-center shrink-0`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif text-sm font-bold text-brown-900 dark:text-brown-50">{sec.label}</h3>
                      <p className="text-[10px] text-brown-400 dark:text-brown-500 truncate">Section {i + 1} of 12</p>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-brown-400 dark:text-brown-500 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-brown-400 dark:text-brown-500 shrink-0" />
                    )}
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="px-4 pb-4">
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
