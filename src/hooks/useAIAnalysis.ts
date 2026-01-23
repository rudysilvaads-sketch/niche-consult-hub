import { useState, useCallback } from 'react';
import { AIAnalysis } from '@/types/telehealth';

interface AnalysisRequest {
  transcription: string;
  patientName: string;
  sessionDuration: number;
  previousNotes?: string;
}

export function useAIAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const analyzeSession = useCallback(
    async (request: AnalysisRequest): Promise<Omit<AIAnalysis, 'id' | 'sessionId' | 'createdAt'> | null> => {
      setIsAnalyzing(true);
      setProgress(0);
      setError(null);

      try {
        // Progress simulation for UI feedback
        const progressInterval = setInterval(() => {
          setProgress((prev) => Math.min(prev + 5, 90));
        }, 200);

        // Use Lovable AI API for analysis
        const response = await fetch('/api/analyze-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            transcription: request.transcription,
            patientName: request.patientName,
            sessionDuration: request.sessionDuration,
            previousNotes: request.previousNotes,
          }),
        });

        clearInterval(progressInterval);

        if (!response.ok) {
          // Fallback to local analysis if API is not available
          const localAnalysis = performLocalAnalysis(request);
          setProgress(100);
          return localAnalysis;
        }

        const data = await response.json();
        setProgress(100);

        return {
          summary: data.summary,
          keyTopics: data.keyTopics,
          emotionalState: data.emotionalState,
          suggestedFollowUp: data.suggestedFollowUp,
          preDiagnosis: data.preDiagnosis,
          riskIndicators: data.riskIndicators,
          therapeuticNotes: data.therapeuticNotes,
        };
      } catch (err) {
        console.error('AI Analysis error:', err);
        
        // Fallback to local analysis
        const localAnalysis = performLocalAnalysis(request);
        setProgress(100);
        return localAnalysis;
      } finally {
        setIsAnalyzing(false);
      }
    },
    []
  );

  return {
    isAnalyzing,
    progress,
    error,
    analyzeSession,
  };
}

// Local analysis fallback (when API is not available)
function performLocalAnalysis(request: AnalysisRequest): Omit<AIAnalysis, 'id' | 'sessionId' | 'createdAt'> {
  const { transcription, patientName, sessionDuration } = request;
  
  // Simple keyword-based analysis
  const words = transcription.toLowerCase();
  
  // Detect emotional indicators
  const emotionalKeywords = {
    ansiedade: ['ansioso', 'ansiedade', 'nervoso', 'preocupado', 'medo', 'pânico'],
    tristeza: ['triste', 'deprimido', 'desanimado', 'sem esperança', 'vazio'],
    raiva: ['raiva', 'irritado', 'frustrado', 'bravo', 'revoltado'],
    estresse: ['estresse', 'estressado', 'cansado', 'esgotado', 'sobrecarregado'],
    positivo: ['melhor', 'bem', 'feliz', 'animado', 'esperança', 'progresso'],
  };

  const detectedEmotions: string[] = [];
  Object.entries(emotionalKeywords).forEach(([emotion, keywords]) => {
    if (keywords.some((kw) => words.includes(kw))) {
      detectedEmotions.push(emotion);
    }
  });

  // Risk indicators
  const riskKeywords = ['suicídio', 'morrer', 'acabar com tudo', 'não aguento mais', 'sem saída'];
  const riskIndicators = riskKeywords.filter((kw) => words.includes(kw));

  // Extract key topics (simplified)
  const topicKeywords = [
    'trabalho', 'família', 'relacionamento', 'saúde', 'sono',
    'alimentação', 'social', 'autoestima', 'passado', 'futuro',
  ];
  const keyTopics = topicKeywords.filter((topic) => words.includes(topic));

  return {
    summary: `Sessão de ${sessionDuration} minutos com ${patientName}. ` +
      (keyTopics.length > 0 
        ? `Principais temas abordados: ${keyTopics.join(', ')}.`
        : 'Temas gerais de acompanhamento terapêutico.'),
    keyTopics: keyTopics.length > 0 ? keyTopics : ['Acompanhamento geral'],
    emotionalState: detectedEmotions.length > 0 
      ? detectedEmotions.join(', ')
      : 'Estável',
    suggestedFollowUp: [
      'Continuar acompanhamento regular',
      keyTopics.includes('sono') ? 'Avaliar qualidade do sono' : null,
      keyTopics.includes('ansiedade') ? 'Técnicas de relaxamento' : null,
      keyTopics.includes('relacionamento') ? 'Explorar dinâmicas relacionais' : null,
    ].filter(Boolean) as string[],
    preDiagnosis: detectedEmotions.length > 0
      ? `Possíveis indicadores de ${detectedEmotions.join(' e ')}. Requer avaliação aprofundada.`
      : 'Sem indicadores significativos detectados. Continuar observação.',
    riskIndicators: riskIndicators.length > 0 ? riskIndicators : undefined,
    therapeuticNotes: `Análise automática gerada com base na transcrição da sessão. ` +
      `Duração: ${sessionDuration} minutos. ` +
      (riskIndicators.length > 0 
        ? 'ATENÇÃO: Indicadores de risco detectados - avaliar imediatamente.'
        : 'Sem indicadores de risco imediato.'),
  };
}
