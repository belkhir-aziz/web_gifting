export function isBolUrl(inputUrl: string): boolean {
  try {
    const { hostname } = new URL(inputUrl);
    return /(^|\.)bol\.com$/i.test(hostname) || /(^|\.)s-bol\.com$/i.test(hostname);
  } catch {
    return false;
  }
}

export function isZalandoUrl(inputUrl: string): boolean {
  try {
    const { hostname } = new URL(inputUrl);
    return /(^|\.)zalando\./i.test(hostname) || /(^|\.)zln\.do$/i.test(hostname);
  } catch {
    return false;
  }
}

export function isEtsyUrl(inputUrl: string): boolean {
  try {
    const { hostname } = new URL(inputUrl);
    return /(^|\.)etsy\.com$/i.test(hostname);
  } catch {
    return false;
  }
}

export function extractCountryFromUrl(inputUrl: string, fallback?: string): string | undefined {
  try {
    const { hostname } = new URL(inputUrl);
    const host = hostname.toLowerCase();
    // amazon.* handled elsewhere; here handle zalando and localized TLDs, bol.com default NL, etsy.com default US
    if (host.endsWith('bol.com')) return 'BE';
    if (host.endsWith('zalando.de')) return 'DE';
    if (host.endsWith('zalando.nl')) return 'NL';
    if (host.endsWith('zalando.fr')) return 'FR';
    if (host.endsWith('zalando.it')) return 'IT';
    if (host.endsWith('zalando.es')) return 'ES';
    if (host.endsWith('zalando.co.uk')) return 'UK';
    if (host.endsWith('zalando.pl')) return 'PL';
    if (host.endsWith('zalando.se')) return 'SE';
    if (host.endsWith('zalando.be')) return 'BE';
    if (host.endsWith('etsy.com')) return 'US';
    return fallback;
  } catch {
    return fallback;
  }
}
