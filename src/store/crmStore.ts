import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { CrmAccount, CrmNote, CrmActivity, AccountStage, CrmAccountFormData } from '../types/crm';

interface CrmStore {
  accounts: CrmAccount[];
  notes: Record<string, CrmNote[]>;
  activities: Record<string, CrmActivity[]>;
  selectedAccountId: string | null;
  loading: boolean;
  searchQuery: string;
  filterStage: AccountStage | 'all';
  filterAssignee: string | 'all';

  // Actions
  setSearchQuery: (query: string) => void;
  setFilterStage: (stage: AccountStage | 'all') => void;
  setFilterAssignee: (assignee: string | 'all') => void;
  setSelectedAccountId: (id: string | null) => void;

  // CRUD Accounts
  loadAccounts: () => Promise<void>;
  addAccount: (data: CrmAccountFormData) => Promise<CrmAccount>;
  updateAccount: (id: string, data: Partial<CrmAccountFormData>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  moveAccountToStage: (id: string, stage: AccountStage, actor: string) => Promise<void>;

  // Notes
  loadNotes: (accountId: string) => Promise<void>;
  addNote: (accountId: string, note: Omit<CrmNote, 'id' | 'created_at' | 'account_id'>) => Promise<void>;
  deleteNote: (noteId: string, accountId: string) => Promise<void>;

  // Activities
  loadActivities: (accountId: string) => Promise<void>;

  // Computed
  getAccountsByStage: (stage: AccountStage) => CrmAccount[];
  getFilteredAccounts: () => CrmAccount[];
  getAccountById: (id: string) => CrmAccount | undefined;
  getStats: () => {
    total: number;
    byStage: Record<AccountStage, number>;
    highPriority: number;
    followupsToday: number;
    followupsOverdue: number;
  };
}

export const useCrmStore = create<CrmStore>((set, get) => ({
  accounts: [],
  notes: {},
  activities: {},
  selectedAccountId: null,
  loading: false,
  searchQuery: '',
  filterStage: 'all',
  filterAssignee: 'all',

  setSearchQuery: (query) => set({ searchQuery: query }),
  setFilterStage: (stage) => set({ filterStage: stage }),
  setFilterAssignee: (assignee) => set({ filterAssignee: assignee }),
  setSelectedAccountId: (id) => set({ selectedAccountId: id }),

  // Load all accounts
  loadAccounts: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('crm_accounts')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const accounts: CrmAccount[] = (data || []).map((row: any) => ({
        id: row.id,
        company_name: row.company_name,
        contact_name: row.contact_name || '',
        contact_email: row.contact_email || '',
        contact_phone: row.contact_phone || '',
        stage: row.stage,
        priority: row.priority,
        assigned_to: row.assigned_to || '',
        previous_account_number: row.previous_account_number || '',
        revenue_potential: parseFloat(row.revenue_potential) || 0,
        last_contact_date: row.last_contact_date,
        next_followup_date: row.next_followup_date,
        reason_closed: row.reason_closed || '',
        tags: row.tags || [],
        created_at: row.created_at,
        updated_at: row.updated_at,
      }));

      set({ accounts });
    } catch (error) {
      console.error('Erreur chargement comptes CRM:', error);
      set({ accounts: [] });
    } finally {
      set({ loading: false });
    }
  },

  // Add a new account
  addAccount: async (data) => {
    try {
      const { data: row, error } = await supabase
        .from('crm_accounts')
        .insert([{
          company_name: data.company_name,
          contact_name: data.contact_name,
          contact_email: data.contact_email,
          contact_phone: data.contact_phone,
          stage: data.stage,
          priority: data.priority,
          assigned_to: data.assigned_to,
          previous_account_number: data.previous_account_number,
          revenue_potential: data.revenue_potential,
          last_contact_date: data.last_contact_date || null,
          next_followup_date: data.next_followup_date || null,
          reason_closed: data.reason_closed,
          tags: data.tags,
        }])
        .select()
        .single();

      if (error) throw error;

      const newAccount: CrmAccount = {
        id: row.id,
        company_name: row.company_name,
        contact_name: row.contact_name || '',
        contact_email: row.contact_email || '',
        contact_phone: row.contact_phone || '',
        stage: row.stage,
        priority: row.priority,
        assigned_to: row.assigned_to || '',
        previous_account_number: row.previous_account_number || '',
        revenue_potential: parseFloat(row.revenue_potential) || 0,
        last_contact_date: row.last_contact_date,
        next_followup_date: row.next_followup_date,
        reason_closed: row.reason_closed || '',
        tags: row.tags || [],
        created_at: row.created_at,
        updated_at: row.updated_at,
      };

      set((state) => ({ accounts: [newAccount, ...state.accounts] }));

      // Log activity
      await supabase.from('crm_activities').insert([{
        account_id: newAccount.id,
        actor: data.assigned_to || 'Systeme',
        action: 'creation',
        details: `Compte "${data.company_name}" cree dans le pipeline`,
      }]);

      return newAccount;
    } catch (error) {
      console.error('Erreur ajout compte CRM:', error);
      throw error;
    }
  },

  // Update an existing account
  updateAccount: async (id, data) => {
    try {
      const updateData: any = {};
      if (data.company_name !== undefined) updateData.company_name = data.company_name;
      if (data.contact_name !== undefined) updateData.contact_name = data.contact_name;
      if (data.contact_email !== undefined) updateData.contact_email = data.contact_email;
      if (data.contact_phone !== undefined) updateData.contact_phone = data.contact_phone;
      if (data.stage !== undefined) updateData.stage = data.stage;
      if (data.priority !== undefined) updateData.priority = data.priority;
      if (data.assigned_to !== undefined) updateData.assigned_to = data.assigned_to;
      if (data.previous_account_number !== undefined) updateData.previous_account_number = data.previous_account_number;
      if (data.revenue_potential !== undefined) updateData.revenue_potential = data.revenue_potential;
      if (data.last_contact_date !== undefined) updateData.last_contact_date = data.last_contact_date || null;
      if (data.next_followup_date !== undefined) updateData.next_followup_date = data.next_followup_date || null;
      if (data.reason_closed !== undefined) updateData.reason_closed = data.reason_closed;
      if (data.tags !== undefined) updateData.tags = data.tags;

      const { error } = await supabase
        .from('crm_accounts')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        accounts: state.accounts.map((a) =>
          a.id === id ? { ...a, ...data, updated_at: new Date().toISOString() } : a
        ),
      }));
    } catch (error) {
      console.error('Erreur mise a jour compte CRM:', error);
      throw error;
    }
  },

  // Delete account
  deleteAccount: async (id) => {
    try {
      const { error } = await supabase
        .from('crm_accounts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        accounts: state.accounts.filter((a) => a.id !== id),
        selectedAccountId: state.selectedAccountId === id ? null : state.selectedAccountId,
      }));
    } catch (error) {
      console.error('Erreur suppression compte CRM:', error);
      throw error;
    }
  },

  // Move account to a different pipeline stage
  moveAccountToStage: async (id, stage, actor) => {
    const account = get().accounts.find((a) => a.id === id);
    if (!account) return;

    const oldStage = account.stage;
    try {
      const { error } = await supabase
        .from('crm_accounts')
        .update({ stage })
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        accounts: state.accounts.map((a) =>
          a.id === id ? { ...a, stage, updated_at: new Date().toISOString() } : a
        ),
      }));

      // Log stage change activity
      await supabase.from('crm_activities').insert([{
        account_id: id,
        actor,
        action: 'changement_etape',
        details: `Deplace de "${oldStage}" vers "${stage}"`,
      }]);
    } catch (error) {
      console.error('Erreur deplacement compte CRM:', error);
      throw error;
    }
  },

  // Load notes for an account
  loadNotes: async (accountId) => {
    try {
      const { data, error } = await supabase
        .from('crm_notes')
        .select('*')
        .eq('account_id', accountId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      set((state) => ({
        notes: { ...state.notes, [accountId]: data || [] },
      }));
    } catch (error) {
      console.error('Erreur chargement notes CRM:', error);
    }
  },

  // Add note to account
  addNote: async (accountId, note) => {
    try {
      const { data, error } = await supabase
        .from('crm_notes')
        .insert([{
          account_id: accountId,
          author: note.author,
          content: note.content,
          note_type: note.note_type,
        }])
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        notes: {
          ...state.notes,
          [accountId]: [data, ...(state.notes[accountId] || [])],
        },
      }));

      // Update last contact date
      await supabase
        .from('crm_accounts')
        .update({ last_contact_date: new Date().toISOString() })
        .eq('id', accountId);

      set((state) => ({
        accounts: state.accounts.map((a) =>
          a.id === accountId
            ? { ...a, last_contact_date: new Date().toISOString() }
            : a
        ),
      }));

      // Log activity
      await supabase.from('crm_activities').insert([{
        account_id: accountId,
        actor: note.author,
        action: 'note_ajoutee',
        details: `${note.note_type}: ${note.content.substring(0, 100)}`,
      }]);
    } catch (error) {
      console.error('Erreur ajout note CRM:', error);
      throw error;
    }
  },

  // Delete a note
  deleteNote: async (noteId, accountId) => {
    try {
      const { error } = await supabase
        .from('crm_notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;

      set((state) => ({
        notes: {
          ...state.notes,
          [accountId]: (state.notes[accountId] || []).filter((n) => n.id !== noteId),
        },
      }));
    } catch (error) {
      console.error('Erreur suppression note CRM:', error);
      throw error;
    }
  },

  // Load activities for an account
  loadActivities: async (accountId) => {
    try {
      const { data, error } = await supabase
        .from('crm_activities')
        .select('*')
        .eq('account_id', accountId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      set((state) => ({
        activities: { ...state.activities, [accountId]: data || [] },
      }));
    } catch (error) {
      console.error('Erreur chargement activites CRM:', error);
    }
  },

  // Get accounts filtered by stage
  getAccountsByStage: (stage) => {
    const { accounts, searchQuery, filterAssignee } = get();
    return accounts.filter((a) => {
      if (a.stage !== stage) return false;
      if (filterAssignee !== 'all' && a.assigned_to !== filterAssignee) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          a.company_name.toLowerCase().includes(q) ||
          a.contact_name.toLowerCase().includes(q) ||
          a.contact_email.toLowerCase().includes(q) ||
          a.previous_account_number.toLowerCase().includes(q) ||
          a.tags.some((t) => t.toLowerCase().includes(q))
        );
      }
      return true;
    });
  },

  // Get all filtered accounts
  getFilteredAccounts: () => {
    const { accounts, searchQuery, filterStage, filterAssignee } = get();
    return accounts.filter((a) => {
      if (filterStage !== 'all' && a.stage !== filterStage) return false;
      if (filterAssignee !== 'all' && a.assigned_to !== filterAssignee) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          a.company_name.toLowerCase().includes(q) ||
          a.contact_name.toLowerCase().includes(q) ||
          a.contact_email.toLowerCase().includes(q) ||
          a.previous_account_number.toLowerCase().includes(q) ||
          a.tags.some((t) => t.toLowerCase().includes(q))
        );
      }
      return true;
    });
  },

  getAccountById: (id) => get().accounts.find((a) => a.id === id),

  // Dashboard stats
  getStats: () => {
    const { accounts } = get();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const byStage: Record<AccountStage, number> = {
      prospect: 0,
      contact_initial: 0,
      en_negociation: 0,
      relance: 0,
      actif: 0,
      perdu: 0,
    };

    let highPriority = 0;
    let followupsToday = 0;
    let followupsOverdue = 0;

    accounts.forEach((a) => {
      byStage[a.stage]++;
      if (a.priority === 'haute' && a.stage !== 'actif' && a.stage !== 'perdu') {
        highPriority++;
      }
      if (a.next_followup_date) {
        const followup = new Date(a.next_followup_date);
        followup.setHours(0, 0, 0, 0);
        if (followup.getTime() === today.getTime()) {
          followupsToday++;
        } else if (followup < today && a.stage !== 'actif' && a.stage !== 'perdu') {
          followupsOverdue++;
        }
      }
    });

    return {
      total: accounts.length,
      byStage,
      highPriority,
      followupsToday,
      followupsOverdue,
    };
  },
}));
