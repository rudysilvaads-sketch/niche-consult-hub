import { Appointment } from '@/types';
import { Clock, Calendar, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface UpcomingSessionsProps {
  appointments: Appointment[];
}

export function UpcomingSessions({ appointments }: UpcomingSessionsProps) {
  const upcomingSessions = appointments
    .filter(apt => apt.status === 'agendado' || apt.status === 'confirmado')
    .slice(0, 4);

  return (
    <div className="bg-card border border-border/50 rounded-2xl p-6 h-full">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <h3 className="font-display text-lg font-semibold text-foreground">
            Próximas Sessões
          </h3>
        </div>
        <Link to="/agenda">
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 text-sm gap-1">
            Ver todas <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>

      {upcomingSessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
            <Clock className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <p className="text-muted-foreground">Nenhuma sessão agendada</p>
        </div>
      ) : (
        <div className="space-y-3">
          {upcomingSessions.map((session, index) => (
            <div
              key={session.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-secondary/20 hover:bg-secondary/40 transition-colors animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex flex-col items-center justify-center h-12 w-12 rounded-xl bg-primary/10 shrink-0">
                <span className="text-xs font-medium text-primary">
                  {new Date(session.date).toLocaleDateString('pt-BR', { day: '2-digit' })}
                </span>
                <span className="text-[10px] text-primary/80 uppercase">
                  {new Date(session.date).toLocaleDateString('pt-BR', { month: 'short' })}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-sm truncate">{session.patientName}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{session.time}</span>
                  <span>•</span>
                  <span>{session.duration}min</span>
                </div>
              </div>
              <div className={cn(
                "px-2 py-1 rounded-full text-xs font-medium",
                session.status === 'confirmado' 
                  ? "bg-success/10 text-success" 
                  : "bg-warning/10 text-warning"
              )}>
                {session.status === 'confirmado' ? 'Confirmado' : 'Aguardando'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
