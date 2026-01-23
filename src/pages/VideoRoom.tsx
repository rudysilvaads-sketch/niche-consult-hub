import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Video, VideoOff, Mic, MicOff, Phone, PhoneOff, 
  MessageSquare, FileText, Clock, User, AlertCircle,
  Loader2, Brain, Share2, Copy, Check, Monitor, MonitorOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useVideoSession } from '@/hooks/useVideoSession';
import { useWebRTCConnection } from '@/hooks/useWebRTC';
import { useTranscription } from '@/hooks/useTranscription';
import { useAIAnalysis } from '@/hooks/useAIAnalysis';
import { useAuth } from '@/contexts/AuthContext';
import { TranscriptionSegment, AIAnalysis } from '@/types/telehealth';
import { ShareAnalysisDialog } from '@/components/analysis/ShareAnalysisDialog';
import { AudioLevelIndicator } from '@/components/telehealth/AudioLevelIndicator';
import { WaitingRoom } from '@/components/telehealth/WaitingRoom';
import { WaitingPatientCard } from '@/components/telehealth/WaitingPatientCard';
import { useWaitingRoom } from '@/hooks/useWaitingRoom';
import { useNotificationSound } from '@/hooks/useNotificationSound';

const VideoRoom = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [searchParams] = useSearchParams();
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
  const [linkCopied, setLinkCopied] = useState(false);
  const [hasStartedCall, setHasStartedCall] = useState(false);
  const [patientName, setPatientName] = useState<string>('');
  const [hasEnteredWaitingRoom, setHasEnteredWaitingRoom] = useState(false);

  // Determine if user is the host (therapist) or guest (patient)
  const isHost = searchParams.get('role') !== 'patient';
  const isTherapist = isHost;

  const {
    session,
    transcription,
    loading,
    startSession,
    endSession,
    addTranscriptionSegment,
    saveAIAnalysis,
  } = useVideoSession(sessionId);

  // Waiting room
  const {
    waitingParticipants,
    messages: waitingRoomMessages,
    isAdmitted,
    isDenied,
    joinWaitingRoom,
    leaveWaitingRoom,
    admitParticipant,
    denyParticipant,
    sendMessage,
  } = useWaitingRoom({
    sessionId: sessionId || '',
    isHost,
    participantName: patientName,
  });

  // Notification sound for host
  const { playNotificationSound } = useNotificationSound();
  const previousWaitingCountRef = useRef(0);

  // Play notification sound when new patient joins waiting room
  useEffect(() => {
    if (isHost && waitingParticipants.length > previousWaitingCountRef.current) {
      playNotificationSound();
      toast.info('Novo paciente na sala de espera!', {
        icon: '🔔',
      });
    }
    previousWaitingCountRef.current = waitingParticipants.length;
  }, [isHost, waitingParticipants.length, playNotificationSound]);

  // For patients: automatically start call when admitted
  useEffect(() => {
    if (!isHost && isAdmitted && hasEnteredWaitingRoom && !hasStartedCall) {
      console.log('✅ Patient admitted, starting call...');
      handleStartSession();
    }
  }, [isAdmitted, hasEnteredWaitingRoom, hasStartedCall, isHost]);

  // Cleanup waiting room on unmount
  useEffect(() => {
    return () => {
      if (!isHost && patientName && hasEnteredWaitingRoom) {
        leaveWaitingRoom(patientName);
      }
    };
  }, [isHost, patientName, hasEnteredWaitingRoom, leaveWaitingRoom]);

  const {
    localStream,
    remoteStream,
    connectionState,
    isMuted,
    isVideoOff,
    isScreenSharing,
    error: webrtcError,
    startConnection,
    toggleMute,
    toggleVideo,
    toggleScreenShare,
    cleanup,
    isConnected,
  } = useWebRTCConnection({
    sessionId: sessionId || '',
    isHost,
  });

  const { isAnalyzing, analyzeSession } = useAIAnalysis();

  // Handle transcription results
  const handleTranscript = useCallback(
    (result: { text: string; isFinal: boolean; speaker?: 'therapist' | 'patient' }) => {
      if (result.isFinal && result.text.trim()) {
        const segment: TranscriptionSegment = {
          id: Date.now().toString(),
          sessionId: sessionId || '',
          speaker: result.speaker || (isTherapist ? 'therapist' : 'patient'),
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
    [sessionId, sessionStartTime, addTranscriptionSegment, isTherapist]
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

  // Generate patient link
  const getPatientLink = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/sala/${sessionId}?role=patient`;
  };

  const copyPatientLink = async () => {
    try {
      await navigator.clipboard.writeText(getPatientLink());
      setLinkCopied(true);
      toast.success('Link copiado! Envie para o paciente.');
      setTimeout(() => setLinkCopied(false), 3000);
    } catch {
      toast.error('Erro ao copiar link');
    }
  };

  const handleStartSession = async () => {
    try {
      setHasStartedCall(true);
      await startConnection();
      
      if (sessionId && isHost) {
        await startSession(sessionId);
      }
      
      setSessionStartTime(new Date());
      
      // Start transcription after a short delay
      setTimeout(async () => {
        try {
          await startListening();
          toast.success('Sessão iniciada! Transcrição ativa.');
        } catch (err) {
          console.warn('Transcription not available:', err);
          toast.success('Sessão iniciada!');
        }
      }, 1000);
    } catch (error) {
      console.error('Error starting session:', error);
      toast.error('Erro ao iniciar sessão');
      setHasStartedCall(false);
    }
  };

  const handleEndSession = async () => {
    stopListening();
    
    if (sessionId && isHost) {
      await endSession(sessionId);
    }
    
    // Compile transcription for analysis
    const fullTranscription = liveTranscript
      .map((seg) => `[${seg.speaker === 'therapist' ? 'Terapeuta' : 'Paciente'}]: ${seg.text}`)
      .join('\n');

    if (fullTranscription && isHost) {
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
    
    if (!isHost) {
      navigate('/');
    }
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

  // Patient denied access
  if (!isHost && isDenied) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 pb-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-destructive/20 mx-auto flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Acesso Negado</h2>
              <p className="text-muted-foreground">
                O profissional não admitiu sua entrada nesta sessão.
              </p>
            </div>
            <Button onClick={() => navigate('/')} variant="outline">
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Patient waiting room - need to enter name and wait
  if (!isHost && !isAdmitted && !hasStartedCall) {
    if (!hasEnteredWaitingRoom) {
      // Patient needs to enter their name
      return (
        <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardContent className="pt-8 pb-8 space-y-6">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-full bg-primary/20 mx-auto flex items-center justify-center">
                  <Video className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">Entrar na Sala Virtual</h2>
                <p className="text-muted-foreground text-sm">
                  Digite seu nome para entrar na sala de espera
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Seu nome</label>
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="Digite seu nome completo"
                    className="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    autoFocus
                  />
                </div>
                
                <Button 
                  onClick={async () => {
                    if (patientName.trim()) {
                      await joinWaitingRoom(patientName.trim());
                      setHasEnteredWaitingRoom(true);
                    }
                  }}
                  disabled={!patientName.trim()}
                  className="w-full btn-gradient"
                >
                  Entrar na Sala de Espera
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Patient is in waiting room
    return <WaitingRoom patientName={patientName} messages={waitingRoomMessages} />;
  }

  if (showAnalysis && analysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4 sm:p-6">
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
      <div className="bg-card border-b px-3 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2">
            <Video className="h-5 w-5 text-primary" />
            <span className="font-semibold text-sm sm:text-base">Sala Virtual</span>
          </div>
          {session && (
            <Badge variant="outline" className="hidden sm:inline-flex">{session.patientName}</Badge>
          )}
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span className="font-mono text-sm">{elapsedTime}</span>
          </div>
          {isConnected && (
            <Badge className="bg-success text-xs">
              Conectado
            </Badge>
          )}
          {isListening && (
            <Badge className="bg-success animate-pulse hidden sm:flex">
              <Mic className="h-3 w-3 mr-1" />
              Transcrevendo
            </Badge>
          )}
          {transcriptionError && (
            <Badge variant="destructive" className="hidden sm:flex text-xs">
              <AlertCircle className="h-3 w-3 mr-1" />
              Transcrição indisponível
            </Badge>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Video Area */}
        <div className="flex-1 p-2 sm:p-4 flex flex-col gap-3 sm:gap-4">
          {/* Connection Status / Share Link */}
          {isHost && !hasStartedCall && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-semibold text-sm">Link para o Paciente</h4>
                    <p className="text-xs text-muted-foreground">
                      Compartilhe este link com o paciente para iniciar a sessão
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={copyPatientLink}
                    className="gap-2"
                  >
                    {linkCopied ? (
                      <>
                        <Check className="h-4 w-4 text-success" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copiar Link
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Waiting Patients (Host view) */}
          {isHost && waitingParticipants.length > 0 && (
            <div className="space-y-2">
              {waitingParticipants.map((participant) => (
                <WaitingPatientCard
                  key={participant.odid}
                  patientName={participant.name}
                  waitingSince={new Date(participant.joinedAt)}
                  onAdmit={() => admitParticipant(participant)}
                  onDeny={() => denyParticipant(participant)}
                  onSendMessage={(msg) => sendMessage(msg, user?.email || 'Profissional')}
                />
              ))}
            </div>
          )}

          {webrtcError && (
            <Card className="bg-destructive/10 border-destructive/20">
              <CardContent className="p-4">
                <p className="text-destructive text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {webrtcError}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Remote Video (Main) */}
          <div className="flex-1 bg-muted rounded-xl overflow-hidden relative min-h-[300px] sm:min-h-[400px]">
            {remoteStream ? (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <User className="h-16 sm:h-24 w-16 sm:w-24 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground text-center px-4 text-sm sm:text-base">
                  {!hasStartedCall 
                    ? 'Clique em "Iniciar Sessão" para começar'
                    : connectionState === 'connecting'
                    ? 'Conectando...'
                    : 'Aguardando participante...'}
                </p>
                {connectionState === 'connecting' && (
                  <Loader2 className="h-6 w-6 animate-spin text-primary mt-4" />
                )}
              </div>
            )}

            {/* Local Video (PiP) */}
            <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 w-24 h-18 sm:w-48 sm:h-36 bg-background rounded-lg overflow-hidden shadow-lg border">
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
                  <User className="h-8 sm:h-12 w-8 sm:w-12 text-muted-foreground/30" />
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-2 sm:gap-4 py-2">
            {/* Audio level indicator */}
            {hasStartedCall && localStream && !isMuted && (
              <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-full">
                <Mic className="h-4 w-4 text-muted-foreground" />
                <AudioLevelIndicator stream={localStream} barCount={5} />
              </div>
            )}

            <Button
              size="lg"
              variant={isMuted ? 'destructive' : 'secondary'}
              onClick={toggleMute}
              className="rounded-full w-12 h-12 sm:w-14 sm:h-14"
              disabled={!hasStartedCall}
            >
              {isMuted ? <MicOff className="h-5 w-5 sm:h-6 sm:w-6" /> : <Mic className="h-5 w-5 sm:h-6 sm:w-6" />}
            </Button>

            <Button
              size="lg"
              variant={isVideoOff ? 'destructive' : 'secondary'}
              onClick={toggleVideo}
              className="rounded-full w-12 h-12 sm:w-14 sm:h-14"
              disabled={!hasStartedCall || isScreenSharing}
            >
              {isVideoOff ? <VideoOff className="h-5 w-5 sm:h-6 sm:w-6" /> : <Video className="h-5 w-5 sm:h-6 sm:w-6" />}
            </Button>

            {/* Screen share button */}
            <Button
              size="lg"
              variant={isScreenSharing ? 'default' : 'secondary'}
              onClick={toggleScreenShare}
              className="rounded-full w-12 h-12 sm:w-14 sm:h-14"
              disabled={!hasStartedCall}
              title={isScreenSharing ? 'Parar compartilhamento' : 'Compartilhar tela'}
            >
              {isScreenSharing ? (
                <MonitorOff className="h-5 w-5 sm:h-6 sm:w-6" />
              ) : (
                <Monitor className="h-5 w-5 sm:h-6 sm:w-6" />
              )}
            </Button>

            {/* Transcription toggle button */}
            <Button
              size="lg"
              variant={isListening ? 'default' : transcriptionError ? 'destructive' : 'secondary'}
              onClick={async () => {
                if (isListening) {
                  stopListening();
                  toast.info('Transcrição pausada');
                } else {
                  try {
                    await startListening();
                    toast.success('Transcrição reativada');
                  } catch {
                    toast.error('Erro ao reativar transcrição');
                  }
                }
              }}
              className="rounded-full w-12 h-12 sm:w-14 sm:h-14"
              disabled={!hasStartedCall}
              title={isListening ? 'Pausar transcrição' : 'Reativar transcrição'}
            >
              {isListening ? (
                <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
              ) : (
                <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6" />
              )}
            </Button>

            <Button
              size="lg"
              variant={showTranscript ? 'default' : 'secondary'}
              onClick={() => setShowTranscript(!showTranscript)}
              className="rounded-full w-12 h-12 sm:w-14 sm:h-14 hidden lg:flex"
            >
              <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6" />
            </Button>

            {!hasStartedCall ? (
              <Button
                size="lg"
                onClick={handleStartSession}
                className="btn-gradient rounded-full px-6 sm:px-8"
              >
                <Phone className="h-5 w-5 mr-2" />
                <span className="hidden sm:inline">Iniciar Sessão</span>
                <span className="sm:hidden">Iniciar</span>
              </Button>
            ) : (
              <Button
                size="lg"
                variant="destructive"
                onClick={handleEndSession}
                className="rounded-full px-6 sm:px-8"
              >
                <PhoneOff className="h-5 w-5 mr-2" />
                <span className="hidden sm:inline">Encerrar</span>
              </Button>
            )}
          </div>
        </div>

        {/* Transcript Sidebar */}
        {showTranscript && (
          <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l bg-card flex flex-col max-h-64 lg:max-h-none">
            <div className="p-3 sm:p-4 border-b">
              <h3 className="font-semibold flex items-center gap-2 text-sm sm:text-base">
                <FileText className="h-4 w-4" />
                Transcrição em Tempo Real
              </h3>
              {transcriptionError && (
                <p className="text-xs text-destructive mt-1">{transcriptionError}</p>
              )}
            </div>
            <ScrollArea className="flex-1 p-3 sm:p-4">
              <div className="space-y-3">
                {liveTranscript.length === 0 ? (
                  <p className="text-muted-foreground text-xs sm:text-sm text-center py-4 sm:py-8">
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
                      <p className="text-xs sm:text-sm">{segment.text}</p>
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
