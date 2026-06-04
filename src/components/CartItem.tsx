'use client'

import Image from 'next/image'
import { useCart } from '@/src/context/CartContext'
import type { CartItem as CartItemType } from '@/src/context/CartContext'

interface CartItemProps {
  item: CartItemType
}

export function CartItem({ item }: CartItemProps) {
  const { dispatch } = useCart()

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const quantity = parseInt(e.target.value, 10)
    if (quantity > 0) {
      dispatch({
        type: 'UPDATE_QUANTITY',
        payload: { id: item.id, quantity },
      })
    }
  }

  const handleRemove = () => {
    dispatch({
      type: 'REMOVE_ITEM',
      payload: item.id,
    })
  }

  return (
    <div className="flex gap-4 py-4 border-b border-gray-700">
      <div className="relative h-24 w-24 flex-shrink-0">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover rounded"
          sizes="100px"
        />
      </div>
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">{item.name}</h3>
          <p className="text-gray-400">${item.price.toFixed(2)} each</p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2">
            <label htmlFor={`qty-${item.id}`} className="text-sm text-gray-400">
              Qty:
            </label>
            <input
              id={`qty-${item.id}`}
              type="number"
              min="1"
              value={item.quantity}
              onChange={handleQuantityChange}
              className="bg-gray-800 text-white border border-gray-700 rounded px-2 py-1 w-16"
              aria-label={`Quantity for ${item.name}`}
            />
          </div>
          <button
            onClick={handleRemove}
            className="text-red-500 hover:text-red-400 text-sm font-semibold transition"
            aria-label={`Remove ${item.name} from cart`}
          >
            Remove
          </button>
        </div>
      </div>
      <div className="text-right flex flex-col justify-between">
        <p className="text-lg font-semibold text-white">
          ${(item.price * item.quantity).toFixed(2)}
        </p>
      </div>
    </div>
  )
}
