export const maxDuration = 300;
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
  emotionalIntensity: z.number().min(0).max(100).nullish(),
  attachmentStyle: z.number().min(0).max(100).nullish(),
  ambition: z.number().min(0).max(100).nullish(),
  trust: z.number().min(0).max(100).nullish(),
  communicationOpenness: z.number().min(0).max(100).nullish(),
  impulsiveness: z.number().min(0).max(100).nullish(),
  empathy: z.number().min(0).max(100).nullish(),
  resilience: z.number().min(0).max(100).nullish(),
  creativity: z.number().min(0).max(100).nullish(),
  intuition: z.number().min(0).max(100).nullish(),
  discipline: z.number().min(0).max(100).nullish(),
  socialEnergy: z.number().min(0).max(100).nullish(),
  patience: z.number().min(0).max(100).nullish(),
  adaptability: z.number().min(0).max(100).nullish(),
});

const planetaryPositionSchema = z.object({
  sign: z.string(),
  degree: z.number(),
  house: z.number(),
  retrograde: z.boolean(),
  nakshatra: z.string().nullish(),
  nakshatraPada: z.number().nullish(),
  isCombust: z.boolean().nullish(),
});

const deepIntelligenceSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  astrologyData: z.object({
    sunSign: z.string(),
    moonSign: z.string(),
    ascendant: z.string(),
    nakshatra: z.string().nullish(),
    currentDasha: z.string().nullish(),
    yogas: z.array(z.string()).nullish(),
    doshas: z.array(z.string()).nullish(),
    planetaryPositions: z.record(z.string(), planetaryPositionSchema).nullish(),
  }).nullish(),
  numerologyData: z.object({
    lifePathNumber: z.number().int(),
    destinyNumber: z.number().int(),
    soulUrgeNumber: z.number().int(),
  }).nullish(),
  traitScores: traitScoresSchema.nullish(),
  temperature: z.number().min(0).max(1).nullish(),
  language: z.enum(['en', 'hi', 'hinglish']).nullish(),
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

    // Verify user exists and fetch calculations
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        astrology: true,
        numerology: true,
        traits: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Resolve astrologyData (merge client payload with DB calculations if needed)
    let finalAstrologyData = astrologyData;
    if (!finalAstrologyData) {
      if (!user.astrology) {
        return NextResponse.json(
          { success: false, error: 'Astrology calculations not found in database. Complete onboarding first.' },
          { status: 400 }
        );
      }

      let parsedYogas: string[] = [];
      try {
        const rawYogas = JSON.parse(user.astrology.yogas);
        if (Array.isArray(rawYogas)) {
          parsedYogas = rawYogas
            .map((y: any) => (typeof y === 'string' ? y : y?.name || ''))
            .filter(Boolean);
        }
      } catch (e) {
        console.error('Failed to parse yogas:', e);
      }

      let parsedDoshas: string[] = [];
      try {
        const rawDoshas = JSON.parse(user.astrology.doshas);
        if (Array.isArray(rawDoshas)) {
          parsedDoshas = rawDoshas
            .map((d: any) => (typeof d === 'string' ? d : d?.name || ''))
            .filter(Boolean);
        }
      } catch (e) {
        console.error('Failed to parse doshas:', e);
      }

      let nakshatraStr = '';
      try {
        const rawNak = JSON.parse(user.astrology.nakshatra);
        nakshatraStr = typeof rawNak === 'string' ? rawNak : rawNak?.name || '';
      } catch (e) {
        console.error('Failed to parse nakshatra:', e);
      }

      let dashaStr = '';
      try {
        const rawDasha = JSON.parse(user.astrology.dashaPeriods);
        if (rawDasha && rawDasha.currentMahadasha) {
          dashaStr = `${rawDasha.currentMahadasha.planet} (Mahadasha)`;
          if (rawDasha.currentAntardasha) {
            dashaStr += ` / ${rawDasha.currentAntardasha.planet} (Antardasha)`;
          }
        }
      } catch (e) {
        console.error('Failed to parse dashaPeriods:', e);
      }

      let planetaryPos: Record<string, PlanetaryPosition> | undefined;
      try {
        if (user.astrology.planetaryPositions) {
          planetaryPos = JSON.parse(user.astrology.planetaryPositions);
        }
      } catch (e) {
        console.error('Failed to parse planetaryPositions:', e);
      }

      finalAstrologyData = {
        sunSign: user.astrology.sunSign,
        moonSign: user.astrology.moonSign,
        ascendant: user.astrology.ascendant,
        nakshatra: nakshatraStr,
        currentDasha: dashaStr,
        yogas: parsedYogas,
        doshas: parsedDoshas,
        planetaryPositions: planetaryPos,
      };
    }

    // Resolve numerologyData
    let finalNumerologyData = numerologyData;
    if (!finalNumerologyData) {
      if (!user.numerology) {
        return NextResponse.json(
          { success: false, error: 'Numerology calculations not found in database. Complete onboarding first.' },
          { status: 400 }
        );
      }
      finalNumerologyData = {
        lifePathNumber: user.numerology.lifePathNumber,
        destinyNumber: user.numerology.destinyNumber,
        soulUrgeNumber: user.numerology.soulUrgeNumber,
      };
    }

    // Resolve traitScores (merge database scores with any provided scores)
    let finalTraitScores: Record<string, number> = {};
    if (user.traits) {
      finalTraitScores = {
        emotionalIntensity: user.traits.emotionalIntensity,
        attachmentStyle: user.traits.attachmentStyle,
        ambition: user.traits.ambition,
        trust: user.traits.trust,
        communicationOpenness: user.traits.communicationOpenness,
        impulsiveness: user.traits.impulsiveness,
        empathy: user.traits.empathy,
        resilience: user.traits.resilience,
        creativity: user.traits.creativity,
        intuition: user.traits.intuition,
        discipline: user.traits.discipline,
        socialEnergy: user.traits.socialEnergy,
        patience: user.traits.patience,
        adaptability: user.traits.adaptability,
      };
    }

    if (traitScores) {
      for (const [key, val] of Object.entries(traitScores)) {
        if (val !== undefined && val !== null) {
          finalTraitScores[key] = val;
        }
      }
    }

    // Check if we have all required traits
    const traitKeys = [
      'emotionalIntensity',
      'attachmentStyle',
      'ambition',
      'trust',
      'communicationOpenness',
      'impulsiveness',
      'empathy',
      'resilience',
      'creativity',
      'intuition',
      'discipline',
      'socialEnergy',
      'patience',
      'adaptability',
    ];
    for (const key of traitKeys) {
      if (finalTraitScores[key] === undefined) {
        return NextResponse.json(
          { success: false, error: `Missing trait score for: ${key}. Please complete onboarding first.` },
          { status: 400 }
        );
      }
    }

    // Build AI report input
    const aiInput: AIReportInput = {
      sunSign: finalAstrologyData.sunSign,
      moonSign: finalAstrologyData.moonSign,
      ascendant: finalAstrologyData.ascendant,
      nakshatra: finalAstrologyData.nakshatra ?? '',
      currentDasha: finalAstrologyData.currentDasha ?? '',
      yogas: finalAstrologyData.yogas ?? [],
      doshas: finalAstrologyData.doshas ?? [],
      planetaryPositions: finalAstrologyData.planetaryPositions as Record<string, PlanetaryPosition> | undefined,
      lifePathNumber: finalNumerologyData.lifePathNumber,
      destinyNumber: finalNumerologyData.destinyNumber,
      soulUrgeNumber: finalNumerologyData.soulUrgeNumber,
      traits: finalTraitScores as unknown as TraitScores,
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
