export function addAmazonAffiliateTag(inputUrl: string, tag = 'giftingideasa-20'): string {
  try {
    const url = new URL(inputUrl);
    const host = url.hostname.toLowerCase();

    // Only modify Amazon product/storefront domains
    const isAmazon = /(^|\.)amazon\./.test(host);
    if (!isAmazon) return inputUrl;

    // Ensure the affiliate tag param is set/updated
    url.searchParams.set('tag', tag);
    return url.toString();
  } catch {
    return inputUrl;
  }
}

export function isAmazonUrl(inputUrl: string): boolean {
  try {
    const { hostname } = new URL(inputUrl);
    return /(^|\.)amazon\./i.test(hostname);
  } catch {
    return false;
  }
}

// Map Amazon TLD/hostnames to a country code label
const AMAZON_COUNTRY_MAP: Record<string, string> = {
  'amazon.com': 'US',
  'amazon.co.uk': 'UK',
  'amazon.de': 'DE',
  'amazon.fr': 'FR',
  'amazon.ca': 'CA',
  'amazon.com.au': 'AU',
  'amazon.co.jp': 'JP',
  'amazon.it': 'IT',
  'amazon.es': 'ES',
  'amazon.nl': 'NL',
  'amazon.se': 'SE',
  'amazon.pl': 'PL',
  'amazon.com.br': 'BR',
  'amazon.com.mx': 'MX',
  'amazon.ae': 'AE',
  'amazon.sa': 'SA',
  'amazon.com.tr': 'TR',
  'amazon.sg': 'SG',
  'amazon.in': 'IN',
};

export function extractAmazonCountry(inputUrl: string): string | undefined {
  try {
    const { hostname } = new URL(inputUrl);
    // Normalize to base amazon host (strip subdomains like www.)
    const parts = hostname.toLowerCase().split('.');
    // Find index of 'amazon'
    const idx = parts.findIndex((p) => p === 'amazon');
    if (idx !== -1) {
      const base = parts.slice(idx).join('.');
      if (AMAZON_COUNTRY_MAP[base]) return AMAZON_COUNTRY_MAP[base];
    }
    // Fallback for known patterns
    if (/\.co\.uk$/i.test(hostname)) return 'UK';
    if (/\.com$/i.test(hostname)) return 'US';
    return undefined;
  } catch {
    return undefined;
  }
}