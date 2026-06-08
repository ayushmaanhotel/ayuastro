import { NextRequest, NextResponse } from 'next/server';

function getAllowedOrigins(): Set<string> {
  return new Set(
    (process.env.UCP_ALLOWED_ORIGINS ?? '')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean)
  );
}

export function getUcpCorsHeaders(request: NextRequest): HeadersInit | null {
  const origin = request.headers.get('origin');
  if (!origin) return {};

  const allowedOrigins = getAllowedOrigins();
  if (!allowedOrigins.has(origin)) return null;

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export function ucpCorsResponse(request: NextRequest): NextResponse | null {
  const headers = getUcpCorsHeaders(request);
  if (headers === null) {
    return NextResponse.json(
      { success: false, error: 'Origin is not allowed for UCP access' },
      { status: 403 }
    );
  }
  return NextResponse.next({ headers });
}

export function ucpPreflightResponse(request: NextRequest): Response {
  const headers = getUcpCorsHeaders(request);
  if (headers === null) {
    return NextResponse.json(
      { success: false, error: 'Origin is not allowed for UCP access' },
      { status: 403 }
    );
  }
  return new Response(null, { status: 204, headers });
}
