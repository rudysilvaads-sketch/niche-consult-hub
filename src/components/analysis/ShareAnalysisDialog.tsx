import { useState } from 'react';
import { Copy, Check, Share2, Eye, Send, Loader2, ExternalLink } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { AIAnalysis } from '@/types/telehealth';

interface ShareAnalysisDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  analysis: AIAnalysis;
  patientName: string;
  onShareComplete?: (shareToken: string) => void;
}

export function ShareAnalysisDialog({
  open,
  onOpenChange,
  analysis,
  patientName,
  onShareComplete,
}: ShareAnalysisDialogProps) {
  const [patientSummary, setPatientSummary] = useState(
    analysis.patientSummary || generateDefaultPatientSummary(analysis, patientName)
  );
  const [isSharing, setIsSharing] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(
    analysis.shareToken ? `${window.location.origin}/resumo/${analysis.shareToken}` : null
  );
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    setIsSharing(true);
    
    try {
      const shareToken = generateShareToken();
      const shareUrl = `${window.location.origin}/resumo/${shareToken}`;

      if (isFirebaseConfigured && db) {
        await updateDoc(doc(db, 'aiAnalyses', analysis.id), {
          isSharedWithPatient: true,
          shareToken,
          patientSummary,
          sharedAt: new Date().toISOString(),
        });
      }

      setShareLink(shareUrl);
      onShareComplete?.(shareToken);
      toast.success('Resumo compartilhado com sucesso!');
    } catch (error) {
      console.error('Error sharing analysis:', error);
      toast.error('Erro ao compartilhar resumo');
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyLink = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      setCopied(true);
      toast.success('Link copiado!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOpenLink = () => {
    if (shareLink) {
      window.open(shareLink, '_blank');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" />
            Compartilhar Resumo com Paciente
          </DialogTitle>
          <DialogDescription>
            Personalize o resumo que {patientName} receberá e compartilhe via link.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!shareLink ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="patientSummary">
                  Resumo para o Paciente
                </Label>
                <Textarea
                  id="patientSummary"
                  value={patientSummary}
                  onChange={(e) => setPatientSummary(e.target.value)}
                  placeholder="Escreva um resumo amigável para o paciente..."
                  className="min-h-[150px]"
                />
                <p className="text-xs text-muted-foreground">
                  Este é o texto principal que o paciente verá. Evite termos técnicos.
                </p>
              </div>

              <Separator />

              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  O paciente também verá:
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Tópicos abordados na sessão</li>
                  <li>• Estado emocional observado</li>
                  <li>• Sugestões de acompanhamento</li>
                </ul>
                <p className="text-xs text-muted-foreground mt-2 italic">
                  Indicadores de risco, pré-diagnóstico e notas terapêuticas NÃO são exibidos.
                </p>
              </div>

              <Button 
                onClick={handleShare} 
                className="w-full btn-gradient"
                disabled={isSharing || !patientSummary.trim()}
              >
                {isSharing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Gerando link...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Gerar Link de Compartilhamento
                  </>
                )}
              </Button>
            </>
          ) : (
            <div className="space-y-4">
              <div className="bg-success/10 border border-success/20 rounded-lg p-4 text-center">
                <Check className="h-8 w-8 text-success mx-auto mb-2" />
                <p className="font-medium text-success">Link gerado com sucesso!</p>
              </div>

              <div className="space-y-2">
                <Label>Link de Compartilhamento</Label>
                <div className="flex gap-2">
                  <Input 
                    value={shareLink} 
                    readOnly 
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyLink}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-success" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleOpenLink}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Envie este link para {patientName} por WhatsApp, email ou outro meio.
                </p>
              </div>

              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => onOpenChange(false)}
              >
                Fechar
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function generateShareToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 24; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

function generateDefaultPatientSummary(analysis: AIAnalysis, patientName: string): string {
  const firstName = patientName.split(' ')[0];
  return `Olá ${firstName}, na nossa sessão de hoje conversamos sobre assuntos importantes para o seu processo terapêutico. ${analysis.summary}`;
}