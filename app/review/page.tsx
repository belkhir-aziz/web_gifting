"use client";
import { useEffect, useState } from 'react';

export default function ReviewPage() {
  const [queue, setQueue] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;
    const loadProducts = async () => {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        if (!isMounted) return;
        setQueue(Array.isArray(data?.products) ? data.products : []);
      } catch (error) {
        console.error('Failed to load products:', error);
        if (isMounted) setQueue([]);
      }
    };
    loadProducts();
    return () => { isMounted = false; };
  }, []);

  const act = async (action: 'like'|'dislike'|'superlike') => {
    const current = queue[0];
    if (!current) return;
    await fetch('/api/ratings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ itemId: current.id, action })});
    setQueue((q) => q.slice(1));
  };

  const current = queue[0];
  const truncateWords = (s?: string, maxWords = 13) => {
    if (!s) return '';
    const words = s.trim().split(/\s+/);
    return words.length > maxWords ? words.slice(0, maxWords).join(' ') + '…' : s;
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-6 bg-white/80 backdrop-blur-sm border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Gift Discovery</h1>
          <p className="text-sm text-slate-500 mt-1">Find the perfect gift</p>
        </div>
        <div className="text-sm font-medium text-slate-600">{queue.length} {queue.length === 1 ? 'item' : 'items'} remaining</div>
      </div>

      {/* Main Content Area */}
      {current ? (
        <div className="flex-1 flex items-center justify-center p-8 overflow-hidden">
          <div className="w-full max-w-6xl h-full flex items-center gap-8">
            {/* Left Action Button - Dislike */}
            <button onClick={() => act('dislike')} className="group flex-shrink-0 w-32 h-32 rounded-3xl bg-gradient-to-br from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 shadow-2xl hover:shadow-red-500/50 transition-all duration-300 transform hover:scale-110 active:scale-95 flex flex-col items-center justify-center text-white" aria-label="Dislike">
              <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              <span className="text-lg font-bold">Nope</span>
            </button>

            {/* Center Product Card */}
            <div className="flex-1 h-full flex items-center justify-center">
              <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
                {current.image_url && (
                  <div className="relative aspect-[4/3] bg-gradient-to-br from-slate-100 to-slate-200">
                    <img src={current.image_url} alt={current.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-8">
                  <h2 className="text-3xl font-bold text-slate-900 mb-3 truncate">{truncateWords(current.name, 13)}</h2>
                  {current.price && (
                    <div className="inline-block px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mb-4">
                      <span className="text-2xl font-bold text-white">{current.price}</span>
                    </div>
                  )}
                  {current.description && (
                    <p className="text-slate-600 text-lg leading-relaxed line-clamp-3">{current.description}</p>
                  )}
                  {current.product_link && (
                    <a href={current.product_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-4 text-purple-600 hover:text-purple-700 font-medium">
                      View Product
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Right Action Buttons - Like & Superlike stacked */}
            <div className="flex-shrink-0 flex flex-col gap-4">
              <button onClick={() => act('superlike')} className="group w-32 h-32 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 shadow-2xl hover:shadow-amber-500/50 transition-all duration-300 transform hover:scale-110 active:scale-95 flex flex-col items-center justify-center text-white" aria-label="Superlike">
                <svg className="w-12 h-12 mb-2" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                <span className="text-lg font-bold">Love it!</span>
              </button>
              <button onClick={() => act('like')} className="group w-32 h-32 rounded-3xl bg-gradient-to-br from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300 transform hover:scale-110 active:scale-95 flex flex-col items-center justify-center text-white" aria-label="Like">
                <svg className="w-12 h-12 mb-2" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                <span className="text-lg font-bold">Like it</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">All Done!</h2>
            <p className="text-slate-600">You've reviewed all available gifts</p>
          </div>
        </div>
      )}
    </div>
  );
}
