// Guest session management for unauthenticated users
// Manages cart and checkout state via localStorage

export interface GuestSession {
  id: string
  createdAt: number
  expiresAt: number
  cartItems: CartItem[]
  checkoutStep: number
}

export interface CartItem {
  productId: string
  quantity: number
  price: number
}

const SESSION_KEY = 'guest_session'
const SESSION_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

/**
 * Generates a unique session ID
 */
export const generateSessionId = (): string => {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 10)
  return `gs_${timestamp}_${random}`
}

/**
 * Creates a new guest session
 */
export const createGuestSession = (): GuestSession => {
  const now = Date.now()
  const session: GuestSession = {
    id: generateSessionId(),
    createdAt: now,
    expiresAt: now + SESSION_TTL_MS,
    cartItems: [],
    checkoutStep: 0,
  }

  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  return session
}

/**
 * Retrieves the current guest session, or creates one if none exists
 */
export const getGuestSession = (): GuestSession => {
  const stored = localStorage.getItem(SESSION_KEY)

  if (!stored) {
    return createGuestSession()
  }

  try {
    const session: GuestSession = JSON.parse(stored)

    // Check if session has expired
    if (Date.now() > session.expiresAt) {
      localStorage.removeItem(SESSION_KEY)
      return createGuestSession()
    }

    return session
  } catch {
    // Corrupted session data
    localStorage.removeItem(SESSION_KEY)
    return createGuestSession()
  }
}

/**
 * Saves the session to localStorage
 */
export const saveGuestSession = (session: GuestSession): void => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

/**
 * Adds an item to the guest cart
 */
export const addToGuestCart = (
  productId: string,
  quantity: number,
  price: number
): GuestSession => {
  const session = getGuestSession()

  const existingIndex = session.cartItems.findIndex(
    item => item.productId === productId
  )

  if (existingIndex >= 0) {
    session.cartItems[existingIndex].quantity += quantity
  } else {
    session.cartItems.push({ productId, quantity, price })
  }

  saveGuestSession(session)
  return session
}

/**
 * Removes an item from the guest cart
 */
export const removeFromGuestCart = (productId: string): GuestSession => {
  const session = getGuestSession()
  session.cartItems = session.cartItems.filter(
    item => item.productId !== productId
  )
  saveGuestSession(session)
  return session
}

/**
 * Updates the quantity of a cart item
 */
export const updateGuestCartQuantity = (
  productId: string,
  quantity: number
): GuestSession => {
  if (quantity <= 0) {
    return removeFromGuestCart(productId)
  }

  const session = getGuestSession()
  const item = session.cartItems.find(i => i.productId === productId)

  if (item) {
    item.quantity = quantity
    saveGuestSession(session)
  }

  return session
}

/**
 * Calculates the total price of the guest cart
 */
export const getGuestCartTotal = (): number => {
  const session = getGuestSession()
  return session.cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  )
}

/**
 * Clears the guest session entirely
 */
export const clearGuestSession = (): void => {
  localStorage.removeItem(SESSION_KEY)
}

/**
 * Updates the checkout step
 */
export const setCheckoutStep = (step: number): GuestSession => {
  const session = getGuestSession()
  session.checkoutStep = step
  saveGuestSession(session)
  return session
}

/**
 * Checks if the guest session is still valid (not expired)
 */
export const isSessionValid = (): boolean => {
  const stored = localStorage.getItem(SESSION_KEY)
  if (!stored) return false

  try {
    const session: GuestSession = JSON.parse(stored)
    return Date.now() <= session.expiresAt
  } catch {
    return false
  }
}
