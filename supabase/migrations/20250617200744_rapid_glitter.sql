/*
  # Ajouter les champs client aux messages

  1. Modifications
    - Ajouter colonne `client_name` à la table `messages`
    - Ajouter colonne `dealer_name` à la table `messages`
    - Ces champs permettront de distinguer les messages clients des messages généraux

  2. Sécurité
    - Aucun changement aux politiques RLS existantes
*/

-- Ajouter les colonnes client_name et dealer_name à la table messages
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'messages' AND column_name = 'client_name'
  ) THEN
    ALTER TABLE messages ADD COLUMN client_name text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'messages' AND column_name = 'dealer_name'
  ) THEN
    ALTER TABLE messages ADD COLUMN dealer_name text;
  END IF;
END $$;