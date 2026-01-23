import { Calendar, UserPlus, FileText, ClipboardList, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface QuickActionsProps {
  onNewAppointment?: () => void;
  hasPatients?: boolean;
}

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 },
};

export function QuickActions({ onNewAppointment, hasPatients = true }: QuickActionsProps) {
  const actions = [
    {
      icon: UserPlus,
      label: 'Adicionar Paciente',
      description: 'Cadastrar novo paciente',
      color: 'text-violet-500',
      bgColor: 'bg-violet-50',
      to: '/pacientes',
      requiresPatient: false,
    },
    {
      icon: Calendar,
      label: 'Agendar Sessão',
      description: hasPatients ? 'Agendar nova consulta' : 'Requer paciente',
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      onClick: onNewAppointment,
      requiresPatient: true,
      disabled: !hasPatients,
    },
    {
      icon: FileText,
      label: 'Ver Documentos',
      description: hasPatients ? 'Recibos e atestados' : 'Requer paciente',
      color: 'text-pink-500',
      bgColor: 'bg-pink-50',
      to: '/documentos',
      requiresPatient: true,
      disabled: !hasPatients,
    },
    {
      icon: ClipboardList,
      label: 'Anamnese',
      description: hasPatients ? 'Prontuário do paciente' : 'Requer paciente',
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
      to: '/prontuarios',
      requiresPatient: true,
      disabled: !hasPatients,
    },
  ];

  return (
    <div className="glass-card p-5 h-full">
      <h3 className="text-sm font-semibold text-foreground mb-4">
        Ações Rápidas
      </h3>
      
      <motion.div 
        className="space-y-2"
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: { staggerChildren: 0.05 }
          }
        }}
      >
        {actions.map((action) => {
          const content = (
            <>
              <motion.div 
                className={cn(
                  'h-10 w-10 rounded-lg flex items-center justify-center shrink-0',
                  action.bgColor,
                  action.disabled && 'opacity-50'
                )}
                whileHover={!action.disabled ? { scale: 1.1 } : undefined}
                transition={{ duration: 0.2 }}
              >
                <action.icon className={cn('h-[18px] w-[18px]', action.color)} />
              </motion.div>
              <div className="flex-1 text-left">
                <p className={cn(
                  "text-sm font-medium text-foreground",
                  action.disabled && 'text-muted-foreground'
                )}>{action.label}</p>
                <p className="text-xs text-muted-foreground">{action.description}</p>
              </div>
              <motion.div
                initial={{ x: 0 }}
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight className={cn(
                  "h-4 w-4 text-muted-foreground/40",
                  action.disabled && 'opacity-0'
                )} />
              </motion.div>
            </>
          );

          const baseClasses = cn(
            "action-btn group",
            action.disabled && "cursor-not-allowed opacity-60"
          );

          if (action.disabled) {
            return (
              <motion.div
                key={action.label}
                className={baseClasses}
                variants={itemVariants}
              >
                {content}
              </motion.div>
            );
          }

          if (action.onClick) {
            return (
              <motion.button
                key={action.label}
                onClick={action.onClick}
                className={baseClasses}
                variants={itemVariants}
                whileHover={{ backgroundColor: 'hsl(var(--secondary))' }}
                whileTap={{ scale: 0.98 }}
              >
                {content}
              </motion.button>
            );
          }

          return (
            <motion.div key={action.label} variants={itemVariants}>
              <Link
                to={action.to || '/'}
                className={baseClasses}
              >
                {content}
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
