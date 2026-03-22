import { useState, useCallback, useRef } from 'react';

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
  ],
};

interface UsePeerConnectionProps {
  onRemoteStream?: (stream: MediaStream) => void;
  onConnectionStateChange?: (state: RTCPeerConnectionState) => void;
}

export function usePeerConnection({
  onRemoteStream,
  onConnectionStateChange,
}: UsePeerConnectionProps = {}) {
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [connectionState, setConnectionState] = useState<RTCPeerConnectionState>('new');
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  const createPeerConnection = useCallback((stream: MediaStream) => {
    console.log('🔗 Creating peer connection...');
    const pc = new RTCPeerConnection(ICE_SERVERS);

    stream.getTracks().forEach((track) => {
      console.log('📤 Adding track:', track.kind);
      pc.addTrack(track, stream);
    });

    const remote = new MediaStream();
    pc.ontrack = (event) => {
      console.log('📥 Received remote track:', event.track.kind);
      event.streams[0].getTracks().forEach((track) => {
        remote.addTrack(track);
      });
      setRemoteStream(remote);
      onRemoteStream?.(remote);
    };

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

  const closePeerConnection = useCallback(() => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    setRemoteStream(null);
    setConnectionState('new');
  }, []);

  return {
    remoteStream,
    connectionState,
    peerConnectionRef,
    createPeerConnection,
    closePeerConnection,
    isConnected: connectionState === 'connected',
  };
}
