'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAyuAstroStore } from '@/store/ayuastro-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  ChevronDown,
  Sparkles,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';
interface CosmicEvent {
  date: string;
  title: string;
  type: 'retrograde' | 'eclipse' | 'transit' | 'moonPhase' | 'specialYoga';
  description: string;
  emotionalImpact: number;
  emoji: string;
  guidance: string;
}
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const MONTH_THEMES: Record<number, { theme: string; description: string }> = {
  1: { theme: 'Foundations & Intentions', description: 'The year begins with Saturnian discipline. Set structures that will hold your growth all year.' },
  2: { theme: 'Inner Awakening', description: 'Aquarius season brings collective vision. Your unique contribution to the world becomes clearer.' },
  3: { theme: 'Transformation & Renewal', description: 'Eclipse season stirs the pot. Old patterns dissolve; brave new paths emerge from the shadows.' },
  4: { theme: 'Action & Courage', description: 'Aries fire ignites fresh beginnings. Trust your impulse toward what excites you most.' },
  5: { theme: 'Grounding & Growth', description: 'Taurus energy stabilizes. Jupiter\'s expansion meets earthly patience — build with intention.' },
  6: { theme: 'Communication & Curiosity', description: 'Gemini season sparks mental agility. Mercury\'s dance amplifies both insight and confusion.' },
  7: { theme: 'Emotional Depth', description: 'Cancer season turns us inward. Venus retrograde asks: what do you truly value in love?' },
  8: { theme: 'Creative Power', description: 'Leo season radiates confidence. Express your truth boldly, even if your voice shakes.' },
  9: { theme: 'Service & Healing', description: 'Eclipse season returns. Virgo precision meets cosmic release — healing happens in the details.' },
  10: { theme: 'Balance & Partnership', description: 'Libra season seeks harmony. Relationships become mirrors for your deepest growth edges.' },
  11: { theme: 'Depth & Truth', description: 'Scorpio strips away the superficial. Mercury retrograde asks you to revisit what matters most.' },
  12: { theme: 'Wisdom & Expansion', description: 'Sagittarius season closes the year with philosophical fire. Integrate lessons and dream bigger.' },
};
const TYPE_BADGE_STYLES: Record<string, string> = {
  retrograde: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  eclipse: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  transit: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  moonPhase: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  specialYoga: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
};
const TYPE_LABELS: Record<string, string> = {
  retrograde: 'Retrograde',
  eclipse: 'Eclipse',
  transit: 'Transit',
  moonPhase: 'Moon Phase',
  specialYoga: 'Special Yoga',
};
const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};
export default function CosmicCalendarView() {
  const { setView } = useAyuAstroStore();
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [events, setEvents] = useState<CosmicEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedEvents, setExpandedEvents] = useState<Record<string, boolean>>({});
  const fetchEvents = useCallback(async (month: number, year: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/calendar/events?month=${month}&year=${year}`);
      if (!res.ok) throw new Error('Failed to fetch events');
      const data = await res.json();
      setEvents(data.events || []);
    } catch {
      setError('Unable to load cosmic events. Please try again.');
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  }, []);
  useEffect(() => {
    fetchEvents(currentMonth, currentYear);
  }, [currentMonth, currentYear, fetchEvents]);
  const goToPrevMonth = () => {
    if (currentMonth === 1) {
      if (currentYear <= 2025) return;
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };
  const goToNextMonth = () => {
    if (currentMonth === 12) {
      if (currentYear >= 2026) return;
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };
  const goToToday = () => {
    const n = new Date();
    setCurrentMonth(n.getMonth() + 1);
    setCurrentYear(n.getFullYear());
  };
  const toggleEvent = (date: string) => {
    setExpandedEvents((prev) => ({ ...prev, [date]: !prev[date] }));
  };
  // Compute monthly stats
  const avgImpact = events.length > 0
    ? Math.round((events.reduce((sum, e) => sum + e.emotionalImpact, 0) / events.length) * 10) / 10
    : 0;
  const topEvents = [...events].sort((a, b) => b.emotionalImpact - a.emotionalImpact).slice(0, 3);
  // Next 7 days events
  const todayStr = now.toISOString().slice(0, 10);
  const sevenDaysLater = new Date(now);
  sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
  const sevenDaysLaterStr = sevenDaysLater.toISOString().slice(0, 10);
  const upcomingEvents = events.filter((e) => e.date >= todayStr && e.date <= sevenDaysLaterStr);
  const monthTheme = MONTH_THEMES[currentMonth] || MONTH_THEMES[1];
  const formatDateBadge = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    const day = d.getDate();
    const monthAbbr = MONTH_NAMES[d.getMonth()].slice(0, 3);
    return { day, monthAbbr };
  };
  const isToday = (dateStr: string) => dateStr === todayStr;
  const isCurrentMonth = currentMonth === now.getMonth() + 1 && currentYear === now.getFullYear();
  return (
    <div className="min-h-screen bg-cream pb-24">
      {/* Header */}
      <motion.div
        {...fadeInUp}
        transition={{ duration: 0.4 }}
        className="sticky top-0 z-10 bg-cream/80 dark:bg-[#1a1410]/80 backdrop-blur-md border-b border-brown-100/50 dark:border-brown-700/30"
      >
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setView('insights')}
              className="text-brown-400 hover:text-brown-700 dark:text-brown-500 dark:hover:text-brown-100 -ml-2"
            >
              <ArrowLeft className="size-4 mr-1" />
              Back
            </Button>
            {(!isCurrentMonth) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={goToToday}
                className="text-gold-dark hover:text-gold dark:text-gold dark:hover:text-gold-light text-xs"
              >
                <Calendar className="size-3.5 mr-1" />
                Today
              </Button>
            )}
          </div>
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={goToPrevMonth}
              disabled={currentYear <= 2025 && currentMonth <= 1}
              className="size-9 text-brown-400 hover:text-brown-700 dark:text-brown-500 dark:hover:text-brown-100 disabled:opacity-30"
            >
              <ChevronLeft className="size-5" />
            </Button>
            <div className="text-center">
              <h1
                className="font-serif text-2xl font-bold text-brown-900 dark:text-brown-600"
              >
                {MONTH_NAMES[currentMonth - 1]}
              </h1>
              <p className="text-sm text-brown-400 dark:text-brown-600">{currentYear}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={goToNextMonth}
              disabled={currentYear >= 2026 && currentMonth >= 12}
              className="size-9 text-brown-400 hover:text-brown-700 dark:text-brown-500 dark:hover:text-brown-100 disabled:opacity-30"
            >
              <ChevronRight className="size-5" />
            </Button>
          </div>
        </div>
      </motion.div>
      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Monthly Overview Card */}
        <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.05 }}>
          <Card className="border-0 shadow-md bg-white dark:bg-white/[0.08] overflow-hidden card-hover">
            <div className="h-1 bg-gradient-to-r from-gold via-purple-400 to-sage" />
            <CardContent className="p-5">
              <div className="flex items-start gap-3 mb-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-gold/20 to-purple-100 dark:from-gold/10 dark:to-purple-900/30">
                  <Sparkles className="size-5 text-gold-dark dark:text-gold" />
                </div>
                <div className="flex-1">
                  <h3
                    className="font-serif text-lg font-bold text-brown-900 dark:text-brown-600"
                  >
                    {monthTheme.theme}
                  </h3>
                  <p className="text-sm text-brown-400 dark:text-brown-600 mt-0.5">
                    {monthTheme.description}
                  </p>
                </div>
              </div>
              {/* Top 3 events */}
              {topEvents.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-[10px] uppercase tracking-wider text-brown-400 dark:text-brown-600 font-medium">
                    Key Events This Month
                  </p>
                  {topEvents.map((event, i) => (
                    <div
                      key={event.date + event.title}
                      className="flex items-center gap-2 bg-gold/5 dark:bg-gold/10 rounded-lg px-3 py-2"
                    >
                      <span className="text-sm">{event.emoji}</span>
                      <span className="text-sm font-medium text-brown-900 dark:text-brown-600 flex-1 truncate">
                        {event.title}
                      </span>
                      <Badge className="bg-gold/15 text-gold-dark dark:bg-gold/20 dark:text-gold border-0 text-[10px] px-2 py-0">
                        ★ Top {i + 1}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
              {/* Emotional Intensity Meter */}
              {events.length > 0 && (
                <div className="mt-4 flex items-center gap-3">
                  <span className="text-[10px] uppercase tracking-wider text-brown-400 dark:text-brown-600 font-medium shrink-0">
                    Emotional Intensity
                  </span>
                  <div className="flex-1 h-2 bg-brown-100 dark:bg-brown-700/30 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(avgImpact / 5) * 100}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="h-full rounded-full bg-gradient-to-r from-sage via-gold to-amber-500"
                    />
                  </div>
                  <span className="text-sm font-semibold text-brown-700 dark:text-brown-400 shrink-0">
                    {avgImpact}/5
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
        {/* Event List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="border-0 shadow-md bg-white dark:bg-white/[0.08]">
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <div className="w-14 h-14 rounded-xl bg-brown-50 dark:bg-brown-700/20 animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/4 bg-brown-50 dark:bg-brown-700/20 rounded animate-pulse" />
                      <div className="h-3 w-1/2 bg-brown-50 dark:bg-brown-700/20 rounded animate-pulse" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.1 }}>
            <Card className="border-0 shadow-md bg-white dark:bg-white/[0.08]">
              <CardContent className="p-6 text-center">
                <AlertCircle className="size-8 text-brown-300 mx-auto mb-2" />
                <p className="text-sm text-brown-400 dark:text-brown-600">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchEvents(currentMonth, currentYear)}
                  className="mt-3 border-gold/30 text-gold-dark hover:bg-gold/5"
                >
                  Try Again
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : events.length === 0 ? (
          <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.1 }}>
            <Card className="border-0 shadow-md bg-white dark:bg-white/[0.08]">
              <CardContent className="p-6 text-center">
                <Calendar className="size-8 text-brown-300 mx-auto mb-2" />
                <p className="text-sm text-brown-400 dark:text-brown-600">
                  No cosmic events found for this month.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {events.map((event, index) => {
                const { day, monthAbbr } = formatDateBadge(event.date);
                const today = isToday(event.date);
                const expanded = expandedEvents[event.date] || false;
                return (
                  <motion.div
                    key={event.date + event.title}
                    {...fadeInUp}
                    transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.3) }}
                  >
                    <Card
                      className={`border-0 shadow-md bg-white dark:bg-white/[0.08] overflow-hidden card-hover transition-all ${
                        today ? 'ring-2 ring-gold/50 dark:ring-gold/30' : ''
                      }`}
                    >
                      <Collapsible open={expanded} onOpenChange={() => toggleEvent(event.date)}>
                        <CollapsibleTrigger asChild>
                          <button className="w-full text-left">
                            <CardContent className="p-4">
                              <div className="flex gap-3">
                                {/* Date Badge */}
                                <div
                                  className={`w-14 shrink-0 flex flex-col items-center justify-center rounded-xl py-2 ${
                                    today
                                      ? 'bg-gold/15 dark:bg-gold/20'
                                      : 'bg-brown-50 dark:bg-brown-700/20'
                                  }`}
                                >
                                  <span
                                    className={`text-lg font-bold leading-tight ${
                                      today
                                        ? 'text-gold-dark dark:text-gold'
                                        : 'text-brown-700 dark:text-brown-400'
                                    }`}
                                  >
                                    {day}
                                  </span>
                                  <span
                                    className={`text-[10px] uppercase tracking-wider ${
                                      today
                                        ? 'text-gold-dark/70 dark:text-gold/70'
                                        : 'text-brown-400 dark:text-brown-600'
                                    }`}
                                  >
                                    {monthAbbr}
                                  </span>
                                </div>
                                {/* Event Details */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-base">{event.emoji}</span>
                                    <span
                                      className="text-sm font-semibold text-brown-900 dark:text-brown-600 truncate"
                                    >
                                      {event.title}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 mb-1.5">
                                    <Badge
                                      className={`${TYPE_BADGE_STYLES[event.type]} border-0 text-[10px] px-2 py-0`}
                                    >
                                      {TYPE_LABELS[event.type]}
                                    </Badge>
                                    {today && (
                                      <Badge className="bg-gold/15 text-gold-dark dark:bg-gold/20 dark:text-gold border-0 text-[10px] px-2 py-0">
                                        Today
                                      </Badge>
                                    )}
                                  </div>
                                  {/* Emotional Impact Dots */}
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] text-brown-400 dark:text-brown-600 shrink-0">
                                      Impact:
                                    </span>
                                    <div className="flex gap-0.5">
                                      {[1, 2, 3, 4, 5].map((level) => (
                                        <div
                                          key={level}
                                          className={`size-2 rounded-full transition-colors ${
                                            level <= event.emotionalImpact
                                              ? 'bg-gold-dark dark:bg-gold'
                                              : 'bg-brown-100 dark:bg-brown-700/30'
                                          }`}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                  {/* Guidance text */}
                                  <p className="text-xs text-brown-500 dark:text-brown-500 mt-1.5 line-clamp-2">
                                    {event.guidance}
                                  </p>
                                </div>
                                {/* Expand indicator */}
                                <div className="flex items-center self-center shrink-0">
                                  <ChevronDown
                                    className={`size-4 text-brown-300 dark:text-brown-600 transition-transform ${
                                      expanded ? 'rotate-180' : ''
                                    }`}
                                  />
                                </div>
                              </div>
                            </CardContent>
                          </button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="px-4 pb-4 pt-0">
                            <div className="ml-[68px] space-y-2 border-t border-brown-100 dark:border-brown-700/30 pt-3">
                              <div className="rounded-lg bg-brown-50 dark:bg-brown-800/20 p-3">
                                <p className="text-[10px] uppercase tracking-wider text-brown-400 dark:text-brown-600 mb-1">
                                  About This Event
                                </p>
                                <p className="text-sm text-brown-700 dark:text-brown-500 leading-relaxed">
                                  {event.description}
                                </p>
                              </div>
                              <div className="rounded-lg bg-gold/5 dark:bg-gold/10 p-3">
                                <p className="text-[10px] uppercase tracking-wider text-gold-dark dark:text-gold mb-1">
                                  Cosmic Guidance
                                </p>
                                <p className="text-sm text-brown-700 dark:text-brown-500 leading-relaxed">
                                  {event.guidance}
                                </p>
                              </div>
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
        {/* Upcoming Highlights - Next 7 Days */}
        {upcomingEvents.length > 0 && (
          <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.2 }}>
            <Card className="border-0 shadow-md bg-white dark:bg-white/[0.08] overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-sage via-gold to-amber-400" />
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="size-4 text-gold-dark dark:text-gold" />
                  <h3
                    className="font-serif text-base font-bold text-brown-900 dark:text-brown-600"
                  >
                    Next 7 Days
                  </h3>
                </div>
                <div className="space-y-2">
                  {upcomingEvents.map((event) => {
                    const { day, monthAbbr } = formatDateBadge(event.date);
                    return (
                      <div
                        key={event.date + event.title}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                          isToday(event.date)
                            ? 'bg-gold/10 dark:bg-gold/15 border border-gold/20 dark:border-gold/20'
                            : 'bg-brown-50 dark:bg-brown-700/15'
                        }`}
                      >
                        <span className="text-lg">{event.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-brown-900 dark:text-brown-600 truncate">
                            {event.title}
                          </p>
                          <p className="text-[10px] text-brown-400 dark:text-brown-600">
                            {monthAbbr} {day} · Impact: {event.emotionalImpact}/5
                          </p>
                        </div>
                        <Badge
                          className={`${TYPE_BADGE_STYLES[event.type]} border-0 text-[9px] px-1.5 py-0 shrink-0`}
                        >
                          {TYPE_LABELS[event.type]}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
        {/* Show "Today" button inline if not on current month */}
        {!isCurrentMonth && (
          <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.25 }} className="text-center">
            <Button
              variant="outline"
              onClick={goToToday}
              className="border-gold/30 text-gold-dark hover:bg-gold/5 dark:text-gold dark:border-gold/20 dark:hover:bg-gold/10"
            >
              <Calendar className="size-4 mr-2" />
              Jump to Current Month
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
