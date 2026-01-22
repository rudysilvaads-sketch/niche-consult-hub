import { ConsultationRecord } from '@/types';
import { Calendar, FileText, Pill, ClipboardList, MessageSquare } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface RecordViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: ConsultationRecord | null;
}

export function RecordViewDialog({ open, onOpenChange, record }: RecordViewDialogProps) {
  if (!record) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">Prontuário</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Patient Info */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30">
            <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-bold text-lg">
              {record.patientName.split(' ').map(n => n[0]).slice(0, 2).join('')}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">{record.patientName}</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(record.date).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Record Details */}
          <div className="space-y-4">
            {record.diagnosis && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <FileText className="h-4 w-4 text-primary" />
                  Diagnóstico / Avaliação
                </div>
                <p className="text-sm text-muted-foreground pl-6 p-3 bg-secondary/20 rounded-lg">
                  {record.diagnosis}
                </p>
              </div>
            )}

            {record.treatment && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <ClipboardList className="h-4 w-4 text-accent" />
                  Tratamento / Conduta
                </div>
                <p className="text-sm text-muted-foreground pl-6 p-3 bg-secondary/20 rounded-lg">
                  {record.treatment}
                </p>
              </div>
            )}

            {record.prescriptions && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Pill className="h-4 w-4 text-success" />
                  Prescrições
                </div>
                <p className="text-sm text-muted-foreground pl-6 p-3 bg-secondary/20 rounded-lg">
                  {record.prescriptions}
                </p>
              </div>
            )}

            {record.observations && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <MessageSquare className="h-4 w-4 text-warning" />
                  Observações
                </div>
                <p className="text-sm text-muted-foreground pl-6 p-3 bg-secondary/20 rounded-lg">
                  {record.observations}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Registrado em {new Date(record.createdAt).toLocaleDateString('pt-BR', {
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
