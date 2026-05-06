/**
 * AyuAstro Trait Scoring Engine - Core Engine
 *
 * The main scoring engine that orchestrates the conversion of astrology data,
 * numerology data, and behavioral questionnaire answers into normalized 0-100
 * trait scores for all 14 psychological traits.
 *
 * Architecture:
 * 1. Input validation — Ensure all required data is present
 * 2. Rule application — Apply scoring rules for each trait across all sources
 * 3. Score blending — Combine contributions using weighted averaging
 * 4. Normalization — Apply smoothing and clamping for clean final scores
 * 5. Output — Produce complete scoring results with full audit trail
 *
 * Key Properties:
 * - Deterministic: Same input always produces the same output
 * - Configurable: Weights and normalization parameters can be adjusted
 * - Auditable: Every score comes with a full breakdown of contributing factors
 * - No AI: All scoring is rule-based with documented astrological/numerological basis
 */

import type {
  ScoringInput,
  ScoringOutput,
  ScoringConfig,
  TraitId,
  TraitResult,
  TraitContribution,
  AstrologyInput,
  NumerologyInput,
  QuestionnaireAnswer,
} from './types';
import { DEFAULT_SCORING_CONFIG, TRAIT_IDS, TRAIT_METADATA } from './types';
import { TRAIT_RULES } from './rules';
import { blendContributions } from './normalizer';

// ─── Input Validation ───────────────────────────────────────────────────────

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate the scoring input data.
 * Returns validation result with errors (blocking) and warnings (non-blocking).
 */
export function validateInput(input: Partial<ScoringInput>): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Astrology validation
  if (!input.astrology) {
    errors.push('Astrology data is required');
  } else {
    if (!input.astrology.sunSign) {
      errors.push('Sun sign is required in astrology data');
    }
    if (!input.astrology.moonSign) {
      errors.push('Moon sign is required in astrology data');
    }
    if (!input.astrology.ascendant) {
      errors.push('Ascendant sign is required in astrology data');
    }
    if (!input.astrology.planetaryPositions || input.astrology.planetaryPositions.length === 0) {
      warnings.push('No planetary positions provided; astrological scoring will use limited data');
    }
    if (!input.astrology.houses || input.astrology.houses.length === 0) {
      warnings.push('No house data provided; house-based scoring rules will be skipped');
    }
  }

  // Numerology validation
  if (!input.numerology) {
    errors.push('Numerology data is required');
  } else {
    if (input.numerology.lifePathNumber < 1 || input.numerology.lifePathNumber > 33) {
      errors.push('Life path number must be between 1 and 33');
    }
    if (input.numerology.destinyNumber < 1 || input.numerology.destinyNumber > 33) {
      errors.push('Destiny number must be between 1 and 33');
    }
    if (input.numerology.soulUrgeNumber < 1 || input.numerology.soulUrgeNumber > 33) {
      errors.push('Soul urge number must be between 1 and 33');
    }
  }

  // Questionnaire validation
  if (!input.questionnaire || input.questionnaire.length === 0) {
    warnings.push('No questionnaire answers provided; behavioral scoring will use neutral defaults');
  } else {
    const categories = new Set(input.questionnaire.map((a) => a.category));
    if (!categories.has('emotional')) {
      warnings.push('No emotional category answers; some traits may use neutral defaults');
    }
    if (!categories.has('social')) {
      warnings.push('No social category answers; some traits may use neutral defaults');
    }
    if (!categories.has('behavioral')) {
      warnings.push('No behavioral category answers; some traits may use neutral defaults');
    }
    if (!categories.has('relational')) {
      warnings.push('No relational category answers; some traits may use neutral defaults');
    }

    // Check answer values
    for (const answer of input.questionnaire) {
      if (answer.answer < 1 || answer.answer > 5) {
        errors.push(`Question ${answer.questionId}: answer must be 1-5, got ${answer.answer}`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// ─── Score Single Trait ─────────────────────────────────────────────────────

/**
 * Compute the score for a single trait.
 *
 * @param traitId - The trait to score
 * @param astrology - Astrological input data
 * @param numerology - Numerological input data
 * @param questionnaire - Behavioral questionnaire answers
 * @param config - Scoring configuration
 * @returns Complete trait result with score, contributions, and effective weights
 */
export function scoreTrait(
  traitId: TraitId,
  astrology: AstrologyInput,
  numerology: NumerologyInput,
  questionnaire: QuestionnaireAnswer[],
  config: ScoringConfig = DEFAULT_SCORING_CONFIG,
): TraitResult {
  const ruleSet = TRAIT_RULES[traitId];
  if (!ruleSet) {
    throw new Error(`No scoring rules defined for trait: ${traitId}`);
  }

  // Apply rules from each source
  const astroContributions = ruleSet.astrological(astrology);
  const numerContributions = ruleSet.numerological(numerology);
  const behavContributions = ruleSet.behavioral(questionnaire);

  // Combine all contributions
  const allContributions: TraitContribution[] = [
    ...astroContributions,
    ...numerContributions,
    ...behavContributions,
  ];

  // Blend contributions using configured weights
  const score = blendContributions(
    allContributions,
    config.normalization,
    config.weights,
  );

  // Calculate effective weights (normalized by which sources actually contributed)
  const hasAstro = astroContributions.length > 0;
  const hasNumer = numerContributions.length > 0;
  const hasBehav = behavContributions.length > 0;

  const activeSourceCount = [hasAstro, hasNumer, hasBehav].filter(Boolean).length;
  let effectiveWeights = { ...config.weights };

  if (activeSourceCount < 3) {
    // Redistribute weights for missing sources
    const totalActiveWeight = (hasAstro ? config.weights.astrological : 0)
      + (hasNumer ? config.weights.numerological : 0)
      + (hasBehav ? config.weights.behavioral : 0);

    if (totalActiveWeight > 0) {
      effectiveWeights = {
        astrological: hasAstro ? config.weights.astrological / totalActiveWeight : 0,
        numerological: hasNumer ? config.weights.numerological / totalActiveWeight : 0,
        behavioral: hasBehav ? config.weights.behavioral / totalActiveWeight : 0,
      };
    }
  }

  return {
    traitId,
    score,
    contributions: allContributions,
    effectiveWeights,
  };
}

// ─── Score All Traits ───────────────────────────────────────────────────────

/**
 * Compute scores for all 14 traits.
 *
 * This is the main entry point for the scoring engine.
 * Given astrology data, numerology data, and questionnaire answers,
 * it produces a complete set of normalized trait scores.
 *
 * @param input - Complete scoring input (astrology + numerology + questionnaire)
 * @param config - Optional scoring configuration (uses defaults if not provided)
 * @returns Complete scoring output with all trait scores and metadata
 *
 * @example
 * ```typescript
 * const result = computeAllTraits({
 *   astrology: {
 *     sunSign: 'Scorpio',
 *     moonSign: 'Pisces',
 *     ascendant: 'Capricorn',
 *     planetaryPositions: [...],
 *     houses: [...],
 *     yogas: [],
 *     doshas: [],
 *   },
 *   numerology: {
 *     lifePathNumber: 7,
 *     destinyNumber: 3,
 *     soulUrgeNumber: 11,
 *     personalityNumber: 5,
 *     birthdayNumber: 15,
 *   },
 *   questionnaire: [
 *     { questionId: 'q1', answer: 4, category: 'emotional' },
 *     { questionId: 'q2', answer: 3, category: 'social' },
 *   ],
 * });
 *
 * console.log(result.traits.emotionalIntensity.score); // e.g., 72
 * console.log(result.traits.empathy.contributions); // Full audit trail
 * ```
 */
export function computeAllTraits(
  input: ScoringInput,
  config: ScoringConfig = DEFAULT_SCORING_CONFIG,
): ScoringOutput {
  const traits: Record<TraitId, TraitResult> = {} as Record<TraitId, TraitResult>;

  for (const traitId of TRAIT_IDS) {
    traits[traitId] = scoreTrait(
      traitId,
      input.astrology,
      input.numerology,
      input.questionnaire,
      config,
    );
  }

  return {
    traits,
    config,
    computedAt: new Date().toISOString(),
  };
}

// ─── Utility: Get Trait Summary ─────────────────────────────────────────────

/**
 * Get a human-readable summary of a trait result.
 */
export function getTraitSummary(traitResult: TraitResult): string {
  const metadata = TRAIT_METADATA[traitResult.traitId];
  const score = traitResult.score;

  let level: string;
  if (score >= 80) level = 'Very High';
  else if (score >= 60) level = 'High';
  else if (score >= 40) level = 'Moderate';
  else if (score >= 20) level = 'Low';
  else level = 'Very Low';

  return `${metadata.label}: ${score}/100 (${level}) — ${score >= 50 ? metadata.highLabel : metadata.lowLabel}`;
}

/**
 * Get a complete human-readable report for all trait scores.
 */
export function getScoringReport(output: ScoringOutput): string {
  const lines: string[] = [
    '═══ AyuAstro Trait Scoring Report ═══',
    `Computed at: ${output.computedAt}`,
    `Weights: Astro=${output.config.weights.astrological} | Numero=${output.config.weights.numerological} | Behav=${output.config.weights.behavioral}`,
    '',
  ];

  for (const traitId of TRAIT_IDS) {
    const trait = output.traits[traitId];
    const metadata = TRAIT_METADATA[traitId];
    lines.push(`── ${metadata.label} ──`);
    lines.push(`  Score: ${trait.score}/100`);
    lines.push(`  Interpretation: ${trait.score >= 50 ? metadata.highLabel : metadata.lowLabel}`);
    lines.push(`  Contributions:`);

    for (const contribution of trait.contributions) {
      lines.push(`    [${contribution.source}] ${contribution.rawScore.toFixed(0)} (w=${contribution.weight.toFixed(2)}): ${contribution.reason}`);
    }

    lines.push('');
  }

  return lines.join('\n');
}

// ─── Utility: Compare Two Scoring Results ───────────────────────────────────

export interface TraitComparison {
  traitId: TraitId;
  score1: number;
  score2: number;
  difference: number;
  compatibility: number; // 0-100, where 100 = identical
}

/**
 * Compare two scoring results for compatibility analysis.
 * Useful for relationship compatibility reports.
 */
export function compareScoringResults(
  output1: ScoringOutput,
  output2: ScoringOutput,
): TraitComparison[] {
  return TRAIT_IDS.map((traitId) => {
    const score1 = output1.traits[traitId].score;
    const score2 = output2.traits[traitId].score;
    const difference = Math.abs(score1 - score2);
    // Compatibility: 100 = identical, decreasing as difference increases
    const compatibility = Math.max(0, 100 - difference);

    return {
      traitId,
      score1,
      score2,
      difference,
      compatibility,
    };
  });
}

// ─── Utility: Export to Database Format ─────────────────────────────────────

/**
 * Convert scoring output to a format suitable for database storage
 * (matches the TraitScores Prisma model).
 */
export function toDatabaseFormat(
  output: ScoringOutput,
  userId: string,
): Record<string, unknown> {
  return {
    userId,
    emotionalIntensity: output.traits.emotionalIntensity.score,
    attachmentStyle: output.traits.attachmentStyle.score,
    ambition: output.traits.ambition.score,
    trust: output.traits.trust.score,
    communicationOpenness: output.traits.communicationOpenness.score,
    impulsiveness: output.traits.impulsiveness.score,
    empathy: output.traits.empathy.score,
    resilience: output.traits.resilience.score,
    creativity: output.traits.creativity.score,
    intuition: output.traits.intuition.score,
    discipline: output.traits.discipline.score,
    socialEnergy: output.traits.socialEnergy.score,
    patience: output.traits.patience.score,
    adaptability: output.traits.adaptability.score,
    additionalTraits: JSON.stringify({
      computedAt: output.computedAt,
      config: output.config,
      contributions: Object.fromEntries(
        TRAIT_IDS.map((id) => [id, output.traits[id].contributions]),
      ),
    }),
  };
}
