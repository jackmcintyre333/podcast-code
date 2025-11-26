# Environment Setup Guide

## Required Environment Variables

Create a `.env.local` file in the project root with the following variables:

```bash
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# News API (Optional - RSS fallback available)
NEWS_API_KEY=your_newsapi_key

# OpenAI (Required for AI Summarization)
OPENAI_API_KEY=your_openai_api_key

# Cron Secret (Required for scheduled jobs)
CRON_SECRET=your_random_secret_string

# Email Service (Required for sending podcasts)
RESEND_API_KEY=your_resend_api_key

# Stripe (Required for payments)
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

## Getting API Keys

### NewsAPI (Optional)
1. Visit [newsapi.org](https://newsapi.org/)
2. Sign up for a free account
3. Copy your API key
4. Note: Free tier has limitations; RSS fallback works without this

### OpenAI
1. Visit [platform.openai.com](https://platform.openai.com/)
2. Create an account and add billing
3. Generate an API key from the API keys section

### Resend (Email)
1. Visit [resend.com](https://resend.com/)
2. Sign up and verify your domain
3. Generate an API key

### Stripe
1. Visit [stripe.com](https://stripe.com/)
2. Create an account
3. Get your API keys from the Developers section
4. Use test keys for development

## Database Setup

Run the SQL scripts in order:
```bash
# In Supabase SQL Editor
1. scripts/01-init-schema.sql
2. scripts/02-setup-profiles.sql
3. scripts/03-seed-subscription-plans.sql
4. scripts/04-fix-rls-policies.sql
```

## Netlify Configuration

When deploying to Netlify, add all environment variables in:
**Site settings → Environment variables**

Create a `netlify.toml` file (see Phase 5 in task list).
