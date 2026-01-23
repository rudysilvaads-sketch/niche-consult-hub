import { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';

interface AudioLevelIndicatorProps {
  stream: MediaStream | null;
  className?: string;
  barCount?: number;
}

export function AudioLevelIndicator({ 
  stream, 
  className,
  barCount = 5 
}: AudioLevelIndicatorProps) {
  const [level, setLevel] = useState(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!stream) {
      setLevel(0);
      return;
    }

    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.5;
    
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);
    analyserRef.current = analyser;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const updateLevel = () => {
      if (!analyserRef.current) return;
      
      analyserRef.current.getByteFrequencyData(dataArray);
      
      // Calculate average volume level
      const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      // Normalize to 0-1 range with some amplification for visibility
      const normalizedLevel = Math.min(1, average / 128);
      
      setLevel(normalizedLevel);
      animationFrameRef.current = requestAnimationFrame(updateLevel);
    };

    updateLevel();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      source.disconnect();
      audioContext.close();
      analyserRef.current = null;
    };
  }, [stream]);

  const activeBars = Math.round(level * barCount);

  return (
    <div className={cn("flex items-end gap-0.5 h-4", className)}>
      {Array.from({ length: barCount }).map((_, i) => {
        const isActive = i < activeBars;
        const height = ((i + 1) / barCount) * 100;
        
        return (
          <div
            key={i}
            className={cn(
              "w-1 rounded-full transition-colors duration-75",
              isActive 
                ? i < barCount * 0.4 
                  ? "bg-success" 
                  : i < barCount * 0.7 
                    ? "bg-warning" 
                    : "bg-destructive"
                : "bg-muted-foreground/20"
            )}
            style={{ height: `${height}%` }}
          />
        );
      })}
    </div>
  );
}
