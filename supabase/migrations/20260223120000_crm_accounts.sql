-- CRM Accounts table for tracking client reactivation pipeline
CREATE TABLE IF NOT EXISTS crm_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL DEFAULT '',
  contact_email TEXT DEFAULT '',
  contact_phone TEXT DEFAULT '',
  stage TEXT NOT NULL DEFAULT 'prospect' CHECK (stage IN ('prospect', 'contact_initial', 'en_negociation', 'relance', 'actif', 'perdu')),
  priority TEXT NOT NULL DEFAULT 'moyenne' CHECK (priority IN ('haute', 'moyenne', 'basse')),
  assigned_to TEXT NOT NULL DEFAULT '',
  previous_account_number TEXT DEFAULT '',
  revenue_potential NUMERIC(12,2) DEFAULT 0,
  last_contact_date TIMESTAMPTZ,
  next_followup_date TIMESTAMPTZ,
  reason_closed TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CRM Notes table for collaborative notes on accounts
CREATE TABLE IF NOT EXISTS crm_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES crm_accounts(id) ON DELETE CASCADE,
  author TEXT NOT NULL,
  content TEXT NOT NULL,
  note_type TEXT NOT NULL DEFAULT 'note' CHECK (note_type IN ('appel', 'courriel', 'rencontre', 'note', 'tache')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CRM Activity log for tracking all changes
CREATE TABLE IF NOT EXISTS crm_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES crm_accounts(id) ON DELETE CASCADE,
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  details TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_crm_accounts_stage ON crm_accounts(stage);
CREATE INDEX IF NOT EXISTS idx_crm_accounts_assigned_to ON crm_accounts(assigned_to);
CREATE INDEX IF NOT EXISTS idx_crm_accounts_priority ON crm_accounts(priority);
CREATE INDEX IF NOT EXISTS idx_crm_notes_account_id ON crm_notes(account_id);
CREATE INDEX IF NOT EXISTS idx_crm_activities_account_id ON crm_activities(account_id);
CREATE INDEX IF NOT EXISTS idx_crm_accounts_next_followup ON crm_accounts(next_followup_date);

-- Enable RLS
ALTER TABLE crm_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_activities ENABLE ROW LEVEL SECURITY;

-- Policies (permissive for internal team use)
CREATE POLICY "Allow all access to crm_accounts" ON crm_accounts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to crm_notes" ON crm_notes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to crm_activities" ON crm_activities FOR ALL USING (true) WITH CHECK (true);

-- Auto-update updated_at on crm_accounts
CREATE OR REPLACE FUNCTION update_crm_accounts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_crm_accounts_updated_at
  BEFORE UPDATE ON crm_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_crm_accounts_updated_at();
