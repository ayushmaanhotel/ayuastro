import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

// ─── Zod Schema ─────────────────────────────────────────────────────────────

const gratitudeEntrySchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  slot: z.enum(['morning', 'afternoon', 'evening'], {
    errorMap: () => ({ message: 'Slot must be morning, afternoon, or evening' }),
  }),
  content: z.string().min(1, 'Content is required').max(500, 'Content must be 500 characters or less'),
});

// ─── POST Handler ───────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = gratitudeEntrySchema.safeParse(body);

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

    // Verify user exists — auto-create if not found
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

    // Check if entry for this slot already exists today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existing = await db.gratitudeEntry.findFirst({
      where: {
        userId: data.userId,
        slot: data.slot,
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    if (existing) {
      // Update existing entry for this slot today
      const updated = await db.gratitudeEntry.update({
        where: { id: existing.id },
        data: { content: data.content },
      });

      return NextResponse.json({
        success: true,
        data: {
          id: updated.id,
          slot: updated.slot,
          content: updated.content,
          createdAt: updated.createdAt,
        },
      });
    }

    // Create new gratitude entry
    const entry = await db.gratitudeEntry.create({
      data: {
        userId: data.userId,
        slot: data.slot,
        content: data.content,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: entry.id,
        slot: entry.slot,
        content: entry.content,
        createdAt: entry.createdAt,
      },
    });
  } catch (error) {
    console.error('[Gratitude Entry API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save gratitude entry' },
      { status: 500 }
    );
  }
}
