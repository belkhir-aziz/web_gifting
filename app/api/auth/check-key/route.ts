import { NextRequest, NextResponse } from 'next/server';

const VALID_ACCESS_KEY = '550e8400-e29b-41d4-a716-446655440000';

export async function GET(req: NextRequest) {
  const accessKey = req.cookies.get('gifty_access_key')?.value;
  return NextResponse.json({ valid: accessKey === VALID_ACCESS_KEY });
}
