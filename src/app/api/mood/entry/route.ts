import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireApiUser } from '@/lib/api-auth';

const moodEntrySchema = z.object({
  userId: z.string().min(1, 'User ID is required').optional(),
  mood: z.number().int().min(1).max(5, 'Mood must be between 1 and 5'),
  emoji: z.string().min(1, 'Emoji is required'),
  note: z.string().max(2000).optional(),
  tags: z.array(z.string()).optional(),
});

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

    const auth = await requireApiUser(request, parsed.data.userId);
    if (!auth.ok) return auth.response;

    const user = await db.user.findUnique({ where: { id: auth.userId } });
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const moodEntry = await db.moodEntry.create({
      data: {
        userId: auth.userId,
        mood: parsed.data.mood,
        emoji: parsed.data.emoji,
        note: parsed.data.note ?? null,
        tags: JSON.stringify(parsed.data.tags ?? []),
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
