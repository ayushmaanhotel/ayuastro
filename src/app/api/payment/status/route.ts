import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireApiUser } from '@/lib/api-auth';

const statusSchema = z.object({
  userId: z.string().min(1, 'User ID is required').optional().nullable(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const claimedUserId = searchParams.get('userId');

    const parsed = statusSchema.safeParse({ userId: claimedUserId });

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const auth = await requireApiUser(request, parsed.data.userId);
    if (!auth.ok) return auth.response;
    const userId = auth.userId;

    // Check if user has any verified (completed) transaction
    const verifiedTransaction = await db.transaction.findFirst({
      where: {
        userId,
        status: 'completed',
      },
      orderBy: { createdAt: 'desc' },
    });

    if (verifiedTransaction) {
      return NextResponse.json({ verified: true });
    }

    // Check if user has any pending transaction
    const pendingTransaction = await db.transaction.findFirst({
      where: {
        userId,
        status: 'pending',
      },
      orderBy: { createdAt: 'desc' },
    });

    if (pendingTransaction) {
      return NextResponse.json({ verified: false, status: 'pending' });
    }

    // No transactions found
    return NextResponse.json({ verified: false, status: 'none' });
  } catch (error) {
    console.error('Payment status check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
