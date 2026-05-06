// ============================================================================
// AyuAstro AI Interpretation Engine - Report Section Templates
// ============================================================================
// Defines the structure and guidance for each report section.
// The AI uses these templates to know WHAT to write about and HOW.
// ============================================================================

import type { ReportSectionTemplate } from './types';

/**
 * All report section templates in display order.
 * Each template provides:
 * - id: unique identifier
 * - title: human-readable section title
 * - icon: lucide-react icon name for UI rendering
 * - traits: which trait scores are relevant to this section
 * - insightLevel: whether this section is free or premium
 * - promptGuidance: specific instructions for the AI about what to cover
 */
export const REPORT_SECTION_TEMPLATES: ReportSectionTemplate[] = [
  {
    id: 'emotional-personality',
    title: 'Emotional Personality',
    icon: 'Heart',
    traits: ['emotionalIntensity', 'empathy', 'intuition', 'resilience'],
    insightLevel: 'free',
    promptGuidance: `Identify the person's core emotional archetype based on their trait scores and astrological profile.

Focus on:
- Their dominant emotional pattern (are they a feeler, a thinker-feeler, or someone who processes through action?)
- How their emotionalIntensity score shapes their daily experience — do they feel everything at full volume, or do they have a quiet internal weather?
- How their moon sign manifests in their emotional inner life
- The interplay between empathy and intuition — do they absorb others' emotions or sense them from a distance?
- What resilience looks like for them specifically — is it bouncing back fast, or enduring long storms?

Write as if describing a real person, not a type. Be specific to their data. Avoid generic zodiac language.`,
  },
  {
    id: 'relationship-style',
    title: 'Relationship Style',
    icon: 'Users',
    traits: ['attachmentStyle', 'trust', 'empathy', 'socialEnergy'],
    insightLevel: 'free',
    promptGuidance: `Describe how this person connects with others in close relationships.

Focus on:
- Their attachmentStyle score: Does it lean secure, anxious-preoccupied, dismissive-avoidant, or fearful-avoidant? Name the pattern specifically.
- How trust develops for them — is it given freely until broken, or earned slowly over time?
- The role of their moon sign and 7th house influences in partnership dynamics
- How socialEnergy affects whether they recharge alone or with others
- What they need from a partner vs. what they often settle for
- Their natural blind spot in relationships based on their trait combination

Be warm but honest. Don't romanticize unhealthy patterns. Reference their specific data.`,
  },
  {
    id: 'communication-patterns',
    title: 'Communication Patterns',
    icon: 'MessageCircle',
    traits: ['communicationOpenness', 'impulsiveness', 'empathy', 'discipline'],
    insightLevel: 'free',
    promptGuidance: `Analyze how this person expresses themselves and processes information.

Focus on:
- Their communicationOpenness score: Do they over-share, hold back, or find a balanced middle ground?
- How impulsiveness affects their speech — do they blurt things out or carefully craft their words?
- The role of their Mercury placement (inferred from sun/moon sign context) in communication style
- How empathy shapes their listening — do they listen to understand or listen to respond?
- Whether discipline helps them communicate more effectively or restricts their expression
- Their communication strength that they may not recognize

Be specific about the patterns, not generic advice. Reference their actual trait scores.`,
  },
  {
    id: 'hidden-strengths',
    title: 'Hidden Strengths',
    icon: 'Sparkles',
    traits: ['creativity', 'intuition', 'adaptability', 'resilience'],
    insightLevel: 'premium',
    promptGuidance: `Reveal the strengths this person has but may not fully recognize or use.

Focus on:
- How their creativity manifests — it may not be artistic. It could be problem-solving creativity, social creativity, or strategic creativity.
- The power of their intuition score — what happens when they trust their gut vs. when they override it
- Adaptability as a hidden superpower — how it shows up in career changes, relationships, and crisis
- Their resilience pattern — not just "you're resilient" but HOW: fast recovery, slow but complete healing, or something else?
- Yogas in their chart that amplify specific strengths
- The trait combination that creates their unique edge — something others notice about them before they see it themselves

This section should feel like receiving a gift — insightful, specific, and empowering without being hollow.`,
  },
  {
    id: 'emotional-blind-spots',
    title: 'Emotional Blind Spots',
    icon: 'Eye',
    traits: ['impulsiveness', 'trust', 'patience', 'emotionalIntensity'],
    insightLevel: 'premium',
    promptGuidance: `Gently illuminate patterns this person may not see about themselves.

Focus on:
- How high emotionalIntensity + low patience can create reactive loops they don't notice
- The shadow side of their trust pattern — too trusting leads to boundary issues; too guarded leads to isolation
- How impulsiveness might mask deeper needs (e.g., impulsive spending might be seeking security)
- Doshas in their chart and how they might amplify emotional blind spots
- The pattern they repeat in relationships that they think is "just how things are"
- What their trait scores suggest they avoid feeling

CRITICAL: Frame blind spots as patterns to observe, not flaws to fix. Use "you may notice" language, never "you have a problem." Be specific, not preachy.`,
  },
  {
    id: 'money-psychology',
    title: 'Money Psychology',
    icon: 'Wallet',
    traits: ['ambition', 'discipline', 'impulsiveness', 'trust'],
    insightLevel: 'premium',
    promptGuidance: `Explore this person's psychological relationship with money, wealth, and financial security.

Focus on:
- How ambition drives their earning potential — are they building wealth, seeking status, or chasing security?
- The discipline-impulsiveness tension in financial decisions — do they save religiously then splurge, or stay consistent?
- Their money "origin story" as suggested by their 2nd house and numerology (destiny number influence)
- Whether trust affects their financial relationships — do they delegate money decisions or control everything?
- Their soul urge number and what it reveals about what they truly want money FOR
- The financial pattern they don't see: e.g., earning more but never feeling secure, or underearning despite talent

Avoid generic financial advice. Make it about THEIR psychology, not budgeting tips.`,
  },
  {
    id: 'recurring-life-patterns',
    title: 'Recurring Life Patterns',
    icon: 'RotateCw',
    traits: ['adaptability', 'patience', 'resilience', 'intuition'],
    insightLevel: 'premium',
    promptGuidance: `Identify the karmic themes and cyclical patterns in this person's life.

Focus on:
- The recurring theme suggested by their life path number — what lesson keeps returning?
- How their current dasha period connects to the life chapter they're in right now
- The pattern that connects their relationships, career, and personal growth — is there a thread?
- How adaptability and patience interact in how they navigate life transitions
- The "karmic homework" their chart suggests — not as punishment, but as the soul's curriculum
- Nakshatra influence on their life narrative — what myth are they living?
- The one pattern that, if interrupted, could change everything

Frame patterns as rhythms, not fate. Use "you may notice this returning" rather than "this will always happen." Connect it to their specific astrological and numerological data.`,
  },
];

/**
 * Get templates that are available for free users.
 */
export function getFreeTemplates(): ReportSectionTemplate[] {
  return REPORT_SECTION_TEMPLATES.filter((t) => t.insightLevel === 'free');
}

/**
 * Get templates that are premium-only.
 */
export function getPremiumTemplates(): ReportSectionTemplate[] {
  return REPORT_SECTION_TEMPLATES.filter((t) => t.insightLevel === 'premium');
}

/**
 * Get a template by its ID.
 */
export function getTemplateById(id: string): ReportSectionTemplate | undefined {
  return REPORT_SECTION_TEMPLATES.find((t) => t.id === id);
}

/**
 * Get the section IDs in display order.
 */
export function getSectionOrder(): string[] {
  return REPORT_SECTION_TEMPLATES.map((t) => t.id);
}
