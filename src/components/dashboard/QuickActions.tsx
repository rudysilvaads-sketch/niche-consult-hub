import { Calendar, UserPlus, FileText, ClipboardList, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface QuickActionsProps {
  onNewAppointment?: () => void;
  hasPatients?: boolean;
}

export function QuickActions({ onNewAppointment, hasPatients = true }: QuickActionsProps) {
  const actions = [
    {
      icon: UserPlus,
      label: 'Adicionar Paciente',
      description: 'Cadastrar novo paciente',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      to: '/pacientes',
      requiresPatient: false,
    },
    {
      icon: Calendar,
      label: 'Agendar Sessão',
      description: hasPatients ? 'Agendar nova consulta' : 'Requer paciente',
      color: 'text-success',
      bgColor: 'bg-success/10',
      onClick: onNewAppointment,
      requiresPatient: true,
      disabled: !hasPatients,
    },
    {
      icon: FileText,
      label: 'Ver Documentos',
      description: hasPatients ? 'Recibos e atestados' : 'Requer paciente',
      color: 'text-accent',
      bgColor: 'bg-accent/10',
      to: '/documentos',
      requiresPatient: true,
      disabled: !hasPatients,
    },
    {
      icon: ClipboardList,
      label: 'Anamnese',
      description: hasPatients ? 'Prontuário do paciente' : 'Requer paciente',
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      to: '/prontuarios',
      requiresPatient: true,
      disabled: !hasPatients,
    },
  ];

  return (
    <div className="glass-card p-5 h-full">
      <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
        Ações Rápidas
      </h3>
      
      <div className="space-y-2">
        {actions.map((action, index) => {
          const content = (
            <>
              <div className={cn(
                'h-10 w-10 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105',
                action.bgColor,
                action.disabled && 'opacity-50'
              )}>
                <action.icon className={cn('h-[18px] w-[18px]', action.color)} />
              </div>
              <div className="flex-1 text-left">
                <p className={cn(
                  "text-sm font-medium text-foreground",
                  action.disabled && 'text-muted-foreground'
                )}>{action.label}</p>
                <p className="text-xs text-muted-foreground">{action.description}</p>
              </div>
              <ChevronRight className={cn(
                "h-4 w-4 text-muted-foreground/50 transition-transform duration-200 group-hover:translate-x-0.5",
                action.disabled && 'opacity-0'
              )} />
            </>
          );

          const baseClasses = cn(
            "action-btn group animate-slide-up",
            action.disabled && "cursor-not-allowed opacity-60"
          );

          if (action.disabled) {
            return (
              <div
                key={action.label}
                className={baseClasses}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {content}
              </div>
            );
          }

          if (action.onClick) {
            return (
              <button
                key={action.label}
                onClick={action.onClick}
                className={baseClasses}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {content}
              </button>
            );
          }

          return (
            <Link
              key={action.label}
              to={action.to || '/'}
              className={baseClasses}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {content}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
