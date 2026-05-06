import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

// ─── Zod Schema ─────────────────────────────────────────────────────────────

const historyQuerySchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  days: z.coerce.number().int().min(1).max(365).default(30),
});

// ─── GET Handler ────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = historyQuerySchema.safeParse({
      userId: searchParams.get('userId'),
      days: searchParams.get('days') ?? '30',
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

    const { userId, days } = parsed.data;

    // Verify user exists - return empty results for unknown users instead of 404
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({
        success: true,
        data: {
          entries: [],
          summary: {
            averageMood: 0,
            mostCommonEmoji: '😊',
            streakDays: 0,
            totalEntries: 0,
          },
        },
      });
    }

    // Calculate date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // Fetch mood entries
    const entries = await db.moodEntry.findMany({
      where: {
        userId,
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Parse tags for each entry
    const parsedEntries = entries.map((entry) => ({
      id: entry.id,
      mood: entry.mood,
      emoji: entry.emoji,
      note: entry.note,
      tags: JSON.parse(entry.tags),
      createdAt: entry.createdAt,
    }));

    // Calculate summary stats
    let averageMood = 0;
    let mostCommonEmoji = '😊';
    let streakDays = 0;

    if (parsedEntries.length > 0) {
      // Average mood
      const totalMood = parsedEntries.reduce((sum, e) => sum + e.mood, 0);
      averageMood = Math.round((totalMood / parsedEntries.length) * 10) / 10;

      // Most common emoji
      const emojiCounts: Record<string, number> = {};
      for (const entry of parsedEntries) {
        emojiCounts[entry.emoji] = (emojiCounts[entry.emoji] || 0) + 1;
      }
      mostCommonEmoji = Object.entries(emojiCounts).sort(([, a], [, b]) => b - a)[0][0];

      // Streak: consecutive days with entries, counting backwards from today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const entryDates = new Set(
        parsedEntries.map((e) => {
          const d = new Date(e.createdAt);
          d.setHours(0, 0, 0, 0);
          return d.getTime();
        })
      );

      let checkDate = new Date(today);
      while (entryDates.has(checkDate.getTime())) {
        streakDays++;
        checkDate.setDate(checkDate.getDate() - 1);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        entries: parsedEntries,
        summary: {
          averageMood,
          mostCommonEmoji,
          streakDays,
          totalEntries: parsedEntries.length,
        },
      },
    });
  } catch (error) {
    console.error('[Mood History API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch mood history' },
      { status: 500 }
    );
  }
}
