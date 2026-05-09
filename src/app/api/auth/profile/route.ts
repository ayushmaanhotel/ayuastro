import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

// ─── Zod Schema ─────────────────────────────────────────────────────────────

const profileQuerySchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
});

// ─── GET Handler ────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = profileQuerySchema.safeParse({
      userId: searchParams.get('userId'),
    });

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

    const { userId } = parsed.data;

    // Fetch user with profile, preferences, and astrology data
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        preferences: true,
        astrology: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Build response with preferences
    const preferences = user.preferences
      ? {
          language: user.preferences.language,
          darkMode: user.preferences.darkMode,
          dailyHoroscope: user.preferences.dailyHoroscope,
          moodReminders: user.preferences.moodReminders,
          vedicLevel: user.preferences.vedicLevel,
          notificationsEnabled: user.preferences.notificationsEnabled,
        }
      : {
          language: 'en',
          darkMode: false,
          dailyHoroscope: true,
          moodReminders: true,
          vedicLevel: 'standard',
          notificationsEnabled: true,
        };

    // Build astrology summary if available
    const astrologySummary = user.astrology
      ? {
          sunSign: user.astrology.sunSign,
          moonSign: user.astrology.moonSign,
          ascendant: user.astrology.ascendant,
        }
      : null;

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        isOnboarded: user.isOnboarded,
        hasPaid: user.hasPaid,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      profile: user.profile,
      preferences,
      astrologySummary,
    });
  } catch (error) {
    console.error('[Profile API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}
