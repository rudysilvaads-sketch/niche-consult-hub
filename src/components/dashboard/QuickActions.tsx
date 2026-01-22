import { Calendar, UserPlus, FileText, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const actions = [
  {
    icon: Calendar,
    label: 'Agendar Consulta',
    description: 'Nova consulta',
    color: 'bg-primary/10 text-primary',
  },
  {
    icon: UserPlus,
    label: 'Novo Paciente',
    description: 'Cadastrar paciente',
    color: 'bg-accent/10 text-accent',
  },
  {
    icon: FileText,
    label: 'Novo Prontuário',
    description: 'Registrar atendimento',
    color: 'bg-success/10 text-success',
  },
  {
    icon: Clock,
    label: 'Histórico',
    description: 'Ver consultas passadas',
    color: 'bg-warning/10 text-warning',
  },
];

export function QuickActions() {
  return (
    <div className="card-elevated p-6">
      <h3 className="font-display text-lg font-semibold text-foreground mb-4">
        Ações Rápidas
      </h3>
      
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <button
            key={action.label}
            className="flex flex-col items-center p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-all duration-200 hover:-translate-y-0.5 animate-slide-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className={cn('rounded-xl p-3 mb-3', action.color)}>
              <action.icon className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-foreground">{action.label}</p>
            <p className="text-xs text-muted-foreground">{action.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
