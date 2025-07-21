/*
  # Create team_members table

  1. New Tables
    - `team_members`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `active` (boolean, default true)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `team_members` table
    - Add policy for public access (internal application)

  3. Default Data
    - Insert default team members for immediate use
*/

-- Create the team_members table if it doesn't exist
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists, then create new one
DROP POLICY IF EXISTS "Allow all operations on team_members" ON team_members;

CREATE POLICY "Allow all operations on team_members"
  ON team_members
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Insert default team members (only if they don't already exist)
DO $$
BEGIN
  -- Check if any team members exist, if not insert defaults
  IF NOT EXISTS (SELECT 1 FROM team_members LIMIT 1) THEN
    INSERT INTO team_members (name, active) VALUES
      ('Manager', true),
      ('Équipe Ventes', true),
      ('Support Technique', true);
  END IF;
END $$;