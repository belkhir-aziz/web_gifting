import crypto from 'crypto';

// AES-256-GCM encrypt/decrypt using ENCRYPTION_KEY (base64, 32 bytes)
const keyB64 = process.env.ENCRYPTION_KEY || '';
const KEY = keyB64 ? Buffer.from(keyB64, 'base64') : undefined;

export function encryptJson(obj: unknown) {
  if (!KEY) throw new Error('Missing ENCRYPTION_KEY');
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', KEY, iv);
  const plaintext = Buffer.from(JSON.stringify(obj));
  const enc = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString('base64');
}

export function decryptJson<T = unknown>(b64: string): T {
  if (!KEY) throw new Error('Missing ENCRYPTION_KEY');
  const buf = Buffer.from(b64, 'base64');
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const data = buf.subarray(28);
  const decipher = crypto.createDecipheriv('aes-256-gcm', KEY, iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(data), decipher.final()]);
  return JSON.parse(dec.toString());
}
