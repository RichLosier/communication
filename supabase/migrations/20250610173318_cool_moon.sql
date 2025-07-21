/*
  # Création des tables pour les messages et ventes

  1. Nouvelles Tables
    - `messages`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `priority` (text)
      - `sender` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `sales_data`
      - `id` (uuid, primary key)
      - `date` (date)
      - `daily_sales` (integer)
      - `monthly_sales` (integer)
      - `daily_goal` (integer)
      - `monthly_goal` (integer)
      - `working_days_in_month` (integer)
      - `remaining_working_days_override` (integer, nullable)
      - `catch_up_percentage` (integer)
      - `custom_daily_goals` (jsonb)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `priority_alerts`
      - `id` (uuid, primary key)
      - `active` (boolean)
      - `message` (text)
      - `color` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Sécurité
    - Enable RLS sur toutes les tables
    - Politiques pour permettre la lecture/écriture publique (pour une application interne)
*/

-- Table des messages
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  priority text NOT NULL CHECK (priority IN ('niveau1', 'niveau2', 'niveau3')),
  sender text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des données de ventes
CREATE TABLE IF NOT EXISTS sales_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL DEFAULT CURRENT_DATE,
  daily_sales integer DEFAULT 0,
  monthly_sales integer DEFAULT 0,
  daily_goal integer DEFAULT 15,
  monthly_goal integer DEFAULT 300,
  working_days_in_month integer DEFAULT 22,
  remaining_working_days_override integer,
  catch_up_percentage integer DEFAULT 30,
  custom_daily_goals jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(date)
);

-- Table des alertes prioritaires
CREATE TABLE IF NOT EXISTS priority_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  active boolean DEFAULT false,
  message text DEFAULT '',
  color text DEFAULT 'red' CHECK (color IN ('red', 'green')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE priority_alerts ENABLE ROW LEVEL SECURITY;

-- Politiques pour permettre l'accès public (application interne)
CREATE POLICY "Allow all operations on messages"
  ON messages
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on sales_data"
  ON sales_data
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on priority_alerts"
  ON priority_alerts
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sales_data_updated_at
  BEFORE UPDATE ON sales_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_priority_alerts_updated_at
  BEFORE UPDATE ON priority_alerts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insérer une ligne par défaut pour les alertes prioritaires
INSERT INTO priority_alerts (active, message, color)
VALUES (false, '', 'red')
ON CONFLICT DO NOTHING;

-- Insérer une ligne par défaut pour les données de ventes d'aujourd'hui
INSERT INTO sales_data (date)
VALUES (CURRENT_DATE)
ON CONFLICT (date) DO NOTHING;