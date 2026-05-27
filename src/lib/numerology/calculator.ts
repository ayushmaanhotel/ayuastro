/**
 * AyuAstro Numerology Engine — Core Calculator
 *
 * All calculations are deterministic and follow the Pythagorean system.
 * Master numbers (11, 22, 33) are preserved throughout.
 */

import type { NumerologyData, NumerologyInput } from "./types";
import { parseName, parseDate, reduceToSingleDigit, reduceForce, isValidName, isValidDate } from "./utils";
import {
  getLifePathDescription,
  getDestinyDescription,
  getSoulUrgeDescription,
  getPersonalityDescription,
} from "./descriptions";

// ---------------------------------------------------------------------------
// Individual Number Calculations
// ---------------------------------------------------------------------------

/**
 * Life Path Number
 *
 * Calculated by reducing the month, day, and year of birth separately
 * to single digits (or master numbers), then adding them together
 * and reducing again.
 *
 * This is the most important number in numerology — it represents
 * the core trajectory of a person's life journey.
 *
 * Example: July 15, 1990
 *   Month: 7 → 7
 *   Day:   15 → 1+5 = 6
 *   Year:  1990 → 1+9+9+0 = 19 → 1+9 = 10 → 1+0 = 1
 *   Sum:   7 + 6 + 1 = 14 → 1+4 = 5
 */
export function calculateLifePathNumber(birthDate: string | Date): number {
  const { month, day, year } = parseDate(birthDate);

  // Reduce each component separately, preserving master numbers
  const monthReduced = reduceToSingleDigit(month);
  const dayReduced = reduceToSingleDigit(day);

  // Year is reduced differently — sum all digits, then reduce to single/master
  let yearReduced = year;
  while (yearReduced > 9 && yearReduced !== 11 && yearReduced !== 22 && yearReduced !== 33) {
    yearReduced = String(yearReduced)
      .split("")
      .reduce((sum, d) => sum + parseInt(d, 10), 0);
  }

  const total = monthReduced + dayReduced + yearReduced;
  return reduceToSingleDigit(total);
}

/**
 * Destiny / Expression Number
 *
 * Calculated from the full name at birth. Each letter is converted
 * to its Pythagorean number value, all are summed, and the total
 * is reduced to a single digit or master number.
 *
 * This number reveals the talents, abilities, and shortcomings
 * you brought into this lifetime.
 */
export function calculateDestinyNumber(fullName: string): number {
  const { totalSum } = parseName(fullName);
  return reduceToSingleDigit(totalSum);
}

/**
 * Soul Urge / Heart's Desire Number
 *
 * Calculated from the vowels in the full name at birth.
 * This number reveals your inner motivations, what truly
 * drives you at the deepest emotional level.
 */
export function calculateSoulUrgeNumber(fullName: string): number {
  const { vowelSum } = parseName(fullName);
  return reduceToSingleDigit(vowelSum);
}

/**
 * Personality Number
 *
 * Calculated from the consonants in the full name at birth.
 * This number describes how others perceive you — the
 * external persona you project to the world.
 */
export function calculatePersonalityNumber(fullName: string): number {
  const { consonantSum } = parseName(fullName);
  return reduceToSingleDigit(consonantSum);
}

/**
 * Birthday Number
 *
 * Simply the day of birth, reduced if greater than 31.
 * Master numbers in the day are preserved (11, 22).
 * This number reveals a special talent or gift that
 * helps you along your life path.
 */
export function calculateBirthdayNumber(birthDate: string | Date): number {
  const { day } = parseDate(birthDate);
  return reduceToSingleDigit(day);
}

/**
 * Maturity Number
 *
 * The sum of the Life Path Number and Destiny Number,
 * reduced to a single digit or master number.
 *
 * This number represents the growing awareness and
 * integration of your life purpose as you mature,
 * typically becoming more evident after age 35-45.
 */
export function calculateMaturityNumber(
  lifePathNumber: number,
  destinyNumber: number
): number {
  return reduceToSingleDigit(lifePathNumber + destinyNumber);
}

/**
 * Personal Year Number
 *
 * Calculated by adding the birth month + birth day + current year,
 * then reducing. This reveals the themes and emotional climate
 * of the current year in your personal cycle.
 *
 * If the reference date is before the birthday this year,
 * the previous year's number is returned (since the personal
 * year shifts on the birthday, not on Jan 1).
 */
export function calculatePersonalYearNumber(
  birthDate: string | Date,
  referenceDate?: string | Date
): number {
  const { month, day } = parseDate(birthDate);

  const ref = referenceDate
    ? (typeof referenceDate === "string" ? new Date(referenceDate) : referenceDate)
    : new Date();

  // Determine the current personal year cycle year
  const refMonth = ref.getUTCMonth() + 1; // 1-indexed
  const refDay = ref.getUTCDate();
  const refYear = ref.getUTCFullYear();

  // Personal year shifts on the birthday, not on Jan 1
  let cycleYear = refYear;
  const hasPassedBirthday =
    refMonth > month || (refMonth === month && refDay >= day);
  if (!hasPassedBirthday) {
    cycleYear = refYear - 1;
  }

  const total = reduceForce(month) + reduceForce(day) + reduceForce(cycleYear);
  return reduceToSingleDigit(total);
}

// ---------------------------------------------------------------------------
// Full Profile Calculation
// ---------------------------------------------------------------------------

/**
 * Calculate the complete numerology profile.
 *
 * This is the primary entry point for the numerology engine.
 * It computes all numbers and retrieves their corresponding
 * emotionally intelligent descriptions.
 */
export function calculateNumerology(input: NumerologyInput): NumerologyData {
  if (!isValidName(input.fullName)) {
    throw new Error("Invalid name: must contain at least one alphabetic character");
  }
  if (!isValidDate(input.birthDate)) {
    throw new Error("Invalid birth date");
  }

  const lifePathNumber = calculateLifePathNumber(input.birthDate);
  const destinyNumber = calculateDestinyNumber(input.fullName);
  const soulUrgeNumber = calculateSoulUrgeNumber(input.fullName);
  const personalityNumber = calculatePersonalityNumber(input.fullName);
  const birthdayNumber = calculateBirthdayNumber(input.birthDate);
  const maturityNumber = calculateMaturityNumber(lifePathNumber, destinyNumber);
  const personalYearNumber = calculatePersonalYearNumber(
    input.birthDate,
    input.referenceDate
  );

  return {
    lifePathNumber,
    destinyNumber,
    soulUrgeNumber,
    personalityNumber,
    birthdayNumber,
    maturityNumber,
    personalYearNumber,
    lifePathDesc: getLifePathDescription(lifePathNumber),
    destinyDesc: getDestinyDescription(destinyNumber),
    soulUrgeDesc: getSoulUrgeDescription(soulUrgeNumber),
    personalityDesc: getPersonalityDescription(personalityNumber),
  };
}
