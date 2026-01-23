import { Appointment } from '@/types';
import { Clock, Calendar, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface UpcomingSessionsProps {
  appointments: Appointment[];
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

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
            <motion.span
              initial={{ x: 0 }}
              whileHover={{ x: 4 }}
            >
              <ArrowRight className="h-3 w-3" />
            </motion.span>
          </Button>
        </Link>
      </div>

      {upcomingSessions.length === 0 ? (
        <motion.div 
          className="flex-1 flex flex-col items-center justify-center py-8 text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="h-14 w-14 rounded-2xl bg-secondary flex items-center justify-center mb-4">
            <Clock className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">Nenhuma sessão agendada</p>
        </motion.div>
      ) : (
        <motion.div 
          className="space-y-2 flex-1"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: { staggerChildren: 0.05 }
            }
          }}
        >
          {upcomingSessions.map((session) => (
            <motion.div
              key={session.id}
              className="list-item bg-secondary/50"
              variants={itemVariants}
              whileHover={{ scale: 1.01, backgroundColor: 'hsl(var(--secondary))' }}
              transition={{ duration: 0.2 }}
            >
              <motion.div 
                className="flex flex-col items-center justify-center h-11 w-11 rounded-lg bg-primary/10 shrink-0"
                whileHover={{ scale: 1.05 }}
              >
                <span className="text-sm font-bold text-primary leading-none">
                  {new Date(session.date).toLocaleDateString('pt-BR', { day: '2-digit' })}
                </span>
                <span className="text-[10px] text-primary/80 uppercase font-medium">
                  {new Date(session.date).toLocaleDateString('pt-BR', { month: 'short' })}
                </span>
              </motion.div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{session.patientName}</p>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{session.time}</span>
                  <span className="text-muted-foreground/40">•</span>
                  <span>{session.duration}min</span>
                </div>
              </div>
              <motion.div 
                className={cn(
                  "px-2 py-1 rounded-md text-[11px] font-medium",
                  session.status === 'confirmado' 
                    ? "bg-success/10 text-success" 
                    : "bg-warning/10 text-warning"
                )}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                {session.status === 'confirmado' ? 'Confirmado' : 'Aguardando'}
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
