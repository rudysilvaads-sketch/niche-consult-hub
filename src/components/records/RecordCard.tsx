import { ConsultationRecord } from '@/types';
import { Calendar, FileText, Pill, Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RecordCardProps {
  record: ConsultationRecord;
  onView?: (record: ConsultationRecord) => void;
  onEdit?: (record: ConsultationRecord) => void;
  onDelete?: (record: ConsultationRecord) => void;
}

export function RecordCard({ record, onView, onEdit, onDelete }: RecordCardProps) {
  return (
    <div className="card-elevated p-6 animate-slide-up">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-semibold">
            {record.patientName.split(' ').map(n => n[0]).slice(0, 2).join('')}
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{record.patientName}</h3>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(record.date).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-muted-foreground hover:text-primary"
            onClick={() => onView?.(record)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-muted-foreground hover:text-primary"
            onClick={() => onEdit?.(record)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => onDelete?.(record)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {record.diagnosis && (
        <div className="mb-3">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-1">
            <FileText className="h-4 w-4 text-primary" />
            Diagnóstico
          </div>
          <p className="text-sm text-muted-foreground pl-6 line-clamp-2">{record.diagnosis}</p>
        </div>
      )}

      {record.treatment && (
        <div className="mb-3">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-1">
            <Pill className="h-4 w-4 text-accent" />
            Tratamento
          </div>
          <p className="text-sm text-muted-foreground pl-6 line-clamp-2">{record.treatment}</p>
        </div>
      )}

      {record.observations && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground line-clamp-2">{record.observations}</p>
        </div>
      )}
    </div>
  );
}
