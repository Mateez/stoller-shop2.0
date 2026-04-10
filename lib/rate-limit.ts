interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) {
      store.delete(key);
    }
  }
}, 60_000);

interface RateLimitOptions {
  /** Max requests allowed in the window */
  maxRequests: number;
  /** Time window in seconds */
  windowSeconds: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function checkRateLimit(
  key: string,
  options: RateLimitOptions,
): RateLimitResult {
  const now = Date.now();
  const windowMs = options.windowSeconds * 1000;

  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: options.maxRequests - 1, retryAfterSeconds: 0 };
  }

  if (entry.count < options.maxRequests) {
    entry.count++;
    return {
      allowed: true,
      remaining: options.maxRequests - entry.count,
      retryAfterSeconds: 0,
    };
  }

  const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000);
  return { allowed: false, remaining: 0, retryAfterSeconds };
}
