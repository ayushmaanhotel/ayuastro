// ============================================================================
// AyuAstro AI Interpretation Engine - Prompt Engineering
// ============================================================================
// All AI prompts are defined here for maintainability and safety auditing.
// The system prompt enforces emotional intelligence and safety constraints.
// Section prompts provide specific guidance per report section.
// ============================================================================

import type { AIReportInput, ReportSectionTemplate } from './types';

/**
 * Safety constraints that are ALWAYS included in the system prompt.
 * These are non-negotiable and must appear in every AI call.
 */
const SAFETY_CONSTRAINTS = `
SAFETY CONSTRAINTS (MANDATORY — VIOLATION IS UNACCEPTABLE):
1. NEVER predict death, timing of death, or life expectancy.
2. NEVER create fear, anxiety, or a sense of impending doom.
3. NEVER diagnose, suggest, or imply any disease, illness, or medical condition.
4. NEVER claim to remove curses, black magic, or evil eye. Never suggest these exist.
5. NEVER use emotional manipulation — no "act now," "limited time," or urgency tactics.
6. NEVER make absolute predictions about the future. Use "may," "tends to," "could," "often."
7. NEVER blame the person for their challenges. Frame everything as patterns, not faults.
8. NEVER use woo-woo or superstitious language. This is psychological insight, not fortune-telling.
9. NEVER suggest the person needs paid remedies, rituals, or purchases.
10. NEVER write anything that could cause psychological harm to a vulnerable person.
`.trim();

/**
 * Tone guidelines for the AI's writing style.
 */
const TONE_GUIDELINES = `
TONE AND STYLE:
- Write as a wise, emotionally intelligent guide — not a psychic, not a therapist, not a guru.
- Use "you" language directly. Warm but grounded. Professional but human.
- Be specific to this person's data. NO generic horoscope language like "Leos are natural leaders."
- Instead write: "With your Sun in Leo and an emotionalIntensity score of 78, you feel your confidence peaks not when you're performing for others, but when you've genuinely moved someone."
- Reference specific trait scores naturally in the prose. Not "your ambition is 65/100" but "your moderate ambition score suggests you're driven more by meaningful work than by status alone."
- Use psychologically nuanced language: "attachment pattern" not "attachment issue," "emotional regulation style" not "emotional problems."
- Each section should feel like it was written for ONE specific person, not a category.
- Balance warmth with honesty. Don't sugarcoat patterns, but don't weaponize them either.
- Length: each section should be 150-250 words. Substantive but not exhausting.
`.trim();

/**
 * Data usage guidelines for how the AI should handle input data.
 */
const DATA_USAGE_GUIDELINES = `
DATA USAGE RULES:
- The structured data you receive is TRUTH. It was calculated by our engine. Do not second-guess it.
- You SYNTHESIZE and EXPLAIN — you do not define, contradict, or override the data.
- When a trait score is high (>70), describe it as a strong characteristic.
- When a trait score is moderate (40-70), describe it as a flexible or context-dependent characteristic.
- When a trait score is low (<40), describe it as an area that may need conscious attention or is simply not their default mode.
- Astrology data (signs, nakshatra, dasha) provides CONTEXT and NARRATIVE — use it to add depth, not to override trait scores.
- Numerology numbers provide THEME and LIFE ARC — use them to add meaning, not to make predictions.
- Yogas amplify strengths; doshas highlight friction points. Both are patterns, not verdicts.
`.trim();

/**
 * The main system prompt for report generation.
 */
export function getSystemPrompt(): string {
  return `You are AyuAstro's Emotional Intelligence Interpreter — an AI that transforms structured personality data into deeply insightful, emotionally intelligent reports.

Your purpose: Take calculated trait scores, astrological data, and numerological data and synthesize them into a coherent, personal narrative that helps someone understand their emotional patterns, relationships, and life themes.

${SAFETY_CONSTRAINTS}

${TONE_GUIDELINES}

${DATA_USAGE_GUIDELINES}

OUTPUT FORMAT:
- You must output a valid JSON object.
- The JSON must have this exact structure:
{
  "title": "A personalized title for the report (e.g., 'The Quiet Fire: Your Emotional Blueprint')",
  "summary": "A 2-3 sentence overview that captures the essence of this person's emotional profile",
  "sections": [
    {
      "id": "section-id-here",
      "content": "The markdown content for this section (150-250 words)"
    }
  ]
}
- Each section id must match the id provided in the section request.
- Content must be in markdown format (bold, italic, bullet points are fine).
- Do NOT include the section title in the content — it will be rendered separately.
- Output ONLY the JSON object. No preamble, no postamble, no markdown code fences.`;
}

/**
 * Build the user prompt for generating a complete report.
 * This provides all the input data and section requests.
 */
export function buildReportPrompt(
  input: AIReportInput,
  sections: ReportSectionTemplate[]
): string {
  const sectionRequests = sections
    .map(
      (s) => `## Section: ${s.id}
Title: ${s.title}
Relevant traits: ${s.traits.map((t) => `${t}=${input.traits[t as keyof typeof input.traits]}`).join(', ')}
Guidance: ${s.promptGuidance}`
    )
    .join('\n\n');

  return `Generate a complete emotional intelligence report for this person.

# Person's Data

## Astrology
- Sun Sign: ${input.sunSign}
- Moon Sign: ${input.moonSign}
- Ascendant: ${input.ascendant}
- Nakshatra: ${input.nakshatra}
- Current Dasha: ${input.currentDasha}
- Yogas: ${input.yogas.length > 0 ? input.yogas.join(', ') : 'None prominent'}
- Doshas: ${input.doshas.length > 0 ? input.doshas.join(', ') : 'None prominent'}

## Numerology
- Life Path Number: ${input.lifePathNumber}
- Destiny Number: ${input.destinyNumber}
- Soul Urge Number: ${input.soulUrgeNumber}

## Trait Scores (0-100 scale)
- Emotional Intensity: ${input.traits.emotionalIntensity}
- Attachment Style: ${input.traits.attachmentStyle}
- Ambition: ${input.traits.ambition}
- Trust: ${input.traits.trust}
- Communication Openness: ${input.traits.communicationOpenness}
- Impulsiveness: ${input.traits.impulsiveness}
- Empathy: ${input.traits.empathy}
- Resilience: ${input.traits.resilience}
- Creativity: ${input.traits.creativity}
- Intuition: ${input.traits.intuition}
- Discipline: ${input.traits.discipline}
- Social Energy: ${input.traits.socialEnergy}
- Patience: ${input.traits.patience}
- Adaptability: ${input.traits.adaptability}

# Report Sections to Generate

${sectionRequests}

Remember: Write each section specifically for THIS person's data. No generic horoscope language. Be emotionally intelligent, specific, and helpful. Output only valid JSON.`;
}

/**
 * Build a prompt for regenerating a single section.
 * Useful when a section fails or needs to be regenerated.
 */
export function buildSectionPrompt(
  input: AIReportInput,
  section: ReportSectionTemplate
): string {
  const traitValues = section.traits
    .map((t) => `${t}=${input.traits[t as keyof typeof input.traits]}`)
    .join(', ');

  return `Regenerate this specific section of the emotional intelligence report.

# Person's Data

## Astrology
- Sun Sign: ${input.sunSign}
- Moon Sign: ${input.moonSign}
- Ascendant: ${input.ascendant}
- Nakshatra: ${input.nakshatra}
- Current Dasha: ${input.currentDasha}
- Yogas: ${input.yogas.length > 0 ? input.yogas.join(', ') : 'None prominent'}
- Doshas: ${input.doshas.length > 0 ? input.doshas.join(', ') : 'None prominent'}

## Numerology
- Life Path Number: ${input.lifePathNumber}
- Destiny Number: ${input.destinyNumber}
- Soul Urge Number: ${input.soulUrgeNumber}

## Relevant Trait Scores
${traitValues}

## All Trait Scores (for context)
- Emotional Intensity: ${input.traits.emotionalIntensity}
- Attachment Style: ${input.traits.attachmentStyle}
- Ambition: ${input.traits.ambition}
- Trust: ${input.traits.trust}
- Communication Openness: ${input.traits.communicationOpenness}
- Impulsiveness: ${input.traits.impulsiveness}
- Empathy: ${input.traits.empathy}
- Resilience: ${input.traits.resilience}
- Creativity: ${input.traits.creativity}
- Intuition: ${input.traits.intuition}
- Discipline: ${input.traits.discipline}
- Social Energy: ${input.traits.socialEnergy}
- Patience: ${input.traits.patience}
- Adaptability: ${input.traits.adaptability}

# Section to Generate

## Section: ${section.id}
Title: ${section.title}
Relevant traits: ${traitValues}
Guidance: ${section.promptGuidance}

Output a valid JSON object with this structure:
{
  "id": "${section.id}",
  "content": "The markdown content for this section (150-250 words)"
}

Output ONLY the JSON. No code fences.`;
}

/**
 * Get the safety constraints text (for auditing/testing).
 */
export function getSafetyConstraints(): string {
  return SAFETY_CONSTRAINTS;
}
