/**
 * AyuAstro Numerology Engine — Type Definitions
 *
 * All types are designed to be deterministic and serializable.
 * Master numbers (11, 22, 33) are represented as their integer values.
 */

/** The set of valid numerology result numbers (1-9 plus master numbers 11, 22, 33) */
export type NumerologyNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 11 | 22 | 33;

/** Category of numerology reading */
export type NumerologyCategory =
  | "lifePath"
  | "destiny"
  | "soulUrge"
  | "personality"
  | "birthday"
  | "maturity"
  | "personalYear";

/** Label mapping for each category */
export const CATEGORY_LABELS: Record<NumerologyCategory, string> = {
  lifePath: "Life Path Number",
  destiny: "Destiny Number",
  soulUrge: "Soul Urge Number",
  personality: "Personality Number",
  birthday: "Birthday Number",
  maturity: "Maturity Number",
  personalYear: "Personal Year Number",
};

/** A single numerology reading result with number and description */
export interface NumerologyReading {
  number: number;
  description: string;
}

/** Input parameters for calculating numerology */
export interface NumerologyInput {
  /** Full name as written on birth certificate (e.g. "Mary Jane Smith") */
  fullName: string;
  /** Date of birth as an ISO date string (e.g. "1990-07-15") or a Date object */
  birthDate: string | Date;
  /** Optional reference date for Personal Year calculation (defaults to today) */
  referenceDate?: string | Date;
}

/** Complete numerology profile returned by the engine */
export interface NumerologyData {
  lifePathNumber: number;
  destinyNumber: number;
  soulUrgeNumber: number;
  personalityNumber: number;
  birthdayNumber: number;
  maturityNumber: number;
  personalYearNumber: number;
  lifePathDesc: string;
  destinyDesc: string;
  soulUrgeDesc: string;
  personalityDesc: string;
}

/** Internal helper — a letter-value pair */
export interface LetterValue {
  letter: string;
  value: number;
}

/** Internal helper — parsed name components */
export interface ParsedName {
  vowels: LetterValue[];
  consonants: LetterValue[];
  allLetters: LetterValue[];
  vowelSum: number;
  consonantSum: number;
  totalSum: number;
}

/** Internal helper — parsed date components */
export interface ParsedDate {
  month: number;
  day: number;
  year: number;
}

/** Check if a number is a master number */
export function isMasterNumber(n: number): n is 11 | 22 | 33 {
  return n === 11 || n === 22 || n === 33;
}
