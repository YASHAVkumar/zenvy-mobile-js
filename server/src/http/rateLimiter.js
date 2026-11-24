function createRateLimiter({ limit = 12, windowMs = 60_000 } = {}) {
  const buckets = new Map();
  return function check(ip) {
    const now = Date.now();
    const bucket = buckets.get(ip);
    if (!bucket || now - bucket.startedAt >= windowMs) {
      buckets.set(ip, { startedAt: now, count: 1 });
      return true;
    }
    bucket.count += 1;
    if (buckets.size > 2000) {
      for (const [key, value] of buckets) if (now - value.startedAt >= windowMs) buckets.delete(key);
    }
    return bucket.count <= limit;
  };
}
module.exports = { createRateLimiter };
