import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createHash } from 'crypto';
import { db } from '@/lib/db';

// ─── Zod Schema ─────────────────────────────────────────────────────────────

const signinSchema = z
  .object({
    email: z.string().email('Invalid email address').optional(),
    phone: z.string().min(1, 'Phone number is required').optional(),
    password: z.string().min(1, 'Password is required'),
  })
  .refine((data) => data.email || data.phone, {
    message: 'Either email or phone is required',
    path: ['email'],
  });

// ─── Password Verification ──────────────────────────────────────────────────

function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, hash] = storedHash.split(':');
  if (!salt || !hash) return false;
  const verifyHash = createHash('sha256').update(salt + password).digest('hex');
  return verifyHash === hash;
}

// ─── POST Handler ───────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = signinSchema.safeParse(body);

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

    const { email, phone, password } = parsed.data;

    // Find user by email or phone
    let user;
    if (email) {
      user = await db.user.findUnique({ where: { email } });
    } else if (phone) {
      user = await db.user.findUnique({ where: { phone } });
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    if (!user.passwordHash || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      userId: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      isOnboarded: user.isOnboarded,
    });
  } catch (error) {
    console.error('[Signin API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to sign in' },
      { status: 500 }
    );
  }
}
