// Rate limiter for API endpoints
// Implements token bucket and sliding window algorithms

export interface RateLimitConfig {
  maxRequests: number
  windowMs: number
  strategy: 'token-bucket' | 'sliding-window'
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
  retryAfterMs?: number
}

interface TokenBucketState {
  tokens: number
  lastRefill: number
}

interface SlidingWindowState {
  timestamps: number[]
}

/**
 * Creates a token bucket rate limiter
 */
export const createTokenBucket = (config: RateLimitConfig) => {
  const state: TokenBucketState = {
    tokens: config.maxRequests,
    lastRefill: Date.now(),
  }

  const refill = (now: number): void => {
    const elapsed = now - state.lastRefill
    const refillRate = config.maxRequests / config.windowMs
    const newTokens = elapsed * refillRate
    state.tokens = Math.min(config.maxRequests, state.tokens + newTokens)
    state.lastRefill = now
  }

  const consume = (): RateLimitResult => {
    const now = Date.now()
    refill(now)

    if (state.tokens >= 1) {
      state.tokens -= 1
      return {
        allowed: true,
        remaining: Math.floor(state.tokens),
        resetAt: now + config.windowMs,
      }
    }

    const timeToNextToken = (1 - state.tokens) / (config.maxRequests / config.windowMs)
    return {
      allowed: false,
      remaining: 0,
      resetAt: now + config.windowMs,
      retryAfterMs: Math.ceil(timeToNextToken),
    }
  }

  const reset = (): void => {
    state.tokens = config.maxRequests
    state.lastRefill = Date.now()
  }

  const getState = (): { tokens: number; lastRefill: number } => ({
    tokens: state.tokens,
    lastRefill: state.lastRefill,
  })

  return { consume, reset, getState }
}

/**
 * Creates a sliding window rate limiter
 */
export const createSlidingWindow = (config: RateLimitConfig) => {
  const state: SlidingWindowState = {
    timestamps: [],
  }

  const cleanup = (now: number): void => {
    const windowStart = now - config.windowMs
    state.timestamps = state.timestamps.filter(ts => ts > windowStart)
  }

  const consume = (): RateLimitResult => {
    const now = Date.now()
    cleanup(now)

    if (state.timestamps.length < config.maxRequests) {
      state.timestamps.push(now)
      return {
        allowed: true,
        remaining: config.maxRequests - state.timestamps.length,
        resetAt: now + config.windowMs,
      }
    }

    const oldestInWindow = state.timestamps[0]
    const retryAfterMs = oldestInWindow + config.windowMs - now

    return {
      allowed: false,
      remaining: 0,
      resetAt: oldestInWindow + config.windowMs,
      retryAfterMs: Math.max(0, retryAfterMs),
    }
  }

  const reset = (): void => {
    state.timestamps = []
  }

  const getState = (): { count: number; windowStart: number } => ({
    count: state.timestamps.length,
    windowStart: state.timestamps.length > 0 ? state.timestamps[0] : Date.now(),
  })

  return { consume, reset, getState }
}

/**
 * Creates a rate limiter based on the configured strategy
 */
export const createRateLimiter = (config: RateLimitConfig) => {
  if (config.strategy === 'token-bucket') {
    return createTokenBucket(config)
  }
  return createSlidingWindow(config)
}

/**
 * Rate limit middleware result formatter for HTTP responses
 */
export const formatRateLimitHeaders = (result: RateLimitResult): Record<string, string> => {
  const headers: Record<string, string> = {
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.resetAt).toUTCString(),
  }

  if (!result.allowed && result.retryAfterMs) {
    headers['Retry-After'] = Math.ceil(result.retryAfterMs / 1000).toString()
  }

  return headers
}

/**
 * Validates rate limit configuration
 */
export const validateRateLimitConfig = (config: RateLimitConfig): string | null => {
  if (config.maxRequests <= 0) {
    return 'maxRequests must be a positive number'
  }

  if (config.windowMs <= 0) {
    return 'windowMs must be a positive number'
  }

  if (!['token-bucket', 'sliding-window'].includes(config.strategy)) {
    return 'strategy must be "token-bucket" or "sliding-window"'
  }

  return null
}
