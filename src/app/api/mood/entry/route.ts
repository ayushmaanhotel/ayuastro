import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

// ─── Zod Schema ─────────────────────────────────────────────────────────────

const moodEntrySchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  mood: z.number().int().min(1).max(5, 'Mood must be between 1 and 5'),
  emoji: z.string().min(1, 'Emoji is required'),
  note: z.string().max(2000).optional(),
  tags: z.array(z.string()).optional(),
});

// ─── POST Handler ───────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = moodEntrySchema.safeParse(body);

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

    const data = parsed.data;

    // Verify user exists — auto-create if not found (for localStorage-based users)
    let user = await db.user.findUnique({ where: { id: data.userId } });
    if (!user) {
      user = await db.user.create({
        data: {
          id: data.userId,
          name: 'Seeker',
          isOnboarded: false,
          hasPaid: false,
        },
      });
    }

    // Create mood entry
    const moodEntry = await db.moodEntry.create({
      data: {
        userId: data.userId,
        mood: data.mood,
        emoji: data.emoji,
        note: data.note ?? null,
        tags: JSON.stringify(data.tags ?? []),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: moodEntry.id,
        mood: moodEntry.mood,
        emoji: moodEntry.emoji,
        note: moodEntry.note,
        tags: JSON.parse(moodEntry.tags),
        createdAt: moodEntry.createdAt,
      },
    });
  } catch (error) {
    console.error('[Mood Entry API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save mood entry' },
      { status: 500 }
    );
  }
}
