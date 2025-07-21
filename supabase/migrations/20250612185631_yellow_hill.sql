/*
  # Mise à jour des membres de l'équipe

  1. Modifications
    - Créer la table team_members si elle n'existe pas
    - Ajouter les vrais membres de l'équipe de vente
    - Configurer les politiques RLS

  2. Sécurité
    - Enable RLS sur team_members
    - Politique pour permettre toutes les opérations
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

-- Clear existing team members and insert the real team
DELETE FROM team_members;

INSERT INTO team_members (name, active) VALUES
  ('Jack', true),
  ('Vincent', true),
  ('Marc', true),
  ('Olivier', true),
  ('Jessy', true),
  ('Jo', true),
  ('Laurence', true),
  ('Tom', true);