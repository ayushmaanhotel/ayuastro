/**
 * AyuAstro Numerology Engine — Main Export
 *
 * This is the public API for the numerology calculation engine.
 * Import from `@/lib/numerology` to access all functions and types.
 *
 * Usage:
 * ```ts
 * import { calculateNumerology } from "@/lib/numerology";
 *
 * const profile = calculateNumerology({
 *   fullName: "Mary Jane Smith",
 *   birthDate: "1990-07-15",
 * });
 *
 * console.log(profile.lifePathNumber);   // 5
 * console.log(profile.lifePathDesc);     // "The Individualist — ..."
 * ```
 */

// ── Types ──────────────────────────────────────────────────────────────────
export type {
  NumerologyNumber,
  NumerologyCategory,
  NumerologyReading,
  NumerologyInput,
  NumerologyData,
  LetterValue,
  ParsedName,
  ParsedDate,
} from "./types";

export { CATEGORY_LABELS, isMasterNumber } from "./types";

// ── Utilities ──────────────────────────────────────────────────────────────
export {
  letterToNumber,
  reduceToSingleDigit,
  reduceForce,
  sumDigits,
  isVowel,
  parseName,
  parseDate,
  isValidName,
  isValidDate,
} from "./utils";

// ── Descriptions ───────────────────────────────────────────────────────────
export {
  getLifePathDescription,
  getDestinyDescription,
  getSoulUrgeDescription,
  getPersonalityDescription,
} from "./descriptions";

// ── Calculator ─────────────────────────────────────────────────────────────
export {
  calculateLifePathNumber,
  calculateDestinyNumber,
  calculateSoulUrgeNumber,
  calculatePersonalityNumber,
  calculateBirthdayNumber,
  calculateMaturityNumber,
  calculatePersonalYearNumber,
  calculateNumerology,
} from "./calculator";
