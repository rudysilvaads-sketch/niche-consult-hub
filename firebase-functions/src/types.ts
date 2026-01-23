export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientEmail?: string;
  professionalId: string;
  professionalName?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  duration: number; // minutes
  type: 'online' | 'presencial';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  reminderSent1h?: boolean;
  reminderSent24h?: boolean;
  createdAt: string;
}

export interface UserNotificationSettings {
  userId: string;
  tokens: string[];
  enabled: boolean;
  appointmentReminders: boolean;
  reminderTiming: '1h' | '24h' | 'both';
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  click_action?: string;
  data?: Record<string, string>;
}

export interface ReminderResult {
  success: boolean;
  appointmentId: string;
  patientId: string;
  type: '1h' | '24h';
  error?: string;
}
