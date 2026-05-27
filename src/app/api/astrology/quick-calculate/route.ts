import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { calculateKundali } from '@/lib/astrology';
import { calculateNumerology } from '@/lib/numerology';
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

const questionnaireAnswerSchema = z.object({
  questionId: z.string().min(1),
  answer: z.string().min(1),
  category: z.enum(['emotional', 'social', 'behavioral', 'relational']),
  score: z.number().min(1).max(5).optional(),
});

const quickCalculateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  timeOfBirth: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
  placeOfBirth: z.string().min(1, 'Place of birth is required'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  timezone: z.union([z.string(), z.number()]).optional().transform(v => {
    if (typeof v === 'string') {
      const tzOffsets: Record<string, number> = {
        'Asia/Kolkata': 5.5,
        'Asia/Calcutta': 5.5,
        'Asia/Mumbai': 5.5,
        'Asia/Delhi': 5.5,
        'Asia/Chennai': 5.5,
      };
      return tzOffsets[v] ?? 5.5;
    }
    return v ?? 5.5;
  }),
  gender: z.enum(['male', 'female', 'other', 'Male', 'Female', 'Other']).optional().transform(v => v?.toLowerCase() as 'male' | 'female' | 'other' | undefined),
  relationshipStatus: z
    .enum(['single', 'in_relationship', 'married', 'divorced', 'widowed', 'complicated', 'Single', 'Partnered', "It's Complicated", 'Prefer Not to Say'])
    .optional()
    .transform(v => {
      if (!v) return v;
      const map: Record<string, string> = {
        'Single': 'single',
        'Partnered': 'in_relationship',
        "It's Complicated": 'complicated',
        'Prefer Not to Say': 'complicated',
      };
      return map[v] ?? v.toLowerCase();
    }),
  questionnaireAnswers: z.array(questionnaireAnswerSchema).optional(),
});

// ─── Helper: Serialize dates for JSON ─────────────────────────────────────────

function safeStringify(obj: unknown): string {
  return JSON.stringify(obj, (_key, value) => {
    if (value instanceof Date) return value.toISOString();
    return value;
  });
}

// ─── POST Handler ─────────────────────────────────────────────────────────────
// This endpoint does ONLY: Create user → Calculate astrology → Calculate numerology
// → Calculate trait scores → Return results immediately.
// NO AI report generation — that happens asynchronously via /api/ai/generate-report-async

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = quickCalculateSchema.safeParse(body);

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

    const data = parsed.data;
    const errors: string[] = [];

    // ── Step 1: Create User & Profile ────────────────────────────────────────
    const user = await db.user.create({
      data: {
        name: data.name,
        isOnboarded: true,
      },
    });

    await db.profile.create({
      data: {
        userId: user.id,
        dateOfBirth: data.dateOfBirth,
        timeOfBirth: data.timeOfBirth,
        placeOfBirth: data.placeOfBirth,
        latitude: data.latitude,
        longitude: data.longitude,
        timezone: String(data.timezone ?? 5.5),
        gender: data.gender ?? null,
        relationshipStatus: data.relationshipStatus ?? null,
      },
    });

    // Save questionnaire answers
    if (data.questionnaireAnswers && data.questionnaireAnswers.length > 0) {
      await db.questionnaireAnswer.createMany({
        data: data.questionnaireAnswers.map((qa) => ({
          userId: user.id,
          questionId: qa.questionId,
          answer: qa.answer,
          category: qa.category,
        })),
      });
    }

    // ── Step 2: Calculate Astrology ──────────────────────────────────────────
    let kundali: ReturnType<typeof calculateKundali> | null = null;
    try {
      const birthDate = new Date(data.dateOfBirth);
      kundali = calculateKundali(
        birthDate,
        data.timeOfBirth,
        data.latitude,
        data.longitude,
        data.timezone ?? 5.5
      );

      await db.astrologyData.create({
        data: {
          userId: user.id,
          sunSign: kundali.sunSign,
          moonSign: kundali.moonSign,
          ascendant: kundali.ascendant,
          planetaryPositions: safeStringify(kundali.planetaryPositions),
          houses: safeStringify(kundali.houses),
          nakshatra: safeStringify(kundali.nakshatra),
          dashaPeriods: safeStringify(kundali.dashaPeriods),
          yogas: safeStringify(kundali.yogas),
          doshas: safeStringify(kundali.doshas),
        },
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Astrology calculation failed';
      errors.push(`Astrology: ${msg}`);
      console.error('[Quick-Calculate] Astrology error:', error);
    }

    // ── Step 3: Calculate Numerology ─────────────────────────────────────────
    let numerologyResult: ReturnType<typeof calculateNumerology> | null = null;
    try {
      numerologyResult = calculateNumerology({
        fullName: data.name,
        birthDate: data.dateOfBirth,
      });

      await db.numerologyData.create({
        data: {
          userId: user.id,
          lifePathNumber: numerologyResult.lifePathNumber,
          destinyNumber: numerologyResult.destinyNumber,
          soulUrgeNumber: numerologyResult.soulUrgeNumber,
          personalityNumber: numerologyResult.personalityNumber,
          birthdayNumber: numerologyResult.birthdayNumber,
          lifePathDesc: numerologyResult.lifePathDesc,
          destinyDesc: numerologyResult.destinyDesc,
          soulUrgeDesc: numerologyResult.soulUrgeDesc,
          personalityDesc: numerologyResult.personalityDesc,
        },
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Numerology calculation failed';
      errors.push(`Numerology: ${msg}`);
      console.error('[Quick-Calculate] Numerology error:', error);
    }

    // ── Step 4: Generate Trait Scores ────────────────────────────────────────
    let traitResult: ReturnType<typeof computeAllTraits> | null = null;
    if (kundali && numerologyResult) {
      try {
        const scoringAstrology: AstrologyInput = {
          sunSign: kundali.sunSign,
          moonSign: kundali.moonSign,
          ascendant: kundali.ascendant,
          planetaryPositions: Object.values(kundali.planetaryPositions).map((pos) => ({
            planet: pos.planet as AstrologyInput['planetaryPositions'][number]['planet'],
            sign: pos.sign,
            degree: pos.degreeInSign,
            house: kundali.houses.find((h) => h.planets.includes(pos.planet))?.houseNumber,
            retrograde: pos.isRetrograde,
          })),
          houses: kundali.houses,
          nakshatra: {
            name: kundali.nakshatra.name,
            pada: kundali.nakshatra.pada,
            ruler: kundali.nakshatra.ruler as AstrologyInput['nakshatra'] extends { ruler: infer R } ? R : never,
          },
          yogas: kundali.yogas.map((y) => ({
            name: y.name,
            type: (y.strength === 'Strong' || y.strength === 'Moderate' ? 'benefic' : 'malefic') as 'benefic' | 'malefic',
            planets: y.involvingPlanets as AstrologyInput['yogas'][number]['planets'],
            description: y.description,
          })),
          doshas: kundali.doshas.map((d) => ({
            name: d.name,
            severity: (d.severity === 'High' ? 'high' : d.severity === 'Medium' ? 'medium' : 'low') as 'low' | 'medium' | 'high',
            description: d.description,
          })),
        };

        const scoringNumerology: ScoringNumerologyInput = {
          lifePathNumber: numerologyResult.lifePathNumber,
          destinyNumber: numerologyResult.destinyNumber,
          soulUrgeNumber: numerologyResult.soulUrgeNumber,
          personalityNumber: numerologyResult.personalityNumber,
          birthdayNumber: numerologyResult.birthdayNumber,
        };

        const scoringQuestionnaire: ScoringQuestionnaireAnswer[] = (data.questionnaireAnswers ?? []).map(
          (qa) => {
            let likertValue: 1 | 2 | 3 | 4 | 5;
            if (qa.score) {
              likertValue = Math.max(1, Math.min(5, qa.score)) as 1 | 2 | 3 | 4 | 5;
            } else {
              const numericAnswer = parseInt(qa.answer, 10);
              likertValue = isNaN(numericAnswer)
                ? 3
                : Math.max(1, Math.min(5, numericAnswer)) as 1 | 2 | 3 | 4 | 5;
            }
            return {
              questionId: qa.questionId,
              answer: likertValue,
              category: qa.category as ScoringQuestionnaireAnswer['category'],
            };
          }
        );

        const scoringInput: ScoringInput = {
          astrology: scoringAstrology,
          numerology: scoringNumerology,
          questionnaire: scoringQuestionnaire,
        };

        validateInput(scoringInput);
        traitResult = computeAllTraits(scoringInput);

        const dbRecord = toDatabaseFormat(traitResult, user.id);
        await db.traitScores.create({
          data: {
            userId: user.id,
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
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Trait scoring failed';
        errors.push(`Traits: ${msg}`);
        console.error('[Quick-Calculate] Traits error:', error);
      }
    } else {
      errors.push('Traits: Skipped due to missing astrology or numerology data');
    }

    // ── Build Response (NO AI report) ────────────────────────────────────────
    const hasPartialSuccess = kundali || numerologyResult || traitResult;

    return NextResponse.json(
      {
        success: hasPartialSuccess ? true : false,
        data: {
          userId: user.id,
          astrology: kundali
            ? {
                sunSign: kundali.sunSign,
                moonSign: kundali.moonSign,
                ascendant: kundali.ascendant,
                ayanamsa: kundali.ayanamsa,
                planetaryPositions: kundali.planetaryPositions,
                houses: kundali.houses,
                chart: kundali.chart,
                nakshatra: kundali.nakshatra,
                dashaPeriods: kundali.dashaPeriods,
                yogas: kundali.yogas,
                doshas: kundali.doshas,
              }
            : null,
          numerology: numerologyResult
            ? {
                lifePathNumber: numerologyResult.lifePathNumber,
                destinyNumber: numerologyResult.destinyNumber,
                soulUrgeNumber: numerologyResult.soulUrgeNumber,
                personalityNumber: numerologyResult.personalityNumber,
                birthdayNumber: numerologyResult.birthdayNumber,
                maturityNumber: numerologyResult.maturityNumber,
                personalYearNumber: numerologyResult.personalYearNumber,
                descriptions: {
                  lifePath: numerologyResult.lifePathDesc,
                  destiny: numerologyResult.destinyDesc,
                  soulUrge: numerologyResult.soulUrgeDesc,
                  personality: numerologyResult.personalityDesc,
                },
              }
            : null,
          traits: traitResult
            ? Object.entries(traitResult.traits).map(([traitId, trait]) => {
                const metadata = TRAIT_METADATA[traitId as keyof typeof TRAIT_METADATA];
                return {
                  id: traitId,
                  label: metadata?.label ?? traitId,
                  description: metadata?.description ?? '',
                  score: trait.score,
                  lowLabel: metadata?.lowLabel ?? '',
                  highLabel: metadata?.highLabel ?? '',
                };
              })
            : null,
        },
        errors: errors.length > 0 ? errors : undefined,
      },
      { status: hasPartialSuccess ? 200 : 500 }
    );
  } catch (error) {
    console.error('[Quick-Calculate API] Fatal error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process data' },
      { status: 500 }
    );
  }
}
