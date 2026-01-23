import { useState, useEffect, useCallback, useRef } from 'react';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import { VideoSession, TranscriptionSegment, AIAnalysis } from '@/types/telehealth';

export function useVideoSession(sessionId?: string) {
  const [session, setSession] = useState<VideoSession | null>(null);
  const [transcription, setTranscription] = useState<TranscriptionSegment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured || !db || !sessionId) {
      setLoading(false);
      return;
    }

    // Subscribe to session
    const sessionUnsub = onSnapshot(
      doc(db, 'videoSessions', sessionId),
      (snapshot) => {
        if (snapshot.exists()) {
          setSession({ id: snapshot.id, ...snapshot.data() } as VideoSession);
        }
        setLoading(false);
      }
    );

    // Subscribe to transcription segments
    const transQ = query(
      collection(db, 'transcriptionSegments'),
      where('sessionId', '==', sessionId),
      orderBy('timestamp', 'asc')
    );

    const transUnsub = onSnapshot(transQ, (snapshot) => {
      const segments = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as TranscriptionSegment[];
      setTranscription(segments);
    });

    return () => {
      sessionUnsub();
      transUnsub();
    };
  }, [sessionId]);

  const createSession = useCallback(
    async (appointmentId: string, patientId: string, patientName: string, professionalId: string) => {
      if (!isFirebaseConfigured || !db) return null;

      const newSession: Omit<VideoSession, 'id'> = {
        appointmentId,
        patientId,
        patientName,
        professionalId,
        status: 'waiting',
        createdAt: new Date().toISOString(),
      };

      try {
        const docRef = await addDoc(collection(db, 'videoSessions'), newSession);
        return { id: docRef.id, ...newSession };
      } catch (error) {
        console.error('Error creating video session:', error);
        throw error;
      }
    },
    []
  );

  const startSession = useCallback(async (id: string) => {
    if (!isFirebaseConfigured || !db) return;

    try {
      await updateDoc(doc(db, 'videoSessions', id), {
        status: 'in_progress',
        startedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error starting session:', error);
      throw error;
    }
  }, []);

  const endSession = useCallback(async (id: string) => {
    if (!isFirebaseConfigured || !db || !session) return;

    const endedAt = new Date().toISOString();
    const startedAt = session.startedAt ? new Date(session.startedAt) : new Date();
    const duration = Math.round((new Date(endedAt).getTime() - startedAt.getTime()) / 60000);

    // Compile full transcription
    const fullTranscription = transcription
      .map((seg) => `[${seg.speaker === 'therapist' ? 'Terapeuta' : 'Paciente'}]: ${seg.text}`)
      .join('\n');

    try {
      await updateDoc(doc(db, 'videoSessions', id), {
        status: 'completed',
        endedAt,
        duration,
        transcription: fullTranscription,
      });
    } catch (error) {
      console.error('Error ending session:', error);
      throw error;
    }
  }, [session, transcription]);

  const addTranscriptionSegment = useCallback(
    async (speaker: 'therapist' | 'patient', text: string, timestamp: number) => {
      if (!isFirebaseConfigured || !db || !sessionId) return;

      const segment: Omit<TranscriptionSegment, 'id'> = {
        sessionId,
        speaker,
        text,
        timestamp,
        createdAt: new Date().toISOString(),
      };

      try {
        await addDoc(collection(db, 'transcriptionSegments'), segment);
      } catch (error) {
        console.error('Error adding transcription segment:', error);
      }
    },
    [sessionId]
  );

  const saveAIAnalysis = useCallback(
    async (analysis: Omit<AIAnalysis, 'id' | 'sessionId' | 'createdAt'>) => {
      if (!isFirebaseConfigured || !db || !sessionId) return;

      const fullAnalysis: Omit<AIAnalysis, 'id'> = {
        ...analysis,
        sessionId,
        createdAt: new Date().toISOString(),
      };

      try {
        const docRef = await addDoc(collection(db, 'aiAnalyses'), fullAnalysis);
        
        // Update session with AI analysis reference
        await updateDoc(doc(db, 'videoSessions', sessionId), {
          aiAnalysis: { id: docRef.id, ...fullAnalysis },
        });

        return { id: docRef.id, ...fullAnalysis };
      } catch (error) {
        console.error('Error saving AI analysis:', error);
        throw error;
      }
    },
    [sessionId]
  );

  return {
    session,
    transcription,
    loading,
    createSession,
    startSession,
    endSession,
    addTranscriptionSegment,
    saveAIAnalysis,
  };
}

// Hook for WebRTC functionality
export function useWebRTC(sessionId: string, isTherapist: boolean) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  const initializeMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw error;
    }
  }, []);

  const createPeerConnection = useCallback(() => {
    const configuration: RTCConfiguration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    };

    const pc = new RTCPeerConnection(configuration);

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
      setIsConnected(true);
    };

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === 'disconnected') {
        setIsConnected(false);
      }
    };

    peerConnectionRef.current = pc;
    return pc;
  }, []);

  const toggleMute = useCallback(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  }, [localStream, isMuted]);

  const toggleVideo = useCallback(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  }, [localStream, isVideoOff]);

  const cleanup = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    setLocalStream(null);
    setRemoteStream(null);
    setIsConnected(false);
  }, [localStream]);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  return {
    localStream,
    remoteStream,
    isConnected,
    isMuted,
    isVideoOff,
    initializeMedia,
    createPeerConnection,
    toggleMute,
    toggleVideo,
    cleanup,
    peerConnection: peerConnectionRef.current,
  };
}
