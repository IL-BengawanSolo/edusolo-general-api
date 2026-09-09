// Simple in-memory TTL cache — no external Redis needed for Vercel serverless (per-instance)
// For production multi-instance, replace with Redis or Upstash
const store = new Map();

export function getCache(key) {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.value;
}

export function setCache(key, value, ttlMs = 5 * 60 * 1000) {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
}

export function withCache(key, ttlMs, fn) {
  return async (...args) => {
    const cached = getCache(key);
    if (cached !== null) return cached;
    const result = await fn(...args);
    setCache(key, result, ttlMs);
    return result;
  };
}

export function invalidateCache(prefix) {
  for (const k of store.keys()) if (k.startsWith(prefix)) store.delete(k);
}
