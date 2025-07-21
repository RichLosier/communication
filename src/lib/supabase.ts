import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Enhanced validation with detailed error messages
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Configuration Supabase manquante:');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? 'Défini' : 'MANQUANT');
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Défini' : 'MANQUANT');
  throw new Error('Variables d\'environnement Supabase manquantes. Veuillez configurer VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY');
}

// Validate URL format
try {
  new URL(supabaseUrl);
} catch (error) {
  console.error('URL Supabase invalide:', supabaseUrl);
  throw new Error('VITE_SUPABASE_URL doit être une URL valide');
}

console.log('Configuration Supabase:');
console.log('URL:', supabaseUrl);
console.log('Clé anonyme configurée:', supabaseAnonKey ? 'Oui' : 'Non');

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false // Disable auth persistence for now
  }
});

// Test connection on initialization
supabase.from('priority_alerts').select('count', { count: 'exact', head: true })
  .then(({ error }) => {
    if (error) {
      console.error('Test de connexion Supabase échoué:', error);
    } else {
      console.log('Connexion Supabase établie avec succès');
    }
  })
  .catch((error) => {
    console.error('Erreur lors du test de connexion Supabase:', error);
  });

// Types pour TypeScript
export interface DatabaseMessage {
  id: string;
  title: string;
  description: string;
  priority: 'niveau1' | 'niveau2' | 'niveau3';
  sender: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseSalesData {
  id: string;
  date: string;
  daily_sales: number;
  monthly_sales: number;
  daily_goal: number;
  monthly_goal: number;
  working_days_in_month: number;
  remaining_working_days_override: number | null;
  catch_up_percentage: number;
  custom_daily_goals: Record<string, number>;
  created_at: string;
  updated_at: string;
}

export interface DatabasePriorityAlert {
  id: string;
  active: boolean;
  message: string;
  color: 'red' | 'green';
  created_at: string;
  updated_at: string;
}