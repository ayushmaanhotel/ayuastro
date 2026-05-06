'use client';

import { useState, useEffect } from 'react';
import { useAyuAstroStore, type OnboardingStep, type QuestionnaireAnswer } from '@/store/ayuastro-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
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
} from 'lucide-react';

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
    id: 'q_relational_1',
    text: 'I am deeply affected by the emotional tone of my close relationships.',
    category: 'relational' as const,
  },
  {
    id: 'q_relational_2',
    text: 'I often put others\' needs before my own, even when it costs me personally.',
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
  const [localPlace, setLocalPlace] = useState(birthDetails?.placeOfBirth || '');
  const [localGender, setLocalGender] = useState(birthDetails?.gender || '');
  const [localRelationship, setLocalRelationship] = useState(
    birthDetails?.relationshipStatus || ''
  );

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
    }
    setDirection(1);
    nextOnboardingStep();
  };

  const handleBack = () => {
    setDirection(-1);
    prevOnboardingStep();
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

      if (data.astrology) setAstrologyData(data.astrology);
      if (data.numerology) setNumerologyData(data.numerology);
      if (data.traits) setTraitScores(data.traits);
      if (data.reportSections) setReportSections(data.reportSections);
      if (data.summary) setReportSummary(data.summary);

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
            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="p-6">
                <div className="mb-2">
                  <Badge className="bg-sage-muted text-sage-dark text-xs">Step 1 of 4</Badge>
                </div>
                <h2
                  className="font-serif text-2xl font-bold text-brown-900 mb-2"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  What should we call you?
                </h2>
                <p className="text-sm text-brown-400 mb-6">
                  Your name carries vibrational energy that shapes your numerological blueprint.
                </p>

                <div className="space-y-3">
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
                      className="pl-10 border-brown-200 bg-cream focus:border-brown-500 focus:ring-brown-500/20"
                    />
                  </div>
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
            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="p-6">
                <div className="mb-2">
                  <Badge className="bg-sage-muted text-sage-dark text-xs">Phase 1: Coordinates</Badge>
                  <span className="ml-2 text-xs text-brown-400">Step 2 of 4</span>
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
                  <div>
                    <Label className="text-sm font-medium text-brown-700">Name</Label>
                    <div className="relative mt-1">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-brown-300" />
                      <Input
                        value={localName}
                        onChange={(e) => setLocalName(e.target.value)}
                        className="pl-10 border-brown-200 bg-cream focus:border-brown-500 focus:ring-brown-500/20"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-brown-700">Date of Birth</Label>
                    <div className="relative mt-1">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-brown-300" />
                      <Input
                        type="date"
                        value={localDob}
                        onChange={(e) => setLocalDob(e.target.value)}
                        className="pl-10 border-brown-200 bg-cream focus:border-brown-500 focus:ring-brown-500/20"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-brown-700">Time of Birth</Label>
                    <div className="relative mt-1">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-brown-300" />
                      <Input
                        type="time"
                        value={localTob}
                        onChange={(e) => setLocalTob(e.target.value)}
                        className="pl-10 border-brown-200 bg-cream focus:border-brown-500 focus:ring-brown-500/20"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-brown-700">Place of Birth</Label>
                    <div className="relative mt-1">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-brown-300" />
                      <Input
                        value={localPlace}
                        onChange={(e) => setLocalPlace(e.target.value)}
                        placeholder="e.g. Mumbai, New Delhi"
                        list="indian-cities"
                        className="pl-10 border-brown-200 bg-cream focus:border-brown-500 focus:ring-brown-500/20"
                      />
                      <datalist id="indian-cities">
                        {Object.keys(INDIAN_CITIES).map((city) => (
                          <option key={city} value={city} />
                        ))}
                      </datalist>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-brown-700">Gender</Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {['Male', 'Female', 'Other'].map((g) => (
                        <button
                          key={g}
                          onClick={() => setLocalGender(g.toLowerCase())}
                          className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                            localGender === g.toLowerCase()
                              ? 'bg-brown-700 text-white'
                              : 'bg-brown-50 text-brown-600 hover:bg-brown-100'
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
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
            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="p-6">
                <div className="mb-2">
                  <Badge className="bg-sage-muted text-sage-dark text-xs">Step 3 of 4</Badge>
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
                          : 'border-brown-100 bg-white text-brown-500 hover:border-brown-200 hover:bg-brown-50/50'
                      }`}
                    >
                      <div
                        className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 ${
                          localRelationship === option
                            ? option === 'Partnered'
                              ? 'border-gold bg-gold'
                              : 'border-brown-700 bg-brown-700'
                            : 'border-brown-200'
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
                    <Card className="border-0 shadow-sm bg-white">
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
                                    : 'bg-brown-50 text-brown-400 hover:bg-brown-100'
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

  return (
    <div className="min-h-screen bg-cream px-4 py-6">
      <div className="mx-auto max-w-lg">
        {/* Back button (not on name or complete steps) */}
        {onboardingStep !== 'name' && onboardingStep !== 'complete' && (
          <button
            onClick={handleBack}
            className="mb-4 flex items-center gap-1 text-sm text-brown-500 hover:text-brown-700 transition-colors"
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
              className="bg-brown-700 px-8 text-white hover:bg-brown-800 disabled:opacity-40"
            >
              Continue
              <ArrowRight className="ml-2 size-4" />
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
              className="bg-brown-700 px-8 text-white hover:bg-brown-800 disabled:opacity-40"
            >
              Complete Analysis
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
