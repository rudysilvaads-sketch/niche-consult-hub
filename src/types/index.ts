export type ProfessionalCategory = 
  | 'advogado'
  | 'terapeuta'
  | 'sexologo'
  | 'medico'
  | 'dentista'
  | 'psicologo'
  | 'nutricionista'
  | 'fisioterapeuta';

export interface Professional {
  id: string;
  name: string;
  category: ProfessionalCategory;
  email: string;
  phone: string;
  avatar?: string;
}

export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  cpf: string;
  address?: string;
  notes?: string;
  createdAt: string;
}

export type AppointmentStatus = 'agendado' | 'confirmado' | 'em_andamento' | 'concluido' | 'cancelado';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  professionalId: string;
  date: string;
  time: string;
  duration: number; // in minutes
  status: AppointmentStatus;
  type: string;
  notes?: string;
  createdAt: string;
}

export interface ConsultationRecord {
  id: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  date: string;
  diagnosis?: string;
  treatment?: string;
  observations?: string;
  prescriptions?: string;
  attachments?: string[];
  createdAt: string;
}

export interface DashboardStats {
  totalPatients: number;
  totalAppointments: number;
  todayAppointments: number;
  weekAppointments: number;
  completedThisMonth: number;
  canceledThisMonth: number;
}

export const CATEGORY_LABELS: Record<ProfessionalCategory, string> = {
  advogado: 'Advocacia',
  terapeuta: 'Terapia',
  sexologo: 'Sexologia',
  medico: 'Medicina',
  dentista: 'Odontologia',
  psicologo: 'Psicologia',
  nutricionista: 'Nutrição',
  fisioterapeuta: 'Fisioterapia',
};

export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  agendado: 'Agendado',
  confirmado: 'Confirmado',
  em_andamento: 'Em Andamento',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
};
