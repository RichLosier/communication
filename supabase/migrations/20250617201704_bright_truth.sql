/*
  # Mise à jour du numéro de téléphone de Jessy

  1. Modifications
    - Mettre à jour le numéro de téléphone de Jessy avec le vrai numéro
    - Format: (418) 456-7871

  2. Sécurité
    - Aucun changement aux politiques RLS existantes
*/

-- Mettre à jour le numéro de téléphone de Jessy
UPDATE team_members 
SET phone_number = '+14184567871'
WHERE name = 'Jessy';