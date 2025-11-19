"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { Podcast, ArrowLeft, Save } from "lucide-react"

const AVAILABLE_TOPICS = [
  "Technology",
  "Business",
  "Finance",
  "Science",
  "Health",
  "Sports",
  "Entertainment",
  "Politics",
  "World News",
  "Climate",
]

export default function PreferencesPage() {
  const [user, setUser] = useState<any>(null)
  const [preferences, setPreferences] = useState({
    topics: [] as string[],
    podcast_length: 15,
    publication_time: "08:00",
    voice_preference: "default",
    language: "English",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
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
        const { data: prefs } = await supabase.from("user_preferences").select("*").eq("user_id", user.id).single()

        if (prefs) {
          // Format publication_time from database (HH:MM:SS) to input format (HH:MM)
          let publicationTime = prefs.publication_time || "08:00"
          if (typeof publicationTime === "string") {
            // If it's in HH:MM:SS format, convert to HH:MM for the input
            const timeParts = publicationTime.split(":")
            if (timeParts.length >= 2) {
              publicationTime = `${timeParts[0]}:${timeParts[1]}`
            }
          }

          setPreferences({
            topics: prefs.topics || [],
            podcast_length: prefs.podcast_length || 15,
            publication_time: publicationTime,
            voice_preference: prefs.voice_preference || "default",
            language: prefs.language || "English",
          })
        }
      }
      setLoading(false)
    }
    getUser()
  }, [router, supabase])

  const handleTopicToggle = (topic: string) => {
    setPreferences((prev) => ({
      ...prev,
      topics: prev.topics.includes(topic) ? prev.topics.filter((t) => t !== topic) : [...prev.topics, topic],
    }))
  }

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    setError(null)

    try {
      // Format publication_time to include seconds (HH:MM:SS format for time type)
      // Input can be "HH:MM" or "HH:MM:SS", we need "HH:MM:SS"
      let publicationTime = preferences.publication_time
      const timeParts = publicationTime.split(":")
      if (timeParts.length === 2) {
        // Has hours and minutes, add seconds
        publicationTime = `${publicationTime}:00`
      } else if (timeParts.length === 1) {
        // Only hours, add minutes and seconds
        publicationTime = `${publicationTime}:00:00`
      }
      // If it already has 3 parts (HH:MM:SS), use it as is

      const { data, error: supabaseError } = await supabase
        .from("user_preferences")
        .upsert(
          {
            user_id: user.id,
            topics: preferences.topics,
            podcast_length: preferences.podcast_length,
            publication_time: publicationTime,
            voice_preference: preferences.voice_preference || "neutral",
            language: preferences.language || "en",
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "user_id",
          }
        )
        .select()

      if (supabaseError) {
        console.error("Supabase error details:", {
          message: supabaseError.message,
          details: supabaseError.details,
          hint: supabaseError.hint,
          code: supabaseError.code,
        })
        
        // Check if it's a foreign key constraint error (profile doesn't exist)
        if (supabaseError.code === "23503" || supabaseError.message?.includes("foreign key")) {
          setError(
            "User profile not found. Please contact support or try signing out and back in."
          )
        } else {
          throw new Error(supabaseError.message || "Failed to save preferences")
        }
        return
      }

      router.push("/dashboard")
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to save preferences. Please try again."
      console.error("Error saving preferences:", err)
      setError(errorMessage)
    } finally {
      setSaving(false)
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
          <div>
            <h1 className="text-3xl font-bold text-foreground font-serif">Customize Your Podcast</h1>
            <p className="text-muted-foreground mt-2">
              Choose your topics and preferences for personalized daily episodes
            </p>
          </div>

          {/* Topics Selection */}
          <div className="space-y-4">
            <label className="block text-lg font-semibold text-foreground">What topics interest you?</label>
            <div className="grid gap-3 grid-cols-2 md:grid-cols-3">
              {AVAILABLE_TOPICS.map((topic) => (
                <button
                  key={topic}
                  onClick={() => handleTopicToggle(topic)}
                  className={`rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                    preferences.topics.includes(topic)
                      ? "bg-primary text-primary-foreground"
                      : "border border-input bg-card text-foreground hover:bg-muted"
                  }`}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          {/* Podcast Length */}
          <div className="space-y-4">
            <label htmlFor="length" className="block text-lg font-semibold text-foreground">
              Podcast Length
            </label>
            <select
              id="length"
              value={preferences.podcast_length}
              onChange={(e) =>
                setPreferences((prev) => ({
                  ...prev,
                  podcast_length: Number.parseInt(e.target.value),
                }))
              }
              className="w-full rounded-lg border border-input bg-card px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value={10}>10 minutes</option>
              <option value={15}>15 minutes</option>
              <option value={20}>20 minutes</option>
              <option value={30}>30 minutes</option>
            </select>
          </div>

          {/* Publication Time */}
          <div className="space-y-4">
            <label htmlFor="time" className="block text-lg font-semibold text-foreground">
              Delivery Time
            </label>
            <input
              id="time"
              type="time"
              value={preferences.publication_time}
              onChange={(e) =>
                setPreferences((prev) => ({
                  ...prev,
                  publication_time: e.target.value,
                }))
              }
              className="w-full rounded-lg border border-input bg-card px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving || preferences.topics.length === 0}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            <Save className="h-5 w-5" />
            {saving ? "Saving..." : "Save Preferences"}
          </button>
        </div>
      </main>
    </div>
  )
}
