"use client";
import { useState } from 'react';

export default function RequestAccessPage() {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');

  const submitKey = async () => {
    setError('');
    const res = await fetch('/api/auth/validate-key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key }),
    });
    const data = await res.json();
    if (res.ok) {
      window.location.href = '/';
    } else {
      setError(data.error || 'Invalid key');
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-6">
      <h1 className="text-2xl font-semibold">Access Required</h1>
      <p className="text-gray-600">
        To use this app, you need an access key. Please send an email to{' '}
        <a href="mailto:aziz.belkhir.aziz@gmail.com" className="text-blue-600 underline">
          aziz.belkhir.aziz@gmail.com
        </a>{' '}
        with your motivation and we'll send you a key.
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Enter your access key</label>
          <input
            type="text"
            className="mt-1 w-full rounded border p-2"
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submitKey()}
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="w-full rounded bg-black px-4 py-2 text-white hover:bg-gray-800" onClick={submitKey}>
          Submit Key
        </button>
      </div>
    </div>
  );
}
