import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createHash, randomBytes } from 'crypto';
import { db } from '@/lib/db';

// ─── Zod Schema ─────────────────────────────────────────────────────────────

const signupSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address').optional(),
    phone: z.string().min(1, 'Phone number is required').optional(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  })
  .refine((data) => data.email || data.phone, {
    message: 'Either email or phone is required',
    path: ['email'],
  });

// ─── Password Hashing ───────────────────────────────────────────────────────

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = createHash('sha256').update(salt + password).digest('hex');
  return `${salt}:${hash}`;
}

// ─── POST Handler ───────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = signupSchema.safeParse(body);

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

    const { name, email, phone, password } = parsed.data;

    // Check for duplicate email
    if (email) {
      const existingEmail = await db.user.findUnique({ where: { email } });
      if (existingEmail) {
        return NextResponse.json(
          { success: false, error: 'An account with this email already exists' },
          { status: 409 }
        );
      }
    }

    // Check for duplicate phone
    if (phone) {
      const existingPhone = await db.user.findUnique({ where: { phone } });
      if (existingPhone) {
        return NextResponse.json(
          { success: false, error: 'An account with this phone number already exists' },
          { status: 409 }
        );
      }
    }

    // Hash password
    const passwordHash = hashPassword(password);

    // Create user with default preferences
    const user = await db.user.create({
      data: {
        name,
        email: email ?? null,
        phone: phone ?? null,
        passwordHash,
        isOnboarded: false,
        preferences: {
          create: {
            language: 'en',
            vedicLevel: 'standard',
          },
        },
      },
      include: {
        preferences: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        userId: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Signup API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create account' },
      { status: 500 }
    );
  }
}
