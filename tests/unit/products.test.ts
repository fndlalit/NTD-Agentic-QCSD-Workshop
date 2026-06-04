import { describe, it, expect } from 'vitest'
import { products, type Product } from '@/src/lib/products'

describe('Products', () => {
  it('should have 6 products', () => {
    expect(products).toHaveLength(6)
  })

  it('should have all required product fields', () => {
    products.forEach(product => {
      expect(product).toHaveProperty('id')
      expect(product).toHaveProperty('name')
      expect(product).toHaveProperty('price')
      expect(product).toHaveProperty('image')
      expect(product).toHaveProperty('description')
      expect(product).toHaveProperty('category')
    })
  })

  it('should have unique product IDs', () => {
    const ids = products.map(p => p.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })

  it('should have valid prices', () => {
    products.forEach(product => {
      expect(product.price).toBeGreaterThan(0)
      expect(typeof product.price).toBe('number')
    })
  })

  it('should have non-empty names and descriptions', () => {
    products.forEach(product => {
      expect(product.name).toBeTruthy()
      expect(product.name.length).toBeGreaterThan(0)
      expect(product.description).toBeTruthy()
      expect(product.description.length).toBeGreaterThan(0)
    })
  })

  it('should have valid image URLs', () => {
    products.forEach(product => {
      expect(product.image).toMatch(/^https?:\/\//)
    })
  })
})
