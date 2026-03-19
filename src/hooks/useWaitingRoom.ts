import { useState, useEffect, useCallback, useRef } from 'react';
import { doc, onSnapshot, updateDoc, arrayUnion, arrayRemove, setDoc, getDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';

interface WaitingParticipant {
  odid: string;
  name: string;
  joinedAt: string;
}

interface WaitingRoomMessage {
  id: string;
  sender: 'host' | 'patient';
  senderName: string;
  text: string;
  timestamp: string;
}

interface TypingStatus {
  [key: string]: { name: string; timestamp: number };
}

interface UseWaitingRoomProps {
  sessionId: string;
  isHost: boolean;
  participantName?: string;
}

const TYPING_TIMEOUT = 3000; // 3 seconds

export function useWaitingRoom({ sessionId, isHost, participantName }: UseWaitingRoomProps) {
  const [waitingParticipants, setWaitingParticipants] = useState<WaitingParticipant[]>([]);
  const [messages, setMessages] = useState<WaitingRoomMessage[]>([]);
  const [isAdmitted, setIsAdmitted] = useState(false);
  const [isDenied, setIsDenied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [currentParticipantName, setCurrentParticipantName] = useState(participantName || '');

  useEffect(() => {
    if (participantName) {
      setCurrentParticipantName(participantName);
    }
  }, [participantName]);

  // Subscribe to waiting room state
  useEffect(() => {
    if (!isFirebaseConfigured || !db || !sessionId) {
      setLoading(false);
      return;
    }

    const callDoc = doc(db, 'calls', sessionId);
    
    const unsubscribe = onSnapshot(callDoc, (snapshot) => {
      const data = snapshot.data();
      
      if (data) {
        const waiting = data.waitingParticipants || [];
        const admitted: string[] = data.admittedParticipants || [];
        const denied: string[] = data.deniedParticipants || [];
        const roomMessages: WaitingRoomMessage[] = data.waitingRoomMessages || [];
        const typing: TypingStatus = data.typingStatus || {};

        setWaitingParticipants(waiting);
        setMessages(roomMessages);

        // Process typing status - filter out expired and self
        const now = Date.now();
        const myKey = isHost ? 'host' : `patient-${currentParticipantName}`;
        const activeTypers = Object.entries(typing)
          .filter(([key, val]) => key !== myKey && (now - val.timestamp) < TYPING_TIMEOUT)
          .map(([, val]) => val.name);
        setTypingUsers(activeTypers);

        // Check if current participant was admitted or denied
        if (!isHost && currentParticipantName) {
          const participantId = `${currentParticipantName}-${sessionId}`;
          setIsAdmitted(admitted.includes(participantId));
          setIsDenied(denied.includes(participantId));
        }
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [sessionId, isHost, currentParticipantName]);

  // Set typing status
  const setTyping = useCallback(async (name: string) => {
    if (!isFirebaseConfigured || !db || !sessionId) return;

    const callDoc = doc(db, 'calls', sessionId);
    const key = isHost ? 'host' : `patient-${name}`;

    try {
      await updateDoc(callDoc, {
        [`typingStatus.${key}`]: { name, timestamp: Date.now() },
      });

      // Clear typing after timeout
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(async () => {
        try {
          await updateDoc(callDoc, {
            [`typingStatus.${key}`]: { name, timestamp: 0 },
          });
        } catch (e) { /* ignore */ }
      }, TYPING_TIMEOUT);
    } catch (e) { /* ignore */ }
  }, [sessionId, isHost]);

  // Join waiting room
  const joinWaitingRoom = useCallback(async (name: string) => {
    if (!isFirebaseConfigured || !db || !sessionId) return;

    const callDoc = doc(db, 'calls', sessionId);
    const participant: WaitingParticipant = {
      odid: `${name}-${sessionId}`,
      name,
      joinedAt: new Date().toISOString(),
    };

    try {
      const docSnap = await getDoc(callDoc);
      if (!docSnap.exists()) {
        await setDoc(callDoc, {
          waitingParticipants: [participant],
          admittedParticipants: [],
          deniedParticipants: [],
          typingStatus: {},
          createdAt: new Date().toISOString(),
        });
      } else {
        await updateDoc(callDoc, {
          waitingParticipants: arrayUnion(participant),
        });
      }
    } catch (error) {
      console.error('❌ Error joining waiting room:', error);
    }
  }, [sessionId]);

  // Leave waiting room
  const leaveWaitingRoom = useCallback(async (name: string) => {
    if (!isFirebaseConfigured || !db || !sessionId) return;

    const callDoc = doc(db, 'calls', sessionId);
    const participantToRemove = waitingParticipants.find(p => p.name === name);

    if (participantToRemove) {
      try {
        await updateDoc(callDoc, {
          waitingParticipants: arrayRemove(participantToRemove),
        });
      } catch (error) {
        console.error('❌ Error leaving waiting room:', error);
      }
    }
  }, [sessionId, waitingParticipants]);

  // Admit participant
  const admitParticipant = useCallback(async (participant: WaitingParticipant) => {
    if (!isFirebaseConfigured || !db || !sessionId || !isHost) return;

    const callDoc = doc(db, 'calls', sessionId);
    try {
      await updateDoc(callDoc, {
        waitingParticipants: arrayRemove(participant),
        admittedParticipants: arrayUnion(participant.odid),
      });
    } catch (error) {
      console.error('❌ Error admitting participant:', error);
    }
  }, [sessionId, isHost]);

  // Deny participant
  const denyParticipant = useCallback(async (participant: WaitingParticipant) => {
    if (!isFirebaseConfigured || !db || !sessionId || !isHost) return;

    const callDoc = doc(db, 'calls', sessionId);
    try {
      await updateDoc(callDoc, {
        waitingParticipants: arrayRemove(participant),
        deniedParticipants: arrayUnion(participant.odid),
      });
    } catch (error) {
      console.error('❌ Error denying participant:', error);
    }
  }, [sessionId, isHost]);

  // Send message
  const sendMessage = useCallback(async (text: string, senderName: string) => {
    if (!isFirebaseConfigured || !db || !sessionId || !text.trim()) return;

    const callDoc = doc(db, 'calls', sessionId);
    const message: WaitingRoomMessage = {
      id: `msg-${Date.now()}`,
      sender: isHost ? 'host' : 'patient',
      senderName,
      text: text.trim(),
      timestamp: new Date().toISOString(),
    };

    // Clear typing status when sending
    const key = isHost ? 'host' : `patient-${senderName}`;
    try {
      await updateDoc(callDoc, {
        waitingRoomMessages: arrayUnion(message),
        [`typingStatus.${key}`]: { name: senderName, timestamp: 0 },
      });
    } catch (error) {
      console.error('❌ Error sending message:', error);
    }
  }, [sessionId, isHost]);

  return {
    waitingParticipants,
    messages,
    isAdmitted,
    isDenied,
    loading,
    typingUsers,
    joinWaitingRoom,
    leaveWaitingRoom,
    admitParticipant,
    denyParticipant,
    sendMessage,
    setTyping,
  };
}
