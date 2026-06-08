import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';
import { getUcpCorsHeaders, ucpPreflightResponse } from '@/lib/ucp-cors';

const checkoutSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
});

const PRODUCTS_PRICE_MAP: Record<string, number> = {
  'mangal-dosha-puja': 5100,
  'kaal-sarp-puja': 7100,
  'navagraha-puja': 8100,
  'pitra-dosh-puja': 5500,
  'saturn-shanti-puja': 6100,
  'blue-sapphire': 15000,
  'red-coral': 4500,
  'yellow-sapphire': 12000,
  'emerald': 9500,
  'ruby': 25000,
  'ek-mukhi-rudraksha': 11000,
  'panch-mukhi-rudraksha': 2100,
  '8-mukhi-rudraksha': 5500,
  'navagraha-yantra': 3100,
  'lal-kitab-remedies': 2500,
  'mantra-audio': 999,
  'griha-pravesh': 11000,
  'namkaran-ceremony': 5100,
  'vivah-muhurta': 4100,
};

export async function POST(request: NextRequest) {
  try {
    const corsHeaders = getUcpCorsHeaders(request);
    if (corsHeaders === null) {
      return NextResponse.json(
        { success: false, error: 'Origin is not allowed for UCP access' },
        { status: 403 }
      );
    }

    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Missing UCP Token' },
        { status: 401 }
      );
    }

    const preferences = await db.userPreferences.findUnique({
      where: { ucpToken: token },
      include: { user: true },
    });

    if (!preferences) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Invalid UCP Token' },
        { status: 401 }
      );
    }

    if (!preferences.ucpEnabled) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: UCP access is disabled in user preferences' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { productId } = parsed.data;
    const price = PRODUCTS_PRICE_MAP[productId];

    if (!price) {
      return NextResponse.json(
        { success: false, error: `Product with ID '${productId}' not found in catalog` },
        { status: 404 }
      );
    }

    // Create pending transaction in database (Prisma Transaction)
    // Convert price to Paise (INR * 100)
    const amountInPaise = price * 100;

    const transaction = await db.transaction.create({
      data: {
        userId: preferences.userId,
        amount: amountInPaise,
        currency: 'INR',
        paymentMethod: 'ucp_agent',
        status: 'pending',
        reportType: productId,
      },
    });

    // Mock checkout/redirect URL for the user to complete payment
    const origin = request.nextUrl.origin || 'https://ayuastro.vercel.app';
    const checkoutUrl = `${origin}/checkout/pay?txId=${transaction.id}`;

    return NextResponse.json({
      success: true,
      message: 'Checkout initialized successfully by agent',
      transaction: {
        id: transaction.id,
        productId,
        amount: price, // Return flat price in INR
        currency: 'INR',
        status: transaction.status,
        createdAt: transaction.createdAt,
      },
      checkoutUrl,
    }, {
      headers: corsHeaders,
    });
  } catch (error) {
    console.error('[UCP Checkout API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return ucpPreflightResponse(request);
}
