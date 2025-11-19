-- Add missing INSERT policy for user_profiles
-- This allows users to create their own profile if the trigger didn't run
CREATE POLICY "Users can create own profile" ON user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Also ensure the profile can be inserted via the trigger (SECURITY DEFINER handles this)
-- But this policy allows direct inserts from the client if needed

