import { config } from "dotenv"

// Load .env.local file
const result = config({ path: ".env.local" })

console.log("Dotenv loading result:", result.error ? "ERROR" : "SUCCESS")

if (result.error) {
    console.error("Error loading .env.local:", result.error)
}

console.log("\n📋 Environment Variables Loaded:")
console.log("=".repeat(60))

const apiKey = process.env.OPENAI_API_KEY

console.log(`OPENAI_API_KEY exists: ${!!apiKey}`)
console.log(`OPENAI_API_KEY length: ${apiKey?.length || 0}`)
console.log(`OPENAI_API_KEY (first 10 chars): ${apiKey?.substring(0, 10) || "N/A"}`)
console.log(`OPENAI_API_KEY (last 10 chars): ${apiKey?.substring(apiKey.length - 10) || "N/A"}`)

// Check for whitespace
if (apiKey) {
    const trimmed = apiKey.trim()
    console.log(`\nWhitespace check:`)
    console.log(`  Original length: ${apiKey.length}`)
    console.log(`  Trimmed length: ${trimmed.length}`)
    console.log(`  Has leading whitespace: ${apiKey !== apiKey.trimStart()}`)
    console.log(`  Has trailing whitespace: ${apiKey !== apiKey.trimEnd()}`)

    // Check for invisible characters
    const hasInvisible = /[\x00-\x1F\x7F-\x9F]/.test(apiKey)
    console.log(`  Has invisible characters: ${hasInvisible}`)

    // Show character codes for first and last few characters
    console.log(`\nCharacter codes (first 5):`)
    for (let i = 0; i < Math.min(5, apiKey.length); i++) {
        console.log(`    [${i}]: '${apiKey[i]}' (code: ${apiKey.charCodeAt(i)})`)
    }

    console.log(`\nCharacter codes (last 5):`)
    for (let i = Math.max(0, apiKey.length - 5); i < apiKey.length; i++) {
        console.log(`    [${i}]: '${apiKey[i]}' (code: ${apiKey.charCodeAt(i)})`)
    }
}

console.log("\n" + "=".repeat(60))
console.log("✅ Diagnostic complete!")
