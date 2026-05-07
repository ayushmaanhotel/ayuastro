'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAyuAstroStore, type TraitScore } from '@/store/ayuastro-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Sparkles,
  BarChart2,
  PieChart as PieChartIcon,
  Activity,
  Flame,
  Mountain,
  Wind,
  Droplets,
  TrendingUp,
  Heart,
  SmilePlus,
} from 'lucide-react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Line,
  Area,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useTheme } from 'next-themes';

// ─── Constants ──────────────────────────────────────────────────────────────

const ZODIAC_ELEMENTS: Record<string, { element: string }> = {
  Aries: { element: 'Fire' }, Taurus: { element: 'Earth' }, Gemini: { element: 'Air' },
  Cancer: { element: 'Water' }, Leo: { element: 'Fire' }, Virgo: { element: 'Earth' },
  Libra: { element: 'Air' }, Scorpio: { element: 'Water' }, Sagittarius: { element: 'Fire' },
  Capricorn: { element: 'Earth' }, Aquarius: { element: 'Air' }, Pisces: { element: 'Water' },
};

const ELEMENT_CHART_COLORS: Record<string, string> = {
  Fire: '#ef4444',
  Earth: '#10b981',
  Air: '#f59e0b',
  Water: '#3b82f6',
};

const NUMEROLOGY_COLORS = ['#d4af37', '#7c9070', '#8b6f47', '#c4a35a'];

const NUMEROLOGY_MEANINGS: Record<number, string> = {
  1: 'The Pioneer — independence, originality, ambition',
  2: 'The Peacemaker — cooperation, sensitivity, balance',
  3: 'The Creative — expression, joy, inspiration',
  4: 'The Builder — stability, discipline, hard work',
  5: 'The Adventurer — freedom, change, versatility',
  6: 'The Nurturer — responsibility, love, harmony',
  7: 'The Seeker — wisdom, introspection, spirituality',
  8: 'The Powerhouse — authority, success, material mastery',
  9: 'The Humanitarian — compassion, generosity, universal love',
  11: 'The Illuminator — intuition, spiritual insight, inspiration',
  22: 'The Master Builder — visionary creation, practical idealism',
  33: 'The Master Teacher — compassion mastery, spiritual upliftment',
};

const PIE_COLORS = {
  High: '#7c9070',      // sage
  Moderate: '#d4af37',  // gold
  Growth: '#a89070',    // brown-300
};

// ─── Custom Tooltip Component ───────────────────────────────────────────────

function AyuTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color?: string; payload?: Record<string, unknown> }>; label?: string }) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-lg border border-gold/20 bg-white/95 dark:bg-brown-900/95 px-3 py-2 shadow-lg backdrop-blur-sm">
      {label && (
        <p className="text-xs font-semibold text-brown-900 dark:text-brown-100 mb-1" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          {label}
        </p>
      )}
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-xs text-brown-700 dark:text-brown-300">
          <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: entry.color || '#d4af37' }} />
          <span className="font-medium">{entry.name}:</span>
          <span className="font-bold text-brown-900 dark:text-gold">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

function AyuPieTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { name: string; value: number; count: number } }> }) {
  if (!active || !payload || payload.length === 0) return null;
  const data = payload[0].payload;

  return (
    <div className="rounded-lg border border-gold/20 bg-white/95 dark:bg-brown-900/95 px-3 py-2 shadow-lg backdrop-blur-sm">
      <p className="text-xs font-semibold text-brown-900 dark:text-brown-100" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
        {data.name}
      </p>
      <p className="text-xs text-brown-600 dark:text-brown-300">
        {data.count} trait{data.count !== 1 ? 's' : ''} ({data.value}%)
      </p>
    </div>
  );
}

// ─── Mood Entry Interface ───────────────────────────────────────────────────

interface MoodEntry {
  id: string;
  mood: number;
  emoji: string;
  note: string | null;
  tags: string[];
  createdAt: string;
}

// ─── Default Traits (fallback) ──────────────────────────────────────────────

function getDefaultTraits(): TraitScore[] {
  return [
    { name: 'empathy', label: 'Empathy', score: 78, description: '' },
    { name: 'resilience', label: 'Resilience', score: 65, description: '' },
    { name: 'communication', label: 'Communication', score: 72, description: '' },
    { name: 'trust', label: 'Trust', score: 55, description: '' },
    { name: 'emotional_awareness', label: 'Awareness', score: 82, description: '' },
    { name: 'adaptability', label: 'Adaptability', score: 48, description: '' },
    { name: 'patience', label: 'Patience', score: 61, description: '' },
    { name: 'leadership', label: 'Leadership', score: 35, description: '' },
    { name: 'creativity', label: 'Creativity', score: 73, description: '' },
    { name: 'loyalty', label: 'Loyalty', score: 85, description: '' },
    { name: 'independence', label: 'Independence', score: 42, description: '' },
    { name: 'harmony', label: 'Harmony', score: 68, description: '' },
    { name: 'intuition', label: 'Intuition', score: 76, description: '' },
    { name: 'discipline', label: 'Discipline', score: 38, description: '' },
  ];
}

// ─── Animation Variants ─────────────────────────────────────────────────────

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: 'easeOut' },
  }),
};

// ─── Main Component ─────────────────────────────────────────────────────────

export default function TraitDashboardView() {
  const { traitScores, astrologyData, numerologyData, userId, setView } = useAyuAstroStore();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [moodData, setMoodData] = useState<MoodEntry[]>([]);
  const [moodLoading, setMoodLoading] = useState(true);

  const traits = traitScores.length > 0 ? traitScores : getDefaultTraits();
  const sunSign = astrologyData?.sunSign || 'Capricorn';
  const moonSign = astrologyData?.moonSign || 'Gemini';
  const ascendant = astrologyData?.ascendant || 'Taurus';

  // ─── Fetch mood history ────────────────────────────────────────────────────
  useEffect(() => {
    async function fetchMoodHistory() {
      setMoodLoading(true);
      try {
        if (userId) {
          const res = await fetch(`/api/mood/history?userId=${encodeURIComponent(userId)}&days=14`);
          if (res.ok) {
            const json = await res.json();
            setMoodData(json.data?.entries || []);
          }
        }
      } catch {
        // Silently fail
      } finally {
        setMoodLoading(false);
      }
    }
    fetchMoodHistory();
  }, [userId]);

  // ─── Radar Chart Data ──────────────────────────────────────────────────────
  const radarData = useMemo(() =>
    traits.map((t) => ({
      subject: t.label || t.name,
      score: Math.round(t.score),
      fullMark: 100,
    })),
    [traits]
  );

  // ─── Pie Chart Data ────────────────────────────────────────────────────────
  const pieData = useMemo(() => {
    const high = traits.filter((t) => t.score > 75).length;
    const moderate = traits.filter((t) => t.score >= 40 && t.score <= 75).length;
    const growth = traits.filter((t) => t.score < 40).length;
    const total = traits.length || 1;

    return [
      { name: 'High', value: Math.round((high / total) * 100), count: high },
      { name: 'Moderate', value: Math.round((moderate / total) * 100), count: moderate },
      { name: 'Growth Area', value: Math.round((growth / total) * 100), count: growth },
    ];
  }, [traits]);

  const dominantCategory = useMemo(() => {
    const max = pieData.reduce((a, b) => a.count > b.count ? a : b, pieData[0]);
    return max.name;
  }, [pieData]);

  // ─── Element Balance Data ──────────────────────────────────────────────────
  const elementData = useMemo(() => {
    const signElements = [sunSign, moonSign, ascendant]
      .map((s) => ZODIAC_ELEMENTS[s]?.element)
      .filter(Boolean);
    const counts: Record<string, number> = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
    signElements.forEach((el) => { if (el) counts[el]++; });

    return Object.entries(counts).map(([element, count]) => ({
      element,
      count,
      percentage: Math.round((count / 3) * 100),
    }));
  }, [sunSign, moonSign, ascendant]);

  // ─── Mood Trend Data ──────────────────────────────────────────────────────
  const moodTrendData = useMemo(() => {
    const days: { day: string; mood: number; date: string }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

      const entry = moodData.find((m) => {
        const entryDate = new Date(m.createdAt).toISOString().split('T')[0];
        return entryDate === dateStr;
      });

      days.push({
        day: dayName,
        mood: entry ? entry.mood * 20 : 0, // Convert 1-5 to 0-100 scale
        date: dateStr,
      });
    }
    return days;
  }, [moodData]);

  const hasMoodData = moodData.length > 0;

  // ─── Numerology Comparison Data ────────────────────────────────────────────
  const numerologyChartData = useMemo(() => {
    if (!numerologyData) return [];
    return [
      { name: 'Life Path', value: numerologyData.lifePathNumber, meaning: NUMEROLOGY_MEANINGS[numerologyData.lifePathNumber] || 'Unique path' },
      { name: 'Destiny', value: numerologyData.destinyNumber, meaning: NUMEROLOGY_MEANINGS[numerologyData.destinyNumber] || 'Unique destiny' },
      { name: 'Soul Urge', value: numerologyData.soulUrgeNumber, meaning: NUMEROLOGY_MEANINGS[numerologyData.soulUrgeNumber] || 'Unique soul urge' },
      { name: 'Personality', value: numerologyData.personalityNumber, meaning: NUMEROLOGY_MEANINGS[numerologyData.personalityNumber] || 'Unique personality' },
    ];
  }, [numerologyData]);

  // ─── Chart theme colors ───────────────────────────────────────────────────
  const axisColor = isDark ? '#a89070' : '#8b6f47';
  const gridColor = isDark ? 'rgba(168, 144, 112, 0.15)' : 'rgba(139, 111, 71, 0.1)';
  const textColor = isDark ? '#c4a35a' : '#8b6f47';

  // ─── Empty state ──────────────────────────────────────────────────────────
  if (traits.length === 0) {
    return (
      <div className="bg-cream min-h-screen px-4 py-6 pb-24">
        <div className="mx-auto max-w-lg text-center py-20">
          <Sparkles className="size-12 text-gold mx-auto mb-4 opacity-50" />
          <h2 className="font-serif text-xl text-brown-900 dark:text-brown-100 mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            No Data Yet
          </h2>
          <p className="text-sm text-brown-400 mb-6">
            Complete your onboarding to see your emotional dashboard.
          </p>
          <Button onClick={() => setView('onboarding')} className="bg-brown-700 text-white hover:bg-brown-800">
            Get Started
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-cream px-4 py-6 pb-24">
      <div className="mx-auto max-w-lg space-y-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-3"
        >
          <button
            onClick={() => setView('insights')}
            className="flex size-9 items-center justify-center rounded-xl bg-white dark:bg-white/5 border border-brown-100 dark:border-brown-700/30 shadow-sm hover:shadow-md transition-shadow"
            aria-label="Back to insights"
          >
            <ArrowLeft className="size-4 text-brown-600 dark:text-brown-300" />
          </button>
          <div>
            <h1
              className="font-serif text-2xl font-bold text-brown-900 dark:text-brown-100"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Emotional Dashboard
            </h1>
            <p className="text-xs text-brown-400 dark:text-brown-300">Your cosmic data, visualized</p>
          </div>
        </motion.div>

        {/* 1. Radar Chart — Emotional Architecture */}
        <motion.div custom={0} variants={cardVariants} initial="hidden" animate="visible">
          <Card className="card-hover border-0 shadow-md bg-white dark:bg-white/5 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-gold via-sage to-gold-dark" />
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-brown-900 dark:text-brown-100">
                <Activity className="size-5 text-gold" />
                <span style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  Your Emotional Architecture
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full aspect-square max-w-[380px] mx-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                    <PolarGrid stroke={gridColor} />
                    <PolarAngleAxis
                      dataKey="subject"
                      tick={{ fill: axisColor, fontSize: 10, fontWeight: 500 }}
                    />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 100]}
                      tick={{ fill: axisColor, fontSize: 9 }}
                      axisLine={false}
                    />
                    <Radar
                      name="Score"
                      dataKey="score"
                      stroke="#d4af37"
                      fill="#d4af37"
                      fillOpacity={0.1}
                      strokeWidth={2}
                      dot={{ r: 3, fill: '#d4af37', stroke: '#fff', strokeWidth: 1 }}
                    />
                    <Tooltip content={<AyuTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 flex items-center justify-center gap-4 text-[10px] text-brown-400 dark:text-brown-300">
                <div className="flex items-center gap-1.5">
                  <span className="w-8 h-0.5 bg-gold rounded" />
                  <span>Your Score</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-8 h-0.5 border-t border-dashed border-brown-300 dark:border-brown-500" />
                  <span>Average (50)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 2. Trait Distribution Pie Chart */}
        <motion.div custom={1} variants={cardVariants} initial="hidden" animate="visible">
          <Card className="card-hover border-0 shadow-md bg-white dark:bg-white/5 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-sage via-gold to-brown-300" />
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-brown-900 dark:text-brown-100">
                <PieChartIcon className="size-5 text-sage" />
                <span style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  Trait Distribution
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full max-w-[300px] mx-auto aspect-square relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius="55%"
                      outerRadius="80%"
                      paddingAngle={3}
                      dataKey="value"
                      nameKey="name"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PIE_COLORS[entry.name as keyof typeof PIE_COLORS] || '#d4af37'}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<AyuPieTooltip />} />
                    <Legend
                      verticalAlign="bottom"
                      iconType="circle"
                      iconSize={8}
                      formatter={(value: string) => (
                        <span className="text-xs text-brown-600 dark:text-brown-300">{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center text */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ top: '-8%' }}>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-brown-900 dark:text-gold" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                      {dominantCategory}
                    </p>
                    <p className="text-[10px] text-brown-400 dark:text-brown-300 uppercase tracking-wider">
                      Dominant
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 3. Element Balance Bar Chart */}
        <motion.div custom={2} variants={cardVariants} initial="hidden" animate="visible">
          <Card className="card-hover border-0 shadow-md bg-white dark:bg-white/5 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-red-400 via-green-400 via-yellow-400 to-blue-400" />
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-brown-900 dark:text-brown-100">
                <BarChart2 className="size-5 text-gold" />
                <span style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  Element Balance
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={elementData} barSize={48}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                    <XAxis
                      dataKey="element"
                      tick={{ fill: axisColor, fontSize: 12, fontWeight: 600 }}
                      axisLine={{ stroke: gridColor }}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fill: axisColor, fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<AyuTooltip />} />
                    <Bar dataKey="percentage" name="Balance" radius={[8, 8, 0, 0]} animationDuration={1200} animationEasing="ease-out">
                      {elementData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={ELEMENT_CHART_COLORS[entry.element] || '#d4af37'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 flex items-center justify-center gap-4 text-[10px] text-brown-400 dark:text-brown-300">
                {elementData.map((e) => (
                  <div key={e.element} className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ELEMENT_CHART_COLORS[e.element] }} />
                    <span>{e.element}: {e.percentage}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 4. Mood Trend Line Chart */}
        <motion.div custom={3} variants={cardVariants} initial="hidden" animate="visible">
          {hasMoodData ? (
            <Card className="card-hover border-0 shadow-md bg-white dark:bg-white/5 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-gold-dark via-gold to-sage" />
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-brown-900 dark:text-brown-100">
                  <TrendingUp className="size-5 text-gold" />
                  <span style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                    Mood Trend
                  </span>
                </CardTitle>
                <p className="text-xs text-brown-400 dark:text-brown-300">Last 14 days</p>
              </CardHeader>
              <CardContent>
                <div className="w-full h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={moodTrendData}>
                      <defs>
                        <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#d4af37" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#d4af37" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                      <XAxis
                        dataKey="day"
                        tick={{ fill: axisColor, fontSize: 10 }}
                        axisLine={{ stroke: gridColor }}
                        tickLine={false}
                      />
                      <YAxis
                        domain={[0, 100]}
                        tick={{ fill: axisColor, fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip content={<AyuTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="mood"
                        stroke="none"
                        fill="url(#moodGradient)"
                      />
                      <Line
                        type="monotone"
                        dataKey="mood"
                        name="Mood"
                        stroke="#d4af37"
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: '#d4af37', stroke: '#fff', strokeWidth: 2 }}
                        activeDot={{ r: 6, fill: '#d4af37', stroke: '#fff', strokeWidth: 2 }}
                        connectNulls={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="card-hover border-0 shadow-md bg-white dark:bg-white/5 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-gold-dark via-gold to-sage" />
              <CardContent className="p-8 text-center">
                <div className="size-14 mx-auto mb-4 rounded-full bg-gold/10 flex items-center justify-center">
                  <SmilePlus className="size-7 text-gold" />
                </div>
                <h3
                  className="font-serif text-lg font-bold text-brown-900 dark:text-brown-100 mb-2"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  Start Tracking Your Mood
                </h3>
                <p className="text-sm text-brown-400 dark:text-brown-300 mb-5 max-w-xs mx-auto">
                  Log your daily mood to see emotional trends and patterns over time.
                </p>
                <Button
                  onClick={() => setView('mood')}
                  className="bg-brown-700 text-white hover:bg-brown-800 shadow-lg shadow-brown-700/20"
                >
                  <Heart className="mr-2 size-4" />
                  Go to Mood Tracker
                </Button>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* 5. Numerology Comparison Chart */}
        {numerologyData && (
          <motion.div custom={4} variants={cardVariants} initial="hidden" animate="visible">
            <Card className="card-hover border-0 shadow-md bg-white dark:bg-white/5 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-gold via-sage to-brown-400" />
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-brown-900 dark:text-brown-100">
                  <Sparkles className="size-5 text-gold" />
                  <span style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                    Numerology Blueprint
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={numerologyChartData} layout="vertical" barSize={24}>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
                      <XAxis
                        type="number"
                        domain={[0, 33]}
                        tick={{ fill: axisColor, fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        tick={{ fill: axisColor, fontSize: 11, fontWeight: 500 }}
                        axisLine={false}
                        tickLine={false}
                        width={85}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload || payload.length === 0) return null;
                          const data = payload[0].payload as { name: string; value: number; meaning: string };
                          return (
                            <div className="rounded-lg border border-gold/20 bg-white/95 dark:bg-brown-900/95 px-3 py-2 shadow-lg backdrop-blur-sm max-w-[250px]">
                              <p className="text-xs font-semibold text-brown-900 dark:text-brown-100 mb-1" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                                {data.name}: {data.value}
                              </p>
                              <p className="text-[10px] text-brown-500 dark:text-brown-300 leading-relaxed">{data.meaning}</p>
                            </div>
                          );
                        }}
                      />
                      <Bar dataKey="value" name="Number" radius={[0, 8, 8, 0]} animationDuration={1200} animationEasing="ease-out">
                        {numerologyChartData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={NUMEROLOGY_COLORS[index] || '#d4af37'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-3 flex items-center justify-center gap-3 text-[10px] text-brown-400 dark:text-brown-300">
                  {numerologyChartData.map((item, index) => (
                    <div key={item.name} className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: NUMEROLOGY_COLORS[index] }} />
                      <span>{item.name}: {item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

      </div>
    </div>
  );
}
