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
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Use Web Speech API for real-time transcription (fallback)
  const initializeSpeechRecognition = useCallback(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognitionAPI) {
      setError('Navegador não suporta reconhecimento de voz');
      return null;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'pt-BR';

    recognition.onresult = (event) => {
      const results = event.results;
      for (let i = event.resultIndex; i < results.length; i++) {
        const result = results[i];
        onTranscript({
          text: result[0].transcript,
          isFinal: result.isFinal,
          speaker,
        });
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error !== 'no-speech') {
        setError(`Erro no reconhecimento: ${event.error}`);
      }
    };

    recognition.onend = () => {
      // Restart if still listening
      if (isListening && recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.log('Recognition already started');
        }
      }
    };

    return recognition;
  }, [onTranscript, speaker, isListening]);

  const startListening = useCallback(async () => {
    setError(null);
    
    // Initialize Web Speech API
    const recognition = initializeSpeechRecognition();
    if (recognition) {
      recognitionRef.current = recognition;
      try {
        recognition.start();
        setIsListening(true);
      } catch (e) {
        console.error('Error starting recognition:', e);
        setError('Erro ao iniciar reconhecimento de voz');
      }
    }
  }, [initializeSpeechRecognition]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
    setIsListening(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

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
