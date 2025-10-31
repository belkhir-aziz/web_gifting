"use client";
import { useEffect, useState } from 'react';
import { OCCASIONS, RELATIONSHIPS, AGE_RANGES } from '@/lib/constants';

export default function HomePage() {
  type Product = {
    id?: string;
    name: string;
    price: string;
    image_url: string;
    product_link: string;
    description?: string;
    category?: string;
    availability?: boolean;
    rating?: number;
    occasions?: string[];
    relationships?: string[];
    age_ranges?: string[];
    needs_categorization?: boolean;
  };
  const [queue, setQueue] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState<string | null>(null);
  const [showCategorization, setShowCategorization] = useState(false);
  const [askForCategorization, setAskForCategorization] = useState(false);
  const [categories, setCategories] = useState({
    occasions: [] as string[],
    relationships: [] as string[],
    age_ranges: [] as string[],
  });

  useEffect(() => {
    // Check if categorization is enabled
    try {
      const stored = localStorage.getItem('askForCategorization');
      setAskForCategorization(stored === 'true');
    } catch {}

    // Session-aware caching: load once per browser session
    const SESSION_ID_KEY = 'gifty.sessionId';
    const QUEUE_KEY = 'gifty.queue.v1';

    const ensureSession = () => {
      try {
        let sid = sessionStorage.getItem(SESSION_ID_KEY);
        if (!sid) {
          sid = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
          sessionStorage.setItem(SESSION_ID_KEY, sid);
          // new session: clear any stale cached queue
          sessionStorage.removeItem(QUEUE_KEY);
        }
      } catch {}
    };

    const loadFromCache = (): Product[] | null => {
      try {
        const raw = sessionStorage.getItem(QUEUE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return null;
        // If any legacy demo items slipped in, ignore cache
        if (parsed.some((x: unknown) => String(((x as { id?: unknown })?.id) || '').startsWith('demo-'))) {
          sessionStorage.removeItem(QUEUE_KEY);
          return null;
        }
        return parsed as Product[];
      } catch { return null; }
    };

    const saveToCache = (items: Product[]) => {
      try {
        sessionStorage.setItem(QUEUE_KEY, JSON.stringify(items));
      } catch {}
    };

    const bootstrap = async () => {
      ensureSession();
      const cached = loadFromCache();
      if (cached && cached.length) {
        setQueue(cached);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        const products = data.products || [];
        if (products.length > 0) {
          setQueue(products);
          saveToCache(products);
        } else {
          // No demo fallback: show empty state
          setQueue([]);
        }
      } catch (err) {
        console.error('Failed to load products:', err);
  // No demo fallback: show empty state
  setQueue([]);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();

    // Removed keyboard shortcuts per request
    return () => {};
  }, []);

  const toggleCategory = (field: 'occasions' | 'relationships' | 'age_ranges', value: string) => {
    setCategories(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value]
    }));
  };

  const act = async (action: 'like'|'dislike'|'superlike') => {
    const current = queue[0];
    if (!current || rating) return;
    
    setRating(action);
    
    // Show categorization screen only if global setting is enabled
    if (askForCategorization) {
      setShowCategorization(true);
    } else {
      // Submit rating immediately without categorization
      await fetch('/api/ratings', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ itemId: current.id, action })
      });
      
      // Move to next product and persist session queue
      setQueue((q) => {
        const next = q.slice(1);
        try { sessionStorage.setItem('gifty.queue.v1', JSON.stringify(next)); } catch {}
        return next;
      });
      setRating(null);
    }
  };

  const submitCategorization = async () => {
    const current = queue[0];
    if (!current) return;
    
    // Include categories if user provided them
  const payload: { itemId?: string | undefined; action?: string | null; occasions?: string[]; relationships?: string[]; age_ranges?: string[] } = { itemId: current.id, action: rating };
    if (categories.occasions.length > 0) payload.occasions = categories.occasions;
    if (categories.relationships.length > 0) payload.relationships = categories.relationships;
    if (categories.age_ranges.length > 0) payload.age_ranges = categories.age_ranges;
    
    await fetch('/api/ratings', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(payload)
    });
    
    // Move to next product and persist session queue
    setQueue((q) => {
      const next = q.slice(1);
      try { sessionStorage.setItem('gifty.queue.v1', JSON.stringify(next)); } catch {}
      return next;
    });
    setRating(null);
    setShowCategorization(false);
    setCategories({ occasions: [], relationships: [], age_ranges: [] });
  };

  const skipCategorization = async () => {
    const current = queue[0];
    if (!current) return;
    
    // Submit without categories
    await fetch('/api/ratings', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ itemId: current.id, action: rating })
    });
    
    // Move to next product and persist session queue
    setQueue((q) => {
      const next = q.slice(1);
      try { sessionStorage.setItem('gifty.queue.v1', JSON.stringify(next)); } catch {}
      return next;
    });
    setRating(null);
    setShowCategorization(false);
    setCategories({ occasions: [], relationships: [], age_ranges: [] });
  };

  const current = queue[0];
  // Removed unused reviewed variable

  const truncateWords = (s?: string, maxWords = 13) => {
    if (!s) return '';
    const words = s.trim().split(/\s+/);
    return words.length > maxWords ? words.slice(0, maxWords).join(' ') + '…' : s;
  };

  return (
    <div className="mx-auto max-w-3xl w-full space-y-6">
      {/* Categorization overlay */}
      {showCategorization && current ? (
        <div className="fixed inset-0 z-20 overflow-y-auto bg-black/10 backdrop-blur-sm">
          <div className="mx-auto max-w-2xl p-6">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Help us categorize! ✨</h2>
            <p className="mt-2 text-gray-600">Quick picks help others find the perfect gift</p>
          </div>

          {/* Product Image */}
          <div className="overflow-hidden rounded-xl border bg-white shadow-lg">
            <div className="aspect-video w-full overflow-hidden bg-gray-100">
              <img 
                src={current.image_url} 
                alt={current.name}
                className="h-full w-full object-cover"
                // eslint-disable-next-line @next/next/no-img-element
              />
            </div>
            <div className="p-4">
              <h3 className="font-bold text-gray-900">{current.name}</h3>
              <p className="text-lg font-semibold text-blue-600">${current.price}</p>
            </div>
          </div>

          {/* Categorization Options */}
          <div className="rounded-xl bg-white p-6 shadow-lg">
            <div className="space-y-4">
              {/* Occasions */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  🎉 Best for which occasions?
                </label>
                <div className="flex flex-wrap gap-2">
                  {OCCASIONS.map(occasion => (
                    <button
                      key={occasion}
                      type="button"
                      onClick={() => toggleCategory('occasions', occasion)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                        categories.occasions.includes(occasion)
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'bg-white text-gray-700 border border-gray-300 hover:border-purple-400 hover:bg-purple-50'
                      }`}
                    >
                      {occasion}
                    </button>
                  ))}
                </div>
              </div>

              {/* Relationships */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  💝 Good gift for?
                </label>
                <div className="flex flex-wrap gap-2">
                  {RELATIONSHIPS.map(relationship => (
                    <button
                      key={relationship}
                      type="button"
                      onClick={() => toggleCategory('relationships', relationship)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                        categories.relationships.includes(relationship)
                          ? 'bg-green-600 text-white shadow-md'
                          : 'bg-white text-gray-700 border border-gray-300 hover:border-green-400 hover:bg-green-50'
                      }`}
                    >
                      {relationship}
                    </button>
                  ))}
                </div>
              </div>

              {/* Age Ranges */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  👤 Best age range?
                </label>
                <div className="flex flex-wrap gap-2">
                  {AGE_RANGES.map(ageRange => (
                    <button
                      key={ageRange}
                      type="button"
                      onClick={() => toggleCategory('age_ranges', ageRange)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                        categories.age_ranges.includes(ageRange)
                          ? 'bg-orange-600 text-white shadow-md'
                          : 'bg-white text-gray-700 border border-gray-300 hover:border-orange-400 hover:bg-orange-50'
                      }`}
                    >
                      {ageRange}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={skipCategorization}
              className="flex-1 rounded-lg border-2 border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition-all hover:bg-gray-50"
            >
              Skip
            </button>
            <button
              onClick={submitCategorization}
              className="flex-1 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:bg-blue-700"
            >
              {categories.occasions.length + categories.relationships.length + categories.age_ranges.length > 0 
                ? `Submit (${categories.occasions.length + categories.relationships.length + categories.age_ranges.length} selected)` 
                : 'Submit'}
            </button>
          </div>
          </div>
        </div>
      ) : (
        <>
          {/* Progress removed per request */}

          {/* Main content */}
          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="text-center text-gray-500">Loading…</div>
            </div>
          ) : current ? (
            <div className="space-y-5">
              {/* Product Card (simple, compact) */}
              <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
                {current.image_url && (
                  <div className="bg-slate-100">
                    <div className="aspect-[3/2] w-full overflow-hidden">
                      <img src={current.image_url} alt={current.name} className="h-full w-full object-cover" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                    </div>
                  </div>
                )}
                <div className="p-5">
                  {/* Truncated title (max 13 words, single line) */}
                  <h2 className="text-lg font-bold text-slate-900 truncate">
                    {truncateWords(current.name, 13)}
                  </h2>
                  {current.price && (
                    <div className="mt-2 text-xl font-extrabold text-emerald-600">{current.price}</div>
                  )}
                  {current.description && (
                    <p className="mt-2 text-slate-600 line-clamp-2 text-sm">{current.description?.replace("'", "&apos;")}</p>
                  )}
                </div>
              </div>

              {/* Softer, modern action bar: Dislike, Like, Superlike, Go to merchant */}
              <div className="flex items-center justify-center gap-4 mt-6">
                <button
                  onClick={() => act('dislike')}
                  className="inline-flex items-center gap-2 rounded-full bg-rose-100 text-rose-700 px-6 py-3 font-semibold shadow-sm hover:bg-rose-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-200 transition-all"
                  aria-label="Dislike"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                  <span className="font-medium">Dislike</span>
                </button>
                <button
                  onClick={() => act('like')}
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-100 text-emerald-700 px-6 py-3 font-semibold shadow-sm hover:bg-emerald-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 transition-all"
                  aria-label="Like"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                  <span className="font-medium">Like</span>
                </button>
                <button
                  onClick={() => act('superlike')}
                  className="inline-flex items-center gap-2 rounded-full bg-amber-100 text-amber-700 px-6 py-3 font-semibold shadow-sm hover:bg-amber-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 transition-all"
                  aria-label="Superlike"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                  <span className="font-medium">Superlike</span>
                </button>
                <button
                  onClick={() => window.open(current.product_link, '_blank', 'noopener,noreferrer')}
                  className="inline-flex items-center gap-2 rounded-full bg-violet-100 text-violet-700 px-6 py-3 font-semibold shadow-sm hover:bg-violet-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-200 transition-all"
                  aria-label="Go to merchant"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M3 3h2l.4 2M7 13h10l4-8H5.4" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="10" cy="20" r="1" />
                    <circle cx="18" cy="20" r="1" />
                  </svg>
                  <span className="font-medium">Go to merchant</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">All Done!</h2>
                <p className="text-slate-600">You&apos;ve reviewed all available gifts</p>
                <p className="text-slate-600">You&apos;ve reviewed all available gifts</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
