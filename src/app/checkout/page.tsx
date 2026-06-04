'use client'

import { Elements } from '@stripe/react-stripe-js'
import { getStripe } from '@/src/lib/stripe'
import { CheckoutForm } from '@/src/components/CheckoutForm'
import { useCart } from '@/src/context/CartContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function CheckoutPage() {
  const { state } = useCart()
  const router = useRouter()
  const stripe = getStripe()

  useEffect(() => {
    if (state.items.length === 0) {
      router.push('/cart')
    }
  }, [state.items.length, router])

  if (state.items.length === 0) {
    return null
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold text-white mb-8">Checkout</h1>
          <div className="bg-secondary rounded-lg border border-gray-700 p-8">
            <Elements stripe={stripe}>
              <CheckoutForm />
            </Elements>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-secondary rounded-lg border border-gray-700 p-6 sticky top-24 h-fit">
            <h2 className="text-xl font-semibold text-white mb-6">Order Summary</h2>

            <div className="space-y-4 mb-6">
              {state.items.map(item => (
                <div key={item.id} className="flex justify-between text-sm text-gray-300">
                  <span>
                    {item.name} x {item.quantity}
                  </span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-700 pt-4 space-y-2 text-sm text-gray-300 mb-6">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${state.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (8%)</span>
                <span>${(state.total * 0.08).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>Free</span>
              </div>
            </div>

            <div className="border-t border-gray-700 pt-4">
              <div className="flex justify-between text-lg font-bold text-white">
                <span>Total</span>
                <span>${(state.total * 1.08).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
