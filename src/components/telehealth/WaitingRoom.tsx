import { Loader2, Clock, User, Video } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface WaitingRoomProps {
  patientName?: string;
  professionalName?: string;
}

export function WaitingRoom({ patientName, professionalName }: WaitingRoomProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-8 pb-8 text-center space-y-6">
          {/* Animated waiting icon */}
          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
            <div className="relative w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-12 h-12 text-primary" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Sala de Espera</h2>
            <p className="text-muted-foreground">
              {patientName ? (
                <>Olá, <span className="font-medium text-foreground">{patientName}</span>!</>
              ) : (
                'Olá!'
              )}
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Aguardando o profissional admitir você...</span>
            </div>
            
            {professionalName && (
              <p className="text-sm text-muted-foreground">
                Você será atendido por: <span className="font-medium text-foreground">{professionalName}</span>
              </p>
            )}
          </div>

          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <Badge variant="outline" className="gap-1">
              <Video className="w-3 h-3" />
              Câmera pronta
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Clock className="w-3 h-3" />
              Conectado
            </Badge>
          </div>

          <p className="text-xs text-muted-foreground">
            A sessão iniciará automaticamente quando o profissional admitir sua entrada.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
