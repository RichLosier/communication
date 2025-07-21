/*
  # Ajouter numéros de téléphone aux membres de l'équipe

  1. Modifications
    - Ajouter colonne `phone_number` à la table `team_members`
    - Mettre à jour les membres existants avec leurs numéros

  2. Sécurité
    - Aucun changement aux politiques RLS existantes
*/

-- Ajouter la colonne phone_number à la table team_members
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'team_members' AND column_name = 'phone_number'
  ) THEN
    ALTER TABLE team_members ADD COLUMN phone_number text;
  END IF;
END $$;

-- Mettre à jour les numéros de téléphone (vous devrez me donner les vrais numéros)
UPDATE team_members SET phone_number = CASE 
  WHEN name = 'Jack' THEN '+1234567890'  -- Remplacer par le vrai numéro
  WHEN name = 'Vincent' THEN '+1234567891'  -- Remplacer par le vrai numéro
  WHEN name = 'Marc' THEN '+1234567892'  -- Remplacer par le vrai numéro
  WHEN name = 'Olivier' THEN '+1234567893'  -- Remplacer par le vrai numéro
  WHEN name = 'Jessy' THEN '+1234567894'  -- Remplacer par le vrai numéro
  WHEN name = 'Jo' THEN '+1234567895'  -- Remplacer par le vrai numéro
  WHEN name = 'Laurence' THEN '+1234567896'  -- Remplacer par le vrai numéro
  WHEN name = 'Tom' THEN '+1234567897'  -- Remplacer par le vrai numéro
  ELSE phone_number
END;