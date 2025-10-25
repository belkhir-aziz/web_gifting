import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { cookies } from 'next/headers';

const RatingSchema = z.object({
  itemId: z.string().min(1),
  action: z.enum(['like', 'dislike', 'superlike']),
  occasions: z.array(z.string()).optional(), // Will be ignored but kept for backwards compatibility
  relationships: z.array(z.string()).optional(),
  age_ranges: z.array(z.string()).optional(),
});

type Rating = {
  itemId: string;
  action: 'like' | 'dislike' | 'superlike';
  occasions?: string[];
  relationships?: string[];
  age_ranges?: string[];
  session_id?: string;
  at?: string;
};
const RATINGS: Rating[] = [];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const r = RatingSchema.parse(body);
    
    // Get or create session ID
    const cookieStore = cookies();
    let sessionId = cookieStore.get('session_id')?.value;
    
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    }
    
    const supabase = getSupabaseAdmin();
    
    if (supabase) {
      try {
        const { data: reaction, error } = await supabase
          .from('web_reactions')
          .insert([{
            session_id: sessionId,
            product_id: r.itemId,
            reaction: r.action,
          }])
          .select()
          .single();
        
        if (error) throw error;
        
        // Set session cookie
        const response = NextResponse.json({ ok: true, reaction });
        response.cookies.set('session_id', sessionId, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 365, // 1 year
        });
        
        return response;
      } catch (e) {
        if (e instanceof Error) {
          console.error('Supabase error:', e.message);
        } else {
          console.error('Supabase error:', e);
        }
        // Fall through to in-memory storage
      }
    }
    
    // Fallback to in-memory
  const record: Rating = { ...r, session_id: sessionId, at: new Date().toISOString() };
  RATINGS.push(record);
    
    const response = NextResponse.json({ ok: true });
    response.cookies.set('session_id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
    });
    
    return response;
  } catch (e) {
    if (e instanceof Error) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
}

export async function GET() {
  const supabase = getSupabaseAdmin();
  
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('web_reactions')
        .select('*');
      
      if (error) throw error;
      return NextResponse.json({ ratings: data || [] });
    } catch (e) {
      if (e instanceof Error) {
        console.error('Supabase error:', e.message);
      } else {
        console.error('Supabase error:', e);
      }
    }
  }
  
  return NextResponse.json({ ratings: RATINGS });
}
