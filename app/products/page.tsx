"use client";
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { OCCASIONS, RELATIONSHIPS, AGE_RANGES, CATEGORIES } from '@/lib/constants';

export default function ProductsPage() {
  // Removed access key logic
  const [askForCategorization, setAskForCategorization] = useState(false);
  const [addMode, setAddMode] = useState<'amazon' | 'manual'>('amazon');
  const [form, setForm] = useState({ 
    name: '', 
    price: '', 
    image_url: '', 
    product_link: '',
    country: 'FR',
    categories: [] as string[],
    rating: undefined as number | undefined,
    ratings_count: undefined as number | undefined,
    occasions: [] as string[],
    relationships: [] as string[],
    age_ranges: [] as string[],
    source: '' as string,
  });
  const [adding, setAdding] = useState(false);
  const [amazonUrl, setAmazonUrl] = useState('');
  const [imported, setImported] = useState(false);

  useEffect(() => {
    // Load setting from localStorage
    try {
      const stored = localStorage.getItem('askForCategorization');
      if (stored) {
        setAskForCategorization(stored === 'true');
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Removed submitKey logic

  const toggleCategory = (field: 'occasions' | 'relationships' | 'age_ranges' | 'categories', value: string) => {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value]
    }));
  };

  const toggleSelectAll = (field: 'occasions' | 'relationships' | 'age_ranges' | 'categories') => {
    setForm(prev => {
      const allValues = field === 'occasions' ? [...OCCASIONS] : field === 'relationships' ? [...RELATIONSHIPS] : field === 'age_ranges' ? [...AGE_RANGES] : [...CATEGORIES];
      const isAllSelected = prev[field].length === allValues.length;
      return {
        ...prev,
        [field]: isAllSelected ? [] : (allValues as unknown as string[]),
      };
    });
  };

  const addProduct = async () => {
    // Validation
    if (!form.name.trim()) {
      alert('Product name is required');
      return;
    }
    if (!form.price.trim()) {
      alert('Price is required');
      return;
    }
    if (!form.image_url.trim()) {
      alert('Image URL is required');
      return;
    }
    if (!form.product_link.trim()) {
      alert('Product Link is required');
      return;
    }
    
    // URL validation
    try {
      new URL(form.image_url);
    } catch {
      alert('Image URL must be a valid URL (starting with http:// or https://)');
      return;
    }
    try {
      new URL(form.product_link);
    } catch {
      alert('Product Link must be a valid URL (starting with http:// or https://)');
      return;
    }

    setAdding(true);
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        category: form.categories,
      }),
    });
    const data = await res.json();
    setAdding(false);
    if (res.ok) {
      setForm({ 
        name: '', 
        price: '', 
        image_url: '', 
        product_link: '',
        country: 'FR',
        categories: [],
        rating: undefined,
        ratings_count: undefined,
        occasions: [],
        relationships: [],
        age_ranges: [],
        source: '',
      });
      alert('Product added');
    } else {
      alert(data.error || 'Failed to add product');
    }
  };

  const importFromUrl = async () => {
    if (!amazonUrl.trim()) {
      alert('Paste a product URL');
      return;
    }
    try {
      new URL(amazonUrl);
    } catch {
      alert('Please enter a valid URL');
      return;
    }
    try {
      const u = new URL(amazonUrl.trim());
      const host = u.hostname.toLowerCase();
      let endpoint = '';
      let source = '';
      if ((/^(.+\.)?amazon\./).test(host)) { endpoint = '/api/ingest/amazon'; source = 'amazon'; }
      else if ((/^(.+\.)?bol\.com$/).test(host) || (/^(.+\.)?s-bol\.com$/).test(host)) { endpoint = '/api/ingest/bolcom'; source = 'bol'; }
      else if ((/^(.+\.)?zalando\./).test(host)) { endpoint = '/api/ingest/zalando'; source = 'zalando'; }
      else if ((/^(.+\.)?etsy\.com$/).test(host)) { endpoint = '/api/ingest/etsy'; source = 'etsy'; }
      else {
        alert('Unsupported store. Supported: Amazon, bol.com, Zalando, Etsy');
        return;
      }
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: amazonUrl.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Could not import');
        return;
      }
      setForm(prev => ({
        ...prev,
        name: data.name || prev.name,
        price: data.price || prev.price,
        image_url: data.image_url || prev.image_url,
        product_link: data.product_link || prev.product_link,
        rating: typeof data.rating === 'number' ? data.rating : prev.rating,
        ratings_count: typeof data.ratings_count === 'number' ? data.ratings_count : prev.ratings_count,
        country: data && typeof data.country === 'string' && data.country.toUpperCase() === 'BE' ? 'BE' : 'FR',
        source,
      }));
      setImported(true);
    } catch (e) {
      console.error(e);
      alert('Failed to import product');
    }
  };

  // Removed all access key UI and logic

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold">Products</h1>
        <p className="text-gray-600">Create products here. This screen doesn’t list products from Supabase.</p>
      </div>

      {/* Add type switch */}
      <div className="rounded-lg border bg-white p-2 shadow-sm w-full">
        <div className="flex">
          <button
            type="button"
            onClick={() => setAddMode('amazon')}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-semibold ${
              addMode === 'amazon' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            Add via URL
          </button>
          <button
            type="button"
            onClick={() => setAddMode('manual')}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-semibold ${
              addMode === 'manual' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
            }`}
          >
            Add manually
          </button>
        </div>
      </div>

      {/* Settings Bar */}
      <div className="rounded-lg border-2 border-blue-300 bg-gradient-to-r from-blue-50 to-purple-50 p-6 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">⚙️ Community Help</h2>
            <p className="mt-1 text-sm text-gray-600">
              Enable this to ask your friends to help improve gift recommendations
            </p>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <span className={`text-sm font-semibold ${askForCategorization ? 'text-blue-700' : 'text-gray-500'}`}>
              {askForCategorization ? 'Help Mode: ON' : 'Help Mode: OFF'}
            </span>
            <div className="relative">
              <input
                type="checkbox"
                checked={askForCategorization}
                onChange={(e) => {
                  const newValue = e.target.checked;
                  setAskForCategorization(newValue);
                  localStorage.setItem('askForCategorization', String(newValue));
                }}
                className="sr-only peer"
              />
              <div className="h-8 w-14 rounded-full bg-gray-300 peer-checked:bg-blue-600 transition-colors"></div>
              <div className="absolute left-1 top-1 h-6 w-6 rounded-full bg-white transition-transform peer-checked:translate-x-6 shadow-md"></div>
            </div>
          </label>
        </div>
        {askForCategorization && (
          <div className="mt-4 rounded-lg bg-blue-100 p-3 text-sm text-blue-800">
            ✨ When enabled, users will be invited to help categorize gifts after rating them. This helps everyone discover better gift matches based on occasions, relationships, and age ranges!
          </div>
        )}
      </div>

      {addMode === 'amazon' && (
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Import from URL</h2>
          <div className="mt-4 flex flex-col md:flex-row gap-3">
            <input
              type="url"
              placeholder="Paste a product URL (Amazon, bol.com, Zalando, Etsy)"
              value={amazonUrl}
              onChange={(e) => setAmazonUrl(e.target.value)}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={importFromUrl}
              className="rounded-lg bg-emerald-600 px-6 py-2.5 font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              type="button"
            >
              Import
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-500">We&apos;ll extract title, price, image and add your affiliate tag automatically. You can review and edit before saving.</p>

          {imported && (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border bg-white p-4">
                <h3 className="font-semibold mb-2">Preview</h3>
                {form.image_url && (
                  <div className="relative aspect-[3/2] w-full overflow-hidden rounded-lg bg-gray-100">
                    <Image src={form.image_url} alt={form.name} fill className="object-contain" sizes="(max-width: 768px) 100vw, 50vw" />
                  </div>
                )}
                <div className="mt-3">
                  <div className="text-sm text-gray-500">Name</div>
                  <div className="font-medium">{form.name || '—'}</div>
                </div>
                <div className="mt-2">
                  <div className="text-sm text-gray-500">Price</div>
                  <div className="font-medium">{form.price || '—'}</div>
                </div>
                <div className="mt-2">
                  <div className="text-sm text-gray-500">Rating</div>
                  <div className="font-medium">{form.rating ? `${form.rating} / 5` : '—'}{typeof form.ratings_count === 'number' ? ` (${form.ratings_count.toLocaleString()} ratings)` : ''}</div>
                </div>
                <div className="mt-2 break-all">
                  <div className="text-sm text-gray-500">Link</div>
                  <a className="text-blue-600 underline" href={form.product_link} target="_blank" rel="noreferrer">Open</a>
                </div>
                <div className="mt-2">
                  <div className="text-sm text-gray-500">Country</div>
                  <div className="font-medium">{form.country || 'FR'}</div>
                </div>
                <div className="mt-2">
                  <div className="text-sm text-gray-500">Source</div>
                  <div className="font-medium">{form.source || '—'}</div>
                </div>
              </div>

              <div className="rounded-xl border bg-white p-4">
                <h3 className="font-semibold mb-2">Review & Edit</h3>
                <div className="grid gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Product Name *</label>
                    <input 
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      value={form.name} 
                      onChange={(e) => setForm({ ...form, name: e.target.value })} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Price *</label>
                    <input 
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      value={form.price} 
                      onChange={(e) => setForm({ ...form, price: e.target.value })} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Rating (0-5)</label>
                    <input 
                      type="number" min={0} max={5} step={0.1}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      value={form.rating ?? ''} 
                      onChange={(e) => setForm({ ...form, rating: e.target.value === '' ? undefined : Number(e.target.value) })} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Total ratings</label>
                    <input
                      type="number" min={0} step={1}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={form.ratings_count ?? ''}
                      onChange={(e) => setForm({ ...form, ratings_count: e.target.value === '' ? undefined : Math.max(0, Math.floor(Number(e.target.value))) })}
                    />
                  </div>
                  {/* Country is fixed to France */}
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="block text-sm font-medium text-gray-700">Categories</label>
                      <button
                        type="button"
                        onClick={() => toggleSelectAll('categories')}
                        className="text-xs font-medium text-blue-600 hover:underline"
                      >
                        {form.categories.length === CATEGORIES.length ? 'Clear all' : 'Select all'}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => toggleCategory('categories', cat)}
                          className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                            form.categories.includes(cat)
                              ? 'bg-emerald-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Image URL *</label>
                    <input 
                      type="url"
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      value={form.image_url} 
                      onChange={(e) => setForm({ ...form, image_url: e.target.value })} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Product Link *</label>
                    <input 
                      type="url"
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      value={form.product_link} 
                      onChange={(e) => setForm({ ...form, product_link: e.target.value })} 
                    />
                  </div>
                  {/* Categories selection */}
                  <div className="pt-2 grid gap-5">
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <label className="block text-sm font-medium text-gray-700">Occasions</label>
                        <button
                          type="button"
                          onClick={() => toggleSelectAll('occasions')}
                          className="text-xs font-medium text-blue-600 hover:underline"
                        >
                          {form.occasions.length === OCCASIONS.length ? 'Clear all' : 'Select all'}
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {OCCASIONS.map(occasion => (
                          <button
                            key={occasion}
                            type="button"
                            onClick={() => toggleCategory('occasions', occasion)}
                            className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                              form.occasions.includes(occasion)
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {occasion}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <label className="block text-sm font-medium text-gray-700">Relationships</label>
                        <button
                          type="button"
                          onClick={() => toggleSelectAll('relationships')}
                          className="text-xs font-medium text-blue-600 hover:underline"
                        >
                          {form.relationships.length === RELATIONSHIPS.length ? 'Clear all' : 'Select all'}
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {RELATIONSHIPS.map(relationship => (
                          <button
                            key={relationship}
                            type="button"
                            onClick={() => toggleCategory('relationships', relationship)}
                            className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                              form.relationships.includes(relationship)
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {relationship}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <label className="block text-sm font-medium text-gray-700">Age Ranges</label>
                        <button
                          type="button"
                          onClick={() => toggleSelectAll('age_ranges')}
                          className="text-xs font-medium text-blue-600 hover:underline"
                        >
                          {form.age_ranges.length === AGE_RANGES.length ? 'Clear all' : 'Select all'}
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {AGE_RANGES.map(ageRange => (
                          <button
                            key={ageRange}
                            type="button"
                            onClick={() => toggleCategory('age_ranges', ageRange)}
                            className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                              form.age_ranges.includes(ageRange)
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {ageRange}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button 
                    className="mt-2 rounded-lg bg-blue-600 px-6 py-2.5 font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={addProduct}
                    disabled={adding}
                  >
                    {adding ? 'Saving…' : 'Save product'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {addMode === 'manual' && (
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Add New Product (Manual)</h1>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Product Name *</label>
            <input 
              required
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500" 
              placeholder="e.g., Wireless Headphones" 
              value={form.name} 
              onChange={(e) => setForm({ ...form, name: e.target.value })} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Price *</label>
            <input 
              required
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500" 
              placeholder="e.g., $29.99" 
              value={form.price} 
              onChange={(e) => setForm({ ...form, price: e.target.value })} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Image URL *</label>
            <input 
              required
              type="url"
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500" 
              placeholder="https://example.com/image.jpg" 
              value={form.image_url} 
              onChange={(e) => setForm({ ...form, image_url: e.target.value })} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Product Link *</label>
            <input 
              required
              type="url"
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500" 
              placeholder="https://example.com/product" 
              value={form.product_link} 
              onChange={(e) => setForm({ ...form, product_link: e.target.value })} 
            />
          </div>
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">Categories</label>
            <button
              type="button"
              onClick={() => toggleSelectAll('categories')}
              className="text-xs font-medium text-blue-600 hover:underline"
            >
              {form.categories.length === CATEGORIES.length ? 'Clear all' : 'Select all'}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCategory('categories', cat)}
                className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                  form.categories.includes(cat)
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Categories Section */}
        <div className="mt-6 space-y-6">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">Occasions</label>
              <button
                type="button"
                onClick={() => toggleSelectAll('occasions')}
                className="text-xs font-medium text-blue-600 hover:underline"
              >
                {form.occasions.length === OCCASIONS.length ? 'Clear all' : 'Select all'}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {OCCASIONS.map(occasion => (
                <button
                  key={occasion}
                  type="button"
                  onClick={() => toggleCategory('occasions', occasion)}
                  className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                    form.occasions.includes(occasion)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {occasion}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">Relationships</label>
              <button
                type="button"
                onClick={() => toggleSelectAll('relationships')}
                className="text-xs font-medium text-blue-600 hover:underline"
              >
                {form.relationships.length === RELATIONSHIPS.length ? 'Clear all' : 'Select all'}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {RELATIONSHIPS.map(relationship => (
                <button
                  key={relationship}
                  type="button"
                  onClick={() => toggleCategory('relationships', relationship)}
                  className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                    form.relationships.includes(relationship)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {relationship}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">Age Ranges</label>
              <button
                type="button"
                onClick={() => toggleSelectAll('age_ranges')}
                className="text-xs font-medium text-blue-600 hover:underline"
              >
                {form.age_ranges.length === AGE_RANGES.length ? 'Clear all' : 'Select all'}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {AGE_RANGES.map(ageRange => (
                <button
                  key={ageRange}
                  type="button"
                  onClick={() => toggleCategory('age_ranges', ageRange)}
                  className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                    form.age_ranges.includes(ageRange)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {ageRange}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button 
          className="mt-6 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400"
          onClick={addProduct}
          disabled={adding}
        >
          {adding ? 'Adding...' : 'Add Product'}
        </button>
      </div>
      )}

      {/* Products List removed per request: do not show products from Supabase here */}
    </div>
  );
}
