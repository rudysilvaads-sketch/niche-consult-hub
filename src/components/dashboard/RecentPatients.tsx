import { Patient } from '@/types';
import { Users, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface RecentPatientsProps {
  patients: Patient[];
  onAddPatient?: () => void;
}

export function RecentPatients({ patients, onAddPatient }: RecentPatientsProps) {
  const recentPatients = patients.slice(0, 5);

  return (
    <div className="bg-card border border-border/50 rounded-2xl p-6 h-full">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-display text-lg font-semibold text-foreground">
          Pacientes Recentes
        </h3>
        <Link to="/pacientes">
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 text-sm">
            Ver Todos
          </Button>
        </Link>
      </div>

      {recentPatients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <p className="text-muted-foreground mb-4">Nenhum paciente cadastrado</p>
          <Link to="/pacientes">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Primeiro Paciente
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {recentPatients.map((patient, index) => (
            <div
              key={patient.id}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/30 transition-colors animate-slide-up cursor-pointer"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-semibold text-sm shrink-0">
                {patient.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-sm truncate">{patient.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {patient.email || patient.phone}
                </p>
              </div>
              <div className={`h-2 w-2 rounded-full shrink-0 ${
                patient.status === 'ativo' ? 'bg-success' : 'bg-muted-foreground/30'
              }`} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
