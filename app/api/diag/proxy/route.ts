import { NextResponse } from 'next/server';
import { fetchPage, getProxyProviderName } from '@/lib/fetchPage';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const provider = getProxyProviderName();
    // Fetch a simple endpoint to see what IP the world sees for this request
    const body = await fetchPage('https://httpbin.org/ip', { 'accept-language': 'en,en;q=0.8' }, 'no-store');
    let parsed: unknown = null;
    try {
      parsed = JSON.parse(body);
    } catch {
      parsed = body;
    }
    return NextResponse.json({ provider, httpbin: parsed });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Diagnostic failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
