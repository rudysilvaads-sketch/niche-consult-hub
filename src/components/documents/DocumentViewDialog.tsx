import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Document, DOCUMENT_TYPE_LABELS } from '@/types';
import { Download, Printer, Calendar, User } from 'lucide-react';
import { toast } from 'sonner';

interface DocumentViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: Document | null;
}

export function DocumentViewDialog({
  open,
  onOpenChange,
  document,
}: DocumentViewDialogProps) {
  if (!document) return null;

  const handlePrint = () => {
    window.print();
    toast.success('Enviando para impressão...');
  };

  const handleDownload = () => {
    toast.success('Download iniciado!');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{DOCUMENT_TYPE_LABELS[document.type]}</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Document Header */}
          <div className="border-b border-border pb-4">
            <h2 className="text-xl font-semibold text-foreground mb-2">{document.title}</h2>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {document.patientName}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(document.date).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </div>
            </div>
          </div>

          {/* Document Content */}
          <div className="bg-muted/30 rounded-lg p-6 min-h-[300px]">
            <div className="prose prose-sm max-w-none">
              {document.content.split('\n').map((line, i) => (
                <p key={i} className="text-foreground mb-2">
                  {line || <br />}
                </p>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-border pt-4 text-center">
            <div className="h-20 flex items-end justify-center">
              <div className="border-t border-foreground w-48 pt-2">
                <p className="text-sm text-muted-foreground">Assinatura do Profissional</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
