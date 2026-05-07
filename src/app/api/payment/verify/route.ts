import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

const verifySchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  transactionId: z.string().min(1, 'Transaction ID / UTR Number is required'),
  paymentMethod: z.enum(['upi', 'bank_transfer', 'other'], {
    required_error: 'Payment method is required',
  }),
  screenshotUrl: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = verifySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { userId, transactionId, paymentMethod, screenshotUrl } = parsed.data;

    // Check if this transactionId has already been submitted
    const existing = await db.transaction.findFirst({
      where: { transactionId },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'This Transaction ID / UTR has already been submitted' },
        { status: 409 }
      );
    }

    // Create the verification request
    const transaction = await db.transaction.create({
      data: {
        userId,
        amount: 49900, // ₹499 in paise
        currency: 'INR',
        transactionId,
        paymentMethod,
        screenshotUrl: screenshotUrl ?? null,
        status: 'pending',
        reportType: 'deep_intelligence_report',
      },
    });

    return NextResponse.json({
      success: true,
      verificationId: transaction.id,
      status: 'pending',
      message: 'Verification request submitted successfully',
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
