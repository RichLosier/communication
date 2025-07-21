/*
  # Mise à jour du numéro de téléphone de Marc

  1. Modifications
    - Mettre à jour le numéro de téléphone de Marc
    - Format: +1 (418) 929-7303

  2. Sécurité
    - Aucun changement aux politiques RLS existantes
*/

-- Mettre à jour le numéro de téléphone de Marc
UPDATE team_members 
SET phone_number = '+14189297303'
WHERE name = 'Marc';