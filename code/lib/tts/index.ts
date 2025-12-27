import OpenAI from "openai"
import { createClient } from "@supabase/supabase-js"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"

/**
 * Types for podcast TTS and stitching
 */
export type PodcastSegmentType = "intro" | "body" | "outro" | "ad-pre" | "ad-mid" | "ad-post"

export interface DialogueSegment {
  speaker: "Host 1" | "Host 2"
  text: string
}

export interface PodcastTtsOptions {
  voice?: string // Fallback single voice
  voice1?: string // Host 1
  voice2?: string // Host 2
  model?: string
  includeAds?: boolean
  preRollAdText?: string
  midRollAdText?: string
  postRollAdText?: string
}

export interface GeneratedPodcastAudio {
  audioUrl: string
  script: string | DialogueSegment[]
}

/**
 * Build a full podcast script from a body summary and optional ads.
 * This handles Intro + Body + Outro + Ads at the text level.
 * @deprecated Use generateDialogueAudio for multi-host support
 */
export function buildPodcastScript(summary: string, opts: PodcastTtsOptions = {}): string {
  const parts: string[] = []

  // Intro
  const intro =
    "Good morning, this is your CommuteCast daily briefing. Let's dive into today's top stories curated just for you."
  parts.push(intro)

  // Pre-roll ad
  if (opts.includeAds && opts.preRollAdText) {
    parts.push(opts.preRollAdText)
  }

  // Body (AI-generated summary)
  parts.push(summary)

  // Mid-roll ad
  if (opts.includeAds && opts.midRollAdText) {
    parts.push(opts.midRollAdText)
  }

  // Outro
  const outro =
    "That's it for today's CommuteCast. Thanks for listening, and have a safe and productive day ahead."
  parts.push(outro)

  // Post-roll ad
  if (opts.includeAds && opts.postRollAdText) {
    parts.push(opts.postRollAdText)
  }

  return parts.join("\n\n")
}

/**
 * Generate TTS audio for a full podcast script using OpenAI Audio (TTS).
 */
export async function generatePodcastAudioFromScript(
  script: string,
  opts: PodcastTtsOptions = {},
): Promise<GeneratedPodcastAudio> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured")
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })

  const response = await openai.audio.speech.create({
    model: opts.model ?? "gpt-4o-mini-tts",
    voice: (opts.voice ?? "alloy") as any,
    input: script,
    response_format: "mp3",
  })

  // @ts-ignore
  const audioBuffer = Buffer.from(await response.arrayBuffer())
  const uploadedUrl = await uploadAudioToSupabase(audioBuffer)

  return {
    audioUrl: uploadedUrl,
    script,
  }
}

/**
 * Generate stitched audio from a dialogue script (Host 1 / Host 2).
 */
export async function generateDialogueAudio(
  dialogue: DialogueSegment[],
  opts: PodcastTtsOptions = {}
): Promise<GeneratedPodcastAudio> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured")
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })

  const voice1 = (opts.voice1 ?? "alloy") as any
  const voice2 = (opts.voice2 ?? "echo") as any
  const model = opts.model ?? "gpt-4o-mini-tts"

  const audioBuffers: Buffer[] = []

  // 1. Add Pre-roll Ad if requested (Host 1 reads it by default)
  if (opts.includeAds && opts.preRollAdText) {
    const resp = await openai.audio.speech.create({
      model,
      voice: voice1,
      input: opts.preRollAdText,
      response_format: "mp3",
    })
    // @ts-ignore
    audioBuffers.push(Buffer.from(await resp.arrayBuffer()))
  }

  // 2. Generate audio for each dialogue segment
  for (const segment of dialogue) {
    const voice = segment.speaker === "Host 2" ? voice2 : voice1

    // Add a small pause? For simple concatenation, new files usually sound okay, 
    // but silence frames could be added. For now, simple concatenation.
    try {
      const resp = await openai.audio.speech.create({
        model,
        voice,
        input: segment.text,
        response_format: "mp3",
      })
      // @ts-ignore
      audioBuffers.push(Buffer.from(await resp.arrayBuffer()))
    } catch (err) {
      console.error(`Error generating TTS for segment "${segment.text.substring(0, 20)}..."`, err)
    }
  }

  // 3. Add Post-roll Ad (Host 1 reads it)
  if (opts.includeAds && opts.postRollAdText) {
    const resp = await openai.audio.speech.create({
      model,
      voice: voice1,
      input: opts.postRollAdText,
      response_format: "mp3",
    })
    // @ts-ignore
    audioBuffers.push(Buffer.from(await resp.arrayBuffer()))
  }

  // 4. Concat all buffers
  const finalBuffer = Buffer.concat(audioBuffers)
  const uploadedUrl = await uploadAudioToSupabase(finalBuffer)

  return {
    audioUrl: uploadedUrl,
    script: dialogue,
  }
}

/**
 * High-level helper: given a body summary, build full script (intro/body/outro/ads)
 * and generate a single stitched audio file.
 */
export async function generateStitchedPodcastAudio(
  summary: string,
  opts: PodcastTtsOptions = {},
): Promise<GeneratedPodcastAudio> {
  // If summary looks like JSON, try to parse it as dialogue
  // This is a loose check to bridge the gap if we pass raw JSON-string
  try {
    const parsed = JSON.parse(summary)
    if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].speaker) {
      return generateDialogueAudio(parsed as DialogueSegment[], opts)
    }
  } catch (e) {
    // Not JSON, proceed as single string
  }

  const script = buildPodcastScript(summary, opts)
  return generatePodcastAudioFromScript(script, opts)
}

/**
 * Upload the generated audio to Supabase Storage and return a public URL.
 * Falls back to a data URL if storage is not configured.
 */
async function uploadAudioToSupabase(buffer: Buffer): Promise<string> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const bucket = process.env.SUPABASE_EPISODES_BUCKET || "episodes"

  if (!supabaseUrl || !serviceRoleKey) {
    console.warn(
      "Supabase Storage not configured (missing URL or Service Role Key). Returning data URL instead of uploading."
    )
    const base64 = buffer.toString("base64")
    return `data:audio/mp3;base64,${base64}`
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })

  // Ensure file size is acceptable or handle large files? 
  // OpenAI TTS returns small files usually, but stitched might be larger.
  // Standard limits apply.

  const fileName = `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.mp3`

  // ⬅️ FIXED: No nested "episodes/" folder — upload directly to the bucket root
  const filePath = fileName

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, buffer, {
      contentType: "audio/mpeg",
      upsert: false,
    })

  if (error) {
    console.error("Failed to upload audio to Supabase Storage:", error)
    const base64 = buffer.toString("base64")
    return `data:audio/mp3;base64,${base64}`
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(filePath)

  return publicUrl
}




