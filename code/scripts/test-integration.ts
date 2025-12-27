import { createClient } from "@supabase/supabase-js";
import { NewsService } from "../lib/news/news-service";
import { generateStitchedPodcastAudio } from "../lib/tts";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

async function runIntegrationTest() {
    console.log("🚀 Starting Full Integration Test...");

    // 1. Setup Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        console.error("❌ Missing Supabase credentials in .env.local");
        process.exit(1);
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // 2. Get a Test User
    console.log("👤 Fetching a test user...");
    // Try to find a user from user_profiles or just use a placeholder if we can't list them
    // We'll try to insert with a random UUID if we can't find one, but ideally we want a real one.
    // Let's try to fetch one from user_profiles if it exists and is accessible.
    const { data: users, error: userError } = await supabase
        .from("user_profiles")
        .select("id")
        .limit(1);

    let userId = "00000000-0000-0000-0000-000000000000"; // Fallback dummy UUID
    if (users && users.length > 0) {
        userId = users[0].id;
        console.log(`✅ Using existing user ID: ${userId}`);
    } else {
        console.warn("⚠️ No users found in user_profiles. Using dummy UUID (insert might fail if FK exists).");
        console.warn("Error details if any:", userError);
    }

    // 3. Fetch News
    const topic = "business";
    console.log(`\n📰 Fetching news for topic: "${topic}"...`);
    const newsService = new NewsService();
    const articles = await newsService.fetchNewsForTopics([topic]);

    if (!articles || articles.length === 0) {
        console.error("❌ No articles found. Check your NEWS_API_KEY.");
        process.exit(1);
    }
    console.log(`✅ Found ${articles.length} articles.`);

    // 4. Summarize with AI
    console.log("\n🧠 Summarizing articles...");
    const articlesText = articles.slice(0, 3).map((a, i) =>
        `${i + 1}. ${a.title}\nSource: ${a.source}\nSummary: ${a.description || ""}`
    ).join("\n\n");

    const prompt = `Summarize these ${topic} news stories into a short, engaging podcast script (approx 100 words).
  
  Stories:
  ${articlesText}`;

    const { text: summary } = await generateText({
        model: openai("gpt-4o"), // Use the provider instance
        prompt: prompt,
    });

    console.log("✅ Summary generated:");
    console.log(summary.substring(0, 100) + "...");

    // 5. Generate Audio (TTS)
    console.log("\n🗣️ Generating Audio (TTS) and Uploading...");
    const { audioUrl, script } = await generateStitchedPodcastAudio(summary, {
        includeAds: false
    });

    console.log(`✅ Audio uploaded to: ${audioUrl}`);

    // 6. Save to Database
    console.log("\n💾 Saving episode to database...");
    const title = `Integration Test: ${topic} News`;

    const { data, error } = await supabase
        .from("episodes")
        .insert({
            user_id: userId,
            title: title,
            description: `Test episode for topic: ${topic}`,
            audio_url: audioUrl,
            summary: script,
            topics: [topic],
            generated_at: new Date().toISOString(),
        })
        .select();

    if (error) {
        console.error("❌ Failed to save episode:", error);
    } else {
        console.log("✅ Episode saved successfully!");
        console.log("Episode ID:", data[0].id);
    }
}

runIntegrationTest();
