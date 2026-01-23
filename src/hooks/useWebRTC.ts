import { useState, useEffect, useCallback, useRef } from 'react';
import {
  doc,
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  getDoc,
  setDoc,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';

interface UseWebRTCProps {
  sessionId: string;
  isHost: boolean; // true = profissional (criador), false = paciente
  onRemoteStream?: (stream: MediaStream) => void;
  onConnectionStateChange?: (state: RTCPeerConnectionState) => void;
}

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
  ],
};

export function useWebRTCConnection({
  sessionId,
  isHost,
  onRemoteStream,
  onConnectionStateChange,
}: UseWebRTCProps) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [connectionState, setConnectionState] = useState<RTCPeerConnectionState>('new');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const unsubscribersRef = useRef<(() => void)[]>([]);

  // Initialize media devices
  const initializeMedia = useCallback(async () => {
    try {
      console.log('🎥 Requesting media access...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      console.log('✅ Media access granted');
      setLocalStream(stream);
      return stream;
    } catch (err) {
      console.error('❌ Error accessing media:', err);
      setError('Erro ao acessar câmera/microfone. Verifique as permissões.');
      throw err;
    }
  }, []);

  // Create peer connection
  const createPeerConnection = useCallback((stream: MediaStream) => {
    console.log('🔗 Creating peer connection...');
    const pc = new RTCPeerConnection(ICE_SERVERS);

    // Add local tracks
    stream.getTracks().forEach((track) => {
      console.log('📤 Adding track:', track.kind);
      pc.addTrack(track, stream);
    });

    // Handle remote tracks
    const remote = new MediaStream();
    pc.ontrack = (event) => {
      console.log('📥 Received remote track:', event.track.kind);
      event.streams[0].getTracks().forEach((track) => {
        remote.addTrack(track);
      });
      setRemoteStream(remote);
      onRemoteStream?.(remote);
    };

    // Connection state changes
    pc.onconnectionstatechange = () => {
      console.log('🔄 Connection state:', pc.connectionState);
      setConnectionState(pc.connectionState);
      onConnectionStateChange?.(pc.connectionState);
    };

    pc.oniceconnectionstatechange = () => {
      console.log('🧊 ICE connection state:', pc.iceConnectionState);
    };

    peerConnectionRef.current = pc;
    return pc;
  }, [onRemoteStream, onConnectionStateChange]);

  // Host: Create offer and wait for answer
  const startAsHost = useCallback(async () => {
    if (!isFirebaseConfigured || !db || !sessionId) {
      setError('Firebase não configurado');
      return;
    }

    try {
      console.log('👤 Starting as HOST...');
      const stream = await initializeMedia();
      const pc = createPeerConnection(stream);

      const callDoc = doc(db, 'calls', sessionId);
      const offerCandidates = collection(callDoc, 'offerCandidates');
      const answerCandidates = collection(callDoc, 'answerCandidates');

      // Collect ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('🧊 Adding offer ICE candidate');
          addDoc(offerCandidates, event.candidate.toJSON());
        }
      };

      // Create offer
      const offerDescription = await pc.createOffer();
      await pc.setLocalDescription(offerDescription);
      console.log('📝 Created offer');

      const offer = {
        sdp: offerDescription.sdp,
        type: offerDescription.type,
      };

      await setDoc(callDoc, { offer, createdAt: new Date().toISOString() });
      console.log('💾 Saved offer to Firestore');

      // Listen for answer
      const unsubAnswer = onSnapshot(callDoc, (snapshot) => {
        const data = snapshot.data();
        if (!pc.currentRemoteDescription && data?.answer) {
          console.log('📩 Received answer');
          const answerDescription = new RTCSessionDescription(data.answer);
          pc.setRemoteDescription(answerDescription);
        }
      });
      unsubscribersRef.current.push(unsubAnswer);

      // Listen for ICE candidates from guest
      const unsubCandidates = onSnapshot(answerCandidates, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            console.log('🧊 Adding answer ICE candidate');
            const candidate = new RTCIceCandidate(change.doc.data());
            pc.addIceCandidate(candidate);
          }
        });
      });
      unsubscribersRef.current.push(unsubCandidates);

    } catch (err) {
      console.error('❌ Error starting as host:', err);
      setError('Erro ao iniciar chamada');
    }
  }, [sessionId, initializeMedia, createPeerConnection]);

  // Guest: Answer the call
  const joinAsGuest = useCallback(async () => {
    if (!isFirebaseConfigured || !db || !sessionId) {
      setError('Firebase não configurado');
      return;
    }

    try {
      console.log('👥 Joining as GUEST...');
      const stream = await initializeMedia();
      const pc = createPeerConnection(stream);

      const callDoc = doc(db, 'calls', sessionId);
      const answerCandidates = collection(callDoc, 'answerCandidates');
      const offerCandidates = collection(callDoc, 'offerCandidates');

      // Collect ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('🧊 Adding answer ICE candidate');
          addDoc(answerCandidates, event.candidate.toJSON());
        }
      };

      // Get the offer
      const callData = (await getDoc(callDoc)).data();
      if (!callData?.offer) {
        setError('Chamada não encontrada');
        return;
      }

      console.log('📩 Got offer, setting remote description');
      const offerDescription = callData.offer;
      await pc.setRemoteDescription(new RTCSessionDescription(offerDescription));

      // Create answer
      const answerDescription = await pc.createAnswer();
      await pc.setLocalDescription(answerDescription);
      console.log('📝 Created answer');

      const answer = {
        type: answerDescription.type,
        sdp: answerDescription.sdp,
      };

      await updateDoc(callDoc, { answer });
      console.log('💾 Saved answer to Firestore');

      // Listen for ICE candidates from host
      const unsubCandidates = onSnapshot(offerCandidates, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            console.log('🧊 Adding offer ICE candidate');
            const candidate = new RTCIceCandidate(change.doc.data());
            pc.addIceCandidate(candidate);
          }
        });
      });
      unsubscribersRef.current.push(unsubCandidates);

    } catch (err) {
      console.error('❌ Error joining as guest:', err);
      setError('Erro ao entrar na chamada');
    }
  }, [sessionId, initializeMedia, createPeerConnection]);

  // Start connection based on role
  const startConnection = useCallback(async () => {
    if (isHost) {
      await startAsHost();
    } else {
      await joinAsGuest();
    }
  }, [isHost, startAsHost, joinAsGuest]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted((prev) => !prev);
    }
  }, [localStream]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff((prev) => !prev);
    }
  }, [localStream]);

  // Cleanup
  const cleanup = useCallback(async () => {
    console.log('🧹 Cleaning up...');
    
    // Stop local tracks
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Unsubscribe from Firestore listeners
    unsubscribersRef.current.forEach((unsub) => unsub());
    unsubscribersRef.current = [];

    // Clean up Firestore documents (only host should do this)
    if (isHost && isFirebaseConfigured && db && sessionId) {
      try {
        const callDoc = doc(db, 'calls', sessionId);
        
        // Delete subcollections
        const offerCandidates = await getDocs(collection(callDoc, 'offerCandidates'));
        offerCandidates.forEach(async (doc) => await deleteDoc(doc.ref));
        
        const answerCandidates = await getDocs(collection(callDoc, 'answerCandidates'));
        answerCandidates.forEach(async (doc) => await deleteDoc(doc.ref));
        
        await deleteDoc(callDoc);
        console.log('🗑️ Cleaned up Firestore documents');
      } catch (err) {
        console.error('Error cleaning up Firestore:', err);
      }
    }

    setLocalStream(null);
    setRemoteStream(null);
    setConnectionState('new');
  }, [localStream, isHost, sessionId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  return {
    localStream,
    remoteStream,
    connectionState,
    isMuted,
    isVideoOff,
    error,
    startConnection,
    toggleMute,
    toggleVideo,
    cleanup,
    isConnected: connectionState === 'connected',
  };
}
