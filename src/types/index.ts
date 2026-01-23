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

export type PatientStatus = 'ativo' | 'inativo';

export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  cpf: string;
  address?: string;
  notes?: string;
  status: PatientStatus;
  createdAt: string;
  // Financial
  packageId?: string;
  sessionsRemaining?: number;
}

export type AppointmentStatus = 'agendado' | 'confirmado' | 'em_andamento' | 'concluido' | 'cancelado';

export type PaymentStatus = 'pendente' | 'pago' | 'parcial' | 'cancelado';

export type PaymentMethod = 'dinheiro' | 'pix' | 'cartao_credito' | 'cartao_debito' | 'transferencia' | 'boleto';

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
  // Financial
  value?: number;
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;
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

// Financial Types
export type TransactionType = 'receita' | 'despesa';
export type TransactionCategory = 
  | 'consulta' 
  | 'pacote' 
  | 'produto' 
  | 'outros_receita'
  | 'aluguel' 
  | 'salario' 
  | 'material' 
  | 'marketing' 
  | 'software' 
  | 'outros_despesa';

export interface Transaction {
  id: string;
  type: TransactionType;
  category: TransactionCategory;
  description: string;
  value: number;
  date: string;
  patientId?: string;
  patientName?: string;
  appointmentId?: string;
  paymentMethod?: PaymentMethod;
  status: PaymentStatus;
  createdAt: string;
}

export interface ServicePackage {
  id: string;
  name: string;
  description?: string;
  sessions: number;
  value: number;
  validity: number; // in days
  isActive: boolean;
  createdAt: string;
}

// Document Types
export type DocumentType = 'recibo' | 'atestado' | 'declaracao' | 'relatorio' | 'receituario';

export interface Document {
  id: string;
  type: DocumentType;
  patientId: string;
  patientName: string;
  appointmentId?: string;
  title: string;
  content: string;
  date: string;
  createdAt: string;
}

export interface DashboardStats {
  totalPatients: number;
  totalAppointments: number;
  todayAppointments: number;
  weekAppointments: number;
  completedThisMonth: number;
  canceledThisMonth: number;
  // Financial stats
  monthRevenue: number;
  monthExpenses: number;
  pendingPayments: number;
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

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pendente: 'Pendente',
  pago: 'Pago',
  parcial: 'Parcial',
  cancelado: 'Cancelado',
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  dinheiro: 'Dinheiro',
  pix: 'PIX',
  cartao_credito: 'Cartão de Crédito',
  cartao_debito: 'Cartão de Débito',
  transferencia: 'Transferência',
  boleto: 'Boleto',
};

export const TRANSACTION_CATEGORY_LABELS: Record<TransactionCategory, string> = {
  consulta: 'Consulta',
  pacote: 'Pacote',
  produto: 'Produto',
  outros_receita: 'Outros',
  aluguel: 'Aluguel',
  salario: 'Salário',
  material: 'Material',
  marketing: 'Marketing',
  software: 'Software/Sistemas',
  outros_despesa: 'Outros',
};

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  recibo: 'Recibo',
  atestado: 'Atestado',
  declaracao: 'Declaração',
  relatorio: 'Relatório',
  receituario: 'Receituário',
};
