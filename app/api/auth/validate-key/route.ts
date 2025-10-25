import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const KeySchema = z.object({
  key: z.string().min(1),
});

// Hardcoded access key - users get this via email
const VALID_ACCESS_KEY = '550e8400-e29b-41d4-a716-446655440000';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { key } = KeySchema.parse(body);

    if (key === VALID_ACCESS_KEY) {
      const response = NextResponse.json({ ok: true });
      // Set a secure cookie that expires in 30 days
      response.cookies.set('gifty_access_key', key, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/',
      });
      return response;
    } else {
      return NextResponse.json({ error: 'Invalid access key' }, { status: 401 });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Invalid payload' }, { status: 400 });
  }
}
