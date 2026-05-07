'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useAyuAstroStore, type OnboardingStep, type QuestionnaireAnswer } from '@/store/ayuastro-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  MapPin,
  User,
  CheckCircle2,
  Sparkles,
  Info,
} from 'lucide-react';
import { cosmicToast } from '@/lib/toast';
import { getApproximateZodiacPreview } from '@/lib/astrology/client-approx';

const INDIAN_CITIES: Record<string, { lat: number; lon: number }> = {
  'New Delhi': { lat: 28.6139, lon: 77.209 },
  Mumbai: { lat: 19.076, lon: 72.8777 },
  Bangalore: { lat: 12.9716, lon: 77.5946 },
  Chennai: { lat: 13.0827, lon: 80.2707 },
  Kolkata: { lat: 22.5726, lon: 88.3639 },
  Hyderabad: { lat: 17.385, lon: 78.4867 },
  Pune: { lat: 18.5204, lon: 73.8567 },
  Ahmedabad: { lat: 23.0225, lon: 72.5714 },
  Jaipur: { lat: 26.9124, lon: 75.7873 },
  Lucknow: { lat: 26.8467, lon: 80.9462 },
  Varanasi: { lat: 25.3176, lon: 83.0068 },
  Chandigarh: { lat: 30.7333, lon: 76.7794 },
  Bhopal: { lat: 23.2599, lon: 77.4126 },
  Patna: { lat: 25.6093, lon: 85.1376 },
  Guwahati: { lat: 26.1445, lon: 91.7362 },
  Thiruvananthapuram: { lat: 8.5241, lon: 76.9366 },
  Kochi: { lat: 9.9312, lon: 76.2673 },
  Indore: { lat: 22.7196, lon: 75.8577 },
  Nagpur: { lat: 21.1458, lon: 79.0882 },
  Surat: { lat: 21.1702, lon: 72.8311 },
};

const QUESTIONS = [
  // Emotional Category (4 questions)
  {
    id: 'q_emotional_1',
    text: 'I can easily sense when someone is upset, even before they say anything.',
    category: 'emotional' as const,
  },
  {
    id: 'q_emotional_2',
    text: 'I need significant alone time to recharge after emotionally intense situations.',
    category: 'emotional' as const,
  },
  {
    id: 'q_emotional_3',
    text: 'My emotions change quickly — I can go from calm to deeply moved in moments.',
    category: 'emotional' as const,
  },
  {
    id: 'q_emotional_4',
    text: 'I find it difficult to hide what I am truly feeling, even when I try.',
    category: 'emotional' as const,
  },
  // Social Category (4 questions)
  {
    id: 'q_social_1',
    text: 'In group settings, I naturally take on the role of mediator or peacemaker.',
    category: 'social' as const,
  },
  {
    id: 'q_social_2',
    text: 'I prefer deep one-on-one conversations over large social gatherings.',
    category: 'social' as const,
  },
  {
    id: 'q_social_3',
    text: 'I feel energized when I can help someone work through a personal problem.',
    category: 'social' as const,
  },
  {
    id: 'q_social_4',
    text: 'I sometimes feel drained after being around too many people, even if I enjoyed it.',
    category: 'social' as const,
  },
  // Behavioral Category (4 questions)
  {
    id: 'q_behavioral_1',
    text: 'When faced with a difficult decision, I trust my gut feeling over logical analysis.',
    category: 'behavioral' as const,
  },
  {
    id: 'q_behavioral_2',
    text: 'I tend to revisit past conversations and analyze what I could have said differently.',
    category: 'behavioral' as const,
  },
  {
    id: 'q_behavioral_3',
    text: 'I am more driven by a sense of inner purpose than by external rewards or recognition.',
    category: 'behavioral' as const,
  },
  {
    id: 'q_behavioral_4',
    text: 'When something excites me, I pursue it with full intensity — but I can lose interest just as quickly.',
    category: 'behavioral' as const,
  },
  // Relational Category (4 questions)
  {
    id: 'q_relational_1',
    text: 'I am deeply affected by the emotional tone of my close relationships.',
    category: 'relational' as const,
  },
  {
    id: 'q_relational_2',
    text: 'I often put others\' needs before my own, even when it costs me personally.',
    category: 'relational' as const,
  },
  {
    id: 'q_relational_3',
    text: 'I crave emotional depth in my relationships — surface-level connections leave me unsatisfied.',
    category: 'relational' as const,
  },
  {
    id: 'q_relational_4',
    text: 'I find it hard to fully trust someone until they have consistently shown they understand me.',
    category: 'relational' as const,
  },
];

const RELATIONSHIP_OPTIONS = ['Single', 'Partnered', "It's Complicated", 'Prefer Not to Say'];

const LIKERT_LABELS = ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
};

// ─── Star-field animation component ────────────────────────────────────────

function StarField() {
  const stars = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    x: 20 + Math.random() * 60,
    y: 10 + Math.random() * 30,
    size: 2 + Math.random() * 3,
    delay: i * 0.2,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full bg-gold/60"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 0.8, 0],
            scale: [0, 1, 0.5],
          }}
          transition={{
            duration: 2,
            delay: star.delay,
            repeat: Infinity,
            repeatDelay: 2,
          }}
        />
      ))}
    </div>
  );
}

// ─── Completion Celebration Overlay ─────────────────────────────────────────

function CelebrationOverlay({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-cream/95 dark:bg-[#1a1410]/95"
    >
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, duration: 0.6 }}
        className="text-7xl mb-6"
      >
        ✦
      </motion.div>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="font-serif text-2xl font-bold text-brown-900 dark:text-brown-100 text-center px-8"
        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
      >
        Analyzing Your Cosmic Identity...
      </motion.h2>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="mt-4"
      >
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="size-2 rounded-full bg-gold"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Birth Chart Preview Overlay ─────────────────────────────────────────────

const ZODIAC_SIGNS_LIST = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
const ZODIAC_SYMBOLS_MAP: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋', Leo: '♌', Virgo: '♍',
  Libra: '♎', Scorpio: '♏', Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
};

function BirthChartPreview({ onComplete, birthDetails }: { onComplete: () => void; birthDetails: { dateOfBirth: string; timeOfBirth: string; latitude: number; longitude: number } | null }) {
  const [phase, setPhase] = useState<'cycling' | 'revealed'>('cycling');
  const [cyclingSymbol, setCyclingSymbol] = useState(0);

  // Calculate zodiac signs using lightweight client-side approximation
  // Accurate calculations happen server-side via the API
  const zodiacResults = useMemo(() => {
    if (!birthDetails?.dateOfBirth) {
      return { sunSign: 'Capricorn', moonSign: 'Gemini', risingSign: 'Taurus' };
    }

    try {
      return getApproximateZodiacPreview({
        dateOfBirth: birthDetails.dateOfBirth,
        timeOfBirth: birthDetails.timeOfBirth || '12:00',
        latitude: birthDetails.latitude || 28.6139,
        longitude: birthDetails.longitude || 77.209,
      });
    } catch {
      // Fallback: simple sun sign calculation from date
      const dateStr = birthDetails.dateOfBirth;
      if (!dateStr) return { sunSign: 'Capricorn', moonSign: 'Gemini', risingSign: 'Taurus' };

      const month = parseInt(dateStr.split('-')[1]);
      const day = parseInt(dateStr.split('-')[2]);

      // Tropical sun sign (approximate)
      let signIndex: number;
      if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) signIndex = 0;
      else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) signIndex = 1;
      else if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) signIndex = 2;
      else if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) signIndex = 3;
      else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) signIndex = 4;
      else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) signIndex = 5;
      else if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) signIndex = 6;
      else if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) signIndex = 7;
      else if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) signIndex = 8;
      else if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) signIndex = 9;
      else if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) signIndex = 10;
      else signIndex = 11;

      return {
        sunSign: ZODIAC_SIGNS_LIST[signIndex],
        moonSign: ZODIAC_SIGNS_LIST[(signIndex + 4) % 12],
        risingSign: ZODIAC_SIGNS_LIST[(signIndex + 2) % 12],
      };
    }
  }, [birthDetails]);

  // Cycling animation for 2 seconds
  useEffect(() => {
    if (phase !== 'cycling') return;
    const interval = setInterval(() => {
      setCyclingSymbol((prev) => (prev + 1) % 12);
    }, 120);

    const timer = setTimeout(() => {
      setPhase('revealed');
    }, 2000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [phase]);

  // Auto-advance after reveal
  useEffect(() => {
    if (phase !== 'revealed') return;
    const timer = setTimeout(onComplete, 2500);
    return () => clearTimeout(timer);
  }, [phase, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-cream/95 dark:bg-[#1a1410]/95"
    >
      <div className="max-w-sm w-full mx-4">
        {phase === 'cycling' ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            {/* Cycling zodiac symbols */}
            <motion.div
              className="text-6xl mb-4"
              key={cyclingSymbol}
              initial={{ scale: 0.5, opacity: 0, rotate: -30 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ duration: 0.1 }}
            >
              {ZODIAC_SYMBOLS_MAP[ZODIAC_SIGNS_LIST[cyclingSymbol]]}
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="font-serif text-xl font-bold text-brown-900 dark:text-brown-100"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Generating your cosmic identity...
            </motion.h2>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-3"
            >
              <div className="flex gap-1.5 justify-center">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="size-2 rounded-full bg-gold"
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.12 }}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="bg-white dark:bg-white/5 rounded-2xl shadow-lg border border-gold/10 overflow-hidden"
          >
            {/* Gold top accent */}
            <div className="h-1.5 bg-gradient-to-r from-gold via-gold-light to-gold-dark" />

            <div className="p-6 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
                className="mb-4"
              >
                <div className="flex size-16 items-center justify-center rounded-full bg-gold/10 border border-gold/20 mx-auto">
                  <span className="text-3xl">{ZODIAC_SYMBOLS_MAP[zodiacResults.sunSign]}</span>
                </div>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="font-serif text-xl font-bold text-brown-900 dark:text-brown-100 mb-4"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Your Cosmic Identity ✦
              </motion.h2>

              <div className="space-y-3">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center gap-3 rounded-xl bg-brown-50 dark:bg-brown-50/20 p-3"
                >
                  <span className="text-2xl">☉</span>
                  <div className="text-left flex-1">
                    <p className="text-[10px] uppercase tracking-wider text-brown-400 dark:text-brown-300">Your Sun Sign</p>
                    <p className="text-sm font-semibold text-brown-900 dark:text-brown-100">
                      {zodiacResults.sunSign} {ZODIAC_SYMBOLS_MAP[zodiacResults.sunSign]}
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center gap-3 rounded-xl bg-brown-50 dark:bg-brown-50/20 p-3"
                >
                  <span className="text-2xl">☽</span>
                  <div className="text-left flex-1">
                    <p className="text-[10px] uppercase tracking-wider text-brown-400 dark:text-brown-300">Moon Sign</p>
                    <p className="text-sm font-semibold text-brown-900 dark:text-brown-100">
                      {zodiacResults.moonSign} {ZODIAC_SYMBOLS_MAP[zodiacResults.moonSign]}
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex items-center gap-3 rounded-xl bg-brown-50 dark:bg-brown-50/20 p-3"
                >
                  <span className="text-2xl">⬆</span>
                  <div className="text-left flex-1">
                    <p className="text-[10px] uppercase tracking-wider text-brown-400 dark:text-brown-300">Rising Sign</p>
                    <p className="text-sm font-semibold text-brown-900 dark:text-brown-100">
                      {zodiacResults.risingSign} {ZODIAC_SYMBOLS_MAP[zodiacResults.risingSign]}
                    </p>
                  </div>
                </motion.div>
              </div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-xs text-brown-400 dark:text-brown-300 mt-4"
              >
                Preparing your full cosmic analysis...
              </motion.p>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Questionnaire Encouragement Messages ──────────────────────────────────

function getEncouragement(count: number): string {
  if (count <= 4) return 'Every answer reveals a layer of your emotional architecture';
  if (count <= 8) return 'You\'re uncovering deep patterns ✦';
  if (count <= 12) return 'Almost there — your cosmic portrait is taking shape ✦';
  return 'Beautiful. Your emotional blueprint is complete ✦';
}

// ─── Main OnboardingView ──────────────────────────────────────────────────

export default function OnboardingView() {
  const {
    onboardingStep,
    setOnboardingStep,
    nextOnboardingStep,
    prevOnboardingStep,
    birthDetails,
    setBirthDetails,
    questionnaireAnswers,
    addQuestionnaireAnswer,
    setView,
    setQuestionnaireAnswers,
    setAstrologyData,
    setNumerologyData,
    setTraitScores,
    setReportSections,
    setReportSummary,
    setLoading,
    setError,
  } = useAyuAstroStore();

  const [direction, setDirection] = useState(0);
  const [localName, setLocalName] = useState(birthDetails?.name || '');
  const [localDob, setLocalDob] = useState(birthDetails?.dateOfBirth || '');
  const [localTob, setLocalTob] = useState(birthDetails?.timeOfBirth || '');
  const [localPlace, setLocalPlace] = useState(birthDetails?.placeOfBirth || 'Mumbai');
  const [localGender, setLocalGender] = useState(birthDetails?.gender || '');
  const [localRelationship, setLocalRelationship] = useState(
    birthDetails?.relationshipStatus || ''
  );

  // When birthDetails is null (after reset), clear all local state to ensure fresh start
  useEffect(() => {
    if (!birthDetails) {
      setLocalName('');
      setLocalDob('');
      setLocalTob('');
      setLocalPlace('Mumbai');
      setLocalGender('');
      setLocalRelationship('');
    }
  }, [birthDetails]);

  const [showCelebration, setShowCelebration] = useState(false);
  const [showBirthChartPreview, setShowBirthChartPreview] = useState(false);
  const [celebrationHandled, setCelebrationHandled] = useState(false);
  const hasShownWelcomeToast = useRef(false);

  const handleNext = () => {
    if (onboardingStep === 'name') {
      setBirthDetails({ name: localName });
    } else if (onboardingStep === 'birth') {
      const cityData = INDIAN_CITIES[localPlace];
      setBirthDetails({
        name: localName,
        dateOfBirth: localDob,
        timeOfBirth: localTob,
        placeOfBirth: localPlace,
        latitude: cityData?.lat ?? 28.6139,
        longitude: cityData?.lon ?? 77.209,
        timezone: 'Asia/Kolkata',
        gender: localGender,
      });
    } else if (onboardingStep === 'relationship') {
      setBirthDetails({ relationshipStatus: localRelationship });
    } else if (onboardingStep === 'questionnaire') {
      // Show celebration overlay instead of directly going to complete
      setShowCelebration(true);
      setCelebrationHandled(false);
      return;
    }
    setDirection(1);
    nextOnboardingStep();
  };

  const handleBack = () => {
    setDirection(-1);
    prevOnboardingStep();
  };

  const handleCelebrationComplete = () => {
    setShowCelebration(false);
    if (!celebrationHandled) {
      setCelebrationHandled(true);
      // Show birth chart preview instead of directly going to complete
      setShowBirthChartPreview(true);
    }
  };

  const handleBirthChartPreviewComplete = () => {
    setShowBirthChartPreview(false);
    setDirection(1);
    nextOnboardingStep(); // goes to 'complete'
  };

  const handleQuestionnaireAnswer = (questionId: string, score: number, category: QuestionnaireAnswer['category']) => {
    addQuestionnaireAnswer({
      questionId,
      answer: LIKERT_LABELS[score - 1],
      category,
      score,
    });
  };

  const getQuestionAnswer = (questionId: string): number => {
    const found = questionnaireAnswers.find((a) => a.questionId === questionId);
    return found?.score ?? 0;
  };

  const answeredCount = questionnaireAnswers.length;
  const totalQuestions = QUESTIONS.length;
  const progressPercent = (answeredCount / totalQuestions) * 100;

  const canProceed = () => {
    switch (onboardingStep) {
      case 'name':
        return localName.trim().length >= 2;
      case 'birth':
        return localDob.length > 0 && localTob.length > 0 && localPlace.length > 0;
      case 'relationship':
        return localRelationship.length > 0;
      case 'questionnaire':
        return answeredCount === totalQuestions;
      case 'preview':
      case 'complete':
        return true;
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    setView('calculating');
    setLoading(true, 'Mapping your cosmic blueprint...');

    try {
      const response = await fetch('/api/process-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: birthDetails?.name,
          dateOfBirth: birthDetails?.dateOfBirth,
          timeOfBirth: birthDetails?.timeOfBirth,
          placeOfBirth: birthDetails?.placeOfBirth,
          latitude: birthDetails?.latitude,
          longitude: birthDetails?.longitude,
          timezone: birthDetails?.timezone || 'Asia/Kolkata',
          gender: birthDetails?.gender,
          relationshipStatus: birthDetails?.relationshipStatus,
          questionnaireAnswers: questionnaireAnswers,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process your data');
      }

      const data = await response.json();

      // Map API response to store - API wraps in data.data
      const result = data.data || data;

      if (result.astrology) {
        setAstrologyData({
          sunSign: result.astrology.sunSign,
          moonSign: result.astrology.moonSign,
          ascendant: result.astrology.ascendant,
          nakshatra: typeof result.astrology.nakshatra === 'string' ? result.astrology.nakshatra : result.astrology.nakshatra?.name || '',
          currentDasha: result.astrology.dashaPeriods?.currentMahadasha
            ? `${result.astrology.dashaPeriods.currentMahadasha.planet}${result.astrology.dashaPeriods.currentAntardasha ? '/' + result.astrology.dashaPeriods.currentAntardasha.planet : ''}`
            : '',
          yogas: (result.astrology.yogas || []).filter((y: { present: boolean }) => y.present).map((y: { name: string }) => y.name),
          doshas: (result.astrology.doshas || []).filter((d: { present: boolean }) => d.present).map((d: { name: string }) => d.name),
          planetaryPositions: Object.fromEntries(
            Object.entries(result.astrology.planetaryPositions || {}).map(([key, pos]: [string, unknown]) => {
              const p = pos as { sign: string; degreeInSign: number; house?: number; isRetrograde?: boolean };
              return [key, { sign: p.sign, degree: p.degreeInSign, house: p.house || 1, retrograde: p.isRetrograde || false }];
            })
          ),
        });
      }
      if (result.numerology) setNumerologyData({
        lifePathNumber: result.numerology.lifePathNumber,
        destinyNumber: result.numerology.destinyNumber,
        soulUrgeNumber: result.numerology.soulUrgeNumber,
        personalityNumber: result.numerology.personalityNumber,
        lifePathDesc: result.numerology.descriptions?.lifePath || '',
        destinyDesc: result.numerology.descriptions?.destiny || '',
        soulUrgeDesc: result.numerology.descriptions?.soulUrge || '',
      });
      if (result.traits) setTraitScores(result.traits);
      if (result.report) {
        if (result.report.sections) setReportSections(result.report.sections);
        if (result.report.summary) setReportSummary(result.report.summary);
      }

      // Show welcome toast
      cosmicToast.cosmic(`Welcome, ${birthDetails?.name || 'Seeker'}! ✦`, 'Your cosmic journey begins...');

      setLoading(false);
      setView('insights');
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setView('onboarding');
      setOnboardingStep('complete');
    }
  };

  // Auto-submit on complete step
  useEffect(() => {
    if (onboardingStep === 'complete') {
      const timer = setTimeout(() => {
        handleSubmit();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [onboardingStep]);

  // Show welcome toast once when name step first appears
  useEffect(() => {
    if (onboardingStep === 'name' && !hasShownWelcomeToast.current && birthDetails?.name) {
      hasShownWelcomeToast.current = true;
    }
  }, [onboardingStep, birthDetails?.name]);

  const renderStep = () => {
    switch (onboardingStep) {
      case 'name':
        return (
          <motion.div
            key="name"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <Card className="border-0 shadow-sm bg-white dark:bg-white/5">
              <CardContent className="p-6 relative">
                {/* Star-field effect */}
                <StarField />
                <div className="mb-2 relative z-10">
                  <motion.div
                    key={onboardingStep}
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                  >
                    <Badge className="bg-sage-muted text-sage-dark text-xs">Step 1 of 4</Badge>
                  </motion.div>
                </div>
                <h2
                  className="font-serif text-2xl font-bold text-brown-900 mb-2 relative z-10"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  What should we call you?
                </h2>
                <p className="text-sm text-brown-400 mb-6 relative z-10">
                  Your name carries vibrational energy that shapes your numerological blueprint.
                </p>

                <div className="space-y-3 relative z-10">
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                  >
                    <Label htmlFor="name" className="text-sm font-medium text-brown-700">
                      Your Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-brown-300" />
                      <Input
                        id="name"
                        value={localName}
                        onChange={(e) => setLocalName(e.target.value)}
                        placeholder="Enter your name"
                        className="pl-10 border-brown-200 bg-cream dark:bg-cream-dark focus:border-gold focus:ring-gold/20 dark:focus:border-gold dark:focus:ring-gold/10 transition-shadow"
                      />
                    </div>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );

      case 'birth':
        return (
          <motion.div
            key="birth"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <Card className="border-0 shadow-sm bg-white dark:bg-white/5">
              <CardContent className="p-6">
                <div className="mb-2">
                  <motion.div
                    key={onboardingStep}
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                  >
                    <Badge className="bg-sage-muted text-sage-dark text-xs">Phase 1: Coordinates</Badge>
                    <span className="ml-2 text-xs text-brown-400">Step 2 of 4</span>
                  </motion.div>
                </div>
                <h2
                  className="font-serif text-2xl font-bold text-brown-900 mb-2"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  Your Cosmic Origin
                </h2>
                <p className="text-sm text-brown-400 mb-6">
                  The stars were arranged in a specific pattern at the moment of your birth.
                </p>

                <div className="space-y-4">
                  {[0,1,2,3,4,5].map((fieldIdx) => {
                    if (fieldIdx === 0) return (
                      <motion.div key={fieldIdx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: fieldIdx * 0.05 }}>
                        <Label className="text-sm font-medium text-brown-700">Name</Label>
                        <div className="relative mt-1">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-brown-300" />
                          <Input
                            value={localName}
                            onChange={(e) => setLocalName(e.target.value)}
                            className="pl-10 border-brown-200 bg-cream dark:bg-cream-dark focus:border-gold focus:ring-gold/20 dark:focus:border-gold dark:focus:ring-gold/10 transition-shadow"
                          />
                        </div>
                      </motion.div>
                    );
                    if (fieldIdx === 1) return (
                      <motion.div key={fieldIdx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: fieldIdx * 0.05 }}>
                        <Label className="text-sm font-medium text-brown-700">Date of Birth</Label>
                        <div className="relative mt-1">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-brown-300" />
                          <Input
                            type="date"
                            value={localDob}
                            onChange={(e) => setLocalDob(e.target.value)}
                            className="pl-10 border-brown-200 bg-cream dark:bg-cream-dark focus:border-gold focus:ring-gold/20 dark:focus:border-gold dark:focus:ring-gold/10 transition-shadow"
                          />
                        </div>
                      </motion.div>
                    );
                    if (fieldIdx === 2) return (
                      <motion.div key={fieldIdx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: fieldIdx * 0.05 }}>
                        <div className="flex items-center gap-2">
                          <Label className="text-sm font-medium text-brown-700">Time of Birth</Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="size-3.5 text-brown-300 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent className="bg-brown-900 text-cream text-xs max-w-[200px]">
                                Exact time gives more accurate results ✦
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <div className="relative mt-1">
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-brown-300" />
                          <Input
                            type="time"
                            value={localTob}
                            onChange={(e) => setLocalTob(e.target.value)}
                            className="pl-10 border-brown-200 bg-cream dark:bg-cream-dark focus:border-gold focus:ring-gold/20 dark:focus:border-gold dark:focus:ring-gold/10 transition-shadow"
                          />
                        </div>
                      </motion.div>
                    );
                    if (fieldIdx === 3) return (
                      <motion.div key={fieldIdx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: fieldIdx * 0.05 }}>
                        <Label className="text-sm font-medium text-brown-700">Place of Birth</Label>
                        <div className="relative mt-1">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-brown-300" />
                          <Input
                            value={localPlace}
                            onChange={(e) => setLocalPlace(e.target.value)}
                            placeholder="e.g. Mumbai, New Delhi"
                            list="indian-cities"
                            className="pl-10 border-brown-200 bg-cream dark:bg-cream-dark focus:border-gold focus:ring-gold/20 dark:focus:border-gold dark:focus:ring-gold/10 transition-shadow"
                          />
                          <datalist id="indian-cities">
                            {Object.keys(INDIAN_CITIES).map((city) => (
                              <option key={city} value={city} />
                            ))}
                          </datalist>
                        </div>
                      </motion.div>
                    );
                    if (fieldIdx === 4) return (
                      <motion.div key={fieldIdx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: fieldIdx * 0.05 }}>
                        <Label className="text-sm font-medium text-brown-700">Gender</Label>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {['Male', 'Female', 'Other'].map((g) => (
                            <button
                              key={g}
                              onClick={() => setLocalGender(g.toLowerCase())}
                              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                                localGender === g.toLowerCase()
                                  ? 'bg-brown-700 text-white'
                                  : 'bg-brown-50 dark:bg-brown-50/20 text-brown-600 dark:text-brown-300 hover:bg-brown-100 dark:hover:bg-brown-100'
                              }`}
                            >
                              {g}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    );
                    return null;
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );

      case 'relationship':
        return (
          <motion.div
            key="relationship"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <Card className="border-0 shadow-sm bg-white dark:bg-white/5">
              <CardContent className="p-6">
                <div className="mb-2">
                  <motion.div
                    key={onboardingStep}
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                  >
                    <Badge className="bg-sage-muted text-sage-dark text-xs">Step 3 of 4</Badge>
                  </motion.div>
                </div>
                <h2
                  className="font-serif text-2xl font-bold text-brown-900 mb-2"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  Relational Dynamics
                </h2>
                <p className="text-sm text-brown-400 mb-6">
                  Your relationship status influences how emotional patterns manifest in your life.
                </p>

                <div className="space-y-3">
                  {RELATIONSHIP_OPTIONS.map((option) => (
                    <button
                      key={option}
                      onClick={() => setLocalRelationship(option)}
                      className={`flex w-full items-center gap-3 rounded-xl border-2 px-5 py-4 text-left transition-all ${
                        localRelationship === option
                          ? option === 'Partnered'
                            ? 'border-gold bg-gold/5 text-brown-900'
                            : 'border-brown-700 bg-brown-50 text-brown-900'
                          : 'border-brown-100 dark:border-brown-100 bg-white dark:bg-white/5 text-brown-500 hover:border-brown-200 hover:bg-brown-50/50 dark:hover:bg-white/10'
                      }`}
                    >
                      <div
                        className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 ${
                          localRelationship === option
                            ? option === 'Partnered'
                              ? 'border-gold bg-gold'
                              : 'border-brown-700 bg-brown-700'
                            : 'border-brown-200 dark:border-brown-200'
                        }`}
                      >
                        {localRelationship === option && (
                          <div className="size-2 rounded-full bg-white" />
                        )}
                      </div>
                      <span className="text-sm font-medium">{option}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );

      case 'questionnaire':
        return (
          <motion.div
            key="questionnaire"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <Badge className="bg-sage-muted text-sage-dark text-xs">Phase 2: Inner Architecture</Badge>
                <span className="text-xs text-brown-400">
                  {answeredCount}/{totalQuestions}
                </span>
              </div>
              <Progress value={progressPercent} className="h-1.5 bg-brown-100" />
              {/* Encouragement message */}
              <motion.p
                key={answeredCount}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="text-xs text-brown-400 dark:text-brown-500 mt-2 italic text-center"
              >
                {getEncouragement(answeredCount)}
              </motion.p>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {QUESTIONS.map((q, i) => {
                const currentAnswer = getQuestionAnswer(q.id);
                return (
                  <motion.div
                    key={q.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card className="border-0 shadow-sm bg-white dark:bg-white/5">
                      <CardContent className="p-5">
                        <div className="flex items-start gap-2 mb-3">
                          <Badge
                            variant="outline"
                            className={`text-[10px] shrink-0 ${
                              q.category === 'emotional'
                                ? 'border-gold/30 text-gold-dark'
                                : q.category === 'social'
                                ? 'border-sage-dark/30 text-sage-dark'
                                : q.category === 'behavioral'
                                ? 'border-brown-400/30 text-brown-500'
                                : 'border-brown-700/30 text-brown-700'
                            }`}
                          >
                            {q.category}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium text-brown-900 mb-4 leading-relaxed">
                          {q.text}
                        </p>
                        <div className="flex gap-1">
                          {LIKERT_LABELS.map((label, scoreIdx) => {
                            const score = scoreIdx + 1;
                            const isSelected = currentAnswer === score;
                            return (
                              <button
                                key={score}
                                onClick={() => handleQuestionnaireAnswer(q.id, score, q.category)}
                                className={`flex flex-1 flex-col items-center gap-1 rounded-lg py-2 text-center transition-all ${
                                  isSelected
                                    ? 'bg-brown-700 text-white scale-105'
                                    : 'bg-brown-50 dark:bg-brown-50/20 text-brown-400 dark:text-brown-300 hover:bg-brown-100 dark:hover:bg-brown-100'
                                }`}
                                title={label}
                              >
                                <span className="text-xs font-semibold">{score}</span>
                              </button>
                            );
                          })}
                        </div>
                        {currentAnswer > 0 && (
                          <p className="mt-2 text-center text-xs text-brown-400">
                            {LIKERT_LABELS[currentAnswer - 1]}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        );

      case 'complete':
        return (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full text-center py-12"
          >
            <motion.div
              animate={{
                scale: [1, 1.15, 1],
              }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="mb-6 flex justify-center"
            >
              <div className="flex size-20 items-center justify-center rounded-full bg-gold/10">
                <Sparkles className="size-10 text-gold" />
              </div>
            </motion.div>
            <h2
              className="font-serif text-2xl font-bold text-brown-900 mb-3"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Your cosmic blueprint is being mapped...
            </h2>
            <p className="text-sm text-brown-400">
              We are analyzing your Vedic chart, numerological vibrations, and behavioral patterns.
            </p>
            <div className="mt-6">
              <CheckCircle2 className="mx-auto size-6 text-sage-dark animate-pulse-soft" />
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  // Calculate overall progress (0-100) based on step
  const stepProgress: Record<string, number> = { name: 20, birth: 40, relationship: 60, questionnaire: 80, preview: 90, complete: 100 };
  const overallProgress = stepProgress[onboardingStep] || 0;

  return (
    <div className="min-h-screen bg-cream px-4 py-6 relative">
      {/* Full-width gold progress bar at top */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-brown-100/50">
        <motion.div
          className="h-full"
          style={{ background: 'linear-gradient(90deg, #B8960C, #D4AF37, #F0C14B)' }}
          initial={{ width: 0 }}
          animate={{ width: `${overallProgress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      {/* Floating gold particles background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {[0,1,2,3,4,5].map(p => (
          <motion.div
            key={p}
            className="absolute rounded-full bg-gold/30"
            style={{
              width: 2 + (p % 3),
              height: 2 + (p % 3),
              left: `${10 + p * 16}%`,
              top: `${15 + (p * 13) % 70}%`,
            }}
            animate={{
              y: [0, -20, 0],
              x: [0, (p % 2 === 0 ? 6 : -6), 0],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 5 + p,
              repeat: Infinity,
              delay: p * 0.8,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      <div className="mx-auto max-w-lg relative z-10">
        {/* Celebration overlay */}
        <AnimatePresence>
          {showCelebration && (
            <CelebrationOverlay onComplete={handleCelebrationComplete} />
          )}
        </AnimatePresence>

        {/* Birth chart preview overlay */}
        <AnimatePresence>
          {showBirthChartPreview && (
            <BirthChartPreview
              onComplete={handleBirthChartPreviewComplete}
              birthDetails={birthDetails}
            />
          )}
        </AnimatePresence>

        {/* Back button (not on name or complete steps) */}
        {onboardingStep !== 'name' && onboardingStep !== 'complete' && (
          <button
            onClick={handleBack}
            className="mb-4 flex items-center gap-1 text-sm text-brown-500 dark:text-brown-300 hover:text-brown-700 transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back
          </button>
        )}

        {/* Step content with animation */}
        <AnimatePresence mode="wait" custom={direction}>
          {renderStep()}
        </AnimatePresence>

        {/* Navigation buttons */}
        {onboardingStep !== 'complete' && onboardingStep !== 'questionnaire' && (
          <div className="mt-6 flex justify-end">
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="bg-brown-700 px-8 text-white hover:bg-brown-800 disabled:opacity-40 relative overflow-hidden group"
            >
              <span className="absolute inset-0 w-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <span className="relative">Continue</span>
              <ArrowRight className="ml-2 size-4 relative" />
            </Button>
          </div>
        )}

        {onboardingStep === 'questionnaire' && (
          <div className="mt-6 flex justify-between">
            <button
              onClick={handleBack}
              className="flex items-center gap-1 text-sm text-brown-500 hover:text-brown-700 transition-colors"
            >
              <ArrowLeft className="size-4" />
              Back
            </button>
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="bg-brown-700 px-8 text-white hover:bg-brown-800 disabled:opacity-40 relative overflow-hidden group"
            >
              <span className="absolute inset-0 w-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <span className="relative">Complete Analysis</span>
              <ArrowRight className="ml-2 size-4 relative" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
