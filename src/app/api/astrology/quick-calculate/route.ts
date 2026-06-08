import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireApiUser } from '@/lib/api-auth';
import { processAuthenticatedOnboarding } from '@/lib/onboarding-service';

export const maxDuration = 300;

const questionnaireAnswerSchema = z.object({
  questionId: z.string().min(1),
  answer: z.string().min(1),
  category: z.enum(['emotional', 'social', 'behavioral', 'relational']),
  score: z.number().min(1).max(5).optional(),
});

const quickCalculateSchema = z.object({
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
        'Asia/Mumbai': 5.5,
        'Asia/Delhi': 5.5,
        'Asia/Chennai': 5.5,
      };
      return tzOffsets[v] ?? 5.5;
    }
    return v ?? 5.5;
  }),
  gender: z.enum(['male', 'female', 'other', 'Male', 'Female', 'Other']).optional().transform((v) => v?.toLowerCase() as 'male' | 'female' | 'other' | undefined),
  relationshipStatus: z
    .enum(['single', 'in_relationship', 'married', 'divorced', 'widowed', 'complicated', 'Single', 'Partnered', "It's Complicated", 'Prefer Not to Say'])
    .optional()
    .transform((v) => {
      if (!v) return v;
      const map: Record<string, string> = {
        Single: 'single',
        Partnered: 'in_relationship',
        "It's Complicated": 'complicated',
        'Prefer Not to Say': 'complicated',
      };
      return map[v] ?? v.toLowerCase();
    }),
  questionnaireAnswers: z.array(questionnaireAnswerSchema).optional(),
});

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

    const auth = await requireApiUser(request, parsed.data.userId);
    if (!auth.ok) return auth.response;

    const result = await processAuthenticatedOnboarding(auth.userId, parsed.data, {
      generateAiReport: false,
    });

    return NextResponse.json(result, { status: result.success ? 200 : 500 });
  } catch (error) {
    console.error('[Quick-Calculate API] Fatal error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process data' },
      { status: 500 }
    );
  }
}
