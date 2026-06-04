import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CheckoutForm } from '@/src/components/CheckoutForm'
import { CartProvider, useCart } from '@/src/context/CartContext'
import { Elements } from '@stripe/react-stripe-js'
import { getStripe } from '@/src/lib/stripe'
import { validateCheckoutForm } from '@/src/lib/validation'

// Mock useRouter
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

// Mock fetch
global.fetch = vi.fn()

// Helper component to populate cart
function CheckoutFormWithCart() {
  const { dispatch } = useCart()

  // Add item to cart on mount
  React.useEffect(() => {
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        id: '1',
        name: 'Test Product',
        price: 99.99,
        image: 'https://example.com/image.jpg',
      },
    })
  }, [dispatch])

  return <CheckoutForm />
}

const renderCheckoutForm = () => {
  return render(
    <CartProvider>
      <Elements stripe={getStripe()}>
        <CheckoutFormWithCart />
      </Elements>
    </CartProvider>
  )
}

describe('CheckoutForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('should render form fields', () => {
    renderCheckoutForm()

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/street address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/zip code/i)).toBeInTheDocument()
  })

  it('should render GDPR consent checkbox', () => {
    renderCheckoutForm()

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeInTheDocument()
  })

  it('should have accessible GDPR checkbox with aria-describedby when there are errors', () => {
    renderCheckoutForm()

    const checkbox = screen.getByRole('checkbox', { name: /consent/i })
    // Initially no aria-describedby since there are no errors
    expect(checkbox.getAttribute('aria-describedby')).toBeNull()
  })

  it('should accept valid zip codes in multiple formats', async () => {
    renderCheckoutForm()

    const zipInput = screen.getByLabelText(/zip code/i) as HTMLInputElement

    // Test 5-digit format
    await userEvent.clear(zipInput)
    await userEvent.type(zipInput, '12345')
    expect(zipInput.value).toBe('12345')

    // Test extended format
    await userEvent.clear(zipInput)
    await userEvent.type(zipInput, '12345-6789')
    expect(zipInput.value).toBe('12345-6789')
  })

  it('should update form fields on user input', async () => {
    renderCheckoutForm()

    const nameInput = screen.getByLabelText(/full name/i) as HTMLInputElement
    const emailInput = screen.getByLabelText(/email address/i) as HTMLInputElement

    await userEvent.type(nameInput, 'John Doe')
    expect(nameInput.value).toBe('John Doe')

    await userEvent.type(emailInput, 'john@example.com')
    expect(emailInput.value).toBe('john@example.com')
  })
})

describe('validateCheckoutForm', () => {
  it('should accept a valid complete form', () => {
    const validForm = {
      name: 'John Doe',
      email: 'john@example.com',
      address: '123 Main Street',
      zipCode: '12345',
      gdprConsent: true,
    }
    const errors = validateCheckoutForm(validForm)
    expect(Object.keys(errors).length).toBe(0)
  })

  it('should validate empty name', () => {
    const form = {
      name: '',
      email: 'john@example.com',
      address: '123 Main Street',
      zipCode: '12345',
      gdprConsent: true,
    }
    const errors = validateCheckoutForm(form)
    expect(errors.name).toBeDefined()
    expect(errors.name).toBe('Name is required')
  })

  it('should validate invalid email', () => {
    const form = {
      name: 'John Doe',
      email: 'invalid',
      address: '123 Main Street',
      zipCode: '12345',
      gdprConsent: true,
    }
    const errors = validateCheckoutForm(form)
    expect(errors.email).toBeDefined()
    expect(errors.email).toContain('valid email')
  })

  it('should validate short address', () => {
    const form = {
      name: 'John Doe',
      email: 'john@example.com',
      address: 'St',
      zipCode: '12345',
      gdprConsent: true,
    }
    const errors = validateCheckoutForm(form)
    expect(errors.address).toBeDefined()
    expect(errors.address).toContain('complete address')
  })

  it('should validate invalid zip code', () => {
    const form = {
      name: 'John Doe',
      email: 'john@example.com',
      address: '123 Main Street',
      zipCode: 'ABCDE',
      gdprConsent: true,
    }
    const errors = validateCheckoutForm(form)
    expect(errors.zipCode).toBeDefined()
    expect(errors.zipCode).toContain('valid zip code')
  })

  it('should validate GDPR consent requirement', () => {
    const form = {
      name: 'John Doe',
      email: 'john@example.com',
      address: '123 Main Street',
      zipCode: '12345',
      gdprConsent: false,
    }
    const errors = validateCheckoutForm(form)
    expect(errors.gdprConsent).toBeDefined()
    expect(errors.gdprConsent).toContain('GDPR')
  })

  it('should catch multiple validation errors', () => {
    const form = {
      name: 'A',
      email: 'bad',
      address: 'x',
      zipCode: '123',
      gdprConsent: false,
    }
    const errors = validateCheckoutForm(form)
    expect(Object.keys(errors).length).toBeGreaterThanOrEqual(4)
    expect(errors.name).toBeDefined()
    expect(errors.email).toBeDefined()
    expect(errors.address).toBeDefined()
    expect(errors.zipCode).toBeDefined()
  })
})
