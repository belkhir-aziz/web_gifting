import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET() {
  const hasUrl = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const hasServiceRole = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

  // Try to instantiate admin client without exposing secrets
  let adminClientCreated = false;
  try {
    const client = getSupabaseAdmin();
    adminClientCreated = client !== null;
  } catch (e) {
    adminClientCreated = false;
  }

  const res = NextResponse.json({ hasUrl, hasServiceRole, adminClientCreated });
  return res;
}
