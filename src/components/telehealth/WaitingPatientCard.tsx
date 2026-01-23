import { User, Check, X, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface WaitingPatientCardProps {
  patientName: string;
  waitingSince: Date;
  onAdmit: () => void;
  onDeny: () => void;
  isAdmitting?: boolean;
}

export function WaitingPatientCard({
  patientName,
  waitingSince,
  onAdmit,
  onDeny,
  isAdmitting,
}: WaitingPatientCardProps) {
  const waitingTime = Math.floor((Date.now() - waitingSince.getTime()) / 1000);
  const formatWaitingTime = () => {
    if (waitingTime < 60) return `${waitingTime}s`;
    const minutes = Math.floor(waitingTime / 60);
    const seconds = waitingTime % 60;
    return `${minutes}m ${seconds}s`;
  };

  return (
    <Card className="border-primary/50 bg-primary/5 animate-pulse-slow">
      <CardContent className="p-4">
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
            <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
              Na sala de espera
            </Badge>
            
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
      </CardContent>
    </Card>
  );
}
