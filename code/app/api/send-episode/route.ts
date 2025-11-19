import { createClient } from "@/lib/supabase/server"

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { userId, episodeId, audioUrl, summary } = await req.json()

    if (!userId || !episodeId || !audioUrl) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    // In production, integrate with Resend:
    // const { data, error } = await resend.emails.send({
    //   from: "CommuteCast <noreply@commutecast.com>",
    //   to: userEmail,
    //   subject: "Your Daily CommuteCast Podcast",
    //   html: emailTemplate(audioUrl, summary),
    // })

    console.log("Email sent for episode:", episodeId)

    // Update episode sent_at timestamp
    const supabase = await createClient()
    await supabase.from("episodes").update({ sent_at: new Date().toISOString() }).eq("id", episodeId)

    return Response.json({ success: true })
  } catch (error) {
    console.error("Email sending error:", error)
    return Response.json({ error: "Failed to send episode" }, { status: 500 })
  }
}
