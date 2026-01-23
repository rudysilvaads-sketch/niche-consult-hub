import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Brain, Calendar, Clock, User, Heart, 
  Lightbulb, CheckCircle2, ArrowRight, Loader2, FileX
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Branding } from '@/components/branding/Branding';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { AIAnalysis, VideoSession } from '@/types/telehealth';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SharedAnalysis {
  analysis: AIAnalysis;
  session: VideoSession;
  professionalName?: string;
}

const ResumoSessao = () => {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<SharedAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSharedAnalysis = async () => {
      if (!token) {
        setError('Token inválido');
        setLoading(false);
        return;
      }

      if (!isFirebaseConfigured || !db) {
        // Mock data for development
        setData({
          analysis: {
            id: '1',
            sessionId: 'session-1',
            summary: 'Sessão produtiva onde discutimos estratégias para gerenciamento de ansiedade. O paciente demonstrou boa receptividade às técnicas apresentadas.',
            keyTopics: ['Ansiedade', 'Técnicas de respiração', 'Mindfulness'],
            emotionalState: 'Tranquilo e receptivo',
            suggestedFollowUp: [
              'Praticar técnicas de respiração diariamente',
              'Manter diário de emoções',
              'Continuar exercícios de mindfulness'
            ],
            createdAt: new Date().toISOString(),
            isSharedWithPatient: true,
            shareToken: token,
            patientSummary: 'Na nossa sessão de hoje, conversamos sobre formas de lidar melhor com a ansiedade no dia a dia. Praticamos algumas técnicas de respiração e relaxamento que podem te ajudar nos momentos mais difíceis.',
          },
          session: {
            id: 'session-1',
            appointmentId: 'apt-1',
            patientId: 'patient-1',
            patientName: 'Maria Silva',
            professionalId: 'prof-1',
            status: 'completed',
            duration: 50,
            createdAt: new Date().toISOString(),
          },
          professionalName: 'Dr. João Santos',
        });
        setLoading(false);
        return;
      }

      try {
        // Query for the analysis with matching share token
        const analysesRef = collection(db, 'aiAnalyses');
        const q = query(analysesRef, where('shareToken', '==', token), where('isSharedWithPatient', '==', true));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          setError('Resumo não encontrado ou não disponível');
          setLoading(false);
          return;
        }

        const analysisDoc = snapshot.docs[0];
        const analysis = { id: analysisDoc.id, ...analysisDoc.data() } as AIAnalysis;

        // Fetch the related session
        const sessionsRef = collection(db, 'videoSessions');
        const sessionQuery = query(sessionsRef, where('__name__', '==', analysis.sessionId));
        const sessionSnapshot = await getDocs(sessionQuery);

        let session: VideoSession | null = null;
        if (!sessionSnapshot.empty) {
          const sessionDoc = sessionSnapshot.docs[0];
          session = { id: sessionDoc.id, ...sessionDoc.data() } as VideoSession;
        }

        setData({
          analysis,
          session: session || {
            id: analysis.sessionId,
            appointmentId: '',
            patientId: '',
            patientName: 'Paciente',
            professionalId: '',
            status: 'completed',
            createdAt: analysis.createdAt,
          },
        });
      } catch (err) {
        console.error('Error fetching shared analysis:', err);
        setError('Erro ao carregar o resumo');
      } finally {
        setLoading(false);
      }
    };

    fetchSharedAnalysis();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando resumo...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <FileX className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Resumo não disponível</h2>
            <p className="text-muted-foreground mb-6">
              {error || 'O resumo que você está procurando não existe ou não está mais disponível.'}
            </p>
            <Button asChild variant="outline">
              <Link to="/">Voltar ao Início</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { analysis, session, professionalName } = data;
  const sessionDate = new Date(analysis.createdAt);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Branding size="sm" />
          <Badge variant="outline" className="gap-1">
            <Calendar className="h-3 w-3" />
            {format(sessionDate, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </Badge>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Welcome Card */}
        <Card className="mb-6 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-1">
                  Olá, {session.patientName?.split(' ')[0]}! 👋
                </h1>
                <p className="text-muted-foreground">
                  {professionalName ? `${professionalName} compartilhou` : 'Seu profissional compartilhou'} o resumo da sua sessão.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Session Info */}
        <div className="flex items-center gap-4 mb-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            <span>{professionalName || 'Seu profissional'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{session.duration ? `${session.duration} min` : 'Sessão concluída'}</span>
          </div>
        </div>

        {/* Patient Summary (Main highlight) */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Heart className="h-5 w-5 text-primary" />
              Resumo da Sessão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground leading-relaxed text-lg">
              {analysis.patientSummary || analysis.summary}
            </p>
          </CardContent>
        </Card>

        {/* Key Topics */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lightbulb className="h-5 w-5 text-warning" />
              Tópicos Abordados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {analysis.keyTopics.map((topic, i) => (
                <Badge key={i} variant="secondary" className="text-sm py-1.5 px-3">
                  {topic}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Emotional State */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Heart className="h-5 w-5 text-destructive" />
              Como você estava
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{analysis.emotionalState}</p>
          </CardContent>
        </Card>

        {/* Follow-up Suggestions */}
        {analysis.suggestedFollowUp && analysis.suggestedFollowUp.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                Sugestões para Você
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {analysis.suggestedFollowUp.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <ArrowRight className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <Separator className="my-8" />

        {/* Footer Note */}
        <div className="text-center text-sm text-muted-foreground">
          <p className="mb-4">
            Este resumo foi gerado automaticamente e revisado pelo seu profissional.
          </p>
          <p className="text-xs">
            Dúvidas? Entre em contato com seu profissional de saúde.
          </p>
        </div>
      </main>
    </div>
  );
};

export default ResumoSessao;