import { useState } from 'react';
import { ConsultationRecord } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { mockPatients } from '@/data/mockData';

interface RecordFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record?: ConsultationRecord | null;
  onSave: (record: Partial<ConsultationRecord>) => void;
}

export function RecordFormDialog({ open, onOpenChange, record, onSave }: RecordFormDialogProps) {
  const [formData, setFormData] = useState<Partial<ConsultationRecord>>(
    record || {
      patientId: '',
      patientName: '',
      date: new Date().toISOString().split('T')[0],
      diagnosis: '',
      treatment: '',
      observations: '',
      prescriptions: '',
    }
  );

  const handlePatientChange = (patientId: string) => {
    const patient = mockPatients.find(p => p.id === patientId);
    setFormData({
      ...formData,
      patientId,
      patientName: patient?.name || '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">
            {record ? 'Editar Prontuário' : 'Novo Prontuário'}
          </DialogTitle>
          <DialogDescription>
            {record ? 'Atualize o registro de atendimento.' : 'Registre os dados do atendimento.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="patient">Paciente</Label>
              <Select
                value={formData.patientId}
                onValueChange={handlePatientChange}
              >
                <SelectTrigger className="input-styled mt-1">
                  <SelectValue placeholder="Selecione um paciente" />
                </SelectTrigger>
                <SelectContent>
                  {mockPatients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="date">Data do Atendimento</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="input-styled mt-1"
                required
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="diagnosis">Diagnóstico / Avaliação</Label>
              <Textarea
                id="diagnosis"
                value={formData.diagnosis}
                onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                className="input-styled mt-1"
                rows={3}
                placeholder="Descreva o diagnóstico ou avaliação realizada..."
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="treatment">Tratamento / Conduta</Label>
              <Textarea
                id="treatment"
                value={formData.treatment}
                onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                className="input-styled mt-1"
                rows={3}
                placeholder="Descreva o tratamento ou conduta indicada..."
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="prescriptions">Prescrições</Label>
              <Textarea
                id="prescriptions"
                value={formData.prescriptions}
                onChange={(e) => setFormData({ ...formData, prescriptions: e.target.value })}
                className="input-styled mt-1"
                rows={2}
                placeholder="Medicamentos, exercícios ou outras prescrições..."
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="observations">Observações Adicionais</Label>
              <Textarea
                id="observations"
                value={formData.observations}
                onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                className="input-styled mt-1"
                rows={3}
                placeholder="Outras observações relevantes sobre o atendimento..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="btn-gradient">
              {record ? 'Salvar Alterações' : 'Registrar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
