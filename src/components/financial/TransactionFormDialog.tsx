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
import { Transaction, Patient, PAYMENT_METHOD_LABELS, TRANSACTION_CATEGORY_LABELS, TransactionCategory, PaymentMethod, PaymentStatus } from '@/types';

interface TransactionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (transaction: Partial<Transaction>) => void;
  transaction: Transaction | null;
  type: 'receita' | 'despesa';
  patients: Patient[];
}

const receitaCategories: TransactionCategory[] = ['consulta', 'pacote', 'produto', 'outros_receita'];
const despesaCategories: TransactionCategory[] = ['aluguel', 'salario', 'material', 'marketing', 'software', 'outros_despesa'];

export function TransactionFormDialog({
  open,
  onOpenChange,
  onSave,
  transaction,
  type,
  patients,
}: TransactionFormDialogProps) {
  const [description, setDescription] = useState('');
  const [value, setValue] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<TransactionCategory>(type === 'receita' ? 'consulta' : 'aluguel');
  const [patientId, setPatientId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>('');
  const [status, setStatus] = useState<PaymentStatus>('pendente');

  useEffect(() => {
    if (transaction) {
      setDescription(transaction.description);
      setValue(transaction.value.toString());
      setDate(transaction.date);
      setCategory(transaction.category);
      setPatientId(transaction.patientId || '');
      setPaymentMethod(transaction.paymentMethod || '');
      setStatus(transaction.status);
    } else {
      setDescription('');
      setValue('');
      setDate(new Date().toISOString().split('T')[0]);
      setCategory(type === 'receita' ? 'consulta' : 'aluguel');
      setPatientId('');
      setPaymentMethod('');
      setStatus('pendente');
    }
  }, [transaction, type, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find(p => p.id === patientId);
    onSave({
      type,
      description,
      value: parseFloat(value),
      date,
      category,
      patientId: patientId || undefined,
      patientName: patient?.name,
      paymentMethod: paymentMethod || undefined,
      status,
    });
    onOpenChange(false);
  };

  const categories = type === 'receita' ? receitaCategories : despesaCategories;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {transaction ? 'Editar' : 'Nova'} {type === 'receita' ? 'Receita' : 'Despesa'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Consulta de rotina"
              required
              className="input-styled"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="value">Valor (R$)</Label>
              <Input
                id="value"
                type="number"
                step="0.01"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="0,00"
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as TransactionCategory)}>
                <SelectTrigger className="input-styled">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {TRANSACTION_CATEGORY_LABELS[cat]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as PaymentStatus)}>
                <SelectTrigger className="input-styled">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="pago">Pago</SelectItem>
                  <SelectItem value="parcial">Parcial</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {type === 'receita' && (
            <div className="space-y-2">
              <Label>Paciente (opcional)</Label>
              <Select value={patientId} onValueChange={setPatientId}>
                <SelectTrigger className="input-styled">
                  <SelectValue placeholder="Selecione um paciente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhum</SelectItem>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Forma de Pagamento</Label>
            <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
              <SelectTrigger className="input-styled">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Não informado</SelectItem>
                {Object.entries(PAYMENT_METHOD_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="btn-gradient">
              {transaction ? 'Salvar' : 'Registrar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
