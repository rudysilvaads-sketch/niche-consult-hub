import { Patient } from '@/types';
import { Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RecentPatientsProps {
  patients: Patient[];
}

export function RecentPatients({ patients }: RecentPatientsProps) {
  return (
    <div className="card-elevated p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg font-semibold text-foreground">
          Pacientes Recentes
        </h3>
        <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
          Ver todos
        </Button>
      </div>

      <div className="space-y-4">
        {patients.slice(0, 4).map((patient, index) => (
          <div
            key={patient.id}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/30 transition-colors animate-slide-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-semibold text-sm">
                {patient.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">{patient.name}</p>
                <p className="text-xs text-muted-foreground">
                  Desde {new Date(patient.createdAt).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                <Phone className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
