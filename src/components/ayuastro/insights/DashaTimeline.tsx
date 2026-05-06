'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, ChevronLeft, ChevronRight } from 'lucide-react';

export interface DashaPeriod {
  planet: string;
  startDate: string;
  endDate: string;
  years: number;
  isCurrent: boolean;
}

const PLANET_COLORS: Record<string, { bg: string; text: string; border: string; darkBg: string }> = {
  Sun:     { bg: 'bg-amber-100',     text: 'text-amber-800',     border: 'border-amber-400',     darkBg: 'dark:bg-amber-900/30' },
  Moon:    { bg: 'bg-slate-100',      text: 'text-slate-700',     border: 'border-slate-300',     darkBg: 'dark:bg-slate-800/30' },
  Mars:    { bg: 'bg-red-100',        text: 'text-red-800',       border: 'border-red-400',       darkBg: 'dark:bg-red-900/30' },
  Mercury: { bg: 'bg-emerald-100',    text: 'text-emerald-800',   border: 'border-emerald-400',   darkBg: 'dark:bg-emerald-900/30' },
  Jupiter: { bg: 'bg-amber-50',       text: 'text-amber-900',     border: 'border-amber-500',     darkBg: 'dark:bg-amber-900/40' },
  Venus:   { bg: 'bg-pink-100',       text: 'text-pink-800',      border: 'border-pink-400',      darkBg: 'dark:bg-pink-900/30' },
  Saturn:  { bg: 'bg-yellow-900/10',  text: 'text-yellow-900',    border: 'border-yellow-800',    darkBg: 'dark:bg-yellow-900/30' },
  Rahu:    { bg: 'bg-purple-100',     text: 'text-purple-800',    border: 'border-purple-400',    darkBg: 'dark:bg-purple-900/30' },
  Ketu:    { bg: 'bg-teal-100',       text: 'text-teal-800',      border: 'border-teal-400',      darkBg: 'dark:bg-teal-900/30' },
};

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mars: '♂', Mercury: '☿', Jupiter: '♃', Venus: '♀', Saturn: '♄', Rahu: '☊', Ketu: '☋',
};

// Vimshottari Dasha years for each planet
const DASHA_YEARS: Record<string, number> = {
  Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7, Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17,
};

// Order of Mahadashas in Vimshottari system
const DASHA_ORDER = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];

/**
 * Generate simplified Mahadasha periods from birth date.
 * Uses a deterministic approach: starts from Ketu at birth and cycles through.
 * In reality, the starting planet depends on the Moon's nakshatra, but we use
 * a simplified approach based on the birth date for this visualization.
 */
export function generateDashaPeriods(birthDate: string): DashaPeriod[] {
  const birth = new Date(birthDate);
  // Use birth date to deterministically pick a starting index
  // (In real Jyotish, this is determined by the Moon's nakshatra lord)
  const dayOfYear = Math.floor(
    (birth.getTime() - new Date(birth.getFullYear(), 0, 0).getTime()) / 86400000
  );
  const startIndex = dayOfYear % 9;

  // Reorder DASHA_ORDER starting from startIndex
  const orderedPlanets = [
    ...DASHA_ORDER.slice(startIndex),
    ...DASHA_ORDER.slice(0, startIndex),
  ];

  const now = new Date();
  const periods: DashaPeriod[] = [];
  let currentDate = new Date(birth);

  for (const planet of orderedPlanets) {
    const years = DASHA_YEARS[planet];
    const startDate = new Date(currentDate);
    const endDate = new Date(currentDate);
    endDate.setFullYear(endDate.getFullYear() + years);

    const isCurrent = now >= startDate && now < endDate;

    periods.push({
      planet,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      years,
      isCurrent,
    });

    currentDate = new Date(endDate);
  }

  return periods;
}

interface DashaTimelineProps {
  dashaPeriods: DashaPeriod[];
}

export default function DashaTimeline({ dashaPeriods }: DashaTimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const totalYears = dashaPeriods.reduce((sum, d) => sum + d.years, 0);

  const checkScrollability = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  }, []);

  useEffect(() => {
    // Scroll to current Dasha on mount
    if (currentRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const currentEl = currentRef.current;
      const offsetLeft = currentEl.offsetLeft - container.clientWidth / 2 + currentEl.clientWidth / 2;
      container.scrollTo({ left: Math.max(0, offsetLeft), behavior: 'smooth' });
    }
    checkScrollability();
  }, [checkScrollability]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkScrollability);
    return () => el.removeEventListener('scroll', checkScrollability);
  }, [checkScrollability]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.6;
    scrollRef.current.scrollBy({
      left: direction === 'right' ? scrollAmount : -scrollAmount,
      behavior: 'smooth',
    });
  };

  const currentDasha = dashaPeriods.find((d) => d.isCurrent);

  return (
    <Card className="border-0 shadow-sm bg-white dark:bg-white/5 dark:border dark:border-brown-700/30 overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-purple-400 via-gold to-teal-400" />
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-base font-semibold text-brown-900 dark:text-cream">
            <Clock className="size-5 text-gold" />
            Vimshottari Dasha Timeline
          </span>
          {currentDasha && (
            <Badge className="bg-gold/10 text-gold-dark dark:text-gold border-0 text-[10px] px-2.5 py-0.5 tracking-wider uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
              Current: {currentDasha.planet}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Scroll buttons */}
          {canScrollLeft && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 flex size-8 items-center justify-center rounded-full bg-white/90 dark:bg-brown-800/90 shadow-md border border-brown-100 dark:border-brown-600 hover:bg-cream dark:hover:bg-brown-700 transition-colors"
              aria-label="Scroll timeline left"
            >
              <ChevronLeft className="size-4 text-brown-600 dark:text-brown-300" />
            </button>
          )}
          {canScrollRight && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 flex size-8 items-center justify-center rounded-full bg-white/90 dark:bg-brown-800/90 shadow-md border border-brown-100 dark:border-brown-600 hover:bg-cream dark:hover:bg-brown-700 transition-colors"
              aria-label="Scroll timeline right"
            >
              <ChevronRight className="size-4 text-brown-600 dark:text-brown-300" />
            </button>
          )}

          {/* Timeline scroll container */}
          <div
            ref={scrollRef}
            className="overflow-x-auto scrollbar-thin pb-2"
            style={{ scrollbarWidth: 'thin' }}
          >
            <div className="flex items-end gap-0 min-w-max px-4 pt-8 pb-2 relative">
              {/* Central timeline line */}
              <div className="absolute bottom-4 left-4 right-4 h-0.5 bg-brown-200 dark:bg-brown-600" />

              {dashaPeriods.map((period, i) => {
                const colors = PLANET_COLORS[period.planet] || PLANET_COLORS.Mercury;
                const symbol = PLANET_SYMBOLS[period.planet] || '?';
                const widthPercent = (period.years / totalYears) * 100;
                // Scale width: minimum 60px per year, ensure readability
                const widthPx = Math.max(80, period.years * 8);

                const startDate = new Date(period.startDate);
                const endDate = new Date(period.endDate);

                return (
                  <motion.div
                    key={i}
                    ref={period.isCurrent ? currentRef : undefined}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    className="relative flex flex-col items-center"
                    style={{ width: `${widthPx}px` }}
                  >
                    {/* Current Phase indicator arrow */}
                    {period.isCurrent && (
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 flex flex-col items-center">
                        <span className="text-[9px] font-bold text-gold-dark dark:text-gold uppercase tracking-wider whitespace-nowrap">
                          Current Phase
                        </span>
                        <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent border-t-gold dark:border-t-gold" />
                      </div>
                    )}

                    {/* Planet block */}
                    <div
                      className={`relative w-full rounded-lg border-2 ${
                        period.isCurrent
                          ? `${colors.darkBg} ${colors.bg} border-gold shadow-lg shadow-gold/20 ring-2 ring-gold/30`
                          : `${colors.darkBg} ${colors.bg} ${colors.border}`
                      } transition-all`}
                    >
                      <div className="p-2 text-center">
                        {/* Symbol */}
                        <span className={`text-xl leading-none ${colors.text} dark:text-white/90`}>
                          {symbol}
                        </span>
                        {/* Planet name */}
                        <p className={`text-[11px] font-bold mt-0.5 ${colors.text} dark:text-white/80`}>
                          {period.planet}
                        </p>
                        {/* Duration */}
                        <p className="text-[9px] text-brown-400 dark:text-brown-400">
                          {period.years}y
                        </p>
                      </div>
                    </div>

                    {/* Year labels below timeline */}
                    <div className="mt-2 text-center">
                      <p className="text-[9px] text-brown-400 dark:text-brown-400 font-medium">
                        {startDate.getFullYear()}
                      </p>
                      {i === dashaPeriods.length - 1 && (
                        <p className="text-[9px] text-brown-300 dark:text-brown-500">
                          {endDate.getFullYear()}
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-3 pt-3 border-t border-brown-100 dark:border-brown-700/40">
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[9px] text-brown-400 dark:text-brown-400">
            {dashaPeriods.map((period, i) => {
              const colors = PLANET_COLORS[period.planet] || PLANET_COLORS.Mercury;
              return (
                <span key={i} className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${colors.bg} ${colors.border} border`} />
                  {period.planet} ({period.years}y)
                </span>
              );
            })}
          </div>
          <p className="text-[9px] text-brown-300 dark:text-brown-500 mt-2">
            The 120-year Vimshottari cycle shows major planetary periods influencing your life phases.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
