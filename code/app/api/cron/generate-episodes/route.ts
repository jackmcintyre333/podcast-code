import { createClient } from "@/lib/supabase/server"

export const maxDuration = 60

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const supabase = await createClient()

    const { data: activeUsers } = await supabase
      .from("user_subscriptions")
      .select("user_id, user_preferences(*, user_profiles(email))")
      .eq("status", "active")

    if (!activeUsers) {
      return Response.json({ success: true, processed: 0 })
    }

    let processed = 0

    for (const subscription of activeUsers) {
      const userId = subscription.user_id
      const prefs = subscription.user_preferences

      if (!prefs || !prefs.email) continue

      const now = new Date()
      const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`

      // Check if it's time to generate podcast for this user
      if (prefs.publication_time === currentTime) {
        // Generate episode here
        // 1. Fetch news articles based on topics
        // 2. Summarize articles with AI
        // 3. Generate TTS audio
        // 4. Save episode to database
        // 5. Send email with podcast

        console.log(`Generating episode for user: ${userId}`)
        processed++
      }
    }

    return Response.json({ success: true, processed })
  } catch (error) {
    console.error("Cron job error:", error)
    return Response.json({ error: "Failed to generate episodes" }, { status: 500 })
  }
}
