'use client'

import Link from 'next/link'
import { useCart } from '@/src/context/CartContext'

export function Header() {
  const { state } = useCart()
  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <header className="border-b border-gray-800 bg-secondary sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-primary hover:text-blue-400 transition">
          Store
        </Link>
        <ul className="flex gap-6 items-center">
          <li>
            <Link href="/" className="text-gray-300 hover:text-white transition">
              Products
            </Link>
          </li>
          <li>
            <Link
              href="/cart"
              className="flex items-center gap-2 text-gray-300 hover:text-white transition relative"
            >
              <span>Cart</span>
              {itemCount > 0 && (
                <span className="bg-primary text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  )
}
