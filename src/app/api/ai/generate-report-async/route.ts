export const maxDuration = 300;
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { generateReport, generateFreeReport } from '@/lib/ai';
import type { AIReportInput, TraitScores } from '@/lib/ai';

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

const generateReportAsyncSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  reportType: z.enum(['personality', 'relationship', 'emotional_pattern']).optional().default('personality'),
  astrologyData: z.object({
    sunSign: z.string(),
    moonSign: z.string(),
    ascendant: z.string(),
    nakshatra: z.string().optional(),
    currentDasha: z.string().optional(),
    yogas: z.array(z.string()).optional(),
    doshas: z.array(z.string()).optional(),
  }),
  numerologyData: z.object({
    lifePathNumber: z.number().int(),
    destinyNumber: z.number().int(),
    soulUrgeNumber: z.number().int(),
  }),
  traitScores: traitScoresSchema,
  freeOnly: z.boolean().optional().default(false),
});

// ─── POST Handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = generateReportAsyncSchema.safeParse(body);

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

    const { userId, reportType, astrologyData, numerologyData, traitScores, freeOnly } = parsed.data;

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
      lifePathNumber: numerologyData.lifePathNumber,
      destinyNumber: numerologyData.destinyNumber,
      soulUrgeNumber: numerologyData.soulUrgeNumber,
      traits: traitScores as TraitScores,
    };

    // Generate report via AI engine
    const report = freeOnly
      ? await generateFreeReport(aiInput)
      : await generateReport(aiInput);

    // Determine report title based on type
    const reportTitles: Record<string, string> = {
      personality: 'Personality Analysis',
      relationship: 'Relationship Compatibility Insights',
      emotional_pattern: 'Emotional Pattern Analysis',
    };

    // Save to Report table
    const savedReport = await db.report.create({
      data: {
        userId,
        type: reportType,
        title: report.title || reportTitles[reportType] || 'AI Report',
        summary: report.summary,
        sections: JSON.stringify(report.sections),
        isPremium: !freeOnly,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        reportId: savedReport.id,
        title: savedReport.title,
        summary: savedReport.summary,
        sections: report.sections,
        type: reportType,
        isPremium: savedReport.isPremium,
        createdAt: savedReport.createdAt,
      },
    });
  } catch (error) {
    console.error('[AI Report Async API] Error:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Failed to generate AI report';

    const status = errorMessage.toLowerCase().includes('rate')
      ? 429
      : 500;

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status }
    );
  }
}
