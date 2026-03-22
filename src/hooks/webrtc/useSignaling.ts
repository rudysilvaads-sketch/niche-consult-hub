import { useCallback, useRef } from 'react';
import {
  doc,
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  getDoc,
  setDoc,
  getDocs,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';

interface UseSignalingProps {
  sessionId: string;
  isHost: boolean;
}

export function useSignaling({ sessionId, isHost }: UseSignalingProps) {
  const unsubscribersRef = useRef<(() => void)[]>([]);

  const startAsHost = useCallback(async (pc: RTCPeerConnection) => {
    if (!isFirebaseConfigured || !db || !sessionId) {
      throw new Error('Firebase não configurado');
    }

    const callDoc = doc(db, 'calls', sessionId);
    const offerCandidates = collection(callDoc, 'offerCandidates');
    const answerCandidates = collection(callDoc, 'answerCandidates');

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        addDoc(offerCandidates, event.candidate.toJSON());
      }
    };

    const offerDescription = await pc.createOffer();
    await pc.setLocalDescription(offerDescription);
    console.log('📝 Created offer');

    await setDoc(callDoc, {
      offer: { sdp: offerDescription.sdp, type: offerDescription.type },
      createdAt: new Date().toISOString(),
    });

    const unsubAnswer = onSnapshot(callDoc, (snapshot) => {
      const data = snapshot.data();
      if (!pc.currentRemoteDescription && data?.answer) {
        console.log('📩 Received answer');
        pc.setRemoteDescription(new RTCSessionDescription(data.answer));
      }
    });
    unsubscribersRef.current.push(unsubAnswer);

    const unsubCandidates = onSnapshot(answerCandidates, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          pc.addIceCandidate(new RTCIceCandidate(change.doc.data()));
        }
      });
    });
    unsubscribersRef.current.push(unsubCandidates);
  }, [sessionId]);

  const joinAsGuest = useCallback(async (pc: RTCPeerConnection) => {
    if (!isFirebaseConfigured || !db || !sessionId) {
      throw new Error('Firebase não configurado');
    }

    const callDoc = doc(db, 'calls', sessionId);
    const answerCandidates = collection(callDoc, 'answerCandidates');
    const offerCandidates = collection(callDoc, 'offerCandidates');

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        addDoc(answerCandidates, event.candidate.toJSON());
      }
    };

    const callData = (await getDoc(callDoc)).data();
    if (!callData?.offer) {
      throw new Error('Chamada não encontrada');
    }

    console.log('📩 Got offer, setting remote description');
    await pc.setRemoteDescription(new RTCSessionDescription(callData.offer));

    const answerDescription = await pc.createAnswer();
    await pc.setLocalDescription(answerDescription);
    console.log('📝 Created answer');

    await updateDoc(callDoc, {
      answer: { type: answerDescription.type, sdp: answerDescription.sdp },
    });

    const unsubCandidates = onSnapshot(offerCandidates, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          pc.addIceCandidate(new RTCIceCandidate(change.doc.data()));
        }
      });
    });
    unsubscribersRef.current.push(unsubCandidates);
  }, [sessionId]);

  const cleanupSignaling = useCallback(async () => {
    unsubscribersRef.current.forEach((unsub) => unsub());
    unsubscribersRef.current = [];

    if (isHost && isFirebaseConfigured && db && sessionId) {
      try {
        const callDoc = doc(db, 'calls', sessionId);
        const offerCandidates = await getDocs(collection(callDoc, 'offerCandidates'));
        offerCandidates.forEach(async (d) => await deleteDoc(d.ref));
        const answerCandidates = await getDocs(collection(callDoc, 'answerCandidates'));
        answerCandidates.forEach(async (d) => await deleteDoc(d.ref));
        await deleteDoc(callDoc);
        console.log('🗑️ Cleaned up Firestore documents');
      } catch (err) {
        console.error('Error cleaning up Firestore:', err);
      }
    }
  }, [isHost, sessionId]);

  return {
    startAsHost,
    joinAsGuest,
    cleanupSignaling,
  };
}
