import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link2, Copy, Trash2, Plus, Clock, Users, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useRegistrationLinks } from '@/hooks/useRegistrationLinks';
import { useAuth } from '@/contexts/AuthContext';

interface RegistrationLinkManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RegistrationLinkManager({ open, onOpenChange }: RegistrationLinkManagerProps) {
  const { user } = useAuth();
  const { links, loading, createLink, deactivateLink, deleteLink } = useRegistrationLinks(user?.uid || '');
  
  const [isCreating, setIsCreating] = useState(false);
  const [expirationHours, setExpirationHours] = useState('48');
  const [maxUses, setMaxUses] = useState('1');

  const handleCreateLink = async () => {
    setIsCreating(true);
    try {
      await createLink(parseInt(expirationHours), parseInt(maxUses));
      toast.success('Link de cadastro criado com sucesso!');
    } catch (error) {
      toast.error('Erro ao criar link');
    } finally {
      setIsCreating(false);
    }
  };

  const copyLink = (token: string) => {
    const url = `${window.location.origin}/cadastro/${token}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copiado para a área de transferência!');
  };

  const handleDelete = async (linkId: string) => {
    try {
      await deleteLink(linkId);
      toast.success('Link excluído');
    } catch (error) {
      toast.error('Erro ao excluir link');
    }
  };

  const isExpired = (expiresAt: string) => new Date(expiresAt) < new Date();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-primary" />
            Links de Cadastro
          </DialogTitle>
          <DialogDescription>
            Gere links temporários para que novos pacientes possam se cadastrar
          </DialogDescription>
        </DialogHeader>

        {/* Create New Link */}
        <div className="card-elevated p-4 space-y-4">
          <h4 className="font-medium">Gerar Novo Link</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Validade</Label>
              <Select value={expirationHours} onValueChange={setExpirationHours}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 hora</SelectItem>
                  <SelectItem value="24">24 horas</SelectItem>
                  <SelectItem value="48">48 horas</SelectItem>
                  <SelectItem value="168">7 dias</SelectItem>
                  <SelectItem value="720">30 dias</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Máximo de usos</Label>
              <Select value={maxUses} onValueChange={setMaxUses}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 uso</SelectItem>
                  <SelectItem value="5">5 usos</SelectItem>
                  <SelectItem value="10">10 usos</SelectItem>
                  <SelectItem value="50">50 usos</SelectItem>
                  <SelectItem value="999">Ilimitado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleCreateLink} disabled={isCreating} className="w-full btn-gradient">
            <Plus className="h-4 w-4 mr-2" />
            Gerar Link
          </Button>
        </div>

        {/* Links List */}
        <div className="space-y-3">
          <h4 className="font-medium">Links Ativos</h4>
          
          {loading ? (
            <p className="text-muted-foreground text-center py-4">Carregando...</p>
          ) : links.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Nenhum link criado ainda
            </p>
          ) : (
            links.map((link) => {
              const expired = isExpired(link.expiresAt);
              const exhausted = link.usedCount >= link.maxUses;
              const inactive = !link.isActive || expired || exhausted;

              return (
                <div
                  key={link.id}
                  className={`card-elevated p-4 ${inactive ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <code className="text-xs bg-muted px-2 py-1 rounded truncate max-w-[200px]">
                          .../{link.token.slice(-8)}
                        </code>
                        {inactive ? (
                          <Badge variant="secondary">Inativo</Badge>
                        ) : (
                          <Badge variant="default" className="bg-success">Ativo</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {expired 
                            ? 'Expirado' 
                            : `Expira ${format(new Date(link.expiresAt), "dd/MM 'às' HH:mm", { locale: ptBR })}`
                          }
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {link.usedCount}/{link.maxUses === 999 ? '∞' : link.maxUses} usos
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!inactive && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyLink(link.token)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(link.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
