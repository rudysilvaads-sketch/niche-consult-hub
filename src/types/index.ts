export type ProfessionalCategory = 
  | 'terapeuta'
  | 'sexologo'
  | 'psicologo'
  | 'psicanalista'
  | 'constelador';

export type TherapyApproach = 
  | 'tcc'
  | 'psicanalise'
  | 'gestalt'
  | 'humanista'
  | 'sistemica'
  | 'integrativa'
  | 'constelacao'
  | 'sexologia_clinica'
  | 'terapia_casal'
  | 'outra';

export interface ProfessionalProfile {
  id: string;
  userId: string;
  name: string;
  category: ProfessionalCategory;
  email: string;
  phone: string;
  photoUrl?: string;
  bio?: string;
  registrationNumber?: string; // CRP, CRM, etc.
  specialty?: string;
  approaches?: TherapyApproach[];
  sessionDuration?: number;
  sessionPrice?: number;
  clinicName?: string;
  clinicAddress?: string;
  clinicCity?: string;
  clinicState?: string;
  onlineService?: boolean;
  inPersonService?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Professional {
  id: string;
  name: string;
  category: ProfessionalCategory;
  email: string;
  phone: string;
  avatar?: string;
}

export type PatientStatus = 'ativo' | 'inativo';

// Family/Group types
export type PatientGroupType = 'familia' | 'casal' | 'grupo_terapeutico';

export type RelationshipType = 
  | 'conjuge'
  | 'pai'
  | 'mae'
  | 'filho'
  | 'filha'
  | 'irmao'
  | 'irma'
  | 'parceiro'
  | 'parceira'
  | 'outro';

export interface PatientGroup {
  id: string;
  name: string;
  type: PatientGroupType;
  description?: string;
  memberIds: string[];
  createdAt: string;
}

export interface PatientRelationship {
  id: string;
  patientId: string;
  relatedPatientId: string;
  relationship: RelationshipType;
  groupId?: string;
  createdAt: string;
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
  status: PatientStatus;
  createdAt: string;
  // Financial
  packageId?: string;
  sessionsRemaining?: number;
  // Groups
  groupIds?: string[];
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
  // Reminder tracking
  reminderSent1h?: boolean;
  reminderSent24h?: boolean;
  reminderSent1hAt?: string;
  reminderSent24hAt?: string;
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
  terapeuta: 'Terapeuta',
  sexologo: 'Sexólogo(a)',
  psicologo: 'Psicólogo(a)',
  psicanalista: 'Psicanalista',
  constelador: 'Constelador(a)',
};

export const THERAPY_APPROACH_LABELS: Record<TherapyApproach, string> = {
  tcc: 'Terapia Cognitivo-Comportamental (TCC)',
  psicanalise: 'Psicanálise',
  gestalt: 'Gestalt-terapia',
  humanista: 'Abordagem Humanista',
  sistemica: 'Terapia Sistêmica',
  integrativa: 'Abordagem Integrativa',
  constelacao: 'Constelação Familiar',
  sexologia_clinica: 'Sexologia Clínica',
  terapia_casal: 'Terapia de Casal',
  outra: 'Outra',
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

export const GROUP_TYPE_LABELS: Record<PatientGroupType, string> = {
  familia: 'Família',
  casal: 'Casal',
  grupo_terapeutico: 'Grupo Terapêutico',
};

export const RELATIONSHIP_LABELS: Record<RelationshipType, string> = {
  conjuge: 'Cônjuge',
  pai: 'Pai',
  mae: 'Mãe',
  filho: 'Filho',
  filha: 'Filha',
  irmao: 'Irmão',
  irma: 'Irmã',
  parceiro: 'Parceiro(a)',
  parceira: 'Parceira',
  outro: 'Outro',
};
