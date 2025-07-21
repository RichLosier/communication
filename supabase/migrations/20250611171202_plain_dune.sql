/*
  # Ajouter colonne pour messages flash

  1. Modifications
    - Ajouter colonne `is_flashing` à la table `messages`
    - Valeur par défaut: false
    - Type: boolean

  2. Sécurité
    - Aucun changement aux politiques RLS existantes
*/

-- Ajouter la colonne is_flashing à la table messages
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'messages' AND column_name = 'is_flashing'
  ) THEN
    ALTER TABLE messages ADD COLUMN is_flashing boolean DEFAULT false;
  END IF;
END $$;