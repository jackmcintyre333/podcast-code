import { config } from "dotenv"
import { NewsService } from "../lib/news/news-service"

// Load .env.local file
config({ path: ".env.local" })

async function main() {
    console.log("Testing News Aggregation Engine...")
    console.log(`NewsAPI Key Status: ${process.env.NEWS_API_KEY ? "✅ Loaded" : "❌ Missing"}`)

    const newsService = new NewsService()
    const topics = ["Technology", "Space Exploration"]

    console.log(`Fetching news for topics: ${topics.join(", ")}`)

    try {
        const articles = await newsService.fetchNewsForTopics(topics)

        console.log(`\nSuccessfully fetched ${articles.length} articles.`)

        if (articles.length > 0) {
            console.log("\nSample Articles:")
            articles.slice(0, 3).forEach((article, i) => {
                console.log(`\n${i + 1}. ${article.title}`)
                console.log(`   Source: ${article.source}`)
                console.log(`   URL: ${article.url}`)
            })
        } else {
            console.log("\nNo articles found. Check your internet connection or API keys.")
        }
    } catch (error) {
        console.error("Error testing news service:", error)
    }
}

main()
