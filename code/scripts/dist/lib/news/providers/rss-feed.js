"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RssFeedProvider = void 0;
const rss_parser_1 = require("rss-parser");
class RssFeedProvider {
    constructor() {
        this.parser = new rss_parser_1.default();
    }
    async fetchNews(topic) {
        try {
            // Google News RSS URL
            const feedUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(topic)}&hl=en-US&gl=US&ceid=US:en`;
            const feed = await this.parser.parseURL(feedUrl);
            return feed.items.map((item) => ({
                title: item.title || "",
                description: item.contentSnippet || item.content || "",
                url: item.link || "",
                source: item.source || "Google News",
                publishedAt: item.pubDate || new Date().toISOString(),
                content: item.content,
            }));
        }
        catch (error) {
            console.error("RSS fetch error:", error);
            // Return empty array instead of throwing to allow other providers to try
            return [];
        }
    }
}
exports.RssFeedProvider = RssFeedProvider;
