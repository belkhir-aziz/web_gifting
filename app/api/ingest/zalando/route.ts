import { NextRequest, NextResponse } from 'next/server';
import { load } from 'cheerio';
import { extractCountryFromUrl, isZalandoUrl } from '@/lib/domains';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { url } = (await req.json()) as { url?: string };
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Missing url' }, { status: 400 });
    }
    if (!isZalandoUrl(url)) {
      return NextResponse.json({ error: 'Only Zalando URLs are supported' }, { status: 400 });
    }

    const res = await fetch(url, {
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123 Safari/537.36',
        'accept-language': 'fr-FR,fr;q=0.9,en;q=0.8',
      },
      cache: 'no-store',
    });
    const html = await res.text();
    const $ = load(html);

    // Helper to safely parse JSON-LD blocks
    const jsonLdBlocks = $('script[type="application/ld+json"]').map((_, el) => $(el).contents().text().trim()).get();
    type LDOffer = { price?: string | number; priceCurrency?: string };
    type LDProduct = {
      ['@type']?: string | string[];
      name?: string;
      description?: string;
      image?: string | string[];
      offers?: LDOffer | LDOffer[];
      aggregateRating?: { ratingValue?: string | number; reviewCount?: string | number };
    };
    let ld: LDProduct | null = null;
    for (const block of jsonLdBlocks) {
      try {
        const parsed: unknown = JSON.parse(block);
        const candidates = Array.isArray(parsed) ? parsed : [parsed];
        for (const c of candidates) {
          const type = (c as Record<string, unknown>)['@type'];
          if (type === 'Product' || (Array.isArray(type) && type.includes('Product'))) {
            ld = c as LDProduct;
            break;
          }
        }
        if (ld) break;
      } catch {}
    }

    let title = $('meta[property="og:title"]').attr('content') || $('h1').first().text().trim() || '';
    let image = $('meta[property="og:image"]').attr('content') || '';
    let description = $('meta[property="og:description"]').attr('content') || '';
    let priceRaw = $('meta[property="product:price:amount"]').attr('content') || $('meta[itemprop="price"]').attr('content') || '';
    let currency = $('meta[property="product:price:currency"]').attr('content') || $('meta[itemprop="priceCurrency"]').attr('content') || '';
    // Prefer JSON-LD values when available
    if (ld) {
      title = ld.name || title;
      description = ld.description || description;
      const img = ld.image;
      if (typeof img === 'string') image = img;
      else if (Array.isArray(img) && img.length) image = img[0];
      const offers = Array.isArray(ld.offers) ? ld.offers[0] : ld.offers;
      if (offers) {
        if (offers.price) priceRaw = String(offers.price);
        if (offers.priceCurrency) currency = String(offers.priceCurrency);
      }
    }
    let price = priceRaw;
    if (/^\d+(?:[\.,]\d+)?$/.test(priceRaw)) {
      const normalized = priceRaw.replace(',', '.');
      price = `${currency ? currency + ' ' : ''}${normalized}`;
    }
    // Try to parse rating out of common selectors if present
    let rating: number | undefined = undefined;
    let ratings_count: number | undefined = undefined;
    const ratingText = $('[itemprop="ratingValue"]').attr('content') || $('meta[itemprop="ratingValue"]').attr('content') || '';
    if (ratingText && /^\d+(?:[\.,]\d+)?$/.test(ratingText)) {
      rating = parseFloat(ratingText.replace(',', '.'));
      if (rating > 5) rating = undefined;
    }
    const countText = $('[itemprop="reviewCount"]').attr('content') || $('meta[itemprop="reviewCount"]').attr('content') || '';
    if (countText && /\d+/.test(countText)) {
      const cleaned = countText.replace(/[^0-9]/g, '');
      if (cleaned) ratings_count = parseInt(cleaned, 10);
    }
    if (ld && ld.aggregateRating) {
      const ar = ld.aggregateRating;
      if (ar.ratingValue && rating == null) {
        const v = String(ar.ratingValue).replace(',', '.');
        if (/^\d+(?:[\.,]\d+)?$/.test(v)) rating = parseFloat(v);
      }
      if (ar.reviewCount && ratings_count == null) {
        const c = String(ar.reviewCount).replace(/[^0-9]/g, '');
        if (c) ratings_count = parseInt(c, 10);
      }
    }
    // Country: map from hostname to FR/BE only
    const derived = extractCountryFromUrl(url, 'FR');
    const country = derived === 'BE' ? 'BE' : 'FR';

    return NextResponse.json({
      name: title,
      price,
      image_url: image,
      product_link: url,
      description,
      rating,
      ratings_count,
      country,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to ingest Zalando page';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
