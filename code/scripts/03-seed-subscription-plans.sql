-- Seed subscription plans into the database
INSERT INTO public.subscription_plans (
  id, 
  name, 
  max_daily_episodes, 
  max_podcast_length, 
  voice_options, 
  custom_publication_times, 
  ad_free, 
  price_monthly, 
  created_at
) VALUES
  (
    gen_random_uuid(),
    'Free',
    1,
    10,
    1,
    false,
    false,
    0,
    now()
  ),
  (
    gen_random_uuid(),
    'Pro',
    999,
    30,
    5,
    true,
    true,
    9.99,
    now()
  ),
  (
    gen_random_uuid(),
    'Enterprise',
    999,
    60,
    10,
    true,
    true,
    29.99,
    now()
  )
ON CONFLICT DO NOTHING;
