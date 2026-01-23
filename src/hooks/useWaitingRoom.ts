import { useState, useEffect, useCallback } from 'react';
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

interface UseWaitingRoomProps {
  sessionId: string;
  isHost: boolean;
  participantName?: string;
}

export function useWaitingRoom({ sessionId, isHost, participantName }: UseWaitingRoomProps) {
  const [waitingParticipants, setWaitingParticipants] = useState<WaitingParticipant[]>([]);
  const [messages, setMessages] = useState<WaitingRoomMessage[]>([]);
  const [isAdmitted, setIsAdmitted] = useState(false);
  const [isDenied, setIsDenied] = useState(false);
  const [loading, setLoading] = useState(true);

  // Store participant name in a ref to track changes
  const [currentParticipantName, setCurrentParticipantName] = useState(participantName || '');

  // Update current participant name when prop changes
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

        setWaitingParticipants(waiting);
        setMessages(roomMessages);

        // Check if current participant was admitted or denied
        if (!isHost && currentParticipantName) {
          const participantId = `${currentParticipantName}-${sessionId}`;
          const wasAdmitted = admitted.includes(participantId);
          const wasDenied = denied.includes(participantId);
          
          console.log('🔍 Checking admission status:', { 
            participantId, 
            admitted, 
            wasAdmitted, 
            currentParticipantName 
          });
          
          setIsAdmitted(wasAdmitted);
          setIsDenied(wasDenied);
        }
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [sessionId, isHost, currentParticipantName]);

  // Join waiting room (for patients)
  const joinWaitingRoom = useCallback(async (name: string) => {
    if (!isFirebaseConfigured || !db || !sessionId) return;

    const callDoc = doc(db, 'calls', sessionId);
    const participant: WaitingParticipant = {
      odid: `${name}-${sessionId}`,
      name,
      joinedAt: new Date().toISOString(),
    };

    try {
      // Check if document exists, if not create it
      const docSnap = await getDoc(callDoc);
      
      if (!docSnap.exists()) {
        // Create the document with initial waiting participant
        await setDoc(callDoc, {
          waitingParticipants: [participant],
          admittedParticipants: [],
          deniedParticipants: [],
          createdAt: new Date().toISOString(),
        });
        console.log('✅ Created call document and joined waiting room');
      } else {
        // Document exists, just add to waiting list
        await updateDoc(callDoc, {
          waitingParticipants: arrayUnion(participant),
        });
        console.log('✅ Joined waiting room');
      }
    } catch (error) {
      console.error('❌ Error joining waiting room:', error);
    }
  }, [sessionId]);

  // Leave waiting room (for patients)
  const leaveWaitingRoom = useCallback(async (name: string) => {
    if (!isFirebaseConfigured || !db || !sessionId) return;

    const callDoc = doc(db, 'calls', sessionId);
    const participantToRemove = waitingParticipants.find(p => p.name === name);

    if (participantToRemove) {
      try {
        await updateDoc(callDoc, {
          waitingParticipants: arrayRemove(participantToRemove),
        });
        console.log('✅ Left waiting room');
      } catch (error) {
        console.error('❌ Error leaving waiting room:', error);
      }
    }
  }, [sessionId, waitingParticipants]);

  // Admit participant (for host)
  const admitParticipant = useCallback(async (participant: WaitingParticipant) => {
    if (!isFirebaseConfigured || !db || !sessionId || !isHost) return;

    const callDoc = doc(db, 'calls', sessionId);

    try {
      await updateDoc(callDoc, {
        waitingParticipants: arrayRemove(participant),
        admittedParticipants: arrayUnion(participant.odid),
      });
      console.log('✅ Participant admitted:', participant.name);
    } catch (error) {
      console.error('❌ Error admitting participant:', error);
    }
  }, [sessionId, isHost]);

  // Deny participant (for host)
  const denyParticipant = useCallback(async (participant: WaitingParticipant) => {
    if (!isFirebaseConfigured || !db || !sessionId || !isHost) return;

    const callDoc = doc(db, 'calls', sessionId);

    try {
      await updateDoc(callDoc, {
        waitingParticipants: arrayRemove(participant),
        deniedParticipants: arrayUnion(participant.odid),
      });
      console.log('✅ Participant denied:', participant.name);
    } catch (error) {
      console.error('❌ Error denying participant:', error);
    }
  }, [sessionId, isHost]);

  // Send message to waiting room
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

    try {
      await updateDoc(callDoc, {
        waitingRoomMessages: arrayUnion(message),
      });
      console.log('✅ Message sent:', text);
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
    joinWaitingRoom,
    leaveWaitingRoom,
    admitParticipant,
    denyParticipant,
    sendMessage,
  };
}
