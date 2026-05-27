// ============================================================================
// AyuAstro AI Interpretation Engine - Main Export
// ============================================================================
// This is the public API for the AI interpretation engine.
// Import from '@/lib/ai' to use any of these exports.
//
// IMPORTANT: This module uses z-ai-web-dev-sdk and MUST only be called
// from backend code (API routes, server components, server actions).
// NEVER import this in client-side code.
// ============================================================================

// --- Types ---
export type {
  AIReportInput,
  GeneratedReport,
  PlanetaryPosition,
  RawAIResponse,
  ReportSection,
  ReportSectionTemplate,
  TraitScores,
} from './types';

export { AIEngineError, AIErrorType } from './types';

// --- Report Generation ---
export {
  generateReport,
  generateSection,
  generateFreeReport,
  generatePremiumSections,
  generateDeepIntelligenceReport,
  checkAIService,
} from './report-generator';

// --- Templates ---
export {
  REPORT_SECTION_TEMPLATES,
  getFreeTemplates,
  getPremiumTemplates,
  getTemplateById,
  getSectionOrder,
  getDeepIntelligenceTemplates,
} from './templates';

// --- Prompts (for testing/auditing) ---
export { getSystemPrompt, getDeepIntelligenceSystemPrompt, getSafetyConstraints } from './prompts';
