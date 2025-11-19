-- Create user profiles trigger to auto-create on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, created_at, updated_at)
  VALUES (new.id, new.email, now(), now())
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_preferences (
    user_id, 
    topics, 
    podcast_length, 
    publication_time, 
    voice_preference, 
    language,
    created_at, 
    updated_at
  )
  VALUES (
    new.id,
    '[]'::jsonb,
    15,
    '08:00'::time,
    'default',
    'English',
    now(),
    now()
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN new;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user signups
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS on news_sources and subscription_plans
ALTER TABLE public.news_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for news_sources (admin only, read for all)
CREATE POLICY "anyone_can_view_news_sources"
  ON public.news_sources FOR SELECT
  USING (true);

-- Add RLS policies for subscription_plans (read only)
CREATE POLICY "anyone_can_view_subscription_plans"
  ON public.subscription_plans FOR SELECT
  USING (true);
