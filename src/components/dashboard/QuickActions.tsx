import { Calendar, UserPlus, FileText, ClipboardList, Plus } from 'lucide-react';
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
      iconBg: 'bg-primary',
      iconColor: 'text-primary-foreground',
      to: '/pacientes',
      requiresPatient: false,
    },
    {
      icon: Calendar,
      label: 'Agendar Sessão',
      description: hasPatients ? 'Agendar consulta' : 'Requer paciente',
      iconBg: 'bg-success',
      iconColor: 'text-success-foreground',
      onClick: onNewAppointment,
      requiresPatient: true,
      disabled: !hasPatients,
    },
    {
      icon: FileText,
      label: 'Ver Documentos',
      description: hasPatients ? 'Recibos e atestados' : 'Requer paciente',
      iconBg: 'bg-accent',
      iconColor: 'text-accent-foreground',
      to: '/documentos',
      requiresPatient: true,
      disabled: !hasPatients,
    },
    {
      icon: ClipboardList,
      label: 'Anamnese',
      description: hasPatients ? 'Prontuário do paciente' : 'Requer paciente',
      iconBg: 'bg-warning',
      iconColor: 'text-warning-foreground',
      to: '/prontuarios',
      requiresPatient: true,
      disabled: !hasPatients,
    },
  ];

  return (
    <div className="bg-card border border-border/50 rounded-2xl p-6">
      <h3 className="font-display text-lg font-semibold text-foreground mb-5">
        Ações Rápidas
      </h3>
      
      <div className="space-y-3">
        {actions.map((action, index) => {
          const content = (
            <div className="flex items-center gap-4 w-full">
              <div className={cn(
                'h-11 w-11 rounded-xl flex items-center justify-center shrink-0',
                action.iconBg,
                action.disabled && 'opacity-50'
              )}>
                {action.label === 'Adicionar Paciente' ? (
                  <Plus className={cn('h-5 w-5', action.iconColor)} />
                ) : (
                  <action.icon className={cn('h-5 w-5', action.iconColor)} />
                )}
              </div>
              <div className="text-left flex-1">
                <p className={cn(
                  "text-sm font-medium text-foreground",
                  action.disabled && 'text-muted-foreground'
                )}>{action.label}</p>
                <p className="text-xs text-muted-foreground">{action.description}</p>
              </div>
              {action.disabled && (
                <div className="h-2 w-2 rounded-full bg-warning shrink-0" />
              )}
            </div>
          );

          const baseClasses = cn(
            "flex items-center w-full p-3 rounded-xl border border-border/30 transition-all duration-200 animate-slide-up",
            action.disabled 
              ? "bg-muted/30 cursor-not-allowed" 
              : "bg-secondary/20 hover:bg-secondary/40 hover:border-border/50 hover:-translate-y-0.5"
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
