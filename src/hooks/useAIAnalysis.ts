import { useState, useCallback } from 'react';
import { AIAnalysis } from '@/types/telehealth';

interface AnalysisRequest {
  transcription: string;
  patientName: string;
  sessionDuration: number;
  previousNotes?: string;
}

const LAOZHANG_API_URL = 'https://api.laozhang.ai/v1/chat/completions';

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
        }, 300);

        const systemPrompt = `Você é um assistente especializado em psicologia clínica e terapia. 
Analise a transcrição da sessão terapêutica fornecida e gere uma análise estruturada.

IMPORTANTE: Responda APENAS em JSON válido, sem texto adicional antes ou depois.

O JSON deve ter exatamente esta estrutura:
{
  "summary": "Resumo da sessão em 2-3 frases",
  "keyTopics": ["tópico1", "tópico2", "tópico3"],
  "emotionalState": "Descrição do estado emocional observado",
  "suggestedFollowUp": ["sugestão1", "sugestão2"],
  "preDiagnosis": "Observações clínicas preliminares (não é diagnóstico definitivo)",
  "riskIndicators": ["indicador1"] ou null se não houver,
  "therapeuticNotes": "Notas para o terapeuta sobre a sessão"
}`;

        const userPrompt = `Paciente: ${request.patientName}
Duração da sessão: ${request.sessionDuration} minutos
${request.previousNotes ? `Notas anteriores: ${request.previousNotes}` : ''}

Transcrição da sessão:
${request.transcription}

Analise esta sessão e forneça a análise estruturada em JSON.`;

        const response = await fetch(LAOZHANG_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_LAOZHANG_API_KEY || ''}`,
          },
          body: JSON.stringify({
            model: 'deepseek-v3',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            temperature: 0.7,
            max_tokens: 2000,
          }),
        });

        clearInterval(progressInterval);

        if (!response.ok) {
          console.error('Laozhang API error:', response.status);
          // Fallback to local analysis
          const localAnalysis = performLocalAnalysis(request);
          setProgress(100);
          return localAnalysis;
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (!content) {
          throw new Error('Empty response from API');
        }

        // Parse the JSON response
        let analysisData;
        try {
          // Try to extract JSON from the response
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            analysisData = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error('No JSON found in response');
          }
        } catch (parseError) {
          console.error('Failed to parse AI response:', parseError);
          // Fallback to local analysis
          const localAnalysis = performLocalAnalysis(request);
          setProgress(100);
          return localAnalysis;
        }

        setProgress(100);

        return {
          summary: analysisData.summary || 'Análise da sessão concluída.',
          keyTopics: analysisData.keyTopics || ['Acompanhamento geral'],
          emotionalState: analysisData.emotionalState || 'Não identificado',
          suggestedFollowUp: analysisData.suggestedFollowUp || ['Continuar acompanhamento'],
          preDiagnosis: analysisData.preDiagnosis || 'Sem indicações específicas.',
          riskIndicators: analysisData.riskIndicators || undefined,
          therapeuticNotes: analysisData.therapeuticNotes || 'Sessão transcorreu normalmente.',
        };
      } catch (err) {
        console.error('AI Analysis error:', err);
        setError(err instanceof Error ? err.message : 'Erro na análise');
        
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
