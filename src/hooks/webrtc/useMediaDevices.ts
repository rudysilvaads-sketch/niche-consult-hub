import { useState, useCallback } from 'react';

export function useMediaDevices() {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const toggleMute = useCallback(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted((prev) => !prev);
    }
  }, [localStream]);

  const toggleVideo = useCallback(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff((prev) => !prev);
    }
  }, [localStream]);

  const stopAllTracks = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }
  }, [localStream]);

  return {
    localStream,
    isMuted,
    isVideoOff,
    error,
    setError,
    initializeMedia,
    toggleMute,
    toggleVideo,
    stopAllTracks,
  };
}
