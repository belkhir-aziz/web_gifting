export async function fetchPage(url: string, headers: Record<string, string> = {}, cache: RequestCache = 'no-store'): Promise<string> {
  const proxy = process.env.SCRAPE_API_URL;
  const apiKey = process.env.SCRAPE_API_KEY;

  const baseHeaders: HeadersInit = {
    'user-agent':
      headers['user-agent'] || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123 Safari/537.36',
    'accept-language': headers['accept-language'] || 'fr-FR,fr;q=0.9,en;q=0.8',
  };

  // If a proxy is configured, try it first
  if (proxy) {
    try {
      const finalUrl = proxy.includes('{URL}')
        ? proxy.replace('{URL}', encodeURIComponent(url))
        : `${proxy}${proxy.includes('?') ? '&' : '?'}url=${encodeURIComponent(url)}`;

      const proxyHeaders: HeadersInit = { ...baseHeaders };
      if (apiKey) proxyHeaders['x-api-key'] = apiKey;

      const res = await fetch(finalUrl, { headers: proxyHeaders, cache });
      if (res.ok) {
        return await res.text();
      }
      // fallthrough to direct fetch on non-2xx
    } catch {
      // fallthrough to direct fetch on proxy error
    }
  }

  // Direct fetch as fallback
  const res = await fetch(url, { headers: baseHeaders, cache });
  return await res.text();
}
