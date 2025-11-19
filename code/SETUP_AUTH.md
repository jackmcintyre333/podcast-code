# Setting Up Authentication for CommuteCast

This guide will walk you through setting up Supabase authentication for your CommuteCast application.

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click **"New Project"**
4. Fill in the project details:
   - **Name**: `commutecast` (or any name you prefer)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose the closest region to you
5. Click **"Create new project"** and wait for it to be set up (takes ~2 minutes)

## Step 2: Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. You'll find:
   - **Project URL**: Copy this (looks like `https://xxxxx.supabase.co`)
   - **anon public key**: Copy this (starts with `eyJ...`)

## Step 3: Update Environment Variables

1. Open the `.env.local` file in your project root
2. Replace the placeholder values with your actual Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

3. Save the file

## Step 4: Set Up the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Run the SQL scripts in order:

### 4.1. Initialize Schema
   - Copy the contents of `scripts/01-init-schema.sql`
   - Paste into SQL Editor
   - Click **"Run"**

### 4.2. Set Up User Profiles Trigger
   - Copy the contents of `scripts/02-setup-profiles.sql`
   - Paste into SQL Editor
   - Click **"Run"**

### 4.3. Seed Subscription Plans
   - Copy the contents of `scripts/03-seed-subscription-plans.sql`
   - Paste into SQL Editor
   - Click **"Run"**

## Step 5: Configure Email Authentication

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Make sure **Email** is enabled
3. (Optional) Configure email templates:
   - Go to **Authentication** → **Email Templates**
   - Customize the confirmation and password reset emails if desired

## Step 6: Configure Redirect URLs

1. In Supabase dashboard, go to **Authentication** → **URL Configuration**
2. Add your site URL:
   - **Site URL**: `http://localhost:3000` (for development)
   - **Redirect URLs**: Add:
     - `http://localhost:3000/dashboard`
     - `http://localhost:3000/auth/callback`
     - `http://localhost:3000/**` (wildcard for development)

## Step 7: Restart Your Dev Server

1. Stop your current dev server (Ctrl+C)
2. Restart it:
   ```bash
   npm run dev
   ```

## Step 8: Test Authentication

1. Go to `http://localhost:3000/auth/signup`
2. Create a test account
3. Check your email for the confirmation link (or check Supabase dashboard → Authentication → Users)
4. After confirming, try logging in at `http://localhost:3000/auth/login`

## Troubleshooting

### "Invalid API key" error
- Double-check your `.env.local` file has the correct values
- Make sure there are no extra spaces or quotes
- Restart your dev server after changing `.env.local`

### "Email not confirmed" error
- In Supabase dashboard → Authentication → Users, you can manually confirm users
- Or disable email confirmation in Authentication → Settings → "Enable email confirmations"

### Database errors
- Make sure you ran all three SQL scripts in order
- Check the SQL Editor for any error messages
- Verify tables were created: Go to **Table Editor** in Supabase dashboard

### Redirect errors
- Make sure you added the redirect URLs in Step 6
- Check that your site URL matches your dev server URL

## Next Steps

Once authentication is working:
- Users can sign up and log in
- User profiles are automatically created on signup
- Users can set their preferences
- The dashboard will be accessible to authenticated users

For production deployment:
- Update redirect URLs to your production domain
- Set up proper email service (Supabase has built-in email, or use custom SMTP)
- Configure environment variables in your hosting platform (Vercel, etc.)

