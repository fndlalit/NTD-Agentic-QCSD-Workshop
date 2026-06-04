// Kafka event publishing for order events
// Publishes domain events to Kafka topics for downstream consumers

export interface KafkaEvent {
  topic: string
  key: string
  value: Record<string, unknown>
  headers?: Record<string, string>
  timestamp?: number
}

export interface KafkaProducerConfig {
  brokers: string[]
  clientId: string
  retries: number
  acks: 'all' | 'leader' | 'none'
  batchSize: number
  lingerMs: number
}

export interface PublishResult {
  success: boolean
  partition?: number
  offset?: string
  error?: string
  timestamp: number
}

const DEFAULT_CONFIG: KafkaProducerConfig = {
  brokers: ['localhost:9092'],
  clientId: 'ecommerce-app',
  retries: 3,
  acks: 'all',
  batchSize: 100,
  lingerMs: 5,
}

/**
 * Validates a Kafka event before publishing
 */
export const validateEvent = (event: KafkaEvent): string | null => {
  if (!event.topic || event.topic.trim().length === 0) {
    return 'Topic is required'
  }

  // Topic naming: lowercase, alphanumeric, dots, dashes, underscores
  if (!/^[a-z0-9][a-z0-9._-]*$/.test(event.topic)) {
    return 'Topic name must start with alphanumeric and contain only lowercase letters, numbers, dots, dashes, or underscores'
  }

  if (event.topic.length > 249) {
    return 'Topic name exceeds maximum length of 249 characters'
  }

  if (!event.key || event.key.trim().length === 0) {
    return 'Event key is required'
  }

  if (!event.value || typeof event.value !== 'object') {
    return 'Event value must be a non-null object'
  }

  return null
}

/**
 * Serializes a Kafka event to JSON bytes
 */
export const serializeEvent = (event: KafkaEvent): string => {
  return JSON.stringify({
    key: event.key,
    value: event.value,
    headers: event.headers || {},
    timestamp: event.timestamp || Date.now(),
  })
}

/**
 * Deserializes a Kafka message from JSON
 */
export const deserializeEvent = (data: string): KafkaEvent | null => {
  try {
    const parsed = JSON.parse(data)
    if (!parsed.key || !parsed.value) return null
    return {
      topic: parsed.topic || '',
      key: parsed.key,
      value: parsed.value,
      headers: parsed.headers,
      timestamp: parsed.timestamp,
    }
  } catch {
    return null
  }
}

/**
 * Creates the standard event envelope for order events
 */
export const createOrderEvent = (
  eventType: string,
  orderId: string,
  data: Record<string, unknown>
): KafkaEvent => {
  return {
    topic: `orders.${eventType}`,
    key: orderId,
    value: {
      eventType,
      orderId,
      data,
      version: 1,
      producedAt: new Date().toISOString(),
    },
    headers: {
      'event-type': eventType,
      'content-type': 'application/json',
      'correlation-id': `corr-${orderId}-${Date.now()}`,
    },
  }
}

/**
 * Batches events for efficient publishing
 */
export const batchEvents = (
  events: KafkaEvent[],
  maxBatchSize: number = DEFAULT_CONFIG.batchSize
): KafkaEvent[][] => {
  const batches: KafkaEvent[][] = []

  for (let i = 0; i < events.length; i += maxBatchSize) {
    batches.push(events.slice(i, i + maxBatchSize))
  }

  return batches
}

/**
 * Publishes an event using the provided send function
 * This abstraction allows testing without a real Kafka connection
 */
export const publishEvent = async (
  event: KafkaEvent,
  sendFn: (serialized: string, topic: string) => Promise<PublishResult>
): Promise<PublishResult> => {
  const validationError = validateEvent(event)
  if (validationError) {
    return {
      success: false,
      error: validationError,
      timestamp: Date.now(),
    }
  }

  const serialized = serializeEvent(event)

  try {
    return await sendFn(serialized, event.topic)
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown publish error',
      timestamp: Date.now(),
    }
  }
}

/**
 * Publishes multiple events with batch support
 */
export const publishBatch = async (
  events: KafkaEvent[],
  sendFn: (serialized: string, topic: string) => Promise<PublishResult>,
  config: Partial<KafkaProducerConfig> = {}
): Promise<PublishResult[]> => {
  const batchSize = config.batchSize || DEFAULT_CONFIG.batchSize
  const batches = batchEvents(events, batchSize)
  const results: PublishResult[] = []

  for (const batch of batches) {
    const batchResults = await Promise.allSettled(
      batch.map(event => publishEvent(event, sendFn))
    )

    for (const result of batchResults) {
      if (result.status === 'fulfilled') {
        results.push(result.value)
      } else {
        results.push({
          success: false,
          error: result.reason?.message || 'Batch publish failed',
          timestamp: Date.now(),
        })
      }
    }
  }

  return results
}
