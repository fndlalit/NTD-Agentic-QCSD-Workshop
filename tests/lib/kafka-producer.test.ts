import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  validateEvent,
  serializeEvent,
  deserializeEvent,
  createOrderEvent,
  batchEvents,
  publishEvent,
  publishBatch,
  type KafkaEvent,
  type PublishResult,
} from '@/src/lib/kafka-producer'

describe('kafka-producer.ts — Kafka event publishing', () => {
  // ─── validateEvent ─────────────────────────────────────────────

  describe('validateEvent', () => {
    const validEvent: KafkaEvent = {
      topic: 'orders.created',
      key: 'ORD-001',
      value: { orderId: 'ORD-001', total: 99.99 },
    }

    it('returns null for a valid event', () => {
      expect(validateEvent(validEvent)).toBeNull()
    })

    it('rejects empty topic', () => {
      expect(validateEvent({ ...validEvent, topic: '' })).toBe('Topic is required')
    })

    it('rejects whitespace-only topic', () => {
      expect(validateEvent({ ...validEvent, topic: '   ' })).toBe('Topic is required')
    })

    it('rejects topic starting with non-alphanumeric', () => {
      expect(validateEvent({ ...validEvent, topic: '-orders' })).toBe(
        'Topic name must start with alphanumeric and contain only lowercase letters, numbers, dots, dashes, or underscores'
      )
    })

    it('rejects topic with uppercase letters', () => {
      expect(validateEvent({ ...validEvent, topic: 'Orders.Created' })).toBe(
        'Topic name must start with alphanumeric and contain only lowercase letters, numbers, dots, dashes, or underscores'
      )
    })

    it('rejects topic with spaces', () => {
      expect(validateEvent({ ...validEvent, topic: 'orders created' })).toBe(
        'Topic name must start with alphanumeric and contain only lowercase letters, numbers, dots, dashes, or underscores'
      )
    })

    it('accepts topic with dots, dashes, and underscores', () => {
      expect(validateEvent({ ...validEvent, topic: 'orders.created-v2_test' })).toBeNull()
    })

    it('rejects topic exceeding 249 characters', () => {
      const longTopic = 'a'.repeat(250)
      expect(validateEvent({ ...validEvent, topic: longTopic })).toBe(
        'Topic name exceeds maximum length of 249 characters'
      )
    })

    it('accepts topic of exactly 249 characters', () => {
      const topic = 'a'.repeat(249)
      expect(validateEvent({ ...validEvent, topic })).toBeNull()
    })

    it('rejects empty key', () => {
      expect(validateEvent({ ...validEvent, key: '' })).toBe('Event key is required')
    })

    it('rejects whitespace-only key', () => {
      expect(validateEvent({ ...validEvent, key: '   ' })).toBe('Event key is required')
    })

    it('rejects null value', () => {
      expect(
        validateEvent({ ...validEvent, value: null as unknown as Record<string, unknown> })
      ).toBe('Event value must be a non-null object')
    })

    it('rejects non-object value', () => {
      expect(
        validateEvent({ ...validEvent, value: 'string' as unknown as Record<string, unknown> })
      ).toBe('Event value must be a non-null object')
    })
  })

  // ─── serializeEvent ────────────────────────────────────────────

  describe('serializeEvent', () => {
    it('serializes event to JSON string', () => {
      const event: KafkaEvent = {
        topic: 'orders.created',
        key: 'ORD-001',
        value: { total: 99.99 },
        headers: { 'content-type': 'application/json' },
        timestamp: 1000000,
      }

      const serialized = serializeEvent(event)
      const parsed = JSON.parse(serialized)

      expect(parsed.key).toBe('ORD-001')
      expect(parsed.value).toEqual({ total: 99.99 })
      expect(parsed.headers).toEqual({ 'content-type': 'application/json' })
      expect(parsed.timestamp).toBe(1000000)
    })

    it('uses empty headers when none provided', () => {
      const event: KafkaEvent = {
        topic: 'test',
        key: 'k1',
        value: { data: true },
      }

      const parsed = JSON.parse(serializeEvent(event))
      expect(parsed.headers).toEqual({})
    })

    it('uses current timestamp when none provided', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2025-01-01T00:00:00Z'))

      const event: KafkaEvent = {
        topic: 'test',
        key: 'k1',
        value: { data: true },
      }

      const parsed = JSON.parse(serializeEvent(event))
      expect(parsed.timestamp).toBe(Date.now())

      vi.useRealTimers()
    })
  })

  // ─── deserializeEvent ──────────────────────────────────────────

  describe('deserializeEvent', () => {
    it('deserializes valid JSON', () => {
      const data = JSON.stringify({
        topic: 'orders.created',
        key: 'ORD-001',
        value: { total: 99.99 },
        headers: {},
        timestamp: 1000,
      })

      const event = deserializeEvent(data)
      expect(event).not.toBeNull()
      expect(event!.key).toBe('ORD-001')
      expect(event!.value).toEqual({ total: 99.99 })
    })

    it('returns null for invalid JSON', () => {
      expect(deserializeEvent('not json{')).toBeNull()
    })

    it('returns null when key is missing', () => {
      expect(deserializeEvent(JSON.stringify({ value: {} }))).toBeNull()
    })

    it('returns null when value is missing', () => {
      expect(deserializeEvent(JSON.stringify({ key: 'k1' }))).toBeNull()
    })

    it('uses empty string for topic when missing', () => {
      const data = JSON.stringify({ key: 'k1', value: { x: 1 } })
      const event = deserializeEvent(data)
      expect(event!.topic).toBe('')
    })
  })

  // ─── createOrderEvent ──────────────────────────────────────────

  describe('createOrderEvent', () => {
    it('creates an event with correct topic', () => {
      const event = createOrderEvent('created', 'ORD-001', { total: 99.99 })
      expect(event.topic).toBe('orders.created')
    })

    it('uses orderId as event key', () => {
      const event = createOrderEvent('shipped', 'ORD-002', {})
      expect(event.key).toBe('ORD-002')
    })

    it('includes event metadata in value', () => {
      const event = createOrderEvent('cancelled', 'ORD-003', { reason: 'customer request' })
      expect(event.value.eventType).toBe('cancelled')
      expect(event.value.orderId).toBe('ORD-003')
      expect(event.value.data).toEqual({ reason: 'customer request' })
      expect(event.value.version).toBe(1)
      expect(event.value.producedAt).toBeDefined()
    })

    it('sets appropriate headers', () => {
      const event = createOrderEvent('refunded', 'ORD-004', {})
      expect(event.headers!['event-type']).toBe('refunded')
      expect(event.headers!['content-type']).toBe('application/json')
      expect(event.headers!['correlation-id']).toContain('corr-ORD-004-')
    })
  })

  // ─── batchEvents ───────────────────────────────────────────────

  describe('batchEvents', () => {
    const makeEvents = (n: number): KafkaEvent[] =>
      Array.from({ length: n }, (_, i) => ({
        topic: 'test',
        key: `k${i}`,
        value: { i },
      }))

    it('returns a single batch when events fit', () => {
      const events = makeEvents(5)
      const batches = batchEvents(events, 10)
      expect(batches).toHaveLength(1)
      expect(batches[0]).toHaveLength(5)
    })

    it('splits events into correct batch sizes', () => {
      const events = makeEvents(10)
      const batches = batchEvents(events, 3)
      expect(batches).toHaveLength(4) // 3, 3, 3, 1
      expect(batches[0]).toHaveLength(3)
      expect(batches[3]).toHaveLength(1)
    })

    it('handles empty array', () => {
      const batches = batchEvents([], 10)
      expect(batches).toHaveLength(0)
    })

    it('handles batch size of 1', () => {
      const events = makeEvents(3)
      const batches = batchEvents(events, 1)
      expect(batches).toHaveLength(3)
      expect(batches[0]).toHaveLength(1)
    })

    it('uses default batch size from config', () => {
      const events = makeEvents(150)
      const batches = batchEvents(events) // default = 100
      expect(batches).toHaveLength(2)
      expect(batches[0]).toHaveLength(100)
      expect(batches[1]).toHaveLength(50)
    })
  })

  // ─── publishEvent ──────────────────────────────────────────────

  describe('publishEvent', () => {
    const validEvent: KafkaEvent = {
      topic: 'orders.created',
      key: 'ORD-001',
      value: { total: 99.99 },
    }

    it('publishes successfully', async () => {
      const sendFn = vi.fn().mockResolvedValue({
        success: true,
        partition: 0,
        offset: '42',
        timestamp: Date.now(),
      })

      const result = await publishEvent(validEvent, sendFn)
      expect(result.success).toBe(true)
      expect(result.partition).toBe(0)
      expect(sendFn).toHaveBeenCalledTimes(1)
    })

    it('returns validation error without calling sendFn', async () => {
      const sendFn = vi.fn()
      const result = await publishEvent({ ...validEvent, topic: '' }, sendFn)
      expect(result.success).toBe(false)
      expect(result.error).toBe('Topic is required')
      expect(sendFn).not.toHaveBeenCalled()
    })

    it('handles sendFn throwing an Error', async () => {
      const sendFn = vi.fn().mockRejectedValue(new Error('Connection refused'))
      const result = await publishEvent(validEvent, sendFn)
      expect(result.success).toBe(false)
      expect(result.error).toBe('Connection refused')
    })

    it('handles sendFn throwing a non-Error', async () => {
      const sendFn = vi.fn().mockRejectedValue('string error')
      const result = await publishEvent(validEvent, sendFn)
      expect(result.success).toBe(false)
      expect(result.error).toBe('Unknown publish error')
    })
  })

  // ─── publishBatch ──────────────────────────────────────────────

  describe('publishBatch', () => {
    const makeEvents = (n: number): KafkaEvent[] =>
      Array.from({ length: n }, (_, i) => ({
        topic: 'orders.created',
        key: `ORD-${i}`,
        value: { index: i },
      }))

    it('publishes all events and returns results', async () => {
      const sendFn = vi.fn().mockResolvedValue({
        success: true,
        partition: 0,
        offset: '1',
        timestamp: Date.now(),
      })

      const results = await publishBatch(makeEvents(3), sendFn, { batchSize: 10 })
      expect(results).toHaveLength(3)
      expect(results.every(r => r.success)).toBe(true)
    })

    it('handles mixed success and failure', async () => {
      let callCount = 0
      const sendFn = vi.fn().mockImplementation(() => {
        callCount++
        if (callCount === 2) return Promise.reject(new Error('fail'))
        return Promise.resolve({
          success: true,
          partition: 0,
          offset: String(callCount),
          timestamp: Date.now(),
        })
      })

      const results = await publishBatch(makeEvents(3), sendFn, { batchSize: 10 })
      expect(results).toHaveLength(3)

      const successes = results.filter(r => r.success)
      const failures = results.filter(r => !r.success)
      expect(successes).toHaveLength(2)
      expect(failures).toHaveLength(1)
    })

    it('processes events in batches', async () => {
      const callOrder: number[] = []
      const sendFn = vi.fn().mockImplementation((_s: string, _t: string) => {
        callOrder.push(callOrder.length)
        return Promise.resolve({ success: true, timestamp: Date.now() })
      })

      await publishBatch(makeEvents(5), sendFn, { batchSize: 2 })
      expect(sendFn).toHaveBeenCalledTimes(5)
    })

    it('handles empty event array', async () => {
      const sendFn = vi.fn()
      const results = await publishBatch([], sendFn)
      expect(results).toHaveLength(0)
      expect(sendFn).not.toHaveBeenCalled()
    })
  })
})
