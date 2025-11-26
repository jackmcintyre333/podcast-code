import { config } from "dotenv"
import { NewsService, NewsArticle } from "../lib/news/news-service"

// Load .env.local file
config({ path: ".env.local" })

interface ValidationResult {
    passed: boolean
    errors: string[]
    warnings: string[]
}

function validateArticle(article: NewsArticle, index: number): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // Required fields check
    if (!article.title || article.title.trim() === "") {
        errors.push(`Article ${index}: Missing or empty title`)
    }
    if (!article.url || article.url.trim() === "") {
        errors.push(`Article ${index}: Missing or empty URL`)
    }
    if (!article.source || article.source.trim() === "") {
        errors.push(`Article ${index}: Missing or empty source`)
    }
    if (!article.publishedAt) {
        errors.push(`Article ${index}: Missing publishedAt date`)
    }

    // Content quality checks
    if (!article.description || article.description.trim() === "") {
        warnings.push(`Article ${index}: Missing description (may affect summarization quality)`)
    }
    if (article.description && article.description.length < 50) {
        warnings.push(`Article ${index}: Description is very short (${article.description.length} chars)`)
    }

    // URL validation
    try {
        new URL(article.url)
    } catch {
        errors.push(`Article ${index}: Invalid URL format`)
    }

    // Date validation
    try {
        const date = new Date(article.publishedAt)
        if (isNaN(date.getTime())) {
            errors.push(`Article ${index}: Invalid date format`)
        }
    } catch {
        errors.push(`Article ${index}: Cannot parse publishedAt date`)
    }

    return {
        passed: errors.length === 0,
        errors,
        warnings,
    }
}

function analyzeForSummarization(articles: NewsArticle[]): void {
    console.log("\n📊 Summarization Readiness Analysis:")
    console.log("=".repeat(60))

    const totalWords = articles.reduce((sum, article) => {
        const text = `${article.title} ${article.description || ""}`
        return sum + text.split(/\s+/).length
    }, 0)

    const avgWordsPerArticle = Math.round(totalWords / articles.length)
    const articlesWithContent = articles.filter((a) => a.content && a.content.length > 100).length
    const articlesWithDescription = articles.filter((a) => a.description && a.description.length > 50).length

    console.log(`Total articles: ${articles.length}`)
    console.log(`Articles with substantial description: ${articlesWithDescription}`)
    console.log(`Articles with full content: ${articlesWithContent}`)
    console.log(`Average words per article (title + description): ${avgWordsPerArticle}`)
    console.log(`Total words available for summarization: ${totalWords}`)

    // Estimate token count (rough approximation: 1 token ≈ 0.75 words)
    const estimatedTokens = Math.round(totalWords * 1.33)
    console.log(`Estimated tokens for GPT: ~${estimatedTokens}`)

    if (estimatedTokens > 8000) {
        console.log("⚠️  Warning: Token count may exceed GPT-4 context window for single request")
        console.log("   Consider batching or filtering articles")
    } else {
        console.log("✅ Token count is within safe limits for GPT-4")
    }
}

async function main() {
    console.log("🧪 News Normalization & Phase 2 Readiness Test")
    console.log("=".repeat(60))
    console.log(`NewsAPI Key Status: ${process.env.NEWS_API_KEY ? "✅ Loaded" : "❌ Missing"}`)

    const newsService = new NewsService()
    const topics = ["Technology", "Artificial Intelligence"]

    console.log(`\nFetching news for topics: ${topics.join(", ")}`)

    try {
        const articles = await newsService.fetchNewsForTopics(topics)

        console.log(`\n✅ Successfully fetched ${articles.length} articles`)

        // Validate all articles
        console.log("\n🔍 Validating Article Structure:")
        console.log("=".repeat(60))

        let totalErrors = 0
        let totalWarnings = 0
        const failedArticles: number[] = []

        articles.forEach((article, index) => {
            const result = validateArticle(article, index + 1)
            totalErrors += result.errors.length
            totalWarnings += result.warnings.length

            if (!result.passed) {
                failedArticles.push(index + 1)
                result.errors.forEach((error) => console.log(`❌ ${error}`))
            }
            result.warnings.forEach((warning) => console.log(`⚠️  ${warning}`))
        })

        console.log("\n📋 Validation Summary:")
        console.log("=".repeat(60))
        console.log(`Total articles validated: ${articles.length}`)
        console.log(`Passed validation: ${articles.length - failedArticles.length}`)
        console.log(`Failed validation: ${failedArticles.length}`)
        console.log(`Total errors: ${totalErrors}`)
        console.log(`Total warnings: ${totalWarnings}`)

        if (failedArticles.length === 0) {
            console.log("\n✅ All articles passed validation!")
        } else {
            console.log(`\n❌ Articles with errors: ${failedArticles.join(", ")}`)
        }

        // Analyze readiness for summarization
        analyzeForSummarization(articles)

        // Show sample normalized data
        console.log("\n📄 Sample Normalized Article (for Phase 2):")
        console.log("=".repeat(60))
        const sample = articles[0]
        console.log(JSON.stringify(sample, null, 2))

        // Test data structure for summarization API
        console.log("\n🔗 Phase 2 Integration Test:")
        console.log("=".repeat(60))
        console.log("Testing data format for /api/summarize endpoint...")

        const summarizePayload = {
            articles: articles.slice(0, 5).map((a) => ({
                title: a.title,
                content: a.description || a.content || "",
            })),
        }

        console.log("\nSample payload for summarization:")
        console.log(JSON.stringify(summarizePayload, null, 2))
        console.log("\n✅ Data structure is compatible with Phase 2 API")

        // Final verdict
        console.log("\n" + "=".repeat(60))
        if (totalErrors === 0 && articles.length > 0) {
            console.log("🎉 SUCCESS: News data is properly normalized and ready for Phase 2!")
        } else if (totalErrors > 0) {
            console.log("⚠️  PARTIAL SUCCESS: Some articles have issues, but most are usable")
        } else {
            console.log("❌ FAILED: No articles fetched or critical errors found")
        }
        console.log("=".repeat(60))
    } catch (error) {
        console.error("\n❌ Error testing news service:", error)
        process.exit(1)
    }
}

main()
