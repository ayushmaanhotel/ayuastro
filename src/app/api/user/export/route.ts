import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireApiUser } from '@/lib/api-auth';

// ─── Zod Schema ─────────────────────────────────────────────────────────────

const exportQuerySchema = z.object({
  userId: z.string().min(1, 'User ID is required').optional().nullable(),
});

// ─── GET Handler ────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = exportQuerySchema.safeParse({
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

    const auth = await requireApiUser(request, parsed.data.userId);
    if (!auth.ok) return auth.response;
    const userId = auth.userId;

    // Fetch user with all related data
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        astrology: true,
        numerology: true,
        traits: true,
        reports: true,
        answers: true,
        moodEntries: {
          orderBy: { createdAt: 'desc' },
        },
        gratitudeEntries: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
          message: `No user found with ID: ${userId}`,
        },
        { status: 404 }
      );
    }

    // Structure the response
    const exportedData = {
      exportDate: new Date().toISOString(),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isOnboarded: user.isOnboarded,
        hasPaid: user.hasPaid,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      profile: user.profile ? {
        dateOfBirth: user.profile.dateOfBirth,
        timeOfBirth: user.profile.timeOfBirth,
        placeOfBirth: user.profile.placeOfBirth,
        latitude: user.profile.latitude,
        longitude: user.profile.longitude,
        timezone: user.profile.timezone,
        gender: user.profile.gender,
        relationshipStatus: user.profile.relationshipStatus,
        occupation: user.profile.occupation,
      } : null,
      astrologyData: user.astrology ? {
        sunSign: user.astrology.sunSign,
        moonSign: user.astrology.moonSign,
        ascendant: user.astrology.ascendant,
        planetaryPositions: JSON.parse(user.astrology.planetaryPositions),
        houses: JSON.parse(user.astrology.houses),
        nakshatra: JSON.parse(user.astrology.nakshatra),
        dashaPeriods: JSON.parse(user.astrology.dashaPeriods),
        yogas: JSON.parse(user.astrology.yogas),
        doshas: JSON.parse(user.astrology.doshas),
      } : null,
      numerologyData: user.numerology ? {
        lifePathNumber: user.numerology.lifePathNumber,
        destinyNumber: user.numerology.destinyNumber,
        soulUrgeNumber: user.numerology.soulUrgeNumber,
        personalityNumber: user.numerology.personalityNumber,
        birthdayNumber: user.numerology.birthdayNumber,
        lifePathDesc: user.numerology.lifePathDesc,
        destinyDesc: user.numerology.destinyDesc,
        soulUrgeDesc: user.numerology.soulUrgeDesc,
        personalityDesc: user.numerology.personalityDesc,
      } : null,
      traitScores: user.traits ? {
        emotionalIntensity: user.traits.emotionalIntensity,
        attachmentStyle: user.traits.attachmentStyle,
        ambition: user.traits.ambition,
        trust: user.traits.trust,
        communicationOpenness: user.traits.communicationOpenness,
        impulsiveness: user.traits.impulsiveness,
        empathy: user.traits.empathy,
        resilience: user.traits.resilience,
        creativity: user.traits.creativity,
        intuition: user.traits.intuition,
        discipline: user.traits.discipline,
        socialEnergy: user.traits.socialEnergy,
        patience: user.traits.patience,
        adaptability: user.traits.adaptability,
      } : null,
      reports: user.reports.map((report) => ({
        id: report.id,
        type: report.type,
        title: report.title,
        summary: report.summary,
        sections: JSON.parse(report.sections),
        isPremium: report.isPremium,
        isPaid: report.isPaid,
        createdAt: report.createdAt,
      })),
      questionnaireAnswers: user.answers.map((answer) => ({
        questionId: answer.questionId,
        answer: answer.answer,
        category: answer.category,
        createdAt: answer.createdAt,
      })),
      moodEntries: user.moodEntries.map((entry) => ({
        mood: entry.mood,
        emoji: entry.emoji,
        note: entry.note,
        tags: JSON.parse(entry.tags),
        createdAt: entry.createdAt,
      })),
      gratitudeEntries: user.gratitudeEntries.map((entry) => ({
        slot: entry.slot,
        content: entry.content,
        createdAt: entry.createdAt,
      })),
    };

    return NextResponse.json(exportedData, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('[User Export API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to export user data' },
      { status: 500 }
    );
  }
}
