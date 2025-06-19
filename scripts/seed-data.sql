-- Seed data for the gaming tournament platform
-- Note: This assumes you have already run the schema.sql script

-- Insert sample tournaments
-- Note: You'll need to replace 'YOUR_USER_ID' with an actual user ID from your auth.users table
DO $$
DECLARE
  user_id UUID;
BEGIN
  -- Get the first user from auth.users or create a placeholder
  SELECT id INTO user_id FROM auth.users LIMIT 1;
  
  IF user_id IS NULL THEN
    user_id := '00000000-0000-0000-0000-000000000000'::UUID;
  END IF;

  -- Insert sample tournaments
  INSERT INTO tournaments (
    title, 
    game_name, 
    game_cover_image, 
    description, 
    rules, 
    start_time, 
    total_slots, 
    entry_fee, 
    prize_pool, 
    room_id, 
    room_password, 
    created_by, 
    status
  )
  VALUES 
    (
      'Fortnite Solo Cup', 
      'Fortnite', 
      '/placeholder.svg?height=400&width=600', 
      'Compete in our weekly Fortnite Solo tournament for a chance to win cash prizes! This tournament features a battle royale format with points awarded for eliminations and placement.',
      '[
        "Players must be at least 13 years old",
        "No teaming with other players",
        "No use of exploits or hacks",
        "Players must stream their gameplay",
        "Tournament admins have final say on all rulings"
      ]'::JSONB,
      NOW() + INTERVAL '2 hours',
      100,
      10,
      750,
      'FSOLO123',
      'battle99',
      user_id,
      'upcoming'
    ),
    (
      'Valorant Weekly Tournament', 
      'Valorant', 
      '/placeholder.svg?height=400&width=600', 
      '5v5 competitive Valorant tournament with single elimination bracket. Form your team and compete for glory and prizes!',
      '[
        "Teams must have 5 players",
        "No substitutions after tournament begins",
        "Maps are chosen by veto system",
        "Best of 1 until finals (Best of 3)",
        "Anti-cheat software required"
      ]'::JSONB,
      NOW() + INTERVAL '24 hours',
      16,
      25,
      1000,
      NULL,
      NULL,
      user_id,
      'upcoming'
    ),
    (
      'Apex Legends Trio Championship', 
      'Apex Legends', 
      '/placeholder.svg?height=400&width=600', 
      'Form a squad of three and battle for supremacy in our Apex Legends tournament. Points awarded for placement and kills.',
      '[
        "Teams must have exactly 3 players",
        "No teaming with other squads",
        "6 matches total, best 5 scores count",
        "Points: 1 per kill, placement bonuses",
        "Disconnects are not grounds for a rematch"
      ]'::JSONB,
      NOW() + INTERVAL '5 hours',
      20,
      15,
      900,
      'APEX456',
      'legend789',
      user_id,
      'upcoming'
    ),
    (
      'Call of Duty: Warzone Duos', 
      'Call of Duty', 
      '/placeholder.svg?height=400&width=600', 
      'Grab a partner and drop into Verdansk for our high-stakes Warzone tournament. Compete in a series of matches to earn points.',
      '[
        "Teams must have exactly 2 players",
        "No use of restricted weapons or exploits",
        "4 matches total, all scores count",
        "Points: 1 per kill, placement bonuses",
        "Stream delay of at least 2 minutes required"
      ]'::JSONB,
      NOW() + INTERVAL '48 hours',
      50,
      20,
      1500,
      NULL,
      NULL,
      user_id,
      'upcoming'
    ),
    (
      'CS:GO 5v5 Pro Series', 
      'CS:GO', 
      '/placeholder.svg?height=400&width=600', 
      'Professional-level CS:GO tournament with strict rules and high competition. Single elimination bracket with best of 3 finals.',
      '[
        "Teams must have 5 players",
        "One substitute allowed per team",
        "Standard competitive maps and rules",
        "Anti-cheat software required",
        "Match medic available for technical issues"
      ]'::JSONB,
      NOW() + INTERVAL '72 hours',
      16,
      50,
      2500,
      NULL,
      NULL,
      user_id,
      'upcoming'
    );

  -- If we have a valid user, create some sample data for them
  IF user_id != '00000000-0000-0000-0000-000000000000'::UUID THEN
    -- Join the user to some tournaments
    INSERT INTO tournament_participants (tournament_id, user_id, status, payment_status)
    SELECT id, user_id, 'registered', 'completed'
    FROM tournaments
    WHERE title IN ('Fortnite Solo Cup', 'Apex Legends Trio Championship')
    ON CONFLICT DO NOTHING;
    
    -- Add some transactions
    INSERT INTO transactions (user_id, amount, type, status, description, tournament_id)
    SELECT 
      user_id, 
      t.entry_fee, 
      'tournament_entry', 
      'completed', 
      'Entry fee for ' || t.title, 
      t.id
    FROM tournaments t
    WHERE t.title IN ('Fortnite Solo Cup', 'Apex Legends Trio Championship')
    ON CONFLICT DO NOTHING;
    
    -- Add some notifications
    INSERT INTO notifications (user_id, title, message, type, tournament_id)
    SELECT 
      user_id, 
      'Tournament Starting Soon', 
      t.title || ' is starting in 15 minutes!', 
      'reminder', 
      t.id
    FROM tournaments t
    WHERE t.title = 'Fortnite Solo Cup'
    ON CONFLICT DO NOTHING;
    
    INSERT INTO notifications (user_id, title, message, type)
    VALUES (
      user_id, 
      'Welcome to GameTourneys', 
      'Welcome to the platform! Start by joining a tournament or adding funds to your wallet.', 
      'system'
    )
    ON CONFLICT DO NOTHING;
  END IF;
END $$;
