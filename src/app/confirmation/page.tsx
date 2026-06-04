'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

interface Order {
  id: string
  customer: string
  email: string
  items: Array<{
    id: string
    name: string
    price: number
    quantity: number
  }>
  total: number
  timestamp: string
}

function ConfirmationContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const [order, setOrder] = useState<Order | null>(null)

  useEffect(() => {
    const lastOrder = localStorage.getItem('lastOrder')
    if (lastOrder && orderId) {
      const parsedOrder = JSON.parse(lastOrder)
      if (parsedOrder.id === orderId) {
        setOrder(parsedOrder)
      }
    }
  }, [orderId])

  const estimatedDelivery = new Date()
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 5)

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-secondary rounded-lg border border-gray-700 p-8 text-center mb-8">
        <div className="text-6xl mb-4">✓</div>
        <h1 className="text-3xl font-bold text-white mb-2">Order Confirmed!</h1>
        <p className="text-gray-400 mb-6">
          Thank you for your purchase. Your order has been received and is being prepared.
        </p>
        {order && <p className="text-primary font-semibold text-lg">{order.id}</p>}
      </div>

      {order && (
        <>
          <div className="bg-secondary rounded-lg border border-gray-700 p-6 mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Order Details</h2>

            <div className="space-y-3 text-sm text-gray-300 mb-6">
              <div className="flex justify-between">
                <span>Order Number:</span>
                <span className="text-white font-semibold">{order.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Customer:</span>
                <span className="text-white font-semibold">{order.customer}</span>
              </div>
              <div className="flex justify-between">
                <span>Email:</span>
                <span className="text-white font-semibold">{order.email}</span>
              </div>
              <div className="flex justify-between">
                <span>Order Date:</span>
                <span className="text-white font-semibold">
                  {new Date(order.timestamp).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Delivery:</span>
                <span className="text-white font-semibold">
                  {estimatedDelivery.toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="border-t border-gray-700 pt-6">
              <h3 className="font-semibold text-white mb-4">Items Ordered</h3>
              <div className="space-y-3">
                {order.items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-300">
                      {item.name} x {item.quantity}
                    </span>
                    <span className="text-white font-semibold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-700 pt-4 mt-4">
              <div className="flex justify-between text-lg">
                <span className="font-semibold text-white">Total:</span>
                <span className="font-bold text-primary">${(order.total * 1.08).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-900 border border-blue-700 rounded p-6 mb-8">
            <h3 className="font-semibold text-white mb-2">What's Next?</h3>
            <p className="text-blue-100 text-sm mb-4">
              You will receive a confirmation email shortly with tracking information. Your order is typically delivered within 5 business days.
            </p>
            <div className="text-sm text-blue-200">
              <p>Order Reference: <span className="font-mono">{order.id}</span></p>
            </div>
          </div>
        </>
      )}

      <div className="text-center">
        <Link
          href="/"
          className="inline-block bg-primary hover:bg-blue-600 text-black font-bold py-3 px-8 rounded transition"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  )
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="text-gray-400">Loading confirmation...</div>
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  )
}
