import { NewsApiProvider } from "./providers/news-api"
import { RssFeedProvider } from "./providers/rss-feed"

export interface NewsArticle {
  title: string
  description: string
  url: string
  source: string
  publishedAt: string
  content?: string
}

export interface NewsProvider {
  fetchNews(topic: string): Promise<NewsArticle[]>
}

export class NewsService {
  private providers: NewsProvider[]

  constructor() {
    // Initialize providers
    // Priority: NewsAPI -> RSS Fallback
    this.providers = [new NewsApiProvider(), new RssFeedProvider()]
  }

  async fetchNewsForTopics(topics: string[]): Promise<NewsArticle[]> {
    const allArticles: NewsArticle[] = []
    const seenUrls = new Set<string>()

    for (const topic of topics) {
      let topicArticles: NewsArticle[] = []

      // Try each provider until we get results
      for (const provider of this.providers) {
        try {
          const articles = await provider.fetchNews(topic)
          if (articles.length > 0) {
            topicArticles = articles
            break // Stop at the first provider that returns results
          }
        } catch (error) {
          console.error(`Error fetching news for topic "${topic}" from provider:`, error)
          // Continue to next provider
        }
      }

      // Add unique articles
      for (const article of topicArticles) {
        if (!seenUrls.has(article.url)) {
          seenUrls.add(article.url)
          allArticles.push(article)
        }
      }
    }

    return allArticles
  }
}
