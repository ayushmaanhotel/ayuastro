import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

// ─── Zod Schema ─────────────────────────────────────────────────────────────

const preferencesSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  language: z.enum(['en', 'hi', 'hinglish']).optional(),
  darkMode: z.boolean().optional(),
  dailyHoroscope: z.boolean().optional(),
  moodReminders: z.boolean().optional(),
  vedicLevel: z.enum(['standard', 'detailed', 'hinglish']).optional(),
  notificationsEnabled: z.boolean().optional(),
});

// ─── PUT Handler ────────────────────────────────────────────────────────────

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = preferencesSchema.safeParse(body);

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

    const { userId, ...updates } = parsed.data;

    // Verify user exists
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Upsert preferences
    const preferences = await db.userPreferences.upsert({
      where: { userId },
      update: updates,
      create: {
        userId,
        ...updates,
      },
    });

    return NextResponse.json({
      success: true,
      preferences: {
        language: preferences.language,
        darkMode: preferences.darkMode,
        dailyHoroscope: preferences.dailyHoroscope,
        moodReminders: preferences.moodReminders,
        vedicLevel: preferences.vedicLevel,
        notificationsEnabled: preferences.notificationsEnabled,
      },
    });
  } catch (error) {
    console.error('[Preferences API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}
