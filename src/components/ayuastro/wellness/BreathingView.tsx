'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAyuAstroStore } from '@/store/ayuastro-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  Wind,
  Clock,
  Sparkles,
  CheckCircle2,
  Moon,
  Sun,
  Heart,
  BedDouble,
} from 'lucide-react';
import { cosmicToast } from '@/lib/toast';

// ─── Types ──────────────────────────────────────────────────────────────────

type BreathingPhase = 'inhale' | 'hold' | 'exhale' | 'holdAfterExhale';

interface BreathingTechnique {
  id: string;
  name: string;
  subtitle: string;
  emoji: string;
  phases: { phase: BreathingPhase; duration: number; label: string }[];
  description: string;
  color: string;
}

interface MeditationCard {
  id: string;
  name: string;
  emoji: string;
  duration: number; // minutes
  durationLabel: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
}

// ─── Breathing Techniques ───────────────────────────────────────────────────

const BREATHING_TECHNIQUES: BreathingTechnique[] = [
  {
    id: 'cosmic-calm',
    name: 'Cosmic Calm',
    subtitle: '4-7-8 Breathing',
    emoji: '🌌',
    phases: [
      { phase: 'inhale', duration: 4000, label: 'Breathe In' },
      { phase: 'hold', duration: 7000, label: 'Hold' },
      { phase: 'exhale', duration: 8000, label: 'Breathe Out' },
    ],
    description: 'Release anxiety and find deep calm',
    color: 'from-gold/20 to-sage-muted/20',
  },
  {
    id: 'moon-rhythm',
    name: 'Moon Rhythm',
    subtitle: 'Box Breathing',
    emoji: '🌙',
    phases: [
      { phase: 'inhale', duration: 4000, label: 'Breathe In' },
      { phase: 'hold', duration: 4000, label: 'Hold' },
      { phase: 'exhale', duration: 4000, label: 'Breathe Out' },
      { phase: 'holdAfterExhale', duration: 4000, label: 'Hold' },
    ],
    description: 'Sharpen focus and clarity',
    color: 'from-brown-100/30 to-gold/10',
  },
  {
    id: 'solar-breath',
    name: 'Solar Breath',
    subtitle: '6-2-6 Breathing',
    emoji: '☀️',
    phases: [
      { phase: 'inhale', duration: 6000, label: 'Breathe In' },
      { phase: 'hold', duration: 2000, label: 'Hold' },
      { phase: 'exhale', duration: 6000, label: 'Breathe Out' },
    ],
    description: 'Restore emotional balance',
    color: 'from-gold/15 to-gold-light/10',
  },
];

// ─── Meditation Cards ───────────────────────────────────────────────────────

const MEDITATION_CARDS: MeditationCard[] = [
  {
    id: 'morning-intention',
    name: 'Morning Intention',
    emoji: '🌅',
    duration: 2,
    durationLabel: '2 min',
    description: 'Set your daily cosmic intention and align with your inner purpose',
    icon: Sun,
    gradient: 'from-gold/10 to-gold-light/5',
  },
  {
    id: 'emotional-release',
    name: 'Emotional Release',
    emoji: '🕊️',
    duration: 3,
    durationLabel: '3 min',
    description: 'Let go of trapped emotions and create space for healing',
    icon: Heart,
    gradient: 'from-sage-muted/20 to-sage/5',
  },
  {
    id: 'gratitude-flow',
    name: 'Gratitude Flow',
    emoji: '🙏',
    duration: 2,
    durationLabel: '2 min',
    description: 'Cultivate deep appreciation for the blessings in your life',
    icon: Sparkles,
    gradient: 'from-gold/10 to-sage-muted/10',
  },
  {
    id: 'sleep-harmony',
    name: 'Sleep Harmony',
    emoji: '🌙',
    duration: 5,
    durationLabel: '5 min',
    description: 'Gentle pre-sleep relaxation to ease into restful slumber',
    icon: BedDouble,
    gradient: 'from-brown-100/30 to-sage-muted/10',
  },
];

// ─── Daily Mindfulness Prompts (144 total: 12 per zodiac sign) ─────────────

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

const MINDFULNESS_PROMPTS: Record<string, string[]> = {
  Aries: [
    'Pause before reacting today — your fire is powerful, but a steady flame warms more than a wildfire.',
    'Practice patience with one conversation today. Let the other person finish before you ignite.',
    'Channel your warrior spirit inward — what inner battle needs your courage today?',
    'Before charging forward, take three slow breaths. Direction matters more than speed.',
    'Your enthusiasm is contagious, but today practice receiving instead of initiating.',
    'Sit with stillness for 2 minutes. Notice how your body feels when you stop moving.',
    'Choose one impulsive habit today and replace it with a mindful pause.',
    'Your strength is in starting things — today, find beauty in finishing something.',
    'When frustration rises, breathe into it. Let the heat transform into purpose.',
    'Practice gentle persistence over forceful action in one area today.',
    'Notice the space between your impulse and your action — that\'s where your power lives.',
    'Let someone else take the lead today. Observe what you discover from following.',
  ],
  Taurus: [
    'Release one attachment today — the earth flourishes when it lets go of what it no longer needs.',
    'Try something unfamiliar today. Your comfort zone is beautiful, but growth lives just beyond it.',
    'Notice the textures around you — your senses are a gateway to presence.',
    'Practice flexibility in one fixed opinion. What opens when you soften your stance?',
    'Your stability is a gift — today, share it by being a grounding presence for someone.',
    'Move your body in a new way today. Let your physical form surprise you.',
    'When you feel stubbornness rising, ask: "Is this protecting me or limiting me?"',
    'Savor one meal today with complete attention — taste, texture, aroma, gratitude.',
    'Let beauty be your meditation. Spend 3 minutes truly seeing something beautiful.',
    'Practice letting someone change your mind today — it\'s a sign of strength, not weakness.',
    'Ground yourself by walking barefoot or touching the earth. Feel the exchange of energy.',
    'Release the need for certainty in one small area. See what freedom emerges.',
  ],
  Gemini: [
    'Silence your inner commentator for 5 minutes — let yourself simply exist without narration.',
    'Practice deep listening today. Hear not just words, but the feelings beneath them.',
    'Choose one thought stream and follow it to its depth rather than its breadth.',
    'Write down three thoughts, then release them. You are not your thoughts.',
    'Your mind is a kaleidoscope — today, focus on one pattern and see its full beauty.',
    'Have a conversation where you listen twice as much as you speak.',
    'When your mind races, anchor to your breath. It\'s always here, always now.',
    'Read one paragraph with complete attention. No skimming, no jumping ahead.',
    'Practice presence in transition moments — walking, waiting, moving between spaces.',
    'Choose curiosity over judgment in one interaction today.',
    'Let one idea fully form before sharing it. See what depth emerges in patience.',
    'Today, notice when you\'re performing and when you\'re being. Choose being.',
  ],
  Cancer: [
    'Place boundaries with love today — protecting your energy is not rejecting others.',
    'Observe your emotions as waves — you are the ocean, not any single swell.',
    'Nurture yourself the way you nurture others. You deserve your own tenderness.',
    'When nostalgia calls, thank it for the memory, then return to this moment.',
    'Your sensitivity is a superpower — today, use it to sense your own needs first.',
    'Practice releasing one old emotional pattern that no longer serves you.',
    'Create a safe space within yourself through 5 minutes of self-compassion.',
    'Let someone support you today. Receiving is an act of trust, not weakness.',
    'When you feel the urge to withdraw, reach out instead — just one small connection.',
    'Honor your need for home, but find home within yourself first.',
    'Practice sitting with uncomfortable emotions without trying to fix them.',
    'Forgive yourself for one thing you\'ve been carrying. Set it down gently.',
  ],
  Leo: [
    'Let your light shine inward today — illuminate the quiet corners of your own heart.',
    'Practice being seen without performing. Your essence is enough.',
    'Share the stage today — someone else\'s light doesn\'t dim your own.',
    'Find validation from within. Write down three things you genuinely appreciate about yourself.',
    'Your warmth is healing — direct it toward yourself first today.',
    'Create something just for you, not for applause or recognition.',
    'When the need for attention arises, give yourself the attention you seek.',
    'Practice humility in one small act. What opens when you step back?',
    'Lead with vulnerability today. It takes more courage than confidence.',
    'Notice when you\'re seeking external approval and gently return to self-approval.',
    'Your generosity is legendary — today, be generous with your own self-talk.',
    'Sit in the background and observe. Find the beauty in not being the center.',
  ],
  Virgo: [
    'Release perfection in one task today — done is more beautiful than perfect.',
    'Your body knows things your mind hasn\'t articulated — listen to its quiet signals.',
    'Practice being messy, imperfect, and human. It\'s where the magic lives.',
    'Replace one criticism with one compliment — especially toward yourself.',
    'Your analytical mind is a gift — today, let it rest and lead from your heart instead.',
    'Do one thing today purely for joy, with no productive outcome in mind.',
    'When you catch yourself overthinking, drop into your body. Feel your feet on the ground.',
    'Practice accepting help without immediately trying to improve upon it.',
    'Let one thing remain unfinished today. Notice the world continues to turn.',
    'Your service to others is beautiful — serve yourself with the same devotion today.',
    'Replace "I should" with "I choose" in three instances today.',
    'Find the sacred in the imperfect. A cracked bowl holds flowers beautifully.',
  ],
  Libra: [
    'Practice choosing without weighing every option — trust your first instinct today.',
    'Your need for harmony is noble — but disharmony within yourself needs attention first.',
    'Spend time alone today and discover what balance feels like when it\'s just you.',
    'Make one decision quickly, without consulting anyone. Trust your inner scale.',
    'Your aesthetic sense is refined — today, make your inner world as beautiful as your outer one.',
    'When you feel torn between two choices, pause and feel which one makes your body relax.',
    'Practice saying "no" with grace. Your "yes" becomes more meaningful.',
    'Notice when you\'re accommodating others at the expense of your truth.',
    'Create beauty in an unexpected place today — a small act of aesthetic kindness.',
    'Balance giving and receiving in one relationship today with conscious awareness.',
    'Your diplomacy is a gift — today, mediate the conflicting voices within yourself.',
    'Choose authenticity over pleasantness in one conversation today.',
  ],
  Scorpio: [
    'Practice vulnerability today — your deepest power lies in letting yourself be seen.',
    'Release one thing you\'ve been holding onto tightly. Transformation requires release.',
    'Your intensity is magnetic — today, direct it toward self-discovery rather than control.',
    'Let go of one secret you\'ve been carrying. Freedom lives on the other side of truth.',
    'When you feel the urge to probe deeper, turn that investigation inward with compassion.',
    'Practice trust in one small way today. Let someone show up for you.',
    'Your ability to see beneath surfaces is rare — today, see beneath your own.',
    'Surrender one need for control. Notice what rushes in to fill the space.',
    'Transform pain into purpose today — but first, let yourself simply feel it.',
    'Practice being light. Not everything needs to carry the weight of profundity.',
    'Your emotional depth is a well — today, draw from it to nourish, not to drown.',
    'Forgive one betrayal, past or present. Do it for your freedom, not theirs.',
  ],
  Sagittarius: [
    'Stillness is not confinement — it\'s the space where wisdom takes root.',
    'Practice depth over breadth today. One conversation, fully present, can change everything.',
    'Your optimism is a gift — today, direct it toward the parts of yourself that doubt.',
    'Instead of seeking the next adventure, find the adventure in this exact moment.',
    'Commit to one thing today without an escape plan. See it through with your whole heart.',
    'Your freedom-seeking nature is beautiful — but some commitments amplify freedom rather than limit it.',
    'Practice presence in the mundane. The sacred hides in ordinary moments.',
    'When you feel restless, sit with it instead of running. What is the restlessness trying to teach?',
    'Share one profound insight today, but only after living it first.',
    'Ground your vision in one practical step today. The journey needs both the map and the first step.',
    'Explore the inner landscape today — it\'s as vast and wondrous as any external frontier.',
    'Find meaning in what\'s already here rather than what\'s over the next horizon.',
  ],
  Capricorn: [
    'Rest is not the opposite of achievement — it\'s the foundation of it.',
    'Practice receiving without earning. You are worthy simply because you exist.',
    'Your ambition is admirable — today, let it be guided by joy rather than obligation.',
    'Ask for help with one thing today. It\'s a sign of wisdom, not weakness.',
    'Replace "I must" with "I choose" in three instances today. Reclaim your agency.',
    'Celebrate one small win with the same enthusiasm as a major milestone.',
    'Your discipline is legendary — today, be disciplined about play and rest.',
    'When you feel the weight of responsibility, set it down for 5 minutes. The world will wait.',
    'Practice vulnerability with one person today. Let them see the person behind the achievements.',
    'Find beauty in the journey rather than fixating on the summit.',
    'Your wisdom comes from lived experience — today, share it without needing to be right.',
    'Let one thing be "good enough." Perfection is a heavy crown to wear every day.',
  ],
  Aquarius: [
    'Connect with one person deeply today — your revolution starts with one authentic bond.',
    'Your vision for the future is beautiful — but today, be fully present in this moment.',
    'Practice sitting with your emotions instead of analyzing them. Feel, don\'t think.',
    'Your individuality is your superpower — today, celebrate someone else\'s uniqueness too.',
    'Replace detachment with compassionate engagement in one interaction today.',
    'Ground your ideas in one tangible action. A vision without action is just a dream.',
    'When you feel disconnected, touch your heart. You belong here, right now.',
    'Your mind reaches for the stars — today, let your heart lead the way.',
    'Practice being part of a group without needing to be different. Belonging is healing.',
    'Share one unconventional idea, but listen with equal passion to others\' perspectives.',
    'Your humanitarian spirit is noble — start with one act of kindness toward yourself.',
    'Embrace the messiness of human emotion. It\'s the soil where innovation grows.',
  ],
  Pisces: [
    'Anchor yourself in the present moment — your dreams are beautiful, but your feet belong on earth.',
    'Practice discernment today — not every emotion is yours to carry.',
    'Your compassion is boundless — today, direct that ocean of care toward yourself.',
    'Create one boundary with love. Protecting your energy serves everyone.',
    'When you feel lost in the fog, return to your body. It\'s your most honest compass.',
    'Channel your imagination into one concrete creation today. Give form to your vision.',
    'Practice saying what you mean with clarity. Your truth deserves precise words.',
    'Release one fantasy that\'s keeping you from seeing reality\'s beauty.',
    'Your sensitivity connects you to everything — today, choose what you connect with consciously.',
    'Spend time near water and let it wash away what no longer serves you.',
    'Ground your spiritual insights in daily practice. One small ritual can anchor the cosmos.',
    'Honor both your dreamer and your doer. They need each other to create magic.',
  ],
};

// ─── Helper Functions ───────────────────────────────────────────────────────

function getDailyMindfulnessPrompt(sunSign: string): string {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );
  const signIndex = ZODIAC_SIGNS.indexOf(sunSign) >= 0 ? ZODIAC_SIGNS.indexOf(sunSign) : 0;
  const promptIndex = (dayOfYear + signIndex) % 12;
  const prompts = MINDFULNESS_PROMPTS[sunSign] || MINDFULNESS_PROMPTS['Aries'];
  return prompts[promptIndex];
}

const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

// ─── Meditation Overlay Component ───────────────────────────────────────────

function MeditationOverlay({
  meditation,
  onClose,
}: {
  meditation: MeditationCard;
  onClose: () => void;
}) {
  const [timeLeft, setTimeLeft] = useState(meditation.duration * 60);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPaused) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = 1 - timeLeft / (meditation.duration * 60);

  // Breathing animation for overlay
  const breatheCycleDuration = 8; // 8 seconds for one full breath

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-brown-900/95 dark:bg-black/95"
    >
      <div className="flex flex-col items-center px-6 text-center max-w-sm">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-brown-200 hover:text-white transition-colors"
        >
          ✕
        </button>

        {/* Animated breathing orb */}
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: breatheCycleDuration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="size-40 rounded-full mb-8"
          style={{
            background: 'radial-gradient(circle, rgba(212,175,55,0.3) 0%, rgba(165,214,167,0.15) 60%, transparent 100%)',
          }}
        />

        {/* Inner glow */}
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: breatheCycleDuration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute size-24 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(212,175,55,0.5) 0%, rgba(240,193,75,0.2) 60%, transparent 100%)',
          }}
        />

        {/* Title */}
        <h2 className="font-serif text-xl font-semibold text-cream mb-1"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          {meditation.name}
        </h2>
        <p className="text-sm text-brown-200 mb-6">
          {meditation.emoji} Close your eyes and breathe gently
        </p>

        {/* Timer */}
        <div className="relative size-32 mb-6">
          <svg className="size-32 -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60" cy="60" r="52"
              fill="none"
              stroke="rgba(188,170,164,0.2)"
              strokeWidth="4"
            />
            <circle
              cx="60" cy="60" r="52"
              fill="none"
              stroke="rgba(212,175,55,0.7)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 52}
              strokeDashoffset={2 * Math.PI * 52 * (1 - progress)}
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-serif text-3xl font-bold text-cream"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              {minutes}:{seconds.toString().padStart(2, '0')}
            </span>
            <span className="text-xs text-brown-300">remaining</span>
          </div>
        </div>

        {/* Pause/Resume */}
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="flex items-center gap-2 px-6 py-2 rounded-full border border-brown-200/30 text-brown-200 hover:bg-brown-200/10 transition-colors"
        >
          {isPaused ? (
            <>
              <Play className="size-4" />
              <span className="text-sm">Resume</span>
            </>
          ) : (
            <>
              <Pause className="size-4" />
              <span className="text-sm">Pause</span>
            </>
          )}
        </button>

        {/* Completion state */}
        {timeLeft === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4"
          >
            <p className="text-gold font-serif text-lg"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Namaste ✦
            </p>
            <p className="text-sm text-brown-200 mt-1">Your meditation is complete</p>
            <Button
              onClick={onClose}
              className="mt-3 bg-gold hover:bg-gold-dark text-white"
            >
              Return
            </Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Main BreathingView Component ───────────────────────────────────────────

export default function BreathingView() {
  const { astrologyData, setView } = useAyuAstroStore();
  const sunSign = astrologyData?.sunSign || 'Aries';

  const [selectedTechnique, setSelectedTechnique] = useState<BreathingTechnique>(BREATHING_TECHNIQUES[0]);
  const [isBreathing, setIsBreathing] = useState(false);
  const [activeMeditation, setActiveMeditation] = useState<MeditationCard | null>(null);
  const [practicedToday, setPracticedToday] = useState(false);

  const dailyPrompt = getDailyMindfulnessPrompt(sunSign);

  const handleCycleComplete = useCallback(() => {
    // Called when one breathing cycle completes
  }, []);

  const toggleBreathing = () => {
    setIsBreathing(!isBreathing);
  };

  const handlePracticedToday = () => {
    setPracticedToday(true);
    cosmicToast.success('Mindful moment captured ✦', 'Your cosmic awareness grows stronger');
  };

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
              Breathing & Meditation
            </h1>
            <p className="text-xs text-brown-400 dark:text-brown-500">Find your cosmic calm</p>
          </div>
        </motion.div>

        {/* ─── Section 1: Breathing Exercise ─────────────────────────── */}
        <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.05 }}>
          <Card className="border-0 shadow-md bg-white dark:bg-white/5 overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-brown-900 dark:text-brown-100">
                <Wind className="size-5 text-gold" />
                Breathing Exercise
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Technique selector */}
              <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
                {BREATHING_TECHNIQUES.map((tech) => (
                  <button
                    key={tech.id}
                    onClick={() => {
                      if (isBreathing) setIsBreathing(false);
                      setSelectedTechnique(tech);
                    }}
                    className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-200 ${
                      selectedTechnique.id === tech.id
                        ? 'border-gold/40 bg-gold/10 dark:bg-gold/15 shadow-sm'
                        : 'border-brown-100 dark:border-brown-100/20 hover:border-gold/20'
                    }`}
                  >
                    <span className="text-lg">{tech.emoji}</span>
                    <div className="text-left">
                      <p className={`text-xs font-semibold ${
                        selectedTechnique.id === tech.id
                          ? 'text-gold-dark dark:text-gold'
                          : 'text-brown-700 dark:text-brown-300'
                      }`}>
                        {tech.name}
                      </p>
                      <p className="text-[10px] text-brown-400 dark:text-brown-500">{tech.subtitle}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Selected technique info */}
              <div className="text-center mb-2">
                <p className="text-sm text-brown-500 dark:text-brown-400">
                  {selectedTechnique.description}
                </p>
              </div>

              {/* Breathing Circle - passing play/pause control from parent */}
              <div className="flex flex-col items-center">
                <BreathingCircleWithControls
                  key={selectedTechnique.id}
                  technique={selectedTechnique}
                  isPlaying={isBreathing}
                  onTogglePlay={toggleBreathing}
                  onCycleComplete={handleCycleComplete}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Section 2: Quick Meditation Cards ──────────────────────── */}
        <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.1 }}>
          <Card className="border-0 shadow-md bg-white dark:bg-white/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-brown-900 dark:text-brown-100">
                <Moon className="size-5 text-gold" />
                Quick Meditations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {MEDITATION_CARDS.map((med) => {
                  const Icon = med.icon;
                  return (
                    <motion.div
                      key={med.id}
                      whileTap={{ scale: 0.97 }}
                      className={`rounded-xl bg-gradient-to-br ${med.gradient} dark:from-white/5 dark:to-white/[0.02] p-4 border border-brown-100/50 dark:border-brown-100/10 cursor-pointer card-hover`}
                      onClick={() => setActiveMeditation(med)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">{med.emoji}</span>
                        <Badge className="bg-gold/10 text-gold-dark dark:text-gold border-0 text-[10px] px-1.5 py-0">
                          <Clock className="size-2.5 mr-0.5" />
                          {med.durationLabel}
                        </Badge>
                      </div>
                      <h3
                        className="font-serif text-sm font-semibold text-brown-900 dark:text-brown-100 mb-1"
                        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                      >
                        {med.name}
                      </h3>
                      <p className="text-[10px] text-brown-400 dark:text-brown-500 leading-relaxed line-clamp-2">
                        {med.description}
                      </p>
                      <button className="mt-3 flex items-center gap-1 text-[10px] font-semibold text-gold-dark dark:text-gold hover:text-gold-light transition-colors">
                        <Play className="size-2.5" />
                        Start
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Section 3: Daily Mindfulness Prompt ───────────────────── */}
        <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.15 }}>
          <Card className="card-hover border-0 shadow-md overflow-hidden bg-gradient-to-br from-gold/5 to-sage-muted/10 dark:from-gold/5 dark:to-sage-muted/5">
            <div className="h-1 bg-gradient-to-r from-gold via-sage to-gold-dark" />
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-brown-900 dark:text-brown-100">
                <Sparkles className="size-5 text-gold" />
                Daily Mindfulness
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="zodiac-corner rounded-xl bg-white/60 dark:bg-brown-50/10 p-5 border border-gold/10 dark:border-gold/5">
                {/* Zodiac sign badge */}
                <div className="flex items-center gap-2 mb-3">
                  <Badge className="bg-sage-muted/50 dark:bg-sage-muted/30 text-sage-dark dark:text-sage border-0 text-xs">
                    {sunSign}
                  </Badge>
                  <span className="text-[10px] text-brown-300 dark:text-brown-500">
                    Today&apos;s cosmic guidance
                  </span>
                </div>

                {/* Prompt text */}
                <p className="text-sm text-brown-700 dark:text-brown-200 leading-relaxed font-serif"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  &ldquo;{dailyPrompt}&rdquo;
                </p>

                {/* Practiced button */}
                <AnimatePresence mode="wait">
                  {practicedToday ? (
                    <motion.div
                      key="practiced"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="mt-4 flex items-center justify-center gap-2 py-2 text-sage-dark dark:text-sage"
                    >
                      <CheckCircle2 className="size-4" />
                      <span className="text-xs font-semibold">Practiced today ✦</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="not-practiced"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <Button
                        onClick={handlePracticedToday}
                        variant="outline"
                        size="sm"
                        className="mt-4 w-full border-gold/30 text-gold-dark dark:text-gold hover:bg-gold/5 dark:hover:bg-gold/10"
                      >
                        <CheckCircle2 className="mr-1.5 size-3.5" />
                        I Practiced Today
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Meditation Overlay */}
      <AnimatePresence>
        {activeMeditation && (
          <MeditationOverlay
            meditation={activeMeditation}
            onClose={() => setActiveMeditation(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Breathing Circle With Parent Controls ──────────────────────────────────

function BreathingCircleWithControls({
  technique,
  isPlaying,
  onTogglePlay,
  onCycleComplete,
}: {
  technique: BreathingTechnique;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onCycleComplete: () => void;
}) {
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const phaseStartRef = useRef<number>(0);

  const currentPhase = technique.phases[currentPhaseIndex];
  const phaseDuration = currentPhase?.duration || 4000;

  const getScale = useCallback(() => {
    if (!currentPhase) return 1;
    if (currentPhase.phase === 'inhale') return 1 + phaseProgress * 0.35;
    if (currentPhase.phase === 'exhale') return 1.35 - phaseProgress * 0.35;
    if (currentPhase.phase === 'hold') return 1.35;
    if (currentPhase.phase === 'holdAfterExhale') return 1;
    return 1;
  }, [currentPhase, phaseProgress]);

  useEffect(() => {
    if (!isPlaying) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    phaseStartRef.current = Date.now();

    const tickInterval = 50;
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - phaseStartRef.current;
      const progress = Math.min(elapsed / phaseDuration, 1);
      setPhaseProgress(progress);

      if (progress >= 1) {
        const nextPhaseIndex = currentPhaseIndex + 1;
        if (nextPhaseIndex >= technique.phases.length) {
          setCyclesCompleted((prev) => prev + 1);
          setCurrentPhaseIndex(0);
          onCycleComplete();
        } else {
          setCurrentPhaseIndex(nextPhaseIndex);
        }
        phaseStartRef.current = Date.now();
        setPhaseProgress(0);
      }
    }, tickInterval);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, currentPhaseIndex, phaseDuration, technique.phases.length, onCycleComplete]);

  const scale = getScale();
  const phaseLabel = currentPhase?.label || 'Ready';
  const particleCount = 6;
  const orbitRadius = 120;

  return (
    <div className="flex flex-col items-center">
      {/* Breathing Circle */}
      <div className="relative flex items-center justify-center" style={{ width: 280, height: 280 }}>
        {/* Orbiting particles */}
        {isPlaying && Array.from({ length: particleCount }).map((_, i) => {
          const baseAngle = (i * 360) / particleCount;
          const rotationOffset = phaseProgress * 30;
          const angle = baseAngle + rotationOffset;
          const rad = (angle * Math.PI) / 180;
          const x = Math.cos(rad) * orbitRadius;
          const y = Math.sin(rad) * orbitRadius;
          return (
            <motion.div
              key={`particle-${i}`}
              className="absolute size-2.5 rounded-full bg-gold/60 dark:bg-gold/50"
              style={{
                left: '50%',
                top: '50%',
              }}
              animate={{
                x: x - 5,
                y: y - 5,
                opacity: [0.3, 0.8, 0.3],
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{
                x: { duration: 0.1 },
                y: { duration: 0.1 },
                opacity: { duration: 2, delay: i * 0.3, repeat: Infinity, ease: 'easeInOut' },
                scale: { duration: 2, delay: i * 0.3, repeat: Infinity, ease: 'easeInOut' },
              }}
            />
          );
        })}

        {/* Outer glow ring */}
        <motion.div
          className="absolute rounded-full"
          animate={{
            scale: scale * 1.12,
            opacity: isPlaying ? [0.12, 0.25, 0.12] : 0.08,
          }}
          transition={{
            scale: { duration: phaseDuration / 1000, ease: 'easeInOut' },
            opacity: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
          }}
          style={{
            width: 210,
            height: 210,
            background: 'radial-gradient(circle, rgba(212,175,55,0.2) 0%, rgba(165,214,167,0.1) 70%, transparent 100%)',
          }}
        />

        {/* Main circle */}
        <motion.div
          className="relative flex items-center justify-center rounded-full animate-breathe-glow"
          animate={{ scale }}
          transition={{
            duration: phaseDuration / 1000,
            ease: 'easeInOut',
          }}
          style={{
            width: 200,
            height: 200,
            background: 'linear-gradient(135deg, rgba(212,175,55,0.25) 0%, rgba(165,214,167,0.2) 50%, rgba(212,175,55,0.15) 100%)',
          }}
        >
          {/* Inner circle */}
          <div className="flex flex-col items-center justify-center size-32 rounded-full bg-white/70 dark:bg-brown-50/20 backdrop-blur-sm border border-gold/20 dark:border-gold/10">
            <span className="text-sm font-medium text-brown-400 dark:text-brown-500 mb-1">
              {isPlaying ? phaseLabel : 'Ready'}
            </span>
            {isPlaying && (
              <motion.span
                key={`${technique.id}-${currentPhaseIndex}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="font-serif text-3xl font-bold text-brown-900 dark:text-brown-100"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                {Math.ceil((1 - phaseProgress) * (phaseDuration / 1000))}
              </motion.span>
            )}
            {!isPlaying && (
              <span className="text-2xl">{technique.emoji}</span>
            )}
          </div>
        </motion.div>
      </div>

      {/* Cycle counter */}
      <div className="mt-4 flex items-center gap-2">
        <Badge className="bg-gold/10 text-gold-dark dark:text-gold border-0 text-xs">
          <Clock className="size-3 mr-1" />
          Round {cyclesCompleted + (isPlaying ? 1 : 0)}
        </Badge>
      </div>

      {/* Controls */}
      <div className="mt-4 flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            setCurrentPhaseIndex(0);
            setPhaseProgress(0);
            setCyclesCompleted(0);
          }}
          className="size-10 rounded-full border-brown-200 dark:border-brown-100/20 hover:bg-brown-50 dark:hover:bg-brown-50/10"
        >
          <RotateCcw className="size-4 text-brown-500 dark:text-brown-400" />
        </Button>
        <Button
          size="lg"
          className="size-14 rounded-full bg-gold hover:bg-gold-dark text-white shadow-md"
          onClick={onTogglePlay}
        >
          {isPlaying ? (
            <Pause className="size-5" />
          ) : (
            <Play className="size-5 ml-0.5" />
          )}
        </Button>
        <div className="size-10" /> {/* Spacer for alignment */}
      </div>
    </div>
  );
}
