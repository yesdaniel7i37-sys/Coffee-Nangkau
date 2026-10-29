// Pembatas permintaan sederhana di memori server (cukup untuk demo/portofolio).
// Catatan: di hosting serverless penghitungnya bisa terpisah per instans, jadi bukan pengaman mutlak.
const buckets = new Map();

export function rateLimit(key, limit, windowMs) {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now > b.reset) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    if (buckets.size > 2000) for (const [k, v] of buckets) if (now > v.reset) buckets.delete(k);
    return { ok: true };
  }
  if (b.count >= limit) return { ok: false, retryAfter: Math.ceil((b.reset - now) / 1000) };
  b.count++;
  return { ok: true };
}

// Batas harian total pemanggilan AI, supaya kuota gratis tidak habis oleh satu orang
let budget = { day: "", used: 0 };
export function takeAiBudget(cap) {
  const day = new Date().toISOString().slice(0, 10);
  if (budget.day !== day) budget = { day, used: 0 };
  if (budget.used >= cap) return false;
  budget.used++;
  return true;
}
