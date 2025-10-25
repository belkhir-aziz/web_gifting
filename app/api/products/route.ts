import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

const ProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  price: z.string().min(1, 'Price is required'),
  image_url: z.string().url('Must be a valid URL'),
  product_link: z.string().url('Must be a valid URL'),
  description: z.string().optional(),
  category: z.string().optional(),
  availability: z.boolean().optional(),
  rating: z.number().min(0).max(5).optional(),
  occasions: z.array(z.string()).optional(), // Not stored in DB, for backwards compatibility
  relationships: z.array(z.string()).optional(),
  age_ranges: z.array(z.string()).optional(),
  needs_categorization: z.boolean().optional(),
});

// Fallback in-memory storage if Supabase is not configured
let PRODUCTS: any[] = [];

export async function GET() {
  const supabase = getSupabaseAdmin();

  if (supabase) {
    try {
      // 1) Load products from the correct table
      const { data: productsRaw, error: prodErr } = await supabase
        .from('web_products')
        .select('*');
      if (prodErr) throw prodErr;

      const products = (productsRaw || []).map((p: any) => ({
        ...p,
        product_link: p.affiliate_link,
        price: p.price != null ? `$${p.price}` : null,
      }));

      if (products.length === 0) {
        return NextResponse.json({ products: [] });
      }

      // 2) Load reactions and count per product (avoid potential Bad Request with .in filter)
      const ids = products.map((p: any) => p.id);
      let reactionsRaw: any[] | null = null;
      try {
        const { data, error: reactErr } = await supabase
          .from('web_reactions')
          .select('product_id');
        if (reactErr) throw reactErr;
        reactionsRaw = data || [];
      } catch (err) {
        console.error('Supabase reactions error:', err);
        reactionsRaw = [];
      }

      const counts = new Map<string, number>();
      for (const r of (reactionsRaw || []).filter((r: any) => ids.includes(r.product_id))) {
        const k = String(r.product_id);
        counts.set(k, (counts.get(k) || 0) + 1);
      }

      // 3) Sort by: fewest reactions first, then newest (no recent-boost)
      const sorted = [...products].sort((a: any, b: any) => {
        const aCreated = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bCreated = b.created_at ? new Date(b.created_at).getTime() : 0;
        const aCount = counts.get(String(a.id)) || 0;
        const bCount = counts.get(String(b.id)) || 0;
        if (aCount !== bCount) return aCount - bCount; // fewer reactions first
        return bCreated - aCreated; // newer first as tie-breaker
      });

      {
        const res = NextResponse.json({ products: sorted });
        res.headers.set('x-products-source', 'supabase');
        return res;
      }
    } catch (e: any) {
      console.error('Supabase error:', e);
      // Fall through to in-memory storage
    }
  }

  if (!supabase) {
    console.warn('Supabase admin client not configured. Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  }
  {
    const res = NextResponse.json({ products: PRODUCTS });
    res.headers.set('x-products-source', 'fallback');
    return res;
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const p = ProductSchema.parse(data);
    
    const supabase = getSupabaseAdmin();
    
    if (supabase) {
      try {
        // Parse price string to number (remove $ and convert)
        const priceNumber = parseFloat(p.price.replace(/[$,]/g, ''));
        
        const { data: product, error } = await supabase
          .from('web_products')
          .insert([{
            name: p.name,
            price: priceNumber,
            image_url: p.image_url,
            affiliate_link: p.product_link,
            description: p.description || null,
            category: p.category || null,
            availability: p.availability !== undefined ? p.availability : true,
            rating: p.rating || null,
          }])
          .select()
          .single();
        
        if (error) throw error;
        
        // Transform response to match frontend expectations
        const transformedProduct = {
          ...product,
          product_link: product.affiliate_link,
          price: `$${product.price}`,
        };
        
        return NextResponse.json({ product: transformedProduct });
      } catch (e: any) {
        console.error('Supabase error:', e);
        // Fall through to in-memory storage
      }
    }
    
    // Fallback to in-memory
    const product = { id: `p_${Date.now()}`, ...p };
    PRODUCTS.unshift(product);
    return NextResponse.json({ product });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Invalid payload' }, { status: 400 });
  }
}
