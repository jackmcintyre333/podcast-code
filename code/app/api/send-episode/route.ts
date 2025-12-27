import { createClient } from "@/lib/supabase/server"
import { sendEpisodeEmail } from "@/lib/email/resend"

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { userId, episodeId } = await req.json()

    if (!userId || !episodeId) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createClient()

    // Fetch user email and episode details
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("email")
      .eq("id", userId)
      .single()

    if (profileError || !profile?.email) {
      console.error("Failed to fetch user profile for email:", profileError)
      return Response.json({ error: "User email not found" }, { status: 400 })
    }

    const { data: episode, error: episodeError } = await supabase
      .from("episodes")
      .select("title, audio_url, summary")
      .eq("id", episodeId)
      .single()

    if (episodeError || !episode?.audio_url) {
      console.error("Failed to fetch episode for email:", episodeError)
      return Response.json({ error: "Episode not found" }, { status: 400 })
    }

    // Send email via Resend
    await sendEpisodeEmail({
      to: profile.email,
      audioUrl: episode.audio_url,
      summary: episode.summary ?? undefined,
      episodeTitle: episode.title ?? undefined,
    })

    // Update episode sent_at timestamp
    await supabase.from("episodes").update({ sent_at: new Date().toISOString() }).eq("id", episodeId)

    console.log("Email sent for episode:", episodeId)

    return Response.json({ success: true })
  } catch (error) {
    console.error("Email sending error:", error)
    return Response.json({ error: "Failed to send episode" }, { status: 500 })
  }
}
