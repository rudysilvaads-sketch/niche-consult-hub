import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Video, VideoOff, Mic, MicOff, Phone, PhoneOff, 
  MessageSquare, FileText, Clock, User, AlertCircle,
  Loader2, Brain, Download, Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useVideoSession, useWebRTC } from '@/hooks/useVideoSession';
import { useTranscription } from '@/hooks/useTranscription';
import { useAIAnalysis } from '@/hooks/useAIAnalysis';
import { useAuth } from '@/contexts/AuthContext';
import { TranscriptionSegment, AIAnalysis } from '@/types/telehealth';
import { ShareAnalysisDialog } from '@/components/analysis/ShareAnalysisDialog';

const VideoRoom = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const [showTranscript, setShowTranscript] = useState(true);
  const [liveTranscript, setLiveTranscript] = useState<TranscriptionSegment[]>([]);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState('00:00:00');
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);

  const isTherapist = true; // In production, determine from user role

  const {
    session,
    transcription,
    loading,
    startSession,
    endSession,
    addTranscriptionSegment,
    saveAIAnalysis,
  } = useVideoSession(sessionId);

  const {
    localStream,
    remoteStream,
    isConnected,
    isMuted,
    isVideoOff,
    initializeMedia,
    toggleMute,
    toggleVideo,
    cleanup,
  } = useWebRTC(sessionId || '', isTherapist);

  const { isAnalyzing, analyzeSession } = useAIAnalysis();

  // Handle transcription results
  const handleTranscript = useCallback(
    (result: { text: string; isFinal: boolean; speaker?: 'therapist' | 'patient' }) => {
      if (result.isFinal && result.text.trim()) {
        const segment: TranscriptionSegment = {
          id: Date.now().toString(),
          sessionId: sessionId || '',
          speaker: result.speaker || 'therapist',
          text: result.text.trim(),
          timestamp: sessionStartTime 
            ? (Date.now() - sessionStartTime.getTime()) / 1000 
            : 0,
          createdAt: new Date().toISOString(),
        };
        
        setLiveTranscript((prev) => [...prev, segment]);
        addTranscriptionSegment(segment.speaker, segment.text, segment.timestamp);
      }
    },
    [sessionId, sessionStartTime, addTranscriptionSegment]
  );

  const { isListening, startListening, stopListening, error: transcriptionError } = useTranscription({
    onTranscript: handleTranscript,
    speaker: isTherapist ? 'therapist' : 'patient',
  });

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (sessionStartTime) {
      interval = setInterval(() => {
        const elapsed = Date.now() - sessionStartTime.getTime();
        const hours = Math.floor(elapsed / 3600000);
        const minutes = Math.floor((elapsed % 3600000) / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        setElapsedTime(
          `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [sessionStartTime]);

  // Attach streams to video elements
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const handleStartSession = async () => {
    try {
      await initializeMedia();
      if (sessionId) {
        await startSession(sessionId);
      }
      setSessionStartTime(new Date());
      await startListening();
      toast.success('Sessão iniciada! Transcrição ativa.');
    } catch (error) {
      console.error('Error starting session:', error);
      toast.error('Erro ao iniciar sessão');
    }
  };

  const handleEndSession = async () => {
    stopListening();
    
    if (sessionId) {
      await endSession(sessionId);
    }
    
    // Compile transcription for analysis
    const fullTranscription = liveTranscript
      .map((seg) => `[${seg.speaker === 'therapist' ? 'Terapeuta' : 'Paciente'}]: ${seg.text}`)
      .join('\n');

    if (fullTranscription) {
      toast.loading('Analisando sessão com IA...');
      
      const analysisResult = await analyzeSession({
        transcription: fullTranscription,
        patientName: session?.patientName || 'Paciente',
        sessionDuration: sessionStartTime 
          ? Math.round((Date.now() - sessionStartTime.getTime()) / 60000)
          : 0,
      });

      if (analysisResult) {
        const savedAnalysis = await saveAIAnalysis(analysisResult);
        setAnalysis(savedAnalysis as AIAnalysis);
        setShowAnalysis(true);
        toast.success('Análise concluída!');
      }
    }

    cleanup();
    toast.success('Sessão finalizada');
  };

  const formatTimestamp = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (showAnalysis && analysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted p-6">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-6 w-6 text-primary" />
                  Análise da Sessão
                </CardTitle>
                <Badge variant="outline">{session?.patientName}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Summary */}
              <div>
                <h4 className="font-semibold mb-2">Resumo</h4>
                <p className="text-muted-foreground">{analysis.summary}</p>
              </div>

              <Separator />

              {/* Key Topics */}
              <div>
                <h4 className="font-semibold mb-2">Tópicos Principais</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.keyTopics.map((topic, i) => (
                    <Badge key={i} variant="secondary">{topic}</Badge>
                  ))}
                </div>
              </div>

              {/* Emotional State */}
              <div>
                <h4 className="font-semibold mb-2">Estado Emocional</h4>
                <p className="text-muted-foreground">{analysis.emotionalState}</p>
              </div>

              {/* Risk Indicators */}
              {analysis.riskIndicators && analysis.riskIndicators.length > 0 && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <h4 className="font-semibold mb-2 text-destructive flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Indicadores de Risco
                  </h4>
                  <ul className="list-disc list-inside text-destructive">
                    {analysis.riskIndicators.map((indicator, i) => (
                      <li key={i}>{indicator}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Pre-Diagnosis */}
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <h4 className="font-semibold mb-2 text-primary">Pré-Diagnóstico</h4>
                <p className="text-muted-foreground">{analysis.preDiagnosis}</p>
              </div>

              {/* Suggested Follow-up */}
              <div>
                <h4 className="font-semibold mb-2">Sugestões de Acompanhamento</h4>
                <ul className="list-disc list-inside text-muted-foreground">
                  {analysis.suggestedFollowUp.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Therapeutic Notes */}
              {analysis.therapeuticNotes && (
                <div>
                  <h4 className="font-semibold mb-2">Notas Terapêuticas</h4>
                  <p className="text-muted-foreground">{analysis.therapeuticNotes}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <Button onClick={() => setShowShareDialog(true)} className="btn-gradient">
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartilhar com Paciente
                </Button>
                <Button onClick={() => navigate('/prontuarios')} variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Salvar no Prontuário
                </Button>
                <Button variant="ghost" onClick={() => navigate('/agenda')}>
                  Voltar à Agenda
                </Button>
              </div>

              {/* Share Dialog */}
              <ShareAnalysisDialog
                open={showShareDialog}
                onOpenChange={setShowShareDialog}
                analysis={analysis}
                patientName={session?.patientName || 'Paciente'}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-card border-b px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Video className="h-5 w-5 text-primary" />
            <span className="font-semibold">WebPsi Meet</span>
          </div>
          {session && (
            <Badge variant="outline">{session.patientName}</Badge>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span className="font-mono">{elapsedTime}</span>
          </div>
          {isListening && (
            <Badge className="bg-success animate-pulse">
              <Mic className="h-3 w-3 mr-1" />
              Transcrevendo
            </Badge>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Video Area */}
        <div className="flex-1 p-4 flex flex-col gap-4">
          {/* Remote Video (Main) */}
          <div className="flex-1 bg-muted rounded-xl overflow-hidden relative">
            {remoteStream ? (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <User className="h-24 w-24 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">
                  {session?.status === 'waiting' 
                    ? 'Aguardando participante...' 
                    : 'Câmera do participante desativada'}
                </p>
              </div>
            )}

            {/* Local Video (PiP) */}
            <div className="absolute bottom-4 right-4 w-48 h-36 bg-background rounded-lg overflow-hidden shadow-lg border">
              {localStream && !isVideoOff ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <User className="h-12 w-12 text-muted-foreground/30" />
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <Button
              size="lg"
              variant={isMuted ? 'destructive' : 'secondary'}
              onClick={toggleMute}
              className="rounded-full w-14 h-14"
            >
              {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
            </Button>

            <Button
              size="lg"
              variant={isVideoOff ? 'destructive' : 'secondary'}
              onClick={toggleVideo}
              className="rounded-full w-14 h-14"
            >
              {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
            </Button>

            <Button
              size="lg"
              variant={showTranscript ? 'default' : 'secondary'}
              onClick={() => setShowTranscript(!showTranscript)}
              className="rounded-full w-14 h-14"
            >
              <MessageSquare className="h-6 w-6" />
            </Button>

            {!sessionStartTime ? (
              <Button
                size="lg"
                onClick={handleStartSession}
                className="btn-gradient rounded-full px-8"
              >
                <Phone className="h-5 w-5 mr-2" />
                Iniciar Sessão
              </Button>
            ) : (
              <Button
                size="lg"
                variant="destructive"
                onClick={handleEndSession}
                className="rounded-full px-8"
              >
                <PhoneOff className="h-5 w-5 mr-2" />
                Encerrar
              </Button>
            )}
          </div>
        </div>

        {/* Transcript Sidebar */}
        {showTranscript && (
          <div className="w-96 border-l bg-card flex flex-col">
            <div className="p-4 border-b">
              <h3 className="font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Transcrição em Tempo Real
              </h3>
              {transcriptionError && (
                <p className="text-xs text-destructive mt-1">{transcriptionError}</p>
              )}
            </div>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3">
                {liveTranscript.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-8">
                    A transcrição aparecerá aqui quando a sessão iniciar
                  </p>
                ) : (
                  liveTranscript.map((segment) => (
                    <div key={segment.id} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={segment.speaker === 'therapist' ? 'default' : 'secondary'} className="text-xs">
                          {segment.speaker === 'therapist' ? 'Terapeuta' : 'Paciente'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(segment.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm">{segment.text}</p>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoRoom;
