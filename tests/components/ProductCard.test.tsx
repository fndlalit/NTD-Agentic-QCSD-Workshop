import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ProductCard } from '@/src/components/ProductCard'
import { CartProvider } from '@/src/context/CartContext'
import type { Product } from '@/src/lib/products'

const mockProduct: Product = {
  id: '1',
  name: 'Test Product',
  price: 99.99,
  image: 'https://via.placeholder.com/400x300?text=Test',
  description: 'A test product',
  category: 'Electronics',
}

const renderProductCard = (product: Product) => {
  return render(
    <CartProvider>
      <ProductCard product={product} />
    </CartProvider>
  )
}

describe('ProductCard', () => {
  it('should render product information', () => {
    renderProductCard(mockProduct)

    expect(screen.getByText('Test Product')).toBeInTheDocument()
    expect(screen.getByText('A test product')).toBeInTheDocument()
    expect(screen.getByText('$99.99')).toBeInTheDocument()
  })

  it('should render add to cart button', () => {
    renderProductCard(mockProduct)

    const button = screen.getByRole('button', { name: /add test product to cart/i })
    expect(button).toBeInTheDocument()
  })

  it('should render product image', () => {
    renderProductCard(mockProduct)

    const image = screen.getByAltText('Test Product')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src')
  })

  it('should handle add to cart click', () => {
    renderProductCard(mockProduct)

    const button = screen.getByRole('button', { name: /add test product to cart/i })
    fireEvent.click(button)

    // Button should still be visible after click
    expect(button).toBeInTheDocument()
  })

  it('should format price correctly', () => {
    const productWithDifferentPrice: Product = {
      ...mockProduct,
      price: 1234.5,
    }

    renderProductCard(productWithDifferentPrice)
    expect(screen.getByText('$1234.50')).toBeInTheDocument()
  })

  it('should handle long product names', () => {
    const productWithLongName: Product = {
      ...mockProduct,
      name: 'This is a very long product name that should still render correctly in the card component',
    }

    renderProductCard(productWithLongName)
    expect(
      screen.getByText(
        'This is a very long product name that should still render correctly in the card component'
      )
    ).toBeInTheDocument()
  })
})
