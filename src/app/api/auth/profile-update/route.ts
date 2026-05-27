import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

// ─── Zod Schema ─────────────────────────────────────────────────────────────

const profileUpdateSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().min(1, 'Phone number is required').optional(),
  avatar: z.string().url('Invalid avatar URL').optional(),
});

// ─── PUT Handler ────────────────────────────────────────────────────────────

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = profileUpdateSchema.safeParse(body);

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

    const { userId, ...updates } = parsed.data;

    // Verify user exists
    const existingUser = await db.user.findUnique({ where: { id: userId } });
    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Check for duplicate email (if email is being updated)
    if (updates.email && updates.email !== existingUser.email) {
      const duplicateEmail = await db.user.findUnique({
        where: { email: updates.email },
      });
      if (duplicateEmail) {
        return NextResponse.json(
          { success: false, error: 'An account with this email already exists' },
          { status: 409 }
        );
      }
    }

    // Check for duplicate phone (if phone is being updated)
    if (updates.phone && updates.phone !== existingUser.phone) {
      const duplicatePhone = await db.user.findUnique({
        where: { phone: updates.phone },
      });
      if (duplicatePhone) {
        return NextResponse.json(
          { success: false, error: 'An account with this phone number already exists' },
          { status: 409 }
        );
      }
    }

    // Only update fields that were provided
    const dataToUpdate: Record<string, unknown> = {};
    if (updates.name !== undefined) dataToUpdate.name = updates.name;
    if (updates.email !== undefined) dataToUpdate.email = updates.email;
    if (updates.phone !== undefined) dataToUpdate.phone = updates.phone;
    if (updates.avatar !== undefined) dataToUpdate.avatar = updates.avatar;

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: dataToUpdate,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        avatar: updatedUser.avatar,
        isOnboarded: updatedUser.isOnboarded,
      },
    });
  } catch (error) {
    console.error('[Profile Update API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
