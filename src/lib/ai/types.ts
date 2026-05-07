// ============================================================================
// AyuAstro AI Interpretation Engine - Type Definitions
// ============================================================================

/**
 * Trait scores that drive the AI interpretation.
 * All scores are on a 0-100 scale.
 */
export interface TraitScores {
  emotionalIntensity: number;
  attachmentStyle: number;
  ambition: number;
  trust: number;
  communicationOpenness: number;
  impulsiveness: number;
  empathy: number;
  resilience: number;
  creativity: number;
  intuition: number;
  discipline: number;
  socialEnergy: number;
  patience: number;
  adaptability: number;
}

/**
 * Complete input for the AI report generator.
 * Combines astrology data, numerology data, and trait scores.
 */
export interface AIReportInput {
  // Astrology
  sunSign: string;
  moonSign: string;
  ascendant: string;
  nakshatra: string;
  currentDasha: string;
  yogas: string[];
  doshas: string[];

  // Numerology
  lifePathNumber: number;
  destinyNumber: number;
  soulUrgeNumber: number;

  // Trait scores (0-100)
  traits: TraitScores;
}

/**
 * A single section of the generated report.
 */
export interface ReportSection {
  id: string;
  title: string;
  icon: string; // lucide-react icon name
  content: string; // markdown content
  traits: string[]; // related trait names from TraitScores
  insightLevel: 'free' | 'premium';
}

/**
 * The complete generated report.
 */
export interface GeneratedReport {
  title: string;
  summary: string;
  sections: ReportSection[];
}

/**
 * Defines a report section template with its prompt guidance.
 */
export interface ReportSectionTemplate {
  id: string;
  title: string;
  icon: string;
  traits: string[];
  insightLevel: 'free' | 'premium';
  promptGuidance: string; // specific guidance for this section
}

/**
 * Raw AI response before parsing into structured report.
 */
export interface RawAIResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * Error types for the AI engine.
 */
export enum AIErrorType {
  RATE_LIMITED = 'RATE_LIMITED',
  INVALID_INPUT = 'INVALID_INPUT',
  GENERATION_FAILED = 'GENERATION_FAILED',
  PARSING_FAILED = 'PARSING_FAILED',
  SDK_ERROR = 'SDK_ERROR',
}

/**
 * Custom error class for AI engine errors.
 */
export class AIEngineError extends Error {
  type: AIErrorType;
  retryable: boolean;
  originalError?: unknown;

  constructor(
    type: AIErrorType,
    message: string,
    retryable: boolean = false,
    originalError?: unknown
  ) {
    super(message);
    this.name = 'AIEngineError';
    this.type = type;
    this.retryable = retryable;
    this.originalError = originalError;
  }
}
