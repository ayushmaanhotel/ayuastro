// ============================================================================
// AyuAstro AI Interpretation Engine - Report Generator
// ============================================================================
// Uses z-ai-web-dev-sdk to generate emotionally intelligent reports.
// IMPORTANT: This file MUST only be used in backend code (API routes, etc.)
// ============================================================================

import ZAI from 'z-ai-web-dev-sdk';
import type {
  AIReportInput,
  GeneratedReport,
  RawAIResponse,
  ReportSection,
  ReportSectionTemplate,
} from './types';
import { AIEngineError, AIErrorType } from './types';
import { REPORT_SECTION_TEMPLATES, getDeepIntelligenceTemplates, getPremiumTemplates, getFreeTemplates } from './templates';
import { buildReportPrompt, buildSectionPrompt, buildDeepIntelligencePrompt, getSystemPrompt, getDeepIntelligenceSystemPrompt } from './prompts';

// ---------------------------------------------------------------------------
// SDK Initialization
// ---------------------------------------------------------------------------

let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null;

/**
 * Initialize the z-ai-web-dev-sdk client (lazy singleton).
 */
async function getAIClient() {
  if (!zaiInstance) {
    try {
      zaiInstance = await ZAI.create();
    } catch (error) {
      throw new AIEngineError(
        AIErrorType.SDK_ERROR,
        'Failed to initialize AI SDK client',
        true,
        error
      );
    }
  }
  return zaiInstance;
}

// ---------------------------------------------------------------------------
// Input Validation
// ---------------------------------------------------------------------------

/**
 * Validate the AI report input before sending to the AI.
 */
function validateInput(input: AIReportInput): void {
  if (!input) {
    throw new AIEngineError(AIErrorType.INVALID_INPUT, 'Input is required');
  }

  // Validate astrology fields
  if (!input.sunSign || !input.moonSign || !input.ascendant) {
    throw new AIEngineError(
      AIErrorType.INVALID_INPUT,
      'Sun sign, moon sign, and ascendant are required'
    );
  }

  // Validate numerology numbers
  if (
    !input.lifePathNumber ||
    input.lifePathNumber < 1 ||
    input.lifePathNumber > 9
  ) {
    throw new AIEngineError(
      AIErrorType.INVALID_INPUT,
      'Life path number must be between 1 and 9'
    );
  }

  if (
    !input.destinyNumber ||
    input.destinyNumber < 1 ||
    input.destinyNumber > 9
  ) {
    throw new AIEngineError(
      AIErrorType.INVALID_INPUT,
      'Destiny number must be between 1 and 9'
    );
  }

  if (
    !input.soulUrgeNumber ||
    input.soulUrgeNumber < 1 ||
    input.soulUrgeNumber > 9
  ) {
    throw new AIEngineError(
      AIErrorType.INVALID_INPUT,
      'Soul urge number must be between 1 and 9'
    );
  }

  // Validate trait scores (0-100)
  const traitKeys = Object.keys(input.traits) as Array<
    keyof AIReportInput['traits']
  >;
  for (const key of traitKeys) {
    const value = input.traits[key];
    if (typeof value !== 'number' || value < 0 || value > 100) {
      throw new AIEngineError(
        AIErrorType.INVALID_INPUT,
        `Trait "${key}" must be a number between 0 and 100, got ${value}`
      );
    }
  }
}

// ---------------------------------------------------------------------------
// AI Response Parsing
// ---------------------------------------------------------------------------

/**
 * Parse the raw AI response into a structured GeneratedReport.
 */
function parseAIResponse(
  rawContent: string,
  templates: ReportSectionTemplate[]
): GeneratedReport {
  try {
    // Clean the response — remove potential markdown code fences
    let cleaned = rawContent.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.slice(7);
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.slice(3);
    }
    if (cleaned.endsWith('```')) {
      cleaned = cleaned.slice(0, -3);
    }
    cleaned = cleaned.trim();

    const parsed = JSON.parse(cleaned);

    // Validate top-level structure
    if (!parsed.title || typeof parsed.title !== 'string') {
      throw new Error('Missing or invalid "title" in AI response');
    }
    if (!parsed.summary || typeof parsed.summary !== 'string') {
      throw new Error('Missing or invalid "summary" in AI response');
    }
    if (!Array.isArray(parsed.sections)) {
      throw new Error('Missing or invalid "sections" array in AI response');
    }

    // Build section map for quick lookup
    const templateMap = new Map<string, ReportSectionTemplate>();
    for (const t of templates) {
      templateMap.set(t.id, t);
    }

    // Parse and validate each section
    const sections: ReportSection[] = parsed.sections.map(
      (s: { id?: string; content?: string }, index: number) => {
        if (!s.id || typeof s.id !== 'string') {
          throw new Error(`Section at index ${index} missing "id"`);
        }
        if (!s.content || typeof s.content !== 'string') {
          throw new Error(`Section "${s.id}" missing or invalid "content"`);
        }

        const template = templateMap.get(s.id);
        if (!template) {
          throw new Error(
            `Unknown section id "${s.id}" — not found in templates`
          );
        }

        return {
          id: template.id,
          title: template.title,
          icon: template.icon,
          content: s.content,
          traits: template.traits,
          insightLevel: template.insightLevel,
        };
      }
    );

    return {
      title: parsed.title,
      summary: parsed.summary,
      sections,
    };
  } catch (error) {
    if (error instanceof AIEngineError) throw error;
    throw new AIEngineError(
      AIErrorType.PARSING_FAILED,
      `Failed to parse AI response: ${error instanceof Error ? error.message : String(error)}`,
      false,
      error
    );
  }
}

/**
 * Parse a single-section AI response.
 */
function parseSectionResponse(
  rawContent: string,
  template: ReportSectionTemplate
): ReportSection {
  try {
    let cleaned = rawContent.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.slice(7);
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.slice(3);
    }
    if (cleaned.endsWith('```')) {
      cleaned = cleaned.slice(0, -3);
    }
    cleaned = cleaned.trim();

    const parsed = JSON.parse(cleaned);

    if (!parsed.content || typeof parsed.content !== 'string') {
      throw new Error('Missing or invalid "content" in section response');
    }

    return {
      id: template.id,
      title: template.title,
      icon: template.icon,
      content: parsed.content,
      traits: template.traits,
      insightLevel: template.insightLevel,
    };
  } catch (error) {
    if (error instanceof AIEngineError) throw error;
    throw new AIEngineError(
      AIErrorType.PARSING_FAILED,
      `Failed to parse section response: ${error instanceof Error ? error.message : String(error)}`,
      false,
      error
    );
  }
}

// ---------------------------------------------------------------------------
// Retry Logic
// ---------------------------------------------------------------------------

/**
 * Execute an AI call with retry logic for transient failures.
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 2,
  delayMs: number = 1000
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry non-retryable errors
      if (error instanceof AIEngineError && !error.retryable) {
        throw error;
      }

      // Check for rate limiting
      if (
        error instanceof Error &&
        (error.message.toLowerCase().includes('rate') ||
          error.message.toLowerCase().includes('429'))
      ) {
        throw new AIEngineError(
          AIErrorType.RATE_LIMITED,
          'AI service rate limit reached. Please try again later.',
          true,
          error
        );
      }

      // Wait before retrying
      if (attempt < maxRetries) {
        await new Promise((resolve) =>
          setTimeout(resolve, delayMs * (attempt + 1))
        );
      }
    }
  }

  throw new AIEngineError(
    AIErrorType.GENERATION_FAILED,
    `AI generation failed after ${maxRetries + 1} attempts`,
    true,
    lastError
  );
}

// ---------------------------------------------------------------------------
// Public API: Report Generation
// ---------------------------------------------------------------------------

/**
 * Generate a complete emotional intelligence report.
 *
 * This is the primary public function. It takes all input data,
 * sends it to the AI, and returns a structured report.
 *
 * @param input - The complete AI report input (astrology, numerology, traits)
 * @param options - Optional generation settings
 * @returns A fully structured GeneratedReport
 */
export async function generateReport(
  input: AIReportInput,
  options?: {
    /** Which sections to generate (defaults to all). */
    sections?: string[];
    /** Temperature for AI generation (0-1, default 0.7). */
    temperature?: number;
    /** Include only free sections. */
    freeOnly?: boolean;
  }
): Promise<GeneratedReport> {
  // 1. Validate input
  validateInput(input);

  // 2. Determine which sections to generate
  let templates = REPORT_SECTION_TEMPLATES;

  if (options?.freeOnly) {
    templates = templates.filter((t) => t.insightLevel === 'free');
  }

  if (options?.sections && options.sections.length > 0) {
    const requestedIds = new Set(options.sections);
    templates = templates.filter((t) => requestedIds.has(t.id));
  }

  if (templates.length === 0) {
    throw new AIEngineError(
      AIErrorType.INVALID_INPUT,
      'No valid sections requested for generation'
    );
  }

  // 3. Generate the report via AI
  const report = await withRetry(async () => {
    const client = await getAIClient();
    const systemPrompt = getSystemPrompt();
    const userPrompt = buildReportPrompt(input, templates);

    const response = await client.chat.completions.create({
      model: 'default',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: options?.temperature ?? 0.7,
    });

    const content = response.choices?.[0]?.message?.content;
    if (!content) {
      throw new AIEngineError(
        AIErrorType.GENERATION_FAILED,
        'AI returned empty response'
      );
    }

    return parseAIResponse(content, templates);
  });

  return report;
}

/**
 * Generate a single report section.
 * Useful for regenerating a failed section or lazy-loading premium content.
 *
 * @param input - The complete AI report input
 * @param sectionId - The section ID to generate
 * @param options - Optional generation settings
 * @returns A single ReportSection
 */
export async function generateSection(
  input: AIReportInput,
  sectionId: string,
  options?: {
    temperature?: number;
  }
): Promise<ReportSection> {
  validateInput(input);

  const template = REPORT_SECTION_TEMPLATES.find((t) => t.id === sectionId);
  if (!template) {
    throw new AIEngineError(
      AIErrorType.INVALID_INPUT,
      `Unknown section ID: "${sectionId}"`
    );
  }

  const section = await withRetry(async () => {
    const client = await getAIClient();
    const systemPrompt = getSystemPrompt();
    const userPrompt = buildSectionPrompt(input, template);

    const response = await client.chat.completions.create({
      model: 'default',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: options?.temperature ?? 0.7,
    });

    const content = response.choices?.[0]?.message?.content;
    if (!content) {
      throw new AIEngineError(
        AIErrorType.GENERATION_FAILED,
        'AI returned empty response for section'
      );
    }

    return parseSectionResponse(content, template);
  });

  return section;
}

/**
 * Generate only the free-preview sections of a report.
 */
export async function generateFreeReport(
  input: AIReportInput
): Promise<GeneratedReport> {
  return generateReport(input, { freeOnly: true });
}

/**
 * Generate only the premium sections of a report.
 */
export async function generatePremiumSections(
  input: AIReportInput
): Promise<ReportSection[]> {
  const premiumTemplates = getPremiumTemplates();

  const sections: ReportSection[] = [];

  // Generate premium sections sequentially to respect rate limits
  for (const template of premiumTemplates) {
    const section = await generateSection(input, template.id);
    sections.push(section);
  }

  return sections;
}

/**
 * Generate a DEEP INTELLIGENCE REPORT — the premium, nothing-to-hide version.
 *
 * This generates all 15 sections (3 free + 12 premium) with:
 * - Brutally honest, human tone
 * - 500-800 words per premium section
 * - Life-phase and timeline breakdowns
 * - Shadow work, karmic patterns, financial timelines
 *
 * Because generating 15 sections at once is too large for a single AI call,
 * we split into batches: first the 3 free sections, then the premium sections
 * in groups of 3-4 to avoid token limits.
 */
export async function generateDeepIntelligenceReport(
  input: AIReportInput,
  options?: {
    /** Temperature for AI generation (0-1, default 0.75). */
    temperature?: number;
    /** Callback for progress updates. */
    onProgress?: (completed: number, total: number, sectionTitle: string) => void;
    /** Language for the report output. */
    language?: 'en' | 'hi' | 'hinglish';
  }
): Promise<GeneratedReport> {
  validateInput(input);

  const allTemplates = REPORT_SECTION_TEMPLATES;
  const freeTemplates = getFreeTemplates();
  const premiumTemplates = getPremiumTemplates();
  const temperature = options?.temperature ?? 0.75;
  const onProgress = options?.onProgress;

  let reportTitle = '';
  let reportSummary = '';
  const allSections: ReportSection[] = [];

  // ── Batch 1: Free sections (3) ──────────────────────────────
  try {
    const freeReport = await withRetry(async () => {
      const client = await getAIClient();
      const systemPrompt = getSystemPrompt(options?.language ?? 'en');
      const userPrompt = buildReportPrompt(input, freeTemplates);

      const response = await client.chat.completions.create({
        model: 'default',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature,
      });

      const content = response.choices?.[0]?.message?.content;
      if (!content) {
        throw new AIEngineError(AIErrorType.GENERATION_FAILED, 'AI returned empty response for free sections');
      }

      return parseAIResponse(content, freeTemplates);
    });

    reportTitle = freeReport.title;
    reportSummary = freeReport.summary;
    allSections.push(...freeReport.sections);

    freeReport.sections.forEach((s) => {
      onProgress?.(allSections.length, allTemplates.length, s.title);
    });
  } catch (error) {
    console.error('[Deep Intelligence] Free sections failed:', error);
    // Continue with premium even if free fails
  }

  // ── Batch 2+: Premium sections in groups of 4 ──────────────
  const BATCH_SIZE = 4;
  const deepSystemPrompt = getDeepIntelligenceSystemPrompt(options?.language ?? 'en');

  for (let i = 0; i < premiumTemplates.length; i += BATCH_SIZE) {
    const batch = premiumTemplates.slice(i, i + BATCH_SIZE);

    try {
      const batchReport = await withRetry(async () => {
        const client = await getAIClient();
        const userPrompt = buildDeepIntelligencePrompt(input, batch);

        const response = await client.chat.completions.create({
          model: 'default',
          messages: [
            { role: 'system', content: deepSystemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature,
        });

        const content = response.choices?.[0]?.message?.content;
        if (!content) {
          throw new AIEngineError(AIErrorType.GENERATION_FAILED, `AI returned empty response for premium batch starting at ${i}`);
        }

        return parseAIResponse(content, batch);
      });

      // Use the title/summary from the first premium batch (most comprehensive)
      if (i === 0 && batchReport.title) {
        reportTitle = batchReport.title;
      }
      if (i === 0 && batchReport.summary) {
        reportSummary = batchReport.summary;
      }

      allSections.push(...batchReport.sections);

      batchReport.sections.forEach((s) => {
        onProgress?.(allSections.length, allTemplates.length, s.title);
      });
    } catch (error) {
      console.error(`[Deep Intelligence] Premium batch ${i}-${i + BATCH_SIZE} failed:`, error);
      // Try generating sections individually as fallback
      for (const template of batch) {
        try {
          const section = await generateSection(input, template.id, { temperature });
          allSections.push(section);
          onProgress?.(allSections.length, allTemplates.length, section.title);
        } catch (sectionError) {
          console.error(`[Deep Intelligence] Section ${template.id} failed individually:`, sectionError);
          // Add a fallback section
          allSections.push({
            id: template.id,
            title: template.title,
            icon: template.icon,
            content: `This section could not be generated. Your ${template.title} analysis requires deeper processing. Please try regenerating your report.`,
            traits: template.traits,
            insightLevel: template.insightLevel,
          });
          onProgress?.(allSections.length, allTemplates.length, template.title);
        }
      }
    }
  }

  // ── Sort sections in template order ──────────────────────────
  const sectionOrder = allTemplates.map((t) => t.id);
  allSections.sort((a, b) => sectionOrder.indexOf(a.id) - sectionOrder.indexOf(b.id));

  return {
    title: reportTitle || 'Your Deep Intelligence Report',
    summary: reportSummary || 'A comprehensive analysis of your personality, patterns, and life trajectory.',
    sections: allSections,
  };
}

/**
 * Check if the AI service is available.
 * Useful for health checks.
 */
export async function checkAIService(): Promise<{
  available: boolean;
  error?: string;
}> {
  try {
    const client = await getAIClient();
    // Simple test call
    const response = await client.chat.completions.create({
      model: 'default',
      messages: [
        { role: 'user', content: 'Reply with the word "ok" and nothing else.' },
      ],
      temperature: 0,
    });

    const content = response.choices?.[0]?.message?.content;
    if (content) {
      return { available: true };
    }
    return { available: false, error: 'AI returned empty response' };
  } catch (error) {
    return {
      available: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
