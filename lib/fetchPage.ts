type Provider =
  | { type: 'SCRAPE_API_URL'; url: string; apiKey?: string }
  | { type: 'SCRAPERAPI'; key: string }
  | { type: 'ZENROWS'; key: string }
  | { type: 'SCRAPINGBEE'; key: string }
  | { type: 'CRAWLBASE'; key: string };

function detectProvider(): Provider | null {
  const directUrl = process.env.SCRAPE_API_URL;
  if (directUrl) {
    return { type: 'SCRAPE_API_URL', url: directUrl, apiKey: process.env.SCRAPE_API_KEY };
  }
  const scraperApiKey = process.env.SCRAPERAPI_KEY || process.env.SCRAPER_API_KEY;
  if (scraperApiKey) return { type: 'SCRAPERAPI', key: scraperApiKey };
  const zenrowsKey = process.env.ZENROWS_KEY || process.env.ZENROWS_API_KEY;
  if (zenrowsKey) return { type: 'ZENROWS', key: zenrowsKey };
  const scrapingBeeKey = process.env.SCRAPINGBEE_KEY || process.env.SCRAPING_BEE_KEY;
  if (scrapingBeeKey) return { type: 'SCRAPINGBEE', key: scrapingBeeKey };
  const crawlbaseKey = process.env.CRAWLBASE_KEY || process.env.PROXYCRAWL_KEY;
  if (crawlbaseKey) return { type: 'CRAWLBASE', key: crawlbaseKey };
  return null;
}

function countryFromTld(urlStr: string): 'fr' | 'be' {
  try {
    const u = new URL(urlStr);
    const host = u.hostname.toLowerCase();
    if (host.endsWith('.be')) return 'be';
    return 'fr';
  } catch {
    return 'fr';
  }
}

function buildProxyUrl(url: string, provider: Provider): { url: string; headers?: HeadersInit } {
  switch (provider.type) {
    case 'SCRAPE_API_URL': {
      const base = provider.url;
      const final = base.includes('{URL}') ? base.replace('{URL}', encodeURIComponent(url)) : `${base}${base.includes('?') ? '&' : '?'}url=${encodeURIComponent(url)}`;
      const headers: HeadersInit = {};
      if (provider.apiKey) headers['x-api-key'] = provider.apiKey;
      return { url: final, headers };
    }
    case 'SCRAPERAPI': {
      const u = new URL('https://api.scraperapi.com/');
      u.searchParams.set('api_key', provider.key);
      u.searchParams.set('url', url);
      u.searchParams.set('country_code', countryFromTld(url));
      u.searchParams.set('render', 'false');
      u.searchParams.set('keep_headers', 'true');
      return { url: u.toString() };
    }
    case 'ZENROWS': {
      const u = new URL('https://api.zenrows.com/v1/');
      u.searchParams.set('apikey', provider.key);
      u.searchParams.set('url', url);
      u.searchParams.set('js_render', 'false');
      u.searchParams.set('premium_proxy', 'true');
      return { url: u.toString() };
    }
    case 'SCRAPINGBEE': {
      const u = new URL('https://app.scrapingbee.com/api/v1/');
      u.searchParams.set('api_key', provider.key);
      u.searchParams.set('url', url);
      u.searchParams.set('render_js', 'false');
      u.searchParams.set('country_code', countryFromTld(url));
      u.searchParams.set('block_resources', 'true');
      return { url: u.toString() };
    }
    case 'CRAWLBASE': {
      const u = new URL('https://api.crawlbase.com/scraper');
      u.searchParams.set('token', provider.key);
      u.searchParams.set('url', url);
      u.searchParams.set('country', countryFromTld(url));
      return { url: u.toString() };
    }
  }
}

export async function fetchPage(url: string, headers: Record<string, string> = {}, cache: RequestCache = 'no-store'): Promise<string> {
  const provider = detectProvider();

  const baseHeaders: HeadersInit = {
    'user-agent':
      headers['user-agent'] || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123 Safari/537.36',
    'accept-language': headers['accept-language'] || 'fr-FR,fr;q=0.9,en;q=0.8',
  };

  if (provider) {
    try {
      const built = buildProxyUrl(url, provider);
      const proxyHeaders: HeadersInit = { ...baseHeaders, ...(built.headers || {}) };
      const res = await fetch(built.url, { headers: proxyHeaders, cache });
      if (res.ok) {
        return await res.text();
      }
    } catch {}
  }

  const res = await fetch(url, { headers: baseHeaders, cache });
  return await res.text();
}

// Debug helper: returns the provider type name or null if none is configured.
export function getProxyProviderName(): string | null {
  const p = detectProvider();
  return p?.type ?? null;
}
