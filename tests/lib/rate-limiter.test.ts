import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  createTokenBucket,
  createSlidingWindow,
  createRateLimiter,
  formatRateLimitHeaders,
  validateRateLimitConfig,
  type RateLimitConfig,
  type RateLimitResult,
} from '@/src/lib/rate-limiter'

describe('rate-limiter.ts — rate limiting', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-01-01T00:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // ─── Token Bucket ──────────────────────────────────────────────

  describe('createTokenBucket', () => {
    const config: RateLimitConfig = {
      maxRequests: 5,
      windowMs: 10000,
      strategy: 'token-bucket',
    }

    it('allows requests up to maxRequests', () => {
      const limiter = createTokenBucket(config)
      for (let i = 0; i < 5; i++) {
        const result = limiter.consume()
        expect(result.allowed).toBe(true)
      }
    })

    it('blocks requests after tokens are exhausted', () => {
      const limiter = createTokenBucket(config)
      for (let i = 0; i < 5; i++) {
        limiter.consume()
      }
      const result = limiter.consume()
      expect(result.allowed).toBe(false)
      expect(result.remaining).toBe(0)
    })

    it('returns remaining count accurately', () => {
      const limiter = createTokenBucket(config)
      limiter.consume()
      limiter.consume()
      const result = limiter.consume()
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(2)
    })

    it('refills tokens over time', () => {
      const limiter = createTokenBucket(config)

      // Exhaust all tokens
      for (let i = 0; i < 5; i++) {
        limiter.consume()
      }

      // Advance time to allow some refill
      // Rate: 5 tokens / 10000ms = 0.5 tokens/ms -> 1 token = 2000ms
      vi.advanceTimersByTime(2000)

      const result = limiter.consume()
      expect(result.allowed).toBe(true)
    })

    it('does not exceed maxRequests after long idle', () => {
      const limiter = createTokenBucket(config)

      // Exhaust tokens
      for (let i = 0; i < 5; i++) {
        limiter.consume()
      }

      // Wait a very long time
      vi.advanceTimersByTime(100000)

      const state = limiter.getState()
      // After refill, tokens should be capped at maxRequests
      // Need to trigger refill via consume
      limiter.consume()
      const stateAfter = limiter.getState()
      expect(stateAfter.tokens).toBeLessThanOrEqual(config.maxRequests)
    })

    it('provides retryAfterMs when blocked', () => {
      const limiter = createTokenBucket(config)

      for (let i = 0; i < 5; i++) {
        limiter.consume()
      }

      const result = limiter.consume()
      expect(result.allowed).toBe(false)
      expect(result.retryAfterMs).toBeDefined()
      expect(result.retryAfterMs!).toBeGreaterThan(0)
    })

    it('reset restores all tokens', () => {
      const limiter = createTokenBucket(config)

      for (let i = 0; i < 5; i++) {
        limiter.consume()
      }

      limiter.reset()
      const result = limiter.consume()
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(4)
    })

    it('getState returns current token count', () => {
      const limiter = createTokenBucket(config)
      const state = limiter.getState()
      expect(state.tokens).toBe(5)
      expect(state.lastRefill).toBeDefined()
    })
  })

  // ─── Sliding Window ────────────────────────────────────────────

  describe('createSlidingWindow', () => {
    const config: RateLimitConfig = {
      maxRequests: 3,
      windowMs: 5000,
      strategy: 'sliding-window',
    }

    it('allows requests up to maxRequests', () => {
      const limiter = createSlidingWindow(config)
      for (let i = 0; i < 3; i++) {
        const result = limiter.consume()
        expect(result.allowed).toBe(true)
      }
    })

    it('blocks requests after maxRequests in window', () => {
      const limiter = createSlidingWindow(config)
      for (let i = 0; i < 3; i++) {
        limiter.consume()
      }
      const result = limiter.consume()
      expect(result.allowed).toBe(false)
      expect(result.remaining).toBe(0)
    })

    it('returns correct remaining count', () => {
      const limiter = createSlidingWindow(config)
      limiter.consume()
      const result = limiter.consume()
      expect(result.remaining).toBe(1)
    })

    it('allows requests after oldest request leaves window', () => {
      const limiter = createSlidingWindow(config)

      // Make 3 requests at time 0
      for (let i = 0; i < 3; i++) {
        limiter.consume()
      }

      // 4th request blocked
      expect(limiter.consume().allowed).toBe(false)

      // Advance past window
      vi.advanceTimersByTime(5001)

      // Now allowed again
      const result = limiter.consume()
      expect(result.allowed).toBe(true)
    })

    it('sliding behavior: staggered requests slide out individually', () => {
      const limiter = createSlidingWindow(config)

      // Request at t=0
      limiter.consume()

      // Request at t=2000
      vi.advanceTimersByTime(2000)
      limiter.consume()

      // Request at t=4000
      vi.advanceTimersByTime(2000)
      limiter.consume()

      // Blocked at t=4000 (3 requests within 5s window)
      expect(limiter.consume().allowed).toBe(false)

      // At t=5001, first request (t=0) slides out
      vi.advanceTimersByTime(1001)
      expect(limiter.consume().allowed).toBe(true)
    })

    it('provides retryAfterMs when blocked', () => {
      const limiter = createSlidingWindow(config)
      for (let i = 0; i < 3; i++) {
        limiter.consume()
      }
      const result = limiter.consume()
      expect(result.retryAfterMs).toBeDefined()
      expect(result.retryAfterMs!).toBeGreaterThanOrEqual(0)
    })

    it('reset clears all timestamps', () => {
      const limiter = createSlidingWindow(config)
      for (let i = 0; i < 3; i++) {
        limiter.consume()
      }
      limiter.reset()
      const result = limiter.consume()
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(2)
    })

    it('getState returns current count', () => {
      const limiter = createSlidingWindow(config)
      limiter.consume()
      limiter.consume()
      const state = limiter.getState()
      expect(state.count).toBe(2)
    })
  })

  // ─── createRateLimiter factory ─────────────────────────────────

  describe('createRateLimiter', () => {
    it('creates a token bucket when strategy is token-bucket', () => {
      const limiter = createRateLimiter({
        maxRequests: 10,
        windowMs: 60000,
        strategy: 'token-bucket',
      })
      // Token bucket has getState with .tokens
      const state = limiter.getState()
      expect('tokens' in state).toBe(true)
    })

    it('creates a sliding window when strategy is sliding-window', () => {
      const limiter = createRateLimiter({
        maxRequests: 10,
        windowMs: 60000,
        strategy: 'sliding-window',
      })
      const state = limiter.getState()
      expect('count' in state).toBe(true)
    })
  })

  // ─── formatRateLimitHeaders ────────────────────────────────────

  describe('formatRateLimitHeaders', () => {
    it('includes remaining and reset headers for allowed requests', () => {
      const result: RateLimitResult = {
        allowed: true,
        remaining: 5,
        resetAt: Date.now() + 10000,
      }

      const headers = formatRateLimitHeaders(result)
      expect(headers['X-RateLimit-Remaining']).toBe('5')
      expect(headers['X-RateLimit-Reset']).toBeDefined()
      expect(headers['Retry-After']).toBeUndefined()
    })

    it('includes Retry-After header when blocked', () => {
      const result: RateLimitResult = {
        allowed: false,
        remaining: 0,
        resetAt: Date.now() + 10000,
        retryAfterMs: 5000,
      }

      const headers = formatRateLimitHeaders(result)
      expect(headers['Retry-After']).toBe('5')
    })

    it('does not include Retry-After when allowed', () => {
      const result: RateLimitResult = {
        allowed: true,
        remaining: 3,
        resetAt: Date.now() + 10000,
      }

      const headers = formatRateLimitHeaders(result)
      expect(headers).not.toHaveProperty('Retry-After')
    })

    it('rounds Retry-After up to nearest second', () => {
      const result: RateLimitResult = {
        allowed: false,
        remaining: 0,
        resetAt: Date.now() + 10000,
        retryAfterMs: 1500,
      }

      const headers = formatRateLimitHeaders(result)
      expect(headers['Retry-After']).toBe('2')
    })

    it('formats resetAt as UTC date string', () => {
      const resetTime = new Date('2025-01-01T00:00:10Z').getTime()
      const result: RateLimitResult = {
        allowed: true,
        remaining: 1,
        resetAt: resetTime,
      }

      const headers = formatRateLimitHeaders(result)
      expect(headers['X-RateLimit-Reset']).toBe(new Date(resetTime).toUTCString())
    })
  })

  // ─── validateRateLimitConfig ───────────────────────────────────

  describe('validateRateLimitConfig', () => {
    it('returns null for valid config', () => {
      expect(
        validateRateLimitConfig({
          maxRequests: 100,
          windowMs: 60000,
          strategy: 'token-bucket',
        })
      ).toBeNull()
    })

    it('returns null for sliding-window strategy', () => {
      expect(
        validateRateLimitConfig({
          maxRequests: 10,
          windowMs: 1000,
          strategy: 'sliding-window',
        })
      ).toBeNull()
    })

    it('rejects zero maxRequests', () => {
      expect(
        validateRateLimitConfig({
          maxRequests: 0,
          windowMs: 60000,
          strategy: 'token-bucket',
        })
      ).toBe('maxRequests must be a positive number')
    })

    it('rejects negative maxRequests', () => {
      expect(
        validateRateLimitConfig({
          maxRequests: -5,
          windowMs: 60000,
          strategy: 'token-bucket',
        })
      ).toBe('maxRequests must be a positive number')
    })

    it('rejects zero windowMs', () => {
      expect(
        validateRateLimitConfig({
          maxRequests: 10,
          windowMs: 0,
          strategy: 'token-bucket',
        })
      ).toBe('windowMs must be a positive number')
    })

    it('rejects negative windowMs', () => {
      expect(
        validateRateLimitConfig({
          maxRequests: 10,
          windowMs: -1000,
          strategy: 'token-bucket',
        })
      ).toBe('windowMs must be a positive number')
    })

    it('rejects invalid strategy', () => {
      expect(
        validateRateLimitConfig({
          maxRequests: 10,
          windowMs: 60000,
          strategy: 'fixed-window' as RateLimitConfig['strategy'],
        })
      ).toBe('strategy must be "token-bucket" or "sliding-window"')
    })
  })
})
