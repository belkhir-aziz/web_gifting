import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { addAmazonAffiliateTag } from '@/lib/affiliate';

const ProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  price: z.string().min(1, 'Price is required'),
  image_url: z.string().url('Must be a valid URL'),
  product_link: z.string().url('Must be a valid URL'),
  description: z.string().optional(),
  // Accept category as string or array; store as comma-separated string
  category: z.union([z.string(), z.array(z.string())]).optional(),
  availability: z.boolean().optional(),
  rating: z.number().min(0).max(5).optional(),
  country: z.string().optional(),
  ratings_count: z.number().optional(),
  source: z.string().optional(),
  occasions: z.array(z.string()).optional(), // Not stored in DB, for backwards compatibility
  relationships: z.array(z.string()).optional(),
  age_ranges: z.array(z.string()).optional(),
  needs_categorization: z.boolean().optional(),
});

// Fallback in-memory storage if Supabase is not configured
type Product = {
  id?: string;
  name: string;
  price?: string;
  image_url: string;
  product_link?: string;
  description?: string;
  category?: string;
  availability?: boolean;
  rating?: number;
  country?: string;
  ratings_count?: number;
  source?: string;
  occasions?: string[];
  relationships?: string[];
  age_ranges?: string[];
  needs_categorization?: boolean;
};
type DBProduct = Product & {
  affiliate_link?: string;
  created_at?: string;
};
const PRODUCTS: Product[] = [];

export async function GET() {
  const supabase = getSupabaseAdmin();

  if (supabase) {
    try {
      const { data: productsRaw, error: prodErr } = await supabase
        .from('web_products')
        .select('*');
      if (prodErr) throw prodErr;

      type DBRow = Record<string, unknown>;
      const toArray = (s?: string | null): string[] => (s ? String(s).split(',').map((t) => t.trim()).filter(Boolean) : []);
      const getField = (row: DBRow, keys: string[]): unknown => {
        for (const k of keys) {
          if (row[k] !== undefined && row[k] !== null) return row[k];
        }
        return undefined;
      };
      const products = (productsRaw || []).map((p: DBProduct & DBRow) => {
        const row = p as DBRow;
        const priceVal = row.price;
        return {
          ...p,
          product_link: (row.affiliate_link as string | undefined) ?? undefined,
          price: priceVal != null ? `$${String(priceVal)}` : undefined,
          ratings_count: (getField(row, ['ratings_count', 'nb_rating', 'nb_tating']) as number | null) ?? undefined,
          source: (getField(row, ['data_source', 'source']) as string | null) ?? undefined,
          occasions: toArray((getField(row, ['occasions', 'occasion', 'event']) as string | null) ?? null),
          relationships: toArray((getField(row, ['relationships', 'relationship', 'relation']) as string | null) ?? null),
          age_ranges: toArray((getField(row, ['age_ranges', 'age']) as string | null) ?? null),
          created_at: row.created_at as string | undefined,
        };
      });

      if (products.length === 0) {
        return NextResponse.json({ products: [] });
      }

      // Load reactions and count per product
  const ids = products.map((p) => (p as unknown as { id?: string }).id).filter((x): x is string => !!x);
      let reactionsRaw: Array<{ product_id?: string }> = [];
      try {
        const { data, error: reactErr } = await supabase
          .from('web_reactions')
          .select('product_id');
        if (reactErr) throw reactErr;
        reactionsRaw = (data as Array<{ product_id?: string }>) || [];
      } catch (err) {
        console.error('Supabase reactions error:', err);
      }

      const counts = new Map<string, number>();
      for (const r of reactionsRaw.filter((r) => typeof r.product_id === 'string' && ids.includes(r.product_id))) {
        const k = String(r.product_id);
        counts.set(k, (counts.get(k) || 0) + 1);
      }

      const sorted = [...products].sort((a, b) => {
        const aCreated = (a as { created_at?: string }).created_at ? new Date((a as { created_at?: string }).created_at as string).getTime() : 0;
        const bCreated = (b as { created_at?: string }).created_at ? new Date((b as { created_at?: string }).created_at as string).getTime() : 0;
        const aCount = counts.get(String((a as { id?: string }).id)) || 0;
        const bCount = counts.get(String((b as { id?: string }).id)) || 0;
        if (aCount !== bCount) return aCount - bCount; // fewer reactions first
        return bCreated - aCreated; // newer first as tie-breaker
      });

      const res = NextResponse.json({ products: sorted });
      res.headers.set('x-products-source', 'supabase');
      return res;
    } catch (e) {
      if (e instanceof Error) {
        console.error('Supabase error:', e.message);
      } else {
        console.error('Supabase error:', e);
      }
      // Fall through to in-memory storage
    }
  }

  if (!supabase) {
    console.warn('Supabase admin client not configured. Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  }
  const res = NextResponse.json({ products: PRODUCTS });
  res.headers.set('x-products-source', 'fallback');
  return res;
}

export async function POST(req: NextRequest) {
  try {
  const data = await req.json();
    let providedNbRating: number | undefined = undefined;
    const dataRec = data as Record<string, unknown>;
    if (typeof dataRec?.nb_rating === 'number') {
      providedNbRating = dataRec.nb_rating as number;
    }
    const pParsed = ProductSchema.parse(data);
    // Normalize category to comma-separated string
    const p: typeof pParsed & { category?: string } = {
      ...pParsed,
      category: Array.isArray(pParsed.category)
        ? (pParsed.category as string[]).join(',')
        : pParsed.category,
    };
    if ((p as unknown as { ratings_count?: number }).ratings_count == null && providedNbRating != null) {
      (p as unknown as { ratings_count?: number }).ratings_count = providedNbRating;
    }
    
    const supabase = getSupabaseAdmin();
    
    if (supabase) {
      try {
        // Parse price string to number: handle $, €, commas and dots
        const priceSanitized = p.price.replace(/[^0-9,\.\-]/g, '').replace(',', '.');
        const priceNumber = Number.isFinite(parseFloat(priceSanitized)) ? parseFloat(priceSanitized) : 0;
        const affiliate = addAmazonAffiliateTag(p.product_link);

        // 1) Minimal insert of guaranteed columns
        const baseRecord: Record<string, unknown> = {
          name: p.name,
          price: priceNumber,
          image_url: p.image_url,
          affiliate_link: affiliate,
          description: p.description || null,
          category: p.category || null,
          availability: p.availability !== undefined ? p.availability : true,
          rating: p.rating ?? null,
        };
  const inserted = await supabase.from('web_products').insert([baseRecord]).select().single();
        if (inserted.error) throw inserted.error;
  const created = inserted.data as Record<string, unknown>;
  const id = (created?.id as string | undefined) ?? undefined;

        // Helper to update a single column; ignore errors if column doesn't exist
        const tryUpdate = async (field: string, value: unknown) => {
          try {
            const { error } = await supabase
              .from('web_products')
              .update({ [field]: value })
              .eq('id', id)
              .select();
            if (error) throw error;
          } catch {
            // Column may not exist; ignore silently
          }
        };

        // 2) Update optional fields with synonyms
        const ratingsVal = (p as unknown as { ratings_count?: number }).ratings_count;
        if (typeof ratingsVal === 'number') {
          await tryUpdate('nb_tating', ratingsVal);
          await tryUpdate('nb_rating', ratingsVal);
          await tryUpdate('ratings_count', ratingsVal);
        }
        if (typeof p.country === 'string' && p.country) await tryUpdate('country', p.country);
        const src = (p as unknown as { source?: string }).source;
        if (src) {
          await tryUpdate('data_source', src);
          await tryUpdate('source', src);
        }
        if (Array.isArray(p.occasions)) {
          const joined = p.occasions.join(',');
          await tryUpdate('occasion', joined);
          await tryUpdate('occasions', joined);
          await tryUpdate('event', joined);
        }
        if (Array.isArray(p.relationships)) {
          const joined = p.relationships.join(',');
          await tryUpdate('relation', joined);
          await tryUpdate('relationships', joined);
          await tryUpdate('relationship', joined);
        }
        if (Array.isArray(p.age_ranges)) {
          const joined = p.age_ranges.join(',');
          await tryUpdate('age', joined);
          await tryUpdate('age_ranges', joined);
        }

        // Re-fetch and normalize
        const { data: fetched } = await supabase
          .from('web_products')
          .select('*')
          .eq('id', id)
          .single();
        const productRow: Record<string, unknown> = (fetched as Record<string, unknown>) || created;
        const getField = (row: Record<string, unknown>, keys: string[]): unknown => {
          for (const k of keys) {
            if (row[k] !== undefined && row[k] !== null) return row[k];
          }
          return undefined;
        };
        const toArrayResp = (s?: string | null): string[] => (s ? String(s).split(',').map((t) => t.trim()).filter(Boolean) : []);
        const transformedProduct = {
          ...productRow,
          product_link: productRow['affiliate_link'] as string | undefined,
          price: `$${String(productRow['price'])}`,
          ratings_count: (getField(productRow, ['ratings_count', 'nb_rating', 'nb_tating']) as number | null) ?? undefined,
          source: (getField(productRow, ['data_source', 'source']) as string | null) ?? undefined,
          occasions: toArrayResp((getField(productRow, ['occasions', 'occasion', 'event']) as string | null) ?? null),
          relationships: toArrayResp((getField(productRow, ['relationships', 'relationship', 'relation']) as string | null) ?? null),
          age_ranges: toArrayResp((getField(productRow, ['age_ranges', 'age']) as string | null) ?? null),
        };

        return NextResponse.json({ product: transformedProduct });
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
  const product: Product = { id: `p_${Date.now()}`, ...p };
  PRODUCTS.unshift(product);
  return NextResponse.json({ product });
  } catch (e) {
    if (e instanceof Error) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
}
