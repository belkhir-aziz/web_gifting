import { NextRequest, NextResponse } from 'next/server';
import { load } from 'cheerio';
import { addAmazonAffiliateTag, isAmazonUrl } from '@/lib/affiliate';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { url } = (await req.json()) as { url?: string };
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Missing url' }, { status: 400 });
    }
    if (!isAmazonUrl(url)) {
      return NextResponse.json({ error: 'Only Amazon product URLs are supported' }, { status: 400 });
    }

    // Fetch the page HTML server-side with a realistic UA
    const res = await fetch(url, {
      // Node runtime follows redirects by default
      headers: {
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123 Safari/537.36',
        'accept-language': 'fr-FR,fr;q=0.9,en;q=0.8',
      },
      cache: 'no-store',
    });
    const html = await res.text();

    const $ = load(html);

    const title = $('#productTitle').text().trim() || $('meta[property="og:title"]').attr('content') || '';
      const priceRaw = $('#corePrice_feature_div .a-offscreen').first().text().trim()
        || $('#priceblock_ourprice').text().trim()
        || $('#priceblock_dealprice').text().trim()
        || $('meta[itemprop="price"]').attr('content')
        || '';
    let image = $('#landingImage').attr('src') || $('img[data-old-hires]').attr('data-old-hires') || $('meta[property="og:image"]').attr('content') || '';
    if (image && image.startsWith('//')) image = `https:${image}`;

    const bullets = $('#feature-bullets li')
      .map((_: number, el) => $(el).text().trim())
      .get()
      .filter(Boolean);
    const description = bullets.join(' • ');

      // Rating and ratings count
      const ratingText = (
        $('#acrPopover').attr('title') ||
        $('i.a-icon-star span.a-icon-alt').text() ||
        $('span[data-hook="rating-out-of-text"]').text() ||
        ''
      ).trim();
      let rating: number | undefined = undefined;
      // Support EN (out of 5) and FR (sur 5)
      const m = ratingText.match(/([0-9]+(?:[\.,][0-9]+)?)\s+(?:out of|sur)\s+5/);
      if (m) rating = parseFloat(m[1].replace(',', '.'));

      // Ratings count (be robust against duplicated text and various locales)
      const countCandidates = [
        $('#acrCustomerReviewText').first().text(),
        $('span[data-hook="total-review-count"]').first().text(),
        $('span#acrCustomerReviewText').first().text(),
        $('a[href="#customerReviews"]').first().text(),
      ].map((s) => (s || '').trim()).filter(Boolean);
      let ratings_count: number | undefined = undefined;
      const ct = countCandidates[0] || '';
      // Prefer the first grouped number like 1,860 or 1.860 or 1 860; else any digits
      const mCount = ct.match(/([0-9]{1,3}(?:[.,\s][0-9]{3})+|\d+)/);
      if (mCount && mCount[1]) {
        const cleaned = mCount[1].replace(/[^0-9]/g, '');
        if (cleaned) ratings_count = parseInt(cleaned, 10);
      } else {
        const onlyDigits = ct.replace(/[^0-9]/g, '');
        if (onlyDigits) {
          // Fix duplication patterns like "18601860" -> "1860"
          const len = onlyDigits.length;
          if (len % 2 === 0) {
            const half = onlyDigits.slice(0, len / 2);
            if (half.repeat(2) === onlyDigits) {
              ratings_count = parseInt(half, 10);
            } else {
              ratings_count = parseInt(onlyDigits, 10);
            }
          } else {
            ratings_count = parseInt(onlyDigits, 10);
          }
        }
      }
    // Prefer canonical URL if present
  const canonical = $('link[rel="canonical"]').attr('href') || url;
    const product_link = addAmazonAffiliateTag(canonical);
  // Force country to France per requirement
  const country = 'FR';

    // Normalize price as $xx.xx if possible
    // Normalize price; keep currency if present; handle comma decimals
    let price = priceRaw;
    if (/^\d+(?:[\.,]\d+)?$/.test(priceRaw)) {
      const numeric = priceRaw.replace(/[^0-9,\.]/g, '').replace(',', '.');
      // Prefer Euro symbol for FR if original contained €
      if (/[€]/.test(priceRaw)) {
        price = `${numeric} €`;
      } else {
        price = numeric;
      }
    }

      return NextResponse.json({
      name: title,
      price,
      image_url: image,
      product_link,
        description,
        rating,
        ratings_count,
        country,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to ingest Amazon page';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
