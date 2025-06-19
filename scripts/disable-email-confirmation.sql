-- Disable email confirmation requirement
-- This needs to be done in Supabase Dashboard under Authentication > Settings
-- Set "Enable email confirmations" to OFF

-- Update auth settings to allow signup without confirmation
UPDATE auth.config 
SET 
  enable_signup = true,
  enable_email_confirmations = false
WHERE id = 1;

-- Create a function to handle immediate profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, username, full_name, bio, steam_id, epic_games_id, riot_id, avatar_url, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'bio', ''),
    COALESCE(NEW.raw_user_meta_data->>'steam_id', ''),
    COALESCE(NEW.raw_user_meta_data->>'epic_games_id', ''),
    COALESCE(NEW.raw_user_meta_data->>'riot_id', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    NOW(),
    NOW()
  );

  -- Create wallet
  INSERT INTO public.wallets (user_id, balance, created_at, updated_at)
  VALUES (NEW.id, 0, NOW(), NOW());

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
