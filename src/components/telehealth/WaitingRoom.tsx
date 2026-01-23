import { Loader2, Clock, User, Video, MessageSquare } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface WaitingRoomMessage {
  id: string;
  sender: 'host' | 'patient';
  senderName: string;
  text: string;
  timestamp: string;
}

interface WaitingRoomProps {
  patientName?: string;
  professionalName?: string;
  messages?: WaitingRoomMessage[];
}

export function WaitingRoom({ patientName, professionalName, messages = [] }: WaitingRoomProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-8 pb-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            {/* Animated waiting icon */}
            <div className="relative mx-auto w-20 h-20">
              <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
              <div className="relative w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-10 h-10 text-primary" />
              </div>
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-semibold">Sala de Espera</h2>
              <p className="text-muted-foreground text-sm">
                {patientName ? (
                  <>Olá, <span className="font-medium text-foreground">{patientName}</span>!</>
                ) : (
                  'Olá!'
                )}
              </p>
            </div>
          </div>

          {/* Status */}
          <div className="bg-muted/50 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Aguardando o profissional admitir você...</span>
            </div>
            
            {professionalName && (
              <p className="text-xs text-muted-foreground text-center">
                Você será atendido por: <span className="font-medium text-foreground">{professionalName}</span>
              </p>
            )}
          </div>

          {/* Messages from professional */}
          {messages.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <MessageSquare className="w-4 h-4 text-primary" />
                <span>Mensagens do profissional</span>
              </div>
              <ScrollArea className="h-32 rounded-lg border bg-background p-3">
                <div className="space-y-2">
                  {messages.filter(m => m.sender === 'host').map((msg) => (
                    <div 
                      key={msg.id} 
                      className="bg-primary/10 rounded-lg p-2 text-sm"
                    >
                      <p className="text-foreground">{msg.text}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString('pt-BR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Badges */}
          <div className="flex items-center justify-center gap-3 text-xs">
            <Badge variant="outline" className="gap-1">
              <Video className="w-3 h-3" />
              Câmera pronta
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Clock className="w-3 h-3" />
              Conectado
            </Badge>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            A sessão iniciará automaticamente quando o profissional admitir sua entrada.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
