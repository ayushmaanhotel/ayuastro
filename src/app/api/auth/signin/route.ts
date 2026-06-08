import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { createClient } from '@/lib/supabase/server';

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

    // For now we only support email login via Supabase in this implementation
    // If phone login is needed, Supabase OTP or custom provider would be used
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email login is required for Supabase Auth' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (authError) {
      return NextResponse.json(
        { success: false, error: authError.message },
        { status: 401 }
      );
    }

    const supabaseUserId = authData.user?.id;
    if (!supabaseUserId) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Find user in local Prisma DB
    let user = await db.user.findUnique({ where: { email } });

    if (!user) {
      console.log(`[Signin API] User authenticated in Supabase but record missing in Prisma. Recreating profile for ${email}`);
      try {
        user = await db.user.create({
          data: {
            id: supabaseUserId,
            name: email.split('@')[0], // Fallback name
            email,
            passwordHash: 'SUPABASE_AUTH',
            isOnboarded: false,
            preferences: {
              create: {
                language: 'en',
                vedicLevel: 'standard',
              },
            },
          },
        });
      } catch (dbCreateErr) {
        console.error('[Signin API] Failed to self-heal/recreate Prisma user record:', dbCreateErr);
        return NextResponse.json(
          { success: false, error: 'User record not found in database and self-healing failed' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      userId: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      isOnboarded: user.isOnboarded,
      session: authData.session
        ? {
            accessToken: authData.session.access_token,
            refreshToken: authData.session.refresh_token,
            expiresAt: authData.session.expires_at,
            tokenType: authData.session.token_type,
          }
        : null,
    });
  } catch (error) {
    console.error('[Signin API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to sign in' },
      { status: 500 }
    );
  }
}
