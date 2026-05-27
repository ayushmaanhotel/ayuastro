/**
 * AyuAstro Trait Scoring Engine - Scoring Rules
 *
 * Defines deterministic, rule-based mappings from astrological data,
 * numerological data, and behavioral questionnaire answers to
 * trait score contributions.
 *
 * Design Principles:
 * - ALL scoring is deterministic and rule-based (no randomness, no AI)
 * - Each rule is documented with its astrological/numerological/psychological basis
 * - Contributions are expressed as raw scores (0-100 range) with weights
 * - Multiple contributions for the same source are blended within that source
 *   before being combined across sources in the engine
 *
 * Weight Distribution:
 * - Astrological: ~40% — Planetary positions, signs, houses, yogas, doshas
 * - Numerological: ~20% — Life path, destiny, soul urge, personality numbers
 * - Behavioral: ~40% — Questionnaire answers across 4 categories
 */

import type {
  AstrologyInput,
  NumerologyInput,
  QuestionnaireAnswer,
  TraitContribution,
  TraitId,
  ZodiacSign,
  Element,
} from './types';
import { getElement, getModality } from './types';
import { categoryAverage, clamp } from './normalizer';

// ─── Astrological Helper Functions ──────────────────────────────────────────

/** Check if a planet is in a specific sign */
function planetInSign(input: AstrologyInput, planet: string, sign: ZodiacSign): boolean {
  return input.planetaryPositions.some((p) => p.planet === planet && p.sign === sign);
}

/** Check if two planets are in the same sign (conjunction) */
function planetsConjunct(input: AstrologyInput, planet1: string, planet2: string): boolean {
  const p1 = input.planetaryPositions.find((p) => p.planet === planet1);
  const p2 = input.planetaryPositions.find((p) => p.planet === planet2);
  return !!p1 && !!p2 && p1.sign === p2.sign;
}

/** Check if a planet is in a sign of a given element */
function planetInElement(input: AstrologyInput, planet: string, element: Element): boolean {
  return input.planetaryPositions.some(
    (p) => p.planet === planet && getElement(p.sign) === element,
  );
}

/** Check if a planet is retrograde */
function planetRetrograde(input: AstrologyInput, planet: string): boolean {
  const p = input.planetaryPositions.find((pp) => pp.planet === planet);
  return !!p && !!p.retrograde;
}

/** Check if a specific yoga exists */
function hasYoga(input: AstrologyInput, yogaName: string): boolean {
  return input.yogas.some((y) => y.name === yogaName);
}

/** Check if a specific dosha exists with at least a given severity */
function hasDosha(input: AstrologyInput, doshaName: string, minSeverity: 'low' | 'medium' | 'high' = 'low'): boolean {
  const severityOrder = ['low', 'medium', 'high'];
  const minIndex = severityOrder.indexOf(minSeverity);
  return input.doshas.some(
    (d) => d.name === doshaName && severityOrder.indexOf(d.severity) >= minIndex,
  );
}

/** Count benefic yogas */
function beneficYogaCount(input: AstrologyInput): number {
  return input.yogas.filter((y) => y.type === 'benefic').length;
}

/** Count malefic yogas */
function maleficYogaCount(input: AstrologyInput): number {
  return input.yogas.filter((y) => y.type === 'malefic').length;
}

/** Check if a planet is in a given house */
function planetInHouse(input: AstrologyInput, planet: string, house: number): boolean {
  return input.houses.some((h) => h.houseNumber === house && h.planets.includes(planet as typeof h.planets[number]));
}

/** Check if any planet in a given house */
function planetsInHouse(input: AstrologyInput, house: number): string[] {
  const h = input.houses.find((hh) => hh.houseNumber === house);
  return h ? [...h.planets] : [];
}

// ─── Numerological Helper Functions ─────────────────────────────────────────

/** Check if a numerology number matches one of the given values */
function numMatches(value: number, targets: number[]): boolean {
  return targets.includes(value);
}

/** Master number check (11, 22, 33) */
function isMasterNumber(value: number): boolean {
  return [11, 22, 33].includes(value);
}

// ─── Sign Group Constants ───────────────────────────────────────────────────

const FIRE_SIGNS: ZodiacSign[] = ['Aries', 'Leo', 'Sagittarius'];
const EARTH_SIGNS: ZodiacSign[] = ['Taurus', 'Virgo', 'Capricorn'];
const AIR_SIGNS: ZodiacSign[] = ['Gemini', 'Libra', 'Aquarius'];
const WATER_SIGNS: ZodiacSign[] = ['Cancer', 'Scorpio', 'Pisces'];
const CARDINAL_SIGNS: ZodiacSign[] = ['Aries', 'Cancer', 'Libra', 'Capricorn'];
const FIXED_SIGNS: ZodiacSign[] = ['Taurus', 'Leo', 'Scorpio', 'Aquarius'];
const MUTABLE_SIGNS: ZodiacSign[] = ['Gemini', 'Virgo', 'Sagittarius', 'Pisces'];

// ═══════════════════════════════════════════════════════════════════════════
// TRAIT SCORING RULES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * 1. EMOTIONAL INTENSITY
 * Measures the depth and strength of emotional experiences.
 *
 * Astrological basis:
 * - Moon sign is the primary indicator of emotional nature
 * - Water signs (Cancer, Scorpio, Pisces) feel deeply
 * - Moon-Pluto conjunction amplifies emotional depth
 * - Moon-Saturn aspects create emotional restraint (lower score)
 *
 * Numerological basis:
 * - Life Path 2: Emotional sensitivity, receptivity
 * - Life Path 6: Nurturing, emotional responsibility
 * - Life Path 11: Heightened emotional awareness (master number)
 * - Life Path 4, 8: More stoic, emotionally reserved
 *
 * Behavioral basis:
 * - Emotional category answers about emotional reactivity
 */
function emotionalIntensityAstro(input: AstrologyInput): TraitContribution[] {
  const contributions: TraitContribution[] = [];

  // Moon sign - primary emotional indicator
  if (input.moonSign === 'Scorpio') {
    contributions.push({ source: 'astrological', rawScore: 90, weight: 1.0, reason: 'Moon in Scorpio: deepest emotional intensity of all signs' });
  } else if (input.moonSign === 'Cancer') {
    contributions.push({ source: 'astrological', rawScore: 80, weight: 1.0, reason: 'Moon in Cancer: emotionally sensitive and nurturing' });
  } else if (input.moonSign === 'Pisces') {
    contributions.push({ source: 'astrological', rawScore: 75, weight: 1.0, reason: 'Moon in Pisces: emotionally permeable and empathic' });
  } else if (WATER_SIGNS.includes(input.moonSign)) {
    contributions.push({ source: 'astrological', rawScore: 70, weight: 0.8, reason: 'Moon in Water sign: emotionally deep' });
  } else if (EARTH_SIGNS.includes(input.moonSign)) {
    contributions.push({ source: 'astrological', rawScore: 40, weight: 0.8, reason: 'Moon in Earth sign: emotionally grounded and steady' });
  } else if (AIR_SIGNS.includes(input.moonSign)) {
    contributions.push({ source: 'astrological', rawScore: 35, weight: 0.8, reason: 'Moon in Air sign: emotionally detached and intellectual' });
  } else if (FIRE_SIGNS.includes(input.moonSign)) {
    contributions.push({ source: 'astrological', rawScore: 65, weight: 0.8, reason: 'Moon in Fire sign: emotionally passionate and reactive' });
  }

  // Moon-Pluto conjunction: extreme emotional depth
  if (planetsConjunct(input, 'Moon', 'Pluto')) {
    contributions.push({ source: 'astrological', rawScore: 95, weight: 0.7, reason: 'Moon-Pluto conjunction: transformative emotional intensity' });
  }

  // Moon-Saturn conjunction: emotional reserve
  if (planetsConjunct(input, 'Moon', 'Saturn')) {
    contributions.push({ source: 'astrological', rawScore: 25, weight: 0.7, reason: 'Moon-Saturn conjunction: emotional restraint and reserve' });
  }

  // Moon in 8th or 12th house: deep emotional undercurrents
  if (planetInHouse(input, 'Moon', 8)) {
    contributions.push({ source: 'astrological', rawScore: 85, weight: 0.5, reason: 'Moon in 8th house: hidden emotional depths' });
  }
  if (planetInHouse(input, 'Moon', 12)) {
    contributions.push({ source: 'astrological', rawScore: 75, weight: 0.4, reason: 'Moon in 12th house: subconscious emotional currents' });
  }

  // Sun in water sign: emotional core
  if (WATER_SIGNS.includes(input.sunSign)) {
    contributions.push({ source: 'astrological', rawScore: 65, weight: 0.4, reason: 'Sun in Water sign: emotionally driven identity' });
  }

  // Neptune aspects to Moon: emotional sensitivity
  if (planetsConjunct(input, 'Moon', 'Neptune')) {
    contributions.push({ source: 'astrological', rawScore: 80, weight: 0.5, reason: 'Moon-Neptune conjunction: heightened emotional sensitivity' });
  }

  // Default baseline if no strong indicators
  if (contributions.length === 0) {
    contributions.push({ source: 'astrological', rawScore: 45, weight: 0.5, reason: 'Baseline emotional intensity (no strong astrological indicators)' });
  }

  return contributions;
}

function emotionalIntensityNumerology(input: NumerologyInput): TraitContribution[] {
  const contributions: TraitContribution[] = [];

  // Life Path number influence
  if (numMatches(input.lifePathNumber, [2, 6])) {
    contributions.push({ source: 'numerological', rawScore: 75, weight: 0.8, reason: `Life Path ${input.lifePathNumber}: emotionally sensitive and receptive` });
  } else if (input.lifePathNumber === 11) {
    contributions.push({ source: 'numerological', rawScore: 85, weight: 0.9, reason: 'Life Path 11: master intuitive with heightened emotional awareness' });
  } else if (numMatches(input.lifePathNumber, [4, 8])) {
    contributions.push({ source: 'numerological', rawScore: 35, weight: 0.7, reason: `Life Path ${input.lifePathNumber}: emotionally stoic and reserved` });
  } else if (numMatches(input.lifePathNumber, [1, 5])) {
    contributions.push({ source: 'numerological', rawScore: 45, weight: 0.6, reason: `Life Path ${input.lifePathNumber}: moderate emotional expression` });
  } else {
    contributions.push({ source: 'numerological', rawScore: 50, weight: 0.5, reason: `Life Path ${input.lifePathNumber}: balanced emotional baseline` });
  }

  // Soul Urge number: inner emotional desires
  if (numMatches(input.soulUrgeNumber, [2, 6, 9])) {
    contributions.push({ source: 'numerological', rawScore: 72, weight: 0.5, reason: `Soul Urge ${input.soulUrgeNumber}: deep inner emotional needs` });
  } else if (input.soulUrgeNumber === 11) {
    contributions.push({ source: 'numerological', rawScore: 80, weight: 0.6, reason: 'Soul Urge 11: spiritual emotional depth' });
  }

  return contributions;
}

function emotionalIntensityBehavioral(answers: QuestionnaireAnswer[]): TraitContribution[] {
  const avg = categoryAverage(answers, 'emotional');
  return [{
    source: 'behavioral',
    rawScore: avg,
    weight: 1.0,
    reason: `Behavioral emotional intensity: average of ${answers.filter(a => a.category === 'emotional').length} emotional answers = ${avg}`,
  }];
}

/**
 * 2. ATTACHMENT STYLE
 * 0 = Secure attachment, 100 = Anxious-Avoidant attachment
 *
 * Astrological basis:
 * - Moon-Saturn aspects → avoidant tendencies (emotional unavailability modeled early)
 * - Moon-Pluto aspects → anxious attachment (fear of loss, control dynamics)
 * - Venus-Saturn → relationship fears and trust issues
 * - Taurus/Cancer Moon → secure attachment tendency
 * - Kendra Trikona Yoga → secure foundation
 *
 * Numerological basis:
 * - Life Path 7 → tendency toward emotional independence/avoidance
 * - Life Path 6 → secure, nurturing attachment style
 * - Life Path 11 → anxious attachment sensitivity
 *
 * Behavioral basis:
 * - Relational category answers about trust, closeness, fear of abandonment
 */
function attachmentStyleAstro(input: AstrologyInput): TraitContribution[] {
  const contributions: TraitContribution[] = [];

  // Moon-Saturn conjunction: avoidant tendencies
  if (planetsConjunct(input, 'Moon', 'Saturn')) {
    contributions.push({ source: 'astrological', rawScore: 80, weight: 1.0, reason: 'Moon-Saturn conjunction: emotional withdrawal pattern (avoidant tendency)' });
  }

  // Moon-Pluto conjunction: anxious attachment
  if (planetsConjunct(input, 'Moon', 'Pluto')) {
    contributions.push({ source: 'astrological', rawScore: 85, weight: 0.9, reason: 'Moon-Pluto conjunction: fear of emotional loss (anxious attachment)' });
  }

  // Venus-Saturn conjunction: relationship fears
  if (planetsConjunct(input, 'Venus', 'Saturn')) {
    contributions.push({ source: 'astrological', rawScore: 75, weight: 0.8, reason: 'Venus-Saturn conjunction: fear of vulnerability in relationships' });
  }

  // Moon in Taurus/Cancer: secure attachment
  if (input.moonSign === 'Taurus') {
    contributions.push({ source: 'astrological', rawScore: 20, weight: 0.9, reason: 'Moon in Taurus: stable emotional foundation (secure attachment)' });
  } else if (input.moonSign === 'Cancer') {
    contributions.push({ source: 'astrological', rawScore: 25, weight: 0.8, reason: 'Moon in Cancer: nurturing attachment (somewhat secure but can be clingy)' });
  }

  // Rahu with Moon: unstable attachment patterns
  if (planetsConjunct(input, 'Moon', 'Rahu')) {
    contributions.push({ source: 'astrological', rawScore: 78, weight: 0.7, reason: 'Moon-Rahu conjunction: unstable attachment patterns' });
  }

  // Moon in Aquarius: emotionally detached (avoidant)
  if (input.moonSign === 'Aquarius') {
    contributions.push({ source: 'astrological', rawScore: 70, weight: 0.7, reason: 'Moon in Aquarius: emotional detachment (avoidant tendency)' });
  }

  // Moon in Scorpio: intense possessive attachment (anxious)
  if (input.moonSign === 'Scorpio') {
    contributions.push({ source: 'astrological', rawScore: 80, weight: 0.8, reason: 'Moon in Scorpio: possessive emotional bonding (anxious attachment)' });
  }

  // Benefic yogas reduce attachment insecurity
  const beneficCount = beneficYogaCount(input);
  if (beneficCount > 0) {
    const secureScore = Math.max(10, 40 - beneficCount * 10);
    contributions.push({ source: 'astrological', rawScore: secureScore, weight: 0.3 * beneficCount, reason: `${beneficCount} benefic yoga(s): foundational stability (more secure)` });
  }

  // Doshas increase insecurity
  if (hasDosha(input, 'Mangal Dosha')) {
    contributions.push({ source: 'astrological', rawScore: 72, weight: 0.6, reason: 'Mangal Dosha: relationship friction tendency' });
  }

  // Default baseline
  if (contributions.length === 0) {
    contributions.push({ source: 'astrological', rawScore: 40, weight: 0.5, reason: 'Baseline attachment style (moderate security)' });
  }

  return contributions;
}

function attachmentStyleNumerology(input: NumerologyInput): TraitContribution[] {
  const contributions: TraitContribution[] = [];

  if (input.lifePathNumber === 7) {
    contributions.push({ source: 'numerological', rawScore: 70, weight: 0.8, reason: 'Life Path 7: tendency toward emotional independence (avoidant leaning)' });
  } else if (input.lifePathNumber === 6) {
    contributions.push({ source: 'numerological', rawScore: 25, weight: 0.8, reason: 'Life Path 6: nurturing attachment style (secure leaning)' });
  } else if (input.lifePathNumber === 11) {
    contributions.push({ source: 'numerological', rawScore: 65, weight: 0.7, reason: 'Life Path 11: heightened attachment sensitivity' });
  } else if (numMatches(input.lifePathNumber, [1, 8])) {
    contributions.push({ source: 'numerological', rawScore: 55, weight: 0.6, reason: `Life Path ${input.lifePathNumber}: self-reliant attachment (somewhat avoidant)` });
  } else {
    contributions.push({ source: 'numerological', rawScore: 40, weight: 0.5, reason: `Life Path ${input.lifePathNumber}: balanced attachment baseline` });
  }

  return contributions;
}

function attachmentStyleBehavioral(answers: QuestionnaireAnswer[]): TraitContribution[] {
  const avg = categoryAverage(answers, 'relational');
  return [{
    source: 'behavioral',
    rawScore: avg,
    weight: 1.0,
    reason: `Behavioral attachment style: average of ${answers.filter(a => a.category === 'relational').length} relational answers = ${avg}`,
  }];
}

/**
 * 3. AMBITION
 * Drive to achieve goals and pursue success.
 *
 * Astrological basis:
 * - Mars in Capricorn/Aries: strong drive
 * - Saturn in 10th house: career focus
 * - Sun in Capricorn/Leo: achievement-oriented
 * - Cardinal signs: initiative and leadership
 *
 * Numerological basis:
 * - Life Path 1, 8: high ambition and leadership
 * - Life Path 4: methodical, steady ambition
 * - Life Path 7: less material ambition
 *
 * Behavioral basis:
 * - Behavioral category answers about goal-setting and persistence
 */
function ambitionAstro(input: AstrologyInput): TraitContribution[] {
  const contributions: TraitContribution[] = [];

  // Mars sign - drive and ambition indicator
  if (planetInSign(input, 'Mars', 'Capricorn')) {
    contributions.push({ source: 'astrological', rawScore: 90, weight: 1.0, reason: 'Mars in Capricorn: exalted drive and strategic ambition' });
  } else if (planetInSign(input, 'Mars', 'Aries')) {
    contributions.push({ source: 'astrological', rawScore: 85, weight: 1.0, reason: 'Mars in Aries: bold, pioneering ambition' });
  } else if (planetInSign(input, 'Mars', 'Scorpio')) {
    contributions.push({ source: 'astrological', rawScore: 80, weight: 0.9, reason: 'Mars in Scorpio: determined, relentless ambition' });
  } else if (planetInElement(input, 'Mars', 'Earth')) {
    contributions.push({ source: 'astrological', rawScore: 72, weight: 0.8, reason: 'Mars in Earth sign: steady, persistent ambition' });
  } else if (planetInElement(input, 'Mars', 'Fire')) {
    contributions.push({ source: 'astrological', rawScore: 70, weight: 0.8, reason: 'Mars in Fire sign: passionate drive' });
  }

  // Sun sign - identity and purpose
  if (input.sunSign === 'Capricorn') {
    contributions.push({ source: 'astrological', rawScore: 85, weight: 0.8, reason: 'Sun in Capricorn: achievement-oriented identity' });
  } else if (input.sunSign === 'Leo') {
    contributions.push({ source: 'astrological', rawScore: 75, weight: 0.7, reason: 'Sun in Leo: desire for recognition and achievement' });
  } else if (input.sunSign === 'Aries') {
    contributions.push({ source: 'astrological', rawScore: 72, weight: 0.7, reason: 'Sun in Aries: competitive and pioneering drive' });
  }

  // Saturn in 10th house: career ambition
  if (planetInHouse(input, 'Saturn', 10)) {
    contributions.push({ source: 'astrological', rawScore: 82, weight: 0.7, reason: 'Saturn in 10th house: strong career focus and ambition' });
  }

  // Jupiter aspects: expansive ambition
  if (planetsConjunct(input, 'Jupiter', 'Mars')) {
    contributions.push({ source: 'astrological', rawScore: 78, weight: 0.6, reason: 'Jupiter-Mars conjunction: expansive drive and optimism' });
  }

  // Cardinal ascendant: initiative
  if (CARDINAL_SIGNS.includes(input.ascendant)) {
    contributions.push({ source: 'astrological', rawScore: 65, weight: 0.4, reason: 'Cardinal ascendant: natural initiative and leadership tendency' });
  }

  // Sun in Pisces/Libra: less material ambition
  if (input.sunSign === 'Pisces' || input.sunSign === 'Libra') {
    contributions.push({ source: 'astrological', rawScore: 35, weight: 0.5, reason: `Sun in ${input.sunSign}: less focused on material achievement` });
  }

  if (contributions.length === 0) {
    contributions.push({ source: 'astrological', rawScore: 50, weight: 0.5, reason: 'Baseline ambition (no strong astrological indicators)' });
  }

  return contributions;
}

function ambitionNumerology(input: NumerologyInput): TraitContribution[] {
  const contributions: TraitContribution[] = [];

  if (numMatches(input.lifePathNumber, [1, 8])) {
    contributions.push({ source: 'numerological', rawScore: 85, weight: 0.9, reason: `Life Path ${input.lifePathNumber}: strong leadership and achievement drive` });
  } else if (input.lifePathNumber === 4) {
    contributions.push({ source: 'numerological', rawScore: 70, weight: 0.8, reason: 'Life Path 4: methodical, persistent ambition' });
  } else if (input.lifePathNumber === 7) {
    contributions.push({ source: 'numerological', rawScore: 35, weight: 0.7, reason: 'Life Path 7: less material ambition, more spiritual focus' });
  } else if (numMatches(input.lifePathNumber, [2, 6])) {
    contributions.push({ source: 'numerological', rawScore: 45, weight: 0.6, reason: `Life Path ${input.lifePathNumber}: supportive rather than competitive drive` });
  } else {
    contributions.push({ source: 'numerological', rawScore: 55, weight: 0.5, reason: `Life Path ${input.lifePathNumber}: moderate ambition` });
  }

  // Destiny number: career direction
  if (numMatches(input.destinyNumber, [1, 8, 10])) {
    contributions.push({ source: 'numerological', rawScore: 75, weight: 0.5, reason: `Destiny Number ${input.destinyNumber}: achievement-oriented destiny` });
  }

  return contributions;
}

function ambitionBehavioral(answers: QuestionnaireAnswer[]): TraitContribution[] {
  const avg = categoryAverage(answers, 'behavioral');
  return [{
    source: 'behavioral',
    rawScore: avg,
    weight: 1.0,
    reason: `Behavioral ambition: average of ${answers.filter(a => a.category === 'behavioral').length} behavioral answers = ${avg}`,
  }];
}

/**
 * 4. TRUST
 * Willingness to rely on and believe in others.
 *
 * Astrological basis:
 * - Jupiter aspects: faith, optimism, trust
 * - Saturn aspects: caution, skepticism
 * - Venus in Pisces: unconditional trust
 * - Benefic yogas: trust-facilitating
 * - Malefic yogas / doshas: trust-reducing
 *
 * Numerological basis:
 * - Life Path 9: universal trust and compassion
 * - Life Path 4: cautious, trust must be earned
 * - Life Path 3: open and trusting
 *
 * Behavioral basis:
 * - Relational category answers about trust and openness
 */
function trustAstro(input: AstrologyInput): TraitContribution[] {
  const contributions: TraitContribution[] = [];

  // Jupiter as the planet of faith and trust
  if (planetInElement(input, 'Jupiter', 'Fire')) {
    contributions.push({ source: 'astrological', rawScore: 75, weight: 0.8, reason: 'Jupiter in Fire sign: optimistic and trusting nature' });
  } else if (planetInElement(input, 'Jupiter', 'Water')) {
    contributions.push({ source: 'astrological', rawScore: 70, weight: 0.7, reason: 'Jupiter in Water sign: compassionate trust' });
  }

  // Venus in Pisces: unconditional trust
  if (planetInSign(input, 'Venus', 'Pisces')) {
    contributions.push({ source: 'astrological', rawScore: 85, weight: 0.7, reason: 'Venus in Pisces: exalted, unconditional trust in love' });
  } else if (planetInElement(input, 'Venus', 'Water')) {
    contributions.push({ source: 'astrological', rawScore: 68, weight: 0.6, reason: 'Venus in Water sign: emotionally trusting' });
  }

  // Saturn aspects reduce trust
  if (planetsConjunct(input, 'Saturn', 'Venus')) {
    contributions.push({ source: 'astrological', rawScore: 30, weight: 0.8, reason: 'Saturn-Venus conjunction: cautious in relationships, trust must be earned' });
  }
  if (planetsConjunct(input, 'Saturn', 'Moon')) {
    contributions.push({ source: 'astrological', rawScore: 35, weight: 0.7, reason: 'Saturn-Moon conjunction: emotional guardedness reduces trust' });
  }

  // Rahu with Venus: trust issues
  if (planetsConjunct(input, 'Rahu', 'Venus')) {
    contributions.push({ source: 'astrological', rawScore: 32, weight: 0.6, reason: 'Rahu-Venus conjunction: deception or betrayal patterns affect trust' });
  }

  // Malefic yogas reduce trust
  const maleficCount = maleficYogaCount(input);
  if (maleficCount > 0) {
    const distrustScore = Math.min(90, 40 + maleficCount * 15);
    contributions.push({ source: 'astrological', rawScore: 100 - distrustScore, weight: 0.4 * maleficCount, reason: `${maleficCount} malefic yoga(s): reduces baseline trust` });
  }

  // Sun in Sagittarius: naturally trusting
  if (input.sunSign === 'Sagittarius') {
    contributions.push({ source: 'astrological', rawScore: 72, weight: 0.6, reason: 'Sun in Sagittarius: naturally optimistic and trusting' });
  }

  // Moon in Scorpio: trust issues
  if (input.moonSign === 'Scorpio') {
    contributions.push({ source: 'astrological', rawScore: 28, weight: 0.8, reason: 'Moon in Scorpio: deeply guarded, slow to trust' });
  }

  if (contributions.length === 0) {
    contributions.push({ source: 'astrological', rawScore: 50, weight: 0.5, reason: 'Baseline trust (no strong astrological indicators)' });
  }

  return contributions;
}

function trustNumerology(input: NumerologyInput): TraitContribution[] {
  const contributions: TraitContribution[] = [];

  if (input.lifePathNumber === 9) {
    contributions.push({ source: 'numerological', rawScore: 78, weight: 0.8, reason: 'Life Path 9: universal compassion and trust' });
  } else if (input.lifePathNumber === 3) {
    contributions.push({ source: 'numerological', rawScore: 72, weight: 0.7, reason: 'Life Path 3: open and naturally trusting' });
  } else if (input.lifePathNumber === 4) {
    contributions.push({ source: 'numerological', rawScore: 35, weight: 0.8, reason: 'Life Path 4: cautious, trust must be earned through consistency' });
  } else if (input.lifePathNumber === 8) {
    contributions.push({ source: 'numerological', rawScore: 42, weight: 0.7, reason: 'Life Path 8: pragmatic trust based on track record' });
  } else {
    contributions.push({ source: 'numerological', rawScore: 50, weight: 0.5, reason: `Life Path ${input.lifePathNumber}: moderate trust baseline` });
  }

  return contributions;
}

function trustBehavioral(answers: QuestionnaireAnswer[]): TraitContribution[] {
  const avg = categoryAverage(answers, 'relational');
  return [{
    source: 'behavioral',
    rawScore: avg,
    weight: 1.0,
    reason: `Behavioral trust: average of ${answers.filter(a => a.category === 'relational').length} relational answers = ${avg}`,
  }];
}

/**
 * 5. COMMUNICATION OPENNESS
 * Ease of self-expression and sharing thoughts.
 *
 * Astrological basis:
 * - Mercury in Gemini/Aquarius: communicative and open
 * - Mercury in Scorpio: private, selective communication
 * - 3rd house emphasis: communication focus
 * - Air signs: intellectual and communicative
 *
 * Numerological basis:
 * - Life Path 3, 5: expressive and communicative
 * - Life Path 7: private and selective
 *
 * Behavioral basis:
 * - Social category answers about communication comfort
 */
function communicationOpennessAstro(input: AstrologyInput): TraitContribution[] {
  const contributions: TraitContribution[] = [];

  // Mercury sign - primary communication indicator
  if (planetInSign(input, 'Mercury', 'Gemini')) {
    contributions.push({ source: 'astrological', rawScore: 90, weight: 1.0, reason: 'Mercury in Gemini: supremely communicative and open' });
  } else if (planetInSign(input, 'Mercury', 'Aquarius')) {
    contributions.push({ source: 'astrological', rawScore: 82, weight: 0.9, reason: 'Mercury in Aquarius: innovative and open communicator' });
  } else if (planetInSign(input, 'Mercury', 'Libra')) {
    contributions.push({ source: 'astrological', rawScore: 75, weight: 0.9, reason: 'Mercury in Libra: diplomatic and balanced communication' });
  } else if (planetInSign(input, 'Mercury', 'Scorpio')) {
    contributions.push({ source: 'astrological', rawScore: 30, weight: 1.0, reason: 'Mercury in Scorpio: private, selective communication' });
  } else if (planetInSign(input, 'Mercury', 'Capricorn')) {
    contributions.push({ source: 'astrological', rawScore: 40, weight: 0.9, reason: 'Mercury in Capricorn: reserved, purposeful communication' });
  } else if (planetInElement(input, 'Mercury', 'Air')) {
    contributions.push({ source: 'astrological', rawScore: 75, weight: 0.8, reason: 'Mercury in Air sign: open intellectual communication' });
  }

  // 3rd house planets: communication emphasis
  const thirdHousePlanets = planetsInHouse(input, 3);
  if (thirdHousePlanets.length > 0) {
    contributions.push({ source: 'astrological', rawScore: 65 + thirdHousePlanets.length * 5, weight: 0.6, reason: `${thirdHousePlanets.length} planet(s) in 3rd house: strong communication emphasis` });
  }

  // Sun in Gemini/Libra/Aquarius: communicative identity
  if (AIR_SIGNS.includes(input.sunSign)) {
    contributions.push({ source: 'astrological', rawScore: 70, weight: 0.5, reason: `Sun in ${input.sunSign}: communicative and social identity` });
  }

  // Moon in Air: emotionally communicative
  if (AIR_SIGNS.includes(input.moonSign)) {
    contributions.push({ source: 'astrological', rawScore: 65, weight: 0.4, reason: `Moon in ${input.moonSign}: emotionally expressive communication` });
  }

  if (contributions.length === 0) {
    contributions.push({ source: 'astrological', rawScore: 50, weight: 0.5, reason: 'Baseline communication openness' });
  }

  return contributions;
}

function communicationOpennessNumerology(input: NumerologyInput): TraitContribution[] {
  const contributions: TraitContribution[] = [];

  if (numMatches(input.lifePathNumber, [3, 5])) {
    contributions.push({ source: 'numerological', rawScore: 80, weight: 0.8, reason: `Life Path ${input.lifePathNumber}: naturally expressive and communicative` });
  } else if (input.lifePathNumber === 7) {
    contributions.push({ source: 'numerological', rawScore: 30, weight: 0.8, reason: 'Life Path 7: private, selective communication preference' });
  } else if (input.lifePathNumber === 11) {
    contributions.push({ source: 'numerological', rawScore: 65, weight: 0.7, reason: 'Life Path 11: intuitive communicator, but selectively open' });
  } else {
    contributions.push({ source: 'numerological', rawScore: 50, weight: 0.5, reason: `Life Path ${input.lifePathNumber}: moderate communication openness` });
  }

  // Personality number: how one presents to the world
  if (numMatches(input.personalityNumber, [3, 5])) {
    contributions.push({ source: 'numerological', rawScore: 75, weight: 0.5, reason: `Personality Number ${input.personalityNumber}: expressive outer persona` });
  }

  return contributions;
}

function communicationOpennessBehavioral(answers: QuestionnaireAnswer[]): TraitContribution[] {
  const avg = categoryAverage(answers, 'social');
  return [{
    source: 'behavioral',
    rawScore: avg,
    weight: 1.0,
    reason: `Behavioral communication openness: average of ${answers.filter(a => a.category === 'social').length} social answers = ${avg}`,
  }];
}

/**
 * 6. IMPULSIVENESS
 * Tendency to act on impulse without extensive deliberation.
 *
 * Astrological basis:
 * - Mars in Aries: impulsive action
 * - Uranus aspects: sudden, unpredictable actions
 * - Fire signs: quick reactions
 * - Saturn aspects: deliberation (reduces impulsiveness)
 *
 * Numerological basis:
 * - Life Path 5: freedom-loving, restless, impulsive
 * - Life Path 4: methodical, deliberate
 *
 * Behavioral basis:
 * - Behavioral category answers about decision-making speed
 */
function impulsivenessAstro(input: AstrologyInput): TraitContribution[] {
  const contributions: TraitContribution[] = [];

  // Mars in Aries: quintessential impulsiveness
  if (planetInSign(input, 'Mars', 'Aries')) {
    contributions.push({ source: 'astrological', rawScore: 92, weight: 1.0, reason: 'Mars in Aries: impulsive, quick-acting nature' });
  } else if (planetInSign(input, 'Mars', 'Gemini')) {
    contributions.push({ source: 'astrological', rawScore: 70, weight: 0.8, reason: 'Mars in Gemini: mentally restless, quick decisions' });
  } else if (planetInSign(input, 'Mars', 'Capricorn')) {
    contributions.push({ source: 'astrological', rawScore: 25, weight: 1.0, reason: 'Mars in Capricorn: deliberate, strategic action' });
  } else if (planetInSign(input, 'Mars', 'Taurus')) {
    contributions.push({ source: 'astrological', rawScore: 20, weight: 0.9, reason: 'Mars in Taurus: slow to act, deliberate' });
  } else if (planetInElement(input, 'Mars', 'Fire')) {
    contributions.push({ source: 'astrological', rawScore: 75, weight: 0.8, reason: 'Mars in Fire sign: quick, passionate action' });
  } else if (planetInElement(input, 'Mars', 'Earth')) {
    contributions.push({ source: 'astrological', rawScore: 30, weight: 0.8, reason: 'Mars in Earth sign: measured, deliberate action' });
  }

  // Uranus aspects: sudden, unpredictable impulses
  if (planetsConjunct(input, 'Uranus', 'Mars')) {
    contributions.push({ source: 'astrological', rawScore: 85, weight: 0.7, reason: 'Uranus-Mars conjunction: sudden, unpredictable impulses' });
  }
  if (planetsConjunct(input, 'Uranus', 'Moon')) {
    contributions.push({ source: 'astrological', rawScore: 72, weight: 0.6, reason: 'Uranus-Moon conjunction: emotionally impulsive reactions' });
  }

  // Saturn aspects reduce impulsiveness
  if (planetsConjunct(input, 'Saturn', 'Mars')) {
    contributions.push({ source: 'astrological', rawScore: 18, weight: 0.8, reason: 'Saturn-Mars conjunction: restrained, deliberate action' });
  }

  // Moon in Fire: emotionally reactive
  if (FIRE_SIGNS.includes(input.moonSign)) {
    contributions.push({ source: 'astrological', rawScore: 68, weight: 0.5, reason: `Moon in ${input.moonSign}: emotionally reactive and quick-responding` });
  }

  // Aries Ascendant: impulsive personality projection
  if (input.ascendant === 'Aries') {
    contributions.push({ source: 'astrological', rawScore: 75, weight: 0.6, reason: 'Aries ascendant: impulsive outward personality' });
  }

  if (contributions.length === 0) {
    contributions.push({ source: 'astrological', rawScore: 45, weight: 0.5, reason: 'Baseline impulsiveness' });
  }

  return contributions;
}

function impulsivenessNumerology(input: NumerologyInput): TraitContribution[] {
  const contributions: TraitContribution[] = [];

  if (input.lifePathNumber === 5) {
    contributions.push({ source: 'numerological', rawScore: 82, weight: 0.9, reason: 'Life Path 5: freedom-loving, spontaneous, impulsive' });
  } else if (input.lifePathNumber === 4) {
    contributions.push({ source: 'numerological', rawScore: 22, weight: 0.8, reason: 'Life Path 4: methodical, deliberate decision-making' });
  } else if (input.lifePathNumber === 1) {
    contributions.push({ source: 'numerological', rawScore: 65, weight: 0.7, reason: 'Life Path 1: bold and quick to act' });
  } else if (input.lifePathNumber === 8) {
    contributions.push({ source: 'numerological', rawScore: 40, weight: 0.7, reason: 'Life Path 8: strategic, calculated decisions' });
  } else {
    contributions.push({ source: 'numerological', rawScore: 48, weight: 0.5, reason: `Life Path ${input.lifePathNumber}: moderate impulsiveness` });
  }

  // Birthday number influence
  if (numMatches(input.birthdayNumber, [5, 9, 14, 23])) {
    contributions.push({ source: 'numerological', rawScore: 68, weight: 0.4, reason: `Birthday Number ${input.birthdayNumber}: quick-acting tendency` });
  }

  return contributions;
}

function impulsivenessBehavioral(answers: QuestionnaireAnswer[]): TraitContribution[] {
  const avg = categoryAverage(answers, 'behavioral');
  return [{
    source: 'behavioral',
    rawScore: avg,
    weight: 1.0,
    reason: `Behavioral impulsiveness: average of ${answers.filter(a => a.category === 'behavioral').length} behavioral answers = ${avg}`,
  }];
}

/**
 * 7. EMPATHY
 * Ability to understand and share the feelings of others.
 *
 * Astrological basis:
 * - Moon in Cancer/Pisces: deeply empathic
 * - Neptune aspects: compassionate sensitivity
 * - Venus in Water: emotional attunement
 * - 12th house emphasis: universal compassion
 *
 * Numerological basis:
 * - Life Path 2, 6, 9: empathic and compassionate
 * - Life Path 11: heightened sensitivity
 *
 * Behavioral basis:
 * - Emotional category answers about empathy and emotional response
 */
function empathyAstro(input: AstrologyInput): TraitContribution[] {
  const contributions: TraitContribution[] = [];

  // Moon in Water signs: deepest empathy
  if (input.moonSign === 'Cancer') {
    contributions.push({ source: 'astrological', rawScore: 88, weight: 1.0, reason: 'Moon in Cancer: naturally nurturing and empathic' });
  } else if (input.moonSign === 'Pisces') {
    contributions.push({ source: 'astrological', rawScore: 92, weight: 1.0, reason: 'Moon in Pisces: boundless empathy and compassion' });
  } else if (input.moonSign === 'Scorpio') {
    contributions.push({ source: 'astrological', rawScore: 78, weight: 0.9, reason: 'Moon in Scorpio: deep emotional understanding, selective empathy' });
  } else if (WATER_SIGNS.includes(input.moonSign)) {
    contributions.push({ source: 'astrological', rawScore: 78, weight: 0.8, reason: 'Moon in Water sign: emotionally attuned' });
  } else if (AIR_SIGNS.includes(input.moonSign)) {
    contributions.push({ source: 'astrological', rawScore: 40, weight: 0.7, reason: 'Moon in Air sign: cognitive rather than emotional empathy' });
  } else if (FIRE_SIGNS.includes(input.moonSign)) {
    contributions.push({ source: 'astrological', rawScore: 55, weight: 0.7, reason: 'Moon in Fire sign: warm but reactive empathy' });
  } else if (EARTH_SIGNS.includes(input.moonSign)) {
    contributions.push({ source: 'astrological', rawScore: 45, weight: 0.7, reason: 'Moon in Earth sign: practical, grounded empathy' });
  }

  // Neptune aspects: compassionate sensitivity
  if (planetsConjunct(input, 'Neptune', 'Moon')) {
    contributions.push({ source: 'astrological', rawScore: 88, weight: 0.8, reason: 'Moon-Neptune conjunction: profound empathic sensitivity' });
  }
  if (planetsConjunct(input, 'Neptune', 'Venus')) {
    contributions.push({ source: 'astrological', rawScore: 80, weight: 0.6, reason: 'Venus-Neptune conjunction: compassionate love and empathy' });
  }

  // Venus in Water: emotional attunement
  if (planetInElement(input, 'Venus', 'Water')) {
    contributions.push({ source: 'astrological', rawScore: 75, weight: 0.6, reason: 'Venus in Water sign: emotionally empathic in relationships' });
  }

  // 12th house planets: universal compassion
  const twelfthHousePlanets = planetsInHouse(input, 12);
  if (twelfthHousePlanets.length > 0) {
    contributions.push({ source: 'astrological', rawScore: 68 + twelfthHousePlanets.length * 5, weight: 0.5, reason: `${twelfthHousePlanets.length} planet(s) in 12th house: universal compassion` });
  }

  if (contributions.length === 0) {
    contributions.push({ source: 'astrological', rawScore: 50, weight: 0.5, reason: 'Baseline empathy' });
  }

  return contributions;
}

function empathyNumerology(input: NumerologyInput): TraitContribution[] {
  const contributions: TraitContribution[] = [];

  if (numMatches(input.lifePathNumber, [2, 6, 9])) {
    contributions.push({ source: 'numerological', rawScore: 80, weight: 0.9, reason: `Life Path ${input.lifePathNumber}: naturally empathic and compassionate` });
  } else if (input.lifePathNumber === 11) {
    contributions.push({ source: 'numerological', rawScore: 85, weight: 0.9, reason: 'Life Path 11: heightened emotional sensitivity and empathy' });
  } else if (numMatches(input.lifePathNumber, [1, 8])) {
    contributions.push({ source: 'numerological', rawScore: 38, weight: 0.7, reason: `Life Path ${input.lifePathNumber}: more self-focused, less naturally empathic` });
  } else {
    contributions.push({ source: 'numerological', rawScore: 50, weight: 0.5, reason: `Life Path ${input.lifePathNumber}: moderate empathy` });
  }

  // Soul Urge number: inner empathic drive
  if (numMatches(input.soulUrgeNumber, [2, 6, 9])) {
    contributions.push({ source: 'numerological', rawScore: 75, weight: 0.5, reason: `Soul Urge ${input.soulUrgeNumber}: inner desire to connect empathically` });
  }

  return contributions;
}

function empathyBehavioral(answers: QuestionnaireAnswer[]): TraitContribution[] {
  const avg = categoryAverage(answers, 'emotional');
  return [{
    source: 'behavioral',
    rawScore: avg,
    weight: 1.0,
    reason: `Behavioral empathy: average of ${answers.filter(a => a.category === 'emotional').length} emotional answers = ${avg}`,
  }];
}

/**
 * 8. RESILIENCE
 * Capacity to recover from setbacks and adapt to adversity.
 *
 * Astrological basis:
 * - Saturn strong: endurance and resilience built through challenge
 * - Mars in Scorpio/Capricorn: determined resilience
 * - Sun in Leo/Aries: strong will and recovery
 * - Benefic yogas: protective factors
 *
 * Numerological basis:
 * - Life Path 4, 8: resilient through discipline and power
 * - Life Path 9: resilient through acceptance
 * - Life Path 2: less resilient, more sensitive
 *
 * Behavioral basis:
 * - Behavioral category answers about coping and recovery
 */
function resilienceAstro(input: AstrologyInput): TraitContribution[] {
  const contributions: TraitContribution[] = [];

  // Saturn sign: endurance and life lessons
  if (planetInSign(input, 'Saturn', 'Capricorn')) {
    contributions.push({ source: 'astrological', rawScore: 88, weight: 1.0, reason: 'Saturn in Capricorn: maximum endurance and structured resilience' });
  } else if (planetInSign(input, 'Saturn', 'Aquarius')) {
    contributions.push({ source: 'astrological', rawScore: 80, weight: 0.9, reason: 'Saturn in Aquarius: resilient through intellectual detachment' });
  } else if (planetInSign(input, 'Saturn', 'Libra')) {
    contributions.push({ source: 'astrological', rawScore: 75, weight: 0.9, reason: 'Saturn in Libra: resilient through balance and fairness' });
  } else {
    // Saturn always contributes some resilience
    contributions.push({ source: 'astrological', rawScore: 65, weight: 0.7, reason: 'Saturn presence: builds resilience through life challenges' });
  }

  // Mars in Scorpio/Capricorn: determined resilience
  if (planetInSign(input, 'Mars', 'Scorpio')) {
    contributions.push({ source: 'astrological', rawScore: 85, weight: 0.8, reason: 'Mars in Scorpio: phoenix-like resilience, rises from adversity' });
  } else if (planetInSign(input, 'Mars', 'Capricorn')) {
    contributions.push({ source: 'astrological', rawScore: 82, weight: 0.8, reason: 'Mars in Capricorn: enduring, persistent resilience' });
  }

  // Sun in Leo/Aries: strong will and recovery
  if (input.sunSign === 'Leo') {
    contributions.push({ source: 'astrological', rawScore: 78, weight: 0.7, reason: 'Sun in Leo: strong willpower and recovery ability' });
  } else if (input.sunSign === 'Aries') {
    contributions.push({ source: 'astrological', rawScore: 72, weight: 0.7, reason: 'Sun in Aries: quick recovery and fighting spirit' });
  }

  // Benefic yogas: protective factors
  const beneficCount = beneficYogaCount(input);
  if (beneficCount > 0) {
    contributions.push({ source: 'astrological', rawScore: 65 + beneficCount * 5, weight: 0.3 * beneficCount, reason: `${beneficCount} benefic yoga(s): protective resilience factors` });
  }

  // Moon in Pisces/Cancer: emotional sensitivity reduces hardiness
  if (input.moonSign === 'Pisces' || input.moonSign === 'Cancer') {
    contributions.push({ source: 'astrological', rawScore: 38, weight: 0.5, reason: `Moon in ${input.moonSign}: emotional sensitivity can reduce hardiness` });
  }

  if (contributions.length === 0) {
    contributions.push({ source: 'astrological', rawScore: 50, weight: 0.5, reason: 'Baseline resilience' });
  }

  return contributions;
}

function resilienceNumerology(input: NumerologyInput): TraitContribution[] {
  const contributions: TraitContribution[] = [];

  if (numMatches(input.lifePathNumber, [4, 8])) {
    contributions.push({ source: 'numerological', rawScore: 82, weight: 0.9, reason: `Life Path ${input.lifePathNumber}: resilient through discipline and determination` });
  } else if (input.lifePathNumber === 9) {
    contributions.push({ source: 'numerological', rawScore: 75, weight: 0.8, reason: 'Life Path 9: resilient through acceptance and wisdom' });
  } else if (numMatches(input.lifePathNumber, [2, 6])) {
    contributions.push({ source: 'numerological', rawScore: 45, weight: 0.7, reason: `Life Path ${input.lifePathNumber}: emotionally sensitive, resilience through support` });
  } else if (input.lifePathNumber === 22) {
    contributions.push({ source: 'numerological', rawScore: 88, weight: 0.9, reason: 'Life Path 22: master builder with extraordinary resilience' });
  } else {
    contributions.push({ source: 'numerological', rawScore: 55, weight: 0.5, reason: `Life Path ${input.lifePathNumber}: moderate resilience` });
  }

  return contributions;
}

function resilienceBehavioral(answers: QuestionnaireAnswer[]): TraitContribution[] {
  const avg = categoryAverage(answers, 'behavioral');
  return [{
    source: 'behavioral',
    rawScore: avg,
    weight: 1.0,
    reason: `Behavioral resilience: average of ${answers.filter(a => a.category === 'behavioral').length} behavioral answers = ${avg}`,
  }];
}

/**
 * 9. CREATIVITY
 * Ability to generate novel ideas and think innovatively.
 *
 * Astrological basis:
 * - Neptune aspects: imagination and artistic vision
 * - Venus in Pisces: artistic sensitivity
 * - Uranus aspects: innovative, unconventional thinking
 * - 5th house emphasis: creative self-expression
 *
 * Numerological basis:
 * - Life Path 3: creative expression
 * - Life Path 5: innovative and versatile
 * - Life Path 9: artistic and visionary
 *
 * Behavioral basis:
 * - Composite of emotional + behavioral answers about creative pursuits
 */
function creativityAstro(input: AstrologyInput): TraitContribution[] {
  const contributions: TraitContribution[] = [];

  // Venus in Pisces: artistic excellence
  if (planetInSign(input, 'Venus', 'Pisces')) {
    contributions.push({ source: 'astrological', rawScore: 90, weight: 0.9, reason: 'Venus in Pisces: exalted artistic sensitivity and creativity' });
  } else if (planetInElement(input, 'Venus', 'Water')) {
    contributions.push({ source: 'astrological', rawScore: 75, weight: 0.8, reason: 'Venus in Water sign: emotionally driven creativity' });
  } else if (planetInSign(input, 'Venus', 'Libra')) {
    contributions.push({ source: 'astrological', rawScore: 72, weight: 0.8, reason: 'Venus in Libra: aesthetic and artistic sensibility' });
  } else if (planetInSign(input, 'Venus', 'Taurus')) {
    contributions.push({ source: 'astrological', rawScore: 68, weight: 0.7, reason: 'Venus in Taurus: sensory and tangible creativity' });
  }

  // Neptune aspects: imagination
  if (planetsConjunct(input, 'Neptune', 'Sun')) {
    contributions.push({ source: 'astrological', rawScore: 85, weight: 0.8, reason: 'Sun-Neptune conjunction: visionary creative identity' });
  }
  if (planetsConjunct(input, 'Neptune', 'Mercury')) {
    contributions.push({ source: 'astrological', rawScore: 80, weight: 0.7, reason: 'Mercury-Neptune conjunction: imaginative and poetic thinking' });
  }

  // Uranus aspects: innovative creativity
  if (planetsConjunct(input, 'Uranus', 'Sun')) {
    contributions.push({ source: 'astrological', rawScore: 78, weight: 0.7, reason: 'Sun-Uranus conjunction: innovative and unconventional creativity' });
  }
  if (planetsConjunct(input, 'Uranus', 'Mercury')) {
    contributions.push({ source: 'astrological', rawScore: 75, weight: 0.6, reason: 'Mercury-Uranus conjunction: brilliant, unconventional ideas' });
  }

  // 5th house planets: creative self-expression
  const fifthHousePlanets = planetsInHouse(input, 5);
  if (fifthHousePlanets.length > 0) {
    contributions.push({ source: 'astrological', rawScore: 65 + fifthHousePlanets.length * 7, weight: 0.6, reason: `${fifthHousePlanets.length} planet(s) in 5th house: strong creative expression` });
  }

  // Sun in Leo: creative self-expression
  if (input.sunSign === 'Leo') {
    contributions.push({ source: 'astrological', rawScore: 72, weight: 0.5, reason: 'Sun in Leo: dramatic creative self-expression' });
  } else if (input.sunSign === 'Pisces') {
    contributions.push({ source: 'astrological', rawScore: 75, weight: 0.5, reason: 'Sun in Pisces: artistic and visionary nature' });
  } else if (input.sunSign === 'Aquarius') {
    contributions.push({ source: 'astrological', rawScore: 70, weight: 0.5, reason: 'Sun in Aquarius: innovative and unconventional creativity' });
  }

  if (contributions.length === 0) {
    contributions.push({ source: 'astrological', rawScore: 45, weight: 0.5, reason: 'Baseline creativity' });
  }

  return contributions;
}

function creativityNumerology(input: NumerologyInput): TraitContribution[] {
  const contributions: TraitContribution[] = [];

  if (input.lifePathNumber === 3) {
    contributions.push({ source: 'numerological', rawScore: 88, weight: 0.9, reason: 'Life Path 3: natural creative expression and artistic talent' });
  } else if (input.lifePathNumber === 5) {
    contributions.push({ source: 'numerological', rawScore: 75, weight: 0.8, reason: 'Life Path 5: versatile and innovative creative thinking' });
  } else if (input.lifePathNumber === 9) {
    contributions.push({ source: 'numerological', rawScore: 72, weight: 0.8, reason: 'Life Path 9: visionary and artistic creativity' });
  } else if (input.lifePathNumber === 11) {
    contributions.push({ source: 'numerological', rawScore: 78, weight: 0.8, reason: 'Life Path 11: inspired, channel-like creative ability' });
  } else if (numMatches(input.lifePathNumber, [4, 8])) {
    contributions.push({ source: 'numerological', rawScore: 42, weight: 0.7, reason: `Life Path ${input.lifePathNumber}: practical rather than artistic creativity` });
  } else {
    contributions.push({ source: 'numerological', rawScore: 52, weight: 0.5, reason: `Life Path ${input.lifePathNumber}: moderate creativity` });
  }

  // Destiny number: creative career potential
  if (numMatches(input.destinyNumber, [3, 5, 9])) {
    contributions.push({ source: 'numerological', rawScore: 70, weight: 0.5, reason: `Destiny Number ${input.destinyNumber}: creative life direction` });
  }

  return contributions;
}

function creativityBehavioral(answers: QuestionnaireAnswer[]): TraitContribution[] {
  // Creativity draws from both emotional and behavioral categories
  const emotionalAvg = categoryAverage(answers, 'emotional');
  const behavioralAvg = categoryAverage(answers, 'behavioral');
  const blended = Math.round((emotionalAvg * 0.4 + behavioralAvg * 0.6));
  return [{
    source: 'behavioral',
    rawScore: clamp(blended, 0, 100),
    weight: 1.0,
    reason: `Behavioral creativity: blend of emotional (${emotionalAvg}) and behavioral (${behavioralAvg}) answers`,
  }];
}

/**
 * 10. INTUITION
 * Ability to understand things instinctively without conscious reasoning.
 *
 * Astrological basis:
 * - Moon in Pisces/Scorpio: strong intuition
 * - Neptune aspects: psychic sensitivity
 * - 12th house emphasis: subconscious awareness
 * - Water signs: intuitive perception
 *
 * Numerological basis:
 * - Life Path 7: analytical intuition, spiritual insight
 * - Life Path 11: master intuitive
 * - Life Path 2: receptive intuition
 *
 * Behavioral basis:
 * - Composite of emotional + social answers about intuitive decision-making
 */
function intuitionAstro(input: AstrologyInput): TraitContribution[] {
  const contributions: TraitContribution[] = [];

  // Moon in Pisces: strongest intuitive sign
  if (input.moonSign === 'Pisces') {
    contributions.push({ source: 'astrological', rawScore: 92, weight: 1.0, reason: 'Moon in Pisces: strongest intuitive and psychic sensitivity' });
  } else if (input.moonSign === 'Scorpio') {
    contributions.push({ source: 'astrological', rawScore: 85, weight: 0.9, reason: 'Moon in Scorpio: penetrating intuition and perception' });
  } else if (input.moonSign === 'Cancer') {
    contributions.push({ source: 'astrological', rawScore: 78, weight: 0.9, reason: 'Moon in Cancer: emotional intuition and gut feelings' });
  } else if (WATER_SIGNS.includes(input.moonSign)) {
    contributions.push({ source: 'astrological', rawScore: 75, weight: 0.8, reason: 'Moon in Water sign: naturally intuitive' });
  } else if (EARTH_SIGNS.includes(input.moonSign)) {
    contributions.push({ source: 'astrological', rawScore: 42, weight: 0.7, reason: 'Moon in Earth sign: practical rather than intuitive' });
  } else if (AIR_SIGNS.includes(input.moonSign)) {
    contributions.push({ source: 'astrological', rawScore: 45, weight: 0.7, reason: 'Moon in Air sign: intellectual rather than intuitive' });
  } else if (FIRE_SIGNS.includes(input.moonSign)) {
    contributions.push({ source: 'astrological', rawScore: 58, weight: 0.7, reason: 'Moon in Fire sign: instinctive, gut-level knowing' });
  }

  // Neptune aspects: psychic sensitivity
  if (planetsConjunct(input, 'Neptune', 'Moon')) {
    contributions.push({ source: 'astrological', rawScore: 90, weight: 0.8, reason: 'Moon-Neptune conjunction: heightened psychic intuition' });
  }
  if (planetsConjunct(input, 'Neptune', 'Mercury')) {
    contributions.push({ source: 'astrological', rawScore: 80, weight: 0.6, reason: 'Mercury-Neptune conjunction: intuitive thinking and channeling' });
  }

  // 12th house emphasis: subconscious awareness
  const twelfthHousePlanets = planetsInHouse(input, 12);
  if (twelfthHousePlanets.length > 0) {
    contributions.push({ source: 'astrological', rawScore: 70 + twelfthHousePlanets.length * 5, weight: 0.6, reason: `${twelfthHousePlanets.length} planet(s) in 12th house: deep subconscious awareness` });
  }

  // Nakshatra influence
  if (input.nakshatra) {
    const intuitiveNakshatras = ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Jyeshtha', 'Moola', 'Shatabhisha', 'Revati'];
    if (intuitiveNakshatras.includes(input.nakshatra.name)) {
      contributions.push({ source: 'astrological', rawScore: 72, weight: 0.4, reason: `Nakshatra ${input.nakshatra.name}: intuitive nakshatra influence` });
    }
  }

  if (contributions.length === 0) {
    contributions.push({ source: 'astrological', rawScore: 45, weight: 0.5, reason: 'Baseline intuition' });
  }

  return contributions;
}

function intuitionNumerology(input: NumerologyInput): TraitContribution[] {
  const contributions: TraitContribution[] = [];

  if (input.lifePathNumber === 7) {
    contributions.push({ source: 'numerological', rawScore: 85, weight: 0.9, reason: 'Life Path 7: deep intuitive and analytical insight' });
  } else if (input.lifePathNumber === 11) {
    contributions.push({ source: 'numerological', rawScore: 92, weight: 0.9, reason: 'Life Path 11: master intuitive number' });
  } else if (input.lifePathNumber === 2) {
    contributions.push({ source: 'numerological', rawScore: 72, weight: 0.8, reason: 'Life Path 2: receptive and intuitive nature' });
  } else if (input.lifePathNumber === 22) {
    contributions.push({ source: 'numerological', rawScore: 75, weight: 0.7, reason: 'Life Path 22: master builder with intuitive vision' });
  } else if (numMatches(input.lifePathNumber, [1, 4])) {
    contributions.push({ source: 'numerological', rawScore: 35, weight: 0.7, reason: `Life Path ${input.lifePathNumber}: more analytical than intuitive` });
  } else {
    contributions.push({ source: 'numerological', rawScore: 50, weight: 0.5, reason: `Life Path ${input.lifePathNumber}: moderate intuition` });
  }

  // Soul Urge: inner intuitive drive
  if (numMatches(input.soulUrgeNumber, [2, 7, 11])) {
    contributions.push({ source: 'numerological', rawScore: 78, weight: 0.5, reason: `Soul Urge ${input.soulUrgeNumber}: inner intuitive calling` });
  }

  return contributions;
}

function intuitionBehavioral(answers: QuestionnaireAnswer[]): TraitContribution[] {
  // Intuition blends emotional and social categories
  const emotionalAvg = categoryAverage(answers, 'emotional');
  const socialAvg = categoryAverage(answers, 'social');
  const blended = Math.round((emotionalAvg * 0.6 + socialAvg * 0.4));
  return [{
    source: 'behavioral',
    rawScore: clamp(blended, 0, 100),
    weight: 1.0,
    reason: `Behavioral intuition: blend of emotional (${emotionalAvg}) and social (${socialAvg}) answers`,
  }];
}

/**
 * 11. DISCIPLINE
 * Ability to maintain focus, routines, and self-control.
 *
 * Astrological basis:
 * - Saturn strong: discipline and structure
 * - Mars in Earth: disciplined action
 * - Virgo emphasis: detail-oriented discipline
 * - Fixed signs: persistence and consistency
 *
 * Numerological basis:
 * - Life Path 4: methodical discipline
 * - Life Path 8: executive discipline
 * - Life Path 5: freedom-loving, less disciplined
 *
 * Behavioral basis:
 * - Behavioral category answers about routines and self-control
 */
function disciplineAstro(input: AstrologyInput): TraitContribution[] {
  const contributions: TraitContribution[] = [];

  // Saturn sign: discipline archetype
  if (planetInSign(input, 'Saturn', 'Capricorn')) {
    contributions.push({ source: 'astrological', rawScore: 92, weight: 1.0, reason: 'Saturn in Capricorn: ultimate discipline and structure' });
  } else if (planetInSign(input, 'Saturn', 'Virgo')) {
    contributions.push({ source: 'astrological', rawScore: 85, weight: 0.9, reason: 'Saturn in Virgo: detail-oriented discipline and precision' });
  } else if (planetInSign(input, 'Saturn', 'Aquarius')) {
    contributions.push({ source: 'astrological', rawScore: 78, weight: 0.8, reason: 'Saturn in Aquarius: systematic discipline with innovation' });
  } else {
    contributions.push({ source: 'astrological', rawScore: 65, weight: 0.7, reason: 'Saturn presence: builds discipline through structure' });
  }

  // Mars in Earth: disciplined action
  if (planetInElement(input, 'Mars', 'Earth')) {
    contributions.push({ source: 'astrological', rawScore: 80, weight: 0.7, reason: 'Mars in Earth sign: disciplined and methodical action' });
  } else if (planetInSign(input, 'Mars', 'Aries')) {
    contributions.push({ source: 'astrological', rawScore: 35, weight: 0.7, reason: 'Mars in Aries: impatient, low discipline in execution' });
  }

  // Virgo emphasis
  if (input.sunSign === 'Virgo') {
    contributions.push({ source: 'astrological', rawScore: 80, weight: 0.7, reason: 'Sun in Virgo: naturally disciplined and detail-oriented' });
  }
  if (input.moonSign === 'Virgo') {
    contributions.push({ source: 'astrological', rawScore: 75, weight: 0.6, reason: 'Moon in Virgo: emotionally needs order and routine' });
  }

  // Fixed signs: persistence
  if (FIXED_SIGNS.includes(input.ascendant)) {
    contributions.push({ source: 'astrological', rawScore: 68, weight: 0.4, reason: 'Fixed ascendant: persistent and consistent nature' });
  }

  // 6th house emphasis: daily discipline
  const sixthHousePlanets = planetsInHouse(input, 6);
  if (sixthHousePlanets.length > 0) {
    contributions.push({ source: 'astrological', rawScore: 65 + sixthHousePlanets.length * 5, weight: 0.5, reason: `${sixthHousePlanets.length} planet(s) in 6th house: emphasis on daily routines and discipline` });
  }

  if (contributions.length === 0) {
    contributions.push({ source: 'astrological', rawScore: 45, weight: 0.5, reason: 'Baseline discipline' });
  }

  return contributions;
}

function disciplineNumerology(input: NumerologyInput): TraitContribution[] {
  const contributions: TraitContribution[] = [];

  if (input.lifePathNumber === 4) {
    contributions.push({ source: 'numerological', rawScore: 88, weight: 0.9, reason: 'Life Path 4: methodical, structured discipline' });
  } else if (input.lifePathNumber === 8) {
    contributions.push({ source: 'numerological', rawScore: 82, weight: 0.9, reason: 'Life Path 8: executive discipline and self-control' });
  } else if (input.lifePathNumber === 5) {
    contributions.push({ source: 'numerological', rawScore: 30, weight: 0.8, reason: 'Life Path 5: freedom-loving, resists routine and discipline' });
  } else if (input.lifePathNumber === 3) {
    contributions.push({ source: 'numerological', rawScore: 38, weight: 0.7, reason: 'Life Path 3: creative freedom over structured discipline' });
  } else {
    contributions.push({ source: 'numerological', rawScore: 52, weight: 0.5, reason: `Life Path ${input.lifePathNumber}: moderate discipline` });
  }

  return contributions;
}

function disciplineBehavioral(answers: QuestionnaireAnswer[]): TraitContribution[] {
  const avg = categoryAverage(answers, 'behavioral');
  return [{
    source: 'behavioral',
    rawScore: avg,
    weight: 1.0,
    reason: `Behavioral discipline: average of ${answers.filter(a => a.category === 'behavioral').length} behavioral answers = ${avg}`,
  }];
}

/**
 * 12. SOCIAL ENERGY
 * Desire for and energy derived from social interaction.
 *
 * Astrological basis:
 * - Sun in Leo/Libra/Gemini: socially energized
 * - 11th house emphasis: social networks
 * - Air signs: social and communicative
 * - Moon in Air: emotionally social
 *
 * Numerological basis:
 * - Life Path 3, 5: socially energized
 * - Life Path 7: solitary, introspective
 *
 * Behavioral basis:
 * - Social category answers about social preference
 */
function socialEnergyAstro(input: AstrologyInput): TraitContribution[] {
  const contributions: TraitContribution[] = [];

  // Sun sign social energy
  if (input.sunSign === 'Leo') {
    contributions.push({ source: 'astrological', rawScore: 85, weight: 0.8, reason: 'Sun in Leo: thrives on social attention and connection' });
  } else if (input.sunSign === 'Libra') {
    contributions.push({ source: 'astrological', rawScore: 82, weight: 0.8, reason: 'Sun in Libra: socially oriented, needs partnership' });
  } else if (input.sunSign === 'Gemini') {
    contributions.push({ source: 'astrological', rawScore: 80, weight: 0.8, reason: 'Sun in Gemini: socially curious and communicative' });
  } else if (input.sunSign === 'Sagittarius') {
    contributions.push({ source: 'astrological', rawScore: 75, weight: 0.7, reason: 'Sun in Sagittarius: gregarious and adventurous socially' });
  } else if (input.sunSign === 'Capricorn' || input.sunSign === 'Virgo') {
    contributions.push({ source: 'astrological', rawScore: 42, weight: 0.7, reason: `Sun in ${input.sunSign}: selective and purposeful social engagement` });
  } else if (input.sunSign === 'Scorpio') {
    contributions.push({ source: 'astrological', rawScore: 35, weight: 0.7, reason: 'Sun in Scorpio: private, prefers deep connections over breadth' });
  }

  // Moon in Air: emotionally social
  if (AIR_SIGNS.includes(input.moonSign)) {
    contributions.push({ source: 'astrological', rawScore: 75, weight: 0.6, reason: `Moon in ${input.moonSign}: emotionally energized by social interaction` });
  } else if (WATER_SIGNS.includes(input.moonSign)) {
    contributions.push({ source: 'astrological', rawScore: 40, weight: 0.6, reason: `Moon in ${input.moonSign}: emotionally drained by large social settings` });
  }

  // 11th house emphasis: social networks
  const eleventhHousePlanets = planetsInHouse(input, 11);
  if (eleventhHousePlanets.length > 0) {
    contributions.push({ source: 'astrological', rawScore: 68 + eleventhHousePlanets.length * 6, weight: 0.6, reason: `${eleventhHousePlanets.length} planet(s) in 11th house: strong social network emphasis` });
  }

  // Ascendant in Air: socially oriented personality
  if (AIR_SIGNS.includes(input.ascendant)) {
    contributions.push({ source: 'astrological', rawScore: 72, weight: 0.5, reason: `${input.ascendant} ascendant: socially oriented personality` });
  }

  // Venus in Libra or Gemini: social Venus
  if (planetInSign(input, 'Venus', 'Libra')) {
    contributions.push({ source: 'astrological', rawScore: 78, weight: 0.5, reason: 'Venus in Libra: loves social harmony and partnership' });
  }

  if (contributions.length === 0) {
    contributions.push({ source: 'astrological', rawScore: 48, weight: 0.5, reason: 'Baseline social energy' });
  }

  return contributions;
}

function socialEnergyNumerology(input: NumerologyInput): TraitContribution[] {
  const contributions: TraitContribution[] = [];

  if (numMatches(input.lifePathNumber, [3, 5])) {
    contributions.push({ source: 'numerological', rawScore: 82, weight: 0.9, reason: `Life Path ${input.lifePathNumber}: socially vibrant and energized` });
  } else if (input.lifePathNumber === 7) {
    contributions.push({ source: 'numerological', rawScore: 25, weight: 0.8, reason: 'Life Path 7: introspective, prefers solitude' });
  } else if (input.lifePathNumber === 6) {
    contributions.push({ source: 'numerological', rawScore: 65, weight: 0.7, reason: 'Life Path 6: socially nurturing, family-oriented' });
  } else if (input.lifePathNumber === 1) {
    contributions.push({ source: 'numerological', rawScore: 55, weight: 0.7, reason: 'Life Path 1: independent but can be socially commanding' });
  } else {
    contributions.push({ source: 'numerological', rawScore: 50, weight: 0.5, reason: `Life Path ${input.lifePathNumber}: moderate social energy` });
  }

  return contributions;
}

function socialEnergyBehavioral(answers: QuestionnaireAnswer[]): TraitContribution[] {
  const avg = categoryAverage(answers, 'social');
  return [{
    source: 'behavioral',
    rawScore: avg,
    weight: 1.0,
    reason: `Behavioral social energy: average of ${answers.filter(a => a.category === 'social').length} social answers = ${avg}`,
  }];
}

/**
 * 13. PATIENCE
 * Ability to wait, endure delays, and remain calm under pressure.
 *
 * Astrological basis:
 * - Taurus/Virgo Moon: patient and steady
 * - Saturn aspects: patient through discipline
 * - Mars in Aries: impatience
 * - Earth signs: naturally patient
 *
 * Numerological basis:
 * - Life Path 4, 6: patient and enduring
 * - Life Path 5: restless, impatient
 *
 * Behavioral basis:
 * - Behavioral category answers about patience and waiting
 */
function patienceAstro(input: AstrologyInput): TraitContribution[] {
  const contributions: TraitContribution[] = [];

  // Moon in Taurus: quintessential patience
  if (input.moonSign === 'Taurus') {
    contributions.push({ source: 'astrological', rawScore: 90, weight: 1.0, reason: 'Moon in Taurus: exceptional patience and steadiness' });
  } else if (input.moonSign === 'Virgo') {
    contributions.push({ source: 'astrological', rawScore: 78, weight: 0.9, reason: 'Moon in Virgo: patient through attention to process' });
  } else if (input.moonSign === 'Capricorn') {
    contributions.push({ source: 'astrological', rawScore: 82, weight: 0.9, reason: 'Moon in Capricorn: patient through long-term vision' });
  } else if (input.moonSign === 'Aries') {
    contributions.push({ source: 'astrological', rawScore: 20, weight: 1.0, reason: 'Moon in Aries: emotionally impatient and restless' });
  } else if (input.moonSign === 'Gemini') {
    contributions.push({ source: 'astrological', rawScore: 32, weight: 0.8, reason: 'Moon in Gemini: mentally restless, low patience for routine' });
  } else if (EARTH_SIGNS.includes(input.moonSign)) {
    contributions.push({ source: 'astrological', rawScore: 78, weight: 0.8, reason: `Moon in ${input.moonSign}: naturally patient and steady` });
  } else if (FIRE_SIGNS.includes(input.moonSign)) {
    contributions.push({ source: 'astrological', rawScore: 30, weight: 0.7, reason: `Moon in ${input.moonSign}: emotionally impatient` });
  }

  // Saturn aspects: patient through discipline
  if (planetInSign(input, 'Saturn', 'Capricorn') || planetInSign(input, 'Saturn', 'Taurus')) {
    contributions.push({ source: 'astrological', rawScore: 85, weight: 0.8, reason: `Saturn in ${input.planetaryPositions.find(p => p.planet === 'Saturn')?.sign}: exceptional patience through discipline` });
  }

  // Mars in Aries: quintessential impatience
  if (planetInSign(input, 'Mars', 'Aries')) {
    contributions.push({ source: 'astrological', rawScore: 15, weight: 0.9, reason: 'Mars in Aries: extreme impatience and urgency' });
  } else if (planetInSign(input, 'Mars', 'Taurus')) {
    contributions.push({ source: 'astrological', rawScore: 82, weight: 0.8, reason: 'Mars in Taurus: extremely patient and persistent' });
  } else if (planetInElement(input, 'Mars', 'Earth')) {
    contributions.push({ source: 'astrological', rawScore: 75, weight: 0.7, reason: 'Mars in Earth sign: patient and methodical action' });
  }

  // Fixed signs: persistent patience
  if (FIXED_SIGNS.includes(input.ascendant)) {
    contributions.push({ source: 'astrological', rawScore: 70, weight: 0.4, reason: 'Fixed ascendant: persistent and enduring patience' });
  }

  if (contributions.length === 0) {
    contributions.push({ source: 'astrological', rawScore: 48, weight: 0.5, reason: 'Baseline patience' });
  }

  return contributions;
}

function patienceNumerology(input: NumerologyInput): TraitContribution[] {
  const contributions: TraitContribution[] = [];

  if (numMatches(input.lifePathNumber, [4, 6])) {
    contributions.push({ source: 'numerological', rawScore: 80, weight: 0.9, reason: `Life Path ${input.lifePathNumber}: patient and enduring` });
  } else if (input.lifePathNumber === 5) {
    contributions.push({ source: 'numerological', rawScore: 25, weight: 0.8, reason: 'Life Path 5: restless and impatient with delays' });
  } else if (input.lifePathNumber === 1) {
    contributions.push({ source: 'numerological', rawScore: 38, weight: 0.7, reason: 'Life Path 1: results-oriented, low patience for obstacles' });
  } else if (input.lifePathNumber === 9) {
    contributions.push({ source: 'numerological', rawScore: 68, weight: 0.7, reason: 'Life Path 9: patient through wisdom and acceptance' });
  } else {
    contributions.push({ source: 'numerological', rawScore: 52, weight: 0.5, reason: `Life Path ${input.lifePathNumber}: moderate patience` });
  }

  return contributions;
}

function patienceBehavioral(answers: QuestionnaireAnswer[]): TraitContribution[] {
  const avg = categoryAverage(answers, 'behavioral');
  return [{
    source: 'behavioral',
    rawScore: avg,
    weight: 1.0,
    reason: `Behavioral patience: average of ${answers.filter(a => a.category === 'behavioral').length} behavioral answers = ${avg}`,
  }];
}

/**
 * 14. ADAPTABILITY
 * Ease of adjusting to new conditions and embracing change.
 *
 * Astrological basis:
 * - Mutable signs: naturally adaptable
 * - Uranus aspects: embraces change
 * - Gemini/Sagittarius: flexible and adventurous
 * - Fixed signs: resists change (lower adaptability)
 *
 * Numerological basis:
 * - Life Path 5: most adaptable number
 * - Life Path 4: prefers stability
 *
 * Behavioral basis:
 * - Composite of behavioral + social answers about adaptability
 */
function adaptabilityAstro(input: AstrologyInput): TraitContribution[] {
  const contributions: TraitContribution[] = [];

  // Mutable signs: naturally adaptable
  if (MUTABLE_SIGNS.includes(input.sunSign)) {
    contributions.push({ source: 'astrological', rawScore: 78, weight: 0.7, reason: `Sun in ${input.sunSign} (Mutable): naturally adaptable to change` });
  }
  if (MUTABLE_SIGNS.includes(input.moonSign)) {
    contributions.push({ source: 'astrological', rawScore: 75, weight: 0.7, reason: `Moon in ${input.moonSign} (Mutable): emotionally adaptable` });
  }
  if (MUTABLE_SIGNS.includes(input.ascendant)) {
    contributions.push({ source: 'astrological', rawScore: 70, weight: 0.5, reason: `${input.ascendant} ascendant (Mutable): adaptable personality projection` });
  }

  // Fixed signs: resists change
  if (FIXED_SIGNS.includes(input.sunSign)) {
    contributions.push({ source: 'astrological', rawScore: 32, weight: 0.7, reason: `Sun in ${input.sunSign} (Fixed): resists change, prefers stability` });
  }
  if (FIXED_SIGNS.includes(input.moonSign)) {
    contributions.push({ source: 'astrological', rawScore: 35, weight: 0.6, reason: `Moon in ${input.moonSign} (Fixed): emotionally resists change` });
  }

  // Gemini/Sagittarius: especially flexible
  if (input.sunSign === 'Gemini') {
    contributions.push({ source: 'astrological', rawScore: 85, weight: 0.6, reason: 'Sun in Gemini: extremely flexible and versatile' });
  } else if (input.sunSign === 'Sagittarius') {
    contributions.push({ source: 'astrological', rawScore: 80, weight: 0.6, reason: 'Sun in Sagittarius: adaptable through adventure and exploration' });
  }

  // Uranus aspects: embraces change
  if (planetsConjunct(input, 'Uranus', 'Sun')) {
    contributions.push({ source: 'astrological', rawScore: 85, weight: 0.7, reason: 'Sun-Uranus conjunction: thrives on change and innovation' });
  }
  if (planetsConjunct(input, 'Uranus', 'Moon')) {
    contributions.push({ source: 'astrological', rawScore: 78, weight: 0.6, reason: 'Moon-Uranus conjunction: emotionally embraces change' });
  }

  // Mercury in Gemini: mentally flexible
  if (planetInSign(input, 'Mercury', 'Gemini')) {
    contributions.push({ source: 'astrological', rawScore: 80, weight: 0.5, reason: 'Mercury in Gemini: mentally versatile and adaptable' });
  }

  if (contributions.length === 0) {
    contributions.push({ source: 'astrological', rawScore: 48, weight: 0.5, reason: 'Baseline adaptability' });
  }

  return contributions;
}

function adaptabilityNumerology(input: NumerologyInput): TraitContribution[] {
  const contributions: TraitContribution[] = [];

  if (input.lifePathNumber === 5) {
    contributions.push({ source: 'numerological', rawScore: 90, weight: 0.9, reason: 'Life Path 5: most adaptable number, thrives on change' });
  } else if (input.lifePathNumber === 4) {
    contributions.push({ source: 'numerological', rawScore: 28, weight: 0.8, reason: 'Life Path 4: prefers stability and routine, low adaptability' });
  } else if (input.lifePathNumber === 3) {
    contributions.push({ source: 'numerological', rawScore: 72, weight: 0.7, reason: 'Life Path 3: flexible and adaptable through creativity' });
  } else if (input.lifePathNumber === 7) {
    contributions.push({ source: 'numerological', rawScore: 55, weight: 0.7, reason: 'Life Path 7: adaptable intellectually but emotionally settled' });
  } else if (numMatches(input.lifePathNumber, [1, 8])) {
    contributions.push({ source: 'numerological', rawScore: 45, weight: 0.7, reason: `Life Path ${input.lifePathNumber}: determined focus, moderate adaptability` });
  } else {
    contributions.push({ source: 'numerological', rawScore: 52, weight: 0.5, reason: `Life Path ${input.lifePathNumber}: moderate adaptability` });
  }

  return contributions;
}

function adaptabilityBehavioral(answers: QuestionnaireAnswer[]): TraitContribution[] {
  // Adaptability draws from behavioral and social categories
  const behavioralAvg = categoryAverage(answers, 'behavioral');
  const socialAvg = categoryAverage(answers, 'social');
  const blended = Math.round((behavioralAvg * 0.6 + socialAvg * 0.4));
  return [{
    source: 'behavioral',
    rawScore: clamp(blended, 0, 100),
    weight: 1.0,
    reason: `Behavioral adaptability: blend of behavioral (${behavioralAvg}) and social (${socialAvg}) answers`,
  }];
}

// ═══════════════════════════════════════════════════════════════════════════
// RULE REGISTRY
// ═══════════════════════════════════════════════════════════════════════════

export interface TraitRuleSet {
  traitId: TraitId;
  astrological: (input: AstrologyInput) => TraitContribution[];
  numerological: (input: NumerologyInput) => TraitContribution[];
  behavioral: (answers: QuestionnaireAnswer[]) => TraitContribution[];
}

/**
 * Complete registry of all trait scoring rules.
 * Each trait has three rule functions: astrological, numerological, and behavioral.
 */
export const TRAIT_RULES: Record<TraitId, TraitRuleSet> = {
  emotionalIntensity: {
    traitId: 'emotionalIntensity',
    astrological: emotionalIntensityAstro,
    numerological: emotionalIntensityNumerology,
    behavioral: emotionalIntensityBehavioral,
  },
  attachmentStyle: {
    traitId: 'attachmentStyle',
    astrological: attachmentStyleAstro,
    numerological: attachmentStyleNumerology,
    behavioral: attachmentStyleBehavioral,
  },
  ambition: {
    traitId: 'ambition',
    astrological: ambitionAstro,
    numerological: ambitionNumerology,
    behavioral: ambitionBehavioral,
  },
  trust: {
    traitId: 'trust',
    astrological: trustAstro,
    numerological: trustNumerology,
    behavioral: trustBehavioral,
  },
  communicationOpenness: {
    traitId: 'communicationOpenness',
    astrological: communicationOpennessAstro,
    numerological: communicationOpennessNumerology,
    behavioral: communicationOpennessBehavioral,
  },
  impulsiveness: {
    traitId: 'impulsiveness',
    astrological: impulsivenessAstro,
    numerological: impulsivenessNumerology,
    behavioral: impulsivenessBehavioral,
  },
  empathy: {
    traitId: 'empathy',
    astrological: empathyAstro,
    numerological: empathyNumerology,
    behavioral: empathyBehavioral,
  },
  resilience: {
    traitId: 'resilience',
    astrological: resilienceAstro,
    numerological: resilienceNumerology,
    behavioral: resilienceBehavioral,
  },
  creativity: {
    traitId: 'creativity',
    astrological: creativityAstro,
    numerological: creativityNumerology,
    behavioral: creativityBehavioral,
  },
  intuition: {
    traitId: 'intuition',
    astrological: intuitionAstro,
    numerological: intuitionNumerology,
    behavioral: intuitionBehavioral,
  },
  discipline: {
    traitId: 'discipline',
    astrological: disciplineAstro,
    numerological: disciplineNumerology,
    behavioral: disciplineBehavioral,
  },
  socialEnergy: {
    traitId: 'socialEnergy',
    astrological: socialEnergyAstro,
    numerological: socialEnergyNumerology,
    behavioral: socialEnergyBehavioral,
  },
  patience: {
    traitId: 'patience',
    astrological: patienceAstro,
    numerological: patienceNumerology,
    behavioral: patienceBehavioral,
  },
  adaptability: {
    traitId: 'adaptability',
    astrological: adaptabilityAstro,
    numerological: adaptabilityNumerology,
    behavioral: adaptabilityBehavioral,
  },
};
