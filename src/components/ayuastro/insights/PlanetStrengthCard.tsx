'use client';

import { useState, useEffect } from 'react';
import { useAyuAstroStore } from '@/store/ayuastro-store';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Zap, TrendingUp, TrendingDown, Crown, AlertTriangle, Loader2 } from 'lucide-react';
import { getPlanetName, getZodiacName, getHouseName, type VedicLanguage } from '@/lib/vedic-i18n';

// ─── Types ──────────────────────────────────────────────────────────────────

interface PlanetStrengthData {
  name: string;
  sign: string;
  house: number;
  score: number;
  dignity: string;
  isRetrograde: boolean;
  isCombust: boolean;
  strengths: string[];
  weaknesses: string[];
  influenceEn?: string;
  influenceHinglish?: string;
  remedies?: string[];
}

interface PlanetStrengthResponse {
  planets: PlanetStrengthData[];
  strongestPlanet: PlanetStrengthData | null;
  weakestPlanet: PlanetStrengthData | null;
  allPlanetsRanked: PlanetStrengthData[];
}

// ─── Constants ──────────────────────────────────────────────────────────────

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mars: '♂', Mercury: '☿', Jupiter: '♃', Venus: '♀', Saturn: '♄', Rahu: '☊', Ketu: '☋',
};

const DIGNITY_EMOJI: Record<string, string> = {
  Exalted: '⭐',
  Moolatrikona: '✦',
  'Own Sign': '🏠',
  Friendly: '🤝',
  Neutral: '➖',
  Enemy: '⚠️',
  Debilitated: '🔻',
};

const SECTION_LABELS: Record<VedicLanguage, Record<string, string>> = {
  en: {
    title: 'Planet Power',
    subtitle: 'Your strongest and weakest planets',
    strongest: 'Your Strongest Planet',
    weakest: 'Your Weakest Planet',
    ranking: 'Planet Power Ranking',
    strengthScore: 'Strength',
    whyStrong: 'Why it\'s strong',
    whyWeak: 'Why it\'s weak',
    remedies: 'Remedies',
    retrograde: 'Retrograde',
    combust: 'Combust',
    house: 'House',
    in: 'in',
    noData: 'Calculating planet strengths...',
  },
  hi: {
    title: 'ग्रह शक्ति',
    subtitle: 'आपके सबसे मजबूत और कमजोर ग्रह',
    strongest: 'आपका सबसे मजबूत ग्रह',
    weakest: 'आपका सबसे कमजोर ग्रह',
    ranking: 'ग्रह शक्ति रैंकिंग',
    strengthScore: 'शक्ति',
    whyStrong: 'मजबूत क्यों है',
    whyWeak: 'कमजोर क्यों है',
    remedies: 'उपाय',
    retrograde: 'वक्री',
    combust: 'अस्त',
    house: 'भाव',
    in: 'में',
    noData: 'ग्रह शक्ति की गणना हो रही है...',
  },
  hinglish: {
    title: 'Graha Shakti',
    subtitle: 'Aapka sabse mazboot aur kamzor graha',
    strongest: 'Aapka Sabse Mazboot Graha',
    weakest: 'Aapka Sabse Kamzor Graha',
    ranking: 'Graha Shakti Ranking',
    strengthScore: 'Shakti',
    whyStrong: 'Mazboot kyun hai',
    whyWeak: 'Kamzor kyun hai',
    remedies: 'Upay',
    retrograde: 'Vakri',
    combust: 'Ast',
    house: 'Bhav',
    in: 'mein',
    noData: 'Graha shakti calculate ho rahi hai...',
  },
};

function t(key: string, lang: VedicLanguage): string {
  return SECTION_LABELS[lang]?.[key] ?? SECTION_LABELS.en[key] ?? key;
}

function getScoreColor(score: number): string {
  if (score > 3) return 'text-emerald-600 dark:text-emerald-400';
  if (score >= 0) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-500 dark:text-red-400';
}

function getBarGradient(score: number): string {
  if (score > 3) return 'from-emerald-500 to-green-400';
  if (score > 0) return 'from-amber-500 to-yellow-400';
  if (score >= -2) return 'from-orange-500 to-amber-400';
  return 'from-red-500 to-rose-400';
}

function getBarWidth(score: number): string {
  // Normalize score to percentage. Theoretical range: -8 to +12, but typical: -5 to +10
  const clamped = Math.max(-5, Math.min(10, score));
  const pct = ((clamped + 5) / 15) * 100;
  return `${Math.max(5, pct)}%`;
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function PlanetStrengthCard() {
  const { userId, language, setLanguage } = useAyuAstroStore();
  const [data, setData] = useState<PlanetStrengthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const lang = (language === 'hi' ? 'hinglish' : language) as VedicLanguage;

  useEffect(() => {
    if (!userId) {
      setError('No user ID');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const res = await fetch('/api/astrology/planet-strength', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        });

        if (!res.ok) throw new Error(`API error: ${res.status}`);

        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  // ─── Loading State ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Card className="overflow-hidden shadow-lg border-0 dark:bg-white/[0.08]">
        <div className="h-1.5 bg-gradient-to-r from-amber-500 to-yellow-500" />
        <div className="p-6 flex items-center justify-center gap-3">
          <Loader2 className="w-5 h-5 text-gold animate-spin" />
          <p className="text-sm text-brown-500 dark:text-brown-600">{t('noData', lang)}</p>
        </div>
      </Card>
    );
  }

  if (error || !data) return null;

  const { strongestPlanet, weakestPlanet, allPlanetsRanked } = data;

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* ═══════ Language Toggle ═══════ */}
      <div className="flex justify-center">
        <div className="inline-flex items-center bg-brown-50/80 dark:bg-brown-800/50 rounded-full p-1 gap-1">
          <button
            onClick={() => setLanguage('en')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              lang === 'en'
                ? 'bg-gold text-white shadow-sm'
                : 'text-brown-600 dark:text-brown-400 hover:text-brown-800 dark:hover:text-brown-200'
            }`}
          >
            English
          </button>
          <button
            onClick={() => setLanguage('hinglish')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              lang === 'hinglish'
                ? 'bg-gold text-white shadow-sm'
                : 'text-brown-600 dark:text-brown-400 hover:text-brown-800 dark:hover:text-brown-200'
            }`}
          >
            Hinglish
          </button>
        </div>
      </div>

      {/* ═══════ Section 1: Strongest Planet ═══════ */}
      {strongestPlanet && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="overflow-hidden shadow-lg border-0 dark:bg-white/[0.08]">
            {/* Green/emerald accent bar */}
            <div className="h-1.5 bg-gradient-to-r from-emerald-500 to-green-400" />
            <div className="p-5">
              {/* Header */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10">
                  <Crown className="size-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-brown-900 dark:text-brown-100">
                    {t('strongest', lang)}
                  </h3>
                  <p className="text-[10px] text-brown-500 dark:text-brown-600">
                    {lang === 'hinglish' ? 'Aapka Sabse Mazboot Graha' : 'Your Strongest Planet'}
                  </p>
                </div>
              </div>

              {/* Planet identity card */}
              <div className="bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-400/20 rounded-xl p-4 text-center mb-4">
                <div className="text-4xl mb-1">{PLANET_SYMBOLS[strongestPlanet.name] ?? '●'}</div>
                <h4 className="font-serif text-xl font-bold text-emerald-700 dark:text-emerald-300">
                  {getPlanetName(strongestPlanet.name, lang)}
                </h4>
                <p className="text-xs text-brown-600 dark:text-brown-400 mt-1">
                  {lang === 'hinglish'
                    ? `${getPlanetName(strongestPlanet.name, lang)} ${t('in', lang)} ${getZodiacName(strongestPlanet.sign, lang)} rashi • ${getHouseName(strongestPlanet.house, lang)}`
                    : `${getPlanetName(strongestPlanet.name, lang)} ${t('in', lang)} ${getZodiacName(strongestPlanet.sign, lang)} • ${getHouseName(strongestPlanet.house, lang)}`
                  }
                </p>
                <div className="flex items-center justify-center gap-2 mt-3">
                  <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                    {t('strengthScore', lang)}: {strongestPlanet.score}
                  </Badge>
                  <Badge className="bg-gold/15 text-gold-dark dark:text-gold text-xs">
                    {strongestPlanet.dignity} {DIGNITY_EMOJI[strongestPlanet.dignity] ?? ''}
                  </Badge>
                  {strongestPlanet.isRetrograde && (
                    <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 text-[10px]">
                      ℞ {t('retrograde', lang)}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Influence text */}
              {(lang === 'hinglish' ? strongestPlanet.influenceHinglish : strongestPlanet.influenceEn) && (
                <div className="bg-brown-50/50 dark:bg-brown-800/30 rounded-lg p-3 mb-4 border border-brown-100/30 dark:border-brown-700/30">
                  <p className="text-sm text-brown-800 dark:text-brown-300 leading-relaxed">
                    {lang === 'hinglish' ? strongestPlanet.influenceHinglish : strongestPlanet.influenceEn}
                  </p>
                </div>
              )}

              {/* Why it's strong */}
              {strongestPlanet.strengths.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2">
                    {t('whyStrong', lang)}
                  </p>
                  <ul className="space-y-1.5">
                    {strongestPlanet.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                        <p className="text-xs text-brown-700 dark:text-brown-400 leading-relaxed">{s}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      )}

      {/* ═══════ Section 2: Weakest Planet ═══════ */}
      {weakestPlanet && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="overflow-hidden shadow-lg border-0 dark:bg-white/[0.08]">
            {/* Red/rose accent bar */}
            <div className="h-1.5 bg-gradient-to-r from-red-500 to-rose-400" />
            <div className="p-5">
              {/* Header */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex size-9 items-center justify-center rounded-xl bg-red-500/10">
                  <AlertTriangle className="size-5 text-red-500 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-brown-900 dark:text-brown-100">
                    {t('weakest', lang)}
                  </h3>
                  <p className="text-[10px] text-brown-500 dark:text-brown-600">
                    {lang === 'hinglish' ? 'Aapka Sabse Kamzor Graha' : 'Your Weakest Planet'}
                  </p>
                </div>
              </div>

              {/* Planet identity card */}
              <div className="bg-gradient-to-br from-red-500/10 via-red-500/5 to-transparent border border-red-400/20 rounded-xl p-4 text-center mb-4">
                <div className="text-4xl mb-1">{PLANET_SYMBOLS[weakestPlanet.name] ?? '●'}</div>
                <h4 className="font-serif text-xl font-bold text-red-600 dark:text-red-400">
                  {getPlanetName(weakestPlanet.name, lang)}
                </h4>
                <p className="text-xs text-brown-600 dark:text-brown-400 mt-1">
                  {lang === 'hinglish'
                    ? `${getPlanetName(weakestPlanet.name, lang)} ${t('in', lang)} ${getZodiacName(weakestPlanet.sign, lang)} rashi • ${getHouseName(weakestPlanet.house, lang)}`
                    : `${getPlanetName(weakestPlanet.name, lang)} ${t('in', lang)} ${getZodiacName(weakestPlanet.sign, lang)} • ${getHouseName(weakestPlanet.house, lang)}`
                  }
                </p>
                <div className="flex items-center justify-center gap-2 mt-3">
                  <Badge className="bg-red-500/15 text-red-700 dark:text-red-300 text-xs font-bold">
                    {t('strengthScore', lang)}: {weakestPlanet.score}
                  </Badge>
                  <Badge className="bg-gold/15 text-gold-dark dark:text-gold text-xs">
                    {weakestPlanet.dignity} {DIGNITY_EMOJI[weakestPlanet.dignity] ?? ''}
                  </Badge>
                  {weakestPlanet.isRetrograde && (
                    <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 text-[10px]">
                      ℞ {t('retrograde', lang)}
                    </Badge>
                  )}
                  {weakestPlanet.isCombust && (
                    <Badge className="bg-orange-500/15 text-orange-700 dark:text-orange-300 text-[10px]">
                      🔥 {t('combust', lang)}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Influence text */}
              {(lang === 'hinglish' ? weakestPlanet.influenceHinglish : weakestPlanet.influenceEn) && (
                <div className="bg-brown-50/50 dark:bg-brown-800/30 rounded-lg p-3 mb-4 border border-brown-100/30 dark:border-brown-700/30">
                  <p className="text-sm text-brown-800 dark:text-brown-300 leading-relaxed">
                    {lang === 'hinglish' ? weakestPlanet.influenceHinglish : weakestPlanet.influenceEn}
                  </p>
                </div>
              )}

              {/* Why it's weak */}
              {weakestPlanet.weaknesses.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-red-500 dark:text-red-400 uppercase tracking-wider mb-2">
                    {t('whyWeak', lang)}
                  </p>
                  <ul className="space-y-1.5">
                    {weakestPlanet.weaknesses.map((w, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <TrendingDown className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" />
                        <p className="text-xs text-brown-700 dark:text-brown-400 leading-relaxed">{w}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Remedies */}
              {weakestPlanet.remedies && weakestPlanet.remedies.length > 0 && (
                <div className="bg-gradient-to-r from-sage/10 to-sage/5 border border-sage/20 rounded-lg p-3">
                  <p className="text-xs font-semibold text-sage-dark dark:text-sage uppercase tracking-wider mb-2">
                    💚 {t('remedies', lang)}
                  </p>
                  <ul className="space-y-1.5">
                    {weakestPlanet.remedies.map((r, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-sage text-sm mt-0.5">•</span>
                        <p className="text-xs text-brown-700 dark:text-brown-400 leading-relaxed">{r}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      )}

      {/* ═══════ Section 3: Planet Power Ranking ═══════ */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Card className="overflow-hidden shadow-lg border-0 dark:bg-white/[0.08]">
          <div className="h-1.5 bg-gradient-to-r from-gold via-gold-dark to-gold" />
          <div className="p-5">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex size-9 items-center justify-center rounded-xl bg-gold/10">
                <Zap className="size-5 text-gold-dark dark:text-gold" />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-brown-900 dark:text-brown-100">
                  {t('ranking', lang)}
                </h3>
                <p className="text-[10px] text-brown-500 dark:text-brown-600">
                  {lang === 'hinglish' ? 'Graha Shakti Ranking' : 'All 9 planets ranked by strength'}
                </p>
              </div>
            </div>

            {/* Ranked list */}
            <div className="space-y-2">
              {allPlanetsRanked.map((planet, index) => {
                const isStrongest = index === 0;
                const isWeakest = index === allPlanetsRanked.length - 1;

                return (
                  <motion.div
                    key={planet.name}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                    className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors ${
                      isStrongest
                        ? 'bg-emerald-500/10 border border-emerald-400/20'
                        : isWeakest
                          ? 'bg-red-500/5 border border-red-400/15'
                          : 'bg-brown-50/50 dark:bg-brown-800/30 border border-transparent'
                    }`}
                  >
                    {/* Rank number */}
                    <div className={`flex size-7 items-center justify-center rounded-full text-xs font-bold shrink-0 ${
                      isStrongest
                        ? 'bg-gold text-white'
                        : isWeakest
                          ? 'bg-red-500/20 text-red-600 dark:text-red-400'
                          : 'bg-brown-100/50 dark:bg-brown-700/50 text-brown-600 dark:text-brown-400'
                    }`}>
                      {index + 1}
                    </div>

                    {/* Planet symbol */}
                    <span className="text-lg shrink-0">{PLANET_SYMBOLS[planet.name] ?? '●'}</span>

                    {/* Planet name & details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold text-brown-800 dark:text-brown-200 truncate">
                          {getPlanetName(planet.name, lang)}
                        </span>
                        {planet.isRetrograde && (
                          <span className="text-[9px] text-amber-600 dark:text-amber-400 font-bold">℞</span>
                        )}
                        {planet.isCombust && (
                          <span className="text-[9px] text-orange-500">🔥</span>
                        )}
                      </div>
                      <p className="text-[10px] text-brown-500 dark:text-brown-600 truncate">
                        {getZodiacName(planet.sign, lang)} • {getHouseName(planet.house, lang)}
                      </p>
                    </div>

                    {/* Strength bar */}
                    <div className="w-20 h-2 bg-brown-100/50 dark:bg-brown-700/50 rounded-full overflow-hidden shrink-0">
                      <motion.div
                        className={`h-full rounded-full bg-gradient-to-r ${getBarGradient(planet.score)}`}
                        initial={{ width: 0 }}
                        animate={{ width: getBarWidth(planet.score) }}
                        transition={{ duration: 0.8, delay: 0.2 + 0.1 * index, ease: 'easeOut' }}
                      />
                    </div>

                    {/* Score */}
                    <span className={`text-xs font-bold shrink-0 ${getScoreColor(planet.score)}`}>
                      {planet.score > 0 ? '+' : ''}{planet.score}
                    </span>
                  </motion.div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-brown-100/30 dark:border-brown-700/30">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-green-400" />
                <span className="text-[10px] text-brown-500 dark:text-brown-600">
                  {lang === 'hinglish' ? 'Mazboot (>3)' : 'Strong (>3)'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400" />
                <span className="text-[10px] text-brown-500 dark:text-brown-600">
                  {lang === 'hinglish' ? 'Medium (0-3)' : 'Moderate (0-3)'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-red-500 to-rose-400" />
                <span className="text-[10px] text-brown-500 dark:text-brown-600">
                  {lang === 'hinglish' ? 'Kamzor (<0)' : 'Weak (<0)'}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
