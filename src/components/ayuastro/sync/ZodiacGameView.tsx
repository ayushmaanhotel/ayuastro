'use client';

import { useState, useCallback, useMemo } from 'react';
import { useAyuAstroStore } from '@/store/ayuastro-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Gamepad2, Sparkles, Trophy, RotateCcw } from 'lucide-react';
import { cosmicToast } from '@/lib/toast';

// ─── Zodiac Data ────────────────────────────────────────────────────────────

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

const ZODIAC_SYMBOLS: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋', Leo: '♌', Virgo: '♍',
  Libra: '♎', Scorpio: '♏', Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
};

const ZODIAC_ELEMENTS: Record<string, string> = {
  Aries: 'Fire', Leo: 'Fire', Sagittarius: 'Fire',
  Taurus: 'Earth', Virgo: 'Earth', Capricorn: 'Earth',
  Gemini: 'Air', Libra: 'Air', Aquarius: 'Air',
  Cancer: 'Water', Scorpio: 'Water', Pisces: 'Water',
};

const ZODIAC_MODALITIES: Record<string, string> = {
  Aries: 'Cardinal', Cancer: 'Cardinal', Libra: 'Cardinal', Capricorn: 'Cardinal',
  Taurus: 'Fixed', Leo: 'Fixed', Scorpio: 'Fixed', Aquarius: 'Fixed',
  Gemini: 'Mutable', Virgo: 'Mutable', Sagittarius: 'Mutable', Pisces: 'Mutable',
};

const ELEMENT_COMPAT: Record<string, string[]> = {
  Fire: ['Air', 'Fire'],
  Air: ['Fire', 'Air'],
  Earth: ['Water', 'Earth'],
  Water: ['Earth', 'Water'],
};

const MODALITY_COMPAT: Record<string, string[]> = {
  Cardinal: ['Fixed', 'Mutable'],
  Fixed: ['Cardinal', 'Mutable'],
  Mutable: ['Cardinal', 'Fixed'],
};

const ELEMENT_COLORS: Record<string, string> = {
  Fire: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
  Earth: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800',
  Air: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
  Water: 'bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-800',
};

// ─── Deterministic Compatibility Score ───────────────────────────────────────

function calculateCompatibilityScore(sign1: string, sign2: string): number {
  const el1 = ZODIAC_ELEMENTS[sign1] || 'Fire';
  const el2 = ZODIAC_ELEMENTS[sign2] || 'Fire';
  const mod1 = ZODIAC_MODALITIES[sign1] || 'Cardinal';
  const mod2 = ZODIAC_MODALITIES[sign2] || 'Cardinal';

  // Element compatibility score (0-40)
  let elementScore = 20;
  if (el1 === el2) {
    elementScore = 38;
  } else if (ELEMENT_COMPAT[el1]?.includes(el2)) {
    elementScore = 32;
  } else {
    elementScore = 16;
  }

  // Modality compatibility (0-25)
  let modalityScore = 12;
  if (mod1 !== mod2) {
    modalityScore = 22;
  } else {
    modalityScore = 14;
  }

  // Moon sign emotional compatibility (0-25)
  const moonScore = el1 === el2 ? 22 : ELEMENT_COMPAT[el1]?.includes(el2) ? 18 : 10;

  // Deterministic variation based on sign indices
  const idx1 = ZODIAC_SIGNS.indexOf(sign1);
  const idx2 = ZODIAC_SIGNS.indexOf(sign2);
  const phaseBonus = ((idx1 * 7 + idx2 * 13) % 11) - 5;

  const overall = Math.max(15, Math.min(98, elementScore + modalityScore + moonScore + phaseBonus));
  return Math.round(overall);
}

// ─── Game Types ──────────────────────────────────────────────────────────────

type CompatibilityLevel = 'High' | 'Medium' | 'Low';

interface GameRound {
  sign1: string;
  sign2: string;
  actualScore: number;
  actualLevel: CompatibilityLevel;
}

interface GameState {
  rounds: GameRound[];
  currentRound: number;
  correct: number;
  wrong: number;
  streak: number;
  bestStreak: number;
  selectedSigns: [number, number]; // indices
  guessedLevel: CompatibilityLevel | null;
  isRevealing: boolean;
  isComplete: boolean;
}

function getLevel(score: number): CompatibilityLevel {
  if (score > 70) return 'High';
  if (score >= 40) return 'Medium';
  return 'Low';
}

function generateRounds(): GameRound[] {
  const rounds: GameRound[] = [];
  const usedPairs = new Set<string>();

  while (rounds.length < 10) {
    const idx1 = Math.floor(Math.random() * 12);
    let idx2 = Math.floor(Math.random() * 12);
    // Ensure different signs
    while (idx2 === idx1) {
      idx2 = Math.floor(Math.random() * 12);
    }
    // Ensure unique pairs (order-independent)
    const pairKey = [Math.min(idx1, idx2), Math.max(idx1, idx2)].join('-');
    if (usedPairs.has(pairKey)) continue;
    usedPairs.add(pairKey);

    const sign1 = ZODIAC_SIGNS[idx1];
    const sign2 = ZODIAC_SIGNS[idx2];
    const score = calculateCompatibilityScore(sign1, sign2);
    rounds.push({
      sign1,
      sign2,
      actualScore: score,
      actualLevel: getLevel(score),
    });
  }

  return rounds;
}

function getRating(correctCount: number): { title: string; emoji: string; description: string } {
  if (correctCount >= 8) {
    return { title: 'Cosmic Matchmaker', emoji: '🌟', description: 'You have an extraordinary sense of zodiac harmony!' };
  }
  if (correctCount >= 5) {
    return { title: 'Astrology Apprentice', emoji: '🔮', description: 'Good instincts! You understand the cosmic currents.' };
  }
  return { title: 'Novice Stargazer', emoji: '🔭', description: 'Keep gazing at the stars — your intuition will grow!' };
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ZodiacGameView() {
  const { setView } = useAyuAstroStore();

  const [game, setGame] = useState<GameState>(() => ({
    rounds: generateRounds(),
    currentRound: 0,
    correct: 0,
    wrong: 0,
    streak: 0,
    bestStreak: 0,
    selectedSigns: [0, 0],
    guessedLevel: null,
    isRevealing: false,
    isComplete: false,
  }));

  const currentRound = game.rounds[game.currentRound];
  const round = currentRound;

  const handleGuess = useCallback((level: CompatibilityLevel) => {
    if (game.isRevealing || game.isComplete) return;
    const isCorrect = level === round.actualLevel;
    const newCorrect = isCorrect ? game.correct + 1 : game.correct;
    const newWrong = isCorrect ? game.wrong : game.wrong + 1;
    const newStreak = isCorrect ? game.streak + 1 : 0;
    const newBestStreak = Math.max(game.bestStreak, newStreak);

    setGame((prev) => ({
      ...prev,
      guessedLevel: level,
      isRevealing: true,
      correct: newCorrect,
      wrong: newWrong,
      streak: newStreak,
      bestStreak: newBestStreak,
    }));
  }, [game, round]);

  const handleNextRound = useCallback(() => {
    const nextRound = game.currentRound + 1;
    if (nextRound >= 10) {
      setGame((prev) => ({ ...prev, isComplete: true, isRevealing: false }));
    } else {
      setGame((prev) => ({
        ...prev,
        currentRound: nextRound,
        isRevealing: false,
        guessedLevel: null,
      }));
    }
  }, [game.currentRound]);

  const handleRestart = useCallback(() => {
    setGame({
      rounds: generateRounds(),
      currentRound: 0,
      correct: 0,
      wrong: 0,
      streak: 0,
      bestStreak: 0,
      selectedSigns: [0, 0],
      guessedLevel: null,
      isRevealing: false,
      isComplete: false,
    });
    cosmicToast.cosmic('New Game! 🎮', 'Let\'s test your cosmic intuition');
  }, []);

  const rating = useMemo(() => getRating(game.correct), [game.correct]);

  const fadeInUp = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
  };

  // ─── Score Card (Final) ─────────────────────────────────────────────────

  if (game.isComplete) {
    return (
      <div className="bg-cream px-4 py-6 pb-24 min-h-screen">
        <div className="mx-auto max-w-lg space-y-6">
          <motion.div {...fadeInUp} transition={{ duration: 0.5 }}>
            <Card className="border-0 shadow-md bg-white dark:bg-white/5 overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-gold via-gold-light to-gold-dark" />
              <CardContent className="p-8 text-center">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                  className="text-6xl mb-4"
                >
                  {rating.emoji}
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="font-serif text-2xl font-bold text-brown-900 dark:text-brown-100"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  {rating.title}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-sm text-brown-400 dark:text-brown-300 mt-2 mb-6"
                >
                  {rating.description}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="grid grid-cols-3 gap-4 mb-6"
                >
                  <div className="rounded-xl bg-sage/10 dark:bg-sage/20 p-3">
                    <p className="text-2xl font-bold text-sage-dark">{game.correct}</p>
                    <p className="text-[10px] uppercase tracking-wider text-brown-400">Correct</p>
                  </div>
                  <div className="rounded-xl bg-gold/10 dark:bg-gold/20 p-3">
                    <p className="text-2xl font-bold text-gold-dark">{game.wrong}</p>
                    <p className="text-[10px] uppercase tracking-wider text-brown-400">Wrong</p>
                  </div>
                  <div className="rounded-xl bg-brown-50 dark:bg-brown-50/20 p-3">
                    <p className="text-2xl font-bold text-brown-700 dark:text-brown-300">{game.bestStreak}</p>
                    <p className="text-[10px] uppercase tracking-wider text-brown-400">Best Streak</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="rounded-xl bg-gold/5 border border-gold/10 p-4 mb-6"
                >
                  <p className="text-sm font-semibold text-gold-dark dark:text-gold mb-1">
                    Score: {game.correct}/10
                  </p>
                  <div className="h-2 rounded-full bg-brown-100 dark:bg-brown-50/20 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(game.correct / 10) * 100}%` }}
                      transition={{ delay: 1, duration: 0.8, ease: 'easeOut' }}
                      className="h-full rounded-full bg-gradient-to-r from-gold via-gold-light to-gold-dark"
                    />
                  </div>
                </motion.div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleRestart}
                    className="flex-1 bg-brown-700 text-white hover:bg-brown-800"
                  >
                    <RotateCcw className="size-4 mr-2" />
                    Play Again
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setView('sync')}
                    className="flex-1 border-brown-200 dark:border-brown-100/30 text-brown-600 dark:text-brown-300 hover:bg-brown-50 dark:hover:bg-brown-50/50"
                  >
                    <ArrowLeft className="size-4 mr-2" />
                    Back to Sync
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-cream px-4 py-6 pb-24 min-h-screen">
      <div className="mx-auto max-w-lg space-y-5">

        {/* Header */}
        <motion.div {...fadeInUp} transition={{ duration: 0.4 }}>
          <div className="flex items-center gap-3 mb-1">
            <button
              onClick={() => setView('sync')}
              className="flex items-center gap-1 text-sm text-brown-500 dark:text-brown-300 hover:text-brown-700 transition-colors"
            >
              <ArrowLeft className="size-4" />
            </button>
            <h1
              className="font-serif text-2xl font-bold text-brown-900 dark:text-brown-100"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Zodiac Game 🎮
            </h1>
          </div>
          <p className="text-sm text-brown-400 dark:text-brown-300 ml-7">
            Guess the compatibility between zodiac signs!
          </p>
        </motion.div>

        {/* Score Tracker */}
        <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.05 }}>
          <div className="flex items-center justify-center gap-6 rounded-xl bg-white dark:bg-white/5 shadow-md p-3">
            <div className="text-center">
              <p className="text-lg font-bold text-sage-dark">{game.correct}</p>
              <p className="text-[9px] uppercase tracking-wider text-brown-400">Correct</p>
            </div>
            <div className="h-8 w-px bg-brown-100 dark:bg-brown-100/30" />
            <div className="text-center">
              <p className="text-lg font-bold text-gold-dark">{game.wrong}</p>
              <p className="text-[9px] uppercase tracking-wider text-brown-400">Wrong</p>
            </div>
            <div className="h-8 w-px bg-brown-100 dark:bg-brown-100/30" />
            <div className="text-center">
              <p className="text-lg font-bold text-brown-700 dark:text-brown-300">{game.streak}</p>
              <p className="text-[9px] uppercase tracking-wider text-brown-400">Streak</p>
            </div>
            <div className="h-8 w-px bg-brown-100 dark:bg-brown-100/30" />
            <div className="text-center">
              <Badge className="bg-gold/10 text-gold-dark border-gold/20 text-xs">
                Round {game.currentRound + 1}/10
              </Badge>
            </div>
          </div>
        </motion.div>

        {/* Round: Sign Pair Display */}
        <AnimatePresence mode="wait">
          <motion.div
            key={game.currentRound}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-0 shadow-md bg-white dark:bg-white/5">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-brown-900 dark:text-brown-100">
                  <Gamepad2 className="size-5 text-gold" />
                  Guess the Compatibility
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Zodiac Pair Display */}
                <div className="flex items-center justify-center gap-6 py-6">
                  {/* Sign 1 */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-center"
                  >
                    <div className="flex size-20 items-center justify-center rounded-full bg-brown-50 dark:bg-brown-50/20 border-2 border-gold/20 mx-auto mb-2">
                      <span className="text-3xl">{ZODIAC_SYMBOLS[round.sign1]}</span>
                    </div>
                    <p className="text-sm font-semibold text-brown-900 dark:text-brown-100">{round.sign1}</p>
                    <Badge className={`${ELEMENT_COLORS[ZODIAC_ELEMENTS[round.sign1]]} border text-[9px] mt-1`}>
                      {ZODIAC_ELEMENTS[round.sign1]}
                    </Badge>
                  </motion.div>

                  {/* VS */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
                    className="flex size-12 items-center justify-center rounded-full bg-gold/10 border border-gold/20"
                  >
                    <span
                      className="font-serif text-lg font-bold text-gold-dark"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                    >
                      VS
                    </span>
                  </motion.div>

                  {/* Sign 2 */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-center"
                  >
                    <div className="flex size-20 items-center justify-center rounded-full bg-brown-50 dark:bg-brown-50/20 border-2 border-gold/20 mx-auto mb-2">
                      <span className="text-3xl">{ZODIAC_SYMBOLS[round.sign2]}</span>
                    </div>
                    <p className="text-sm font-semibold text-brown-900 dark:text-brown-100">{round.sign2}</p>
                    <Badge className={`${ELEMENT_COLORS[ZODIAC_ELEMENTS[round.sign2]]} border text-[9px] mt-1`}>
                      {ZODIAC_ELEMENTS[round.sign2]}
                    </Badge>
                  </motion.div>
                </div>

                {/* Guess Buttons */}
                <AnimatePresence mode="wait">
                  {!game.isRevealing ? (
                    <motion.div
                      key="guess-buttons"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-3 mt-4"
                    >
                      <p className="text-center text-xs text-brown-400 dark:text-brown-300 mb-3">
                        What&apos;s their compatibility level?
                      </p>
                      <div className="grid grid-cols-3 gap-3">
                        <Button
                          onClick={() => handleGuess('High')}
                          className="bg-sage hover:bg-sage-dark text-white font-semibold py-5"
                        >
                          <div className="text-center">
                            <p className="text-sm">High</p>
                            <p className="text-[9px] opacity-80">&gt;70%</p>
                          </div>
                        </Button>
                        <Button
                          onClick={() => handleGuess('Medium')}
                          className="bg-gold hover:bg-gold-dark text-white font-semibold py-5"
                        >
                          <div className="text-center">
                            <p className="text-sm">Medium</p>
                            <p className="text-[9px] opacity-80">40-70%</p>
                          </div>
                        </Button>
                        <Button
                          onClick={() => handleGuess('Low')}
                          className="bg-brown-500 hover:bg-brown-700 text-white font-semibold py-5"
                        >
                          <div className="text-center">
                            <p className="text-sm">Low</p>
                            <p className="text-[9px] opacity-80">&lt;40%</p>
                          </div>
                        </Button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="reveal"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                      className="text-center mt-4"
                    >
                      {/* Reveal Animation - Gold Circle Expanding */}
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        className="relative mx-auto mb-4"
                      >
                        <div className="flex size-28 items-center justify-center rounded-full bg-gradient-to-br from-gold/20 to-gold-dark/10 border-2 border-gold/30 mx-auto shadow-lg">
                          <div className="text-center">
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
                              className="text-2xl block"
                            >
                              🔔
                            </motion.span>
                            <motion.p
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.4 }}
                              className="font-serif text-3xl font-bold text-gold-dark dark:text-gold"
                              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                            >
                              {round.actualScore}%
                            </motion.p>
                          </div>
                        </div>
                      </motion.div>

                      {/* Result Badge */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        {game.guessedLevel === round.actualLevel ? (
                          <div className="inline-flex items-center gap-1.5 rounded-full bg-sage/10 border border-sage/30 px-4 py-1.5 mb-3">
                            <Sparkles className="size-3.5 text-sage-dark" />
                            <span className="text-sm font-bold text-sage-dark">Correct! ✨</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 rounded-full bg-gold/10 border border-gold/30 px-4 py-1.5 mb-3">
                            <span className="text-sm font-bold text-gold-dark dark:text-gold">
                              Wrong — It was {round.actualLevel}
                            </span>
                          </div>
                        )}
                      </motion.div>

                      {/* Level & Element Info */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="flex items-center justify-center gap-4 text-xs text-brown-400 dark:text-brown-300 mb-4"
                      >
                        <span>{ZODIAC_ELEMENTS[round.sign1]} × {ZODIAC_ELEMENTS[round.sign2]}</span>
                        <span>•</span>
                        <span>{ZODIAC_MODALITIES[round.sign1]} × {ZODIAC_MODALITIES[round.sign2]}</span>
                      </motion.div>

                      <Button
                        onClick={handleNextRound}
                        className="bg-brown-700 text-white hover:bg-brown-800 px-8"
                      >
                        {game.currentRound < 9 ? 'Next Round →' : 'See Results 🏆'}
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Zodiac Grid Reference */}
        <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.1 }}>
          <Card className="border-0 shadow-md bg-white dark:bg-white/5">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-brown-900 dark:text-brown-100">
                <Sparkles className="size-4 text-gold" />
                Quick Reference
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-2">
                {ZODIAC_SIGNS.map((sign) => (
                  <div
                    key={sign}
                    className="flex items-center gap-1.5 rounded-lg bg-brown-50 dark:bg-brown-50/10 p-1.5"
                  >
                    <span className="text-sm">{ZODIAC_SYMBOLS[sign]}</span>
                    <span className="text-[10px] text-brown-500 dark:text-brown-300 truncate">{sign}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
                <div className="rounded-lg bg-sage/5 border border-sage/10 p-2 text-center">
                  <span className="font-semibold text-sage-dark">High &gt;70%</span>
                  <br />
                  <span className="text-brown-400">Same/Compatible Elements</span>
                </div>
                <div className="rounded-lg bg-gold/5 border border-gold/10 p-2 text-center">
                  <span className="font-semibold text-gold-dark">Med 40-70%</span>
                  <br />
                  <span className="text-brown-400">Mixed Elements</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
