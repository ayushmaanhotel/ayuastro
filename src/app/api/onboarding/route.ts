import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireApiUser } from '@/lib/api-auth';
import { processAuthenticatedOnboarding } from '@/lib/onboarding-service';

const questionnaireAnswerSchema = z.object({
  questionId: z.string().min(1),
  answer: z.string().min(1),
  category: z.enum(['emotional', 'social', 'behavioral', 'relational']),
  score: z.number().min(1).max(5).optional(),
});

const onboardingSchema = z.object({
  userId: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  timeOfBirth: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
  placeOfBirth: z.string().min(1, 'Place of birth is required'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  timezone: z.union([z.string(), z.number()]).optional().transform((v) => {
    if (typeof v === 'string') {
      const tzOffsets: Record<string, number> = {
        'Asia/Kolkata': 5.5,
        'Asia/Calcutta': 5.5,
      };
      return tzOffsets[v] ?? 5.5;
    }
    return v ?? 5.5;
  }),
  gender: z.enum(['male', 'female', 'other']).optional(),
  relationshipStatus: z
    .enum(['single', 'in_relationship', 'married', 'divorced', 'widowed', 'complicated'])
    .optional(),
  questionnaireAnswers: z.array(questionnaireAnswerSchema).optional(),
});

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

    const auth = await requireApiUser(request, parsed.data.userId);
    if (!auth.ok) return auth.response;

    const result = await processAuthenticatedOnboarding(auth.userId, parsed.data, {
      generateAiReport: false,
    });

    return NextResponse.json(result, { status: result.success ? 200 : 500 });
  } catch (error) {
    console.error('[Onboarding API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save onboarding data' },
      { status: 500 }
    );
  }
}
