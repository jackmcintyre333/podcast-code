"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { Podcast, Settings, Play, LogOut } from "lucide-react"

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
      } else {
        setUser(user)
      }
      setLoading(false)
    }
    getUser()
  }, [router, supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
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

            <div className="flex items-center gap-4">
              <Link
                href="/dashboard/preferences"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Settings className="h-5 w-5" />
                Preferences
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <LogOut className="h-5 w-5" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground font-serif">Welcome, {user?.email}</h1>
            <p className="text-muted-foreground mt-2">
              Your personalized podcast is being prepared. Set your preferences to get started.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-border bg-card p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Setup Your Preferences</h3>
                  <p className="text-sm text-muted-foreground mt-1">Choose topics, podcast length, and delivery time</p>
                </div>
                <Settings className="h-6 w-6 text-secondary" />
              </div>
              <Link
                href="/dashboard/preferences"
                className="inline-block mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
              >
                Get started
              </Link>
            </div>

            <div className="rounded-lg border border-border bg-card p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Listen to Today's Podcast</h3>
                  <p className="text-sm text-muted-foreground mt-1">Your AI-summarized news awaits</p>
                </div>
                <Play className="h-6 w-6 text-secondary" />
              </div>
              <Link
                href="/dashboard/episodes"
                className="inline-block mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
              >
                Play now
              </Link>
            </div>
          </div>

          {/* Recent Episodes */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Recent Episodes</h2>
            <div className="text-center py-12 text-muted-foreground">
              <p>No episodes yet. Setup your preferences to generate your first podcast.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
