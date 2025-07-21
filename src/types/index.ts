export interface Message {
  id: string;
  title: string;
  description: string;
  sender: string;
  timestamp: string;
  priority: 'niveau1' | 'niveau2' | 'niveau3';
  readBy: string[];
  isFlashing?: boolean;
  assignedTo?: string;
  assignedAt?: string;
  // Nouvelles propriétés pour les clients
  clientName?: string;
  dealerName?: string;
}

export interface PriorityAlert {
  active: boolean;
  message: string;
  color: 'red' | 'green';
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface TeamMember {
  id: string;
  name: string;
  active: boolean;
  created_at: string;
  phone_number?: string;
}

export interface SMSNotification {
  memberName: string;
  phoneNumber: string;
  clientName: string;
  dealerName: string;
}