import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseJsClient, type User as SupabaseUser } from '@supabase/supabase-js';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';

export interface AuthenticatedApiUser {
  id: string;
  email: string | null;
  user: SupabaseUser;
}

function unauthorized(message = 'Authentication required') {
  return NextResponse.json(
    { success: false, error: message },
    { status: 401 }
  );
}

function forbidden(message = 'Authenticated user does not match requested userId') {
  return NextResponse.json(
    { success: false, error: message },
    { status: 403 }
  );
}

function getBearerToken(request: NextRequest): string | null {
  const header = request.headers.get('authorization');
  if (!header?.toLowerCase().startsWith('bearer ')) return null;
  const token = header.slice(7).trim();
  return token.length > 0 ? token : null;
}

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
  return { url, anonKey };
}

function toAuthUser(user: SupabaseUser): AuthenticatedApiUser {
  return {
    id: user.id,
    email: user.email ?? null,
    user,
  };
}

export async function authenticateApiRequest(
  request: NextRequest
): Promise<{ ok: true; auth: AuthenticatedApiUser } | { ok: false; response: NextResponse }> {
  const { url, anonKey } = getSupabaseConfig();
  if (!url || !anonKey) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: 'Authentication is not configured' },
        { status: 500 }
      ),
    };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.getUser();
    if (!error && data.user) {
      return { ok: true, auth: toAuthUser(data.user) };
    }
  } catch {
    // Fall through to bearer-token validation for non-browser clients.
  }

  const bearer = getBearerToken(request);
  if (!bearer) {
    return { ok: false, response: unauthorized() };
  }

  try {
    const supabase = createSupabaseJsClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await supabase.auth.getUser(bearer);
    if (error || !data.user) {
      return { ok: false, response: unauthorized('Invalid authentication token') };
    }
    return { ok: true, auth: toAuthUser(data.user) };
  } catch {
    return { ok: false, response: unauthorized('Invalid authentication token') };
  }
}

export async function requireApiUser(
  request: NextRequest,
  claimedUserId?: string | null
): Promise<{ ok: true; auth: AuthenticatedApiUser; userId: string } | { ok: false; response: NextResponse }> {
  const authResult = await authenticateApiRequest(request);
  if (!authResult.ok) return authResult;

  if (claimedUserId && claimedUserId !== authResult.auth.id) {
    return { ok: false, response: forbidden() };
  }

  return { ok: true, auth: authResult.auth, userId: authResult.auth.id };
}
