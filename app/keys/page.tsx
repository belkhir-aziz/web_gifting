"use client";
import { useState } from 'react';

export default function KeysPage() {
  const [amazonKey, setAmazonKey] = useState('');
  const [amazonSecret, setAmazonSecret] = useState('');
  const [bolClientId, setBolClientId] = useState('');
  const [bolClientSecret, setBolClientSecret] = useState('');

  const save = async () => {
    const res = await fetch('/api/keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amazon: { accessKey: amazonKey, secretKey: amazonSecret },
        bol: { clientId: bolClientId, clientSecret: bolClientSecret },
      }),
    });
    const data = await res.json();
    if (res.ok) alert('Saved'); else alert(data.error || 'Failed');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Affiliate API Keys</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        <input className="border p-2" placeholder="Amazon Access Key" value={amazonKey} onChange={(e) => setAmazonKey(e.target.value)} />
        <input className="border p-2" placeholder="Amazon Secret Key" value={amazonSecret} onChange={(e) => setAmazonSecret(e.target.value)} />
        <input className="border p-2" placeholder="bol.com Client ID" value={bolClientId} onChange={(e) => setBolClientId(e.target.value)} />
        <input className="border p-2" placeholder="bol.com Client Secret" value={bolClientSecret} onChange={(e) => setBolClientSecret(e.target.value)} />
      </div>
      <button className="rounded bg-black px-4 py-2 text-white" onClick={save}>Save</button>
      <p className="text-sm text-gray-600">Keys are stored server-side and encrypted at rest. They are never exposed to the browser.</p>
    </div>
  );
}
