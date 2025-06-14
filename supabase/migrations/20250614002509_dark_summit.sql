/*
  # Create achievements table

  1. New Tables
    - `achievements`
      - `id` (uuid, primary key, default gen_random_uuid())
      - `user_id` (uuid, references auth.users, not null)
      - `achievement_id` (text, not null) - unique identifier for achievement type
      - `title` (text, not null) - display title of the achievement
      - `unlocked_at` (timestamp with timezone, default now())

  2. Security
    - Enable RLS on `achievements` table
    - Add policies for authenticated users to read their own achievements
    - Add policy for system to insert achievements
*/

CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  achievement_id text NOT NULL,
  title text NOT NULL,
  unlocked_at timestamptz DEFAULT now()
);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own achievements
CREATE POLICY "Users can read own achievements"
  ON achievements
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy for users to insert their own achievements
CREATE POLICY "Users can insert own achievements"
  ON achievements
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Index for faster queries by user and achievement type
CREATE INDEX IF NOT EXISTS idx_achievements_user_achievement ON achievements(user_id, achievement_id);

-- Unique constraint to prevent duplicate achievements per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_achievements_user_achievement_unique 
  ON achievements(user_id, achievement_id);