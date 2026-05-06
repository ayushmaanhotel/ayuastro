'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAyuAstroStore } from '@/store/ayuastro-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  ArrowLeft,
  ChevronDown,
  Heart,
  Sparkles,
  Flame,
  BookOpen,
  TrendingUp,
} from 'lucide-react';
import { cosmicToast } from '@/lib/toast';

// ─── Types ──────────────────────────────────────────────────────────────────

interface MoodEntryData {
  id: string;
  mood: number;
  emoji: string;
  note: string | null;
  tags: string[];
  createdAt: string;
}

interface MoodSummary {
  averageMood: number;
  mostCommonEmoji: string;
  streakDays: number;
  totalEntries: number;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const MOOD_OPTIONS = [
  { mood: 1, emoji: '😔', label: 'Very Low' },
  { mood: 2, emoji: '😐', label: 'Low' },
  { mood: 3, emoji: '😌', label: 'Okay' },
  { mood: 4, emoji: '😊', label: 'Good' },
  { mood: 5, emoji: '🤩', label: 'Excellent' },
] as const;

const TAG_OPTIONS = [
  'grateful',
  'peaceful',
  'anxious',
  'energetic',
  'reflective',
  'sad',
  'happy',
  'confused',
  'inspired',
  'tired',
] as const;

const MOOD_COLORS: Record<number, string> = {
  1: 'bg-red-400',
  2: 'bg-orange-400',
  3: 'bg-yellow-400',
  4: 'bg-green-300',
  5: 'bg-sage',
};

const MOOD_BAR_HEIGHTS: Record<number, string> = {
  1: 'h-4',
  2: 'h-8',
  3: 'h-12',
  4: 'h-16',
  5: 'h-20',
};

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

// ─── Helper Functions ───────────────────────────────────────────────────────

function getInsightMessage(avg: number): string {
  if (avg > 4) return "You're in a beautiful emotional flow. Keep nurturing what's working.";
  if (avg >= 3) return "You're finding balance. Small acts of self-care can tip the scale upward.";
  return "It's okay to have tough periods. Consider reaching out to someone you trust.";
}

function formatEntryDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function MoodTrackerView() {
  const { userId, setView } = useAyuAstroStore();

  // Mood check-in state
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [selectedEmoji, setSelectedEmoji] = useState<string>('');
  const [journalNote, setJournalNote] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // History state
  const [entries, setEntries] = useState<MoodEntryData[]>([]);
  const [summary, setSummary] = useState<MoodSummary>({
    averageMood: 0,
    mostCommonEmoji: '😊',
    streakDays: 0,
    totalEntries: 0,
  });
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [historyOpen, setHistoryOpen] = useState(false);

  // Fetch mood history
  const fetchHistory = useCallback(async () => {
    if (!userId) {
      setIsLoadingHistory(false);
      return;
    }
    try {
      setIsLoadingHistory(true);
      const res = await fetch(`/api/mood/history?userId=${userId}&days=30`);
      const json = await res.json();
      if (json.success) {
        setEntries(json.data.entries);
        setSummary(json.data.summary);
      }
    } catch (err) {
      console.error('Failed to fetch mood history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Check if already logged today
  const todayEntry = entries.find((e) => {
    const d = new Date(e.createdAt);
    const now = new Date();
    return (
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  });

  // Handle mood emoji selection
  const handleMoodSelect = (mood: number, emoji: string) => {
    setSelectedMood(mood);
    setSelectedEmoji(emoji);
    setSubmitSuccess(false);
  };

  // Handle tag toggle
  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!selectedMood || !userId) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/mood/entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          mood: selectedMood,
          emoji: selectedEmoji,
          note: journalNote || undefined,
          tags: selectedTags,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSubmitSuccess(true);
        setJournalNote('');
        setSelectedTags([]);
        cosmicToast.success('Mood logged! ✦', 'Your emotional journey is being tracked');
        await fetchHistory();
        setTimeout(() => setSubmitSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to submit mood entry:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Build last 7 days data for the timeline
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    date.setHours(0, 0, 0, 0);
    const dayKey = date.getTime();
    const dayName = DAY_NAMES[date.getDay()];
    const entry = entries.find((e) => {
      const ed = new Date(e.createdAt);
      ed.setHours(0, 0, 0, 0);
      return ed.getTime() === dayKey;
    });
    return { dayName, date, entry, isToday: i === 6 };
  });

  // Circular progress for average mood
  const avgPercent = summary.averageMood > 0 ? (summary.averageMood / 5) * 100 : 0;
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (avgPercent / 100) * circumference;

  return (
    <div className="bg-cream dark:bg-[#1a1410] px-4 py-6 pb-24 min-h-screen">
      <div className="mx-auto max-w-lg space-y-6">
        {/* Header */}
        <motion.div {...fadeInUp} transition={{ duration: 0.4 }} className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setView('profile')}
            className="size-10 rounded-full hover:bg-brown-50 dark:hover:bg-brown-800"
          >
            <ArrowLeft className="size-5 text-brown-700 dark:text-brown-300" />
          </Button>
          <div>
            <h1
              className="font-serif text-xl font-bold text-brown-900 dark:text-brown-100"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Mood Journal
            </h1>
            <p className="text-xs text-brown-400 dark:text-brown-500">Track your emotional patterns</p>
          </div>
        </motion.div>

        {/* ─── Section 1: Today's Check-in ─────────────────────────── */}
        <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.05 }}>
          <Card className="border-0 shadow-sm bg-white dark:bg-white/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-brown-900 dark:text-brown-100">
                <Heart className="size-5 text-gold" />
                {todayEntry ? 'Today\'s Mood Logged ✓' : 'How are you feeling today?'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todayEntry ? (
                <div className="text-center py-4">
                  <span className="text-5xl">{todayEntry.emoji}</span>
                  <p className="mt-2 text-sm text-brown-600 dark:text-brown-400">
                    You logged a {MOOD_OPTIONS.find((m) => m.mood === todayEntry.mood)?.label.toLowerCase()} mood today
                  </p>
                  {todayEntry.note && (
                    <p className="mt-1 text-xs text-brown-400 dark:text-brown-500 italic">&quot;{todayEntry.note}&quot;</p>
                  )}
                </div>
              ) : (
                <>
                  {/* Emoji Row */}
                  <div className="flex justify-center gap-3 sm:gap-5 mb-5">
                    {MOOD_OPTIONS.map((opt) => (
                      <motion.button
                        key={opt.mood}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleMoodSelect(opt.mood, opt.emoji)}
                        className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all duration-200 ${
                          selectedMood === opt.mood
                            ? 'ring-2 ring-gold scale-110 bg-gold/5 dark:bg-gold/10'
                            : 'hover:bg-brown-50 dark:hover:bg-brown-50/10'
                        }`}
                      >
                        <span className={`text-3xl sm:text-4xl transition-transform duration-200 ${
                          selectedMood === opt.mood ? 'scale-110' : ''
                        }`}>
                          {opt.emoji}
                        </span>
                        <span className="text-[10px] text-brown-400 dark:text-brown-500 font-medium">{opt.label}</span>
                      </motion.button>
                    ))}
                  </div>

                  {/* Journal Note */}
                  <Textarea
                    placeholder="What's on your mind today..."
                    value={journalNote}
                    onChange={(e) => setJournalNote(e.target.value)}
                    className="mb-4 border-brown-200 dark:border-brown-100/20 bg-cream dark:bg-brown-50/10 text-brown-900 dark:text-brown-100 placeholder:text-brown-300 dark:placeholder:text-brown-600 resize-none focus-visible:ring-gold/30"
                    rows={3}
                  />

                  {/* Tags */}
                  <div className="mb-5">
                    <p className="text-xs text-brown-400 dark:text-brown-500 mb-2 font-medium">How would you describe your mood?</p>
                    <div className="flex flex-wrap gap-2">
                      {TAG_OPTIONS.map((tag) => {
                        const isSelected = selectedTags.includes(tag);
                        return (
                          <button
                            key={tag}
                            onClick={() => handleTagToggle(tag)}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 border ${
                              isSelected
                                ? 'bg-gold/15 dark:bg-gold/20 border-gold/40 text-gold-dark dark:text-gold'
                                : 'bg-transparent border-brown-200 dark:border-brown-100/20 text-brown-500 dark:text-brown-400 hover:border-gold/30'
                            }`}
                          >
                            {tag}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <AnimatePresence mode="wait">
                    {submitSuccess ? (
                      <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center justify-center gap-2 py-3 text-sage-dark"
                      >
                        <Check className="size-5" />
                        <span className="text-sm font-semibold">Mood logged successfully!</span>
                      </motion.div>
                    ) : (
                      <motion.div key="button" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <Button
                          onClick={handleSubmit}
                          disabled={!selectedMood || isSubmitting}
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
                              Log Mood
                            </>
                          )}
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Section 2: Mood Timeline (Last 7 Days) ─────────────── */}
        <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.1 }}>
          <Card className="border-0 shadow-sm bg-white dark:bg-white/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-brown-900 dark:text-brown-100">
                <Sparkles className="size-5 text-gold" />
                Your Emotional Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingHistory ? (
                <div className="flex justify-around items-end h-28">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div className="w-6 h-16 bg-brown-100 dark:bg-brown-50/20 rounded animate-pulse" />
                      <span className="text-[10px] text-brown-300">—</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex justify-around items-end h-28">
                  {last7Days.map((day, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      {/* Emoji or empty */}
                      <span className="text-sm">
                        {day.entry ? day.entry.emoji : ''}
                      </span>
                      {/* Mood bar */}
                      {day.entry ? (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: 'auto' }}
                          transition={{ duration: 0.4, delay: i * 0.05 }}
                          className={`w-6 rounded-t-md ${MOOD_COLORS[day.entry.mood]}`}
                          style={{ minHeight: 8 }}
                        >
                          <div className={MOOD_BAR_HEIGHTS[day.entry.mood]} />
                        </motion.div>
                      ) : (
                        <div className="w-6 h-6 rounded-t-md border-2 border-dashed border-brown-200 dark:border-brown-100/20" />
                      )}
                      {/* Day name */}
                      <span className={`text-[10px] font-medium ${
                        day.isToday
                          ? 'text-gold-dark dark:text-gold font-bold'
                          : 'text-brown-400 dark:text-brown-500'
                      }`}>
                        {day.dayName}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Section 3: Insights ─────────────────────────────────── */}
        {summary.totalEntries > 0 && (
          <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.15 }}>
            <Card className="border-0 shadow-sm bg-white dark:bg-white/5">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-brown-900 dark:text-brown-100">
                  <TrendingUp className="size-5 text-gold" />
                  Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {/* Average Mood - Circular Progress */}
                  <div className="flex flex-col items-center">
                    <div className="relative size-20">
                      <svg className="size-20 -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50" cy="50" r="40"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="6"
                          className="text-brown-100 dark:text-brown-50/20"
                        />
                        <circle
                          cx="50" cy="50" r="40"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="6"
                          strokeLinecap="round"
                          className="text-gold"
                          style={{
                            strokeDasharray: circumference,
                            strokeDashoffset,
                            transition: 'stroke-dashoffset 0.8s ease-out',
                          }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="font-serif text-lg font-bold text-brown-900 dark:text-brown-100"
                          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                          {summary.averageMood}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] text-brown-400 dark:text-brown-500 mt-1">Avg Mood</span>
                  </div>

                  {/* Most Frequent Emoji */}
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-4xl">{summary.mostCommonEmoji}</span>
                    <span className="text-[10px] text-brown-400 dark:text-brown-500 mt-1">Most Frequent</span>
                  </div>

                  {/* Streak */}
                  <div className="flex flex-col items-center justify-center">
                    <div className="flex items-center gap-1">
                      <Flame className="size-5 text-gold" />
                      <span className="font-serif text-2xl font-bold text-brown-900 dark:text-brown-100"
                        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                        {summary.streakDays}
                      </span>
                    </div>
                    <span className="text-[10px] text-brown-400 dark:text-brown-500 mt-1">Day Streak</span>
                  </div>
                </div>

                <Separator className="my-3 bg-brown-100 dark:bg-brown-100/20" />

                {/* AI Insight */}
                <div className="rounded-xl bg-gold/5 dark:bg-gold/10 border border-gold/10 p-3">
                  <p className="text-xs font-semibold text-gold-dark dark:text-gold mb-1 flex items-center gap-1">
                    <Sparkles className="size-3" />
                    Emotional Insight
                  </p>
                  <p className="text-xs text-brown-600 dark:text-brown-300 leading-relaxed">
                    {getInsightMessage(summary.averageMood)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ─── Section 4: Journal History ──────────────────────────── */}
        <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.2 }}>
          <Card className="border-0 shadow-sm bg-white dark:bg-white/5">
            <Collapsible open={historyOpen} onOpenChange={setHistoryOpen}>
              <CollapsibleTrigger asChild>
                <CardHeader className="pb-3 cursor-pointer hover:bg-brown-50/50 dark:hover:bg-brown-50/5 transition-colors rounded-t-lg">
                  <CardTitle className="flex items-center justify-between text-base font-semibold text-brown-900 dark:text-brown-100">
                    <span className="flex items-center gap-2">
                      <BookOpen className="size-5 text-gold" />
                      Journal History
                    </span>
                    <motion.div animate={{ rotate: historyOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronDown className="size-4 text-brown-400" />
                    </motion.div>
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent>
                  {isLoadingHistory ? (
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex gap-3 animate-pulse">
                          <div className="size-10 rounded-full bg-brown-100 dark:bg-brown-50/20" />
                          <div className="flex-1 space-y-2 py-1">
                            <div className="h-3 bg-brown-100 dark:bg-brown-50/20 rounded w-1/3" />
                            <div className="h-3 bg-brown-100 dark:bg-brown-50/20 rounded w-2/3" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : entries.length === 0 ? (
                    <div className="text-center py-8">
                      <span className="text-4xl">✨</span>
                      <p className="mt-2 text-sm text-brown-500 dark:text-brown-400">
                        Your journal is waiting for you
                      </p>
                      <p className="text-xs text-brown-300 dark:text-brown-600 mt-1">
                        Start tracking your mood to see your emotional journey unfold
                      </p>
                    </div>
                  ) : (
                    <div className="max-h-64 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
                      {entries.map((entry) => (
                        <div
                          key={entry.id}
                          className="flex gap-3 p-3 rounded-xl bg-cream dark:bg-brown-50/10 border border-brown-100/50 dark:border-brown-100/10"
                        >
                          {/* Emoji */}
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white dark:bg-brown-50/20 border border-brown-100 dark:border-brown-100/20">
                            <span className="text-lg">{entry.emoji}</span>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-xs font-semibold text-brown-900 dark:text-brown-100">
                                {formatEntryDate(entry.createdAt)}
                              </span>
                              <Badge className="bg-gold/10 text-gold-dark dark:text-gold border-0 text-[10px] px-1.5 py-0">
                                {MOOD_OPTIONS.find((m) => m.mood === entry.mood)?.label}
                              </Badge>
                            </div>
                            {entry.note && (
                              <p className="text-xs text-brown-500 dark:text-brown-400 line-clamp-2 leading-relaxed">
                                {entry.note}
                              </p>
                            )}
                            {entry.tags && entry.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {entry.tags.map((tag: string) => (
                                  <span
                                    key={tag}
                                    className="text-[9px] px-1.5 py-0.5 rounded-full bg-sage-muted/30 dark:bg-sage-muted/20 text-sage-dark dark:text-sage"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
