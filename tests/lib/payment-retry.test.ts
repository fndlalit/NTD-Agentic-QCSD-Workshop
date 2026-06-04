import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  calculateBackoffDelay,
  isRetryableError,
  processPaymentWithRetry,
  validatePaymentRequest,
  type PaymentRequest,
  type PaymentResponse,
  type RetryConfig,
} from '@/src/lib/payment-retry'

describe('payment-retry.ts — payment gateway retry', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // ─── calculateBackoffDelay ─────────────────────────────────────

  describe('calculateBackoffDelay', () => {
    it('returns a delay based on exponential backoff', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0) // no jitter
      const config: RetryConfig = {
        maxRetries: 3,
        baseDelayMs: 1000,
        maxDelayMs: 10000,
        backoffMultiplier: 2,
      }

      // attempt 0: 1000 * 2^0 = 1000, jitter = 0
      expect(calculateBackoffDelay(0, config)).toBe(1000)
      // attempt 1: 1000 * 2^1 = 2000, jitter = 0
      expect(calculateBackoffDelay(1, config)).toBe(2000)
      // attempt 2: 1000 * 2^2 = 4000, jitter = 0
      expect(calculateBackoffDelay(2, config)).toBe(4000)

      vi.restoreAllMocks()
    })

    it('caps delay at maxDelayMs', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0)
      const config: RetryConfig = {
        maxRetries: 5,
        baseDelayMs: 1000,
        maxDelayMs: 5000,
        backoffMultiplier: 2,
      }

      // attempt 3: 1000 * 2^3 = 8000 -> capped at 5000
      expect(calculateBackoffDelay(3, config)).toBe(5000)

      vi.restoreAllMocks()
    })

    it('adds jitter to the delay', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5) // 50% jitter
      const config: RetryConfig = {
        maxRetries: 3,
        baseDelayMs: 1000,
        maxDelayMs: 10000,
        backoffMultiplier: 2,
      }

      // attempt 0: base = 1000, jitter = 0.5 * 1000 * 0.5 = 250
      expect(calculateBackoffDelay(0, config)).toBe(1250)

      vi.restoreAllMocks()
    })

    it('uses default config when none provided', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0)
      const delay = calculateBackoffDelay(0)
      expect(delay).toBe(1000) // default baseDelayMs
      vi.restoreAllMocks()
    })
  })

  // ─── isRetryableError ──────────────────────────────────────────

  describe('isRetryableError', () => {
    it('respects explicit retryable flag when true', () => {
      expect(isRetryableError({ success: false, retryable: true })).toBe(true)
    })

    it('respects explicit retryable flag when false', () => {
      expect(isRetryableError({ success: false, retryable: false })).toBe(false)
    })

    it('identifies gateway_timeout as retryable', () => {
      expect(isRetryableError({ success: false, error: 'gateway_timeout' })).toBe(true)
    })

    it('identifies network_error as retryable', () => {
      expect(isRetryableError({ success: false, error: 'network_error' })).toBe(true)
    })

    it('identifies rate_limited as retryable', () => {
      expect(isRetryableError({ success: false, error: 'rate_limited' })).toBe(true)
    })

    it('identifies service_unavailable as retryable', () => {
      expect(isRetryableError({ success: false, error: 'service_unavailable' })).toBe(true)
    })

    it('identifies internal_error as retryable', () => {
      expect(isRetryableError({ success: false, error: 'internal_error' })).toBe(true)
    })

    it('identifies card_declined as non-retryable', () => {
      expect(isRetryableError({ success: false, error: 'card_declined' })).toBe(false)
    })

    it('identifies insufficient_funds as non-retryable', () => {
      expect(isRetryableError({ success: false, error: 'insufficient_funds' })).toBe(false)
    })

    it('identifies invalid_card as non-retryable', () => {
      expect(isRetryableError({ success: false, error: 'invalid_card' })).toBe(false)
    })

    it('identifies expired_card as non-retryable', () => {
      expect(isRetryableError({ success: false, error: 'expired_card' })).toBe(false)
    })

    it('identifies fraud_detected as non-retryable', () => {
      expect(isRetryableError({ success: false, error: 'fraud_detected' })).toBe(false)
    })

    it('returns false for unknown errors not in either list', () => {
      expect(isRetryableError({ success: false, error: 'some_random_error' })).toBe(false)
    })

    it('returns false when no error is provided', () => {
      expect(isRetryableError({ success: false })).toBe(false)
    })
  })

  // ─── processPaymentWithRetry ───────────────────────────────────

  describe('processPaymentWithRetry', () => {
    const request: PaymentRequest = {
      orderId: 'ORD-001',
      amount: 99.99,
      currency: 'USD',
      cardToken: 'tok_test_123',
    }

    const fastConfig: RetryConfig = {
      maxRetries: 2,
      baseDelayMs: 10,
      maxDelayMs: 100,
      backoffMultiplier: 2,
    }

    it('succeeds on first attempt', async () => {
      const gateway = vi.fn<[PaymentRequest], Promise<PaymentResponse>>().mockResolvedValue({
        success: true,
        transactionId: 'txn_123',
      })

      const result = await processPaymentWithRetry(request, gateway, fastConfig)

      expect(result.success).toBe(true)
      expect(result.transactionId).toBe('txn_123')
      expect(result.attempts).toBe(1)
      expect(gateway).toHaveBeenCalledTimes(1)
    })

    it('retries on retryable errors and eventually succeeds', async () => {
      const gateway = vi.fn<[PaymentRequest], Promise<PaymentResponse>>()
        .mockResolvedValueOnce({ success: false, error: 'gateway_timeout' })
        .mockResolvedValueOnce({ success: true, transactionId: 'txn_456' })

      const promise = processPaymentWithRetry(request, gateway, fastConfig)

      // Advance timers for the backoff delays
      await vi.advanceTimersByTimeAsync(200)

      const result = await promise

      expect(result.success).toBe(true)
      expect(result.attempts).toBe(2)
      expect(gateway).toHaveBeenCalledTimes(2)
    })

    it('stops retrying on non-retryable error', async () => {
      const gateway = vi.fn<[PaymentRequest], Promise<PaymentResponse>>()
        .mockResolvedValue({ success: false, error: 'card_declined' })

      const result = await processPaymentWithRetry(request, gateway, fastConfig)

      expect(result.success).toBe(false)
      expect(result.error).toBe('card_declined')
      expect(result.attempts).toBe(1)
      expect(gateway).toHaveBeenCalledTimes(1)
    })

    it('exhausts all retries on persistent retryable errors', async () => {
      const gateway = vi.fn<[PaymentRequest], Promise<PaymentResponse>>()
        .mockResolvedValue({ success: false, error: 'gateway_timeout' })

      const promise = processPaymentWithRetry(request, gateway, fastConfig)
      await vi.advanceTimersByTimeAsync(1000)
      const result = await promise

      expect(result.success).toBe(false)
      expect(result.attempts).toBe(3) // 1 initial + 2 retries
      expect(gateway).toHaveBeenCalledTimes(3)
    })

    it('handles thrown exceptions as retryable', async () => {
      const gateway = vi.fn<[PaymentRequest], Promise<PaymentResponse>>()
        .mockRejectedValueOnce(new Error('network failure'))
        .mockResolvedValueOnce({ success: true, transactionId: 'txn_789' })

      const promise = processPaymentWithRetry(request, gateway, fastConfig)
      await vi.advanceTimersByTimeAsync(500)
      const result = await promise

      expect(result.success).toBe(true)
      expect(result.attempts).toBe(2)
    })

    it('handles all attempts throwing exceptions', async () => {
      const gateway = vi.fn<[PaymentRequest], Promise<PaymentResponse>>()
        .mockRejectedValue(new Error('persistent failure'))

      const promise = processPaymentWithRetry(request, gateway, fastConfig)
      await vi.advanceTimersByTimeAsync(1000)
      const result = await promise

      expect(result.success).toBe(false)
      expect(result.error).toBe('persistent failure')
      expect(result.attempts).toBe(3)
    })

    it('handles non-Error thrown values', async () => {
      const gateway = vi.fn<[PaymentRequest], Promise<PaymentResponse>>()
        .mockRejectedValueOnce('string error')
        .mockResolvedValueOnce({ success: true, transactionId: 'txn_000' })

      const promise = processPaymentWithRetry(request, gateway, fastConfig)
      await vi.advanceTimersByTimeAsync(500)
      const result = await promise

      expect(result.success).toBe(true)
    })
  })

  // ─── validatePaymentRequest ────────────────────────────────────

  describe('validatePaymentRequest', () => {
    const validRequest: PaymentRequest = {
      orderId: 'ORD-001',
      amount: 99.99,
      currency: 'USD',
      cardToken: 'tok_test_123',
    }

    it('returns null for a valid request', () => {
      expect(validatePaymentRequest(validRequest)).toBeNull()
    })

    it('rejects empty orderId', () => {
      expect(validatePaymentRequest({ ...validRequest, orderId: '' })).toBe(
        'Order ID is required'
      )
    })

    it('rejects whitespace-only orderId', () => {
      expect(validatePaymentRequest({ ...validRequest, orderId: '   ' })).toBe(
        'Order ID is required'
      )
    })

    it('rejects zero amount', () => {
      expect(validatePaymentRequest({ ...validRequest, amount: 0 })).toBe(
        'Payment amount must be positive'
      )
    })

    it('rejects negative amount', () => {
      expect(validatePaymentRequest({ ...validRequest, amount: -10 })).toBe(
        'Payment amount must be positive'
      )
    })

    it('rejects empty currency', () => {
      expect(validatePaymentRequest({ ...validRequest, currency: '' })).toBe(
        'Valid 3-letter currency code is required'
      )
    })

    it('rejects 2-letter currency code', () => {
      expect(validatePaymentRequest({ ...validRequest, currency: 'US' })).toBe(
        'Valid 3-letter currency code is required'
      )
    })

    it('rejects 4-letter currency code', () => {
      expect(validatePaymentRequest({ ...validRequest, currency: 'USDD' })).toBe(
        'Valid 3-letter currency code is required'
      )
    })

    it('rejects empty cardToken', () => {
      expect(validatePaymentRequest({ ...validRequest, cardToken: '' })).toBe(
        'Card token is required'
      )
    })

    it('rejects whitespace-only cardToken', () => {
      expect(validatePaymentRequest({ ...validRequest, cardToken: '   ' })).toBe(
        'Card token is required'
      )
    })
  })
})
