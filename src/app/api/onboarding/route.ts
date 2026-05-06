import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

// ─── Zod Schemas ──────────────────────────────────────────────────────────────

const questionnaireAnswerSchema = z.object({
  questionId: z.string().min(1),
  answer: z.string().min(1),
  category: z.enum(['emotional', 'social', 'behavioral', 'relational']),
});

const onboardingSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  timeOfBirth: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
  placeOfBirth: z.string().min(1, 'Place of birth is required'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  timezone: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  relationshipStatus: z
    .enum(['single', 'in_relationship', 'married', 'divorced', 'widowed', 'complicated'])
    .optional(),
  questionnaireAnswers: z.array(questionnaireAnswerSchema).optional(),
});

// ─── POST Handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = onboardingSchema.safeParse(body);

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

    // Create or update user
    const user = await db.user.create({
      data: {
        name: data.name,
        isOnboarded: true,
      },
    });

    // Create or update profile
    await db.profile.upsert({
      where: { userId: user.id },
      update: {
        dateOfBirth: data.dateOfBirth,
        timeOfBirth: data.timeOfBirth,
        placeOfBirth: data.placeOfBirth,
        latitude: data.latitude,
        longitude: data.longitude,
        timezone: data.timezone ?? null,
        gender: data.gender ?? null,
        relationshipStatus: data.relationshipStatus ?? null,
      },
      create: {
        userId: user.id,
        dateOfBirth: data.dateOfBirth,
        timeOfBirth: data.timeOfBirth,
        placeOfBirth: data.placeOfBirth,
        latitude: data.latitude,
        longitude: data.longitude,
        timezone: data.timezone ?? null,
        gender: data.gender ?? null,
        relationshipStatus: data.relationshipStatus ?? null,
      },
    });

    // Save questionnaire answers if provided
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

    return NextResponse.json({
      success: true,
      data: {
        userId: user.id,
        message: 'Onboarding completed successfully',
      },
    });
  } catch (error) {
    console.error('[Onboarding API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save onboarding data' },
      { status: 500 }
    );
  }
}
