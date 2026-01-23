import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useVideoSession } from '@/hooks/useVideoSession';
import { useAuth } from '@/contexts/AuthContext';
import { Appointment } from '@/types';

interface StartSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment | null;
}

export function StartSessionDialog({ open, onOpenChange, appointment }: StartSessionDialogProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createSession } = useVideoSession();
  const [isStarting, setIsStarting] = useState(false);

  const handleStartSession = async () => {
    if (!appointment || !user) return;

    setIsStarting(true);
    try {
      const session = await createSession(
        appointment.id,
        appointment.patientId,
        appointment.patientName,
        user.uid
      );

      if (session) {
        toast.success('Sala de vídeo criada!');
        onOpenChange(false);
        navigate(`/sala/${session.id}`);
      }
    } catch (error) {
      console.error('Error creating session:', error);
      toast.error('Erro ao criar sala de vídeo');
    } finally {
      setIsStarting(false);
    }
  };

  if (!appointment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="h-5 w-5 text-primary" />
            Iniciar Sessão Online
          </DialogTitle>
          <DialogDescription>
            Você está prestes a iniciar uma videochamada com {appointment.patientName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Paciente:</span>
              <span className="font-medium">{appointment.patientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Horário:</span>
              <span className="font-medium">{appointment.time}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tipo:</span>
              <span className="font-medium">{appointment.type}</span>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex gap-3">
            <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium">Recursos da sessão:</p>
              <ul className="text-muted-foreground mt-1 space-y-1">
                <li>• Videochamada em tempo real</li>
                <li>• Transcrição automática</li>
                <li>• Análise de IA ao finalizar</li>
              </ul>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleStartSession} className="btn-gradient" disabled={isStarting}>
            {isStarting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando sala...
              </>
            ) : (
              <>
                <Video className="mr-2 h-4 w-4" />
                Iniciar Agora
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
