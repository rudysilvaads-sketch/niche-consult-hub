import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Document, Patient, DocumentType, DOCUMENT_TYPE_LABELS } from '@/types';

interface DocumentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (doc: Partial<Document>) => void;
  document: Document | null;
  type: DocumentType;
  patients: Patient[];
}

const documentTemplates: Record<DocumentType, string> = {
  recibo: 'Recebi de [PACIENTE] o valor de R$ [VALOR] referente a [SERVIÇO] realizado em [DATA].',
  atestado: 'Atesto para os devidos fins que [PACIENTE] encontra-se em acompanhamento [TIPO] desde [DATA].',
  declaracao: 'Declaro para os devidos fins que [PACIENTE] compareceu a este consultório em [DATA] para realização de [SERVIÇO].',
  relatorio: 'Relatório de Acompanhamento\n\nPaciente: [PACIENTE]\nPeríodo: [DATA]\n\nEvolução:\n[CONTEUDO]',
  receituario: 'Prescrição Médica\n\nPaciente: [PACIENTE]\nData: [DATA]\n\nMedicamentos:\n[CONTEUDO]',
};

export function DocumentFormDialog({
  open,
  onOpenChange,
  onSave,
  document,
  type,
  patients,
}: DocumentFormDialogProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [patientId, setPatientId] = useState('');
  const [docType, setDocType] = useState<DocumentType>(type);

  useEffect(() => {
    if (document) {
      setTitle(document.title);
      setContent(document.content);
      setDate(document.date);
      setPatientId(document.patientId);
      setDocType(document.type);
    } else {
      setTitle(`${DOCUMENT_TYPE_LABELS[type]} - ${new Date().toLocaleDateString('pt-BR')}`);
      setContent(documentTemplates[type]);
      setDate(new Date().toISOString().split('T')[0]);
      setPatientId('');
      setDocType(type);
    }
  }, [document, type, open]);

  const handlePatientChange = (id: string) => {
    setPatientId(id);
    const patient = patients.find(p => p.id === id);
    if (patient && content.includes('[PACIENTE]')) {
      setContent(content.replace('[PACIENTE]', patient.name));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find(p => p.id === patientId);
    onSave({
      type: docType,
      title,
      content,
      date,
      patientId,
      patientName: patient?.name || '',
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {document ? 'Editar' : 'Novo'} {DOCUMENT_TYPE_LABELS[docType]}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Documento</Label>
              <Select value={docType} onValueChange={(v) => {
                setDocType(v as DocumentType);
                if (!document) {
                  setContent(documentTemplates[v as DocumentType]);
                  setTitle(`${DOCUMENT_TYPE_LABELS[v as DocumentType]} - ${new Date().toLocaleDateString('pt-BR')}`);
                }
              }}>
                <SelectTrigger className="input-styled">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(DOCUMENT_TYPE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Paciente</Label>
              <Select value={patientId} onValueChange={handlePatientChange}>
                <SelectTrigger className="input-styled">
                  <SelectValue placeholder="Selecione um paciente" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título do documento"
                required
                className="input-styled"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="input-styled"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Conteúdo</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Digite o conteúdo do documento..."
              required
              className="input-styled min-h-[200px] font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Use marcadores como [PACIENTE], [DATA], [VALOR], [SERVIÇO] para substituição automática
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="btn-gradient">
              {document ? 'Salvar' : 'Criar Documento'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
