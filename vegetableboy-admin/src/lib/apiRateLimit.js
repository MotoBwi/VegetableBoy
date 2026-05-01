// General in-memory rate limiter for authenticated API endpoints
// Keys by IP + endpoint path
const requestMap = new Map();

const MAX_REQ = 120; // requests
const WINDOW_MS = 60 * 1000; // per minute

export function checkApiRateLimit(key) {
  const now = Date.now();
  const record = requestMap.get(key);

  if (!record || now > record.resetAt) {
    requestMap.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_REQ - 1 };
  }

  record.count += 1;
  if (record.count > MAX_REQ) {
    return { allowed: false, retryAfter: Math.ceil((record.resetAt - now) / 1000) };
  }

  return { allowed: true, remaining: MAX_REQ - record.count };
}
