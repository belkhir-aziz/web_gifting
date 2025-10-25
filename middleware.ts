import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const VALID_ACCESS_KEY = '550e8400-e29b-41d4-a716-446655440000';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only protect /admin routes - everything else is public
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // Check for valid access key cookie for admin
  const accessKey = req.cookies.get('gifty_access_key')?.value;
  if (accessKey !== VALID_ACCESS_KEY) {
    // Let the admin page handle showing the key request form
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
