# Task ID: 2 — Prompts Rewriter Agent

## Task
Rewrite AI prompts to be hyper-personalized, use simple language, add disclaimer requirement, and support language parameter.

## Files Modified
1. `/home/z/my-project/src/lib/ai/prompts.ts` — TONE_GUIDELINES, getSystemPrompt(), getDeepIntelligenceSystemPrompt(), buildDeepIntelligencePrompt()
2. `/home/z/my-project/src/lib/ai/report-generator.ts` — generateDeepIntelligenceReport() options type and language passing
3. `/home/z/my-project/src/app/api/ai/deep-intelligence/route.ts` — deepIntelligenceSchema and language parameter passing

## Changes Summary

### prompts.ts
- **TONE_GUIDELINES**: Replaced with enhanced version including:
  - "CRITICAL RULE — PERSONALIZATION IS NON-NEGOTIABLE" section
  - "LANGUAGE RULES — KEEP IT SIMPLE AND HUMAN" section
  - "MANDATORY DISCLAIMER RULE" section
  - Updated lengths: Free 300-400 words, Premium 600-1000 words

- **getSystemPrompt()**: Now accepts `language: 'en' | 'hi' | 'hinglish' = 'en'` parameter with langInstruction injected before OUTPUT FORMAT

- **getDeepIntelligenceSystemPrompt()**: Now accepts `language: 'en' | 'hi' | 'hinglish' = 'en'` parameter with detailed Hindi/Hinglish instructions; added point 6 (PERSONAL), SIMPLE LANGUAGE rule, PERSONALIZATION MANDATE, DISCLAIMER INTEGRATION; updated lengths and output format

- **buildDeepIntelligencePrompt()**: Added strongestTrait, weakestTrait, biggestGap calculations and injected them into the Pre-Analyzed Pattern Summary

### report-generator.ts
- **generateDeepIntelligenceReport()**: Added `language?: 'en' | 'hi' | 'hinglish'` to options; passes language to `getSystemPrompt()` and `getDeepIntelligenceSystemPrompt()`

### deep-intelligence/route.ts
- **deepIntelligenceSchema**: Added `language: z.enum(['en', 'hi', 'hinglish']).optional()`
- Passes `parsed.data.language ?? 'en'` to `generateDeepIntelligenceReport()`

## Lint
- Zero errors
