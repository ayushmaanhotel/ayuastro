/**
 * AyuAstro Trait Scoring Engine - Main Export
 *
 * This module provides a comprehensive, deterministic rule-based engine
 * that converts astrology data, numerology data, and behavioral
 * questionnaire answers into normalized 0-100 trait scores.
 *
 * Quick Start:
 * ```typescript
 * import { computeAllTraits, validateInput } from '@/lib/scoring';
 *
 * // Validate input first
 * const validation = validateInput(scoringInput);
 * if (!validation.isValid) {
 *   console.error(validation.errors);
 *   return;
 * }
 *
 * // Compute all trait scores
 * const result = computeAllTraits(scoringInput);
 *
 * // Access individual trait scores
 * console.log(result.traits.empathy.score);        // e.g., 72
 * console.log(result.traits.attachmentStyle.score);  // e.g., 35 (secure)
 *
 * // Get human-readable summary
 * console.log(getTraitSummary(result.traits.intuition));
 *
 * // Get full report
 * console.log(getScoringReport(result));
 *
 * // Export to database format
 * const dbRecord = toDatabaseFormat(result, userId);
 * ```
 *
 * Architecture Overview:
 * - types.ts      → All TypeScript types, enums, and metadata
 * - normalizer.ts → Score normalization, blending, and Likert conversion
 * - rules.ts      → Deterministic scoring rules for all 14 traits
 * - trait-engine.ts → Core engine orchestrating the scoring pipeline
 * - index.ts      → This file — unified public API
 */

// ─── Core Engine ────────────────────────────────────────────────────────────

export {
  computeAllTraits,
  scoreTrait,
  validateInput,
  getTraitSummary,
  getScoringReport,
  compareScoringResults,
  toDatabaseFormat,
} from './trait-engine';

// ─── Types ──────────────────────────────────────────────────────────────────

export type {
  // Input types
  AstrologyInput,
  NumerologyInput,
  QuestionnaireAnswer,
  QuestionnaireCategory,
  ScoringInput,

  // Output types
  ScoringOutput,
  TraitResult,
  TraitContribution,

  // Configuration types
  ScoringConfig,
  ScoringWeights,
  NormalizationConfig,

  // Astrological sub-types
  PlanetaryPosition,
  HouseData,
  YogaData,
  DoshaData,
  NakshatraData,

  // Trait types
  TraitId,
  TraitMetadata,

  // Utility types
  LikertValue,
  Element,
  Modality,
  ZodiacSign,
  Planet,
} from './types';

export {
  // Constants
  ZODIAC_SIGNS,
  PLANETS,
  TRAIT_IDS,
  QUESTIONNAIRE_CATEGORIES,
  TRAIT_METADATA,
  DEFAULT_SCORING_CONFIG,

  // Helper functions
  getElement,
  getModality,
} from './types';

// ─── Normalizer Utilities ───────────────────────────────────────────────────

export {
  clamp,
  sigmoidSmooth,
  minMaxNormalize,
  weightedAverage,
  blendContributions,
  likertToScore,
  categoryAverage,
  weightedQuestionnaireScore,
} from './normalizer';

// ─── Rules (for advanced usage) ─────────────────────────────────────────────

export { TRAIT_RULES } from './rules';
export type { TraitRuleSet } from './rules';
