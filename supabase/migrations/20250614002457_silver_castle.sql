/*
  # Create poop entries table

  1. New Tables
    - `poop_entries`
      - `id` (uuid, primary key, default gen_random_uuid())
      - `user_id` (uuid, references auth.users, not null)
      - `date` (text, not null) - stored as string for date tracking
      - `did_poop` (boolean, not null)
      - `duration` (integer, not null) - duration in minutes
      - `fiber` (integer, not null) - fiber intake score
      - `mood` (text, not null) - mood after pooping
      - `notes` (text, not null) - user notes
      - `score` (integer, not null) - calculated poop score
      - `created_at` (timestamp with timezone, default now())
      - `updated_at` (timestamp with timezone, default now())

  2. Security
    - Enable RLS on `poop_entries` table
    - Add policies for authenticated users to manage their own entries
*/

CREATE TABLE IF NOT EXISTS poop_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date text NOT NULL,
  did_poop boolean NOT NULL,
  duration integer NOT NULL,
  fiber integer NOT NULL,
  mood text NOT NULL CHECK (mood IN ('happy', 'neutral', 'sad')),
  notes text NOT NULL DEFAULT '',
  score integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE poop_entries ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own poop entries
CREATE POLICY "Users can read own poop entries"
  ON poop_entries
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy for users to insert their own poop entries
CREATE POLICY "Users can insert own poop entries"
  ON poop_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own poop entries
CREATE POLICY "Users can update own poop entries"
  ON poop_entries
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to delete their own poop entries
CREATE POLICY "Users can delete own poop entries"
  ON poop_entries
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Trigger to automatically update updated_at on poop entry updates
CREATE TRIGGER update_poop_entries_updated_at
  BEFORE UPDATE ON poop_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Index for faster queries by user and date
CREATE INDEX IF NOT EXISTS idx_poop_entries_user_date ON poop_entries(user_id, date);