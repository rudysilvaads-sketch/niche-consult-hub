import { Patient } from '@/types';
import { User, Mail, Phone, Calendar, MapPin, FileText } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface PatientViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient | null;
}

export function PatientViewDialog({ open, onOpenChange, patient }: PatientViewDialogProps) {
  if (!patient) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-display">Detalhes do Paciente</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Avatar and Name */}
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-bold text-xl">
              {patient.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground">{patient.name}</h3>
              <p className="text-sm text-muted-foreground">CPF: {patient.cpf}</p>
            </div>
          </div>

          {/* Info Grid */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
              <Mail className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">E-mail</p>
                <p className="text-sm font-medium text-foreground">{patient.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
              <Phone className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Telefone</p>
                <p className="text-sm font-medium text-foreground">{patient.phone}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Data de Nascimento</p>
                <p className="text-sm font-medium text-foreground">
                  {new Date(patient.birthDate).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>

            {patient.address && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Endereço</p>
                  <p className="text-sm font-medium text-foreground">{patient.address}</p>
                </div>
              </div>
            )}

            {patient.notes && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
                <FileText className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Observações</p>
                  <p className="text-sm font-medium text-foreground">{patient.notes}</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Paciente desde {new Date(patient.createdAt).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
