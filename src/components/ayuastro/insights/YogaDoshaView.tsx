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
    description: 'The conjunction of Sun and Mercury creates Budh Aditya Yoga, the "Intellectual Radiance" combination. Your mind works with clarity and purpose — you articulate complex ideas effortlessly and process information with remarkable speed. This yoga enhances both your analytical abilities and your expressive power.',
    houses: 'Sun and Mercury in the same house (not combust)',
    planets: 'Sun (Surya) & Mercury (Budh)',
    emotionalInterpretation: 'This yoga shapes how you process emotions intellectually. You tend to understand your feelings by naming and analyzing them before fully experiencing them. This is a strength — it means you can communicate your emotional needs clearly — but remember that some feelings need to be felt before they can be understood.',
  },
  'Raj Yoga': {
    name: 'Raj Yoga',
    sanskrit: 'राजयोग',
    emoji: '👑',
    summary: 'Karmic and trikona lords unite for influence and purpose',
    description: 'Raj Yoga arises when the lords of kendra (angular) and trikona (trinal) houses form a relationship in your chart. This is one of the most powerful yogas, granting leadership potential, recognition, and a sense of life purpose. It does not guarantee external success — rather, it ensures you carry the inner architecture of someone meant to make an impact.',
    houses: 'Kendra lords (1st, 4th, 7th, 10th) & Trikona lords (1st, 5th, 9th) conjunct or aspecting',
    planets: 'Kendra & Trikona lords (varies by ascendant)',
    emotionalInterpretation: 'With Raj Yoga, you carry an innate sense of responsibility and purpose. You may feel an internal pressure to "live up to your potential," which can be both motivating and exhausting. Learning to separate authentic ambition from externally imposed expectations is your key emotional challenge.',
  },
  'Dhana Yoga': {
    name: 'Dhana Yoga',
    sanskrit: 'धनयोग',
    emoji: '💎',
    summary: 'Wealth-giving planetary combinations create material and spiritual abundance',
    description: 'Dhana Yoga forms when the lords of wealth-indicating houses (2nd and 11th) connect with the lords of trinal houses (1st, 5th, 9th) or are in conjunction/mutual aspect. This combination suggests natural financial acumen and an ability to attract resources. Beyond material wealth, it indicates richness of experience and meaningful connections.',
    houses: '2nd & 11th lords connecting with 1st, 5th, or 9th lords, or in mutual conjunction/aspect',
    planets: '2nd Lord, 11th Lord with Kendra/Trikona lords',
    emotionalInterpretation: 'Dhana Yoga shapes your relationship with security and self-worth. You may tie your emotional wellbeing to material stability more than you realize. The growth edge is recognizing that true abundance flows when you value yourself independently of what you have, and when you give generously from a place of inner fullness.',
  },
  'Neech Bhang Raj Yoga': {
    name: 'Neech Bhang Raj Yoga',
    sanskrit: 'नीचभङ्गराजयोग',
    emoji: '🦅',
    summary: 'A debilitated planet is lifted — struggle transforms into strength',
    description: 'Neech Bhang Raj Yoga arises when a debilitated planet receives cancellation through various astrological mechanisms. This is the "rise from fall" yoga — it indicates that the very challenges you face in one area of life become the source of your greatest strength. Your struggles are not random; they are the raw material of your power.',
    houses: 'Debilitated planet receiving cancellation via exaltation sign lord, navamsha, or aspect',
    planets: 'Varies — involves the debilitated planet and its cancellation planet(s)',
    emotionalInterpretation: 'This yoga reveals that your emotional wounds are not permanent limitations — they are the foundation of your emotional wisdom. You have likely overcome significant emotional challenges that others never face, and this gives you an uncommon depth of empathy and resilience. Your vulnerability is actually your access point to strength.',
  },
  'Chandra Mangal Yoga': {
    name: 'Chandra Mangal Yoga',
    sanskrit: 'चन्द्रमङ्गल योग',
    emoji: '🔥',
    summary: 'Emotional depth meets driven energy for passionate action',
    description: 'When the Moon and Mars conjoin or aspect each other, they create Chandra Mangal Yoga — the "Emotional Fire" combination. The Moon represents your emotional nature, and Mars represents your drive and courage. Together, they create someone who acts on their feelings with intensity and conviction.',
    houses: 'Moon and Mars in the same house or in mutual aspect',
    planets: 'Moon (Chandra) & Mars (Mangal)',
    emotionalInterpretation: 'This yoga amplifies your emotional intensity. You feel things deeply and act on them quickly — a combination that can lead to both passionate connection and impulsive reactions. Learning to sit with your emotions before acting on them is your key growth area. When you channel this energy intentionally, you become an unstoppable force for positive change.',
  },
  'Hansa Yoga': {
    name: 'Hansa Yoga',
    sanskrit: 'हंसयोग',
    emoji: '🦢',
    summary: 'Jupiter at peak strength grants wisdom, grace, and spiritual depth',
    description: 'Hansa Yoga forms when Jupiter is exalted or in its own sign in a kendra house. This "Swan" yoga grants exceptional wisdom, grace, and the ability to discern the essential from the non-essential. Like the mythical swan that separates milk from water, you can extract truth from complexity.',
    houses: 'Jupiter exalted (Cancer) or own sign (Sagittarius/Pisces) in 1st, 4th, 7th, or 10th house',
    planets: 'Jupiter (Guru)',
    emotionalInterpretation: 'Hansa Yoga gives you an emotional maturity that others find grounding. You naturally see the bigger picture in emotional situations and can offer perspective that helps everyone involved. The challenge is not becoming emotionally detached in your quest for understanding — wisdom without warmth is merely knowledge.',
  },
  'Malavya Yoga': {
    name: 'Malavya Yoga',
    sanskrit: 'मालव्ययोग',
    emoji: '🌹',
    summary: 'Venus at peak strength brings beauty, harmony, and relational grace',
    description: 'Malavya Yoga arises when Venus is exalted or in its own sign in a kendra house. This grants exceptional aesthetic sense, charm, and the ability to create harmony in relationships. You have a natural talent for bringing beauty and balance into environments and connections.',
    houses: 'Venus exalted (Pisces) or own sign (Taurus/Libra) in 1st, 4th, 7th, or 10th house',
    planets: 'Venus (Shukra)',
    emotionalInterpretation: 'With Malavya Yoga, your emotional life is deeply connected to beauty, harmony, and relationship. You may avoid conflict more than is healthy, prioritizing peace over authenticity. Learning that honest disagreement can deepen connection — and that imperfection has its own beauty — is your emotional evolution.',
  },
  'Shasha Yoga': {
    name: 'Shasha Yoga',
    sanskrit: 'शशयोग',
    emoji: '🏔️',
    summary: 'Saturn at peak strength delivers endurance, discipline, and lasting achievement',
    description: 'Shasha Yoga forms when Saturn is exalted or in its own sign in a kendra house. This grants extraordinary endurance, discipline, and the capacity for sustained effort over long periods. While others burn out, you endure — and your patience is eventually rewarded with lasting results.',
    houses: 'Saturn exalted (Libra) or own sign (Capricorn/Aquarius) in 1st, 4th, 7th, or 10th house',
    planets: 'Saturn (Shani)',
    emotionalInterpretation: 'Shasha Yoga gives you emotional stamina but can also create emotional guardedness. You may have learned early that expressing vulnerability leads to disappointment, so you built walls. The invitation is to let those walls have doors — your strength is most powerful when it protects something tender rather than hiding it.',
  },
  'Ruchaka Yoga': {
    name: 'Ruchaka Yoga',
    sanskrit: 'रुचकयोग',
    emoji: '⚔️',
    summary: 'Mars at peak strength provides courage, initiative, and competitive edge',
    description: 'Ruchaka Yoga arises when Mars is exalted or in its own sign in a kendra house. This grants exceptional courage, initiative, and the ability to take decisive action. You are a natural pioneer who thrives in challenging situations where others hesitate.',
    houses: 'Mars exalted (Capricorn) or own sign (Aries/Scorpio) in 1st, 4th, 7th, or 10th house',
    planets: 'Mars (Mangal)',
    emotionalInterpretation: 'With Ruchaka Yoga, your emotional landscape is defined by courage and intensity. You face emotional challenges head-on, which is admirable, but you may also rush through feelings that need time to process. Learning that emotional bravery includes sitting with discomfort — not just fighting through it — will transform your relationships.',
  },
  'Bhadra Yoga': {
    name: 'Bhadra Yoga',
    sanskrit: 'भद्रयोग',
    emoji: '📚',
    summary: 'Mercury at peak strength brings exceptional intellect and communication mastery',
    description: 'Bhadra Yoga forms when Mercury is exalted or in its own sign in a kendra house. This grants exceptional intelligence, eloquence, and the ability to synthesize complex ideas into clear communication. Your words carry weight and precision.',
    houses: 'Mercury exalted (Virgo) or own sign (Gemini/Virgo) in 1st, 4th, 7th, or 10th house',
    planets: 'Mercury (Budh)',
    emotionalInterpretation: 'Bhadra Yoga means your emotional world is deeply connected to language and thought. You process feelings through writing, conversation, or analysis. While this gives you remarkable emotional vocabulary, you may sometimes intellectualize emotions instead of feeling them. Allow yourself moments of wordless presence with your feelings.',
  },
  'Amala Yoga': {
    name: 'Amala Yoga',
    sanskrit: 'अमलयोग',
    emoji: '✨',
    summary: 'Venus and Jupiter in kendras from Moon grant pure reputation and lasting fame',
    description: 'Amala Yoga arises when both Venus and Jupiter occupy kendra houses (1st, 4th, 7th, 10th) from the Moon. "Amala" means "spotless" or "pure" — this yoga blesses the native with an unblemished reputation, moral authority, and lasting respect. Others see you as someone of genuine integrity.',
    houses: 'Venus and Jupiter in kendras (1st, 4th, 7th, 10th) from the Moon',
    planets: 'Moon (Chandra), Venus (Shukra) & Jupiter (Guru)',
    emotionalInterpretation: 'Amala Yoga gives you an emotional need for authenticity and alignment between your inner values and outer actions. You feel most at peace when your reputation genuinely reflects who you are inside. The challenge is not letting the desire for a "spotless" image prevent you from being vulnerable and human.',
  },
  'Veshi Yoga': {
    name: 'Veshi Yoga',
    sanskrit: 'वेशीयोग',
    emoji: '🗣️',
    summary: 'Planets in 2nd from the Sun bring wealth through speech and family',
    description: 'Veshi Yoga forms when planets (other than the Moon) occupy the 2nd house from the Sun. This placement channels the Sun\'s vitality into the domain of speech, family, and accumulated resources. The more planets in the 2nd from Sun, the stronger this yoga becomes. It suggests eloquence, persuasive power, and family-based prosperity.',
    houses: 'Planets in the 2nd sign/house from the Sun (excluding Moon)',
    planets: 'Sun (Surya) with planets in the next sign',
    emotionalInterpretation: 'Veshi Yoga connects your emotional expression to your sense of self-worth and family identity. You may find that speaking your truth — especially in family contexts — is both your greatest gift and your deepest vulnerability. When you learn to speak with both honesty and compassion, you unlock this yoga\'s full potential.',
  },
  'Voshi Yoga': {
    name: 'Voshi Yoga',
    sanskrit: 'वोशीयोग',
    emoji: '🌸',
    summary: 'Planets in 12th from the Sun bring happiness, comfort, and inner contentment',
    description: 'Voshi Yoga forms when planets (other than the Moon) occupy the 12th house from the Sun. This placement suggests that the Sun\'s conscious energy is supported by subconscious resources — intuition, spiritual depth, and inner contentment. The more planets in the 12th from Sun, the stronger this yoga becomes.',
    houses: 'Planets in the 12th sign/house from the Sun (excluding Moon)',
    planets: 'Sun (Surya) with planets in the previous sign',
    emotionalInterpretation: 'Voshi Yoga gives you access to emotional resources that operate beneath the surface of conscious awareness. You may find peace in solitude, meditation, or spiritual practice more easily than others. The growth edge is bringing this inner richness into your outer life — not retreating into comfort when the world needs your light.',
  },
  'Ubhayachari Yoga': {
    name: 'Ubhayachari Yoga',
    sanskrit: 'उभयचरीयोग',
    emoji: '🔱',
    summary: 'Planets flanking the Sun bring royal connections, status, and commanding presence',
    description: 'Ubhayachari Yoga is the most powerful of the three Sun-based yogas. It forms when planets occupy both the 2nd and 12th houses from the Sun simultaneously. The Sun becomes "flanked" by supportive planetary energy, amplifying its significations of authority, self-expression, and leadership. This combination suggests royal connections and a natural commanding presence.',
    houses: 'Planets in both the 2nd AND 12th signs/houses from the Sun (excluding Moon)',
    planets: 'Sun (Surya) with planets flanking it on both sides',
    emotionalInterpretation: 'Ubhayachari Yoga creates a personality that feels both supported and scrutinized. You may sense that others look to you for direction, even when you don\'t feel ready. The emotional task is embracing your natural authority without letting it isolate you from authentic connection. True leadership includes vulnerability.',
  },
  'Vipreet Raj Yoga': {
    name: 'Vipreet Raj Yoga',
    sanskrit: 'विपरीतराजयोग',
    emoji: '🌀',
    summary: 'Rise from adversity — challenges become the source of extraordinary power',
    description: 'Vipreet Raj Yoga forms when the lords of the challenging houses (6th, 8th, 12th) occupy other challenging houses. This "reverse" yoga transforms the energy of difficulty into the fuel for achievement. It consists of three sub-yogas: Harsha (6th lord in 6th/8th/12th), Sarala (8th lord in 6th/8th/12th), and Vimala (12th lord in 6th/8th/12th). The greater the adversity, the greater the eventual rise.',
    houses: 'Lords of 6th, 8th, or 12th house placed in 6th, 8th, or 12th house',
    planets: 'Lords of Dushtana houses (6th, 8th, 12th — varies by ascendant)',
    emotionalInterpretation: 'This yoga teaches that your deepest emotional wounds are portals to your greatest strengths. You have likely faced challenges that would break most people, and somehow you keep rising. The emotional pattern is: crisis → surrender → unexpected breakthrough. Trust this pattern — it is your cosmic blueprint for transformation.',
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
    description: 'Mangal Dosha arises when Mars occupies the 1st, 4th, 7th, 8th, or 12th house in your birth chart. This placement intensifies your passionate nature, creating strong emotional reactions and a deep desire for authenticity in relationships. The challenge is not your intensity — it is finding healthy outlets for it. When channeled well, this same energy makes you fiercely loyal and deeply committed.',
    remedies: {
      behavioral: 'Practice pausing 3 seconds before responding in conflict. Count slowly: one-thousand, two-thousand, three-thousand. This micro-gap transforms reactivity into intentional response.',
      mindfulness: 'Channel Mars energy through physical activity 3x/week — running, martial arts, dance, or any vigorous movement. Your body needs to discharge this intensity regularly to maintain emotional equilibrium.',
      journaling: 'What am I protecting when I react strongly? What vulnerability lies beneath my anger? Write about a recent conflict from the other person\'s perspective.',
    },
    severity: 'Moderate',
  },
  'Kaal Sarp Dosha': {
    name: 'Kaal Sarp Dosha',
    sanskrit: 'कालसर्पदोष',
    summary: 'Karmic patterns that invite deep transformation',
    description: 'Kaal Sarp Dosha occurs when all seven visible planets are hemmed between Rahu and Ketu in your birth chart. This creates a sense of recurring patterns — as if certain life themes keep returning until you address them fully. Rather than a curse, this dosha represents an accelerated karmic curriculum. The intensity of your challenges reflects the depth of transformation available to you.',
    remedies: {
      behavioral: 'Identify one recurring pattern in your life and commit to a different response this time. When you feel the familiar pull of the old pattern, deliberately choose the opposite action, even if it feels uncomfortable.',
      mindfulness: 'Practice 10 minutes of daily meditation focused on witnessing without judgment. Rahu-Ketu energy pulls you between past and future — meditation anchors you in the present, where real change happens.',
      journaling: 'What lesson keeps reappearing in different forms in my life? What would it look like to finally learn it? Describe the pattern, then rewrite the ending as you wish it had gone.',
    },
    severity: 'Significant',
  },
  'Pitra Dosha': {
    name: 'Pitra Dosha',
    sanskrit: 'पितृदोष',
    summary: 'Ancestral patterns seeking conscious resolution',
    description: 'Pitra Dosha relates to unresolved patterns inherited from previous generations. It often manifests as inherited emotional tendencies, family relationship dynamics that repeat across generations, or a sense of carrying emotional weight that does not feel entirely your own. The resolution comes not from rituals but from conscious awareness — when you see the pattern, you can choose differently.',
    remedies: {
      behavioral: 'Have an honest conversation with an older family member about emotional patterns you have noticed. Simply naming what has been unspoken begins the healing process for the entire family line.',
      mindfulness: 'Practice a weekly "ancestral reflection" — sit quietly and notice which of your emotional reactions feel like yours and which feel inherited. Gently release what does not belong to you with each exhale.',
      journaling: 'What emotional pattern did I inherit from my family? How has it served me, and how has it limited me? Write a letter (you do not need to send) breaking the pattern with compassion.',
    },
    severity: 'Mild',
  },
  'Shani Sade Sati': {
    name: 'Shani Sade Sati',
    sanskrit: 'शनिसाढ़ेसाती',
    summary: 'A 7.5-year period of profound restructuring and maturation',
    description: 'Sade Sati is the 7.5-year transit of Saturn through the 12th, 1st, and 2nd houses from your natal Moon. This is not a punishment — it is a deep restructuring period where Saturn asks you to release what no longer serves you and build on solid foundations. Relationships, career paths, and self-concepts that are not authentic will be tested. What remains after Sade Sati is what is truly yours.',
    remedies: {
      behavioral: 'Simplify one area of your life each month. Saturn rewards discipline and release. Let go of commitments, possessions, or habits that drain your energy without adding genuine value.',
      mindfulness: 'Establish a daily routine and stick to it consistently. Saturn respects discipline. Even 15 minutes of structured self-care each morning builds the stability that transforms this period from struggle to growth.',
      journaling: 'What is Saturn asking me to let go of? What am I clinging to out of fear rather than genuine desire? Describe the version of yourself that exists on the other side of this challenge.',
    },
    severity: 'Significant',
  },
  'Grahan Dosha': {
    name: 'Grahan Dosha',
    sanskrit: 'ग्रहणदोष',
    summary: 'Eclipse energy on the luminaries creates identity and emotional challenges',
    description: 'Grahan Dosha arises when the Sun or Moon is conjunct with Rahu or Ketu, carrying the shadow energy of eclipses. The Sun represents your core identity, confidence, and father figure. The Moon represents your emotional nature, intuition, and mother figure. When these luminaries are "eclipsed" by the nodes, you may experience periods of self-doubt, emotional turbulence, and a sense that something fundamental is obscured. This dosha also carries ancestral karma that surfaces for resolution.',
    remedies: {
      behavioral: 'During emotionally intense periods, create a "grounding anchor" — a specific physical action (like pressing your thumb and forefinger together) that reminds you: "This feeling is real, but it is not all of me." Practice this until it becomes automatic.',
      mindfulness: 'Spend 10 minutes daily in Surya Namaskar (Sun Salutation) to connect with solar energy, and practice Moon-gazing meditation on full moon nights. These practices restore the luminaries\' natural rhythm.',
      journaling: 'When did I last feel truly confident? When did I last feel emotionally at peace? What was different about those moments? Write about the "eclipse" in your life — what is being hidden, and what truth is waiting to be revealed?',
    },
    severity: 'Significant',
  },
  'Shrapit Dosha': {
    name: 'Shrapit Dosha',
    sanskrit: 'श्रापितदोष',
    summary: 'Curses from past lives create obstacles that invite karmic balance',
    description: 'Shrapit Dosha forms when Saturn and Rahu are in conjunction or mutual aspect. "Shrapit" means "cursed" — this dosha indicates karmic debts from past lives that manifest as unexplained obstacles, recurring delays, and a sense of working against an invisible current. The challenges are not random — they are karmic adjustments seeking balance. Awareness and conscious action can transform these obstacles into profound spiritual growth.',
    remedies: {
      behavioral: 'When faced with an obstacle, ask: "What is this situation teaching me that I have been avoiding?" Instead of fighting the delay, use the waiting time productively. Saturn rewards patience with lasting results.',
      mindfulness: 'Practice "karmic release" meditation — visualize the obstacle as a knot, and with each slow exhale, imagine the knot loosening. This is not magical thinking; it is training your nervous system to respond to difficulty with curiosity rather than resistance.',
      journaling: 'What keeps blocking me, no matter how hard I try? What karmic debt might I be balancing? Write a letter of forgiveness — to yourself, to the situation, to the past — releasing the need for the obstacle to define you.',
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

// ─── Component ───────────────────────────────────────────────────────────────

export default function YogaDoshaView() {
  const { astrologyData, setView, userId } = useAyuAstroStore();
  const [expandedYogas, setExpandedYogas] = useState<Record<string, boolean>>({});
  const [expandedDoshas, setExpandedDoshas] = useState<Record<string, boolean>>({});
  const [showAbsentYogas, setShowAbsentYogas] = useState(false);
  const [showAbsentDoshas, setShowAbsentDoshas] = useState(false);
  const [activeTab, setActiveTab] = useState<'yogas' | 'doshas' | 'analysis'>('yogas');

  // Vedic analysis state
  const [vedicAnalysis, setVedicAnalysis] = useState<VedicAnalysisData | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [expandedHouses, setExpandedHouses] = useState<Record<number, boolean>>({});
  const [expandedAnalysisYogas, setExpandedAnalysisYogas] = useState<Record<string, boolean>>({});
  const [expandedAnalysisDoshas, setExpandedAnalysisDoshas] = useState<Record<string, boolean>>({});

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
    if (activeTab === 'analysis' && !vedicAnalysis && !analysisLoading) {
      fetchVedicAnalysis();
    }
  }, [activeTab, vedicAnalysis, analysisLoading, fetchVedicAnalysis]);

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
          <div className="flex gap-1 p-1 rounded-xl bg-white/50 dark:bg-white/5 border border-brown-100 dark:border-brown-800">
            {[
              { id: 'yogas' as const, label: '✦ Yogas', count: presentYogas.length },
              { id: 'doshas' as const, label: '⚠️ Doshas', count: presentDoshas.length },
              { id: 'analysis' as const, label: '🔮 Analysis', count: null },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-white/10 text-brown-900 dark:text-brown-100 shadow-sm'
                    : 'text-brown-400 dark:text-brown-500 hover:text-brown-600 dark:hover:text-brown-300'
                }`}
              >
                {tab.label}
                {tab.count !== null && (
                  <span className="ml-1 text-xs opacity-60">({tab.count})</span>
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ─── Yogas Tab ────────────────────────────────────────── */}
        {activeTab === 'yogas' && (
          <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.05 }}>
            <h2
              className="font-serif text-lg font-bold text-brown-900 dark:text-brown-100 mb-3"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              ✦ Cosmic Blessings
            </h2>

            {/* Present Yogas */}
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

            {/* Show/Hide Absent Yogas */}
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

            {/* Present Doshas */}
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

            {/* Show/Hide Absent Doshas */}
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

        {/* ─── Analysis Tab ─────────────────────────────────────── */}
        {activeTab === 'analysis' && (
          <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.05 }} className="space-y-6">
            {/* Loading State */}
            {analysisLoading && (
              <Card className="border-0 shadow-sm bg-white dark:bg-white/5">
                <CardContent className="p-6 flex flex-col items-center gap-3">
                  <div className="relative">
                    <RefreshCw className="size-8 text-gold dark:text-gold animate-spin" />
                  </div>
                  <p className="text-sm text-brown-500 dark:text-brown-400">Generating comprehensive Vedic analysis...</p>
                </CardContent>
              </Card>
            )}

            {/* Error State */}
            {analysisError && (
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
            )}

            {/* Analysis Content */}
            {vedicAnalysis && (
              <>
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

                {/* Yoga Interpretations from API */}
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
                                {yi.involvingPlanets.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {yi.involvingPlanets.map(p => (
                                      <span key={p} className="text-[9px] px-1.5 py-0 rounded-full bg-sage-muted/30 dark:bg-sage/10 text-sage-dark dark:text-sage">
                                        {p}
                                      </span>
                                    ))}
                                  </div>
                                )}
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

                {/* Dosha Interpretations from API */}
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
              </>
            )}

            {/* Refresh Analysis Button */}
            {userId && !analysisLoading && (
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
          </motion.div>
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
              {/* Description */}
              <div className="rounded-lg bg-sage-muted/20 dark:bg-sage/10 p-3">
                <p className="text-sm text-brown-700 dark:text-brown-300 leading-relaxed">
                  {yoga.description}
                </p>
              </div>

              {/* Houses & Planets */}
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

              {/* Emotional Interpretation */}
              {isPresent && (
                <div className="rounded-lg bg-gold/5 dark:bg-gold/10 border border-gold/10 p-3">
                  <p className="text-[10px] uppercase tracking-wider text-gold-dark dark:text-gold mb-1 flex items-center gap-1">
                    <Sparkles className="size-3" />
                    Emotional Interpretation
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
            <button className={`w-full text-left p-4 transition-colors ${isPresent ? 'hover:bg-gold/5 dark:hover:bg-gold/5' : 'hover:bg-brown-50/30 dark:hover:bg-brown-800/10'}`}>
              <div className="flex items-start gap-3">
                <div className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${isPresent ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-brown-100 dark:bg-brown-800/30'}`}>
                  <AlertTriangle className={`size-4 ${isPresent ? 'text-amber-600 dark:text-amber-400' : 'text-brown-400 dark:text-brown-500'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3
                      className="font-serif text-base font-bold text-brown-900 dark:text-brown-100"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                    >
                      {dosha.name}
                    </h3>
                    {isPresent ? (
                      <Badge className={`${getSeverityColor(dosha.severity)} border-0 text-[10px] px-2 py-0`}>
                        {dosha.severity}
                      </Badge>
                    ) : (
                      <Badge className="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 border-0 text-[10px] px-2 py-0">
                        Clear
                      </Badge>
                    )}
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
            <div className="px-4 pb-4 space-y-3 border-t border-amber-200/30 dark:border-amber-500/10 pt-3">
              {/* Description */}
              <div className="rounded-lg bg-gold/5 dark:bg-gold/10 p-3">
                <p className="text-sm text-brown-700 dark:text-brown-300 leading-relaxed">
                  {dosha.description}
                </p>
              </div>

              {/* Remedies - only show if present */}
              {isPresent && (
                <div className="space-y-2">
                  <p className="text-[10px] uppercase tracking-wider text-brown-400 dark:text-brown-500 font-semibold">
                    Practical Remedies
                  </p>

                  {/* Behavioral Remedy */}
                  <div className="rounded-lg bg-sage-muted/20 dark:bg-sage/10 p-3">
                    <div className="flex items-center gap-2 mb-1.5">
                      <CheckCircle2 className="size-3.5 text-sage-dark dark:text-sage" />
                      <p className="text-[10px] uppercase tracking-wider text-sage-dark dark:text-sage font-semibold">
                        Behavioral
                      </p>
                    </div>
                    <p className="text-xs text-brown-700 dark:text-brown-300 leading-relaxed">
                      {dosha.remedies.behavioral}
                    </p>
                  </div>

                  {/* Mindfulness Remedy */}
                  <div className="rounded-lg bg-sage-muted/20 dark:bg-sage/10 p-3">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Brain className="size-3.5 text-sage-dark dark:text-sage" />
                      <p className="text-[10px] uppercase tracking-wider text-sage-dark dark:text-sage font-semibold">
                        Mindfulness
                      </p>
                    </div>
                    <p className="text-xs text-brown-700 dark:text-brown-300 leading-relaxed">
                      {dosha.remedies.mindfulness}
                    </p>
                  </div>

                  {/* Journaling Prompt */}
                  <div className="rounded-lg bg-sage-muted/20 dark:bg-sage/10 p-3">
                    <div className="flex items-center gap-2 mb-1.5">
                      <PenLine className="size-3.5 text-sage-dark dark:text-sage" />
                      <p className="text-[10px] uppercase tracking-wider text-sage-dark dark:text-sage font-semibold">
                        Journaling Prompt
                      </p>
                    </div>
                    <p className="text-xs text-brown-700 dark:text-brown-300 leading-relaxed italic">
                      &ldquo;{dosha.remedies.journaling}&rdquo;
                    </p>
                  </div>
                </div>
              )}

              {/* Severity */}
              {isPresent && (
                <div className="flex items-center gap-2">
                  <Activity className="size-3.5 text-brown-400 dark:text-brown-500" />
                  <span className="text-[10px] text-brown-400 dark:text-brown-500 uppercase tracking-wider">
                    Severity:
                  </span>
                  <Badge className={`${getSeverityColor(dosha.severity)} border-0 text-[10px] px-2 py-0`}>
                    {dosha.severity}
                  </Badge>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </motion.div>
  );
}
