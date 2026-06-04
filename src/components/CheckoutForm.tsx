'use client'

import { useState } from 'react'
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useRouter } from 'next/navigation'
import { useCart } from '@/src/context/CartContext'
import { validateCheckoutForm, type FormData, type FormErrors } from '@/src/lib/validation'

export function CheckoutForm() {
  const stripe = useStripe()
  const elements = useElements()
  const { push } = useRouter()
  const { state, dispatch } = useCart()

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    address: '',
    zipCode: '',
    gdprConsent: false,
  })

  const validateForm = (): boolean => {
    const newErrors = validateCheckoutForm(formData)
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    if (!stripe || !elements) {
      return
    }

    setLoading(true)

    try {
      // QUALITY GAP 2: API call without proper input validation
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: state.total * 100,
          email: formData.email,
          name: formData.name,
          address: formData.address,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create payment intent')
      }

      const { clientSecret } = await response.json()

      const cardElement = elements.getElement(CardElement)
      if (!cardElement) {
        throw new Error('Card element not found')
      }

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: formData.name,
            email: formData.email,
            address: {
              line1: formData.address,
              postal_code: formData.zipCode,
            },
          },
        },
      })

      if (result.error) {
        setErrors({ stripe: result.error.message || 'Payment failed' })
      } else if (result.paymentIntent?.status === 'succeeded') {
        // Store order in memory and redirect
        const orderId = `ORD-${Date.now()}`
        localStorage.setItem(
          'lastOrder',
          JSON.stringify({
            id: orderId,
            customer: formData.name,
            email: formData.email,
            items: state.items,
            total: state.total,
            timestamp: new Date().toISOString(),
          })
        )
        dispatch({ type: 'CLEAR_CART' })
        push(`/confirmation?orderId=${orderId}`)
      }
    } catch (err) {
      setErrors({
        payment: err instanceof Error ? err.message : 'An error occurred',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
          Full Name
        </label>
        <input
          id="name"
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`w-full bg-gray-800 border rounded px-4 py-2 text-white focus:outline-none focus:border-primary transition ${
            errors.name ? 'border-red-500' : 'border-gray-700'
          }`}
          disabled={loading}
        />
        {errors.name && (
          <p className="stripe-error" role="alert">
            {errors.name}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={`w-full bg-gray-800 border rounded px-4 py-2 text-white focus:outline-none focus:border-primary transition ${
            errors.email ? 'border-red-500' : 'border-gray-700'
          }`}
          disabled={loading}
        />
        {errors.email && (
          <p className="stripe-error" role="alert">
            {errors.email}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-300 mb-2">
          Street Address
        </label>
        <input
          id="address"
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
          className={`w-full bg-gray-800 border rounded px-4 py-2 text-white focus:outline-none focus:border-primary transition ${
            errors.address ? 'border-red-500' : 'border-gray-700'
          }`}
          disabled={loading}
        />
        {errors.address && (
          <p className="stripe-error" role="alert">
            {errors.address}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="zipCode" className="block text-sm font-medium text-gray-300 mb-2">
          Zip Code
        </label>
        <input
          id="zipCode"
          type="text"
          name="zipCode"
          value={formData.zipCode}
          onChange={handleChange}
          placeholder="12345 or 12345-6789"
          className={`w-full bg-gray-800 border rounded px-4 py-2 text-white focus:outline-none focus:border-primary transition ${
            errors.zipCode ? 'border-red-500' : 'border-gray-700'
          }`}
          disabled={loading}
        />
        {errors.zipCode && (
          <p className="stripe-error" role="alert">
            {errors.zipCode}
          </p>
        )}
      </div>

      <div className="border-t border-gray-700 pt-6">
        <h3 className="text-lg font-semibold text-white mb-4">Payment Details</h3>
        <div className={`bg-gray-800 border rounded px-4 py-3 ${
          errors.stripe ? 'border-red-500' : 'border-gray-700'
        }`}>
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#fafafa',
                  '::placeholder': {
                    color: '#9ca3af',
                  },
                },
                invalid: {
                  color: '#ef4444',
                },
              },
            }}
          />
        </div>
        {errors.stripe && (
          <p className="stripe-error" role="alert">
            {errors.stripe}
          </p>
        )}
      </div>

      <div className="flex items-start gap-3">
        <input
          id="gdprConsent"
          type="checkbox"
          name="gdprConsent"
          checked={formData.gdprConsent}
          onChange={handleChange}
          className="mt-1 w-4 h-4 bg-gray-800 border-gray-700 rounded cursor-pointer"
          disabled={loading}
          /* QUALITY GAP: Missing aria-describedby for WCAG 2.2 AA compliance */
        />
        <label htmlFor="gdprConsent" className="text-sm text-gray-300">
          I consent to the processing of my personal data in accordance with GDPR regulations and our privacy policy.
        </label>
      </div>
      {errors.gdprConsent && (
        <p id="gdprConsent-error" className="stripe-error" role="alert">
          {errors.gdprConsent}
        </p>
      )}

      {errors.payment && (
        <div className="bg-red-900 border border-red-700 rounded p-4">
          <p className="text-red-200" role="alert">
            {errors.payment}
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !stripe || !elements}
        className="w-full bg-primary hover:bg-blue-600 disabled:bg-gray-600 text-black font-bold py-3 rounded transition"
      >
        {loading ? 'Processing...' : `Pay $${state.total.toFixed(2)}`}
      </button>
    </form>
  )
}
