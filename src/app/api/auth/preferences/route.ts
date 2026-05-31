import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import crypto from 'crypto';

// ─── Zod Schema ─────────────────────────────────────────────────────────────

const preferencesSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  language: z.enum(['en', 'hi', 'hinglish']).optional(),
  darkMode: z.boolean().optional(),
  dailyHoroscope: z.boolean().optional(),
  moodReminders: z.boolean().optional(),
  vedicLevel: z.enum(['standard', 'detailed', 'hinglish']).optional(),
  notificationsEnabled: z.boolean().optional(),
  ucpEnabled: z.boolean().optional(),
  rotateUcpToken: z.boolean().optional(),
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

    const { userId, rotateUcpToken, ...updates } = parsed.data;

    // Verify user exists
    const user = await db.user.findUnique({ 
      where: { id: userId },
      include: { preferences: true }
    });
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const finalUpdates: any = { ...updates };
    const existingPrefs = user.preferences;

    if (rotateUcpToken || (updates.ucpEnabled === true && (!existingPrefs || !existingPrefs.ucpToken))) {
      finalUpdates.ucpToken = 'ucp_' + crypto.randomBytes(16).toString('hex');
    }

    // Upsert preferences
    const preferences = await db.userPreferences.upsert({
      where: { userId },
      update: finalUpdates,
      create: {
        userId,
        ...finalUpdates,
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
        ucpEnabled: preferences.ucpEnabled,
        ucpToken: preferences.ucpToken,
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
