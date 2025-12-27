import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("--- Debugging Supabase Auth ---");
console.log("URL:", supabaseUrl);
console.log("Key exists:", !!serviceRoleKey);

if (serviceRoleKey) {
    console.log("Key prefix:", serviceRoleKey.substring(0, 10) + "...");

    try {
        // Decode JWT payload (middle part)
        const payloadPart = serviceRoleKey.split('.')[1];
        if (payloadPart) {
            const payloadStr = Buffer.from(payloadPart, 'base64').toString();
            const payload = JSON.parse(payloadStr);
            console.log("Token Role:", payload.role);
            console.log("Token ISS:", payload.iss);

            if (payload.role !== 'service_role') {
                console.error("\n❌ WARNING: The provided key is NOT a service_role key. It has role: '" + payload.role + "'.");
                console.error("Please replace SUPABASE_SERVICE_ROLE_KEY with the actual Service Role key (secret) from your dashboard.");
            } else {
                console.log("\n✅ Key appears to be a valid service_role key.");
            }
        } else {
            console.error("Invalid JWT format.");
        }
    } catch (e) {
        console.error("Error decoding token:", e);
    }
}

async function checkStorage() {
    console.log("\n--- Checking Storage ---");
    if (!supabaseUrl || !serviceRoleKey) return;

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // List buckets
    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
        console.error("Error listing buckets:", error);
    } else {
        console.log("Buckets found:", buckets.map(b => b.name));
        const episodesBucket = buckets.find(b => b.name === 'episodes');
        if (episodesBucket) {
            console.log("✅ 'episodes' bucket exists.");
        } else {
            console.error("❌ 'episodes' bucket NOT found. Please create it.");
        }
    }
}

checkStorage();
