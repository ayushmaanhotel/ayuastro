import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { calculateNumerology } from '@/lib/numerology';
import { requireApiUser } from '@/lib/api-auth';

// ─── Zod Schema ───────────────────────────────────────────────────────────────

const numerologySchema = z.object({
  userId: z.string().min(1, 'User ID is required').optional(),
  fullName: z.string().min(1, 'Full name is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
});

// ─── POST Handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = numerologySchema.safeParse(body);

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
    const { fullName, dateOfBirth } = parsed.data;
    const userId = auth.userId;

    // Verify user exists
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Calculate numerology using the engine
    const numerologyResult = calculateNumerology({
      fullName,
      birthDate: dateOfBirth,
    });

    // Save to NumerologyData table (upsert)
    await db.numerologyData.upsert({
      where: { userId },
      update: {
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
      create: {
        userId,
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

    return NextResponse.json({
      success: true,
      data: {
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
      },
    });
  } catch (error) {
    console.error('[Numerology API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to calculate numerology data' },
      { status: 500 }
    );
  }
}
