/**
 * AyuAstro Trait Scoring Engine - Score Normalizer
 *
 * Provides normalization utilities to ensure trait scores are:
 * - Clamped to the 0-100 range
 * - Smoothed to avoid extreme values
 * - Weighted and blended from multiple contributing sources
 *
 * All functions are pure and deterministic.
 */

import type { TraitContribution, NormalizationConfig, ScoringWeights } from './types';

// ─── Core Normalization Functions ───────────────────────────────────────────

/**
 * Clamp a value to the [min, max] range.
 */
export function clamp(value: number, min: number = 0, max: number = 100): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Sigmoid smoothing function centered at 50.
 * Maps any real number to a smooth S-curve bounded by [0, 100].
 *
 * @param value  - Raw input value
 * @param factor - Steepness of the curve (higher = more gradual transition)
 * @returns Smoothed value in approximately [0, 100]
 *
 * The sigmoid is shifted and scaled so that:
 * - Input 0  → Output ≈ 0
 * - Input 50 → Output = 50
 * - Input 100 → Output ≈ 100
 *
 * Formula: 100 / (1 + exp(-factor * (value - 50)))
 */
export function sigmoidSmooth(value: number, factor: number = 0.05): number {
  const shifted = value - 50;
  const exponent = -factor * shifted;
  // Guard against overflow for extreme values
  const clampedExponent = clamp(exponent, -500, 500);
  return 100 / (1 + Math.exp(clampedExponent));
}

/**
 * Apply min-max normalization to scale a value from [inMin, inMax] to [outMin, outMax].
 */
export function minMaxNormalize(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number = 0,
  outMax: number = 100,
): number {
  if (inMax === inMin) return (outMin + outMax) / 2;
  const ratio = (value - inMin) / (inMax - inMin);
  return outMin + ratio * (outMax - outMin);
}

// ─── Weighted Blending ──────────────────────────────────────────────────────

/**
 * Compute a weighted average of values.
 * Each weight is normalized so that total weights sum to 1.
 *
 * @param values  - Array of numeric values
 * @param weights - Array of corresponding weights (same length as values)
 * @returns Weighted average
 */
export function weightedAverage(values: number[], weights: number[]): number {
  if (values.length !== weights.length) {
    throw new Error('Values and weights must have the same length');
  }
  if (values.length === 0) return 50; // neutral default

  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  if (totalWeight === 0) return 50; // neutral default when all weights are zero

  let result = 0;
  for (let i = 0; i < values.length; i++) {
    result += values[i] * (weights[i] / totalWeight);
  }

  return result;
}

/**
 * Blend astrological, numerological, and behavioral raw scores
 * into a single normalized trait score.
 *
 * @param contributions - Array of trait contributions with source, rawScore, weight, reason
 * @param config - Normalization configuration
 * @param weights - Scoring weights for each source
 * @returns Final blended and normalized score in [0, 100]
 */
export function blendContributions(
  contributions: TraitContribution[],
  config: NormalizationConfig,
  weights: ScoringWeights,
): number {
  if (contributions.length < config.minContributions) {
    return 50; // neutral default when insufficient data
  }

  // Group contributions by source and compute weighted average within each source
  const sourceGroups: Record<string, { scores: number[]; weights: number[] }> = {
    astrological: { scores: [], weights: [] },
    numerological: { scores: [], weights: [] },
    behavioral: { scores: [], weights: [] },
  };

  for (const contribution of contributions) {
    const group = sourceGroups[contribution.source];
    if (group) {
      group.scores.push(clamp(contribution.rawScore, 0, 100));
      group.weights.push(contribution.weight);
    }
  }

  // Compute per-source averages
  const sourceAverages: number[] = [];
  const sourceWeights: number[] = [];

  const sourceConfig: Array<{ key: keyof typeof sourceGroups; weight: number }> = [
    { key: 'astrological', weight: weights.astrological },
    { key: 'numerological', weight: weights.numerological },
    { key: 'behavioral', weight: weights.behavioral },
  ];

  for (const { key, weight } of sourceConfig) {
    const group = sourceGroups[key];
    if (group.scores.length > 0) {
      const avg = weightedAverage(group.scores, group.weights);
      sourceAverages.push(avg);
      sourceWeights.push(weight);
    }
  }

  // Blend across sources using configured weights
  let blended = weightedAverage(sourceAverages, sourceWeights);

  // Apply sigmoid smoothing if enabled
  if (config.enableSmoothing) {
    blended = sigmoidSmooth(blended, config.smoothingFactor);
  }

  // Clamp to 0-100 range
  if (config.clampToRange) {
    blended = clamp(blended, 0, 100);
  }

  // Round to integer for clean storage
  return Math.round(blended);
}

// ─── Likert Scale Conversion ────────────────────────────────────────────────

/**
 * Convert a Likert scale answer (1-5) to a 0-100 score.
 *
 * @param answer - Likert value (1-5)
 * @param invert - If true, invert the scale (1→100, 5→0)
 * @returns Score in 0-100 range
 */
export function likertToScore(answer: number, invert: boolean = false): number {
  // Map: 1→0, 2→25, 3→50, 4→75, 5→100
  const score = (answer - 1) * 25;
  return invert ? 100 - score : score;
}

/**
 * Compute the average Likert score for answers matching a category,
 * converted to a 0-100 scale.
 *
 * @param answers - Array of questionnaire answers
 * @param category - Category to filter by
 * @param invert - Whether to invert the scale
 * @returns Average score in 0-100 range, or 50 (neutral) if no matching answers
 */
export function categoryAverage(
  answers: Array<{ answer: number; category: string }>,
  category: string,
  invert: boolean = false,
): number {
  const matching = answers.filter((a) => a.category === category);
  if (matching.length === 0) return 50; // neutral default

  const scores = matching.map((a) => likertToScore(a.answer, invert));
  const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
  return Math.round(clamp(avg, 0, 100));
}

/**
 * Compute a weighted score from multiple questionnaire answers,
 * where each answer can have a different relevance weight.
 *
 * @param answers - Array of { answer, category, relevanceWeight }
 * @param invert - Whether to invert the scale
 * @returns Weighted score in 0-100 range, or 50 (neutral) if no answers
 */
export function weightedQuestionnaireScore(
  answers: Array<{ answer: number; category: string; relevanceWeight: number }>,
  invert: boolean = false,
): number {
  if (answers.length === 0) return 50;

  const scores = answers.map((a) => ({
    score: likertToScore(a.answer, invert),
    weight: a.relevanceWeight,
  }));

  return Math.round(weightedAverage(
    scores.map((s) => s.score),
    scores.map((s) => s.weight),
  ));
}
