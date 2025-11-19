"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { Podcast, ArrowLeft, CreditCard, CheckCircle } from "lucide-react"

export default function BillingPage() {
  const [user, setUser] = useState<any>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getSubscription = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
      } else {
        setUser(user)
        const { data: sub } = await supabase
          .from("user_subscriptions")
          .select("*, subscription_plans(*)")
          .eq("user_id", user.id)
          .eq("status", "active")
          .single()

        if (sub) {
          setSubscription(sub)
        }
      }
      setLoading(false)
    }
    getSubscription()
  }, [router, supabase])

  const handleUpgrade = async () => {
    // In production, this would call /api/create-checkout-session
    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: "pro",
          userId: user.id,
          email: user.email,
        }),
      })

      const { sessionId } = await response.json()
      // Redirect to Stripe (in production)
      console.log("Checkout session created:", sessionId)
    } catch (error) {
      console.error("Error creating checkout session:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Podcast className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-semibold text-foreground">CommuteCast</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <Link href="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="space-y-8">
          <h1 className="text-3xl font-bold text-foreground font-serif">Billing & Subscription</h1>

          {subscription ? (
            <div className="space-y-6">
              {/* Current Plan */}
              <div className="rounded-lg border border-border bg-card p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-secondary" />
                      Current Plan: {subscription.subscription_plans.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      ${subscription.subscription_plans.price_monthly}/month
                    </p>
                  </div>
                </div>

                {subscription.renewal_date && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      Renews on {new Date(subscription.renewal_date).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {/* Plan Features */}
              <div className="rounded-lg border border-border bg-card p-6 space-y-4">
                <h4 className="font-semibold text-foreground">Plan Features</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>Up to {subscription.subscription_plans.max_daily_episodes} podcasts per day</li>
                  <li>Maximum {subscription.subscription_plans.max_podcast_length} minutes per episode</li>
                  <li>{subscription.subscription_plans.voice_options} voice options</li>
                  {subscription.subscription_plans.custom_publication_times && <li>Custom publication times</li>}
                  {subscription.subscription_plans.ad_free && <li>Ad-free experience</li>}
                </ul>
              </div>

              {/* Billing Actions */}
              <div className="flex gap-4">
                <button
                  onClick={handleUpgrade}
                  className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  <CreditCard className="h-5 w-5" />
                  Manage Subscription
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-card p-12 text-center space-y-4">
              <p className="text-muted-foreground">
                You're currently on the free plan. Upgrade to get unlimited podcasts and more features.
              </p>
              <button
                onClick={handleUpgrade}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground hover:opacity-90 transition-opacity"
              >
                <CreditCard className="h-5 w-5" />
                Upgrade Now
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
