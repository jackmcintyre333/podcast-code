import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

const envPath = path.resolve(__dirname, "../.env.local");
console.log("Loading env from:", envPath);

if (fs.existsSync(envPath)) {
    console.log(".env.local exists");
    dotenv.config({ path: envPath });
} else {
    console.log(".env.local does NOT exist");
}

console.log("SUPABASE_URL set:", !!process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log("SUPABASE_SERVICE_ROLE_KEY set:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);
console.log("OPENAI_API_KEY set:", !!process.env.OPENAI_API_KEY);
