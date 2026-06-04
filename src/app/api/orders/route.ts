import { NextRequest, NextResponse } from 'next/server'

// In-memory store for demo purposes
const orders: Map<string, unknown> = new Map()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, customer, email, items, total } = body

    const order = {
      id: orderId,
      customer,
      email,
      items,
      total,
      createdAt: new Date().toISOString(),
      status: 'pending',
    }

    orders.set(orderId, order)

    return NextResponse.json({ success: true, orderId })
  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const orderId = request.nextUrl.searchParams.get('id')

  if (!orderId) {
    return NextResponse.json({ error: 'Order ID required' }, { status: 400 })
  }

  const order = orders.get(orderId)

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  return NextResponse.json(order)
}
