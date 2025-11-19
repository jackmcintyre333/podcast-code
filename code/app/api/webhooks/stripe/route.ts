export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const body = await req.text()
    const signature = req.headers.get("stripe-signature")

    // In production:
    // const event = stripe.webhooks.constructEvent(
    //   body,
    //   signature,
    //   process.env.STRIPE_WEBHOOK_SECRET!
    // );

    // Handle different event types
    // customer.subscription.created
    // customer.subscription.updated
    // customer.subscription.deleted
    // charge.succeeded
    // charge.failed

    return Response.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return Response.json({ error: "Webhook processing failed" }, { status: 400 })
  }
}
