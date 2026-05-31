import { NextResponse } from 'next/server';

export async function GET() {
  const manifest = {
    ucp_version: '2026-01-11',
    name: 'AyuAstro AI Commerce and Context Hub',
    description: 'Universal Context and Commerce Protocol endpoint for AyuAstro astrological insights and Vedic remedies.',
    capabilities: {
      'dev.ucp.astrology.context': {
        version: '2026-01-11',
        path: '/api/ucp/context',
        description: 'Exposes user birth details, planetary positions, houses, and active yogas/doshas.'
      },
      'dev.ucp.astrology.catalog': {
        version: '2026-01-11',
        path: '/api/ucp/catalog',
        description: 'Exposes Vedic Store gemstone and puja remedies personalized to user placements.'
      },
      'dev.ucp.astrology.checkout': {
        version: '2026-01-11',
        path: '/api/ucp/checkout',
        description: 'Enables external agents to initiate gemstone or puja remedies bookings.'
      }
    }
  };

  return NextResponse.json(manifest, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  });
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  });
}
