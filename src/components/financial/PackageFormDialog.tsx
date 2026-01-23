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
import { Switch } from '@/components/ui/switch';
import { ServicePackage } from '@/types';

interface PackageFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (pkg: Partial<ServicePackage>) => void;
  pkg: ServicePackage | null;
}

export function PackageFormDialog({
  open,
  onOpenChange,
  onSave,
  pkg,
}: PackageFormDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sessions, setSessions] = useState('');
  const [value, setValue] = useState('');
  const [validity, setValidity] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (pkg) {
      setName(pkg.name);
      setDescription(pkg.description || '');
      setSessions(pkg.sessions.toString());
      setValue(pkg.value.toString());
      setValidity(pkg.validity.toString());
      setIsActive(pkg.isActive);
    } else {
      setName('');
      setDescription('');
      setSessions('');
      setValue('');
      setValidity('30');
      setIsActive(true);
    }
  }, [pkg, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      description: description || undefined,
      sessions: parseInt(sessions),
      value: parseFloat(value),
      validity: parseInt(validity),
      isActive,
    });
    onOpenChange(false);
  };

  const valuePerSession = sessions && value 
    ? (parseFloat(value) / parseInt(sessions)).toFixed(2) 
    : '0.00';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {pkg ? 'Editar Pacote' : 'Novo Pacote'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Pacote</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Pacote Mensal - 4 Sessões"
              required
              className="input-styled"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva os benefícios do pacote"
              className="input-styled min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sessions">Número de Sessões</Label>
              <Input
                id="sessions"
                type="number"
                min="1"
                value={sessions}
                onChange={(e) => setSessions(e.target.value)}
                placeholder="4"
                required
                className="input-styled"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="value">Valor Total (R$)</Label>
              <Input
                id="value"
                type="number"
                step="0.01"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="720,00"
                required
                className="input-styled"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="validity">Validade (dias)</Label>
              <Input
                id="validity"
                type="number"
                min="1"
                value={validity}
                onChange={(e) => setValidity(e.target.value)}
                placeholder="30"
                required
                className="input-styled"
              />
            </div>
            <div className="space-y-2">
              <Label>Valor por Sessão</Label>
              <div className="h-10 px-3 rounded-lg bg-muted flex items-center">
                <span className="text-foreground font-medium">
                  R$ {valuePerSession}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <Label>Pacote Ativo</Label>
              <p className="text-sm text-muted-foreground">
                Pacotes inativos não aparecem para seleção
              </p>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="btn-gradient">
              {pkg ? 'Salvar' : 'Criar Pacote'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
