import { useState, useEffect, useCallback } from 'react';
import { doc, onSnapshot, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';

interface WaitingParticipant {
  odid: string;
  name: string;
  joinedAt: string;
}

interface UseWaitingRoomProps {
  sessionId: string;
  isHost: boolean;
  participantName?: string;
}

export function useWaitingRoom({ sessionId, isHost, participantName }: UseWaitingRoomProps) {
  const [waitingParticipants, setWaitingParticipants] = useState<WaitingParticipant[]>([]);
  const [isAdmitted, setIsAdmitted] = useState(false);
  const [isDenied, setIsDenied] = useState(false);
  const [loading, setLoading] = useState(true);

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
        const admitted = data.admittedParticipants || [];
        const denied = data.deniedParticipants || [];

        setWaitingParticipants(waiting);

        // Check if current participant was admitted or denied
        if (!isHost && participantName) {
          const participantId = `${participantName}-${sessionId}`;
          setIsAdmitted(admitted.includes(participantId));
          setIsDenied(denied.includes(participantId));
        }
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [sessionId, isHost, participantName]);

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
      await updateDoc(callDoc, {
        waitingParticipants: arrayUnion(participant),
      });
      console.log('✅ Joined waiting room');
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

  return {
    waitingParticipants,
    isAdmitted,
    isDenied,
    loading,
    joinWaitingRoom,
    leaveWaitingRoom,
    admitParticipant,
    denyParticipant,
  };
}
