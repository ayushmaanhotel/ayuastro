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
  ArrowLeft,
  ChevronDown,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Brain,
  PenLine,
  Activity,
  Zap,
  Eye,
  RefreshCw,
  Crown,
  Gem,
  Sun,
  Moon,
  Shield,
  Star,
  Flame,
  Heart,
  CircleDot,
  BookOpen,
  ArrowRightLeft,
  Compass,
  Orbit,
  Users,
  TrendingUp,
  Gauge,
} from 'lucide-react';

// ─── Yoga Detail Data ────────────────────────────────────────────────────────

interface YogaDetail {
  name: string;
  sanskrit: string;
  emoji: string;
  summary: string;
  description: string;
  houses: string;
  planets: string;
  emotionalInterpretation: string;
}

const YOGA_DETAILS: Record<string, YogaDetail> = {
  'Gaj Kesari Yoga': {
    name: 'Gaj Kesari Yoga',
    sanskrit: 'गजकेसरी योग',
    emoji: '🦁',
    summary: 'Wisdom & courage combine to create natural leadership',
    description: 'When Jupiter and the Moon form an auspicious relationship in your chart, they create the Gaj Kesari Yoga — the "Elephant-Lion" combination. This grants you both the gentle wisdom of the elephant and the bold confidence of the lion, making you someone others naturally turn to for guidance.',
    houses: 'Jupiter and Moon in kendras (1st, 4th, 7th, 10th) from each other',
    planets: 'Jupiter (Guru) & Moon (Chandra)',
    emotionalInterpretation: 'Emotionally, this yoga gives you a rare combination of deep feeling and wise perspective. You can hold intense emotions without being overwhelmed by them, and you naturally help others process their feelings. Your emotional resilience is grounded in genuine optimism, not denial.',
  },
  'Budh Aditya Yoga': {
    name: 'Budh Aditya Yoga',
    sanskrit: 'बुधादित्य योग',
    emoji: '☀️',
    summary: 'Intellect and vitality merge for sharp communication',
    description: 'The conjunction of Sun and Mercury creates Budh Aditya Yoga, the "Intellectual Radiance" combination. Your mind works with clarity and purpose — you articulate complex ideas effortlessly and process information with remarkable speed.',
    houses: 'Sun and Mercury in the same house (not combust)',
    planets: 'Sun (Surya) & Mercury (Budh)',
    emotionalInterpretation: 'This yoga shapes how you process emotions intellectually. You tend to understand your feelings by naming and analyzing them before fully experiencing them.',
  },
  'Raj Yoga': {
    name: 'Raj Yoga',
    sanskrit: 'राजयोग',
    emoji: '👑',
    summary: 'Karmic and trikona lords unite for influence and purpose',
    description: 'Raj Yoga arises when the lords of kendra and trikona houses form a relationship. This grants leadership potential, recognition, and a sense of life purpose.',
    houses: 'Kendra lords (1st, 4th, 7th, 10th) & Trikona lords (1st, 5th, 9th) conjunct or aspecting',
    planets: 'Kendra & Trikona lords (varies by ascendant)',
    emotionalInterpretation: 'With Raj Yoga, you carry an innate sense of responsibility and purpose.',
  },
  'Dhana Yoga': {
    name: 'Dhana Yoga',
    sanskrit: 'धनयोग',
    emoji: '💎',
    summary: 'Wealth-giving planetary combinations create abundance',
    description: 'Dhana Yoga forms when the lords of wealth-indicating houses connect with the lords of trinal houses. This suggests natural financial acumen and an ability to attract resources.',
    houses: '2nd & 11th lords connecting with 1st, 5th, or 9th lords',
    planets: '2nd Lord, 11th Lord with Kendra/Trikona lords',
    emotionalInterpretation: 'Dhana Yoga shapes your relationship with security and self-worth.',
  },
  'Neech Bhang Raj Yoga': {
    name: 'Neech Bhang Raj Yoga',
    sanskrit: 'नीचभङ्गराजयोग',
    emoji: '🦅',
    summary: 'A debilitated planet is lifted — struggle transforms into strength',
    description: 'Neech Bhang Raj Yoga arises when a debilitated planet receives cancellation. Your struggles become the raw material of your power.',
    houses: 'Debilitated planet receiving cancellation',
    planets: 'Varies',
    emotionalInterpretation: 'Your emotional wounds are not permanent limitations — they are the foundation of your emotional wisdom.',
  },
  'Chandra Mangal Yoga': {
    name: 'Chandra Mangal Yoga',
    sanskrit: 'चन्द्रमङ्गल योग',
    emoji: '🔥',
    summary: 'Emotional depth meets driven energy for passionate action',
    description: 'Moon and Mars create the "Emotional Fire" combination — someone who acts on their feelings with intensity and conviction.',
    houses: 'Moon and Mars in the same house or in mutual aspect',
    planets: 'Moon (Chandra) & Mars (Mangal)',
    emotionalInterpretation: 'This yoga amplifies your emotional intensity.',
  },
  'Hansa Yoga': {
    name: 'Hansa Yoga',
    sanskrit: 'हंसयोग',
    emoji: '🦢',
    summary: 'Jupiter at peak strength grants wisdom and spiritual depth',
    description: 'Hansa Yoga forms when Jupiter is exalted or in its own sign in a kendra house.',
    houses: 'Jupiter exalted or own sign in 1st, 4th, 7th, or 10th',
    planets: 'Jupiter (Guru)',
    emotionalInterpretation: 'Hansa Yoga gives you an emotional maturity that others find grounding.',
  },
  'Malavya Yoga': {
    name: 'Malavya Yoga',
    sanskrit: 'मालव्ययोग',
    emoji: '🌹',
    summary: 'Venus at peak strength brings beauty and relational grace',
    description: 'Malavya Yoga arises when Venus is exalted or in its own sign in a kendra house.',
    houses: 'Venus exalted or own sign in 1st, 4th, 7th, or 10th',
    planets: 'Venus (Shukra)',
    emotionalInterpretation: 'Your emotional life is deeply connected to beauty and harmony.',
  },
  'Shasha Yoga': {
    name: 'Shasha Yoga',
    sanskrit: 'शशयोग',
    emoji: '🏔️',
    summary: 'Saturn at peak strength delivers endurance and lasting achievement',
    description: 'Shasha Yoga forms when Saturn is exalted or in its own sign in a kendra house.',
    houses: 'Saturn exalted or own sign in 1st, 4th, 7th, or 10th',
    planets: 'Saturn (Shani)',
    emotionalInterpretation: 'Shasha Yoga gives you emotional stamina but can also create emotional guardedness.',
  },
  'Ruchaka Yoga': {
    name: 'Ruchaka Yoga',
    sanskrit: 'रुचकयोग',
    emoji: '⚔️',
    summary: 'Mars at peak strength provides courage and competitive edge',
    description: 'Ruchaka Yoga arises when Mars is exalted or in its own sign in a kendra house.',
    houses: 'Mars exalted or own sign in 1st, 4th, 7th, or 10th',
    planets: 'Mars (Mangal)',
    emotionalInterpretation: 'Your emotional landscape is defined by courage and intensity.',
  },
  'Bhadra Yoga': {
    name: 'Bhadra Yoga',
    sanskrit: 'भद्रयोग',
    emoji: '📚',
    summary: 'Mercury at peak strength brings exceptional intellect',
    description: 'Bhadra Yoga forms when Mercury is exalted or in its own sign in a kendra house.',
    houses: 'Mercury exalted or own sign in 1st, 4th, 7th, or 10th',
    planets: 'Mercury (Budh)',
    emotionalInterpretation: 'Your emotional world is deeply connected to language and thought.',
  },
  'Amala Yoga': {
    name: 'Amala Yoga',
    sanskrit: 'अमलयोग',
    emoji: '✨',
    summary: 'Venus and Jupiter in kendras from Moon grant pure reputation',
    description: 'Amala Yoga arises when both Venus and Jupiter occupy kendra houses from the Moon.',
    houses: 'Venus and Jupiter in kendras from the Moon',
    planets: 'Moon, Venus & Jupiter',
    emotionalInterpretation: 'You have an emotional need for authenticity.',
  },
  'Veshi Yoga': {
    name: 'Veshi Yoga',
    sanskrit: 'वेशीयोग',
    emoji: '🗣️',
    summary: 'Planets in 2nd from the Sun bring wealth through speech',
    description: 'Veshi Yoga forms when planets occupy the 2nd house from the Sun.',
    houses: 'Planets in the 2nd sign from the Sun',
    planets: 'Sun with planets in the next sign',
    emotionalInterpretation: 'Your emotional expression connects to self-worth and family identity.',
  },
  'Voshi Yoga': {
    name: 'Voshi Yoga',
    sanskrit: 'वोशीयोग',
    emoji: '🌸',
    summary: 'Planets in 12th from the Sun bring inner contentment',
    description: 'Voshi Yoga forms when planets occupy the 12th house from the Sun.',
    houses: 'Planets in the 12th sign from the Sun',
    planets: 'Sun with planets in the previous sign',
    emotionalInterpretation: 'You have access to emotional resources beneath the surface.',
  },
  'Ubhayachari Yoga': {
    name: 'Ubhayachari Yoga',
    sanskrit: 'उभयचरीयोग',
    emoji: '🔱',
    summary: 'Planets flanking the Sun bring commanding presence',
    description: 'Ubhayachari Yoga forms when planets occupy both the 2nd and 12th houses from the Sun.',
    houses: 'Planets in both 2nd AND 12th from the Sun',
    planets: 'Sun with planets flanking it',
    emotionalInterpretation: 'You feel both supported and scrutinized by others.',
  },
  'Vipreet Raj Yoga': {
    name: 'Vipreet Raj Yoga',
    sanskrit: 'विपरीतराजयोग',
    emoji: '🌀',
    summary: 'Rise from adversity — challenges become extraordinary power',
    description: 'Vipreet Raj Yoga forms when the lords of challenging houses occupy other challenging houses.',
    houses: 'Lords of 6th, 8th, or 12th in 6th, 8th, or 12th',
    planets: 'Lords of Dushtana houses',
    emotionalInterpretation: 'Your deepest emotional wounds are portals to your greatest strengths.',
  },
};

// ─── Dosha Detail Data ───────────────────────────────────────────────────────

interface DoshaDetail {
  name: string;
  sanskrit: string;
  summary: string;
  description: string;
  remedies: {
    behavioral: string;
    mindfulness: string;
    journaling: string;
  };
  severity: 'Mild' | 'Moderate' | 'Significant';
}

const DOSHA_DETAILS: Record<string, DoshaDetail> = {
  'Mangal Dosha': {
    name: 'Mangal Dosha',
    sanskrit: 'मङ्गलदोष',
    summary: 'Passion that seeks constructive channels',
    description: 'Mangal Dosha arises when Mars occupies the 1st, 4th, 7th, 8th, or 12th house. This placement intensifies your passionate nature.',
    remedies: {
      behavioral: 'Practice pausing 3 seconds before responding in conflict.',
      mindfulness: 'Channel Mars energy through physical activity 3x/week.',
      journaling: 'What am I protecting when I react strongly?',
    },
    severity: 'Moderate',
  },
  'Kaal Sarp Dosha': {
    name: 'Kaal Sarp Dosha',
    sanskrit: 'कालसर्पदोष',
    summary: 'Karmic patterns that invite deep transformation',
    description: 'Kaal Sarp Dosha occurs when all seven visible planets are hemmed between Rahu and Ketu.',
    remedies: {
      behavioral: 'Identify one recurring pattern and commit to a different response.',
      mindfulness: 'Practice 10 minutes of daily meditation.',
      journaling: 'What lesson keeps reappearing in different forms?',
    },
    severity: 'Significant',
  },
  'Pitra Dosha': {
    name: 'Pitra Dosha',
    sanskrit: 'पितृदोष',
    summary: 'Ancestral patterns seeking conscious resolution',
    description: 'Pitra Dosha relates to unresolved patterns inherited from previous generations.',
    remedies: {
      behavioral: 'Have an honest conversation about emotional patterns with family.',
      mindfulness: 'Practice weekly "ancestral reflection".',
      journaling: 'What emotional pattern did I inherit from my family?',
    },
    severity: 'Mild',
  },
  'Shani Sade Sati': {
    name: 'Shani Sade Sati',
    sanskrit: 'शनिसाढ़ेसाती',
    summary: 'A 7.5-year period of profound restructuring',
    description: 'Sade Sati is the 7.5-year transit of Saturn through the 12th, 1st, and 2nd houses from your natal Moon.',
    remedies: {
      behavioral: 'Simplify one area of your life each month.',
      mindfulness: 'Establish a daily routine and stick to it consistently.',
      journaling: 'What is Saturn asking me to let go of?',
    },
    severity: 'Significant',
  },
  'Grahan Dosha': {
    name: 'Grahan Dosha',
    sanskrit: 'ग्रहणदोष',
    summary: 'Eclipse energy creates identity and emotional challenges',
    description: 'Grahan Dosha arises when the Sun or Moon is conjunct with Rahu or Ketu.',
    remedies: {
      behavioral: 'Create a "grounding anchor" during intense periods.',
      mindfulness: 'Spend 10 minutes daily in Surya Namaskar.',
      journaling: 'What truth is waiting to be revealed?',
    },
    severity: 'Significant',
  },
  'Shrapit Dosha': {
    name: 'Shrapit Dosha',
    sanskrit: 'श्रापितदोष',
    summary: 'Curses from past lives create obstacles seeking karmic balance',
    description: 'Shrapit Dosha forms when Saturn and Rahu are in conjunction or mutual aspect.',
    remedies: {
      behavioral: 'When faced with an obstacle, ask what it is teaching you.',
      mindfulness: 'Practice "karmic release" meditation.',
      journaling: 'What keeps blocking me, no matter how hard I try?',
    },
    severity: 'Moderate',
  },
};

// ─── Vedic Analysis Types ────────────────────────────────────────────────────

interface VedicAnalysisData {
  houseAnalysis: Array<{
    houseNumber: number;
    houseName: string;
    sign: string;
    lord: string;
    planets: string[];
    analysis: string;
  }>;
  yogaInterpretations: Array<{
    name: string;
    present: boolean;
    strength: string;
    description: string;
    involvingPlanets: string[];
    interpretation: string;
  }>;
  doshaInterpretations: Array<{
    name: string;
    present: boolean;
    severity: string;
    description: string;
    remedies: string[];
    interpretation: string;
  }>;
  nakshatraPersonality: {
    nakshatra: string;
    pada: number;
    ruler: string;
    deity: string;
    symbol: string;
    gana: string;
    personalityTraits: string[];
    emotionalNature: string;
    lifePurpose: string;
  };
  planetaryStrengths: Array<{
    planet: string;
    sign: string;
    degree: string;
    nakshatra: string;
    nakshatraPada: number;
    house: number;
    strength: string;
    isRetrograde: boolean;
    isCombust: boolean;
    analysis: string;
  }>;
  ascendantLordAnalysis: {
    ascendant: string;
    lord: string;
    lordSign: string;
    lordHouse: number;
    lordStrength: string;
    analysis: string;
  };
  dashaInterpretation: {
    mahadashaPlanet: string | null;
    antardashaPlanet: string | null;
    mahadashaStartDate: string | null;
    mahadashaEndDate: string | null;
    generalEffect: string;
    areasAffected: string[];
    interpretation: string;
  };
  // NEW: Planetary Aspects
  planetaryAspects: Array<{
    planet: string;
    sign: string;
    house: number;
    aspects: Array<{
      targetPlanet: string;
      targetSign: string;
      targetHouse: number;
      aspectType: string;
      interpretation: string;
    }>;
  }>;
  // NEW: Dignity Details
  dignityDetails: Array<{
    planet: string;
    sign: string;
    degree: number;
    house: number;
    dignity: string;
    exaltedSign: string;
    exaltedDegree: number;
    debilitatedSign: string;
    debilitatedDegree: number;
    moolatrikonaSign: string;
    ownSigns: string[];
    signRelationship: string;
    isCombust: boolean;
    combustionDegree: number | null;
    distanceFromSun: number | null;
    isRetrograde: boolean;
    retrogradeNote: string;
    interpretation: string;
  }>;
  // NEW: Enhanced House Lord Analysis
  enhancedHouseLordAnalysis: Array<{
    houseNumber: number;
    houseName: string;
    houseSign: string;
    lord: string;
    lordSign: string;
    lordHouse: number;
    lordDignity: string;
    lordSignRelationship: string;
    lordHouseType: string;
    significance: string;
    interpretation: string;
  }>;
  // NEW: Nakshatra Compatibility
  nakshatraCompatibility: {
    nakshatra: string;
    yoni: string;
    yoniDescription: string;
    gana: string;
    ganaDescription: string;
    nadi: string;
    nadiDescription: string;
    compatibilityNotes: string[];
  };
  // NEW: Current Transit Influence
  currentTransitInfluence: {
    transitDate: string;
    transits: Array<{
      planet: string;
      transitSign: string;
      transitHouse: number;
      natalAspect: string;
      influence: string;
      isMajor: boolean;
    }>;
    sadeSatiStatus: {
      isActive: boolean;
      phase: string;
      description: string;
    };
    dhaiyaStatus: {
      isActive: boolean;
      description: string;
    };
    jupiterTransitToMoon: {
      house: number;
      description: string;
    };
  };
  // NEW: Shadbala
  shadbala: Array<{
    planet: string;
    sign: string;
    house: number;
    positionalStrength: number;
    directionalStrength: number;
    totalStrength: number;
    strengthRating: string;
    interpretation: string;
  }>;
  summary: {
    totalYogas: number;
    presentYogas: number;
    strongYogas: number;
    moderateYogas: number;
    absentYogas: number;
    totalDoshas: number;
    presentDoshas: number;
    highSeverityDoshas: number;
    overallChartStrength: string;
  };
}

const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'Mild': return 'bg-sage-muted text-sage-dark';
    case 'Moderate': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
    case 'Significant': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
    default: return 'bg-brown-50 text-brown-500';
  }
}

function getStrengthBadge(strength: string): { className: string; label: string } {
  switch (strength) {
    case 'Strong': return { className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300', label: 'Strong' };
    case 'Moderate': return { className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300', label: 'Moderate' };
    case 'Weak': return { className: 'bg-gray-100 text-gray-500 dark:bg-gray-800/30 dark:text-gray-400', label: 'Weak' };
    default: return { className: 'bg-gray-100 text-gray-500 dark:bg-gray-800/30 dark:text-gray-400', label: strength };
  }
}

function getSeverityBadge(severity: string): { className: string; label: string } {
  switch (severity) {
    case 'High': return { className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300', label: 'High' };
    case 'Medium': return { className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300', label: 'Medium' };
    case 'Low': return { className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300', label: 'Low' };
    default: return { className: 'bg-gray-100 text-gray-500 dark:bg-gray-800/30 dark:text-gray-400', label: severity };
  }
}

function getChartStrengthColor(strength: string): string {
  switch (strength) {
    case 'Excellent': return 'text-emerald-600 dark:text-emerald-400';
    case 'Good': return 'text-blue-600 dark:text-blue-400';
    case 'Average': return 'text-amber-600 dark:text-amber-400';
    case 'Challenging': return 'text-red-600 dark:text-red-400';
    default: return 'text-brown-500 dark:text-brown-400';
  }
}

function getDignityBadge(dignity: string): { className: string; label: string } {
  switch (dignity) {
    case 'Exalted': return { className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300', label: '★ Exalted' };
    case 'Own Sign': return { className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300', label: '◆ Own Sign' };
    case 'Moolatrikona': return { className: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300', label: '▲ Moolatrikona' };
    case 'Debilitated': return { className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300', label: '▼ Debilitated' };
    default: return { className: 'bg-gray-100 text-gray-500 dark:bg-gray-800/30 dark:text-gray-400', label: '○ Neutral' };
  }
}

function getShadbalaRatingColor(rating: string): { text: string; bg: string } {
  switch (rating) {
    case 'Very Strong': return { text: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-100 dark:bg-emerald-900/30' };
    case 'Strong': return { text: 'text-teal-700 dark:text-teal-300', bg: 'bg-teal-100 dark:bg-teal-900/30' };
    case 'Moderate': return { text: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-100 dark:bg-amber-900/30' };
    case 'Weak': return { text: 'text-orange-700 dark:text-orange-300', bg: 'bg-orange-100 dark:bg-orange-900/30' };
    case 'Very Weak': return { text: 'text-red-700 dark:text-red-300', bg: 'bg-red-100 dark:bg-red-900/30' };
    default: return { text: 'text-gray-500 dark:text-gray-400', bg: 'bg-gray-100 dark:bg-gray-800/30' };
  }
}

function getShadbalaBarWidth(strength: number): number {
  // Max is ~8, scale to 0-100
  return Math.min(100, Math.max(5, (strength / 8) * 100));
}

// ─── Component ───────────────────────────────────────────────────────────────

type TabId = 'yogas' | 'doshas' | 'aspects' | 'dignity' | 'transit' | 'nakshatra' | 'analysis';

export default function YogaDoshaView() {
  const { astrologyData, setView, userId } = useAyuAstroStore();
  const [expandedYogas, setExpandedYogas] = useState<Record<string, boolean>>({});
  const [expandedDoshas, setExpandedDoshas] = useState<Record<string, boolean>>({});
  const [showAbsentYogas, setShowAbsentYogas] = useState(false);
  const [showAbsentDoshas, setShowAbsentDoshas] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('yogas');

  // Vedic analysis state
  const [vedicAnalysis, setVedicAnalysis] = useState<VedicAnalysisData | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [expandedHouses, setExpandedHouses] = useState<Record<number, boolean>>({});
  const [expandedAnalysisYogas, setExpandedAnalysisYogas] = useState<Record<string, boolean>>({});
  const [expandedAnalysisDoshas, setExpandedAnalysisDoshas] = useState<Record<string, boolean>>({});
  const [expandedAspects, setExpandedAspects] = useState<Record<string, boolean>>({});
  const [expandedDignity, setExpandedDignity] = useState<Record<string, boolean>>({});
  const [expandedHouseLords, setExpandedHouseLords] = useState<Record<number, boolean>>({});
  const [expandedTransits, setExpandedTransits] = useState<Record<string, boolean>>({});

  const userYogas = (astrologyData?.yogas || []).filter((y) => YOGA_DETAILS[y]);
  const userDoshas = (astrologyData?.doshas || []).filter((d) => DOSHA_DETAILS[d]);

  const presentYogas = userYogas;
  const absentYogas = Object.keys(YOGA_DETAILS).filter(y => !userYogas.includes(y));
  const presentDoshas = userDoshas;
  const absentDoshas = Object.keys(DOSHA_DETAILS).filter(d => !userDoshas.includes(d));

  // Fetch Vedic analysis
  const fetchVedicAnalysis = useCallback(async () => {
    if (!userId) return;
    setAnalysisLoading(true);
    setAnalysisError(null);
    try {
      const response = await fetch(`/api/astrology/vedic-analysis?userId=${userId}`);
      const data = await response.json();
      if (data.success) {
        setVedicAnalysis(data.data);
      } else {
        setAnalysisError(data.error || 'Failed to load analysis');
      }
    } catch {
      setAnalysisError('Network error. Please try again.');
    } finally {
      setAnalysisLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (activeTab !== 'yogas' && activeTab !== 'doshas' && !vedicAnalysis && !analysisLoading) {
      fetchVedicAnalysis();
    }
  }, [activeTab, vedicAnalysis, analysisLoading, fetchVedicAnalysis]);

  const needsAnalysis = activeTab !== 'yogas' && activeTab !== 'doshas';

  const tabs: Array<{ id: TabId; label: string; icon: React.ReactNode; count: number | null }> = [
    { id: 'yogas', label: 'Yogas', icon: <Sparkles className="size-3" />, count: presentYogas.length },
    { id: 'doshas', label: 'Doshas', icon: <AlertTriangle className="size-3" />, count: presentDoshas.length },
    { id: 'aspects', label: 'Aspects', icon: <ArrowRightLeft className="size-3" />, count: null },
    { id: 'dignity', label: 'Dignity', icon: <Gem className="size-3" />, count: null },
    { id: 'transit', label: 'Transit', icon: <Orbit className="size-3" />, count: null },
    { id: 'nakshatra', label: 'Nakshatra', icon: <Moon className="size-3" />, count: null },
    { id: 'analysis', label: 'Full', icon: <BookOpen className="size-3" />, count: null },
  ];

  return (
    <div className="bg-cream dark:bg-[#1a1410] px-4 py-6 pb-24 min-h-screen">
      <div className="mx-auto max-w-lg space-y-6">
        {/* Header */}
        <motion.div {...fadeInUp} transition={{ duration: 0.4 }} className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setView('insights')}
            className="size-10 rounded-full hover:bg-brown-50 dark:hover:bg-brown-800"
          >
            <ArrowLeft className="size-5 text-brown-700 dark:text-brown-300" />
          </Button>
          <div>
            <h1
              className="font-serif text-xl font-bold text-brown-900 dark:text-brown-100"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Cosmic Blessings & Karmic Lessons
            </h1>
            <p className="text-xs text-brown-400 dark:text-brown-500">Your yogas and doshas explained</p>
          </div>
        </motion.div>

        {/* Count Badges */}
        <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.02 }} className="flex items-center gap-3 flex-wrap">
          <Badge className="bg-sage-muted text-sage-dark dark:bg-sage/20 dark:text-sage border-0 text-sm px-3 py-1">
            {presentYogas.length}/{Object.keys(YOGA_DETAILS).length} Yogas ✦
          </Badge>
          <Badge className="bg-gold/10 text-gold-dark dark:bg-gold/20 dark:text-gold border-0 text-sm px-3 py-1">
            {presentDoshas.length}/{Object.keys(DOSHA_DETAILS).length} Karmic Lessons ⚠️
          </Badge>
          {vedicAnalysis && (
            <Badge className={`${getChartStrengthColor(vedicAnalysis.summary.overallChartStrength)} border-0 text-sm px-3 py-1 bg-white/50 dark:bg-white/5`}>
              <Star className="size-3 mr-1" />
              {vedicAnalysis.summary.overallChartStrength}
            </Badge>
          )}
        </motion.div>

        {/* Tab Navigation */}
        <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.03 }}>
          <div className="flex gap-0.5 p-1 rounded-xl bg-white/50 dark:bg-white/5 border border-brown-100 dark:border-brown-800 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1 py-1.5 px-2.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-white/10 text-brown-900 dark:text-brown-100 shadow-sm'
                    : 'text-brown-400 dark:text-brown-500 hover:text-brown-600 dark:hover:text-brown-300'
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.count !== null && (
                  <span className="text-[10px] opacity-60">({tab.count})</span>
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ─── Loading/Error for analysis-dependent tabs ────────── */}
        {needsAnalysis && analysisLoading && (
          <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.05 }}>
            <Card className="border-0 shadow-sm bg-white dark:bg-white/5">
              <CardContent className="p-6 flex flex-col items-center gap-3">
                <div className="relative">
                  <RefreshCw className="size-8 text-gold dark:text-gold animate-spin" />
                </div>
                <p className="text-sm text-brown-500 dark:text-brown-400">Generating comprehensive Vedic analysis...</p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {needsAnalysis && analysisError && (
          <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.05 }}>
            <Card className="border-0 shadow-sm bg-red-50 dark:bg-red-900/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="size-4 text-red-500" />
                  <p className="text-sm text-red-600 dark:text-red-400">{analysisError}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={fetchVedicAnalysis}
                  className="mt-2 text-red-600 dark:text-red-400"
                >
                  <RefreshCw className="size-3 mr-1" /> Retry
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ─── Yogas Tab ────────────────────────────────────────── */}
        {activeTab === 'yogas' && (
          <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.05 }}>
            <h2
              className="font-serif text-lg font-bold text-brown-900 dark:text-brown-100 mb-3"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              ✦ Cosmic Blessings
            </h2>
            <div className="space-y-3 mb-4">
              {presentYogas.map((yogaName, i) => {
                const yoga = YOGA_DETAILS[yogaName];
                if (!yoga) return null;
                const isOpen = expandedYogas[yogaName] || false;
                return (
                  <YogaCard
                    key={yogaName}
                    yoga={yoga}
                    isOpen={isOpen}
                    onToggle={(open) => setExpandedYogas(prev => ({ ...prev, [yogaName]: open }))}
                    isPresent={true}
                    index={i}
                  />
                );
              })}
            </div>
            {absentYogas.length > 0 && (
              <div className="space-y-2">
                <button
                  onClick={() => setShowAbsentYogas(!showAbsentYogas)}
                  className="flex items-center gap-2 text-xs text-brown-400 dark:text-brown-500 hover:text-brown-600 dark:hover:text-brown-300 transition-colors"
                >
                  <motion.div animate={{ rotate: showAbsentYogas ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="size-3" />
                  </motion.div>
                  {showAbsentYogas ? 'Hide' : 'Show'} {absentYogas.length} absent yoga{absentYogas.length !== 1 ? 's' : ''}
                </button>
                <AnimatePresence>
                  {showAbsentYogas && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-2 overflow-hidden"
                    >
                      {absentYogas.map((yogaName, i) => {
                        const yoga = YOGA_DETAILS[yogaName];
                        if (!yoga) return null;
                        const isOpen = expandedYogas[yogaName] || false;
                        return (
                          <YogaCard
                            key={yogaName}
                            yoga={yoga}
                            isOpen={isOpen}
                            onToggle={(open) => setExpandedYogas(prev => ({ ...prev, [yogaName]: open }))}
                            isPresent={false}
                            index={i}
                          />
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}

        {/* ─── Doshas Tab ───────────────────────────────────────── */}
        {activeTab === 'doshas' && (
          <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.05 }}>
            <h2
              className="font-serif text-lg font-bold text-brown-900 dark:text-brown-100 mb-3"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              ⚠️ Karmic Lessons
            </h2>
            <div className="space-y-3 mb-4">
              {presentDoshas.map((doshaName, i) => {
                const dosha = DOSHA_DETAILS[doshaName];
                if (!dosha) return null;
                const isOpen = expandedDoshas[doshaName] || false;
                return (
                  <DoshaCard
                    key={doshaName}
                    dosha={dosha}
                    isOpen={isOpen}
                    onToggle={(open) => setExpandedDoshas(prev => ({ ...prev, [doshaName]: open }))}
                    isPresent={true}
                    index={i}
                  />
                );
              })}
            </div>
            {absentDoshas.length > 0 && (
              <div className="space-y-2">
                <button
                  onClick={() => setShowAbsentDoshas(!showAbsentDoshas)}
                  className="flex items-center gap-2 text-xs text-brown-400 dark:text-brown-500 hover:text-brown-600 dark:hover:text-brown-300 transition-colors"
                >
                  <motion.div animate={{ rotate: showAbsentDoshas ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="size-3" />
                  </motion.div>
                  {showAbsentDoshas ? 'Hide' : 'Show'} {absentDoshas.length} absent dosha{absentDoshas.length !== 1 ? 's' : ''}
                </button>
                <AnimatePresence>
                  {showAbsentDoshas && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-2 overflow-hidden"
                    >
                      {absentDoshas.map((doshaName, i) => {
                        const dosha = DOSHA_DETAILS[doshaName];
                        if (!dosha) return null;
                        const isOpen = expandedDoshas[doshaName] || false;
                        return (
                          <DoshaCard
                            key={doshaName}
                            dosha={dosha}
                            isOpen={isOpen}
                            onToggle={(open) => setExpandedDoshas(prev => ({ ...prev, [doshaName]: open }))}
                            isPresent={false}
                            index={i}
                          />
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}

        {/* ─── Aspects Tab ──────────────────────────────────────── */}
        {activeTab === 'aspects' && vedicAnalysis && (
          <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.05 }} className="space-y-4">
            <h2
              className="font-serif text-lg font-bold text-brown-900 dark:text-brown-100"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              <ArrowRightLeft className="size-5 inline mr-2 text-gold-dark dark:text-gold" />
              Planetary Aspects (Drishti)
            </h2>
            <p className="text-xs text-brown-400 dark:text-brown-500 leading-relaxed">
              Vedic astrology uses specific planetary aspects: Mars aspects 4th, 7th, 8th houses from itself;
              Jupiter 5th, 7th, 9th; Saturn 3rd, 7th, 10th; all other planets aspect the 7th house only.
            </p>
            <div className="space-y-3">
              {vedicAnalysis.planetaryAspects.filter(pa => pa.aspects.length > 0).map(pa => {
                const isOpen = expandedAspects[pa.planet] || false;
                return (
                  <Card key={pa.planet} className="border-0 shadow-sm bg-white dark:bg-white/5 overflow-hidden">
                    <Collapsible open={isOpen} onOpenChange={(open) => setExpandedAspects(prev => ({ ...prev, [pa.planet]: open }))}>
                      <CollapsibleTrigger asChild>
                        <button className="w-full text-left p-4 hover:bg-brown-50/30 dark:hover:bg-brown-800/10 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="size-8 rounded-full bg-gold/10 dark:bg-gold/20 flex items-center justify-center">
                                <span className="text-sm font-bold text-gold-dark dark:text-gold">{pa.planet.slice(0, 2)}</span>
                              </div>
                              <div>
                                <span className="text-sm font-medium text-brown-900 dark:text-brown-100">{pa.planet}</span>
                                <span className="text-xs text-brown-400 dark:text-brown-500 ml-1.5">in {pa.sign} (H{pa.house})</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className="bg-gold/10 text-gold-dark dark:bg-gold/20 dark:text-gold border-0 text-[10px]">
                                {pa.aspects.length} aspect{pa.aspects.length !== 1 ? 's' : ''}
                              </Badge>
                              <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                                <ChevronDown className="size-4 text-brown-300 dark:text-brown-500" />
                              </motion.div>
                            </div>
                          </div>
                        </button>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="px-4 pb-4 space-y-3 border-t border-brown-100/30 dark:border-brown-800/20 pt-3">
                          {pa.aspects.map(aspect => (
                            <div key={aspect.targetPlanet} className="flex items-start gap-3 p-2 rounded-lg bg-brown-50/50 dark:bg-brown-50/5">
                              <div className="flex items-center gap-1 shrink-0 mt-0.5">
                                <span className="text-xs font-bold text-brown-600 dark:text-brown-300">{pa.planet.slice(0, 2)}</span>
                                <ArrowRightLeft className="size-3 text-gold-dark dark:text-gold" />
                                <span className="text-xs font-bold text-brown-600 dark:text-brown-300">{aspect.targetPlanet.slice(0, 2)}</span>
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 mb-1">
                                  <Badge className="bg-gold/10 text-gold-dark dark:bg-gold/20 dark:text-gold border-0 text-[9px] px-1.5 py-0">
                                    {aspect.aspectType}
                                  </Badge>
                                </div>
                                <p className="text-xs text-brown-600 dark:text-brown-300 leading-relaxed">
                                  {aspect.interpretation}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ─── Dignity & Strength Tab ───────────────────────────── */}
        {activeTab === 'dignity' && vedicAnalysis && (
          <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.05 }} className="space-y-4">
            <h2
              className="font-serif text-lg font-bold text-brown-900 dark:text-brown-100"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              <Gem className="size-5 inline mr-2 text-gold-dark dark:text-gold" />
              Dignity & Strength
            </h2>

            {/* Shadbala Summary */}
            <Card className="border-0 shadow-sm bg-gradient-to-br from-gold/5 to-sage-muted/10 dark:from-gold/10 dark:to-sage/5 overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Gauge className="size-4 text-gold-dark dark:text-gold" />
                  <h3
                    className="font-serif text-base font-bold text-brown-900 dark:text-brown-100"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    Shadbala Strength Ranking
                  </h3>
                </div>
                <div className="max-h-64 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                  {vedicAnalysis.shadbala.map((sb, idx) => {
                    const barWidth = getShadbalaBarWidth(sb.totalStrength);
                    const ratingColors = getShadbalaRatingColor(sb.strengthRating);
                    return (
                      <div key={sb.planet} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-brown-800 dark:text-brown-200">{idx + 1}.</span>
                            <span className="text-sm font-medium text-brown-800 dark:text-brown-200">{sb.planet}</span>
                            <span className="text-[10px] text-brown-400 dark:text-brown-500">{sb.sign}</span>
                            {sb.isRetrograde && <span className="text-[9px] px-1 rounded bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">℞</span>}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-brown-400 dark:text-brown-500">{sb.totalStrength}/8</span>
                            <span className={`text-[10px] px-1.5 py-0 rounded ${ratingColors.bg} ${ratingColors.text}`}>
                              {sb.strengthRating}
                            </span>
                          </div>
                        </div>
                        <div className="h-1.5 rounded-full bg-brown-100 dark:bg-brown-800 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${barWidth}%` }}
                            transition={{ duration: 0.6, delay: 0.05 * idx }}
                            className={`h-full rounded-full ${
                              sb.totalStrength >= 5.5 ? 'bg-emerald-400 dark:bg-emerald-500' :
                              sb.totalStrength >= 4 ? 'bg-gold' :
                              sb.totalStrength >= 2.5 ? 'bg-amber-400 dark:bg-amber-500' :
                              'bg-red-400 dark:bg-red-500'
                            }`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Detailed Dignity Cards */}
            <div className="space-y-3">
              {vedicAnalysis.dignityDetails.map(dd => {
                const isOpen = expandedDignity[dd.planet] || false;
                const dignityBadge = getDignityBadge(dd.dignity);
                return (
                  <Card key={dd.planet} className="border-0 shadow-sm bg-white dark:bg-white/5 overflow-hidden">
                    <Collapsible open={isOpen} onOpenChange={(open) => setExpandedDignity(prev => ({ ...prev, [dd.planet]: open }))}>
                      <CollapsibleTrigger asChild>
                        <button className="w-full text-left p-4 hover:bg-brown-50/30 dark:hover:bg-brown-800/10 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-brown-900 dark:text-brown-100">{dd.planet}</span>
                              <span className="text-xs text-brown-400 dark:text-brown-500">{dd.sign} {dd.degree}°</span>
                              {dd.isRetrograde && <span className="text-[9px] px-1 rounded bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">℞</span>}
                              {dd.isCombust && <span className="text-[9px] px-1 rounded bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400">C</span>}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Badge className={`${dignityBadge.className} border-0 text-[10px] px-2 py-0`}>
                                {dignityBadge.label}
                              </Badge>
                              <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                                <ChevronDown className="size-3 text-brown-300 dark:text-brown-500" />
                              </motion.div>
                            </div>
                          </div>
                        </button>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="px-4 pb-4 space-y-2 border-t border-brown-100/30 dark:border-brown-800/20 pt-3">
                          <p className="text-xs text-brown-600 dark:text-brown-300 leading-relaxed">
                            {dd.interpretation}
                          </p>
                          <div className="grid grid-cols-2 gap-2 text-[10px]">
                            <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/10 p-2">
                              <p className="text-emerald-600 dark:text-emerald-400 mb-0.5">Exalted</p>
                              <p className="text-brown-700 dark:text-brown-300">{dd.exaltedSign} {dd.exaltedDegree}°</p>
                            </div>
                            <div className="rounded-lg bg-red-50 dark:bg-red-900/10 p-2">
                              <p className="text-red-600 dark:text-red-400 mb-0.5">Debilitated</p>
                              <p className="text-brown-700 dark:text-brown-300">{dd.debilitatedSign} {dd.debilitatedDegree}°</p>
                            </div>
                            <div className="rounded-lg bg-teal-50 dark:bg-teal-900/10 p-2">
                              <p className="text-teal-600 dark:text-teal-400 mb-0.5">Moolatrikona</p>
                              <p className="text-brown-700 dark:text-brown-300">{dd.moolatrikonaSign || 'N/A'}</p>
                            </div>
                            <div className="rounded-lg bg-blue-50 dark:bg-blue-900/10 p-2">
                              <p className="text-blue-600 dark:text-blue-400 mb-0.5">Own Signs</p>
                              <p className="text-brown-700 dark:text-brown-300">{dd.ownSigns.join(', ') || 'N/A'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className={`border-0 text-[9px] px-1.5 py-0 ${
                              dd.signRelationship === 'Friendly' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' :
                              dd.signRelationship === 'Enemy' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                              'bg-gray-100 text-gray-500 dark:bg-gray-800/30 dark:text-gray-400'
                            }`}>
                              {dd.signRelationship}
                            </Badge>
                            {dd.distanceFromSun !== null && (
                              <span className="text-[9px] text-brown-400 dark:text-brown-500">
                                {dd.distanceFromSun}° from Sun
                              </span>
                            )}
                          </div>
                          {dd.retrogradeNote && (
                            <p className="text-[10px] text-brown-500 dark:text-brown-400 leading-relaxed italic">
                              {dd.retrogradeNote}
                            </p>
                          )}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                );
              })}
            </div>

            {/* Enhanced House Lord Analysis */}
            <Card className="border-0 shadow-sm bg-white dark:bg-white/5 overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Crown className="size-4 text-gold-dark dark:text-gold" />
                  <h3
                    className="font-serif text-base font-bold text-brown-900 dark:text-brown-100"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    House Lord Placements
                  </h3>
                </div>
                <div className="max-h-96 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                  {vedicAnalysis.enhancedHouseLordAnalysis.map(hl => {
                    const isOpen = expandedHouseLords[hl.houseNumber] || false;
                    const houseTypeColor = hl.lordHouseType.includes('Kendra') ? 'text-blue-600 dark:text-blue-400' :
                      hl.lordHouseType.includes('Trikona') ? 'text-emerald-600 dark:text-emerald-400' :
                      hl.lordHouseType.includes('Dushtana') ? 'text-red-600 dark:text-red-400' :
                      hl.lordHouseType.includes('Upaachaya') ? 'text-amber-600 dark:text-amber-400' :
                      'text-brown-500 dark:text-brown-400';
                    return (
                      <Collapsible
                        key={hl.houseNumber}
                        open={isOpen}
                        onOpenChange={(open) => setExpandedHouseLords(prev => ({ ...prev, [hl.houseNumber]: open }))}
                      >
                        <CollapsibleTrigger asChild>
                          <button className="w-full text-left py-2 border-b border-brown-100/50 dark:border-brown-800/30 hover:bg-brown-50/50 dark:hover:bg-brown-800/20 transition-colors rounded px-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-brown-600 dark:text-brown-300">H{hl.houseNumber}</span>
                                <span className="text-xs font-medium text-brown-800 dark:text-brown-200">{hl.houseName}</span>
                                <span className={`text-[10px] font-medium ${houseTypeColor}`}>
                                  → {hl.lord} in H{hl.lordHouse}
                                </span>
                              </div>
                              <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                                <ChevronDown className="size-3 text-brown-300 dark:text-brown-500" />
                              </motion.div>
                            </div>
                          </button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="py-2 px-1 space-y-1">
                            <div className="flex flex-wrap gap-1">
                              <Badge className={`${getDignityBadge(hl.lordDignity).className} border-0 text-[9px] px-1.5 py-0`}>
                                {hl.lordDignity}
                              </Badge>
                              <Badge className={`border-0 text-[9px] px-1.5 py-0 ${
                                hl.lordSignRelationship === 'Friendly' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' :
                                hl.lordSignRelationship === 'Enemy' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                                'bg-gray-100 text-gray-500 dark:bg-gray-800/30 dark:text-gray-400'
                              }`}>
                                {hl.lordSignRelationship}
                              </Badge>
                              <Badge className="bg-brown-50 text-brown-500 dark:bg-brown-800/30 dark:text-brown-400 border-0 text-[9px] px-1.5 py-0">
                                {hl.lordHouseType}
                              </Badge>
                            </div>
                            <p className="text-xs text-brown-600 dark:text-brown-300 leading-relaxed">
                              {hl.interpretation}
                            </p>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ─── Transit Influence Tab ────────────────────────────── */}
        {activeTab === 'transit' && vedicAnalysis && (
          <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.05 }} className="space-y-4">
            <h2
              className="font-serif text-lg font-bold text-brown-900 dark:text-brown-100"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              <Orbit className="size-5 inline mr-2 text-gold-dark dark:text-gold" />
              Current Transit Influence
            </h2>
            <p className="text-[10px] text-brown-400 dark:text-brown-500">
              Transit data as of {vedicAnalysis.currentTransitInfluence.transitDate}
            </p>

            {/* Sade Sati & Dhaiya Status */}
            <div className="grid grid-cols-2 gap-3">
              <Card className={`border-0 shadow-sm overflow-hidden ${
                vedicAnalysis.currentTransitInfluence.sadeSatiStatus.isActive
                  ? 'bg-red-50 dark:bg-red-900/10 border-l-4 border-l-red-400'
                  : 'bg-emerald-50 dark:bg-emerald-900/10 border-l-4 border-l-emerald-400'
              }`}>
                <CardContent className="p-3">
                  <p className="text-[10px] uppercase tracking-wider text-brown-400 dark:text-brown-500 mb-1">Sade Sati</p>
                  <p className={`text-sm font-bold ${
                    vedicAnalysis.currentTransitInfluence.sadeSatiStatus.isActive
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {vedicAnalysis.currentTransitInfluence.sadeSatiStatus.isActive ? 'Active' : 'Not Active'}
                  </p>
                  {vedicAnalysis.currentTransitInfluence.sadeSatiStatus.isActive && (
                    <p className="text-[10px] text-brown-500 dark:text-brown-400 mt-1">
                      {vedicAnalysis.currentTransitInfluence.sadeSatiStatus.phase}
                    </p>
                  )}
                </CardContent>
              </Card>
              <Card className={`border-0 shadow-sm overflow-hidden ${
                vedicAnalysis.currentTransitInfluence.dhaiyaStatus.isActive
                  ? 'bg-amber-50 dark:bg-amber-900/10 border-l-4 border-l-amber-400'
                  : 'bg-emerald-50 dark:bg-emerald-900/10 border-l-4 border-l-emerald-400'
              }`}>
                <CardContent className="p-3">
                  <p className="text-[10px] uppercase tracking-wider text-brown-400 dark:text-brown-500 mb-1">Dhaiya</p>
                  <p className={`text-sm font-bold ${
                    vedicAnalysis.currentTransitInfluence.dhaiyaStatus.isActive
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {vedicAnalysis.currentTransitInfluence.dhaiyaStatus.isActive ? 'Active' : 'Not Active'}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Sade Sati Description */}
            {vedicAnalysis.currentTransitInfluence.sadeSatiStatus.isActive && (
              <Card className="border-0 shadow-sm bg-red-50/50 dark:bg-red-900/5 border-l-4 border-l-red-400">
                <CardContent className="p-4">
                  <p className="text-xs text-brown-700 dark:text-brown-300 leading-relaxed">
                    {vedicAnalysis.currentTransitInfluence.sadeSatiStatus.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Dhaiya Description */}
            {vedicAnalysis.currentTransitInfluence.dhaiyaStatus.isActive && (
              <Card className="border-0 shadow-sm bg-amber-50/50 dark:bg-amber-900/5 border-l-4 border-l-amber-400">
                <CardContent className="p-4">
                  <p className="text-xs text-brown-700 dark:text-brown-300 leading-relaxed">
                    {vedicAnalysis.currentTransitInfluence.dhaiyaStatus.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Jupiter Transit to Moon */}
            <Card className="border-0 shadow-sm bg-gradient-to-r from-gold/5 to-sage-muted/5 dark:from-gold/10 dark:to-sage/5 overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Compass className="size-4 text-gold-dark dark:text-gold" />
                  <h3 className="text-sm font-bold text-brown-900 dark:text-brown-100">
                    Jupiter Transit to Natal Moon
                  </h3>
                </div>
                <Badge className="bg-gold/10 text-gold-dark dark:bg-gold/20 dark:text-gold border-0 text-xs mb-2">
                  {vedicAnalysis.currentTransitInfluence.jupiterTransitToMoon.house}{getOrdinalSuffix(vedicAnalysis.currentTransitInfluence.jupiterTransitToMoon.house)} House
                </Badge>
                <p className="text-xs text-brown-600 dark:text-brown-300 leading-relaxed">
                  {vedicAnalysis.currentTransitInfluence.jupiterTransitToMoon.description}
                </p>
              </CardContent>
            </Card>

            {/* All Transit Details */}
            <Card className="border-0 shadow-sm bg-white dark:bg-white/5 overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="size-4 text-brown-600 dark:text-brown-300" />
                  <h3 className="text-sm font-bold text-brown-900 dark:text-brown-100">
                    All Planetary Transits
                  </h3>
                </div>
                <div className="max-h-96 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                  {vedicAnalysis.currentTransitInfluence.transits.map(transit => {
                    const isOpen = expandedTransits[transit.planet] || false;
                    return (
                      <Collapsible
                        key={transit.planet}
                        open={isOpen}
                        onOpenChange={(open) => setExpandedTransits(prev => ({ ...prev, [transit.planet]: open }))}
                      >
                        <CollapsibleTrigger asChild>
                          <button className="w-full text-left py-2 border-b border-brown-100/50 dark:border-brown-800/30 hover:bg-brown-50/50 dark:hover:bg-brown-800/20 transition-colors rounded px-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {transit.isMajor ? (
                                  <span className="size-2 rounded-full bg-gold shrink-0" />
                                ) : (
                                  <span className="size-2 rounded-full bg-brown-300 dark:bg-brown-500 shrink-0" />
                                )}
                                <span className="text-xs font-medium text-brown-800 dark:text-brown-200">{transit.planet}</span>
                                <span className="text-[10px] text-brown-400 dark:text-brown-500">
                                  in {transit.transitSign} (H{transit.transitHouse})
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                {transit.isMajor && (
                                  <Badge className="bg-gold/10 text-gold-dark dark:bg-gold/20 dark:text-gold border-0 text-[9px] px-1.5 py-0">
                                    Major
                                  </Badge>
                                )}
                                <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                                  <ChevronDown className="size-3 text-brown-300 dark:text-brown-500" />
                                </motion.div>
                              </div>
                            </div>
                          </button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="py-2 px-1 space-y-1">
                            <p className="text-[10px] text-brown-400 dark:text-brown-500">
                              {transit.natalAspect}
                            </p>
                            <p className="text-xs text-brown-600 dark:text-brown-300 leading-relaxed">
                              {transit.influence}
                            </p>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ─── Nakshatra Details Tab ────────────────────────────── */}
        {activeTab === 'nakshatra' && vedicAnalysis && (
          <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.05 }} className="space-y-4">
            <h2
              className="font-serif text-lg font-bold text-brown-900 dark:text-brown-100"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              <Moon className="size-5 inline mr-2 text-purple-600 dark:text-purple-400" />
              Nakshatra Details
            </h2>

            {/* Nakshatra Personality */}
            <Card className="border-0 shadow-sm bg-white dark:bg-white/5 overflow-hidden border-l-4 border-l-purple-400 dark:border-l-purple-500">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Moon className="size-4 text-purple-600 dark:text-purple-400" />
                  <h3
                    className="font-serif text-base font-bold text-brown-900 dark:text-brown-100"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    Nakshatra Personality
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-0 text-xs">
                      {vedicAnalysis.nakshatraPersonality.nakshatra} Pada {vedicAnalysis.nakshatraPersonality.pada}
                    </Badge>
                    <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-0 text-xs">
                      Ruler: {vedicAnalysis.nakshatraPersonality.ruler}
                    </Badge>
                    <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-0 text-xs">
                      Deity: {vedicAnalysis.nakshatraPersonality.deity}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {vedicAnalysis.nakshatraPersonality.personalityTraits.map(trait => (
                      <span
                        key={trait}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-300"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-brown-700 dark:text-brown-300 leading-relaxed">
                    {vedicAnalysis.nakshatraPersonality.emotionalNature}
                  </p>
                  <div className="rounded-lg bg-purple-50 dark:bg-purple-900/10 p-3">
                    <p className="text-[10px] uppercase tracking-wider text-purple-500 dark:text-purple-400 mb-1 flex items-center gap-1">
                      <Heart className="size-3" /> Life Purpose
                    </p>
                    <p className="text-xs text-brown-700 dark:text-brown-300 leading-relaxed">
                      {vedicAnalysis.nakshatraPersonality.lifePurpose}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Nakshatra Compatibility (Koota) */}
            <Card className="border-0 shadow-sm bg-white dark:bg-white/5 overflow-hidden border-l-4 border-l-pink-400 dark:border-l-pink-500">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="size-4 text-pink-600 dark:text-pink-400" />
                  <h3
                    className="font-serif text-base font-bold text-brown-900 dark:text-brown-100"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    Nakshatra Compatibility (Koota)
                  </h3>
                </div>
                <p className="text-xs text-brown-400 dark:text-brown-500 mb-3">
                  Based on your Moon nakshatra ({vedicAnalysis.nakshatraCompatibility.nakshatra})
                </p>

                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="rounded-lg bg-pink-50 dark:bg-pink-900/10 p-3 text-center">
                    <p className="text-[10px] uppercase tracking-wider text-pink-500 dark:text-pink-400 mb-1">Yoni</p>
                    <p className="text-sm font-bold text-brown-800 dark:text-brown-200">{vedicAnalysis.nakshatraCompatibility.yoni}</p>
                  </div>
                  <div className="rounded-lg bg-purple-50 dark:bg-purple-900/10 p-3 text-center">
                    <p className="text-[10px] uppercase tracking-wider text-purple-500 dark:text-purple-400 mb-1">Gana</p>
                    <p className="text-sm font-bold text-brown-800 dark:text-brown-200">{vedicAnalysis.nakshatraCompatibility.gana}</p>
                  </div>
                  <div className="rounded-lg bg-teal-50 dark:bg-teal-900/10 p-3 text-center">
                    <p className="text-[10px] uppercase tracking-wider text-teal-500 dark:text-teal-400 mb-1">Nadi</p>
                    <p className="text-sm font-bold text-brown-800 dark:text-brown-200">{vedicAnalysis.nakshatraCompatibility.nadi.split(' ')[0]}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="rounded-lg bg-pink-50/50 dark:bg-pink-900/5 p-3">
                    <p className="text-[10px] uppercase tracking-wider text-pink-600 dark:text-pink-400 mb-1">Yoni (Animal Nature)</p>
                    <p className="text-xs text-brown-600 dark:text-brown-300 leading-relaxed">
                      {vedicAnalysis.nakshatraCompatibility.yoniDescription}
                    </p>
                  </div>
                  <div className="rounded-lg bg-purple-50/50 dark:bg-purple-900/5 p-3">
                    <p className="text-[10px] uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-1">Gana (Temperament)</p>
                    <p className="text-xs text-brown-600 dark:text-brown-300 leading-relaxed">
                      {vedicAnalysis.nakshatraCompatibility.ganaDescription}
                    </p>
                  </div>
                  <div className="rounded-lg bg-teal-50/50 dark:bg-teal-900/5 p-3">
                    <p className="text-[10px] uppercase tracking-wider text-teal-600 dark:text-teal-400 mb-1">Nadi (Constitution)</p>
                    <p className="text-xs text-brown-600 dark:text-brown-300 leading-relaxed">
                      {vedicAnalysis.nakshatraCompatibility.nadiDescription}
                    </p>
                  </div>
                </div>

                {vedicAnalysis.nakshatraCompatibility.compatibilityNotes.length > 0 && (
                  <div className="mt-3 rounded-lg bg-gold/5 dark:bg-gold/10 border border-gold/10 p-3">
                    <p className="text-[10px] uppercase tracking-wider text-gold-dark dark:text-gold mb-2 flex items-center gap-1">
                      <Star className="size-3" /> Compatibility Notes
                    </p>
                    <ul className="space-y-1.5">
                      {vedicAnalysis.nakshatraCompatibility.compatibilityNotes.map((note, idx) => (
                        <li key={idx} className="text-xs text-brown-600 dark:text-brown-300 leading-relaxed pl-3 border-l-2 border-gold/30 dark:border-gold/20">
                          {note}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ─── Full Analysis Tab ────────────────────────────────── */}
        {activeTab === 'analysis' && vedicAnalysis && (
          <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.05 }} className="space-y-6">
            {/* Chart Strength Overview */}
            <Card className="border-0 shadow-sm bg-gradient-to-br from-gold/5 to-sage-muted/10 dark:from-gold/10 dark:to-sage/5 overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-gold/10 dark:bg-gold/20">
                    <Crown className="size-5 text-gold-dark dark:text-gold" />
                  </div>
                  <div>
                    <h3
                      className="font-serif text-base font-bold text-brown-900 dark:text-brown-100"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                    >
                      Chart Strength
                    </h3>
                    <p className={`text-lg font-bold ${getChartStrengthColor(vedicAnalysis.summary.overallChartStrength)}`}>
                      {vedicAnalysis.summary.overallChartStrength}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-lg bg-white/50 dark:bg-white/5 p-2">
                    <p className="text-xs text-brown-400 dark:text-brown-500">Present Yogas</p>
                    <p className="text-lg font-bold text-sage-dark dark:text-sage">{vedicAnalysis.summary.presentYogas}</p>
                    <p className="text-[10px] text-brown-300 dark:text-brown-500">{vedicAnalysis.summary.strongYogas} strong</p>
                  </div>
                  <div className="rounded-lg bg-white/50 dark:bg-white/5 p-2">
                    <p className="text-xs text-brown-400 dark:text-brown-500">Present Doshas</p>
                    <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{vedicAnalysis.summary.presentDoshas}</p>
                    <p className="text-[10px] text-brown-300 dark:text-brown-500">{vedicAnalysis.summary.highSeverityDoshas} high</p>
                  </div>
                  <div className="rounded-lg bg-white/50 dark:bg-white/5 p-2">
                    <p className="text-xs text-brown-400 dark:text-brown-500">Process Time</p>
                    <p className="text-lg font-bold text-brown-600 dark:text-brown-300">
                      <Zap className="size-4 inline mr-1" />
                      Fast
                    </p>
                    <p className="text-[10px] text-brown-300 dark:text-brown-500">Deterministic</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ascendant Lord Analysis */}
            <Card className="border-0 shadow-sm bg-white dark:bg-white/5 overflow-hidden border-l-4 border-l-gold">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Sun className="size-4 text-gold-dark dark:text-gold" />
                  <h3
                    className="font-serif text-base font-bold text-brown-900 dark:text-brown-100"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    Ascendant Lord Analysis
                  </h3>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-gold/10 text-gold-dark dark:bg-gold/20 dark:text-gold border-0 text-xs">
                      {vedicAnalysis.ascendantLordAnalysis.ascendant}
                    </Badge>
                    <span className="text-xs text-brown-400 dark:text-brown-500">→</span>
                    <Badge className="bg-sage-muted text-sage-dark dark:bg-sage/20 dark:text-sage border-0 text-xs">
                      Lord: {vedicAnalysis.ascendantLordAnalysis.lord}
                    </Badge>
                    <Badge className={`${getStrengthBadge(vedicAnalysis.ascendantLordAnalysis.lordStrength).className} border-0 text-xs`}>
                      {vedicAnalysis.ascendantLordAnalysis.lordStrength}
                    </Badge>
                  </div>
                  <p className="text-sm text-brown-700 dark:text-brown-300 leading-relaxed">
                    {vedicAnalysis.ascendantLordAnalysis.analysis}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Current Dasha */}
            <Card className="border-0 shadow-sm bg-white dark:bg-white/5 overflow-hidden border-l-4 border-l-teal-400 dark:border-l-teal-500">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CircleDot className="size-4 text-teal-600 dark:text-teal-400" />
                  <h3
                    className="font-serif text-base font-bold text-brown-900 dark:text-brown-100"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    Current Dasha Period
                  </h3>
                </div>
                {vedicAnalysis.dashaInterpretation.mahadashaPlanet ? (
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300 border-0 text-xs">
                        Mahadasha: {vedicAnalysis.dashaInterpretation.mahadashaPlanet}
                      </Badge>
                      {vedicAnalysis.dashaInterpretation.antardashaPlanet && (
                        <Badge className="bg-teal-50 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400 border-0 text-xs">
                          Antardasha: {vedicAnalysis.dashaInterpretation.antardashaPlanet}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-brown-700 dark:text-brown-300 leading-relaxed">
                      {vedicAnalysis.dashaInterpretation.interpretation}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {vedicAnalysis.dashaInterpretation.areasAffected.map(area => (
                        <span
                          key={area}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-teal-50 text-teal-600 dark:bg-teal-900/20 dark:text-teal-300"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-brown-400 dark:text-brown-500">
                    Current dasha period could not be determined.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Planetary Strengths */}
            <Card className="border-0 shadow-sm bg-white dark:bg-white/5 overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Gem className="size-4 text-brown-600 dark:text-brown-300" />
                  <h3
                    className="font-serif text-base font-bold text-brown-900 dark:text-brown-100"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    Planetary Strengths
                  </h3>
                </div>
                <div className="max-h-72 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                  {vedicAnalysis.planetaryStrengths.map(ps => {
                    const strengthBadge = getStrengthBadge(ps.strength);
                    return (
                      <div
                        key={ps.planet}
                        className="flex items-center justify-between py-1.5 border-b border-brown-100/50 dark:border-brown-800/30 last:border-0"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-sm font-medium text-brown-800 dark:text-brown-200">{ps.planet}</span>
                          <span className="text-xs text-brown-400 dark:text-brown-500">{ps.sign}</span>
                          {ps.isRetrograde && <span className="text-[9px] px-1 py-0 rounded bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">R</span>}
                          {ps.isCombust && <span className="text-[9px] px-1 py-0 rounded bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400">C</span>}
                        </div>
                        <Badge className={`${strengthBadge.className} border-0 text-[10px] px-2 py-0`}>
                          {strengthBadge.label}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* House Analysis */}
            <Card className="border-0 shadow-sm bg-white dark:bg-white/5 overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="size-4 text-brown-600 dark:text-brown-300" />
                  <h3
                    className="font-serif text-base font-bold text-brown-900 dark:text-brown-100"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    House-by-House Analysis
                  </h3>
                </div>
                <div className="max-h-96 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                  {vedicAnalysis.houseAnalysis.map(house => {
                    const isOpen = expandedHouses[house.houseNumber] || false;
                    return (
                      <Collapsible
                        key={house.houseNumber}
                        open={isOpen}
                        onOpenChange={(open) => setExpandedHouses(prev => ({ ...prev, [house.houseNumber]: open }))}
                      >
                        <CollapsibleTrigger asChild>
                          <button className="w-full text-left py-2 border-b border-brown-100/50 dark:border-brown-800/30 hover:bg-brown-50/50 dark:hover:bg-brown-800/20 transition-colors rounded px-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-brown-600 dark:text-brown-300">H{house.houseNumber}</span>
                                <span className="text-xs font-medium text-brown-800 dark:text-brown-200">{house.houseName}</span>
                                <span className="text-[10px] text-brown-400 dark:text-brown-500">({house.sign})</span>
                                {house.planets.length > 0 && (
                                  <span className="text-[10px] text-gold-dark dark:text-gold">
                                    {house.planets.join(', ')}
                                  </span>
                                )}
                              </div>
                              <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                                <ChevronDown className="size-3 text-brown-300 dark:text-brown-500" />
                              </motion.div>
                            </div>
                          </button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="py-2 px-1">
                            <p className="text-xs text-brown-600 dark:text-brown-300 leading-relaxed">
                              {house.analysis}
                            </p>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Yoga Interpretations */}
            <Card className="border-0 shadow-sm bg-white dark:bg-white/5 overflow-hidden border-l-4 border-l-sage">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="size-4 text-sage-dark dark:text-sage" />
                  <h3
                    className="font-serif text-base font-bold text-brown-900 dark:text-brown-100"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    Detailed Yoga Analysis
                  </h3>
                </div>
                <div className="max-h-96 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                  {vedicAnalysis.yogaInterpretations.map(yi => {
                    const isOpen = expandedAnalysisYogas[yi.name] || false;
                    const strengthBadge = getStrengthBadge(yi.strength);
                    return (
                      <Collapsible
                        key={yi.name}
                        open={isOpen}
                        onOpenChange={(open) => setExpandedAnalysisYogas(prev => ({ ...prev, [yi.name]: open }))}
                      >
                        <CollapsibleTrigger asChild>
                          <button className={`w-full text-left py-2 border-b border-brown-100/50 dark:border-brown-800/30 hover:bg-brown-50/50 dark:hover:bg-brown-800/20 transition-colors rounded px-1 ${!yi.present ? 'opacity-50' : ''}`}>
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                {yi.present ? (
                                  <CheckCircle2 className="size-3 text-sage-dark dark:text-sage shrink-0" />
                                ) : (
                                  <span className="size-3 shrink-0 rounded-full border border-brown-300 dark:border-brown-600" />
                                )}
                                <span className="text-xs font-medium text-brown-800 dark:text-brown-200 truncate">{yi.name}</span>
                                {yi.present && (
                                  <Badge className={`${strengthBadge.className} border-0 text-[9px] px-1.5 py-0`}>
                                    {strengthBadge.label}
                                  </Badge>
                                )}
                              </div>
                              <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                                <ChevronDown className="size-3 text-brown-300 dark:text-brown-500 shrink-0" />
                              </motion.div>
                            </div>
                          </button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="py-2 px-1 space-y-1">
                            <p className="text-xs text-brown-600 dark:text-brown-300 leading-relaxed">{yi.description}</p>
                            {yi.interpretation && (
                              <p className="text-[11px] text-brown-500 dark:text-brown-400 leading-relaxed italic">
                                {yi.interpretation}
                              </p>
                            )}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Dosha Interpretations */}
            <Card className="border-0 shadow-sm bg-white dark:bg-white/5 overflow-hidden border-l-4 border-l-amber-400 dark:border-l-amber-500">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="size-4 text-amber-600 dark:text-amber-400" />
                  <h3
                    className="font-serif text-base font-bold text-brown-900 dark:text-brown-100"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    Detailed Dosha Analysis
                  </h3>
                </div>
                <div className="max-h-96 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                  {vedicAnalysis.doshaInterpretations.map(di => {
                    const isOpen = expandedAnalysisDoshas[di.name] || false;
                    const severityBadge = getSeverityBadge(di.severity);
                    return (
                      <Collapsible
                        key={di.name}
                        open={isOpen}
                        onOpenChange={(open) => setExpandedAnalysisDoshas(prev => ({ ...prev, [di.name]: open }))}
                      >
                        <CollapsibleTrigger asChild>
                          <button className={`w-full text-left py-2 border-b border-brown-100/50 dark:border-brown-800/30 hover:bg-brown-50/50 dark:hover:bg-brown-800/20 transition-colors rounded px-1 ${!di.present ? 'opacity-50' : ''}`}>
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                {di.present ? (
                                  <AlertTriangle className="size-3 text-amber-600 dark:text-amber-400 shrink-0" />
                                ) : (
                                  <CheckCircle2 className="size-3 text-sage-dark dark:text-sage shrink-0" />
                                )}
                                <span className="text-xs font-medium text-brown-800 dark:text-brown-200 truncate">{di.name}</span>
                                {di.present && (
                                  <Badge className={`${severityBadge.className} border-0 text-[9px] px-1.5 py-0`}>
                                    {severityBadge.label}
                                  </Badge>
                                )}
                              </div>
                              <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                                <ChevronDown className="size-3 text-brown-300 dark:text-brown-500 shrink-0" />
                              </motion.div>
                            </div>
                          </button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="py-2 px-1 space-y-1">
                            <p className="text-xs text-brown-600 dark:text-brown-300 leading-relaxed">{di.description}</p>
                            {di.remedies.length > 0 && (
                              <div className="space-y-1 mt-1">
                                <p className="text-[10px] uppercase tracking-wider text-brown-400 dark:text-brown-500">Remedies</p>
                                {di.remedies.slice(0, 3).map((remedy, idx) => (
                                  <p key={idx} className="text-[11px] text-brown-500 dark:text-brown-400 leading-relaxed pl-2 border-l border-amber-200 dark:border-amber-800">
                                    {remedy}
                                  </p>
                                ))}
                              </div>
                            )}
                            {di.interpretation && (
                              <p className="text-[11px] text-brown-500 dark:text-brown-400 leading-relaxed italic mt-1">
                                {di.interpretation}
                              </p>
                            )}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Refresh Analysis Button */}
        {needsAnalysis && userId && !analysisLoading && (
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchVedicAnalysis}
            className="w-full text-brown-400 dark:text-brown-500 hover:text-brown-600 dark:hover:text-brown-300"
          >
            <RefreshCw className="size-3 mr-1" />
            {vedicAnalysis ? 'Refresh Analysis' : 'Load Vedic Analysis'}
          </Button>
        )}

        {/* Educational Note */}
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-0 shadow-sm bg-sage-muted/10 dark:bg-sage/5">
              <CardContent className="p-4">
                <div className="flex items-start gap-2">
                  <Sparkles className="size-4 text-sage-dark dark:text-sage shrink-0 mt-0.5" />
                  <p className="text-xs text-brown-500 dark:text-brown-400 leading-relaxed">
                    Yogas and doshas are not predictions — they are patterns. They describe tendencies in your
                    emotional architecture, not fixed outcomes. Awareness is the first step to transformation.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Helper ──────────────────────────────────────────────────────────────────

function getOrdinalSuffix(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

// ─── Sub-Components ──────────────────────────────────────────────────────────

function YogaCard({
  yoga,
  isOpen,
  onToggle,
  isPresent,
  index,
}: {
  yoga: YogaDetail;
  isOpen: boolean;
  onToggle: (open: boolean) => void;
  isPresent: boolean;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.05 * index }}
    >
      <Card className={`border-0 shadow-sm overflow-hidden border-l-4 transition-opacity ${isPresent ? 'bg-white dark:bg-white/5 border-l-sage opacity-100' : 'bg-white/40 dark:bg-white/2 border-l-brown-200 dark:border-l-brown-700 opacity-60'}`}>
        <Collapsible open={isOpen} onOpenChange={onToggle}>
          <CollapsibleTrigger asChild>
            <button className={`w-full text-left p-4 transition-colors ${isPresent ? 'hover:bg-sage-muted/10 dark:hover:bg-sage/5' : 'hover:bg-brown-50/30 dark:hover:bg-brown-800/10'}`}>
              <div className="flex items-start gap-3">
                <span className="text-2xl shrink-0">{yoga.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3
                      className="font-serif text-base font-bold text-brown-900 dark:text-brown-100"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                    >
                      {yoga.name}
                    </h3>
                    {isPresent ? (
                      <Badge className="bg-sage-muted text-sage-dark dark:bg-sage/20 dark:text-sage border-0 text-[10px] px-2 py-0">
                        Present
                      </Badge>
                    ) : (
                      <Badge className="bg-brown-100 text-brown-400 dark:bg-brown-800/30 dark:text-brown-500 border-0 text-[10px] px-2 py-0">
                        Absent
                      </Badge>
                    )}
                  </div>
                  <p className="text-[11px] text-brown-300 dark:text-brown-500 mb-1">
                    {yoga.sanskrit}
                  </p>
                  <p className="text-sm text-brown-600 dark:text-brown-300 leading-relaxed">
                    {yoga.summary}
                  </p>
                </div>
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="shrink-0 mt-1"
                >
                  <ChevronDown className="size-4 text-brown-300 dark:text-brown-500" />
                </motion.div>
              </div>
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 pb-4 space-y-3 border-t border-sage/10 dark:border-sage/5 pt-3">
              <div className="rounded-lg bg-sage-muted/20 dark:bg-sage/10 p-3">
                <p className="text-sm text-brown-700 dark:text-brown-300 leading-relaxed">
                  {yoga.description}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-brown-50 dark:bg-brown-50/10 p-3">
                  <p className="text-[10px] uppercase tracking-wider text-brown-400 dark:text-brown-500 mb-1">Houses</p>
                  <p className="text-xs text-brown-700 dark:text-brown-300 leading-relaxed">{yoga.houses}</p>
                </div>
                <div className="rounded-lg bg-brown-50 dark:bg-brown-50/10 p-3">
                  <p className="text-[10px] uppercase tracking-wider text-brown-400 dark:text-brown-500 mb-1">Planets</p>
                  <p className="text-xs text-brown-700 dark:text-brown-300 leading-relaxed">{yoga.planets}</p>
                </div>
              </div>
              {isPresent && (
                <div className="rounded-lg bg-gold/5 dark:bg-gold/10 border border-gold/10 p-3">
                  <p className="text-[10px] uppercase tracking-wider text-gold-dark dark:text-gold mb-1 flex items-center gap-1">
                    <Heart className="size-3" /> Emotional Interpretation
                  </p>
                  <p className="text-xs text-brown-700 dark:text-brown-300 leading-relaxed">
                    {yoga.emotionalInterpretation}
                  </p>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </motion.div>
  );
}

function DoshaCard({
  dosha,
  isOpen,
  onToggle,
  isPresent,
  index,
}: {
  dosha: DoshaDetail;
  isOpen: boolean;
  onToggle: (open: boolean) => void;
  isPresent: boolean;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.05 * index }}
    >
      <Card className={`border-0 shadow-sm overflow-hidden border-l-4 transition-opacity ${isPresent ? 'bg-white dark:bg-white/5 border-l-amber-400 dark:border-l-amber-500 opacity-100' : 'bg-white/40 dark:bg-white/2 border-l-brown-200 dark:border-l-brown-700 opacity-60'}`}>
        <Collapsible open={isOpen} onOpenChange={onToggle}>
          <CollapsibleTrigger asChild>
            <button className={`w-full text-left p-4 transition-colors ${isPresent ? 'hover:bg-amber-50/30 dark:hover:bg-amber-900/5' : 'hover:bg-brown-50/30 dark:hover:bg-brown-800/10'}`}>
              <div className="flex items-start gap-3">
                <AlertTriangle className={`size-5 shrink-0 mt-0.5 ${isPresent ? 'text-amber-500 dark:text-amber-400' : 'text-brown-300 dark:text-brown-500'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3
                      className="font-serif text-base font-bold text-brown-900 dark:text-brown-100"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                    >
                      {dosha.name}
                    </h3>
                    <Badge className={`${getSeverityColor(dosha.severity)} border-0 text-[10px] px-2 py-0`}>
                      {dosha.severity}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-brown-300 dark:text-brown-500 mb-1">
                    {dosha.sanskrit}
                  </p>
                  <p className="text-sm text-brown-600 dark:text-brown-300 leading-relaxed">
                    {dosha.summary}
                  </p>
                </div>
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="shrink-0 mt-1"
                >
                  <ChevronDown className="size-4 text-brown-300 dark:text-brown-500" />
                </motion.div>
              </div>
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 pb-4 space-y-3 border-t border-amber/10 dark:border-amber/5 pt-3">
              <div className="rounded-lg bg-amber-50/30 dark:bg-amber-900/10 p-3">
                <p className="text-sm text-brown-700 dark:text-brown-300 leading-relaxed">
                  {dosha.description}
                </p>
              </div>
              {isPresent && (
                <div className="space-y-2">
                  <p className="text-[10px] uppercase tracking-wider text-brown-400 dark:text-brown-500">Remedies</p>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="rounded-lg bg-brown-50 dark:bg-brown-50/10 p-3 border-l-2 border-sage">
                      <p className="text-[10px] uppercase tracking-wider text-sage-dark dark:text-sage mb-1 flex items-center gap-1">
                        <Brain className="size-3" /> Behavioral
                      </p>
                      <p className="text-xs text-brown-700 dark:text-brown-300 leading-relaxed">
                        {dosha.remedies.behavioral}
                      </p>
                    </div>
                    <div className="rounded-lg bg-brown-50 dark:bg-brown-50/10 p-3 border-l-2 border-purple-400">
                      <p className="text-[10px] uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-1 flex items-center gap-1">
                        <Activity className="size-3" /> Mindfulness
                      </p>
                      <p className="text-xs text-brown-700 dark:text-brown-300 leading-relaxed">
                        {dosha.remedies.mindfulness}
                      </p>
                    </div>
                    <div className="rounded-lg bg-brown-50 dark:bg-brown-50/10 p-3 border-l-2 border-gold">
                      <p className="text-[10px] uppercase tracking-wider text-gold-dark dark:text-gold mb-1 flex items-center gap-1">
                        <PenLine className="size-3" /> Journaling
                      </p>
                      <p className="text-xs text-brown-700 dark:text-brown-300 leading-relaxed">
                        {dosha.remedies.journaling}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </motion.div>
  );
}
