import { useState, useCallback, useRef, useEffect } from 'react';

// TypeScript declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionType extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionType;
    webkitSpeechRecognition?: new () => SpeechRecognitionType;
  }
}

interface TranscriptionResult {
  text: string;
  isFinal: boolean;
  speaker?: 'therapist' | 'patient';
}

interface UseTranscriptionOptions {
  onTranscript: (result: TranscriptionResult) => void;
  speaker: 'therapist' | 'patient';
}

export function useTranscription({ onTranscript, speaker }: UseTranscriptionOptions) {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionType | null>(null);
  const isListeningRef = useRef(false);

  // Keep ref in sync with state
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  // Use Web Speech API for real-time transcription
  const initializeSpeechRecognition = useCallback(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognitionAPI) {
      console.error('[Transcription] Browser does not support Web Speech API');
      setError('Navegador não suporta reconhecimento de voz. Use Chrome ou Edge.');
      return null;
    }

    console.log('[Transcription] Initializing Web Speech API');
    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'pt-BR';

    recognition.onresult = (event) => {
      const results = event.results;
      for (let i = event.resultIndex; i < results.length; i++) {
        const result = results[i];
        const text = result[0].transcript;
        console.log(`[Transcription] ${result.isFinal ? 'Final' : 'Interim'}: "${text}"`);
        onTranscript({
          text,
          isFinal: result.isFinal,
          speaker,
        });
      }
    };

    recognition.onerror = (event) => {
      console.error('[Transcription] Error:', event.error);
      if (event.error === 'not-allowed') {
        setError('Permissão de microfone negada. Permita o acesso ao microfone.');
      } else if (event.error === 'no-speech') {
        // Don't show error for no-speech, just log
        console.log('[Transcription] No speech detected');
      } else if (event.error === 'network') {
        setError('Erro de rede. Verifique sua conexão.');
      } else {
        setError(`Erro no reconhecimento: ${event.error}`);
      }
    };

    recognition.onend = () => {
      console.log('[Transcription] Recognition ended, isListening:', isListeningRef.current);
      // Restart if still should be listening
      if (isListeningRef.current && recognitionRef.current) {
        console.log('[Transcription] Restarting recognition...');
        setTimeout(() => {
          try {
            recognitionRef.current?.start();
          } catch (e) {
            console.log('[Transcription] Already started or error:', e);
          }
        }, 100);
      }
    };

    return recognition;
  }, [onTranscript, speaker]);

  const startListening = useCallback(async () => {
    console.log('[Transcription] Starting...');
    setError(null);
    
    // Check if already listening
    if (recognitionRef.current) {
      console.log('[Transcription] Already has recognition instance');
      return;
    }
    
    // Request microphone permission first
    try {
      console.log('[Transcription] Requesting microphone permission...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop the stream immediately, we just needed the permission
      stream.getTracks().forEach(track => track.stop());
      console.log('[Transcription] Microphone permission granted');
    } catch (e) {
      console.error('[Transcription] Microphone permission denied:', e);
      setError('Permissão de microfone negada. Permita o acesso ao microfone.');
      return;
    }
    
    // Initialize Web Speech API
    const recognition = initializeSpeechRecognition();
    if (recognition) {
      recognitionRef.current = recognition;
      try {
        recognition.start();
        setIsListening(true);
        console.log('[Transcription] Started successfully');
      } catch (e) {
        console.error('[Transcription] Error starting recognition:', e);
        setError('Erro ao iniciar reconhecimento de voz');
      }
    }
  }, [initializeSpeechRecognition]);

  const stopListening = useCallback(() => {
    console.log('[Transcription] Stopping...');
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
  }, []);

  return {
    isListening,
    error,
    startListening,
    stopListening,
  };
}

// Hook for Dowsub API integration (for recording and processing)
export function useDowsubTranscription() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const transcribeAudio = useCallback(async (audioBlob: Blob): Promise<string> => {
    setIsProcessing(true);
    setProgress(0);

    try {
      // For now, we'll use Web Speech API as primary
      // Dowsub integration would require their specific API endpoint
      // This is a placeholder for the Dowsub API call
      
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      
      // Simulated progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 500);

      // In production, this would call Dowsub API
      // const response = await fetch('DOWSUB_API_ENDPOINT', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${process.env.DOWSUB_API_KEY}`,
      //   },
      //   body: formData,
      // });

      // Simulate API response time
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      clearInterval(progressInterval);
      setProgress(100);

      // Return empty for now - actual implementation would return API response
      return '';
    } catch (error) {
      console.error('Dowsub transcription error:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return {
    isProcessing,
    progress,
    transcribeAudio,
  };
}
