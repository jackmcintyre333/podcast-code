import { createClient } from "@/lib/supabase/server"
import { NewsService } from "@/lib/news/news-service"
import { generateStitchedPodcastAudio } from "@/lib/tts"
import { sendEpisodeEmail } from "@/lib/email/resend"
import { generateText } from "ai"

export const maxDuration = 60

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const supabase = await createClient()

    const { data: activeUsers, error: activeError } = await supabase
      .from("user_subscriptions")
      .select("user_id, user_preferences(*, user_profiles(email))")
      .eq("status", "active")

    if (activeError) {
      console.error("Error fetching active user subscriptions:", activeError)
      return Response.json({ error: "Failed to fetch subscriptions" }, { status: 500 })
    }

    if (!activeUsers || activeUsers.length === 0) {
      return Response.json({ success: true, processed: 0 })
    }

    const newsService = new NewsService()
    let processed = 0

    for (const subscription of activeUsers as any[]) {
      const userId = subscription.user_id as string
      const prefs = subscription.user_preferences as any

      if (!prefs || !prefs.user_profiles?.email) continue

      const userEmail: string = prefs.user_profiles.email
      const topics: string[] = Array.isArray(prefs.topics) ? prefs.topics : []
      if (topics.length === 0) continue

      const now = new Date()
      const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`

      // publication_time is stored as time (HH:MM:SS) in DB, normalize to HH:MM
      const publicationTimeDb: string = prefs.publication_time || "06:00:00"
      const [hours, minutes] = publicationTimeDb.split(":")
      const userTime = `${hours}:${minutes}`

      // Check if it's time to generate podcast for this user
      if (userTime !== currentTime) {
        continue
      }

      console.log(`Generating episode for user: ${userId}`)

      try {
        // 1. Fetch news articles based on topics
        const articles = await newsService.fetchNewsForTopics(topics)
        if (!articles || articles.length === 0) {
          console.log(`No articles found for user ${userId}, skipping episode.`)
          continue
        }

        // 2. Summarize articles with AI
        const articlesText = articles
          .slice(0, 8)
          .map(
            (a, i) =>
              `${i + 1}. ${a.title}
Source: ${a.source}
Published: ${a.publishedAt}
Summary: ${a.description || ""}
Content: ${a.content || ""}`,
          )
          .join("\n\n")

        const prompt = `You are a professional news podcast host. Summarize the following normalized news articles into a cohesive, engaging narrative that works as a podcast script.

Requirements:
- Conversational tone, 300–400 words
- Natural flow between stories
- Mention sources when relevant
- No bullet points, just spoken script

Articles:
${articlesText}

Generate the podcast script:`

        const { text: summary } = await generateText({
          model: "openai/gpt-4-turbo",
          prompt,
          maxOutputTokens: 1000,
          temperature: 0.7,
        })

        // 3. Generate TTS audio (Intro + Body + Outro + optional ads)
        const { audioUrl, script } = await generateStitchedPodcastAudio(summary, {
          includeAds: true,
          preRollAdText:
            "This episode of CommuteCast is brought to you by CommuteCast Pro. Upgrade for longer episodes and deeper dives into the stories you care about.",
          postRollAdText:
            "Enjoying CommuteCast? Share it with a friend and upgrade to Pro for an ad-free experience.",
        })

        // 4. Save episode to database
        const title = `Your CommuteCast for ${new Date().toLocaleDateString()}`
        const { data: episodeRows, error: episodeInsertError } = await supabase
          .from("episodes")
          .insert({
            user_id: userId,
            title,
            description: `Personalized news for topics: ${topics.join(", ")}`,
            audio_url: audioUrl,
            summary: script,
            topics,
            generated_at: new Date().toISOString(),
          })
          .select()

        if (episodeInsertError || !episodeRows || episodeRows.length === 0) {
          console.error("Failed to insert episode:", episodeInsertError)
          continue
        }

        const episode = episodeRows[0]

        // 5. Send email with podcast via Resend
        await sendEpisodeEmail({
          to: userEmail,
          audioUrl,
          summary,
          episodeTitle: title,
        })

        // Mark as sent
        await supabase.from("episodes").update({ sent_at: new Date().toISOString() }).eq("id", episode.id)

        processed++
      } catch (err) {
        console.error(`Error generating episode for user ${userId}:`, err)
        // Continue with next user
      }
    }

    return Response.json({ success: true, processed })
  } catch (error) {
    console.error("Cron job error:", error)
    return Response.json({ error: "Failed to generate episodes" }, { status: 500 })
  }
}
