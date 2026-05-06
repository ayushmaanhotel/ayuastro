import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

// ─── Zod Schema ─────────────────────────────────────────────────────────────

const gratitudeHistorySchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  days: z.coerce.number().int().min(1).max(365).default(30),
});

// ─── GET Handler ────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = gratitudeHistorySchema.safeParse({
      userId: searchParams.get('userId'),
      days: searchParams.get('days'),
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

    // Calculate date range
    const now = new Date();
    const startDate = new Date();
    startDate.setDate(now.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // Fetch entries within range
    const entries = await db.gratitudeEntry.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate streak
    let streakDays = 0;
    const checkDate = new Date();
    checkDate.setHours(0, 0, 0, 0);

    // Build a Set of dates that have entries
    const entryDates = new Set<string>();
    for (const entry of entries) {
      const d = new Date(entry.createdAt);
      d.setHours(0, 0, 0, 0);
      entryDates.add(d.toISOString().split('T')[0]);
    }

    // Count consecutive days going backwards from today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      if (entryDates.has(key)) {
        streakDays++;
      } else {
        break;
      }
    }

    // Most common slot
    const slotCounts: Record<string, number> = { morning: 0, afternoon: 0, evening: 0 };
    for (const entry of entries) {
      if (entry.slot in slotCounts) {
        slotCounts[entry.slot]++;
      }
    }
    const mostCommonSlot = (Object.entries(slotCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'morning') as 'morning' | 'afternoon' | 'evening';

    return NextResponse.json({
      success: true,
      data: {
        entries: entries.map((e) => ({
          id: e.id,
          slot: e.slot,
          content: e.content,
          createdAt: e.createdAt,
        })),
        summary: {
          streakDays,
          totalEntries: entries.length,
          mostCommonSlot,
        },
      },
    });
  } catch (error) {
    console.error('[Gratitude History API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch gratitude history' },
      { status: 500 }
    );
  }
}
