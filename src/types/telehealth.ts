// Registration Link Types
export interface RegistrationLink {
  id: string;
  token: string;
  professionalId: string;
  expiresAt: string;
  maxUses: number;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
}

// Video Session Types
export type SessionStatus = 'waiting' | 'in_progress' | 'completed' | 'cancelled';

export interface VideoSession {
  id: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  professionalId: string;
  status: SessionStatus;
  startedAt?: string;
  endedAt?: string;
  duration?: number; // in minutes
  transcription?: string;
  aiAnalysis?: AIAnalysis;
  createdAt: string;
}

// Transcription Types
export interface TranscriptionSegment {
  id: string;
  sessionId: string;
  speaker: 'therapist' | 'patient';
  text: string;
  timestamp: number; // seconds from start
  createdAt: string;
}

// AI Analysis Types
export interface AIAnalysis {
  id: string;
  sessionId: string;
  summary: string;
  keyTopics: string[];
  emotionalState: string;
  suggestedFollowUp: string[];
  preDiagnosis?: string;
  riskIndicators?: string[];
  therapeuticNotes?: string;
  createdAt: string;
}

// WebRTC Signaling Types
export interface SignalingMessage {
  type: 'offer' | 'answer' | 'ice-candidate';
  sessionId: string;
  senderId: string;
  payload: RTCSessionDescriptionInit | RTCIceCandidateInit;
}

export const SESSION_STATUS_LABELS: Record<SessionStatus, string> = {
  waiting: 'Aguardando',
  in_progress: 'Em Andamento',
  completed: 'Concluída',
  cancelled: 'Cancelada',
};
