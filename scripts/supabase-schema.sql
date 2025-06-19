-- Create schema for the gaming tournament platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Games table
CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  cover_image TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tournaments table
CREATE TABLE IF NOT EXISTS tournaments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  game_name TEXT NOT NULL REFERENCES games(name),
  game_cover_image TEXT,
  description TEXT NOT NULL,
  rules JSONB NOT NULL DEFAULT '[]'::JSONB,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  total_slots INTEGER NOT NULL,
  entry_fee DECIMAL(10, 2) NOT NULL,
  prize_pool DECIMAL(10, 2) NOT NULL,
  room_id TEXT,
  room_password TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  status TEXT NOT NULL CHECK (status IN ('upcoming', 'active', 'completed', 'cancelled')) DEFAULT 'upcoming'
);

-- Create index on game_name for faster filtering
CREATE INDEX IF NOT EXISTS idx_tournaments_game_name ON tournaments(game_name);
-- Create index on start_time for faster sorting
CREATE INDEX IF NOT EXISTS idx_tournaments_start_time ON tournaments(start_time);
-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON tournaments(status);

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  steam_id TEXT,
  epic_games_id TEXT,
  riot_id TEXT,
  tournaments_played INTEGER DEFAULT 0,
  tournaments_won INTEGER DEFAULT 0,
  total_earnings DECIMAL(10, 2) DEFAULT 0
);

-- Tournament participants table
CREATE TABLE IF NOT EXISTS tournament_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  status TEXT NOT NULL CHECK (status IN ('registered', 'checked_in', 'no_show', 'disqualified', 'completed')) DEFAULT 'registered',
  placement INTEGER,
  payment_status TEXT NOT NULL CHECK (payment_status IN ('pending', 'completed', 'refunded')) DEFAULT 'pending',
  transaction_id UUID,
  UNIQUE(tournament_id, user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_tournament_participants_tournament_id ON tournament_participants(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_participants_user_id ON tournament_participants(user_id);

-- Wallets table
CREATE TABLE IF NOT EXISTS wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id),
  balance DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  amount DECIMAL(10, 2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'tournament_entry', 'tournament_prize', 'refund')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')) DEFAULT 'pending',
  description TEXT NOT NULL,
  reference_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  tournament_id UUID REFERENCES tournaments(id) ON DELETE SET NULL
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('tournament', 'payment', 'system', 'reminder')),
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  tournament_id UUID REFERENCES tournaments(id) ON DELETE SET NULL
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- Insert sample games
INSERT INTO games (name, cover_image, description)
VALUES 
  ('Fortnite', '/placeholder.svg?height=400&width=600', 'Battle Royale Game'),
  ('Valorant', '/placeholder.svg?height=400&width=600', 'Tactical Shooter'),
  ('CS:GO', '/placeholder.svg?height=400&width=600', 'Competitive FPS'),
  ('Apex Legends', '/placeholder.svg?height=400&width=600', 'Team-based Battle Royale'),
  ('Call of Duty', '/placeholder.svg?height=400&width=600', 'First-person Shooter')
ON CONFLICT (name) DO NOTHING;

-- Create RLS policies

-- Enable RLS on all tables
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Games policies (anyone can read)
CREATE POLICY "Anyone can read games" ON games
  FOR SELECT USING (true);

-- Tournaments policies
CREATE POLICY "Anyone can read tournaments" ON tournaments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create tournaments" ON tournaments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own tournaments" ON tournaments
  FOR UPDATE USING (auth.uid() = created_by);

-- Profiles policies
CREATE POLICY "Users can read any profile" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Tournament participants policies
CREATE POLICY "Anyone can read tournament participants" ON tournament_participants
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can join tournaments" ON tournament_participants
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "Users can update their own participation" ON tournament_participants
  FOR UPDATE USING (auth.uid() = user_id);

-- Wallets policies
CREATE POLICY "Users can view their own wallet" ON wallets
  FOR SELECT USING (auth.uid() = user_id);

-- Transactions policies
CREATE POLICY "Users can view their own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Create triggers

-- Create a trigger to create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'avatar_url');
  
  -- Create a wallet for the new user
  INSERT INTO public.wallets (user_id)
  VALUES (new.id);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create a trigger to update wallet balance when a transaction is completed
CREATE OR REPLACE FUNCTION public.handle_transaction_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process when status changes to 'completed'
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Update wallet balance based on transaction type
    IF NEW.type IN ('deposit', 'tournament_prize', 'refund') THEN
      -- Add money to wallet
      UPDATE public.wallets
      SET balance = balance + NEW.amount,
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = NEW.user_id;
    ELSIF NEW.type IN ('withdrawal', 'tournament_entry') THEN
      -- Subtract money from wallet
      UPDATE public.wallets
      SET balance = balance - NEW.amount,
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = NEW.user_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_transaction_update
  AFTER UPDATE ON public.transactions
  FOR EACH ROW EXECUTE PROCEDURE public.handle_transaction_update();

-- Create a trigger to update tournament stats when a tournament is completed
CREATE OR REPLACE FUNCTION public.handle_tournament_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process when status changes to 'completed'
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Update profiles for participants
    UPDATE public.profiles p
    SET tournaments_played = tournaments_played + 1
    FROM public.tournament_participants tp
    WHERE tp.tournament_id = NEW.id AND tp.user_id = p.id;
    
    -- Update profiles for winners (placement = 1)
    UPDATE public.profiles p
    SET tournaments_won = tournaments_won + 1
    FROM public.tournament_participants tp
    WHERE tp.tournament_id = NEW.id AND tp.user_id = p.id AND tp.placement = 1;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_tournament_completion
  AFTER UPDATE ON public.tournaments
  FOR EACH ROW EXECUTE PROCEDURE public.handle_tournament_completion();
