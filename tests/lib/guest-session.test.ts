import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  generateSessionId,
  createGuestSession,
  getGuestSession,
  saveGuestSession,
  addToGuestCart,
  removeFromGuestCart,
  updateGuestCartQuantity,
  getGuestCartTotal,
  clearGuestSession,
  setCheckoutStep,
  isSessionValid,
  type GuestSession,
} from '@/src/lib/guest-session'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value }),
    removeItem: vi.fn((key: string) => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
    get length() { return Object.keys(store).length },
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
  }
})()

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock })

describe('guest-session.ts — guest session management', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-06-15T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // ─── generateSessionId ────────────────────────────────────────

  describe('generateSessionId', () => {
    it('returns a string starting with gs_', () => {
      const id = generateSessionId()
      expect(id).toMatch(/^gs_/)
    })

    it('generates unique IDs', () => {
      const ids = new Set(Array.from({ length: 100 }, () => generateSessionId()))
      expect(ids.size).toBe(100)
    })

    it('has a reasonable length', () => {
      const id = generateSessionId()
      expect(id.length).toBeGreaterThan(10)
      expect(id.length).toBeLessThan(50)
    })
  })

  // ─── createGuestSession ───────────────────────────────────────

  describe('createGuestSession', () => {
    it('creates a session with correct structure', () => {
      const session = createGuestSession()
      expect(session).toHaveProperty('id')
      expect(session).toHaveProperty('createdAt')
      expect(session).toHaveProperty('expiresAt')
      expect(session).toHaveProperty('cartItems')
      expect(session).toHaveProperty('checkoutStep')
    })

    it('initializes with empty cart and step 0', () => {
      const session = createGuestSession()
      expect(session.cartItems).toEqual([])
      expect(session.checkoutStep).toBe(0)
    })

    it('sets expiresAt to 24 hours from now', () => {
      const now = Date.now()
      const session = createGuestSession()
      expect(session.expiresAt).toBe(now + 24 * 60 * 60 * 1000)
    })

    it('persists session to localStorage', () => {
      createGuestSession()
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'guest_session',
        expect.any(String)
      )
    })
  })

  // ─── getGuestSession ──────────────────────────────────────────

  describe('getGuestSession', () => {
    it('returns existing session from localStorage', () => {
      const original = createGuestSession()
      const retrieved = getGuestSession()
      expect(retrieved.id).toBe(original.id)
    })

    it('creates a new session if none exists', () => {
      const session = getGuestSession()
      expect(session).toHaveProperty('id')
      expect(session.cartItems).toEqual([])
    })

    it('creates a new session if stored session has expired', () => {
      const session = createGuestSession()
      const originalId = session.id

      // Advance time past expiry
      vi.advanceTimersByTime(25 * 60 * 60 * 1000) // 25 hours

      const retrieved = getGuestSession()
      expect(retrieved.id).not.toBe(originalId)
    })

    it('returns existing session if not expired', () => {
      const session = createGuestSession()
      const originalId = session.id

      // Advance time but not past expiry
      vi.advanceTimersByTime(12 * 60 * 60 * 1000) // 12 hours

      const retrieved = getGuestSession()
      expect(retrieved.id).toBe(originalId)
    })

    it('creates new session if stored JSON is corrupted', () => {
      localStorageMock.setItem('guest_session', 'not-valid-json{{{')
      const session = getGuestSession()
      expect(session).toHaveProperty('id')
      expect(session.cartItems).toEqual([])
    })
  })

  // ─── addToGuestCart ────────────────────────────────────────────

  describe('addToGuestCart', () => {
    it('adds a new item to empty cart', () => {
      const session = addToGuestCart('prod-1', 2, 29.99)
      expect(session.cartItems).toHaveLength(1)
      expect(session.cartItems[0]).toEqual({
        productId: 'prod-1',
        quantity: 2,
        price: 29.99,
      })
    })

    it('increments quantity for existing product', () => {
      addToGuestCart('prod-1', 2, 29.99)
      const session = addToGuestCart('prod-1', 3, 29.99)
      expect(session.cartItems).toHaveLength(1)
      expect(session.cartItems[0].quantity).toBe(5)
    })

    it('adds different products separately', () => {
      addToGuestCart('prod-1', 1, 10.00)
      const session = addToGuestCart('prod-2', 2, 20.00)
      expect(session.cartItems).toHaveLength(2)
    })

    it('persists changes to localStorage', () => {
      addToGuestCart('prod-1', 1, 10.00)
      const stored = JSON.parse(localStorageMock.getItem('guest_session')!)
      expect(stored.cartItems).toHaveLength(1)
    })
  })

  // ─── removeFromGuestCart ───────────────────────────────────────

  describe('removeFromGuestCart', () => {
    it('removes an existing item', () => {
      addToGuestCart('prod-1', 2, 29.99)
      addToGuestCart('prod-2', 1, 19.99)
      const session = removeFromGuestCart('prod-1')
      expect(session.cartItems).toHaveLength(1)
      expect(session.cartItems[0].productId).toBe('prod-2')
    })

    it('does nothing if product not in cart', () => {
      addToGuestCart('prod-1', 2, 29.99)
      const session = removeFromGuestCart('nonexistent')
      expect(session.cartItems).toHaveLength(1)
    })

    it('results in empty cart when removing last item', () => {
      addToGuestCart('prod-1', 1, 10.00)
      const session = removeFromGuestCart('prod-1')
      expect(session.cartItems).toHaveLength(0)
    })
  })

  // ─── updateGuestCartQuantity ───────────────────────────────────

  describe('updateGuestCartQuantity', () => {
    it('updates quantity for existing item', () => {
      addToGuestCart('prod-1', 2, 29.99)
      const session = updateGuestCartQuantity('prod-1', 5)
      expect(session.cartItems[0].quantity).toBe(5)
    })

    it('removes item when quantity is set to 0', () => {
      addToGuestCart('prod-1', 2, 29.99)
      const session = updateGuestCartQuantity('prod-1', 0)
      expect(session.cartItems).toHaveLength(0)
    })

    it('removes item when quantity is negative', () => {
      addToGuestCart('prod-1', 2, 29.99)
      const session = updateGuestCartQuantity('prod-1', -1)
      expect(session.cartItems).toHaveLength(0)
    })

    it('does not add item if product does not exist in cart', () => {
      addToGuestCart('prod-1', 2, 29.99)
      const session = updateGuestCartQuantity('nonexistent', 5)
      expect(session.cartItems).toHaveLength(1)
      expect(session.cartItems[0].productId).toBe('prod-1')
    })
  })

  // ─── getGuestCartTotal ─────────────────────────────────────────

  describe('getGuestCartTotal', () => {
    it('returns 0 for empty cart', () => {
      createGuestSession()
      expect(getGuestCartTotal()).toBe(0)
    })

    it('calculates total for single item', () => {
      addToGuestCart('prod-1', 3, 10.00)
      expect(getGuestCartTotal()).toBe(30.00)
    })

    it('calculates total for multiple items', () => {
      addToGuestCart('prod-1', 2, 10.00)
      addToGuestCart('prod-2', 1, 25.50)
      expect(getGuestCartTotal()).toBeCloseTo(45.50)
    })

    it('handles fractional prices correctly', () => {
      addToGuestCart('prod-1', 1, 9.99)
      addToGuestCart('prod-2', 1, 14.99)
      expect(getGuestCartTotal()).toBeCloseTo(24.98)
    })
  })

  // ─── clearGuestSession ─────────────────────────────────────────

  describe('clearGuestSession', () => {
    it('removes session from localStorage', () => {
      createGuestSession()
      clearGuestSession()
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('guest_session')
    })

    it('after clear, getGuestSession creates a new one', () => {
      const original = createGuestSession()
      clearGuestSession()
      const newSession = getGuestSession()
      expect(newSession.id).not.toBe(original.id)
    })
  })

  // ─── setCheckoutStep ───────────────────────────────────────────

  describe('setCheckoutStep', () => {
    it('updates the checkout step', () => {
      createGuestSession()
      const session = setCheckoutStep(3)
      expect(session.checkoutStep).toBe(3)
    })

    it('persists the step to localStorage', () => {
      createGuestSession()
      setCheckoutStep(2)
      const stored = JSON.parse(localStorageMock.getItem('guest_session')!)
      expect(stored.checkoutStep).toBe(2)
    })

    it('allows setting step to 0', () => {
      createGuestSession()
      setCheckoutStep(3)
      const session = setCheckoutStep(0)
      expect(session.checkoutStep).toBe(0)
    })
  })

  // ─── isSessionValid ────────────────────────────────────────────

  describe('isSessionValid', () => {
    it('returns true for a non-expired session', () => {
      createGuestSession()
      expect(isSessionValid()).toBe(true)
    })

    it('returns false when no session exists', () => {
      expect(isSessionValid()).toBe(false)
    })

    it('returns false for an expired session', () => {
      createGuestSession()
      vi.advanceTimersByTime(25 * 60 * 60 * 1000)
      expect(isSessionValid()).toBe(false)
    })

    it('returns false for corrupted session data', () => {
      localStorageMock.setItem('guest_session', '{broken json')
      expect(isSessionValid()).toBe(false)
    })

    it('returns true at exactly the expiry boundary', () => {
      createGuestSession()
      // Advance to exactly 24 hours — expiresAt = now + 24h, check is Date.now() <= expiresAt
      vi.advanceTimersByTime(24 * 60 * 60 * 1000)
      expect(isSessionValid()).toBe(true)
    })

    it('returns false 1ms after expiry', () => {
      createGuestSession()
      vi.advanceTimersByTime(24 * 60 * 60 * 1000 + 1)
      expect(isSessionValid()).toBe(false)
    })
  })
})
