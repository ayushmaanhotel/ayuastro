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

    let { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (authError) {
      // Self-healing: If email is not confirmed, auto-confirm it in the database and retry
      if (
        authError.message.toLowerCase().includes('confirm') ||
        authError.message.toLowerCase().includes('verify') ||
        authError.message.toLowerCase().includes('verified')
      ) {
        try {
          const localUser = await db.user.findUnique({ where: { email } });
          if (localUser) {
            await db.$executeRawUnsafe(
              `UPDATE auth.users SET email_confirmed_at = NOW(), confirmed_at = NOW() WHERE id = $1`,
              localUser.id
            );
            console.log(`[Signin API] Self-healed & auto-confirmed email for user ${localUser.id}`);

            // Retry signin
            const retryRes = await supabase.auth.signInWithPassword({
              email,
              password,
            });
            authData = retryRes.data;
            authError = retryRes.error;
          }
        } catch (dbErr) {
          console.error('[Signin API] Failed self-healing auto-confirmation:', dbErr);
        }
      }
    }

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
    const user = await db.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User record not found in database' },
        { status: 404 }
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
