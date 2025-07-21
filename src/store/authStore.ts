import { create } from 'zustand';
import { createClient } from '@supabase/supabase-js';
import { User } from '../types';

const supabase = createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_SUPABASE_ANON_KEY'
);

interface AuthStore {
  user: User | null;
  loading: boolean;
  signIn: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: false,

  signIn: async (email) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
      });
      if (error) throw error;
      // L'utilisateur recevra un email avec un lien de connexion
    } catch (error) {
      console.error('Error signing in:', error);
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    try {
      await supabase.auth.signOut();
      set({ user: null });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  },
}));