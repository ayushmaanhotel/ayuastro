import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { createClient } from '@/lib/supabase/server';

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

    // Check for duplicate email in Prisma
    if (email) {
      const existingEmail = await db.user.findUnique({ where: { email } });
      if (existingEmail) {
        return NextResponse.json(
          { success: false, error: 'An account with this email already exists' },
          { status: 409 }
        );
      }
    }

    // Check for duplicate phone in Prisma
    if (phone) {
      const existingPhone = await db.user.findUnique({ where: { phone } });
      if (existingPhone) {
        return NextResponse.json(
          { success: false, error: 'An account with this phone number already exists' },
          { status: 409 }
        );
      }
    }

    const supabase = await createClient();

    // Sign up with Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email as string,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (authError) {
      return NextResponse.json(
        { success: false, error: authError.message },
        { status: 400 }
      );
    }

    const supabaseUserId = authData.user?.id;
    if (!supabaseUserId) {
      throw new Error('Supabase user creation failed');
    }

    // Create user in Prisma with Supabase ID
    let user;
    try {
      user = await db.user.create({
        data: {
          id: supabaseUserId, // Sync IDs
          name,
          email: email ?? null,
          phone: phone ?? null,
          passwordHash: 'SUPABASE_AUTH', // Password handled by Supabase
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
    } catch (prismaError) {
      console.error('[Signup API] Failed to sync user to Prisma, rolling back Supabase auth:', prismaError);
      try {
        await db.user.deleteMany({ where: { id: supabaseUserId } });
        console.log(`[Signup API] Removed partial Prisma user ${supabaseUserId}`);
      } catch (rollbackErr) {
        console.error('[Signup API] Failed to remove partial Prisma user:', rollbackErr);
      }
      throw prismaError;
    }

    return NextResponse.json(
      {
        success: true,
        userId: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        session: authData.session
          ? {
              accessToken: authData.session.access_token,
              refreshToken: authData.session.refresh_token,
              expiresAt: authData.session.expires_at,
              tokenType: authData.session.token_type,
            }
          : null,
        message: 'Signup successful',
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
