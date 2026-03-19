import { useState } from 'react';
import { Loader2, Clock, User, Video, MessageSquare, Send } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

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
  onSendMessage?: (message: string) => void;
  onTyping?: () => void;
  typingUsers?: string[];
}

export function WaitingRoom({ patientName, professionalName, messages = [], onSendMessage, onTyping, typingUsers = [] }: WaitingRoomProps) {
  const [message, setMessage] = useState('');

  const handleSendMessage = () => {
    if (message.trim() && onSendMessage) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 pb-6 space-y-4">
          {/* Header */}
          <div className="text-center space-y-3">
            {/* Animated waiting icon */}
            <div className="relative mx-auto w-16 h-16">
              <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
              <div className="relative w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
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

          {/* Chat messages */}
          {(messages.length > 0 || onSendMessage) && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <MessageSquare className="w-4 h-4 text-primary" />
                <span>Chat</span>
              </div>
              
              <ScrollArea className="h-40 rounded-lg border bg-background p-3">
                <div className="space-y-2">
                  {messages.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      Nenhuma mensagem ainda
                    </p>
                  ) : (
                    messages.map((msg) => (
                      <div 
                        key={msg.id} 
                        className={`rounded-lg p-2 text-sm max-w-[85%] ${
                          msg.sender === 'host' 
                            ? 'bg-primary/10 mr-auto' 
                            : 'bg-muted ml-auto'
                        }`}
                      >
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          {msg.sender === 'host' ? 'Profissional' : 'Você'}
                        </p>
                        <p className="text-foreground">{msg.text}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(msg.timestamp).toLocaleTimeString('pt-BR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>

              {/* Typing indicator */}
              {typingUsers.length > 0 && (
                <div className="flex items-center gap-2 px-1">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
                  </div>
                  <span className="text-xs text-muted-foreground italic">
                    {typingUsers.join(', ')} {typingUsers.length === 1 ? 'está' : 'estão'} digitando...
                  </span>
                </div>
              )}

              {/* Message input for patient */}
              {onSendMessage && (
                <div className="flex items-center gap-2">
                  <Input
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      if (e.target.value.trim() && onTyping) onTyping();
                    }}
                    placeholder="Digite uma mensagem..."
                    className="flex-1 text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    className="btn-gradient"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              )}
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
