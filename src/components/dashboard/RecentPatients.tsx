import { Patient } from '@/types';
import { Users, Plus, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface RecentPatientsProps {
  patients: Patient[];
  onAddPatient?: () => void;
}

export function RecentPatients({ patients }: RecentPatientsProps) {
  const recentPatients = patients.slice(0, 5);

  return (
    <div className="glass-card p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
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
        <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
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
        </div>
      ) : (
        <div className="space-y-1 flex-1">
          {recentPatients.map((patient, index) => (
            <Link
              key={patient.id}
              to="/pacientes"
              className="list-item animate-slide-up group"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="h-9 w-9 rounded-lg avatar-gradient text-xs flex-shrink-0">
                {patient.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                  {patient.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {patient.email || patient.phone}
                </p>
              </div>
              <div className={cn(
                "h-2 w-2 rounded-full shrink-0",
                patient.status === 'ativo' ? 'bg-success' : 'bg-muted-foreground/30'
              )} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
