/**
 * Rate limiting enforcement
 */

export interface RateLimit {
  limit: number;
  window: number; // in milliseconds
}

export interface RateLimitTracker {
  [key: string]: number[];
}

/**
 * Create a rate limiter
 */
export class RateLimiter {
  private tracker: RateLimitTracker = {};
  private limits: Map<string, RateLimit> = new Map();

  constructor() {}

  /**
   * Set rate limit for a key
   */
  setLimit(key: string, limit: number, windowMs: number): void {
    this.limits.set(key, { limit, window: windowMs });
  }

  /**
   * Check if request is allowed
   */
  isAllowed(key: string): boolean {
    const rateLimit = this.limits.get(key);
    if (!rateLimit) {
      return true; // No limit set
    }

    const now = Date.now();
    if (!this.tracker[key]) {
      this.tracker[key] = [];
    }

    // Remove old timestamps outside the window
    const cutoff = now - rateLimit.window;
    this.tracker[key] = this.tracker[key].filter((ts) => ts > cutoff);

    // Check if limit exceeded
    if (this.tracker[key].length >= rateLimit.limit) {
      return false;
    }

    // Record this request
    this.tracker[key].push(now);
    return true;
  }

  /**
   * Get remaining requests for key
   */
  getRemaining(key: string): number {
    const rateLimit = this.limits.get(key);
    if (!rateLimit) {
      return -1; // No limit
    }

    const now = Date.now();
    if (!this.tracker[key]) {
      return rateLimit.limit;
    }

    const cutoff = now - rateLimit.window;
    const recent = this.tracker[key].filter((ts) => ts > cutoff);

    return Math.max(0, rateLimit.limit - recent.length);
  }

  /**
   * Get reset time for key
   */
  getResetTime(key: string): number | null {
    const rateLimit = this.limits.get(key);
    if (!rateLimit || !this.tracker[key] || this.tracker[key].length === 0) {
      return null;
    }

    const oldest = this.tracker[key][0];
    const resetTime = oldest + rateLimit.window;
    return Math.max(0, resetTime - Date.now());
  }

  /**
   * Reset rate limiter for key
   */
  reset(key: string): void {
    delete this.tracker[key];
  }

  /**
   * Reset all
   */
  resetAll(): void {
    this.tracker = {};
  }

  /**
   * Get all active keys
   */
  getActiveKeys(): string[] {
    return Object.keys(this.tracker);
  }
}

/**
 * Token bucket rate limiter
 */
export class TokenBucket {
  private tokens: number;
  private readonly capacity: number;
  private readonly refillRate: number; // tokens per millisecond
  private lastRefill: number;

  constructor(capacity: number, refillMs: number) {
    this.capacity = capacity;
    this.tokens = capacity;
    this.refillRate = capacity / refillMs;
    this.lastRefill = Date.now();
  }

  /**
   * Try to consume tokens
   */
  tryConsume(count: number = 1): boolean {
    this.refill();

    if (this.tokens >= count) {
      this.tokens -= count;
      return true;
    }

    return false;
  }

  /**
   * Get available tokens
   */
  getAvailableTokens(): number {
    this.refill();
    return this.tokens;
  }

  /**
   * Refill tokens based on elapsed time
   */
  private refill(): void {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    const tokensToAdd = elapsed * this.refillRate;

    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }
}

/**
 * Sliding window rate limiter
 */
export class SlidingWindowLimiter {
  private windows: Map<string, number[]> = new Map();
  private readonly limit: number;
  private readonly windowMs: number;

  constructor(limit: number, windowMs: number) {
    this.limit = limit;
    this.windowMs = windowMs;
  }

  /**
   * Check if request is allowed
   */
  isAllowed(key: string): boolean {
    const now = Date.now();

    if (!this.windows.has(key)) {
      this.windows.set(key, []);
    }

    const window = this.windows.get(key)!;

    // Remove old timestamps
    const cutoff = now - this.windowMs;
    const filtered = window.filter((ts) => ts > cutoff);
    this.windows.set(key, filtered);

    // Check limit
    if (filtered.length >= this.limit) {
      return false;
    }

    // Add current request
    filtered.push(now);
    return true;
  }

  /**
   * Get remaining requests
   */
  getRemaining(key: string): number {
    const now = Date.now();
    const window = this.windows.get(key) || [];

    const cutoff = now - this.windowMs;
    const recent = window.filter((ts) => ts > cutoff);

    return Math.max(0, this.limit - recent.length);
  }

  /**
   * Reset window for key
   */
  reset(key: string): void {
    this.windows.delete(key);
  }

  /**
   * Reset all windows
   */
  resetAll(): void {
    this.windows.clear();
  }
}

/**
 * Create a rate limiter
 */
export function createRateLimiter(): RateLimiter {
  return new RateLimiter();
}

/**
 * Create a token bucket
 */
export function createTokenBucket(
  capacity: number,
  refillMs: number
): TokenBucket {
  return new TokenBucket(capacity, refillMs);
}

/**
 * Create a sliding window limiter
 */
export function createSlidingWindowLimiter(
  limit: number,
  windowMs: number
): SlidingWindowLimiter {
  return new SlidingWindowLimiter(limit, windowMs);
}
