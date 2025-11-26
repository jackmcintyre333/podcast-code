import Parser from "rss-parser"
import { NewsArticle, NewsProvider } from "../news-service"

export class RssFeedProvider implements NewsProvider {
    private parser: Parser

    constructor() {
        this.parser = new Parser()
    }

    async fetchNews(topic: string): Promise<NewsArticle[]> {
        try {
            // Google News RSS URL
            const feedUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(topic)}&hl=en-US&gl=US&ceid=US:en`

            const feed = await this.parser.parseURL(feedUrl)

            return feed.items.map((item) => ({
                title: item.title || "",
                description: item.contentSnippet || item.content || "",
                url: item.link || "",
                source: item.source || "Google News",
                publishedAt: item.pubDate || new Date().toISOString(),
                content: item.content,
            }))
        } catch (error) {
            console.error("RSS fetch error:", error)
            // Return empty array instead of throwing to allow other providers to try
            return []
        }
    }
}
