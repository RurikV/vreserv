import { NextResponse } from 'next/server'
import type { Stripe } from 'stripe'
import { stripe } from '@/lib/stripe'
import { getPayload } from 'payload'
import config from '@payload-config'

// Next.js App Router API route for Stripe webhooks
// Exposes POST(req: Request)
export async function POST(req: Request) {
  // Stripe requires the raw body as text for signature verification
  const bodyText = await req.text()
  const signature = req.headers.get('stripe-signature') || ''
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(bodyText, signature, webhookSecret)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ message: `Webhook Error: ${message}` }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const sessionId = event?.data?.object?.id as string | undefined
        const userId = event?.data?.object?.metadata?.userId as string | undefined
        const accountId = event?.account as string | undefined

        if (!sessionId || !userId) {
          return NextResponse.json({ message: 'Webhook handler failed' }, { status: 500 })
        }

        const payload = await getPayload({ config })
        const user = await payload.findByID({ collection: 'users', id: userId })
        if (!user) {
          return NextResponse.json({ message: 'Webhook handler failed' }, { status: 500 })
        }

        // Retrieve the line items for the session to create orders
        const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ['line_items.data.price.product'] })
        const items = (session?.line_items?.data ?? []) as Stripe.LineItem[]

        for (const item of items) {
          const prod = (item.price && typeof item.price.product !== 'string'
            ? (item.price.product as unknown as import('stripe').Stripe.Product)
            : undefined)
          const productMeta = prod?.metadata ?? {}
          const productName = prod?.name

          // Skip order creation if product ID or name is missing
          if (!productMeta.id || !productName) {
            continue
          }

          await payload.create({
            collection: 'orders',
            data: {
              user: userId,
              stripeCheckoutSessionId: sessionId,
              stripeAccountId: accountId,
              product: productMeta.id,
              name: productName,
            },
          })
        }

        return NextResponse.json({ message: 'Received' }, { status: 200 })
      }

      case 'account.updated': {
        const accountId = event?.account as string | undefined
        const detailsSubmitted = !!event?.data?.object?.details_submitted

        const payload = await getPayload({ config })
        await payload.update({
          collection: 'tenants',
          where: { stripeAccountId: { equals: accountId } },
          data: { stripeDetailsSubmitted: detailsSubmitted },
        })

        return NextResponse.json({ message: 'Received' }, { status: 200 })
      }

      default: {
        // Non-permitted or unhandled events: acknowledge
        return NextResponse.json({ message: 'Received' }, { status: 200 })
      }
    }
  } catch {
    return NextResponse.json({ message: 'Webhook handler failed' }, { status: 500 })
  }
}
