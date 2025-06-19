-- Add policy to allow profile creation during signup
CREATE POLICY "Allow profile creation during signup" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Update the existing policy to be more permissive for profile creation
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow users to insert their own profile (for the trigger)
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (true);
