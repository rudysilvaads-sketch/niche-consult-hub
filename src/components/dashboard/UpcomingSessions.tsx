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
    <div className="glass-card p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          Próximas Sessões
        </h3>
        <Link to="/agenda">
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1 group">
            Ver todas
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </Link>
      </div>

      {upcomingSessions.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
          <div className="h-14 w-14 rounded-2xl bg-secondary flex items-center justify-center mb-4">
            <Clock className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">Nenhuma sessão agendada</p>
        </div>
      ) : (
        <div className="space-y-2 flex-1">
          {upcomingSessions.map((session, index) => (
            <div
              key={session.id}
              className="list-item bg-secondary/50 animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex flex-col items-center justify-center h-11 w-11 rounded-lg bg-primary/10 shrink-0">
                <span className="text-sm font-bold text-primary leading-none">
                  {new Date(session.date).toLocaleDateString('pt-BR', { day: '2-digit' })}
                </span>
                <span className="text-[10px] text-primary/80 uppercase font-medium">
                  {new Date(session.date).toLocaleDateString('pt-BR', { month: 'short' })}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{session.patientName}</p>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{session.time}</span>
                  <span className="text-muted-foreground/40">•</span>
                  <span>{session.duration}min</span>
                </div>
              </div>
              <div className={cn(
                "px-2 py-1 rounded-md text-[11px] font-medium",
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
