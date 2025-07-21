import { create } from 'zustand';
import { Message, PriorityAlert, TeamMember } from '../types';
import { supabase, DatabaseMessage, DatabasePriorityAlert } from '../lib/supabase';

interface MessageStore {
  messages: Message[];
  teamMembers: TeamMember[];
  priorityAlert: PriorityAlert;
  loading: boolean;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => Promise<void>;
  updateMessage: (message: Message) => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;
  assignMessage: (messageId: string, memberName: string) => Promise<void>;
  unassignMessage: (messageId: string) => Promise<void>;
  updatePriorityAlert: (alert: PriorityAlert) => Promise<void>;
  loadMessages: () => Promise<void>;
  loadTeamMembers: () => Promise<void>;
  loadPriorityAlert: () => Promise<void>;
  markAsRead: (messageId: string, userId: string) => void;
  clearAllMessages: () => Promise<void>;
}

const defaultPriorityAlert: PriorityAlert = {
  active: false,
  message: "",
  color: 'red'
};

// Fonction pour convertir un message de la DB vers le format de l'app
const convertDbMessageToMessage = (dbMessage: DatabaseMessage): Message => ({
  id: dbMessage.id,
  title: dbMessage.title,
  description: dbMessage.description,
  priority: dbMessage.priority,
  sender: dbMessage.sender,
  timestamp: new Date(dbMessage.created_at).toLocaleString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    day: 'numeric',
    month: 'long'
  }),
  readBy: [], // Pour l'instant, on ne gère pas la lecture en DB
  isFlashing: (dbMessage as any).is_flashing || false,
  assignedTo: (dbMessage as any).assigned_to || undefined,
  assignedAt: (dbMessage as any).assigned_at ? new Date((dbMessage as any).assigned_at).toLocaleString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    day: 'numeric',
    month: 'short'
  }) : undefined,
  clientName: (dbMessage as any).client_name || undefined,
  dealerName: (dbMessage as any).dealer_name || undefined
});

// Fonction pour convertir une alerte de la DB vers le format de l'app
const convertDbAlertToAlert = (dbAlert: DatabasePriorityAlert): PriorityAlert => ({
  active: dbAlert.active,
  message: dbAlert.message,
  color: dbAlert.color
});

export const useMessageStore = create<MessageStore>((set, get) => ({
  messages: [],
  teamMembers: [],
  priorityAlert: defaultPriorityAlert,
  loading: false,
  
  loadMessages: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const messages = data.map(convertDbMessageToMessage);
      set({ messages });
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
      // Set empty array on error to prevent app crash
      set({ messages: [] });
    } finally {
      set({ loading: false });
    }
  },

  loadTeamMembers: async () => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('active', true)
        .order('name');
      
      if (error) throw error;
      
      set({ teamMembers: data || [] });
    } catch (error) {
      console.error('Erreur lors du chargement des membres de l\'équipe:', error);
      set({ teamMembers: [] });
    }
  },

  loadPriorityAlert: async () => {
    try {
      // Check if Supabase client is properly configured
      if (!supabase) {
        console.error('Client Supabase non configuré');
        set({ priorityAlert: defaultPriorityAlert });
        return;
      }

      const { data, error } = await supabase
        .from('priority_alerts')
        .select('*')
        .limit(1)
        .single();
      
      // Handle case where no priority alert exists (PGRST116 is "not found" error)
      if (error && error.code !== 'PGRST116') {
        console.error('Erreur Supabase lors du chargement de l\'alerte prioritaire:', error);
        throw error;
      }
      
      if (data) {
        const alert = convertDbAlertToAlert(data);
        set({ priorityAlert: alert });
      } else {
        // No priority alert found, use default
        set({ priorityAlert: defaultPriorityAlert });
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'alerte prioritaire:', error);
      
      // Provide more detailed error information
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.error('Erreur de connectivité réseau. Vérifiez:');
        console.error('1. Votre connexion internet');
        console.error('2. L\'URL Supabase dans .env:', import.meta.env.VITE_SUPABASE_URL);
        console.error('3. Que le projet Supabase est actif');
      }
      
      // Set default alert to prevent app crash
      set({ priorityAlert: defaultPriorityAlert });
    }
  },
  
  addMessage: async (messageData) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([{
          title: messageData.title,
          description: messageData.description,
          priority: messageData.priority,
          sender: messageData.sender || '',
          is_flashing: messageData.isFlashing || false,
          client_name: messageData.clientName || null,
          dealer_name: messageData.dealerName || null
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      const newMessage = convertDbMessageToMessage(data);
      set((state) => ({
        messages: [newMessage, ...state.messages]
      }));
    } catch (error) {
      console.error('Erreur lors de l\'ajout du message:', error);
      throw error;
    }
  },
  
  updateMessage: async (updatedMessage) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({
          title: updatedMessage.title,
          description: updatedMessage.description,
          priority: updatedMessage.priority,
          sender: updatedMessage.sender,
          is_flashing: updatedMessage.isFlashing || false,
          client_name: updatedMessage.clientName || null,
          dealer_name: updatedMessage.dealerName || null
        })
        .eq('id', updatedMessage.id);
      
      if (error) throw error;
      
      set((state) => ({
        messages: state.messages.map(msg => 
          msg.id === updatedMessage.id ? updatedMessage : msg
        )
      }));
    } catch (error) {
      console.error('Erreur lors de la mise à jour du message:', error);
      throw error;
    }
  },
  
  deleteMessage: async (id) => {
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      set((state) => ({
        messages: state.messages.filter(msg => msg.id !== id)
      }));
    } catch (error) {
      console.error('Erreur lors de la suppression du message:', error);
      throw error;
    }
  },

  assignMessage: async (messageId, memberName) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({
          assigned_to: memberName,
          assigned_at: new Date().toISOString()
        })
        .eq('id', messageId);
      
      if (error) throw error;
      
      // Recharger les messages pour avoir les données à jour
      await get().loadMessages();
    } catch (error) {
      console.error('Erreur lors de l\'assignation du message:', error);
      throw error;
    }
  },

  unassignMessage: async (messageId) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({
          assigned_to: null,
          assigned_at: null
        })
        .eq('id', messageId);
      
      if (error) throw error;
      
      // Recharger les messages pour avoir les données à jour
      await get().loadMessages();
    } catch (error) {
      console.error('Erreur lors de la désassignation du message:', error);
      throw error;
    }
  },
  
  updatePriorityAlert: async (alert) => {
    try {
      const { error } = await supabase
        .from('priority_alerts')
        .upsert({
          active: alert.active,
          message: alert.message,
          color: alert.color
        });
      
      if (error) throw error;
      
      set({ priorityAlert: alert });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'alerte prioritaire:', error);
      throw error;
    }
  },

  markAsRead: (messageId, userId) => {
    // Pour l'instant, on garde cette fonctionnalité locale
    set((state) => ({
      messages: state.messages.map(msg =>
        msg.id === messageId
          ? { ...msg, readBy: [...msg.readBy, userId] }
          : msg
      )
    }));
  },

  clearAllMessages: async () => {
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Supprimer tous les messages
      
      if (error) throw error;
      
      set({ messages: [], priorityAlert: defaultPriorityAlert });
    } catch (error) {
      console.error('Erreur lors de la suppression de tous les messages:', error);
      throw error;
    }
  }
}));