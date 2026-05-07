/**
 * AyuAstro Trait Scoring Engine - Type Definitions
 *
 * Defines all TypeScript types used across the scoring engine,
 * including input data structures, trait identifiers, scoring
 * contributions, and output types.
 */

// ─── Zodiac & Astrological Enums ────────────────────────────────────────────

export const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
] as const;

export type ZodiacSign = typeof ZODIAC_SIGNS[number];

export const PLANETS = [
  'Sun', 'Moon', 'Mercury', 'Venus', 'Mars',
  'Jupiter', 'Saturn', 'Rahu', 'Ketu', 'Uranus', 'Neptune', 'Pluto',
] as const;

export type Planet = typeof PLANETS[number];

export const ELEMENTS = ['Fire', 'Earth', 'Air', 'Water'] as const;
export type Element = typeof ELEMENTS[number];

export const MODALITIES = ['Cardinal', 'Fixed', 'Mutable'] as const;
export type Modality = typeof MODALITIES[number];

// ─── Trait Identifiers ──────────────────────────────────────────────────────

export const TRAIT_IDS = [
  'emotionalIntensity',
  'attachmentStyle',
  'ambition',
  'trust',
  'communicationOpenness',
  'impulsiveness',
  'empathy',
  'resilience',
  'creativity',
  'intuition',
  'discipline',
  'socialEnergy',
  'patience',
  'adaptability',
] as const;

export type TraitId = typeof TRAIT_IDS[number];

// ─── Questionnaire Types ────────────────────────────────────────────────────

export const QUESTIONNAIRE_CATEGORIES = [
  'emotional',
  'social',
  'behavioral',
  'relational',
] as const;

export type QuestionnaireCategory = typeof QUESTIONNAIRE_CATEGORIES[number];

/** Answer value from 1 (lowest) to 5 (highest) on a Likert scale */
export type LikertValue = 1 | 2 | 3 | 4 | 5;

export interface QuestionnaireAnswer {
  questionId: string;
  answer: LikertValue;
  category: QuestionnaireCategory;
}

// ─── Astrological Input Types ───────────────────────────────────────────────

export interface PlanetaryPosition {
  planet: Planet;
  sign: ZodiacSign;
  degree: number;
  house?: number;
  retrograde?: boolean;
}

export interface HouseData {
  houseNumber: number;
  sign: ZodiacSign;
  planets: Planet[];
}

export interface YogaData {
  name: string;
  type: 'benefic' | 'malefic';
  planets: Planet[];
  description?: string;
}

export interface DoshaData {
  name: string;
  severity: 'low' | 'medium' | 'high';
  description?: string;
}

export interface NakshatraData {
  name: string;
  pada: number;
  ruler: Planet;
}

export interface AstrologyInput {
  sunSign: ZodiacSign;
  moonSign: ZodiacSign;
  ascendant: ZodiacSign;
  planetaryPositions: PlanetaryPosition[];
  houses: HouseData[];
  nakshatra?: NakshatraData;
  yogas: YogaData[];
  doshas: DoshaData[];
}

// ─── Numerological Input Types ──────────────────────────────────────────────

export interface NumerologyInput {
  lifePathNumber: number;      // 1-9, 11, 22, 33
  destinyNumber: number;        // 1-9, 11, 22, 33
  soulUrgeNumber: number;       // 1-9, 11, 22, 33
  personalityNumber: number;    // 1-9, 11, 22, 33
  birthdayNumber: number;       // 1-31
}

// ─── Scoring Contribution Types ─────────────────────────────────────────────

export interface TraitContribution {
  /** Source of this contribution */
  source: 'astrological' | 'numerological' | 'behavioral';
  /** Raw score before normalization (0-100 range, but can exceed for blending) */
  rawScore: number;
  /** Weight of this contribution (0-1) */
  weight: number;
  /** Human-readable reason for this contribution */
  reason: string;
}

export interface TraitResult {
  traitId: TraitId;
  /** Final normalized score 0-100 */
  score: number;
  /** Breakdown of contributing factors */
  contributions: TraitContribution[];
  /** Effective weights used (after normalization) */
  effectiveWeights: {
    astrological: number;
    numerological: number;
    behavioral: number;
  };
}

// ─── Engine Configuration Types ─────────────────────────────────────────────

export interface ScoringWeights {
  /** Weight for astrological contributions (default: 0.40) */
  astrological: number;
  /** Weight for numerological contributions (default: 0.20) */
  numerological: number;
  /** Weight for behavioral/questionnaire contributions (default: 0.40) */
  behavioral: number;
}

export interface NormalizationConfig {
  /** Whether to apply sigmoid smoothing (default: true) */
  enableSmoothing: boolean;
  /** Smoothing factor for sigmoid (default: 0.05, higher = smoother) */
  smoothingFactor: number;
  /** Minimum number of contributions required for a valid score (default: 1) */
  minContributions: number;
  /** Whether to clamp final scores to 0-100 (default: true) */
  clampToRange: boolean;
}

export interface ScoringConfig {
  weights: ScoringWeights;
  normalization: NormalizationConfig;
}

export const DEFAULT_SCORING_CONFIG: ScoringConfig = {
  weights: {
    astrological: 0.40,
    numerological: 0.20,
    behavioral: 0.40,
  },
  normalization: {
    enableSmoothing: true,
    smoothingFactor: 0.05,
    minContributions: 1,
    clampToRange: true,
  },
};

// ─── Complete Scoring Input & Output ────────────────────────────────────────

export interface ScoringInput {
  astrology: AstrologyInput;
  numerology: NumerologyInput;
  questionnaire: QuestionnaireAnswer[];
}

export interface ScoringOutput {
  traits: Record<TraitId, TraitResult>;
  config: ScoringConfig;
  computedAt: string; // ISO 8601 timestamp
}

// ─── Helper: Element & Modality from Sign ───────────────────────────────────

const SIGN_ELEMENTS: Record<ZodiacSign, Element> = {
  Aries: 'Fire', Leo: 'Fire', Sagittarius: 'Fire',
  Taurus: 'Earth', Virgo: 'Earth', Capricorn: 'Earth',
  Gemini: 'Air', Libra: 'Air', Aquarius: 'Air',
  Cancer: 'Water', Scorpio: 'Water', Pisces: 'Water',
};

const SIGN_MODALITIES: Record<ZodiacSign, Modality> = {
  Aries: 'Cardinal', Cancer: 'Cardinal', Libra: 'Cardinal', Capricorn: 'Cardinal',
  Taurus: 'Fixed', Leo: 'Fixed', Scorpio: 'Fixed', Aquarius: 'Fixed',
  Gemini: 'Mutable', Virgo: 'Mutable', Sagittarius: 'Mutable', Pisces: 'Mutable',
};

export function getElement(sign: ZodiacSign): Element {
  return SIGN_ELEMENTS[sign];
}

export function getModality(sign: ZodiacSign): Modality {
  return SIGN_MODALITIES[sign];
}

// ─── Trait Metadata ─────────────────────────────────────────────────────────

export interface TraitMetadata {
  id: TraitId;
  label: string;
  description: string;
  lowLabel: string;
  highLabel: string;
  category: QuestionnaireCategory | 'composite';
}

export const TRAIT_METADATA: Record<TraitId, TraitMetadata> = {
  emotionalIntensity: {
    id: 'emotionalIntensity',
    label: 'Emotional Intensity',
    description: 'Depth and strength of emotional experiences',
    lowLabel: 'Calm & Detached',
    highLabel: 'Deeply Emotional',
    category: 'emotional',
  },
  attachmentStyle: {
    id: 'attachmentStyle',
    label: 'Attachment Style',
    description: 'Pattern of emotional bonding in relationships (0=secure, 100=anxious-avoidant)',
    lowLabel: 'Secure & Confident',
    highLabel: 'Anxious & Avoidant',
    category: 'relational',
  },
  ambition: {
    id: 'ambition',
    label: 'Ambition',
    description: 'Drive to achieve goals and pursue success',
    lowLabel: 'Content & Relaxed',
    highLabel: 'Highly Driven',
    category: 'behavioral',
  },
  trust: {
    id: 'trust',
    label: 'Trust',
    description: 'Willingness to rely on and believe in others',
    lowLabel: 'Cautious & Guarded',
    highLabel: 'Trusting & Open',
    category: 'relational',
  },
  communicationOpenness: {
    id: 'communicationOpenness',
    label: 'Communication Openness',
    description: 'Ease of self-expression and sharing thoughts',
    lowLabel: 'Reserved & Private',
    highLabel: 'Expressive & Open',
    category: 'social',
  },
  impulsiveness: {
    id: 'impulsiveness',
    label: 'Impulsiveness',
    description: 'Tendency to act on impulse without extensive deliberation',
    lowLabel: 'Deliberate & Cautious',
    highLabel: 'Spontaneous & Impulsive',
    category: 'behavioral',
  },
  empathy: {
    id: 'empathy',
    label: 'Empathy',
    description: 'Ability to understand and share the feelings of others',
    lowLabel: 'Independent & Objective',
    highLabel: 'Deeply Empathic',
    category: 'emotional',
  },
  resilience: {
    id: 'resilience',
    label: 'Resilience',
    description: 'Capacity to recover from setbacks and adapt to adversity',
    lowLabel: 'Sensitive to Hardship',
    highLabel: 'Highly Resilient',
    category: 'behavioral',
  },
  creativity: {
    id: 'creativity',
    label: 'Creativity',
    description: 'Ability to generate novel ideas and think innovatively',
    lowLabel: 'Practical & Conventional',
    highLabel: 'Highly Creative',
    category: 'composite',
  },
  intuition: {
    id: 'intuition',
    label: 'Intuition',
    description: 'Ability to understand things instinctively without conscious reasoning',
    lowLabel: 'Analytical & Logical',
    highLabel: 'Highly Intuitive',
    category: 'composite',
  },
  discipline: {
    id: 'discipline',
    label: 'Discipline',
    description: 'Ability to maintain focus, routines, and self-control',
    lowLabel: 'Free-spirited & Flexible',
    highLabel: 'Highly Disciplined',
    category: 'behavioral',
  },
  socialEnergy: {
    id: 'socialEnergy',
    label: 'Social Energy',
    description: 'Desire for and energy derived from social interaction',
    lowLabel: 'Solitary & Introspective',
    highLabel: 'Socially Energized',
    category: 'social',
  },
  patience: {
    id: 'patience',
    label: 'Patience',
    description: 'Ability to wait, endure delays, and remain calm under pressure',
    lowLabel: 'Action-Oriented & Urgent',
    highLabel: 'Patient & Enduring',
    category: 'behavioral',
  },
  adaptability: {
    id: 'adaptability',
    label: 'Adaptability',
    description: 'Ease of adjusting to new conditions and embracing change',
    lowLabel: 'Stability-Seeking',
    highLabel: 'Highly Adaptable',
    category: 'behavioral',
  },
};
