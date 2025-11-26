# OpenAI API Key Setup

## Why You Need This
To test the AI summarization feature, you need an OpenAI API key. This is the same service that powers ChatGPT.

## How to Get Your API Key

1. **Go to OpenAI**: Visit [platform.openai.com/api-keys](https://platform.openai.com/api-keys)

2. **Sign Up/Login**: Create an account or log in

3. **Add Billing**: 
   - Go to Settings → Billing
   - Add a payment method
   - Note: GPT-4 API costs ~$0.01-0.03 per request for our use case

4. **Create API Key**:
   - Click "Create new secret key"
   - Give it a name like "CommuteCast Dev"
   - Copy the key (starts with `sk-...`)

5. **Add to `.env.local`**:
   ```bash
   OPENAI_API_KEY=sk-your-actual-key-here
   ```

## Cost Estimate
- Each podcast generation: ~$0.01-0.03
- Testing (5-10 runs): ~$0.10-0.30
- Monthly for 100 users: ~$3-10

## After Adding the Key

Run the test again:
```bash
npx tsx scripts/test-summarization.ts
```

You should see:
1. News articles fetched
2. AI-generated podcast script
3. Word count and estimated duration
