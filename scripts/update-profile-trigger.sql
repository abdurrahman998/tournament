-- Update the trigger to handle additional profile data from user metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    username, 
    full_name,
    bio,
    steam_id,
    epic_games_id,
    riot_id,
    avatar_url
  )
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'username', new.email),
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'bio',
    new.raw_user_meta_data->>'steam_id',
    new.raw_user_meta_data->>'epic_games_id',
    new.raw_user_meta_data->>'riot_id',
    COALESCE(new.raw_user_meta_data->>'avatar_url', '')
  );
  
  -- Create a wallet for the new user
  INSERT INTO public.wallets (user_id)
  VALUES (new.id);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
