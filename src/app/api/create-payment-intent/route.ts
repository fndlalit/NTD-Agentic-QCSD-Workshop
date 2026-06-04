import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
})

// QUALITY GAP: Missing input validation on amount — accepts any number including
// negative values, zero, or absurdly large amounts. No type checking on body fields.
// No rate limiting. No CSRF protection.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { amount, currency, email } = body

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency: currency || 'usd',
      metadata: {
        customer_email: email,
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    })
  } catch (error) {
    console.error('Payment intent error:', error)
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}
