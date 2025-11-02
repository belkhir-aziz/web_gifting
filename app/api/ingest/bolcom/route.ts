import { NextRequest, NextResponse } from 'next/server';
import { load } from 'cheerio';
import { isBolUrl } from '@/lib/domains';
import { fetchPage } from '@/lib/fetchPage';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { url } = (await req.json()) as { url?: string };
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Missing url' }, { status: 400 });
    }
    if (!isBolUrl(url)) {
      return NextResponse.json({ error: 'Only bol.com URLs are supported' }, { status: 400 });
    }

    const html = await fetchPage(url, {
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123 Safari/537.36',
      'accept-language': 'fr-FR,fr;q=0.9,en;q=0.8',
    }, 'no-store');
    const $ = load(html);

    // JSON-LD parsing for robust fields
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
    if (ld) {
      if (ld.name) title = ld.name;
      if (ld.description) description = ld.description;
      const img = ld.image;
      if (typeof img === 'string') image = img;
      else if (Array.isArray(img) && img.length) image = img[0];
      const offers = Array.isArray(ld.offers) ? ld.offers[0] : ld.offers;
      if (offers) {
        if (offers.price) priceRaw = String(offers.price);
        if (offers.priceCurrency) currency = String(offers.priceCurrency);
      }
    }
    // Price extraction fallbacks when meta tags are missing
    if (!priceRaw) {
      const twitterPrice = $('meta[name="twitter:data1"]').attr('content') || '';
      if (twitterPrice) priceRaw = twitterPrice;
    }
    if (!priceRaw) {
      const priceTexts: string[] = [];
      $('[data-test="price"], [data-test="price-info"], [data-test="price-value"], .promo-price, .price-block__highlight, .price-block__price')
        .each((_, el) => {
          const t = $(el).text().trim();
          if (t) priceTexts.push(t);
        });
      // Prefer entries containing €
      const eur = priceTexts.find((t) => /€\s*\d/.test(t));
      priceRaw = eur || priceTexts[0] || '';
    }
    // Normalize display price
    let price = priceRaw;
    const euroMatch = priceRaw.match(/€\s*([0-9]+(?:[\.,][0-9]{2})?)/);
    if (euroMatch) {
      price = `€ ${euroMatch[1]}`;
    } else if (/^\d+(?:[\.,]\d+)?$/.test(priceRaw)) {
      const hasComma = priceRaw.includes(',');
      const numeric = priceRaw.replace(',', '.');
      if ((currency || '').toUpperCase() === 'EUR') {
        price = `€ ${hasComma ? priceRaw : numeric}`;
      } else if (currency) {
        price = `${currency} ${numeric}`;
      } else {
        price = numeric;
      }
    }

    // Ratings via JSON-LD if present
    let rating: number | undefined = undefined;
    let ratings_count: number | undefined = undefined;
    if (ld && ld.aggregateRating) {
      const ar = ld.aggregateRating;
      if (ar.ratingValue) {
        const v = String(ar.ratingValue).replace(',', '.');
        if (/^\d+(?:[\.,]\d+)?$/.test(v)) rating = parseFloat(v);
        if (rating && rating > 5) rating = undefined;
      }
      if (ar.reviewCount) {
        const c = String(ar.reviewCount).replace(/[^0-9]/g, '');
        if (c) ratings_count = parseInt(c, 10);
      }
    }
    // Country: bol.com => BE
    const country = 'BE';

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
    const msg = e instanceof Error ? e.message : 'Failed to ingest bol.com page';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
