import { Resend } from "resend"

if (!process.env.RESEND_API_KEY) {
  console.warn("RESEND_API_KEY is not set. Email delivery will be disabled.")
}

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

export interface SendEpisodeEmailParams {
  to: string
  audioUrl: string
  summary?: string
  episodeTitle?: string
}

export async function sendEpisodeEmail({
  to,
  audioUrl,
  summary,
  episodeTitle,
}: SendEpisodeEmailParams): Promise<void> {
  if (!resend || !process.env.EMAIL_FROM) {
    console.warn("Resend client or EMAIL_FROM not configured. Skipping email send.")
    return
  }

  const title = episodeTitle || "Your Daily CommuteCast Podcast"

  const html = `
    <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 24px;">
      <h1 style="font-size: 20px; margin-bottom: 12px;">${title}</h1>
      <p style="margin-bottom: 16px;">Your personalized AI-generated news podcast is ready.</p>
      <p style="margin-bottom: 16px;">
        <a href="${audioUrl}" style="background-color: #111827; color: #ffffff; padding: 10px 18px; border-radius: 6px; text-decoration: none;">
          ▶️ Listen to your episode
        </a>
      </p>
      ${
        summary
          ? `<div style="margin-top: 16px; padding: 12px 16px; border-radius: 8px; background: #f3f4f6;">
               <h2 style="font-size: 16px; margin-bottom: 8px;">Episode Summary</h2>
               <p style="font-size: 14px; line-height: 1.5; white-space: pre-line;">${summary}</p>
             </div>`
          : ""
      }
      <p style="margin-top: 24px; font-size: 12px; color: #6b7280;">
        You are receiving this email because you subscribed to CommuteCast.
      </p>
    </div>
  `

  await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to,
    subject: title,
    html,
  })
}



