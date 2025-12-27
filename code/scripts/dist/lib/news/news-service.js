"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsService = void 0;
const news_api_1 = require("./providers/news-api");
const rss_feed_1 = require("./providers/rss-feed");
class NewsService {
    constructor() {
        // Initialize providers
        // Priority: NewsAPI -> RSS Fallback
        this.providers = [new news_api_1.NewsApiProvider(), new rss_feed_1.RssFeedProvider()];
    }
    async fetchNewsForTopics(topics) {
        const allArticles = [];
        const seenUrls = new Set();
        for (const topic of topics) {
            let topicArticles = [];
            // Try each provider until we get results
            for (const provider of this.providers) {
                try {
                    const articles = await provider.fetchNews(topic);
                    if (articles.length > 0) {
                        topicArticles = articles;
                        break; // Stop at the first provider that returns results
                    }
                }
                catch (error) {
                    console.error(`Error fetching news for topic "${topic}" from provider:`, error);
                    // Continue to next provider
                }
            }
            // Add unique articles
            for (const article of topicArticles) {
                if (!seenUrls.has(article.url)) {
                    seenUrls.add(article.url);
                    allArticles.push(article);
                }
            }
        }
        return allArticles;
    }
}
exports.NewsService = NewsService;
