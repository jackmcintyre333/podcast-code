-- Create users table (will be managed by Supabase auth)
create table if not exists user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text,
  avatar_url text,
  subscription_tier text default 'free', -- 'free', 'pro', 'premium'
  preferences_updated_at timestamp default now(),
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Create preferences table
create table if not exists user_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references user_profiles(id) on delete cascade,
  topics jsonb default '[]', -- Array of selected topics
  news_sources jsonb default '[]', -- Array of news source preferences
  podcast_length integer default 10, -- Minutes
  publication_time time default '06:00:00', -- When to send podcast
  voice_preference text default 'neutral', -- 'male', 'female', 'neutral'
  language text default 'en',
  created_at timestamp default now(),
  updated_at timestamp default now(),
  unique(user_id)
);

-- Create episodes table (generated podcasts)
create table if not exists episodes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references user_profiles(id) on delete cascade,
  title text not null,
  description text,
  audio_url text, -- URL to generated audio file
  summary text, -- JSON structure of article summaries
  topics jsonb, -- Topics covered in this episode
  generated_at timestamp default now(),
  sent_at timestamp,
  listened_at timestamp,
  listen_duration integer, -- Seconds
  created_at timestamp default now()
);

-- Create news sources configuration
create table if not exists news_sources (
  id uuid primary key default gen_random_uuid(),
  name text unique not null, -- 'bbc', 'cnn', 'financial-times', etc.
  category text not null, -- 'news', 'business', 'tech', 'sports'
  api_key text,
  enabled boolean default true,
  created_at timestamp default now()
);

-- Create subscription tiers
create table if not exists subscription_plans (
  id uuid primary key default gen_random_uuid(),
  name text unique not null, -- 'free', 'pro', 'premium'
  max_daily_episodes integer,
  max_podcast_length integer, -- minutes
  voice_options integer,
  custom_publication_times boolean,
  ad_free boolean,
  price_monthly numeric,
  created_at timestamp default now()
);

-- Create user subscriptions
create table if not exists user_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references user_profiles(id) on delete cascade,
  plan_id uuid not null references subscription_plans(id),
  stripe_subscription_id text,
  status text default 'active', -- 'active', 'cancelled', 'expired'
  started_at timestamp default now(),
  renewal_date timestamp,
  cancelled_at timestamp,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Enable RLS
alter table user_profiles enable row level security;
alter table user_preferences enable row level security;
alter table episodes enable row level security;
alter table user_subscriptions enable row level security;

-- RLS Policies for user_profiles
create policy "Users can view own profile" on user_profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on user_profiles
  for update using (auth.uid() = id);

-- RLS Policies for user_preferences
create policy "Users can view own preferences" on user_preferences
  for select using (auth.uid() = user_id);

create policy "Users can update own preferences" on user_preferences
  for update using (auth.uid() = user_id);

create policy "Users can create preferences" on user_preferences
  for insert with check (auth.uid() = user_id);

-- RLS Policies for episodes
create policy "Users can view own episodes" on episodes
  for select using (auth.uid() = user_id);

create policy "Users can create episodes (via trigger)" on episodes
  for insert with check (auth.uid() = user_id);

-- RLS Policies for user_subscriptions
create policy "Users can view own subscription" on user_subscriptions
  for select using (auth.uid() = user_id);

-- Insert default subscription plans
insert into subscription_plans (name, max_daily_episodes, max_podcast_length, voice_options, custom_publication_times, ad_free, price_monthly)
values
  ('free', 1, 10, 1, false, false, 0),
  ('pro', 3, 20, 2, true, false, 9.99),
  ('premium', 10, 45, 5, true, true, 19.99);

-- Create indexes for performance
create index idx_episodes_user_id on episodes(user_id);
create index idx_episodes_generated_at on episodes(generated_at);
create index idx_user_preferences_user_id on user_preferences(user_id);
create index idx_user_subscriptions_user_id on user_subscriptions(user_id);
