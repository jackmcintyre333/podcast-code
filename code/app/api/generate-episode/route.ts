import { createClient } from "@/lib/supabase/server"
import { NewsService } from "@/lib/news/news-service"
import { generateStitchedPodcastAudio } from "@/lib/tts"
import { sendEpisodeEmail } from "@/lib/email/resend"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export const maxDuration = 60

export async function POST(req: Request) {
    try {
        const supabase = await createClient()

        // 1. Authenticate user
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return Response.json({ error: "Unauthorized" }, { status: 401 })
        }

        // 2. Get preferences from request body
        const { topics, length } = await req.json()

        if (!topics || !Array.isArray(topics) || topics.length === 0) {
            return Response.json({ error: "Topics are required" }, { status: 400 })
        }

        console.log(`Generating on-demand episode for user: ${user.id} with topics: ${topics.join(", ")}`)

        // 3. Fetch news articles
        const newsService = new NewsService()
        const articles = await newsService.fetchNewsForTopics(topics)

        if (!articles || articles.length === 0) {
            return Response.json({ error: "No articles found for selected topics" }, { status: 404 })
        }

        // 4. Summarize with AI
        // 4. Chunked Generation Logic
        const BATCH_SIZE = 3
        const chunkedDialogue: any[] = []

        // Calculate target words per minute based on user feedback (320 words = ~1 min) 
        // Note: User said 1600 words = 5 mins, so 320 wpm.
        const WORDS_PER_MINUTE = 320
        const totalMinutes = length || 2 // default to 2 mins if not set

        // Iterate through articles in batches
        for (let i = 0; i < articles.length; i += BATCH_SIZE) {
            const batchArticles = articles.slice(i, i + BATCH_SIZE)
            const isFirstBatch = i === 0
            const isLastBatch = i + BATCH_SIZE >= articles.length

            const batchArticlesText = batchArticles.map((a, j) =>
                `${j + 1}. ${a.title}\nSource: ${a.source}\nSummary: ${a.description || ""}`
            ).join("\n\n")

            // Calculate target length for this chunk
            // Distribute total time roughly across batches? 
            // Or just ensure we have enough content.
            // Let's aim for ~2-3 mins per chunk (600-900 words) to verify stability.
            // Or typically 3 articles might take 2-3 mins to discuss.
            const targetChunkWords = BATCH_SIZE * 200 // Approx 600 words for 3 articles

            let contextInstruction = ""
            if (isFirstBatch) {
                contextInstruction = "Start the show. Introduce the hosts (Host 1 and Host 2) and welcome the listeners to CommuteCast. Then transition into the first story."
            } else if (isLastBatch) {
                contextInstruction = "Continue the conversation seamlessly from the previous topics. Cover these final stories. then wrap up the show, thank the listeners, and sign off."
            } else {
                contextInstruction = "Continue the conversation seamlessly. Transition from the previous segment into these new stories. Keep the flow natural."
            }

            const prompt = `You are a professional podcast producer. Create a dialogue script between two hosts, "Host 1" (main anchor, professional but warm) and "Host 2" (co-host, curious and conversational).

Context: ${contextInstruction}

Requirements:
- Format: JSON array of objects with "speaker" ("Host 1" or "Host 2") and "text" fields.
- Length: Target approximately ${targetChunkWords} words for this segment.
- Tone: Natural, engaging, conversational. Use filler words like "uh", "you know", "interesting" where appropriate to sound human.
- Content: Discuss the provided articles in depth.
- Host 1 leads, Host 2 adds color/questions/reactions.
- Do NOT include any ads, sponsorship messages, or commercial breaks.

Articles for this segment:
${batchArticlesText}

Output only the JSON array. Do not wrap in markdown code blocks.`

            try {
                const { text: rawSummary } = await generateText({
                    model: openai("gpt-4o"),
                    prompt,
                })

                let summary = rawSummary.replace(/```json\n?|\n?```/g, "").trim();
                const start = summary.indexOf('[');
                const end = summary.lastIndexOf(']');
                if (start !== -1 && end !== -1) {
                    summary = summary.substring(start, end + 1);
                    const parsedFn = JSON.parse(summary)
                    chunkedDialogue.push(...parsedFn)
                }
            } catch (err) {
                console.error(`Error generating chunk ${i}:`, err)
                // Continue to next chunk if one fails, effectively skipping those stories
            }
        }

        // 5. Generate TTS audio from collected dialogue
        if (chunkedDialogue.length === 0) {
            throw new Error("Failed to generate any dialogue segments")
        }

        const { audioUrl, script } = await generateStitchedPodcastAudio(JSON.stringify(chunkedDialogue), {
            includeAds: false,
            voice1: "alloy",
            voice2: "echo",
        })

        // 6. Save episode to database
        const title = `On-Demand: ${topics.slice(0, 2).join(", ")} & more`

        // Ensure we save the script as a string (it might be an object if we parsed it in TTS)
        const scriptContent = typeof script === 'string' ? script : JSON.stringify(script)

        const { data: episodeRows, error: episodeInsertError } = await supabase
            .from("episodes")
            .insert({
                user_id: user.id,
                title,
                description: `On-demand generation for topics: ${topics.join(", ")}`,
                audio_url: audioUrl,
                summary: scriptContent, // Save the JSON dialogue or readable script
                topics,
                generated_at: new Date().toISOString(),
            })
            .select()

        if (episodeInsertError || !episodeRows || episodeRows.length === 0) {
            console.error("Failed to insert episode:", episodeInsertError)
            throw new Error("Failed to save episode record")
        }

        const episode = episodeRows[0]

        // 7. Send email (optional for on-demand, but good for record)
        if (user.email) {
            await sendEpisodeEmail({
                to: user.email,
                audioUrl,
                summary: "Your personalized news podcast is ready.", // Simplified summary for email
                episodeTitle: title,
            }).catch(err => console.error("Failed to send email:", err))
        }

        return Response.json({ success: true, episodeId: episode.id, audioUrl })

    } catch (error) {
        console.error("On-demand generation error:", error)
        return Response.json({ error: "Failed to generate episode" }, { status: 500 })
    }
}
