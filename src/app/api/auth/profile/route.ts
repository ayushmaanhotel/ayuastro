import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { TRAIT_METADATA } from '@/lib/scoring';

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

    // Fetch user with profile, preferences, and calculations data
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        preferences: true,
        astrology: true,
        numerology: true,
        traits: true,
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
          ucpEnabled: user.preferences.ucpEnabled,
          ucpToken: user.preferences.ucpToken,
        }
      : {
          language: 'en',
          darkMode: false,
          dailyHoroscope: true,
          moodReminders: true,
          vedicLevel: 'standard',
          notificationsEnabled: true,
          ucpEnabled: false,
          ucpToken: null,
        };

    // Build astrology summary if available
    const astrologySummary = user.astrology
      ? {
          sunSign: user.astrology.sunSign,
          moonSign: user.astrology.moonSign,
          ascendant: user.astrology.ascendant,
        }
      : null;

    // Parse full astrology calculations if available
    let astrology: any = null;
    if (user.astrology) {
      try {
        astrology = {
          id: user.astrology.id,
          userId: user.astrology.userId,
          sunSign: user.astrology.sunSign,
          moonSign: user.astrology.moonSign,
          ascendant: user.astrology.ascendant,
          planetaryPositions: JSON.parse(user.astrology.planetaryPositions),
          houses: JSON.parse(user.astrology.houses),
          nakshatra: JSON.parse(user.astrology.nakshatra),
          dashaPeriods: JSON.parse(user.astrology.dashaPeriods),
          yogas: JSON.parse(user.astrology.yogas),
          doshas: JSON.parse(user.astrology.doshas),
          createdAt: user.astrology.createdAt,
          updatedAt: user.astrology.updatedAt,
        };
      } catch (e) {
        console.error('Failed to parse astrology JSON:', e);
      }
    }

    // Build numerology if available
    const numerology = user.numerology
      ? {
          lifePathNumber: user.numerology.lifePathNumber,
          destinyNumber: user.numerology.destinyNumber,
          soulUrgeNumber: user.numerology.soulUrgeNumber,
          personalityNumber: user.numerology.personalityNumber,
          birthdayNumber: user.numerology.birthdayNumber,
          descriptions: {
            lifePath: user.numerology.lifePathDesc,
            destiny: user.numerology.destinyDesc,
            soulUrge: user.numerology.soulUrgeDesc,
            personality: user.numerology.personalityDesc,
          },
        }
      : null;

    // Build traits list if available
    const traitKeys = [
      'emotionalIntensity',
      'attachmentStyle',
      'ambition',
      'trust',
      'communicationOpenness',
      'impulsiveness',
      'empathy',
      'resilience',
      'creativity',
      'intuition',
      'discipline',
      'socialEnergy',
      'patience',
      'adaptability',
    ] as const;

    const traits = user.traits
      ? traitKeys.map((key) => {
          const metadata = TRAIT_METADATA[key];
          return {
            id: key,
            label: metadata?.label ?? key,
            description: metadata?.description ?? '',
            score: user.traits![key],
            lowLabel: metadata?.lowLabel ?? '',
            highLabel: metadata?.highLabel ?? '',
          };
        })
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
      astrology,
      numerology,
      traits,
    });
  } catch (error) {
    console.error('[Profile API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}
