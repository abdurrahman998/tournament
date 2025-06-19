-- Function to get user game statistics
CREATE OR REPLACE FUNCTION get_user_game_stats(user_id UUID)
RETURNS TABLE (
  game TEXT,
  tournaments INTEGER,
  wins INTEGER,
  win_rate INTEGER,
  earnings DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.game_name AS game,
    COUNT(DISTINCT tp.tournament_id) AS tournaments,
    COUNT(DISTINCT CASE WHEN tp.placement = 1 THEN tp.tournament_id END) AS wins,
    CASE
      WHEN COUNT(DISTINCT tp.tournament_id) > 0 THEN
        (COUNT(DISTINCT CASE WHEN tp.placement = 1 THEN tp.tournament_id END) * 100 / COUNT(DISTINCT tp.tournament_id))::INTEGER
      ELSE 0
    END AS win_rate,
    COALESCE(SUM(CASE WHEN tr.type = 'tournament_prize' THEN tr.amount ELSE 0 END), 0) AS earnings
  FROM
    tournament_participants tp
    JOIN tournaments t ON tp.tournament_id = t.id
    LEFT JOIN transactions tr ON tr.tournament_id = t.id AND tr.user_id = user_id AND tr.type = 'tournament_prize'
  WHERE
    tp.user_id = user_id
  GROUP BY
    t.game_name;
END;
$$ LANGUAGE plpgsql;

-- Function to get user achievements
CREATE OR REPLACE FUNCTION get_user_achievements(user_id UUID)
RETURNS TABLE (
  high_roller BOOLEAN,
  hat_trick BOOLEAN
) AS $$
DECLARE
  high_roller_count INTEGER;
  consecutive_wins INTEGER;
BEGIN
  -- Check if user has entered a tournament with entry fee >= 50
  SELECT COUNT(*) INTO high_roller_count
  FROM tournament_participants tp
  JOIN tournaments t ON tp.tournament_id = t.id
  WHERE tp.user_id = user_id AND t.entry_fee >= 50;
  
  -- Check if user has won 3 tournaments in a row
  WITH ranked_tournaments AS (
    SELECT
      tp.tournament_id,
      tp.placement,
      t.start_time,
      ROW_NUMBER() OVER (ORDER BY t.start_time) AS row_num
    FROM
      tournament_participants tp
      JOIN tournaments t ON tp.tournament_id = t.id
    WHERE
      tp.user_id = user_id AND
      tp.placement = 1
    ORDER BY
      t.start_time
  ),
  consecutive_check AS (
    SELECT
      COUNT(*) AS consecutive_count
    FROM
      ranked_tournaments r1
      JOIN ranked_tournaments r2 ON r1.row_num + 1 = r2.row_num
      JOIN ranked_tournaments r3 ON r2.row_num + 1 = r3.row_num
    WHERE
      r1.placement = 1 AND r2.placement = 1 AND r3.placement = 1
  )
  SELECT COALESCE(consecutive_count, 0) INTO consecutive_wins FROM consecutive_check;
  
  RETURN QUERY SELECT 
    high_roller_count > 0 AS high_roller,
    consecutive_wins > 0 AS hat_trick;
END;
$$ LANGUAGE plpgsql;
