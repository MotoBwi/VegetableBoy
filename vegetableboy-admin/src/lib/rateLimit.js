// Simple in-memory rate limiter for login attempts — keyed by username
// This prevents IP spoofing bypasses since the username itself is rate-limited
const loginAttempts = new Map();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const LOCKOUT_MS = 30 * 60 * 1000; // 30 minutes lockout after max attempts

export function checkRateLimit(key) {
  const now = Date.now();
  const record = loginAttempts.get(key);

  if (!record) {
    loginAttempts.set(key, { count: 1, firstAttempt: now, lockedUntil: 0 });
    return { allowed: true, remaining: MAX_ATTEMPTS - 1 };
  }

  // Clean up old entries periodically
  if (now - record.firstAttempt > WINDOW_MS && now > record.lockedUntil) {
    loginAttempts.set(key, { count: 1, firstAttempt: now, lockedUntil: 0 });
    return { allowed: true, remaining: MAX_ATTEMPTS - 1 };
  }

  // Check lockout
  if (now < record.lockedUntil) {
    const retryAfter = Math.ceil((record.lockedUntil - now) / 1000);
    return { allowed: false, retryAfter };
  }

  // Increment attempt
  record.count += 1;

  if (record.count >= MAX_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_MS;
    const retryAfter = Math.ceil(LOCKOUT_MS / 1000);
    return { allowed: false, retryAfter };
  }

  return { allowed: true, remaining: MAX_ATTEMPTS - record.count };
}

export function clearRateLimit(key) {
  loginAttempts.delete(key);
}
