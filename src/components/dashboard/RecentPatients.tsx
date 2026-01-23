import { Patient } from '@/types';
import { Users, Plus, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface RecentPatientsProps {
  patients: Patient[];
  onAddPatient?: () => void;
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export function RecentPatients({ patients }: RecentPatientsProps) {
  const recentPatients = patients.slice(0, 5);

  return (
    <div className="glass-card p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">
          Pacientes Recentes
        </h3>
        <Link to="/pacientes">
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1 group">
            Ver Todos
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </Link>
      </div>

      {recentPatients.length === 0 ? (
        <motion.div 
          className="flex-1 flex flex-col items-center justify-center py-8 text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="h-14 w-14 rounded-2xl bg-secondary flex items-center justify-center mb-4">
            <Users className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground mb-4">Nenhum paciente cadastrado</p>
          <Link to="/pacientes">
            <Button size="sm" className="btn-gradient gap-2 h-8">
              <Plus className="h-3.5 w-3.5" />
              Adicionar Paciente
            </Button>
          </Link>
        </motion.div>
      ) : (
        <motion.div 
          className="space-y-1 flex-1"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: { staggerChildren: 0.05 }
            }
          }}
        >
          {recentPatients.map((patient) => (
            <motion.div
              key={patient.id}
              variants={itemVariants}
              whileHover={{ backgroundColor: 'hsl(var(--secondary))' }}
              transition={{ duration: 0.2 }}
            >
              <Link
                to="/pacientes"
                className="list-item group"
              >
                <motion.div 
                  className="h-9 w-9 rounded-lg avatar-gradient text-xs flex-shrink-0"
                  whileHover={{ scale: 1.05 }}
                >
                  {patient.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </motion.div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                    {patient.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {patient.email || patient.phone}
                  </p>
                </div>
                <motion.div 
                  className={cn(
                    "h-2 w-2 rounded-full shrink-0",
                    patient.status === 'ativo' ? 'bg-success' : 'bg-muted-foreground/30'
                  )}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
