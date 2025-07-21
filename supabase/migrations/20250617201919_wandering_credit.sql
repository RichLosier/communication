/*
  # Mise à jour du numéro de téléphone de Tom

  1. Modifications
    - Mettre à jour le numéro de téléphone de Tom
    - Numéro: +1 (581) 397-5497

  2. Sécurité
    - Aucun changement aux politiques RLS existantes
*/

-- Mettre à jour le numéro de téléphone de Tom
UPDATE team_members 
SET phone_number = '+15813975497'
WHERE name = 'Tom';