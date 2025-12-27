export const maxDuration = 60
import { generatePodcastAudioFromScript } from "@/lib/tts"

export async function POST(req: Request) {
  try {
    const { text } = await req.json()

    if (!text) {
      return Response.json({ error: "Text required" }, { status: 400 })
    }

    // For MVP, we'll return a placeholder URL and integration points
    // In production, integrate with Play.ht or Azure TTS

    const audioUrl = await generateAudioWithTTS(text)

    return Response.json({ audioUrl })
  } catch (error) {
    console.error("TTS generation error:", error)
    return Response.json({ error: "Failed to generate audio" }, { status: 500 })
  }
}

async function generateAudioWithTTS(text: string): Promise<string> {
  // Use OpenAI TTS via lib/tts and upload to Supabase Storage
  try {
    const { audioUrl } = await generatePodcastAudioFromScript(text);
    return audioUrl;
  } catch (err) {
    console.error("TTS generation failed:", err);
    throw err;
  }
}
