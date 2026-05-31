export const maxDuration = 300;
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import {
  computeAllTraits,
  validateInput,
  toDatabaseFormat,
  TRAIT_METADATA,
} from '@/lib/scoring';
import type {
  AstrologyInput,
  NumerologyInput as ScoringNumerologyInput,
  QuestionnaireAnswer as ScoringQuestionnaireAnswer,
  ScoringInput,
} from '@/lib/scoring';

// ─── Zod Schema ───────────────────────────────────────────────────────────────

const planetaryPositionSchema = z.object({
  planet: z.string(),
  sign: z.string(),
  degree: z.number().optional(),
  house: z.number().optional(),
  retrograde: z.boolean().optional(),
});

const houseSchema = z.object({
  houseNumber: z.number(),
  sign: z.string(),
  planets: z.array(z.string()),
});

const yogaSchema = z.object({
  name: z.string(),
  type: z.enum(['benefic', 'malefic']),
  planets: z.array(z.string()),
  description: z.string().optional(),
});

const doshaSchema = z.object({
  name: z.string(),
  severity: z.enum(['low', 'medium', 'high']),
  description: z.string().optional(),
});

const nakshatraSchema = z.object({
  name: z.string(),
  pada: z.number(),
  ruler: z.string(),
});

const questionnaireAnswerApiSchema = z.object({
  questionId: z.string().min(1),
  answer: z.number().int().min(1).max(5),
  category: z.enum(['emotional', 'social', 'behavioral', 'relational']),
});

const traitsSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  astrologyData: z.object({
    sunSign: z.string(),
    moonSign: z.string(),
    ascendant: z.string(),
    planetaryPositions: z.array(planetaryPositionSchema).optional(),
    houses: z.array(houseSchema).optional(),
    nakshatra: nakshatraSchema.optional(),
    yogas: z.array(yogaSchema),
    doshas: z.array(doshaSchema),
  }),
  numerologyData: z.object({
    lifePathNumber: z.number().int().min(1).max(33),
    destinyNumber: z.number().int().min(1).max(33),
    soulUrgeNumber: z.number().int().min(1).max(33),
    personalityNumber: z.number().int().min(1).max(33),
    birthdayNumber: z.number().int().min(1).max(31),
  }),
  questionnaireAnswers: z.array(questionnaireAnswerApiSchema).optional(),
});

// ─── POST Handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = traitsSchema.safeParse(body);

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

    const { userId, astrologyData, numerologyData, questionnaireAnswers } = parsed.data;

    // Verify user exists
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Build scoring engine input
    const scoringAstrology: AstrologyInput = {
      sunSign: astrologyData.sunSign as AstrologyInput['sunSign'],
      moonSign: astrologyData.moonSign as AstrologyInput['moonSign'],
      ascendant: astrologyData.ascendant as AstrologyInput['ascendant'],
      planetaryPositions: (astrologyData.planetaryPositions ?? []) as AstrologyInput['planetaryPositions'],
      houses: (astrologyData.houses ?? []) as AstrologyInput['houses'],
      nakshatra: astrologyData.nakshatra as AstrologyInput['nakshatra'],
      yogas: astrologyData.yogas as AstrologyInput['yogas'],
      doshas: astrologyData.doshas as AstrologyInput['doshas'],
    };

    const scoringNumerology: ScoringNumerologyInput = {
      lifePathNumber: numerologyData.lifePathNumber,
      destinyNumber: numerologyData.destinyNumber,
      soulUrgeNumber: numerologyData.soulUrgeNumber,
      personalityNumber: numerologyData.personalityNumber,
      birthdayNumber: numerologyData.birthdayNumber,
    };

    const scoringQuestionnaire: ScoringQuestionnaireAnswer[] = (questionnaireAnswers ?? []).map(
      (qa) => ({
        questionId: qa.questionId,
        answer: qa.answer as 1 | 2 | 3 | 4 | 5,
        category: qa.category as ScoringQuestionnaireAnswer['category'],
      })
    );

    const scoringInput: ScoringInput = {
      astrology: scoringAstrology,
      numerology: scoringNumerology,
      questionnaire: scoringQuestionnaire,
    };

    // Validate input
    const validation = validateInput(scoringInput);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Scoring input validation failed',
          details: validation.errors,
          warnings: validation.warnings,
        },
        { status: 400 }
      );
    }

    // Compute all trait scores
    const scoringResult = computeAllTraits(scoringInput);

    // Convert to database format and save
    const dbRecord = toDatabaseFormat(scoringResult, userId);

    await db.traitScores.upsert({
      where: { userId },
      update: {
        emotionalIntensity: dbRecord.emotionalIntensity as number,
        attachmentStyle: dbRecord.attachmentStyle as number,
        ambition: dbRecord.ambition as number,
        trust: dbRecord.trust as number,
        communicationOpenness: dbRecord.communicationOpenness as number,
        impulsiveness: dbRecord.impulsiveness as number,
        empathy: dbRecord.empathy as number,
        resilience: dbRecord.resilience as number,
        creativity: dbRecord.creativity as number,
        intuition: dbRecord.intuition as number,
        discipline: dbRecord.discipline as number,
        socialEnergy: dbRecord.socialEnergy as number,
        patience: dbRecord.patience as number,
        adaptability: dbRecord.adaptability as number,
        additionalTraits: dbRecord.additionalTraits as string | null,
      },
      create: {
        userId,
        emotionalIntensity: dbRecord.emotionalIntensity as number,
        attachmentStyle: dbRecord.attachmentStyle as number,
        ambition: dbRecord.ambition as number,
        trust: dbRecord.trust as number,
        communicationOpenness: dbRecord.communicationOpenness as number,
        impulsiveness: dbRecord.impulsiveness as number,
        empathy: dbRecord.empathy as number,
        resilience: dbRecord.resilience as number,
        creativity: dbRecord.creativity as number,
        intuition: dbRecord.intuition as number,
        discipline: dbRecord.discipline as number,
        socialEnergy: dbRecord.socialEnergy as number,
        patience: dbRecord.patience as number,
        adaptability: dbRecord.adaptability as number,
        additionalTraits: dbRecord.additionalTraits as string | null,
      },
    });

    // Build response with trait labels and descriptions
    const traitsArray = Object.entries(scoringResult.traits).map(([traitId, traitResult]) => {
      const metadata = TRAIT_METADATA[traitId as keyof typeof TRAIT_METADATA];
      return {
        id: traitId,
        label: metadata?.label ?? traitId,
        description: metadata?.description ?? '',
        score: traitResult.score,
        lowLabel: metadata?.lowLabel ?? '',
        highLabel: metadata?.highLabel ?? '',
        contributions: traitResult.contributions,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        traits: traitsArray,
        computedAt: scoringResult.computedAt,
        warnings: validation.warnings,
      },
    });
  } catch (error) {
    console.error('[Traits API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate trait scores' },
      { status: 500 }
    );
  }
}
