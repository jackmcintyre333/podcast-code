import { config } from "dotenv"
import { NewsService } from "../lib/news/news-service"
import OpenAI from "openai"

// Load .env.local file
config({ path: ".env.local" })

async function testSummarization() {
    console.log("🎙️  News Summarization Test")
    console.log("=".repeat(60))

    // Debug: Show what's loaded
    console.log("\n🔍 Debug Info:")
    console.log(`OPENAI_API_KEY exists: ${!!process.env.OPENAI_API_KEY}`)
    console.log(`OPENAI_API_KEY length: ${process.env.OPENAI_API_KEY?.length || 0}`)
    console.log(`OPENAI_API_KEY starts with: ${process.env.OPENAI_API_KEY?.substring(0, 7) || "N/A"}`)

    console.log(`\nOpenAI Key Status: ${process.env.OPENAI_API_KEY ? "✅ Loaded" : "❌ Missing"}`)
    console.log(`NewsAPI Key Status: ${process.env.NEWS_API_KEY ? "✅ Loaded" : "❌ Missing (using RSS)"}`)

    if (!process.env.OPENAI_API_KEY) {
        console.error("\n❌ Error: OPENAI_API_KEY not found in .env.local")
        console.error("Please add your OpenAI API key to .env.local:")
        console.error("OPENAI_API_KEY=sk-...")
        process.exit(1)
    }

    // Step 1: Fetch news articles
    console.log("\n📰 Step 1: Fetching News Articles...")
    console.log("-".repeat(60))

    const newsService = new NewsService()
    const topics = ["Technology", "Artificial Intelligence"]

    try {
        const articles = await newsService.fetchNewsForTopics(topics)
        console.log(`✅ Fetched ${articles.length} articles`)

        // Show sample articles
        console.log("\n📋 Sample Articles to Summarize:")
        console.log("-".repeat(60))
        articles.slice(0, 5).forEach((article, i) => {
            console.log(`\n${i + 1}. ${article.title}`)
            console.log(`   Source: ${article.source}`)
            console.log(`   Description: ${article.description?.substring(0, 100)}...`)
        })

        // Step 2: Generate summarization
        console.log("\n\n🤖 Step 2: Generating AI Podcast Script...")
        console.log("-".repeat(60))

        const articlesForSummary = articles.slice(0, 5).map((a) => ({
            title: a.title,
            content: a.description || a.content || "",
        }))

        const articlesText = articlesForSummary.map((a, i) => `${i + 1}. ${a.title}\n${a.content}`).join("\n\n")

        const prompt = `You are a professional news podcast host. Create an engaging podcast script from the following articles. 

Requirements:
- Start with a warm, conversational greeting
- Summarize the key stories in a natural, flowing narrative
- Keep it around 300-400 words
- Use a friendly, accessible tone
- End with a brief sign-off

Articles:
${articlesText}

Generate the podcast script:`

        console.log("Calling OpenAI GPT-4...")

        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY?.trim(),
        })

        const completion = await openai.chat.completions.create({
            model: "gpt-4-turbo-preview",
            messages: [
                {
                    role: "system",
                    content: "You are a professional news podcast host who creates engaging, conversational podcast scripts.",
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
            max_tokens: 1000,
            temperature: 0.7,
        })

        const text = completion.choices[0].message.content || ""

        console.log("\n✅ Summarization Complete!")

        // Display the result
        console.log("\n" + "=".repeat(60))
        console.log("📄 GENERATED PODCAST SCRIPT")
        console.log("=".repeat(60))
        console.log("\n" + text)
        console.log("\n" + "=".repeat(60))

        // Statistics
        const wordCount = text.split(/\s+/).length
        const estimatedDuration = Math.round((wordCount / 150) * 60) // ~150 words per minute

        console.log("\n📊 Script Statistics:")
        console.log("-".repeat(60))
        console.log(`Word count: ${wordCount}`)
        console.log(`Estimated reading time: ${estimatedDuration} seconds (~${Math.round(estimatedDuration / 60)} min)`)
        console.log(`Character count: ${text.length}`)
        console.log(`Tokens used: ${completion.usage?.total_tokens || "N/A"}`)

        console.log("\n✅ Test Complete!")
    } catch (error) {
        console.error("\n❌ Error:", error)
        if (error instanceof Error) {
            console.error("Error message:", error.message)
        }
        process.exit(1)
    }
}

testSummarization()
