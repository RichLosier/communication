/*
  # Mise à jour du numéro de téléphone de Laurence

  1. Modifications
    - Mettre à jour le numéro de téléphone de Laurence
    - Numéro: +1 (418) 455-5132

  2. Sécurité
    - Aucun changement aux politiques RLS existantes
*/

-- Mettre à jour le numéro de téléphone de Laurence
UPDATE team_members 
SET phone_number = '+14184555132'
WHERE name = 'Laurence';