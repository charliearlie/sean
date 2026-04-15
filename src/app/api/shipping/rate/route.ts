import { NextRequest, NextResponse } from 'next/server'
import { calculateShipping, getFreeShippingThreshold } from '@/lib/data/shipping'

export async function GET(request: NextRequest) {
  try {
    const emirate = request.nextUrl.searchParams.get('emirate')
    const subtotal = Number(request.nextUrl.searchParams.get('subtotal') || '0')

    if (!emirate) {
      return NextResponse.json({ error: 'emirate parameter required' }, { status: 400 })
    }

    const [shippingCost, threshold] = await Promise.all([
      calculateShipping(emirate, subtotal),
      getFreeShippingThreshold(),
    ])

    return NextResponse.json({
      shippingCost,
      freeShippingApplied: subtotal >= threshold,
      freeShippingThreshold: threshold,
    })
  } catch (err) {
    console.error('Shipping rate error:', err)
    return NextResponse.json({ error: 'Failed to calculate shipping' }, { status: 500 })
  }
}
