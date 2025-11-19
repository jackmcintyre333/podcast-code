"use client"

import { useState } from "react"
import Link from "next/link"
import { Podcast, Check } from "lucide-react"

const SUBSCRIPTION_PLANS = [
  {
    id: "free",
    name: "Starter",
    price: 0,
    description: "Perfect for trying CommuteCast",
    features: ["1 podcast per day", "Up to 10 minutes", "Standard voice", "Email delivery", "Community support"],
    cta: "Get Started Free",
    popular: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: 9.99,
    description: "For daily commuters",
    features: [
      "Unlimited podcasts",
      "Up to 30 minutes each",
      "Multiple premium voices",
      "Priority email delivery",
      "Custom topics",
      "Email support",
      "Ad-free experience",
    ],
    cta: "Start 7-Day Trial",
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 29.99,
    description: "For teams & organizations",
    features: [
      "Everything in Pro",
      "Team management",
      "Custom API access",
      "Advanced analytics",
      "Dedicated support",
      "Custom branding",
      "SLA guarantee",
    ],
    cta: "Contact Sales",
    popular: false,
  },
]

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("monthly")

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
            <nav className="flex items-center gap-4">
              <Link
                href="/auth/login"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/auth/signup"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
              >
                Get started
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-foreground font-serif md:text-5xl">Simple, Transparent Pricing</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose the perfect plan for your commute. All plans include a free trial.
            </p>
          </div>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                billingPeriod === "monthly"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod("annual")}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                billingPeriod === "annual"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Annual
              <span className="ml-2 inline-block rounded-full bg-secondary/20 px-2 py-1 text-xs text-secondary">
                Save 20%
              </span>
            </button>
          </div>

          {/* Pricing Cards */}
          <div className="grid gap-8 md:grid-cols-3">
            {SUBSCRIPTION_PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`rounded-lg border transition-all ${
                  plan.popular
                    ? "border-accent shadow-xl scale-105 md:scale-100 md:ring-2 md:ring-accent"
                    : "border-border"
                } bg-card p-8 flex flex-col`}
              >
                {plan.popular && (
                  <div className="inline-block w-fit rounded-full bg-accent/20 px-3 py-1 text-xs font-medium text-accent mb-4">
                    Most Popular
                  </div>
                )}

                <div className="space-y-4 flex-1">
                  <div>
                    <h3 className="text-2xl font-bold text-foreground font-serif">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                  </div>

                  <div className="space-y-1">
                    {plan.price === 0 ? (
                      <p className="text-4xl font-bold text-foreground">Free</p>
                    ) : (
                      <>
                        <p className="text-4xl font-bold text-foreground">
                          ${billingPeriod === "annual" ? (plan.price * 12 * 0.8).toFixed(2) : plan.price}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {billingPeriod === "annual" ? "per year" : "per month"}
                        </p>
                      </>
                    )}
                  </div>

                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  className={`mt-8 w-full rounded-lg px-4 py-3 font-medium transition-colors ${
                    plan.popular
                      ? "bg-primary text-primary-foreground hover:opacity-90"
                      : "border border-border text-foreground hover:bg-muted"
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>

          {/* FAQ */}
          <div className="space-y-8 pt-8">
            <h2 className="text-3xl font-bold text-foreground font-serif text-center">Frequently Asked Questions</h2>

            <div className="grid gap-6 md:grid-cols-2">
              {[
                {
                  q: "Can I change plans anytime?",
                  a: "Yes! Upgrade or downgrade your plan at any time. Changes take effect at your next billing cycle.",
                },
                {
                  q: "What payment methods do you accept?",
                  a: "We accept all major credit cards, PayPal, and Apple Pay. Payment is secure and encrypted.",
                },
                {
                  q: "Is there a free trial?",
                  a: "All paid plans include a 7-day free trial. No credit card required to start.",
                },
                {
                  q: "What if I'm not satisfied?",
                  a: "We offer a 30-day money-back guarantee. If you're not happy, we'll refund your money.",
                },
              ].map((faq) => (
                <div key={faq.q} className="space-y-2">
                  <h4 className="font-semibold text-foreground">{faq.q}</h4>
                  <p className="text-sm text-muted-foreground">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
