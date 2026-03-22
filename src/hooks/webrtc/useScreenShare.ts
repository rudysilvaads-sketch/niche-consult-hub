import { useState, useCallback, useRef } from 'react';

export function useScreenShare(
  peerConnectionRef: React.MutableRefObject<RTCPeerConnection | null>
) {
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const originalVideoTrackRef = useRef<MediaStreamTrack | null>(null);

  const startScreenShare = useCallback(async () => {
    if (!peerConnectionRef.current) {
      console.error('❌ Cannot share screen: no peer connection');
      return;
    }

    try {
      console.log('🖥️ Starting screen share...');
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });

      const screenTrack = stream.getVideoTracks()[0];
      setScreenStream(stream);

      const videoSender = peerConnectionRef.current
        .getSenders()
        .find((sender) => sender.track?.kind === 'video');

      if (videoSender && videoSender.track) {
        originalVideoTrackRef.current = videoSender.track;
        await videoSender.replaceTrack(screenTrack);
        console.log('✅ Screen share started');
        setIsScreenSharing(true);
      }

      screenTrack.onended = () => {
        console.log('🖥️ Screen share ended by user');
        stopScreenShare();
      };
    } catch (err) {
      console.error('❌ Error starting screen share:', err);
    }
  }, []);

  const stopScreenShare = useCallback(async () => {
    if (!peerConnectionRef.current || !originalVideoTrackRef.current) return;

    try {
      console.log('🖥️ Stopping screen share...');
      if (screenStream) {
        screenStream.getTracks().forEach((track) => track.stop());
        setScreenStream(null);
      }

      const videoSender = peerConnectionRef.current
        .getSenders()
        .find((sender) => sender.track?.kind === 'video');

      if (videoSender && originalVideoTrackRef.current) {
        await videoSender.replaceTrack(originalVideoTrackRef.current);
        originalVideoTrackRef.current = null;
        console.log('✅ Original video restored');
      }

      setIsScreenSharing(false);
    } catch (err) {
      console.error('❌ Error stopping screen share:', err);
    }
  }, [screenStream]);

  const toggleScreenShare = useCallback(async () => {
    if (isScreenSharing) {
      await stopScreenShare();
    } else {
      await startScreenShare();
    }
  }, [isScreenSharing, startScreenShare, stopScreenShare]);

  const cleanupScreenShare = useCallback(() => {
    if (screenStream) {
      screenStream.getTracks().forEach((track) => track.stop());
      setScreenStream(null);
    }
    setIsScreenSharing(false);
    originalVideoTrackRef.current = null;
  }, [screenStream]);

  return {
    screenStream,
    isScreenSharing,
    toggleScreenShare,
    cleanupScreenShare,
  };
}
