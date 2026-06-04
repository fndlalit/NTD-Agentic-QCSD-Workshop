'use client'

import Link from 'next/link'
import { useCart } from '@/src/context/CartContext'
import { CartItem } from '@/src/components/CartItem'

export default function CartPage() {
  const { state } = useCart()

  if (state.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-white mb-8">Shopping Cart</h1>
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg mb-6">Your cart is empty</p>
          <Link
            href="/"
            className="inline-block bg-primary hover:bg-blue-600 text-black font-semibold py-2 px-6 rounded transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-white mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-secondary rounded-lg border border-gray-700 p-6">
            {state.items.map(item => (
              <CartItem key={item.id} item={item} />
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-secondary rounded-lg border border-gray-700 p-6 sticky top-24 h-fit">
            <h2 className="text-xl font-semibold text-white mb-6">Order Summary</h2>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-gray-300">
                <span>Subtotal</span>
                <span>${state.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Tax</span>
                <span>${(state.total * 0.08).toFixed(2)}</span>
              </div>
            </div>

            <div className="border-t border-gray-700 pt-4 mb-6">
              <div className="flex justify-between text-lg font-bold text-white">
                <span>Total</span>
                <span>${(state.total * 1.08).toFixed(2)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="w-full bg-primary hover:bg-blue-600 text-black font-bold py-3 rounded transition block text-center"
            >
              Proceed to Checkout
            </Link>

            <Link
              href="/"
              className="w-full mt-3 border border-gray-700 hover:border-gray-600 text-white font-semibold py-3 rounded transition block text-center"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
