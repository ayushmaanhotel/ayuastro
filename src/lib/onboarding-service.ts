import { db } from '@/lib/db';
import { calculateKundali, getCalculationMethod, initializeSwissEphemeris } from '@/lib/astrology';
import { calculateNumerology } from '@/lib/numerology';
import {
  computeAllTraits,
  validateInput,
  toDatabaseFormat,
  TRAIT_METADATA,
} from '@/lib/scoring';
import { generateFreeReport, generateReport } from '@/lib/ai';
import type { AIReportInput, TraitScores as AITraitScores } from '@/lib/ai';
import type {
  AstrologyInput,
  NumerologyInput as ScoringNumerologyInput,
  QuestionnaireAnswer as ScoringQuestionnaireAnswer,
  ScoringInput,
} from '@/lib/scoring';

export interface OnboardingQuestionnaireAnswer {
  questionId: string;
  answer: string;
  category: 'emotional' | 'social' | 'behavioral' | 'relational';
  score?: number;
}

export interface OnboardingInput {
  name: string;
  dateOfBirth: string;
  timeOfBirth: string;
  placeOfBirth: string;
  latitude: number;
  longitude: number;
  timezone?: number;
  gender?: 'male' | 'female' | 'other';
  relationshipStatus?: string;
  questionnaireAnswers?: OnboardingQuestionnaireAnswer[];
  reportType?: 'personality' | 'relationship' | 'emotional_pattern';
  freeOnly?: boolean;
}

function safeStringify(obj: unknown): string {
  return JSON.stringify(obj, (_key, value) => {
    if (value instanceof Date) return value.toISOString();
    return value;
  });
}

export async function processAuthenticatedOnboarding(
  userId: string,
  data: OnboardingInput,
  options: { generateAiReport: boolean }
) {
  await initializeSwissEphemeris();

  const errors: string[] = [];
  const warnings: string[] = [];

  const user = await db.user.upsert({
    where: { id: userId },
    update: {
      name: data.name,
      isOnboarded: true,
    },
    create: {
      id: userId,
      name: data.name,
      isOnboarded: true,
      preferences: {
        create: {
          language: 'en',
          vedicLevel: 'standard',
        },
      },
    },
  });

  await db.profile.deleteMany({ where: { userId: user.id } });
  await db.astrologyData.deleteMany({ where: { userId: user.id } });
  await db.numerologyData.deleteMany({ where: { userId: user.id } });
  await db.traitScores.deleteMany({ where: { userId: user.id } });
  await db.questionnaireAnswer.deleteMany({ where: { userId: user.id } });

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

  let kundali: ReturnType<typeof calculateKundali> | null = null;
  try {
    kundali = calculateKundali(
      new Date(data.dateOfBirth),
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
    console.error('[Onboarding Service] Astrology error:', error);
  }

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
    console.error('[Onboarding Service] Numerology error:', error);
  }

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

      const scoringQuestionnaire: ScoringQuestionnaireAnswer[] = (data.questionnaireAnswers ?? []).map((qa) => {
        const numericAnswer = qa.score ?? parseInt(qa.answer, 10);
        const likertValue = Number.isFinite(numericAnswer)
          ? Math.max(1, Math.min(5, numericAnswer)) as 1 | 2 | 3 | 4 | 5
          : 3;
        return {
          questionId: qa.questionId,
          answer: likertValue,
          category: qa.category as ScoringQuestionnaireAnswer['category'],
        };
      });

      const scoringInput: ScoringInput = {
        astrology: scoringAstrology,
        numerology: scoringNumerology,
        questionnaire: scoringQuestionnaire,
      };

      const validation = validateInput(scoringInput);
      if (validation.warnings.length > 0) {
        warnings.push(...validation.warnings);
      }

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
      console.error('[Onboarding Service] Traits error:', error);
    }
  } else {
    errors.push('Traits: Skipped due to missing astrology or numerology data');
  }

  let reportData: {
    reportId: string;
    title: string;
    summary: string;
    sections: unknown[];
  } | null = null;

  if (options.generateAiReport && kundali && numerologyResult && traitResult) {
    try {
      const currentDasha = kundali.dashaPeriods.currentMahadasha
        ? `${kundali.dashaPeriods.currentMahadasha.planet} (Mahadasha)` +
          (kundali.dashaPeriods.currentAntardasha
            ? ` / ${kundali.dashaPeriods.currentAntardasha.planet} (Antardasha)`
            : '')
        : 'Unknown';

      const traitScoresForAI: AITraitScores = {
        emotionalIntensity: traitResult.traits.emotionalIntensity.score,
        attachmentStyle: traitResult.traits.attachmentStyle.score,
        ambition: traitResult.traits.ambition.score,
        trust: traitResult.traits.trust.score,
        communicationOpenness: traitResult.traits.communicationOpenness.score,
        impulsiveness: traitResult.traits.impulsiveness.score,
        empathy: traitResult.traits.empathy.score,
        resilience: traitResult.traits.resilience.score,
        creativity: traitResult.traits.creativity.score,
        intuition: traitResult.traits.intuition.score,
        discipline: traitResult.traits.discipline.score,
        socialEnergy: traitResult.traits.socialEnergy.score,
        patience: traitResult.traits.patience.score,
        adaptability: traitResult.traits.adaptability.score,
      };

      const aiInput: AIReportInput = {
        sunSign: kundali.sunSign,
        moonSign: kundali.moonSign,
        ascendant: kundali.ascendant,
        nakshatra: kundali.nakshatra.name,
        currentDasha,
        yogas: kundali.yogas.filter((y) => y.present).map((y) => y.name),
        doshas: kundali.doshas.filter((d) => d.present).map((d) => d.name),
        lifePathNumber: numerologyResult.lifePathNumber,
        destinyNumber: numerologyResult.destinyNumber,
        soulUrgeNumber: numerologyResult.soulUrgeNumber,
        traits: traitScoresForAI,
      };

      const reportType = data.reportType ?? 'personality';
      const freeOnly = data.freeOnly ?? true;
      const generatedReport = freeOnly
        ? await generateFreeReport(aiInput)
        : await generateReport(aiInput);

      const savedReport = await db.report.create({
        data: {
          userId: user.id,
          type: reportType,
          title: generatedReport.title,
          summary: generatedReport.summary,
          sections: JSON.stringify(generatedReport.sections),
          isPremium: !freeOnly,
        },
      });

      reportData = {
        reportId: savedReport.id,
        title: savedReport.title,
        summary: savedReport.summary,
        sections: generatedReport.sections,
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'AI report generation failed';
      errors.push(`AI Report: ${msg}`);
      console.error('[Onboarding Service] AI Report error:', error);
    }
  }

  const hasPartialSuccess = kundali || numerologyResult || traitResult || reportData;

  return {
    success: Boolean(hasPartialSuccess),
    data: {
      userId: user.id,
      calculationMethod: getCalculationMethod(),
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
      report: reportData,
    },
    errors: errors.length > 0 ? errors : undefined,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}
