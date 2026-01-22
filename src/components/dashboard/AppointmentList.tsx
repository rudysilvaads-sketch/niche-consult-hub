import { Clock, User, MoreVertical } from 'lucide-react';
import { Appointment, STATUS_LABELS, AppointmentStatus } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AppointmentListProps {
  appointments: Appointment[];
  title?: string;
  showDate?: boolean;
}

const statusColors: Record<AppointmentStatus, string> = {
  agendado: 'bg-warning/10 text-warning border-warning/20',
  confirmado: 'bg-primary/10 text-primary border-primary/20',
  em_andamento: 'bg-accent/10 text-accent border-accent/20',
  concluido: 'bg-success/10 text-success border-success/20',
  cancelado: 'bg-destructive/10 text-destructive border-destructive/20',
};

export function AppointmentList({ appointments, title, showDate = false }: AppointmentListProps) {
  return (
    <div className="card-elevated p-6">
      {title && (
        <h3 className="font-display text-lg font-semibold text-foreground mb-4">{title}</h3>
      )}
      
      <div className="space-y-3">
        {appointments.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Nenhuma consulta encontrada
          </p>
        ) : (
          appointments.map((appointment, index) => (
            <div
              key={appointment.id}
              className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{appointment.patientName}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {appointment.time}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {appointment.duration} min
                    </span>
                    {showDate && (
                      <span className="text-sm text-muted-foreground">
                        {new Date(appointment.date).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    'badge-status border',
                    statusColors[appointment.status]
                  )}
                >
                  {STATUS_LABELS[appointment.status]}
                </span>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
                    <DropdownMenuItem>Editar</DropdownMenuItem>
                    <DropdownMenuItem>Iniciar atendimento</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      Cancelar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
