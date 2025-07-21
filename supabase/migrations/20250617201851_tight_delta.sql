/*
  # Mise à jour du numéro de téléphone de Jack

  1. Modifications
    - Mettre à jour le numéro de téléphone de Jack
    - Format: +1 (581) 995-5873

  2. Sécurité
    - Aucun changement aux politiques RLS existantes
*/

-- Mettre à jour le numéro de téléphone de Jack
UPDATE team_members 
SET phone_number = '+15819955873'
WHERE name = 'Jack';