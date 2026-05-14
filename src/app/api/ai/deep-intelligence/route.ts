/**
 * AyuAstro - Deep Intelligence Report API
 *
 * Generates the premium "nothing to hide" deep intelligence report with 15 sections:
 * - 3 free sections (emotional truth, relationship reality, communication)
 * - 12 premium sections (hidden strengths, blind spots, shadow self, love timeline,
 *   career truth, family karma, health warnings, life phase roadmap, financial timeline,
 *   spiritual purpose, recurring patterns, money psychology)
 *
 * Uses the batched generation system with progress tracking.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { generateDeepIntelligenceReport } from '@/lib/ai';
import type { AIReportInput, TraitScores, PlanetaryPosition } from '@/lib/ai';

// ─── Zod Schema ───────────────────────────────────────────────────────────────

const traitScoresSchema = z.object({
  emotionalIntensity: z.number().min(0).max(100),
  attachmentStyle: z.number().min(0).max(100),
  ambition: z.number().min(0).max(100),
  trust: z.number().min(0).max(100),
  communicationOpenness: z.number().min(0).max(100),
  impulsiveness: z.number().min(0).max(100),
  empathy: z.number().min(0).max(100),
  resilience: z.number().min(0).max(100),
  creativity: z.number().min(0).max(100),
  intuition: z.number().min(0).max(100),
  discipline: z.number().min(0).max(100),
  socialEnergy: z.number().min(0).max(100),
  patience: z.number().min(0).max(100),
  adaptability: z.number().min(0).max(100),
});

const planetaryPositionSchema = z.object({
  sign: z.string(),
  degree: z.number(),
  house: z.number(),
  retrograde: z.boolean(),
  nakshatra: z.string().optional(),
  nakshatraPada: z.number().optional(),
  isCombust: z.boolean().optional(),
});

const deepIntelligenceSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  astrologyData: z.object({
    sunSign: z.string(),
    moonSign: z.string(),
    ascendant: z.string(),
    nakshatra: z.string().optional(),
    currentDasha: z.string().optional(),
    yogas: z.array(z.string()).optional(),
    doshas: z.array(z.string()).optional(),
    planetaryPositions: z.record(z.string(), planetaryPositionSchema).optional(),
  }),
  numerologyData: z.object({
    lifePathNumber: z.number().int(),
    destinyNumber: z.number().int(),
    soulUrgeNumber: z.number().int(),
  }),
  traitScores: traitScoresSchema,
  temperature: z.number().min(0).max(1).optional(),
  language: z.enum(['en', 'hi', 'hinglish']).optional(),
});

// ─── POST Handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = deepIntelligenceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { userId, astrologyData, numerologyData, traitScores, temperature } = parsed.data;

    // Verify user exists
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Build AI report input
    const aiInput: AIReportInput = {
      sunSign: astrologyData.sunSign,
      moonSign: astrologyData.moonSign,
      ascendant: astrologyData.ascendant,
      nakshatra: astrologyData.nakshatra ?? '',
      currentDasha: astrologyData.currentDasha ?? '',
      yogas: astrologyData.yogas ?? [],
      doshas: astrologyData.doshas ?? [],
      planetaryPositions: astrologyData.planetaryPositions as Record<string, PlanetaryPosition> | undefined,
      lifePathNumber: numerologyData.lifePathNumber,
      destinyNumber: numerologyData.destinyNumber,
      soulUrgeNumber: numerologyData.soulUrgeNumber,
      traits: traitScores as TraitScores,
    };

    // Generate the deep intelligence report (batched, with progress)
    const report = await generateDeepIntelligenceReport(aiInput, {
      temperature: temperature ?? 0.75,
      language: parsed.data.language ?? 'en',
    });

    // Save to Report table
    const savedReport = await db.report.create({
      data: {
        userId,
        type: 'deep_intelligence',
        title: report.title,
        summary: report.summary,
        sections: JSON.stringify(report.sections),
        isPremium: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        reportId: savedReport.id,
        title: savedReport.title,
        summary: savedReport.summary,
        sections: report.sections,
        type: 'deep_intelligence',
        isPremium: true,
        totalSections: report.sections.length,
        createdAt: savedReport.createdAt,
      },
    });
  } catch (error) {
    console.error('[Deep Intelligence API] Error:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Failed to generate deep intelligence report';

    const status = errorMessage.toLowerCase().includes('rate')
      ? 429
      : 500;

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status }
    );
  }
}
