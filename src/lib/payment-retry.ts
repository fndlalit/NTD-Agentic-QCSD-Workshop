// Payment gateway retry logic with exponential backoff
// Handles transient failures when processing payments

export interface PaymentRequest {
  orderId: string
  amount: number
  currency: string
  cardToken: string
}

export interface PaymentResponse {
  success: boolean
  transactionId?: string
  error?: string
  retryable?: boolean
}

export interface RetryConfig {
  maxRetries: number
  baseDelayMs: number
  maxDelayMs: number
  backoffMultiplier: number
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
}

/**
 * Calculates the delay for a given retry attempt using exponential backoff with jitter
 */
export const calculateBackoffDelay = (
  attempt: number,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): number => {
  const exponentialDelay = config.baseDelayMs * Math.pow(config.backoffMultiplier, attempt)
  const cappedDelay = Math.min(exponentialDelay, config.maxDelayMs)
  // Add jitter: random value between 0 and 50% of the delay
  const jitter = Math.random() * cappedDelay * 0.5
  return Math.floor(cappedDelay + jitter)
}

/**
 * Determines if a payment error is retryable
 */
export const isRetryableError = (response: PaymentResponse): boolean => {
  if (response.retryable !== undefined) return response.retryable

  // Known non-retryable errors
  const nonRetryable = [
    'card_declined',
    'insufficient_funds',
    'invalid_card',
    'expired_card',
    'fraud_detected',
  ]

  if (response.error && nonRetryable.includes(response.error)) {
    return false
  }

  // Network/server errors are retryable
  const retryable = [
    'gateway_timeout',
    'network_error',
    'rate_limited',
    'service_unavailable',
    'internal_error',
  ]

  return response.error ? retryable.includes(response.error) : false
}

/**
 * Processes a payment with retry logic
 * @param request - The payment request
 * @param gateway - The payment processing function
 * @param config - Retry configuration
 * @returns The final payment response
 */
export const processPaymentWithRetry = async (
  request: PaymentRequest,
  gateway: (req: PaymentRequest) => Promise<PaymentResponse>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<PaymentResponse & { attempts: number }> => {
  let lastResponse: PaymentResponse | null = null

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      const response = await gateway(request)
      lastResponse = response

      if (response.success) {
        return { ...response, attempts: attempt + 1 }
      }

      if (!isRetryableError(response)) {
        return { ...response, attempts: attempt + 1 }
      }

      // Don't delay after the last attempt
      if (attempt < config.maxRetries) {
        const delay = calculateBackoffDelay(attempt, config)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    } catch (error) {
      lastResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'unknown_error',
        retryable: true,
      }

      if (attempt < config.maxRetries) {
        const delay = calculateBackoffDelay(attempt, config)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  return {
    ...(lastResponse || { success: false, error: 'max_retries_exceeded' }),
    attempts: config.maxRetries + 1,
  }
}

/**
 * Validates a payment request before processing
 */
export const validatePaymentRequest = (request: PaymentRequest): string | null => {
  if (!request.orderId || request.orderId.trim().length === 0) {
    return 'Order ID is required'
  }
  if (!request.amount || request.amount <= 0) {
    return 'Payment amount must be positive'
  }
  if (!request.currency || request.currency.length !== 3) {
    return 'Valid 3-letter currency code is required'
  }
  if (!request.cardToken || request.cardToken.trim().length === 0) {
    return 'Card token is required'
  }
  return null
}
