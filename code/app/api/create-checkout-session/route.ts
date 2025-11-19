export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { planId, userId, email } = await req.json()

    if (!planId || !userId || !email) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    // In production, this would integrate with Stripe:
    // const session = await stripe.checkout.sessions.create({
    //   customer_email: email,
    //   line_items: [
    //     {
    //       price: STRIPE_PRICE_IDS[planId],
    //       quantity: 1,
    //     },
    //   ],
    //   mode: "subscription",
    //   success_url: `${req.nextUrl.origin}/dashboard/billing?session_id={CHECKOUT_SESSION_ID}`,
    //   cancel_url: `${req.nextUrl.origin}/pricing`,
    //   metadata: {
    //     userId,
    //   },
    // });

    const sessionId = `cs_${Date.now()}_${userId}` // Placeholder

    return Response.json({ sessionId })
  } catch (error) {
    console.error("Checkout session error:", error)
    return Response.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}
