"use client";
import { useEffect, useState } from 'react';
import { OCCASIONS, RELATIONSHIPS, AGE_RANGES } from '@/lib/constants';

export default function ProductsPage() {
  // Removed access key logic
  const [askForCategorization, setAskForCategorization] = useState(false);
  const [form, setForm] = useState({ 
    name: '', 
    price: '', 
    image_url: '', 
    product_link: '',
    occasions: [] as string[],
    relationships: [] as string[],
    age_ranges: [] as string[],
  });
  const [adding, setAdding] = useState(false);

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

  const toggleCategory = (field: 'occasions' | 'relationships' | 'age_ranges', value: string) => {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value]
    }));
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
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setAdding(false);
    if (res.ok) {
      setForm({ 
        name: '', 
        price: '', 
        image_url: '', 
        product_link: '',
        occasions: [],
        relationships: [],
        age_ranges: [],
      });
      alert('Product added');
    } else {
      alert(data.error || 'Failed to add product');
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

      {/* Add Product Section */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Add New Product</h1>
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

        {/* Categories Section */}
        <div className="mt-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Occasions</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Relationships</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Age Ranges</label>
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

      {/* Products List removed per request: do not show products from Supabase here */}
    </div>
  );
}
