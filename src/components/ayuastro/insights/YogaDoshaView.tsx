'use client';

import { useState } from 'react';
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
    description: 'Dhana Yoga forms when the lords of wealth-indicating houses (2nd and 11th) connect with the lords of trinal houses (1st, 5th, 9th). This combination suggests natural financial acumen and an ability to attract resources. Beyond material wealth, it indicates richness of experience and meaningful connections.',
    houses: '2nd & 11th lords connecting with 1st, 5th, or 9th lords',
    planets: 'Jupiter, Venus, or 2nd/11th lords with trikona lords',
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
};

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

// ─── Component ───────────────────────────────────────────────────────────────

export default function YogaDoshaView() {
  const { astrologyData, setView } = useAyuAstroStore();
  const [expandedYogas, setExpandedYogas] = useState<Record<string, boolean>>({});
  const [expandedDoshas, setExpandedDoshas] = useState<Record<string, boolean>>({});

  const userYogas = (astrologyData?.yogas || []).filter((y) => YOGA_DETAILS[y]);
  const userDoshas = (astrologyData?.doshas || []).filter((d) => DOSHA_DETAILS[d]);

  // If no detected yogas/doshas, show all for education
  const displayYogas = userYogas.length > 0 ? userYogas : Object.keys(YOGA_DETAILS).slice(0, 3);
  const displayDoshas = userDoshas.length > 0 ? userDoshas : Object.keys(DOSHA_DETAILS).slice(0, 2);

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
        <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.02 }} className="flex items-center gap-3">
          <Badge className="bg-sage-muted text-sage-dark dark:bg-sage/20 dark:text-sage border-0 text-sm px-3 py-1">
            {displayYogas.length} Yoga{displayYogas.length !== 1 ? 's' : ''} ✦
          </Badge>
          <Badge className="bg-gold/10 text-gold-dark dark:bg-gold/20 dark:text-gold border-0 text-sm px-3 py-1">
            {displayDoshas.length} Karmic Lesson{displayDoshas.length !== 1 ? 's' : ''} ⚠️
          </Badge>
        </motion.div>

        {/* ─── Yogas Section ──────────────────────────────────────── */}
        <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.05 }}>
          <h2
            className="font-serif text-lg font-bold text-brown-900 dark:text-brown-100 mb-3"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            ✦ Cosmic Blessings
          </h2>
          <div className="space-y-3">
            {displayYogas.map((yogaName, i) => {
              const yoga = YOGA_DETAILS[yogaName];
              if (!yoga) return null;
              const isOpen = expandedYogas[yogaName] || false;

              return (
                <motion.div
                  key={yogaName}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.05 * i }}
                >
                  <Card className="border-0 shadow-sm bg-white dark:bg-white/5 overflow-hidden border-l-4 border-l-sage">
                    <Collapsible
                      open={isOpen}
                      onOpenChange={(open) =>
                        setExpandedYogas((prev) => ({ ...prev, [yogaName]: open }))
                      }
                    >
                      <CollapsibleTrigger asChild>
                        <button className="w-full text-left p-4 hover:bg-sage-muted/10 dark:hover:bg-sage/5 transition-colors">
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
                          <div className="rounded-lg bg-gold/5 dark:bg-gold/10 border border-gold/10 p-3">
                            <p className="text-[10px] uppercase tracking-wider text-gold-dark dark:text-gold mb-1 flex items-center gap-1">
                              <Sparkles className="size-3" />
                              Emotional Interpretation
                            </p>
                            <p className="text-xs text-brown-700 dark:text-brown-300 leading-relaxed">
                              {yoga.emotionalInterpretation}
                            </p>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* ─── Doshas Section ─────────────────────────────────────── */}
        <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.1 }}>
          <h2
            className="font-serif text-lg font-bold text-brown-900 dark:text-brown-100 mb-3"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            ⚠️ Karmic Lessons
          </h2>
          <div className="space-y-3">
            {displayDoshas.map((doshaName, i) => {
              const dosha = DOSHA_DETAILS[doshaName];
              if (!dosha) return null;
              const isOpen = expandedDoshas[doshaName] || false;

              return (
                <motion.div
                  key={doshaName}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.05 * i }}
                >
                  <Card className="border-0 shadow-sm bg-white dark:bg-white/5 overflow-hidden border-l-4 border-l-amber-400 dark:border-l-amber-500">
                    <Collapsible
                      open={isOpen}
                      onOpenChange={(open) =>
                        setExpandedDoshas((prev) => ({ ...prev, [doshaName]: open }))
                      }
                    >
                      <CollapsibleTrigger asChild>
                        <button className="w-full text-left p-4 hover:bg-gold/5 dark:hover:bg-gold/5 transition-colors">
                          <div className="flex items-start gap-3">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                              <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400" />
                            </div>
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
                        <div className="px-4 pb-4 space-y-3 border-t border-amber-200/30 dark:border-amber-500/10 pt-3">
                          {/* Description */}
                          <div className="rounded-lg bg-gold/5 dark:bg-gold/10 p-3">
                            <p className="text-sm text-brown-700 dark:text-brown-300 leading-relaxed">
                              {dosha.description}
                            </p>
                          </div>

                          {/* Remedies */}
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

                          {/* Severity */}
                          <div className="flex items-center gap-2">
                            <Activity className="size-3.5 text-brown-400 dark:text-brown-500" />
                            <span className="text-[10px] text-brown-400 dark:text-brown-500 uppercase tracking-wider">
                              Severity:
                            </span>
                            <Badge className={`${getSeverityColor(dosha.severity)} border-0 text-[10px] px-2 py-0`}>
                              {dosha.severity}
                            </Badge>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

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
