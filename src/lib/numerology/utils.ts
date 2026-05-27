/**
 * AyuAstro Numerology Engine — Utility Functions
 *
 * Pythagorean numerology system implementation.
 * All functions are pure and deterministic.
 */

import type { LetterValue, ParsedName, ParsedDate } from "./types";

// ---------------------------------------------------------------------------
// Pythagorean Letter-to-Number Mapping
// ---------------------------------------------------------------------------

/**
 * Pythagorean numerology assigns each letter a value 1-9:
 *   1: A J S    2: B K T    3: C L U
 *   4: D M V    5: E N W    6: F O X
 *   7: G P Y    8: H Q Z    9: I R
 */
const LETTER_MAP: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9,
  J: 1, K: 2, L: 3, M: 4, N: 5, O: 6, P: 7, Q: 8, R: 9,
  S: 1, T: 2, U: 3, V: 4, W: 5, X: 6, Y: 7, Z: 8,
};

/** Vowels used in numerology (Y is treated as a vowel when it sounds like one, but
 *  by convention in Pythagorean numerology Y is typically a consonant.
 *  We follow the standard convention: A, E, I, O, U are vowels. */
const VOWELS = new Set(["A", "E", "I", "O", "U"]);

// ---------------------------------------------------------------------------
// Core Utility Functions
// ---------------------------------------------------------------------------

/**
 * Map a single uppercase letter to its Pythagorean number value.
 * Returns 0 for non-alphabetic characters.
 */
export function letterToNumber(letter: string): number {
  return LETTER_MAP[letter.toUpperCase()] ?? 0;
}

/**
 * Reduce a number to a single digit, preserving master numbers (11, 22, 33).
 *
 * Examples:
 *   29 → 2+9=11 → 11 (master, stop)
 *   38 → 3+8=11 → 11 (master, stop)
 *   47 → 4+7=11 → 11 (master, stop)
 *   39 → 3+9=12 → 1+2=3
 *   19 → 1+9=10 → 1+0=1
 *   11 → 11 (already master)
 */
export function reduceToSingleDigit(n: number): number {
  if (n < 1) return n;
  // Master numbers are not reduced
  if (n === 11 || n === 22 || n === 33) return n;
  if (n <= 9) return n;

  let result = n;
  while (result > 9 && result !== 11 && result !== 22 && result !== 33) {
    result = sumDigits(result);
  }
  return result;
}

/**
 * Reduce a number to a single digit WITHOUT preserving master numbers.
 * Used for intermediate reduction steps (e.g., reducing month, day, year
 * separately before adding them for the Life Path).
 */
export function reduceForce(n: number): number {
  if (n < 1) return n;
  let result = n;
  while (result > 9) {
    result = sumDigits(result);
  }
  return result;
}

/**
 * Sum the individual digits of a number.
 * Example: 1987 → 1+9+8+7 = 25
 */
export function sumDigits(n: number): number {
  const abs = Math.abs(n);
  if (abs < 10) return abs;
  return String(abs)
    .split("")
    .reduce((acc, d) => acc + parseInt(d, 10), 0);
}

/**
 * Check if a character is a vowel (A, E, I, O, U).
 */
export function isVowel(char: string): boolean {
  return VOWELS.has(char.toUpperCase());
}

// ---------------------------------------------------------------------------
// Name Parsing
// ---------------------------------------------------------------------------

/**
 * Parse a full name into its Pythagorean letter values,
 * separating vowels and consonants.
 *
 * Non-alphabetic characters (spaces, hyphens, etc.) are ignored.
 */
export function parseName(fullName: string): ParsedName {
  const cleaned = fullName.toUpperCase().replace(/[^A-Z]/g, "");

  const vowels: LetterValue[] = [];
  const consonants: LetterValue[] = [];
  const allLetters: LetterValue[] = [];

  for (const ch of cleaned) {
    const value = LETTER_MAP[ch];
    if (!value) continue; // skip unmapped characters

    const entry: LetterValue = { letter: ch, value };

    allLetters.push(entry);
    if (VOWELS.has(ch)) {
      vowels.push(entry);
    } else {
      consonants.push(entry);
    }
  }

  const vowelSum = vowels.reduce((s, lv) => s + lv.value, 0);
  const consonantSum = consonants.reduce((s, lv) => s + lv.value, 0);
  const totalSum = vowelSum + consonantSum;

  return { vowels, consonants, allLetters, vowelSum, consonantSum, totalSum };
}

// ---------------------------------------------------------------------------
// Date Parsing
// ---------------------------------------------------------------------------

/**
 * Parse a date input into its numeric components.
 */
export function parseDate(date: string | Date): ParsedDate {
  const d = typeof date === "string" ? new Date(date) : date;

  // Use getUTCMonth / getUTCDate to avoid timezone issues with ISO strings
  const month = d.getUTCMonth() + 1; // 0-indexed → 1-indexed
  const day = d.getUTCDate();
  const year = d.getUTCFullYear();

  return { month, day, year };
}

// ---------------------------------------------------------------------------
// Validation Helpers
// ---------------------------------------------------------------------------

/**
 * Validate that a full name contains at least one alphabetic character.
 */
export function isValidName(name: string): boolean {
  return /[A-Za-z]/.test(name);
}

/**
 * Validate that a date is a real, parseable date.
 */
export function isValidDate(date: string | Date): boolean {
  const d = typeof date === "string" ? new Date(date) : date;
  return !isNaN(d.getTime());
}
