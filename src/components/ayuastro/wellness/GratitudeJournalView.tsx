'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAyuAstroStore } from '@/store/ayuastro-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Check,
  Flame,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { cosmicToast } from '@/lib/toast';
// ─── Types ──────────────────────────────────────────────────────────────────
interface GratitudeEntryData {
  id: string;
  slot: 'morning' | 'afternoon' | 'evening';
  content: string;
  createdAt: string;
}
interface GratitudeSummary {
  streakDays: number;
  totalEntries: number;
  mostCommonSlot: 'morning' | 'afternoon' | 'evening';
}
// ─── Constants ──────────────────────────────────────────────────────────────
const SLOTS = [
  { key: 'morning' as const, emoji: '🌅', label: 'Morning', time: 'Start your day with gratitude' },
  { key: 'afternoon' as const, emoji: '☀️', label: 'Afternoon', time: 'Pause and reflect mid-day' },
  { key: 'evening' as const, emoji: '🌙', label: 'Evening', time: 'Close your day with thanks' },
];
// 84 prompts — 7 per zodiac sign (12 signs × 7 = 84)
const GRATITUDE_PROMPTS: Record<string, string[]> = {
  Aries: [
    'What bold step did you take today that you\'re proud of?',
    'Who inspired your courage recently?',
    'What physical energy are you grateful for today?',
    'What challenge helped you grow stronger?',
    'What new beginning are you thankful for?',
    'Who pushed you to be your best self?',
    'What victory — big or small — are you celebrating today?',
  ],
  Taurus: [
    'What comfort in your life are you most grateful for?',
    'Which sensory experience brought you joy today?',
    'What stability in your life do you appreciate?',
    'What beautiful thing did you notice today?',
    'What resource or possession are you thankful for?',
    'Who provides you with a sense of security?',
    'What patience in yourself are you grateful for?',
  ],
  Gemini: [
    'What conversation enriched your mind today?',
    'What new idea sparked excitement in you?',
    'Who made you laugh or think differently today?',
    'What did you learn that you\'re grateful for?',
    'What connection — old or new — are you appreciating?',
    'What variety in your life brings you joy?',
    'What words — spoken or written — touched your heart today?',
  ],
  Cancer: [
    'Who made you feel emotionally safe today?',
    'What memory are you grateful to carry?',
    'What home comfort are you appreciating right now?',
    'Who nurtured you when you needed it?',
    'What emotional depth are you thankful for in yourself?',
    'What family bond are you cherishing today?',
    'What intuitive knowing guided you well recently?',
  ],
  Leo: [
    'What moment made you feel truly alive today?',
    'Who appreciated your unique light recently?',
    'What creative expression are you proud of?',
    'What act of generosity — given or received — touched you?',
    'What recognition or acknowledgment are you grateful for?',
    'What playful moment brought you pure joy?',
    'Who helped you shine brighter today?',
  ],
  Virgo: [
    'What small detail are you grateful someone noticed?',
    'What improvement in your life are you appreciating today?',
    'What act of service — yours or someone else\'s — made a difference?',
    'What routine brings you comfort and stability?',
    'What health practice are you thankful for?',
    'Who helped you feel more organized or grounded?',
    'What problem did you solve that you\'re proud of?',
  ],
  Libra: [
    'What harmony in your life are you grateful for?',
    'Who brought balance to your world today?',
    'What beauty — in any form — moved you recently?',
    'What partnership are you appreciating today?',
    'What fair outcome are you thankful for?',
    'What peaceful moment are you cherishing?',
    'Who helped you see both sides of a situation?',
  ],
  Scorpio: [
    'What transformation are you grateful for today?',
    'What emotional truth are you thankful you faced?',
    'Who trusted you with their vulnerability?',
    'What hidden strength did you discover in yourself?',
    'What ending led to a meaningful new beginning?',
    'What depth of connection are you appreciating?',
    'What power — used wisely — are you proud of?',
  ],
  Sagittarius: [
    'What adventure — big or small — are you grateful for?',
    'What truth did you discover that shifted your perspective?',
    'What freedom in your life do you appreciate today?',
    'Who expanded your horizons recently?',
    'What learning journey are you thankful to be on?',
    'What optimistic moment lifted your spirits?',
    'What philosophical insight brought you peace?',
  ],
  Capricorn: [
    'What achievement are you most grateful for today?',
    'Who supported your ambitions when it mattered?',
    'What discipline are you thankful you maintained?',
    'What mountain did you climb — literally or figuratively?',
    'What legacy-building effort are you proud of?',
    'What responsibility are you grateful to carry?',
    'What structure in your life brings you security?',
  ],
  Aquarius: [
    'What unique perspective are you grateful for today?',
    'Who accepted your authentic self without judgment?',
    'What vision for a better future inspires you?',
    'What community or cause are you thankful to be part of?',
    'What innovation or change are you appreciating?',
    'Who celebrated your individuality recently?',
    'What friendship expanded your worldview?',
  ],
  Pisces: [
    'What dream — waking or sleeping — inspired you today?',
    'Who showed you compassion when you needed it most?',
    'What creative or spiritual experience are you grateful for?',
    'What intuitive hit guided you well recently?',
    'What act of kindness — given or received — touched your soul?',
    'What moment of transcendence are you appreciating?',
    'What emotional release are you thankful for?',
  ],
};
// ─── Helpers ────────────────────────────────────────────────────────────────
function deterministicHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}
function getDailyPrompt(sunSign: string, slot: 'morning' | 'afternoon' | 'evening'): string {
  const today = new Date().toISOString().split('T')[0];
  const hash = deterministicHash(today + sunSign + slot);
  const pool = GRATITUDE_PROMPTS[sunSign] || GRATITUDE_PROMPTS['Capricorn'];
  return pool[hash % pool.length];
}
function formatTimelineDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
// ─── Animation Variants ────────────────────────────────────────────────────
const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};
const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};
const staggerItem = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};
// ─── Component ──────────────────────────────────────────────────────────────
export default function GratitudeJournalView() {
  const { userId, astrologyData, setView } = useAyuAstroStore();
  const sunSign = astrologyData?.sunSign || 'Capricorn';
  // Slot states
  const [slotContents, setSlotContents] = useState<Record<string, string>>({
    morning: '',
    afternoon: '',
    evening: '',
  });
  const [submittedSlots, setSubmittedSlots] = useState<Record<string, boolean>>({
    morning: false,
    afternoon: false,
    evening: false,
  });
  const [activeSlot, setActiveSlot] = useState<'morning' | 'afternoon' | 'evening'>('morning');
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Practice success animation
  const [practiceSuccess, setPracticeSuccess] = useState(false);
  // History state
  const [entries, setEntries] = useState<GratitudeEntryData[]>([]);
  const [summary, setSummary] = useState<GratitudeSummary>({
    streakDays: 0,
    totalEntries: 0,
    mostCommonSlot: 'morning',
  });
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  // Fetch gratitude history
  const fetchHistory = useCallback(async () => {
    if (!userId) {
      setIsLoadingHistory(false);
      return;
    }
    try {
      setIsLoadingHistory(true);
      const res = await fetch(`/api/gratitude/history?userId=${userId}&days=30`);
      const json = await res.json();
      if (json.success) {
        setEntries(json.data.entries);
        setSummary(json.data.summary);
        // Pre-fill today's entries
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayEntries = json.data.entries.filter((e: GratitudeEntryData) => {
          const d = new Date(e.createdAt);
          d.setHours(0, 0, 0, 0);
          return d.getTime() === today.getTime();
        });
        const newSlotContents = { morning: '', afternoon: '', evening: '' };
        const newSubmittedSlots = { morning: false, afternoon: false, evening: false };
        for (const entry of todayEntries) {
          newSlotContents[entry.slot] = entry.content;
          newSubmittedSlots[entry.slot] = true;
        }
        setSlotContents(newSlotContents);
        setSubmittedSlots(newSubmittedSlots);
      }
    } catch (err) {
      console.error('Failed to fetch gratitude history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [userId]);
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);
  // Handle content change
  const handleContentChange = (slot: 'morning' | 'afternoon' | 'evening', content: string) => {
    if (content.length <= 500) {
      setSlotContents((prev) => ({ ...prev, [slot]: content }));
    }
  };
  // Handle submit for a slot
  const handleSubmit = async (slot: 'morning' | 'afternoon' | 'evening') => {
    if (!userId || !slotContents[slot].trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/gratitude/entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          slot,
          content: slotContents[slot].trim(),
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSubmittedSlots((prev) => ({ ...prev, [slot]: true }));
        cosmicToast.success('Gratitude saved ✦', `Your ${slot} reflection has been recorded`);
        await fetchHistory();
        // Show "I Practiced Today" success animation
        setPracticeSuccess(true);
        setTimeout(() => setPracticeSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to submit gratitude entry:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  // Build past 7 days for mini-timeline
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    date.setHours(0, 0, 0, 0);
    const dayKey = date.toISOString().split('T')[0];
    const dayEntries = entries.filter((e) => {
      const d = new Date(e.createdAt);
      d.setHours(0, 0, 0, 0);
      return d.toISOString().split('T')[0] === dayKey;
    });
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return {
      dayName: dayNames[date.getDay()],
      date,
      entries: dayEntries,
      count: dayEntries.length,
      isToday: i === 6,
    };
  });
  // Check if all slots for today are done
  const allSlotsDone = submittedSlots.morning && submittedSlots.afternoon && submittedSlots.evening;
  return (
    <div className="bg-cream dark:bg-[#1a1410] px-4 py-6 pb-24 min-h-screen">
      <div className="mx-auto max-w-lg space-y-6">
        {/* Header */}
        <motion.div {...fadeInUp} transition={{ duration: 0.4 }} className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setView('mood')}
            className="size-10 rounded-full hover:bg-brown-50 dark:hover:bg-brown-800"
          >
            <ArrowLeft className="size-5 text-brown-700 dark:text-brown-500" />
          </Button>
          <div className="flex-1">
            <h1
              className="font-serif text-xl font-bold text-brown-900 dark:text-brown-600"
            >
              Gratitude Journal
            </h1>
            <p className="text-xs text-brown-400 dark:text-brown-500">Cultivate daily gratitude</p>
          </div>
          {/* Streak Counter */}
          {summary.streakDays > 0 && (
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gold/10 dark:bg-gold/15 border border-gold/20">
              <Flame className="size-4 text-gold" />
              <span className="text-sm font-bold text-gold-dark dark:text-gold">{summary.streakDays}</span>
            </div>
          )}
        </motion.div>
        {/* "I Practiced Today" Success Animation */}
        <AnimatePresence>
          {practiceSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -10 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="rounded-xl bg-gradient-to-r from-sage/20 to-gold/15 dark:from-sage/10 dark:to-gold/10 border border-sage/30 p-4 flex items-center gap-3"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-sage/20">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 500 }}
                >
                  <Check className="size-5 text-sage-dark dark:text-sage" />
                </motion.div>
              </div>
              <div>
                <p className="text-sm font-semibold text-sage-dark dark:text-sage">I Practiced Today!</p>
                <p className="text-xs text-brown-500 dark:text-brown-600">Your gratitude is shaping your world</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* ─── Section 1: Today I'm grateful for... ─────────────────── */}
        <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.05 }}>
          <Card className="border-0 shadow-md bg-white dark:bg-white/[0.08] overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-gold via-sage to-gold-dark" />
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-brown-900 dark:text-brown-600">
                <BookOpen className="size-5 text-gold" />
                Today I&apos;m grateful for...
              </CardTitle>
              <p className="text-xs text-brown-400 dark:text-brown-500 mt-1">
                {getDailyPrompt(sunSign, activeSlot)}
              </p>
            </CardHeader>
            <CardContent>
              {/* Slot Tabs */}
              <div className="flex gap-2 mb-4">
                {SLOTS.map((slot) => (
                  <button
                    key={slot.key}
                    onClick={() => setActiveSlot(slot.key)}
                    className={`flex-1 flex flex-col items-center gap-1 p-2.5 rounded-xl transition-all duration-200 border ${
                      activeSlot === slot.key
                        ? 'bg-gold/10 dark:bg-gold/15 border-gold/30 shadow-sm'
                        : 'bg-transparent border-brown-100 dark:border-brown-100/20 hover:border-gold/20'
                    }`}
                  >
                    <span className="text-xl">{slot.emoji}</span>
                    <span className={`text-[10px] font-medium ${
                      activeSlot === slot.key
                        ? 'text-gold-dark dark:text-gold'
                        : 'text-brown-400 dark:text-brown-500'
                    }`}>
                      {slot.label}
                    </span>
                    {submittedSlots[slot.key] && (
                      <Check className="size-3 text-sage-dark dark:text-sage" />
                    )}
                  </button>
                ))}
              </div>
              {/* Active Slot Content */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{SLOTS.find(s => s.key === activeSlot)?.emoji}</span>
                  <span className="text-sm font-medium text-brown-700 dark:text-brown-500">
                    {SLOTS.find(s => s.key === activeSlot)?.label} Gratitude
                  </span>
                  <span className="text-xs text-brown-300 dark:text-brown-600 ml-auto">
                    {slotContents[activeSlot].length}/500
                  </span>
                </div>
                {submittedSlots[activeSlot] ? (
                  <div className="rounded-xl bg-cream dark:bg-brown-50/10 border border-sage/20 p-4">
                    <p className="text-sm text-brown-700 dark:text-brown-500 leading-relaxed italic">
                      &ldquo;{slotContents[activeSlot]}&rdquo;
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      <Check className="size-3 text-sage-dark dark:text-sage" />
                      <span className="text-[10px] text-sage-dark dark:text-sage font-medium">Saved</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <Textarea
                      placeholder={`What are you grateful for this ${activeSlot}...`}
                      value={slotContents[activeSlot]}
                      onChange={(e) => handleContentChange(activeSlot, e.target.value)}
                      className="border-brown-200 dark:border-brown-100/20 bg-cream dark:bg-brown-50/10 text-brown-900 dark:text-brown-600 placeholder:text-brown-300 dark:placeholder:text-brown-600 resize-none focus-visible:ring-gold/30"
                      rows={4}
                    />
                    <Button
                      onClick={() => handleSubmit(activeSlot)}
                      disabled={!slotContents[activeSlot].trim() || isSubmitting}
                      className="w-full bg-gold hover:bg-gold-dark text-white font-semibold disabled:opacity-40"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Saving...
                        </span>
                      ) : (
                        <>
                          <Check className="mr-2 size-4" />
                          Save {SLOTS.find(s => s.key === activeSlot)?.label} Gratitude
                        </>
                      )}
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
        {/* ─── Section 2: All Slots Summary ──────────────────────────── */}
        <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.1 }}>
          <Card className="border-0 shadow-md bg-white dark:bg-white/[0.08] overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-sage via-gold/50 to-sage" />
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-brown-900 dark:text-brown-600">
                <Sparkles className="size-5 text-gold" />
                Today&apos;s Gratitude Flow
              </CardTitle>
            </CardHeader>
            <CardContent>
              {allSlotsDone ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  className="text-center py-4"
                >
                  <div className="flex justify-center gap-3 mb-3">
                    <span className="text-3xl">🌅</span>
                    <span className="text-3xl">☀️</span>
                    <span className="text-3xl">🌙</span>
                  </div>
                  <p
                    className="font-serif text-base font-bold text-sage-dark dark:text-sage"
                  >
                    Complete Gratitude Day!
                  </p>
                  <p className="text-xs text-brown-400 dark:text-brown-500 mt-1">
                    You&apos;ve filled all three gratitude slots today
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-3">
                  {SLOTS.map((slot) => (
                    <div
                      key={slot.key}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                        submittedSlots[slot.key]
                          ? 'bg-sage/5 dark:bg-sage/10 border-sage/20'
                          : 'bg-cream dark:bg-brown-50/5 border-brown-100 dark:border-brown-100/10'
                      }`}
                    >
                      <span className="text-xl">{slot.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-brown-900 dark:text-brown-600">
                          {slot.label}
                        </p>
                        <p className="text-[10px] text-brown-400 dark:text-brown-500 truncate">
                          {submittedSlots[slot.key] ? slotContents[slot.key] : slot.time}
                        </p>
                      </div>
                      {submittedSlots[slot.key] ? (
                        <Badge className="bg-sage/15 text-sage-dark dark:bg-sage/20 dark:text-sage border-0 text-[10px] px-2">
                          <Check className="size-3 mr-0.5" /> Done
                        </Badge>
                      ) : (
                        <Badge className="bg-brown-50 dark:bg-brown-50/20 text-brown-400 dark:text-brown-500 border-0 text-[10px] px-2">
                          Pending
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
        {/* ─── Section 3: Streak & Stats ─────────────────────────────── */}
        <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.15 }}>
          <Card className="border-0 shadow-md bg-white dark:bg-white/[0.08]">
            <CardContent className="p-5">
              <div className="grid grid-cols-3 gap-4">
                {/* Streak */}
                <div className="flex flex-col items-center justify-center">
                  <div className="flex items-center gap-1">
                    <Flame className="size-5 text-gold" />
                    <span
                      className="font-serif text-2xl font-bold text-brown-900 dark:text-brown-600"
                    >
                      {summary.streakDays}
                    </span>
                  </div>
                  <span className="text-[10px] text-brown-400 dark:text-brown-500 mt-1">Day Streak</span>
                </div>
                {/* Total Entries */}
                <div className="flex flex-col items-center justify-center">
                  <span
                    className="font-serif text-2xl font-bold text-brown-900 dark:text-brown-600"
                  >
                    {summary.totalEntries}
                  </span>
                  <span className="text-[10px] text-brown-400 dark:text-brown-500 mt-1">Total Entries</span>
                </div>
                {/* Most Common Slot */}
                <div className="flex flex-col items-center justify-center">
                  <span className="text-2xl">
                    {summary.mostCommonSlot === 'morning' ? '🌅' : summary.mostCommonSlot === 'afternoon' ? '☀️' : '🌙'}
                  </span>
                  <span className="text-[10px] text-brown-400 dark:text-brown-500 mt-1 capitalize">{summary.mostCommonSlot}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        {/* ─── Section 4: Gratitude History (Past 7 Days Mini-Timeline) ─ */}
        <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.2 }}>
          <Card className="border-0 shadow-md bg-white dark:bg-white/[0.08]">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-brown-900 dark:text-brown-600">
                <BookOpen className="size-5 text-gold" />
                Gratitude History
              </CardTitle>
              <p className="text-xs text-brown-400 dark:text-brown-500">Past 7 days</p>
            </CardHeader>
            <CardContent>
              {isLoadingHistory ? (
                <div className="flex justify-around items-end h-20">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div className="w-8 h-10 bg-brown-100 dark:bg-brown-50/20 rounded animate-pulse" />
                      <span className="text-[10px] text-brown-300">—</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {last7Days.map((day, i) => (
                    <motion.div
                      key={i}
                      variants={staggerItem}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                        day.isToday
                          ? 'bg-gold/5 dark:bg-gold/10 border-gold/20'
                          : 'bg-cream dark:bg-brown-50/5 border-brown-100 dark:border-brown-100/10'
                      }`}
                    >
                      {/* Day Label */}
                      <div className="w-10 shrink-0 text-center">
                        <p className={`text-xs font-semibold ${
                          day.isToday
                            ? 'text-gold-dark dark:text-gold'
                            : 'text-brown-500 dark:text-brown-600'
                        }`}>
                          {day.dayName}
                        </p>
                      </div>
                      {/* Timeline Connector */}
                      <div className="flex flex-col items-center gap-0.5 shrink-0">
                        <div className={`size-3 rounded-full ${
                          day.count === 3
                            ? 'bg-sage'
                            : day.count > 0
                            ? 'bg-gold'
                            : 'bg-brown-200 dark:bg-brown-50/30'
                        }`} />
                        {i < 6 && (
                          <div className="w-0.5 h-4 bg-brown-100 dark:bg-brown-100/20" />
                        )}
                      </div>
                      {/* Slots Filled */}
                      <div className="flex-1 flex items-center gap-2">
                        {SLOTS.map((slot) => {
                          const hasEntry = day.entries.some((e) => e.slot === slot.key);
                          return (
                            <span
                              key={slot.key}
                              className={`text-sm ${
                                hasEntry ? 'opacity-100' : 'opacity-30'
                              }`}
                            >
                              {slot.emoji}
                            </span>
                          );
                        })}
                        <span className="text-[10px] text-brown-400 dark:text-brown-500 ml-auto">
                          {day.count}/3
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
        {/* Decorative section divider */}
        <Separator className="bg-brown-100 dark:bg-brown-100/20" />
        {/* Insights message */}
        {summary.totalEntries > 0 && (
          <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.25 }}>
            <div className="rounded-xl bg-gradient-to-br from-gold/5 to-sage-muted/10 dark:from-gold/5 dark:to-sage-muted/5 border border-gold/10 p-4">
              <p className="text-xs font-semibold text-gold-dark dark:text-gold mb-1 flex items-center gap-1">
                <Sparkles className="size-3" />
                Gratitude Insight
              </p>
              <p className="text-xs text-brown-600 dark:text-brown-500 leading-relaxed">
                {summary.streakDays >= 7
                  ? 'Amazing! A week-long gratitude streak. Your mind is rewiring itself for positivity and abundance.'
                  : summary.streakDays >= 3
                  ? 'Three days of gratitude! Research shows this is when the brain starts forming new positive neural pathways.'
                  : 'Every gratitude entry rewires your brain for positivity. Keep going — even small moments of thanks create big changes.'}
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
