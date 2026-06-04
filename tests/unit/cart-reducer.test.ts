import { describe, it, expect } from 'vitest'
import type { CartItem } from '@/src/context/CartContext'

interface CartState {
  items: CartItem[]
  total: number
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'quantity'> }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }

// Replica of the reducer for testing
const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.id === action.payload.id)

      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
          total: state.total + action.payload.price,
        }
      }

      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: 1 }],
        total: state.total + action.payload.price,
      }
    }

    case 'REMOVE_ITEM':
      const itemToRemove = state.items.find(item => item.id === action.payload)
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
        total: state.total - (itemToRemove ? itemToRemove.price * itemToRemove.quantity : 0),
      }

    case 'UPDATE_QUANTITY': {
      const item = state.items.find(item => item.id === action.payload.id)
      if (!item) return state

      const oldTotal = item.price * item.quantity
      const newTotal = item.price * action.payload.quantity
      const priceDifference = newTotal - oldTotal

      if (action.payload.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(item => item.id !== action.payload.id),
          total: state.total - oldTotal,
        }
      }

      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
        total: state.total + priceDifference,
      }
    }

    case 'CLEAR_CART':
      return {
        items: [],
        total: 0,
      }

    default:
      return state
  }
}

describe('Cart Reducer', () => {
  const initialState: CartState = {
    items: [],
    total: 0,
  }

  const mockItem = {
    id: '1',
    name: 'Test Product',
    price: 100,
    image: 'test.jpg',
  }

  describe('ADD_ITEM', () => {
    it('should add a new item to empty cart', () => {
      const state = cartReducer(initialState, {
        type: 'ADD_ITEM',
        payload: mockItem,
      })

      expect(state.items).toHaveLength(1)
      expect(state.items[0].id).toBe('1')
      expect(state.items[0].quantity).toBe(1)
      expect(state.total).toBe(100)
    })

    it('should increment quantity when adding existing item', () => {
      let state = cartReducer(initialState, {
        type: 'ADD_ITEM',
        payload: mockItem,
      })

      state = cartReducer(state, {
        type: 'ADD_ITEM',
        payload: mockItem,
      })

      expect(state.items).toHaveLength(1)
      expect(state.items[0].quantity).toBe(2)
      expect(state.total).toBe(200)
    })

    it('should add multiple different items', () => {
      let state = cartReducer(initialState, {
        type: 'ADD_ITEM',
        payload: mockItem,
      })

      state = cartReducer(state, {
        type: 'ADD_ITEM',
        payload: { id: '2', name: 'Product 2', price: 50, image: 'test2.jpg' },
      })

      expect(state.items).toHaveLength(2)
      expect(state.total).toBe(150)
    })
  })

  describe('REMOVE_ITEM', () => {
    it('should remove an item from cart', () => {
      let state = cartReducer(initialState, {
        type: 'ADD_ITEM',
        payload: mockItem,
      })

      state = cartReducer(state, {
        type: 'REMOVE_ITEM',
        payload: '1',
      })

      expect(state.items).toHaveLength(0)
      expect(state.total).toBe(0)
    })

    it('should handle removing non-existent item', () => {
      let state = cartReducer(initialState, {
        type: 'ADD_ITEM',
        payload: mockItem,
      })

      state = cartReducer(state, {
        type: 'REMOVE_ITEM',
        payload: 'nonexistent',
      })

      expect(state.items).toHaveLength(1)
      expect(state.total).toBe(100)
    })

    it('should correctly calculate total when removing item with quantity', () => {
      let state = cartReducer(initialState, {
        type: 'ADD_ITEM',
        payload: mockItem,
      })

      state = cartReducer(state, {
        type: 'ADD_ITEM',
        payload: mockItem,
      })

      state = cartReducer(state, {
        type: 'REMOVE_ITEM',
        payload: '1',
      })

      expect(state.items).toHaveLength(0)
      expect(state.total).toBe(0)
    })
  })

  describe('UPDATE_QUANTITY', () => {
    it('should update item quantity', () => {
      let state = cartReducer(initialState, {
        type: 'ADD_ITEM',
        payload: mockItem,
      })

      state = cartReducer(state, {
        type: 'UPDATE_QUANTITY',
        payload: { id: '1', quantity: 5 },
      })

      expect(state.items[0].quantity).toBe(5)
      expect(state.total).toBe(500)
    })

    it('should remove item when quantity set to 0', () => {
      let state = cartReducer(initialState, {
        type: 'ADD_ITEM',
        payload: mockItem,
      })

      state = cartReducer(state, {
        type: 'UPDATE_QUANTITY',
        payload: { id: '1', quantity: 0 },
      })

      expect(state.items).toHaveLength(0)
      expect(state.total).toBe(0)
    })

    it('should handle negative quantity by removing item', () => {
      let state = cartReducer(initialState, {
        type: 'ADD_ITEM',
        payload: mockItem,
      })

      state = cartReducer(state, {
        type: 'UPDATE_QUANTITY',
        payload: { id: '1', quantity: -1 },
      })

      expect(state.items).toHaveLength(0)
      expect(state.total).toBe(0)
    })
  })

  describe('CLEAR_CART', () => {
    it('should clear all items', () => {
      let state = cartReducer(initialState, {
        type: 'ADD_ITEM',
        payload: mockItem,
      })

      state = cartReducer(state, {
        type: 'ADD_ITEM',
        payload: { id: '2', name: 'Product 2', price: 50, image: 'test2.jpg' },
      })

      state = cartReducer(state, {
        type: 'CLEAR_CART',
      })

      expect(state.items).toHaveLength(0)
      expect(state.total).toBe(0)
    })
  })
})
