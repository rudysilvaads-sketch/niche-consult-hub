import { useState } from 'react';
import { User, Check, X, Clock, Send, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface WaitingPatientCardProps {
  patientName: string;
  waitingSince: Date;
  onAdmit: () => void;
  onDeny: () => void;
  onSendMessage: (message: string) => void;
  isAdmitting?: boolean;
}

export function WaitingPatientCard({
  patientName,
  waitingSince,
  onAdmit,
  onDeny,
  onSendMessage,
  isAdmitting,
}: WaitingPatientCardProps) {
  const [message, setMessage] = useState('');
  const [showMessageInput, setShowMessageInput] = useState(false);
  
  const waitingTime = Math.floor((Date.now() - waitingSince.getTime()) / 1000);
  const formatWaitingTime = () => {
    if (waitingTime < 60) return `${waitingTime}s`;
    const minutes = Math.floor(waitingTime / 60);
    const seconds = waitingTime % 60;
    return `${minutes}m ${seconds}s`;
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
      setShowMessageInput(false);
    }
  };

  return (
    <Card className="border-primary/50 bg-primary/5">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">{patientName}</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>Aguardando há {formatWaitingTime()}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30 hidden sm:flex">
              Na sala de espera
            </Badge>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowMessageInput(!showMessageInput)}
              className="text-muted-foreground hover:text-primary"
              title="Enviar mensagem"
            >
              <MessageSquare className="w-4 h-4" />
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={onDeny}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              disabled={isAdmitting}
            >
              <X className="w-4 h-4" />
            </Button>
            
            <Button
              size="sm"
              onClick={onAdmit}
              className="btn-gradient gap-1"
              disabled={isAdmitting}
            >
              <Check className="w-4 h-4" />
              Admitir
            </Button>
          </div>
        </div>
        
        {/* Message input */}
        {showMessageInput && (
          <div className="flex items-center gap-2 pt-2 border-t">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Digite uma mensagem para o paciente..."
              className="flex-1 text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              autoFocus
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
      </CardContent>
    </Card>
  );
}
