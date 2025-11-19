"use client"

import { useState } from "react"
import Link from "next/link"
import { Podcast, Play, Settings } from "lucide-react"

export default function Home() {
  const [user] = useState(null)

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Podcast className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-semibold text-foreground">CommuteCast</span>
            </Link>

            <nav className="hidden items-center gap-8 md:flex">
              {user ? (
                <div className="flex items-center gap-4">
                  <Link
                    href="/dashboard"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/settings"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Settings
                  </Link>
                  <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
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
                </div>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="min-h-[calc(100vh-80px)]">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            {/* Left Column - Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-block rounded-full bg-secondary/20 px-4 py-2">
                  <span className="text-sm font-medium text-secondary">AI-Powered News Summary</span>
                </div>
                <h1 className="text-5xl font-bold tracking-tight text-foreground md:text-6xl font-serif">
                  Your Daily
                  <br />
                  <span className="text-accent">Commute Briefing</span>
                </h1>
                <p className="max-w-xl text-lg text-muted-foreground">
                  Stay informed without wasting time. Get AI-summarized news from topics you care about, delivered as
                  personalized podcasts straight to your inbox every morning.
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/auth/signup"
                  className="flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  <Play className="h-5 w-5" />
                  Start listening free
                </Link>
                <button className="rounded-lg border border-border px-6 py-3 font-medium text-foreground hover:bg-muted transition-colors">
                  Learn more
                </button>
              </div>

              {/* Stats */}
              <div className="flex gap-8 pt-4">
                <div>
                  <div className="text-2xl font-bold text-foreground">0</div>
                  <div className="text-sm text-muted-foreground">Active users</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">0</div>
                  <div className="text-sm text-muted-foreground">Podcasts generated</div>
                </div>
              </div>
            </div>

            {/* Right Column - Feature Highlights */}
            <div className="space-y-6">
              <div className="rounded-lg border border-border bg-card p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/20">
                    <Podcast className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">AI-Summarized</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Advanced AI reads thousands of articles and extracts only what matters to you.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/20">
                    <Play className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Listen Anytime</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Premium text-to-speech brings stories to life. Perfect for your commute.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/20">
                    <Settings className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Fully Customized</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Choose your topics, tone, and length. Your podcast, your way.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Podcast className="h-5 w-5 text-primary" />
                <span className="font-semibold">CommuteCast</span>
              </div>
              <p className="text-sm text-muted-foreground">Daily AI-summarized podcasts for your commute.</p>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Pricing
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Blog
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 CommuteCast. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
