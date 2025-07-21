/*
  # Ajouter système d'assignation des messages

  1. Modifications
    - Ajouter colonne `assigned_to` à la table `messages`
    - Ajouter colonne `assigned_at` à la table `messages`
    - Créer table `team_members` pour la liste des vendeurs

  2. Nouvelles Tables
    - `team_members`
      - `id` (uuid, primary key)
      - `name` (text)
      - `active` (boolean)
      - `created_at` (timestamp)

  3. Sécurité
    - Enable RLS sur la nouvelle table
    - Politiques pour permettre l'accès public
*/

-- Table des membres de l'équipe
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Ajouter colonnes d'assignation à la table messages
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'messages' AND column_name = 'assigned_to'
  ) THEN
    ALTER TABLE messages ADD COLUMN assigned_to text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'messages' AND column_name = 'assigned_at'
  ) THEN
    ALTER TABLE messages ADD COLUMN assigned_at timestamptz;
  END IF;
END $$;

-- Enable RLS sur team_members
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Politique pour team_members
CREATE POLICY "Allow all operations on team_members"
  ON team_members
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Insérer quelques membres d'équipe par défaut
INSERT INTO team_members (name) VALUES 
  ('Olivier'),
  ('Marie'),
  ('Jean'),
  ('Sophie'),
  ('Alexandre')
ON CONFLICT DO NOTHING;