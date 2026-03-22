import { useCallback, useEffect } from 'react';
import { useMediaDevices } from './webrtc/useMediaDevices';
import { usePeerConnection } from './webrtc/usePeerConnection';
import { useScreenShare } from './webrtc/useScreenShare';
import { useSignaling } from './webrtc/useSignaling';

interface UseWebRTCProps {
  sessionId: string;
  isHost: boolean;
  onRemoteStream?: (stream: MediaStream) => void;
  onConnectionStateChange?: (state: RTCPeerConnectionState) => void;
}

export function useWebRTCConnection({
  sessionId,
  isHost,
  onRemoteStream,
  onConnectionStateChange,
}: UseWebRTCProps) {
  const media = useMediaDevices();
  const peer = usePeerConnection({ onRemoteStream, onConnectionStateChange });
  const screen = useScreenShare(peer.peerConnectionRef);
  const signaling = useSignaling({ sessionId, isHost });

  const startConnection = useCallback(async () => {
    try {
      const stream = await media.initializeMedia();
      const pc = peer.createPeerConnection(stream);

      if (isHost) {
        console.log('👤 Starting as HOST...');
        await signaling.startAsHost(pc);
      } else {
        console.log('👥 Joining as GUEST...');
        await signaling.joinAsGuest(pc);
      }
    } catch (err) {
      console.error('❌ Error starting connection:', err);
      media.setError(isHost ? 'Erro ao iniciar chamada' : 'Erro ao entrar na chamada');
    }
  }, [isHost, media, peer, signaling]);

  const cleanup = useCallback(async () => {
    console.log('🧹 Cleaning up...');
    screen.cleanupScreenShare();
    media.stopAllTracks();
    peer.closePeerConnection();
    await signaling.cleanupSignaling();
  }, [screen, media, peer, signaling]);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  return {
    localStream: media.localStream,
    remoteStream: peer.remoteStream,
    screenStream: screen.screenStream,
    connectionState: peer.connectionState,
    isMuted: media.isMuted,
    isVideoOff: media.isVideoOff,
    isScreenSharing: screen.isScreenSharing,
    error: media.error,
    startConnection,
    toggleMute: media.toggleMute,
    toggleVideo: media.toggleVideo,
    toggleScreenShare: screen.toggleScreenShare,
    cleanup,
    isConnected: peer.isConnected,
  };
}
