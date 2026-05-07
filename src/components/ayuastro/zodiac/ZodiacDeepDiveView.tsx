'use client';

import { useState } from 'react';
import { useAyuAstroStore } from '@/store/ayuastro-store';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Heart,
  Briefcase,
  Sparkles,
  Flame,
  Mountain,
  Wind,
  Droplets,
} from 'lucide-react';

// ─── Type Definitions ────────────────────────────────────────────────────────

interface EmotionalTrait {
  name: string;
  score: number;
}

interface ZodiacSignData {
  symbol: string;
  name: string;
  abbr: string;
  dateRange: string;
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
  modality: 'Cardinal' | 'Fixed' | 'Mutable';
  ruler: string;
  rulerSymbol: string;
  quality: string;
  emotionalTraits: EmotionalTrait[];
  bestMatches: { sign: string; symbol: string }[];
  relationshipStrengths: string[];
  relationshipGrowthAreas: string[];
  loveLanguage: string;
  careerFields: { emoji: string; field: string }[];
  workStyle: string;
  leadershipStyle: string;
  lifeLesson: string;
  spiritualPractice: string;
  affirmation: string;
}

// ─── Complete Data for All 12 Zodiac Signs ───────────────────────────────────

const ZODIAC_DATA: Record<string, ZodiacSignData> = {
  Aries: {
    symbol: '♈',
    name: 'Aries',
    abbr: 'Ari',
    dateRange: 'Mar 21 – Apr 19',
    element: 'Fire',
    modality: 'Cardinal',
    ruler: 'Mars',
    rulerSymbol: '♂',
    quality: '🔥 The Pioneer',
    emotionalTraits: [
      { name: 'Courage', score: 92 },
      { name: 'Passion', score: 88 },
      { name: 'Impatience', score: 75 },
      { name: 'Independence', score: 85 },
      { name: 'Leadership', score: 80 },
      { name: 'Competitiveness', score: 78 },
    ],
    bestMatches: [
      { sign: 'Leo', symbol: '♌' },
      { sign: 'Sagittarius', symbol: '♐' },
      { sign: 'Gemini', symbol: '♊' },
    ],
    relationshipStrengths: [
      'Brings fearless authenticity and excitement to relationships',
      'Naturally protective and fiercely loyal once committed',
    ],
    relationshipGrowthAreas: [
      'Learning patience and allowing emotional pace to match the partner',
      'Balancing independence with emotional availability',
    ],
    loveLanguage: 'Acts of Service — showing love through bold, decisive action',
    careerFields: [
      { emoji: '⚔️', field: 'Military & Defense' },
      { emoji: '🏃', field: 'Sports & Athletics' },
      { emoji: '🚀', field: 'Entrepreneurship' },
      { emoji: '🏥', field: 'Emergency Medicine' },
      { emoji: '📢', field: 'Sales & Marketing' },
    ],
    workStyle: 'Thrives in fast-paced, competitive environments where initiative is rewarded. Prefers autonomy and quick decision-making over lengthy consensus-building.',
    leadershipStyle: 'Bold and inspiring — leads from the front, sets the pace, and motivates through contagious enthusiasm and fearless action.',
    lifeLesson: 'To learn that true strength includes the courage to be vulnerable and that patience is not weakness but wisdom.',
    spiritualPractice: 'Dynamic meditation or martial arts — channeling fiery energy into disciplined movement to discover stillness within action.',
    affirmation: 'I honor my fire by choosing where to direct it, rather than letting it burn indiscriminately.',
  },
  Taurus: {
    symbol: '♉',
    name: 'Taurus',
    abbr: 'Tau',
    dateRange: 'Apr 20 – May 20',
    element: 'Earth',
    modality: 'Fixed',
    ruler: 'Venus',
    rulerSymbol: '♀',
    quality: '🌿 The Builder',
    emotionalTraits: [
      { name: 'Patience', score: 90 },
      { name: 'Loyalty', score: 94 },
      { name: 'Sensuality', score: 85 },
      { name: 'Stubbornness', score: 80 },
      { name: 'Stability', score: 92 },
      { name: 'Practicality', score: 88 },
    ],
    bestMatches: [
      { sign: 'Virgo', symbol: '♍' },
      { sign: 'Capricorn', symbol: '♑' },
      { sign: 'Cancer', symbol: '♋' },
    ],
    relationshipStrengths: [
      'Offers unwavering dependability and creates a sanctuary of comfort',
      'Deeply affectionate and attuned to physical expressions of love',
    ],
    relationshipGrowthAreas: [
      'Releasing rigidity when life demands adaptability',
      'Learning that change can bring beauty, not just disruption',
    ],
    loveLanguage: 'Physical Touch & Quality Time — expressing devotion through presence and tender closeness',
    careerFields: [
      { emoji: '🏦', field: 'Finance & Banking' },
      { emoji: '🎨', field: 'Art & Design' },
      { emoji: '🍽️', field: 'Culinary Arts' },
      { emoji: '🏡', field: 'Real Estate' },
      { emoji: '🎶', field: 'Music & Performance' },
    ],
    workStyle: 'Methodical and thorough — builds lasting structures with patience. Prefers a stable routine and tangible results over abstract theories.',
    leadershipStyle: 'Steady and reliable — leads by example with quiet consistency, earning trust through demonstrated competence and follow-through.',
    lifeLesson: 'To understand that true security comes from within, not from external possessions or resisting change.',
    spiritualPractice: 'Nature immersion and sensory meditation — walking barefoot on earth, gardening, or cooking mindfully to connect body and spirit.',
    affirmation: 'My need for stability is not stubbornness — it is wisdom that knows what matters.',
  },
  Gemini: {
    symbol: '♊',
    name: 'Gemini',
    abbr: 'Gem',
    dateRange: 'May 21 – Jun 20',
    element: 'Air',
    modality: 'Mutable',
    ruler: 'Mercury',
    rulerSymbol: '☿',
    quality: '💬 The Communicator',
    emotionalTraits: [
      { name: 'Adaptability', score: 92 },
      { name: 'Curiosity', score: 90 },
      { name: 'Restlessness', score: 78 },
      { name: 'Wit', score: 88 },
      { name: 'Sociability', score: 86 },
      { name: 'Duality', score: 72 },
    ],
    bestMatches: [
      { sign: 'Libra', symbol: '♎' },
      { sign: 'Aquarius', symbol: '♒' },
      { sign: 'Aries', symbol: '♈' },
    ],
    relationshipStrengths: [
      'Keeps relationships mentally stimulating and endlessly fascinating',
      'Brings lightness and humor that dissolves tension naturally',
    ],
    relationshipGrowthAreas: [
      'Deepening emotional consistency beyond the initial excitement',
      'Learning to sit with uncomfortable feelings instead of intellectualizing them',
    ],
    loveLanguage: 'Words of Affirmation — expressing love through clever conversation, texts, and verbal affection',
    careerFields: [
      { emoji: '✍️', field: 'Journalism & Writing' },
      { emoji: '📡', field: 'Media & Broadcasting' },
      { emoji: '💼', field: 'Marketing & PR' },
      { emoji: '📚', field: 'Education & Teaching' },
      { emoji: '💻', field: 'Tech & Software' },
    ],
    workStyle: 'Flourishes in dynamic, mentally stimulating environments with variety. Needs constant intellectual challenge and the freedom to switch between projects.',
    leadershipStyle: 'Persuasive and communicative — leads through ideas, facilitates dialogue, and inspires by connecting diverse perspectives.',
    lifeLesson: 'To discover that depth is not the enemy of breadth, and that true wisdom integrates both thinking and feeling.',
    spiritualPractice: 'Journaling as meditation — free-writing to bridge the gap between scattered thoughts and deeper self-understanding.',
    affirmation: 'My many interests are not scattered — they are the constellation of my brilliance.',
  },
  Cancer: {
    symbol: '♋',
    name: 'Cancer',
    abbr: 'Can',
    dateRange: 'Jun 21 – Jul 22',
    element: 'Water',
    modality: 'Cardinal',
    ruler: 'Moon',
    rulerSymbol: '☽',
    quality: '🌊 The Nurturer',
    emotionalTraits: [
      { name: 'Empathy', score: 95 },
      { name: 'Intuition', score: 90 },
      { name: 'Protectiveness', score: 88 },
      { name: 'Moodiness', score: 76 },
      { name: 'Loyalty', score: 93 },
      { name: 'Tenacity', score: 82 },
    ],
    bestMatches: [
      { sign: 'Scorpio', symbol: '♏' },
      { sign: 'Pisces', symbol: '♓' },
      { sign: 'Taurus', symbol: '♉' },
    ],
    relationshipStrengths: [
      'Creates emotional safety and deep intimacy that few can match',
      'Remembers the small details that make a partner feel truly seen',
    ],
    relationshipGrowthAreas: [
      'Releasing the need to carry everyone\'s emotional weight',
      'Trusting that vulnerability strengthens rather than threatens bonds',
    ],
    loveLanguage: 'Quality Time & Acts of Service — nurturing through presence, home-cooked meals, and thoughtful care',
    careerFields: [
      { emoji: '🏥', field: 'Healthcare & Nursing' },
      { emoji: '👶', field: 'Childcare & Education' },
      { emoji: '🍳', field: 'Hospitality & Food' },
      { emoji: '🏠', field: 'Interior Design' },
      { emoji: '🧠', field: 'Psychology & Counseling' },
    ],
    workStyle: 'Thrives in supportive, collaborative environments where emotional intelligence is valued. Prefers meaningful work that directly helps others.',
    leadershipStyle: 'Nurturing and intuitive — leads by creating emotional safety, anticipating needs, and protecting the team like family.',
    lifeLesson: 'To learn that caring for oneself is not selfish but essential, and that boundaries are a form of love.',
    spiritualPractice: 'Moon rituals and water ceremonies — bathing with intention, tracking lunar cycles, and journaling emotional tides.',
    affirmation: 'My sensitivity is not a burden — it is the source of my deepest wisdom.',
  },
  Leo: {
    symbol: '♌',
    name: 'Leo',
    abbr: 'Leo',
    dateRange: 'Jul 23 – Aug 22',
    element: 'Fire',
    modality: 'Fixed',
    ruler: 'Sun',
    rulerSymbol: '☉',
    quality: '👑 The Sovereign',
    emotionalTraits: [
      { name: 'Generosity', score: 90 },
      { name: 'Confidence', score: 88 },
      { name: 'Pride', score: 78 },
      { name: 'Warmth', score: 92 },
      { name: 'Creativity', score: 86 },
      { name: 'Dramatic Flair', score: 74 },
    ],
    bestMatches: [
      { sign: 'Aries', symbol: '♈' },
      { sign: 'Sagittarius', symbol: '♐' },
      { sign: 'Libra', symbol: '♎' },
    ],
    relationshipStrengths: [
      'Radiates warmth that makes partners feel celebrated and adored',
      'Brings passion, playfulness, and unwavering devotion to loved ones',
    ],
    relationshipGrowthAreas: [
      'Balancing the need for admiration with genuine mutual appreciation',
      'Allowing vulnerability without feeling it diminishes their light',
    ],
    loveLanguage: 'Words of Affirmation & Gifts — grand gestures, compliments, and making their partner feel like royalty',
    careerFields: [
      { emoji: '🎭', field: 'Entertainment & Acting' },
      { emoji: '👔', field: 'Executive Leadership' },
      { emoji: '🎨', field: 'Creative Direction' },
      { emoji: '📣', field: 'Public Relations' },
      { emoji: '🎒', field: 'Fashion & Luxury' },
    ],
    workStyle: 'Shines in visible, creative roles where talent is recognized. Needs autonomy, appreciation, and the chance to make a memorable impact.',
    leadershipStyle: 'Charismatic and magnanimous — leads with warmth and vision, making everyone feel like part of something extraordinary.',
    lifeLesson: 'To realize that true radiance comes from authenticity, not performance, and that sharing the spotlight multiplies its brilliance.',
    spiritualPractice: 'Creative expression as devotion — painting, dancing, or performing as a way to channel divine energy and connect with the inner child.',
    affirmation: 'I shine brightest when I am authentic, not when I perform.',
  },
  Virgo: {
    symbol: '♍',
    name: 'Virgo',
    abbr: 'Vir',
    dateRange: 'Aug 23 – Sep 22',
    element: 'Earth',
    modality: 'Mutable',
    ruler: 'Mercury',
    rulerSymbol: '☿',
    quality: '🔍 The Analyst',
    emotionalTraits: [
      { name: 'Diligence', score: 92 },
      { name: 'Humility', score: 85 },
      { name: 'Perfectionism', score: 82 },
      { name: 'Service', score: 90 },
      { name: 'Analytical Mind', score: 94 },
      { name: 'Self-Criticism', score: 76 },
    ],
    bestMatches: [
      { sign: 'Taurus', symbol: '♉' },
      { sign: 'Capricorn', symbol: '♑' },
      { sign: 'Scorpio', symbol: '♏' },
    ],
    relationshipStrengths: [
      'Shows love through thoughtful, practical actions and meticulous care',
      'Deeply observant — notices and remembers what truly matters to a partner',
    ],
    relationshipGrowthAreas: [
      'Releasing the need to fix or improve their partner and accepting them as-is',
      'Allowing imperfection in themselves and the relationship without anxiety',
    ],
    loveLanguage: 'Acts of Service — anticipating needs, solving problems, and creating order as expressions of deep love',
    careerFields: [
      { emoji: '🔬', field: 'Research & Science' },
      { emoji: '💊', field: 'Medicine & Pharmacy' },
      { emoji: '📊', field: 'Data Analysis' },
      { emoji: '✏️', field: 'Editing & Publishing' },
      { emoji: '🌱', field: 'Nutrition & Wellness' },
    ],
    workStyle: 'Excellence-driven and detail-oriented — creates systems that work flawlessly. Thrives with clear expectations and the freedom to refine processes.',
    leadershipStyle: 'Competent and service-oriented — leads by example, sets high standards, and supports the team with practical solutions and quiet dedication.',
    lifeLesson: 'To understand that wholeness includes imperfection, and that self-compassion is not indulgence but the foundation of genuine service.',
    spiritualPractice: 'Mindful organization and purification rituals — decluttering spaces, preparing food with intention, and finding the sacred in daily rituals.',
    affirmation: 'I release the need for perfection and embrace the beauty of being enough.',
  },
  Libra: {
    symbol: '♎',
    name: 'Libra',
    abbr: 'Lib',
    dateRange: 'Sep 23 – Oct 22',
    element: 'Air',
    modality: 'Cardinal',
    ruler: 'Venus',
    rulerSymbol: '♀',
    quality: '⚖️ The Harmonizer',
    emotionalTraits: [
      { name: 'Diplomacy', score: 92 },
      { name: 'Harmony', score: 90 },
      { name: 'Indecisiveness', score: 74 },
      { name: 'Aesthetic Sense', score: 88 },
      { name: 'Fairness', score: 86 },
      { name: 'People-Pleasing', score: 72 },
    ],
    bestMatches: [
      { sign: 'Gemini', symbol: '♊' },
      { sign: 'Aquarius', symbol: '♒' },
      { sign: 'Leo', symbol: '♌' },
    ],
    relationshipStrengths: [
      'Creates beautiful, harmonious partnership dynamics with natural grace',
      'Deeply attentive to the emotional needs and aesthetic experience of their partner',
    ],
    relationshipGrowthAreas: [
      'Honoring their own needs instead of always prioritizing the other person',
      'Making decisions without over-relying on external validation or approval',
    ],
    loveLanguage: 'Quality Time & Aesthetic Experiences — curated dates, beautiful settings, and shared artistic moments',
    careerFields: [
      { emoji: '⚖️', field: 'Law & Mediation' },
      { emoji: '🎨', field: 'Art & Design Curation' },
      { emoji: '🤝', field: 'Diplomacy & International Relations' },
      { emoji: '💍', field: 'Event Planning' },
      { emoji: '🎭', field: 'Fashion & Beauty' },
    ],
    workStyle: 'Thrives in elegant, collaborative environments where beauty and justice intersect. Needs balance between social interaction and quiet reflection.',
    leadershipStyle: 'Collaborative and diplomatic — leads by building consensus, ensuring fairness, and creating environments where everyone feels valued.',
    lifeLesson: 'To discover that inner balance comes from self-trust, not from constantly weighing others\' opinions against one\'s own.',
    spiritualPractice: 'Art appreciation and balanced meditation — visiting galleries, creating beauty, and practicing decision-making as a spiritual exercise.',
    affirmation: 'My desire for harmony is a gift — today I remember it must include harmony within myself.',
  },
  Scorpio: {
    symbol: '♏',
    name: 'Scorpio',
    abbr: 'Sco',
    dateRange: 'Oct 23 – Nov 21',
    element: 'Water',
    modality: 'Fixed',
    ruler: 'Pluto',
    rulerSymbol: '♇',
    quality: '🦋 The Transformer',
    emotionalTraits: [
      { name: 'Intensity', score: 95 },
      { name: 'Depth', score: 94 },
      { name: 'Jealousy', score: 72 },
      { name: 'Resilience', score: 90 },
      { name: 'Perceptiveness', score: 92 },
      { name: 'Secretiveness', score: 78 },
    ],
    bestMatches: [
      { sign: 'Cancer', symbol: '♋' },
      { sign: 'Pisces', symbol: '♓' },
      { sign: 'Virgo', symbol: '♍' },
    ],
    relationshipStrengths: [
      'Offers transformative emotional depth and complete emotional presence',
      'Loyalty that is absolute — once committed, they will walk through fire',
    ],
    relationshipGrowthAreas: [
      'Releasing control and trusting the natural flow of emotional connection',
      'Allowing transparency instead of testing partners through hidden expectations',
    ],
    loveLanguage: 'Physical Intimacy & Deep Conversation — merging souls through vulnerability and profound connection',
    careerFields: [
      { emoji: '🔍', field: 'Investigation & Research' },
      { emoji: '🧠', field: 'Psychology & Therapy' },
      { emoji: '💰', field: 'Finance & Investment' },
      { emoji: '🕵️', field: 'Intelligence & Security' },
      { emoji: '⚕️', field: 'Surgery & Forensics' },
    ],
    workStyle: 'Thrives in deep, focused work that requires penetrating insight. Prefers autonomy, intensity, and the power to uncover hidden truths.',
    leadershipStyle: 'Strategic and transformative — leads with penetrating insight, inspires through depth of commitment, and empowers through fearless truth-telling.',
    lifeLesson: 'To learn that surrender is not defeat but the gateway to rebirth, and that vulnerability is the ultimate power.',
    spiritualPractice: 'Shadow work and depth meditation — journaling in darkness, exploring the unconscious, and embracing transformation through ritual death-and-rebirth practices.',
    affirmation: 'My intensity is not too much — it is the depth that allows me to truly transform.',
  },
  Sagittarius: {
    symbol: '♐',
    name: 'Sagittarius',
    abbr: 'Sag',
    dateRange: 'Nov 22 – Dec 21',
    element: 'Fire',
    modality: 'Mutable',
    ruler: 'Jupiter',
    rulerSymbol: '♃',
    quality: '🏹 The Explorer',
    emotionalTraits: [
      { name: 'Optimism', score: 90 },
      { name: 'Freedom', score: 92 },
      { name: 'Restlessness', score: 80 },
      { name: 'Philosophy', score: 86 },
      { name: 'Honesty', score: 84 },
      { name: 'Tactlessness', score: 70 },
    ],
    bestMatches: [
      { sign: 'Aries', symbol: '♈' },
      { sign: 'Leo', symbol: '♌' },
      { sign: 'Aquarius', symbol: '♒' },
    ],
    relationshipStrengths: [
      'Brings adventure, humor, and philosophical depth to relationships',
      'Inspires partners to grow beyond their comfort zones with infectious enthusiasm',
    ],
    relationshipGrowthAreas: [
      'Learning that commitment and freedom are not mutually exclusive',
      'Developing sensitivity in how truth is delivered — honesty with heart',
    ],
    loveLanguage: 'Shared Adventures & Deep Conversations — exploring the world together and discussing the meaning of life',
    careerFields: [
      { emoji: '✈️', field: 'Travel & Tourism' },
      { emoji: '📚', field: 'Academia & Philosophy' },
      { emoji: '⚖️', field: 'Law & Justice' },
      { emoji: '📖', field: 'Publishing & Writing' },
      { emoji: '🌍', field: 'International Development' },
    ],
    workStyle: 'Thrives with freedom, variety, and meaningful purpose. Needs intellectual stimulation, travel opportunities, and the ability to think big.',
    leadershipStyle: 'Visionary and inspiring — leads with infectious optimism, big-picture thinking, and the courage to venture into the unknown.',
    lifeLesson: 'To discover that the deepest adventure is the inner journey, and that meaning is found not just in distant horizons but in present connections.',
    spiritualPractice: 'Pilgrimage and philosophical study — traveling to sacred sites, studying world wisdom traditions, and finding the universal thread that connects all paths.',
    affirmation: 'My restlessness is the compass that leads me to growth — I trust its direction.',
  },
  Capricorn: {
    symbol: '♑',
    name: 'Capricorn',
    abbr: 'Cap',
    dateRange: 'Dec 22 – Jan 19',
    element: 'Earth',
    modality: 'Cardinal',
    ruler: 'Saturn',
    rulerSymbol: '♄',
    quality: '🏔️ The Architect',
    emotionalTraits: [
      { name: 'Discipline', score: 94 },
      { name: 'Ambition', score: 92 },
      { name: 'Responsibility', score: 90 },
      { name: 'Emotional Reserve', score: 76 },
      { name: 'Persistence', score: 88 },
      { name: 'Authority', score: 84 },
    ],
    bestMatches: [
      { sign: 'Taurus', symbol: '♉' },
      { sign: 'Virgo', symbol: '♍' },
      { sign: 'Scorpio', symbol: '♏' },
    ],
    relationshipStrengths: [
      'Provides unwavering stability and a deep commitment that deepens with time',
      'Shows love through reliability, protection, and building a secure future together',
    ],
    relationshipGrowthAreas: [
      'Allowing emotional vulnerability without fearing it undermines their strength',
      'Learning that rest and play are not rewards to be earned but essential needs',
    ],
    loveLanguage: 'Acts of Service & Commitment — building a life together, providing security, and showing up consistently',
    careerFields: [
      { emoji: '🏗️', field: 'Engineering & Architecture' },
      { emoji: '💼', field: 'Business & Management' },
      { emoji: '🏛️', field: 'Government & Policy' },
      { emoji: '📊', field: 'Finance & Investment' },
      { emoji: '🎓', field: 'Academic Administration' },
    ],
    workStyle: 'Structured and strategic — builds empires with patient persistence. Thrives with clear hierarchies, long-term goals, and measurable progress.',
    leadershipStyle: 'Authoritative and dependable — leads with quiet strength, sets the standard through personal example, and builds institutions that endure.',
    lifeLesson: 'To understand that true achievement includes emotional richness, and that the heart\'s desires deserve the same dedication as career ambitions.',
    spiritualPractice: 'Structured contemplation and mountain meditation — climbing both literal and metaphorical peaks, finding the sacred in discipline and silence.',
    affirmation: 'My ambition is fueled by purpose, not by the need to prove my worth.',
  },
  Aquarius: {
    symbol: '♒',
    name: 'Aquarius',
    abbr: 'Aqu',
    dateRange: 'Jan 20 – Feb 18',
    element: 'Air',
    modality: 'Fixed',
    ruler: 'Uranus',
    rulerSymbol: '⛢',
    quality: '⚡ The Visionary',
    emotionalTraits: [
      { name: 'Innovation', score: 92 },
      { name: 'Idealism', score: 86 },
      { name: 'Detachment', score: 78 },
      { name: 'Humanitarianism', score: 88 },
      { name: 'Independence', score: 90 },
      { name: 'Rebelliousness', score: 74 },
    ],
    bestMatches: [
      { sign: 'Gemini', symbol: '♊' },
      { sign: 'Libra', symbol: '♎' },
      { sign: 'Sagittarius', symbol: '♐' },
    ],
    relationshipStrengths: [
      'Brings intellectual stimulation and a refreshing perspective on partnership',
      'Accepts and celebrates their partner\'s uniqueness without trying to change them',
    ],
    relationshipGrowthAreas: [
      'Bridging the gap between intellectual understanding and emotional presence',
      'Allowing intimacy without fearing it will compromise their individuality',
    ],
    loveLanguage: 'Intellectual Connection & Friendship First — deep conversations, shared causes, and respect for each other\'s autonomy',
    careerFields: [
      { emoji: '💻', field: 'Technology & Innovation' },
      { emoji: '🔬', field: 'Scientific Research' },
      { emoji: '🌐', field: 'Social Activism' },
      { emoji: '🛸', field: 'Aerospace & Space' },
      { emoji: '📡', field: 'Digital Media & Platforms' },
    ],
    workStyle: 'Thrives in innovative, purpose-driven environments that challenge convention. Needs intellectual freedom, collaborative problem-solving, and a meaningful mission.',
    leadershipStyle: 'Progressive and egalitarian — leads by vision and example, empowering the collective, and disrupting outdated systems for the greater good.',
    lifeLesson: 'To learn that emotional connection is not a constraint on freedom but the very thing that gives innovation its purpose and heart.',
    spiritualPractice: 'Collective meditation and future-visioning — participating in group consciousness practices, channeling energy toward humanitarian goals, and meditating on the collective.',
    affirmation: 'My vision for a better world begins with how I treat myself today.',
  },
  Pisces: {
    symbol: '♓',
    name: 'Pisces',
    abbr: 'Pis',
    dateRange: 'Feb 19 – Mar 20',
    element: 'Water',
    modality: 'Mutable',
    ruler: 'Neptune',
    rulerSymbol: '♆',
    quality: '🌙 The Dreamer',
    emotionalTraits: [
      { name: 'Compassion', score: 95 },
      { name: 'Imagination', score: 92 },
      { name: 'Escapism', score: 74 },
      { name: 'Intuition', score: 90 },
      { name: 'Sensitivity', score: 94 },
      { name: 'Boundaries', score: 68 },
    ],
    bestMatches: [
      { sign: 'Cancer', symbol: '♋' },
      { sign: 'Scorpio', symbol: '♏' },
      { sign: 'Taurus', symbol: '♉' },
    ],
    relationshipStrengths: [
      'Offers boundless empathy and a soul-deep understanding that transcends words',
      'Creates a magical, dreamlike emotional atmosphere where love feels transcendent',
    ],
    relationshipGrowthAreas: [
      'Establishing healthy boundaries instead of dissolving into the partner\'s emotional world',
      'Staying grounded in reality rather than escaping into romantic idealization',
    ],
    loveLanguage: 'Emotional Presence & Creative Expression — sharing dreams, creating art together, and dissolving into soulful connection',
    careerFields: [
      { emoji: '🎨', field: 'Art & Music' },
      { emoji: '🎬', field: 'Film & Photography' },
      { emoji: '🏥', field: 'Healing & Therapy' },
      { emoji: '✍️', field: 'Poetry & Writing' },
      { emoji: '🌊', field: 'Marine Biology' },
    ],
    workStyle: 'Thrives in creative, compassionate environments with room for imagination. Needs flexibility, inspiration, and work that connects to a deeper sense of meaning.',
    leadershipStyle: 'Inspiring and intuitive — leads through empathy and creative vision, sensing what the collective needs before it can be articulated.',
    lifeLesson: 'To learn that boundaries are not walls but the sacred containers that allow empathy to flow sustainably without self-depletion.',
    spiritualPractice: 'Dreamwork and ocean meditation — keeping a dream journal, practicing lucid dreaming, and connecting with water as a portal to the unconscious.',
    affirmation: 'My empathy is a superpower — today I use it on myself first.',
  },
};

const SIGN_ORDER = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

// ─── Element Config ──────────────────────────────────────────────────────────

const ELEMENT_CONFIG: Record<string, { icon: React.ElementType; bgClass: string; textClass: string; darkBgClass: string; darkTextClass: string; barClass: string }> = {
  Fire: { icon: Flame, bgClass: 'bg-red-50', textClass: 'text-red-600', darkBgClass: 'dark:bg-red-900/30', darkTextClass: 'dark:text-red-300', barClass: 'bg-gradient-to-r from-red-500 to-orange-400' },
  Earth: { icon: Mountain, bgClass: 'bg-green-50', textClass: 'text-green-700', darkBgClass: 'dark:bg-green-900/30', darkTextClass: 'dark:text-green-300', barClass: 'bg-gradient-to-r from-green-600 to-emerald-400' },
  Air: { icon: Wind, bgClass: 'bg-amber-50', textClass: 'text-amber-700', darkBgClass: 'dark:bg-amber-900/30', darkTextClass: 'dark:text-amber-300', barClass: 'bg-gradient-to-r from-yellow-400 to-amber-400' },
  Water: { icon: Droplets, bgClass: 'bg-blue-50', textClass: 'text-blue-600', darkBgClass: 'dark:bg-blue-900/30', darkTextClass: 'dark:text-blue-300', barClass: 'bg-gradient-to-r from-blue-500 to-teal-400' },
};

// ─── Animation Variants ──────────────────────────────────────────────────────

const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function ZodiacDeepDiveView() {
  const { astrologyData, setView } = useAyuAstroStore();
  const [selectedSign, setSelectedSign] = useState(astrologyData?.sunSign || 'Aries');

  const sunSign = astrologyData?.sunSign || '';
  const moonSign = astrologyData?.moonSign || '';
  const ascendant = astrologyData?.ascendant || '';

  const data = ZODIAC_DATA[selectedSign];
  if (!data) return null;

  const elementConfig = ELEMENT_CONFIG[data.element];
  const ElementIcon = elementConfig.icon;

  const isOwnSign = (sign: string) => sign === sunSign || sign === moonSign || sign === ascendant;
  const getOwnBadge = (sign: string): string | null => {
    if (sign === sunSign) return 'Sun';
    if (sign === moonSign) return 'Moon';
    if (sign === ascendant) return 'Asc';
    return null;
  };

  return (
    <div className="bg-cream dark:bg-[#1a1410] min-h-screen pb-24">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-cream/90 dark:bg-[#1a1410]/90 backdrop-blur-md border-b border-gold/10 dark:border-gold/5">
        <div className="mx-auto max-w-lg px-4 py-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setView('insights')}
            className="text-brown-500 dark:text-brown-300 hover:text-brown-700 dark:hover:text-brown-100 -ml-2"
          >
            <ArrowLeft className="size-4 mr-1" />
            Back
          </Button>
          <h1
            className="font-serif text-lg font-bold text-brown-900 dark:text-brown-100 flex-1"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Zodiac Deep Dive
          </h1>
          <Sparkles className="size-5 text-gold dark:text-gold" />
        </div>
      </div>

      {/* Zodiac Sign Selector — Horizontal Scroll */}
      <div className="sticky top-[52px] z-20 bg-cream/95 dark:bg-[#1a1410]/95 backdrop-blur-md border-b border-brown-100/50 dark:border-brown-700/20">
        <div
          className="mx-auto max-w-lg py-3 px-4 overflow-x-auto flex gap-2 scrollbar-thin"
          style={{ scrollbarWidth: 'thin' }}
        >
          {SIGN_ORDER.map((sign) => {
            const sd = ZODIAC_DATA[sign];
            const isActive = selectedSign === sign;
            const ownBadge = getOwnBadge(sign);
            return (
              <button
                key={sign}
                onClick={() => setSelectedSign(sign)}
                className={`relative shrink-0 flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gold/15 dark:bg-gold/20 ring-2 ring-gold shadow-md'
                    : 'bg-white dark:bg-white/5 hover:bg-brown-50 dark:hover:bg-white/10 shadow-sm'
                }`}
                aria-label={sd.name}
                aria-pressed={isActive}
              >
                <span className={`text-2xl leading-none ${isActive ? 'scale-110' : ''} transition-transform`}>
                  {sd.symbol}
                </span>
                <span className={`text-[10px] font-semibold tracking-wide ${
                  isActive
                    ? 'text-gold-dark dark:text-gold'
                    : 'text-brown-400 dark:text-brown-300'
                }`}>
                  {sd.abbr}
                </span>
                {ownBadge && (
                  <span className={`absolute -top-1 -right-1 text-[8px] font-bold px-1 py-0 rounded-full leading-tight ${
                    ownBadge === 'Sun'
                      ? 'bg-gold text-white'
                      : ownBadge === 'Moon'
                      ? 'bg-sage text-white'
                      : 'bg-brown-500 text-white'
                  }`}>
                    {ownBadge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-lg px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedSign}
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-5"
          >
            {/* ─── Sign Hero Card ──────────────────────────────────────────── */}
            <motion.div variants={staggerItem}>
              <Card className="border-0 shadow-md bg-white dark:bg-white/5 overflow-hidden card-hover">
                <div className="h-1.5 bg-gradient-to-r from-gold via-gold-dark to-sage" />
                <CardContent className="p-6 text-center">
                  {/* Large zodiac symbol with gold gradient */}
                  <div className="relative inline-block mb-3">
                    <span
                      className="text-8xl leading-none text-gold-gradient"
                      style={{
                        background: 'linear-gradient(135deg, #D4AF37, #B8860B, #8B6914)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      {data.symbol}
                    </span>
                  </div>

                  {/* Sign name */}
                  <h2
                    className="font-serif text-3xl font-bold text-brown-900 dark:text-brown-100 mb-1"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    {data.name}
                  </h2>

                  {/* Date range */}
                  <p className="text-sm text-brown-400 dark:text-brown-400 mb-4">
                    {data.dateRange}
                  </p>

                  {/* Element + Modality + Ruler badges */}
                  <div className="flex items-center justify-center gap-2 flex-wrap mb-4">
                    <Badge className={`${elementConfig.bgClass} ${elementConfig.textClass} ${elementConfig.darkBgClass} ${elementConfig.darkTextClass} border-0 text-xs px-3 py-1 flex items-center gap-1.5`}>
                      <ElementIcon className="size-3.5" />
                      {data.element}
                    </Badge>
                    <Badge className="bg-brown-50 text-brown-600 dark:bg-brown-800/30 dark:text-brown-300 border-0 text-xs px-3 py-1">
                      {data.modality}
                    </Badge>
                    <Badge className="bg-gold/10 text-gold-dark dark:bg-gold/20 dark:text-gold border-0 text-xs px-3 py-1 flex items-center gap-1.5">
                      <span className="text-sm">{data.rulerSymbol}</span>
                      {data.ruler}
                    </Badge>
                  </div>

                  {/* Quality */}
                  <p
                    className="font-serif text-lg text-brown-700 dark:text-brown-200"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    {data.quality}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* ─── Emotional Profile Card ───────────────────────────────────── */}
            <motion.div variants={staggerItem}>
              <Card className="border-0 shadow-md bg-white dark:bg-white/5 overflow-hidden card-hover">
                <div className="h-1 bg-gradient-to-r from-gold/40 to-sage/40" />
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-gold/10 dark:bg-gold/15">
                      <Sparkles className="size-4 text-gold-dark dark:text-gold" />
                    </div>
                    <h3
                      className="font-serif text-lg font-bold text-brown-900 dark:text-brown-100"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                    >
                      Emotional Profile
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {data.emotionalTraits.map((trait, idx) => (
                      <div key={idx}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-brown-700 dark:text-brown-200">
                            {trait.name}
                          </span>
                          <span className="text-xs font-semibold text-brown-400 dark:text-brown-400">
                            {trait.score}
                          </span>
                        </div>
                        <div className="h-2.5 w-full rounded-full bg-brown-100 dark:bg-brown-700/30 overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full ${
                              trait.score >= 85
                                ? 'bg-sage'
                                : trait.score >= 70
                                ? 'bg-gold'
                                : 'bg-brown-400'
                            }`}
                            initial={{ width: 0 }}
                            animate={{ width: `${trait.score}%` }}
                            transition={{ duration: 0.8, delay: idx * 0.1, ease: 'easeOut' }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* ─── Love & Relationships Card ────────────────────────────────── */}
            <motion.div variants={staggerItem}>
              <Card className="border-0 shadow-md bg-white dark:bg-white/5 overflow-hidden card-hover">
                <div className="h-1 bg-gradient-to-r from-pink-300 via-rose-300 to-gold/40" />
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-pink-50 dark:bg-pink-900/20">
                      <Heart className="size-4 text-pink-500 dark:text-pink-400" />
                    </div>
                    <h3
                      className="font-serif text-lg font-bold text-brown-900 dark:text-brown-100"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                    >
                      Love & Relationships
                    </h3>
                  </div>

                  {/* Best love matches */}
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-brown-400 dark:text-brown-400 uppercase tracking-wider mb-2">
                      Best Love Matches
                    </p>
                    <div className="flex gap-3">
                      {data.bestMatches.map((match) => (
                        <div
                          key={match.sign}
                          className="flex items-center gap-1.5 bg-pink-50 dark:bg-pink-900/15 rounded-lg px-3 py-1.5"
                        >
                          <Heart className="size-3 text-pink-400 dark:text-pink-400 fill-pink-400" />
                          <span className="text-lg">{match.symbol}</span>
                          <span className="text-sm font-medium text-brown-700 dark:text-brown-200">
                            {match.sign}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Relationship Strengths */}
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-brown-400 dark:text-brown-400 uppercase tracking-wider mb-2">
                      Strengths
                    </p>
                    <ul className="space-y-1.5">
                      {data.relationshipStrengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-brown-600 dark:text-brown-300">
                          <span className="text-sage mt-0.5 shrink-0">✦</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Growth Areas */}
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-brown-400 dark:text-brown-400 uppercase tracking-wider mb-2">
                      Growth Areas
                    </p>
                    <ul className="space-y-1.5">
                      {data.relationshipGrowthAreas.map((g, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-brown-600 dark:text-brown-300">
                          <span className="text-gold mt-0.5 shrink-0">✦</span>
                          {g}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Love Language */}
                  <div className="rounded-lg bg-gradient-to-r from-pink-50 to-gold/5 dark:from-pink-900/10 dark:to-gold/5 p-3">
                    <p className="text-[10px] font-semibold text-brown-400 dark:text-brown-400 uppercase tracking-wider mb-1">
                      Love Language
                    </p>
                    <p className="text-sm font-medium text-brown-700 dark:text-brown-200">
                      {data.loveLanguage}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* ─── Career & Ambition Card ───────────────────────────────────── */}
            <motion.div variants={staggerItem}>
              <Card className="border-0 shadow-md bg-white dark:bg-white/5 overflow-hidden card-hover">
                <div className="h-1 bg-gradient-to-r from-amber-400 via-gold/40 to-sage/40" />
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-900/20">
                      <Briefcase className="size-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <h3
                      className="font-serif text-lg font-bold text-brown-900 dark:text-brown-100"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                    >
                      Career & Ambition
                    </h3>
                  </div>

                  {/* Career fields */}
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-brown-400 dark:text-brown-400 uppercase tracking-wider mb-2">
                      Best Career Fields
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {data.careerFields.map((cf, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1.5 bg-brown-50 dark:bg-brown-800/20 rounded-lg px-3 py-1.5 text-sm text-brown-700 dark:text-brown-200"
                        >
                          <span>{cf.emoji}</span>
                          {cf.field}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Work style */}
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-brown-400 dark:text-brown-400 uppercase tracking-wider mb-1">
                      Work Style
                    </p>
                    <p className="text-sm text-brown-600 dark:text-brown-300 leading-relaxed">
                      {data.workStyle}
                    </p>
                  </div>

                  {/* Leadership style */}
                  <div className="rounded-lg bg-gradient-to-r from-amber-50 to-gold/5 dark:from-amber-900/10 dark:to-gold/5 p-3">
                    <p className="text-[10px] font-semibold text-brown-400 dark:text-brown-400 uppercase tracking-wider mb-1">
                      Leadership Style
                    </p>
                    <p className="text-sm font-medium text-brown-700 dark:text-brown-200">
                      {data.leadershipStyle}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* ─── Spiritual Growth Card ─────────────────────────────────────── */}
            <motion.div variants={staggerItem}>
              <Card className="border-0 shadow-md bg-white dark:bg-white/5 overflow-hidden card-hover">
                <div className="h-1 bg-gradient-to-r from-sage via-gold/40 to-brown-300" />
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-sage-muted dark:bg-sage/20">
                      <Sparkles className="size-4 text-sage-dark dark:text-sage" />
                    </div>
                    <h3
                      className="font-serif text-lg font-bold text-brown-900 dark:text-brown-100"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                    >
                      Spiritual Growth
                    </h3>
                  </div>

                  {/* Life lesson */}
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-brown-400 dark:text-brown-400 uppercase tracking-wider mb-1">
                      Life Lesson
                    </p>
                    <p className="text-sm text-brown-700 dark:text-brown-200 leading-relaxed">
                      {data.lifeLesson}
                    </p>
                  </div>

                  {/* Spiritual practice */}
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-brown-400 dark:text-brown-400 uppercase tracking-wider mb-1">
                      Spiritual Practice
                    </p>
                    <p className="text-sm text-brown-600 dark:text-brown-300 leading-relaxed">
                      {data.spiritualPractice}
                    </p>
                  </div>

                  {/* Affirmation */}
                  <div className="rounded-lg bg-gradient-to-r from-sage-muted/30 to-gold/5 dark:from-sage/10 dark:to-gold/5 p-4">
                    <p className="text-[10px] font-semibold text-brown-400 dark:text-brown-400 uppercase tracking-wider mb-2">
                      ✦ Your Affirmation
                    </p>
                    <p
                      className="italic text-brown-800 dark:text-brown-200 leading-relaxed text-[15px]"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                    >
                      &ldquo;{data.affirmation}&rdquo;
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
