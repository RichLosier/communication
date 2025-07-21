/*
  # Mise à jour du numéro de téléphone d'Olivier

  1. Modifications
    - Mettre à jour le numéro de téléphone d'Olivier
    - Numéro: +1 (418) 570-2820

  2. Sécurité
    - Aucun changement aux politiques RLS existantes
*/

-- Mettre à jour le numéro de téléphone d'Olivier
UPDATE team_members 
SET phone_number = '+14185702820'
WHERE name = 'Olivier';