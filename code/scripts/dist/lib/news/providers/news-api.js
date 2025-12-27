"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsApiProvider = void 0;
class NewsApiProvider {
    constructor() {
        this.baseUrl = "https://newsapi.org/v2";
        this.apiKey = process.env.NEWS_API_KEY || "";
    }
    async fetchNews(topic) {
        if (!this.apiKey) {
            console.warn("NewsAPI key is missing. Skipping NewsAPI provider.");
            return [];
        }
        try {
            // Fetch top headlines or everything based on topic
            // Using 'everything' for broader topic coverage, sorted by relevancy
            const response = await fetch(`${this.baseUrl}/everything?q=${encodeURIComponent(topic)}&language=en&sortBy=relevancy&pageSize=5&apiKey=${this.apiKey}`, { next: { revalidate: 3600 } } // Cache for 1 hour
            );
            if (!response.ok) {
                throw new Error(`NewsAPI failed with status ${response.status}`);
            }
            const data = await response.json();
            if (data.status !== "ok") {
                throw new Error(`NewsAPI error: ${data.message}`);
            }
            return data.articles.map((article) => ({
                title: article.title,
                description: article.description || "",
                url: article.url,
                source: article.source.name,
                publishedAt: article.publishedAt,
                content: article.content,
            }));
        }
        catch (error) {
            console.error("NewsAPI fetch error:", error);
            throw error;
        }
    }
}
exports.NewsApiProvider = NewsApiProvider;
