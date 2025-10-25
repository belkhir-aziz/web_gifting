import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { encryptJson } from '@/lib/crypto';

const KeysSchema = z.object({
  amazon: z.object({ accessKey: z.string().min(1), secretKey: z.string().min(1) }).optional(),
  bol: z.object({ clientId: z.string().min(1), clientSecret: z.string().min(1) }).optional(),
});

// Placeholder in-memory store; replace with Supabase in production
// Removed unused KEYS_ENCRYPTED_B64 variable

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = KeysSchema.parse(body);
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Error) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
}
