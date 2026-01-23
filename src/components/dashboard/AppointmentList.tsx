import { Clock, User, MoreVertical, Video, Calendar } from 'lucide-react';
import { Appointment, STATUS_LABELS, AppointmentStatus } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AppointmentListProps {
  appointments: Appointment[];
  title?: string;
  showDate?: boolean;
  onEdit?: (appointment: Appointment) => void;
  onUpdateStatus?: (id: string, status: AppointmentStatus) => void;
  onDelete?: (id: string) => void;
  onStartSession?: (appointment: Appointment) => void;
}

const statusColors: Record<AppointmentStatus, string> = {
  agendado: 'bg-warning/10 text-warning border-warning/20',
  confirmado: 'bg-primary/10 text-primary border-primary/20',
  em_andamento: 'bg-accent/10 text-accent border-accent/20',
  concluido: 'bg-success/10 text-success border-success/20',
  cancelado: 'bg-destructive/10 text-destructive border-destructive/20',
};

export function AppointmentList({ 
  appointments, 
  title, 
  showDate = false,
  onEdit,
  onUpdateStatus,
  onDelete,
  onStartSession,
}: AppointmentListProps) {
  return (
    <div className="card-elevated p-4 sm:p-6">
      {title && (
        <h3 className="font-display text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">{title}</h3>
      )}
      
      <div className="space-y-2 sm:space-y-3">
        {appointments.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">Nenhuma consulta encontrada</p>
          </div>
        ) : (
          appointments.map((appointment, index) => (
            <div
              key={appointment.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors animate-slide-up gap-3"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Patient info */}
              <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-primary/10 shrink-0">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground truncate">{appointment.patientName}</p>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-0.5 sm:mt-1">
                    <span className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      {appointment.time}
                    </span>
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      {appointment.duration} min
                    </span>
                    {showDate && (
                      <span className="text-xs sm:text-sm text-muted-foreground">
                        {new Date(appointment.date).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 pl-[52px] sm:pl-0">
                <span
                  className={cn(
                    'badge-status border text-[10px] sm:text-xs px-2 py-0.5',
                    statusColors[appointment.status]
                  )}
                >
                  {STATUS_LABELS[appointment.status]}
                </span>

                {/* Start Session Button */}
                {onStartSession && (appointment.status === 'confirmado' || appointment.status === 'agendado') && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onStartSession(appointment)}
                    className="gap-1 sm:gap-1.5 text-primary border-primary/30 hover:bg-primary/10 h-8 px-2 sm:px-3 text-xs sm:text-sm"
                  >
                    <Video className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Iniciar</span>
                  </Button>
                )}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onEdit && (
                      <DropdownMenuItem onClick={() => onEdit(appointment)}>
                        Editar
                      </DropdownMenuItem>
                    )}
                    {onStartSession && (
                      <DropdownMenuItem onClick={() => onStartSession(appointment)}>
                        <Video className="h-4 w-4 mr-2" />
                        Iniciar sessão online
                      </DropdownMenuItem>
                    )}
                    {onUpdateStatus && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onUpdateStatus(appointment.id, 'confirmado')}>
                          Confirmar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onUpdateStatus(appointment.id, 'em_andamento')}>
                          Iniciar atendimento
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onUpdateStatus(appointment.id, 'concluido')}>
                          Marcar como concluído
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    {onDelete && (
                      <DropdownMenuItem 
                        onClick={() => onDelete(appointment.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        Cancelar consulta
                      </DropdownMenuItem>
                    )}
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
