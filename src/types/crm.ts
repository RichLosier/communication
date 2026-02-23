export type AccountStage =
  | 'prospect'
  | 'contact_initial'
  | 'en_negociation'
  | 'relance'
  | 'actif'
  | 'perdu';

export const STAGE_CONFIG: Record<AccountStage, { label: string; color: string; bgColor: string; borderColor: string; order: number }> = {
  prospect: {
    label: 'Prospects',
    color: 'text-slate-700',
    bgColor: 'bg-slate-100',
    borderColor: 'border-slate-300',
    order: 0
  },
  contact_initial: {
    label: 'Contact Initial',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300',
    order: 1
  },
  en_negociation: {
    label: 'En Negociation',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-300',
    order: 2
  },
  relance: {
    label: 'Relance',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-300',
    order: 3
  },
  actif: {
    label: 'Actif',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-300',
    order: 4
  },
  perdu: {
    label: 'Perdu',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-300',
    order: 5
  },
};

export const STAGE_ORDER: AccountStage[] = [
  'prospect',
  'contact_initial',
  'en_negociation',
  'relance',
  'actif',
  'perdu',
];

export type AccountPriority = 'haute' | 'moyenne' | 'basse';

export const PRIORITY_CONFIG: Record<AccountPriority, { label: string; color: string; bgColor: string }> = {
  haute: { label: 'Haute', color: 'text-red-700', bgColor: 'bg-red-100' },
  moyenne: { label: 'Moyenne', color: 'text-amber-700', bgColor: 'bg-amber-100' },
  basse: { label: 'Basse', color: 'text-green-700', bgColor: 'bg-green-100' },
};

export interface CrmAccount {
  id: string;
  company_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  stage: AccountStage;
  priority: AccountPriority;
  assigned_to: string;
  previous_account_number: string;
  revenue_potential: number;
  last_contact_date: string | null;
  next_followup_date: string | null;
  reason_closed: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface CrmNote {
  id: string;
  account_id: string;
  author: string;
  content: string;
  note_type: 'appel' | 'courriel' | 'rencontre' | 'note' | 'tache';
  created_at: string;
}

export interface CrmActivity {
  id: string;
  account_id: string;
  actor: string;
  action: string;
  details: string;
  created_at: string;
}

export const NOTE_TYPE_CONFIG: Record<CrmNote['note_type'], { label: string; icon: string; color: string }> = {
  appel: { label: 'Appel', icon: 'Phone', color: 'text-blue-600' },
  courriel: { label: 'Courriel', icon: 'Mail', color: 'text-indigo-600' },
  rencontre: { label: 'Rencontre', icon: 'Users', color: 'text-green-600' },
  note: { label: 'Note', icon: 'StickyNote', color: 'text-amber-600' },
  tache: { label: 'Tache', icon: 'CheckSquare', color: 'text-purple-600' },
};

export type CrmAccountFormData = Omit<CrmAccount, 'id' | 'created_at' | 'updated_at'>;
