import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireApiUser } from '@/lib/api-auth';

const gratitudeEntrySchema = z.object({
  userId: z.string().min(1, 'User ID is required').optional(),
  slot: z.enum(['morning', 'afternoon', 'evening'], {
    message: 'Slot must be morning, afternoon, or evening',
  }),
  content: z.string().min(1, 'Content is required').max(500, 'Content must be 500 characters or less'),
});

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

    const auth = await requireApiUser(request, parsed.data.userId);
    if (!auth.ok) return auth.response;

    const user = await db.user.findUnique({ where: { id: auth.userId } });
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existing = await db.gratitudeEntry.findFirst({
      where: {
        userId: auth.userId,
        slot: parsed.data.slot,
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    if (existing) {
      const updated = await db.gratitudeEntry.update({
        where: { id: existing.id },
        data: { content: parsed.data.content },
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

    const entry = await db.gratitudeEntry.create({
      data: {
        userId: auth.userId,
        slot: parsed.data.slot,
        content: parsed.data.content,
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
