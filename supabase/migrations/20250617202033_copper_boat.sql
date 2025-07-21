/*
  # Mise à jour finale - Numéro de Jo

  1. Modifications
    - Ajouter le numéro de téléphone de Jo
    - Compléter la couverture SMS à 100%

  2. Résultat
    - Tous les membres de l'équipe ont maintenant un numéro
    - Système SMS entièrement opérationnel
*/

-- Mettre à jour le numéro de téléphone de Jo
UPDATE team_members 
SET phone_number = '+14185632661'
WHERE name = 'Jo';