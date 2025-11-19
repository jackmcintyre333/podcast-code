import { generateText } from "ai"

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { articles } = await req.json()

    if (!articles || !Array.isArray(articles) || articles.length === 0) {
      return Response.json({ error: "Articles array required" }, { status: 400 })
    }

    const articlesText = articles.map((a, i) => `${i + 1}. ${a.title}\n${a.content}`).join("\n\n")

    const prompt = `You are a professional news summarizer. Summarize the following articles into a cohesive, engaging narrative that would work well as a podcast script. Make it conversational and around 300-400 words. Include key facts but keep the tone engaging and accessible.

Articles:
${articlesText}

Please provide a podcast script that flows naturally and captures the essence of these stories.`

    const { text } = await generateText({
      model: "openai/gpt-4-turbo",
      prompt,
      maxOutputTokens: 1000,
      temperature: 0.7,
    })

    return Response.json({ summary: text })
  } catch (error) {
    console.error("Summarization error:", error)
    return Response.json({ error: "Failed to summarize articles" }, { status: 500 })
  }
}
