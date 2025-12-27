import { generatePodcastAudioFromScript } from "../lib/tts";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

async function testTTS() {
    console.log("Testing TTS generation...");

    if (!process.env.OPENAI_API_KEY) {
        console.error("Error: OPENAI_API_KEY is not set in .env.local");
        process.exit(1);
    }

    try {
        const text = "This is a test of the CommuteCast text to speech system.";
        console.log(`Generating audio for: "${text}"`);

        const result = await generatePodcastAudioFromScript(text, {
            voice: "alloy",
            model: "tts-1",
        });

        // console.log("Success!");
        // console.log("Audio URL:", result.audioUrl);
        // console.log("Script:", result.script);

    } catch (error) {
        console.error("TTS generation failed:", error);
        process.exit(1);
    }
}

testTTS();
