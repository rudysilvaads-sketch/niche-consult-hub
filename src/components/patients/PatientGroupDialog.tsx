import { useState, useEffect } from 'react';
import { Users, Plus, X, UserPlus, Link2, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useApp } from '@/contexts/AppContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  Patient,
  PatientGroup,
  PatientGroupType,
  RelationshipType,
  GROUP_TYPE_LABELS,
  RELATIONSHIP_LABELS,
} from '@/types';

interface PatientGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient;
}

export function PatientGroupDialog({ open, onOpenChange, patient }: PatientGroupDialogProps) {
  const {
    patients,
    patientGroups,
    addPatientGroup,
    updatePatientGroup,
    deletePatientGroup,
    addPatientRelationship,
    deletePatientRelationship,
    getRelatedPatients,
    getPatientGroups,
  } = useApp();

  const [activeTab, setActiveTab] = useState('relationships');
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [isAddingRelationship, setIsAddingRelationship] = useState(false);
  
  // New group form
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupType, setNewGroupType] = useState<PatientGroupType>('familia');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([patient.id]);
  
  // New relationship form
  const [selectedRelatedPatient, setSelectedRelatedPatient] = useState('');
  const [selectedRelationship, setSelectedRelationship] = useState<RelationshipType>('outro');

  // Get current data
  const relatedPatients = getRelatedPatients(patient.id);
  const currentGroups = getPatientGroups(patient.id);
  const availablePatients = patients.filter(
    (p) => p.id !== patient.id && !relatedPatients.some((r) => r.patient?.id === p.id)
  );

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      toast.error('Digite um nome para o grupo');
      return;
    }

    try {
      await addPatientGroup({
        name: newGroupName,
        type: newGroupType,
        memberIds: selectedMembers,
      });
      toast.success('Grupo criado com sucesso!');
      setNewGroupName('');
      setSelectedMembers([patient.id]);
      setIsCreatingGroup(false);
    } catch (error) {
      toast.error('Erro ao criar grupo');
    }
  };

  const handleAddMemberToGroup = async (groupId: string, memberId: string) => {
    const group = patientGroups.find((g) => g.id === groupId);
    if (!group) return;

    try {
      await updatePatientGroup(groupId, {
        memberIds: [...group.memberIds, memberId],
      });
      toast.success('Membro adicionado ao grupo');
    } catch (error) {
      toast.error('Erro ao adicionar membro');
    }
  };

  const handleRemoveMemberFromGroup = async (groupId: string, memberId: string) => {
    const group = patientGroups.find((g) => g.id === groupId);
    if (!group) return;

    try {
      await updatePatientGroup(groupId, {
        memberIds: group.memberIds.filter((id) => id !== memberId),
      });
      toast.success('Membro removido do grupo');
    } catch (error) {
      toast.error('Erro ao remover membro');
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    try {
      await deletePatientGroup(groupId);
      toast.success('Grupo excluído');
    } catch (error) {
      toast.error('Erro ao excluir grupo');
    }
  };

  const handleAddRelationship = async () => {
    if (!selectedRelatedPatient) {
      toast.error('Selecione um paciente');
      return;
    }

    try {
      await addPatientRelationship({
        patientId: patient.id,
        relatedPatientId: selectedRelatedPatient,
        relationship: selectedRelationship,
      });
      toast.success('Vínculo criado com sucesso!');
      setSelectedRelatedPatient('');
      setSelectedRelationship('outro');
      setIsAddingRelationship(false);
    } catch (error) {
      toast.error('Erro ao criar vínculo');
    }
  };

  const handleDeleteRelationship = async (relationshipId: string) => {
    try {
      await deletePatientRelationship(relationshipId);
      toast.success('Vínculo removido');
    } catch (error) {
      toast.error('Erro ao remover vínculo');
    }
  };

  const toggleMember = (memberId: string) => {
    if (memberId === patient.id) return; // Can't remove current patient
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Vínculos Familiares - {patient.name}
          </DialogTitle>
          <DialogDescription>
            Gerencie grupos e vínculos entre pacientes
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="relationships">Vínculos Individuais</TabsTrigger>
            <TabsTrigger value="groups">Grupos</TabsTrigger>
          </TabsList>

          {/* Relationships Tab */}
          <TabsContent value="relationships" className="space-y-4">
            {/* Existing Relationships */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-foreground">Vínculos</h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsAddingRelationship(!isAddingRelationship)}
                  className="gap-1"
                >
                  <UserPlus className="h-4 w-4" />
                  Adicionar Vínculo
                </Button>
              </div>

              {isAddingRelationship && (
                <div className="p-4 rounded-lg bg-muted/50 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Paciente</Label>
                      <Select
                        value={selectedRelatedPatient}
                        onValueChange={setSelectedRelatedPatient}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {availablePatients.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Tipo de Relação</Label>
                      <Select
                        value={selectedRelationship}
                        onValueChange={(v) => setSelectedRelationship(v as RelationshipType)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(RELATIONSHIP_LABELS).map(([key, label]) => (
                            <SelectItem key={key} value={key}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleAddRelationship}>
                      Adicionar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsAddingRelationship(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}

              {relatedPatients.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Link2 className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>Nenhum vínculo registrado</p>
                  <p className="text-sm">Adicione vínculos para conectar pacientes</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {relatedPatients.map(({ relationship, patient: relatedPatient }) => (
                    <div
                      key={relationship.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {relatedPatient?.name.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{relatedPatient?.name}</p>
                          <Badge variant="outline" className="text-xs">
                            {RELATIONSHIP_LABELS[relationship.relationship]}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => handleDeleteRelationship(relationship.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Groups Tab */}
          <TabsContent value="groups" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-foreground">Grupos</h3>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsCreatingGroup(!isCreatingGroup)}
                className="gap-1"
              >
                <Plus className="h-4 w-4" />
                Criar Grupo
              </Button>
            </div>

            {isCreatingGroup && (
              <div className="p-4 rounded-lg bg-muted/50 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Nome do Grupo</Label>
                    <Input
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      placeholder="Ex: Família Silva"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Tipo</Label>
                    <Select
                      value={newGroupType}
                      onValueChange={(v) => setNewGroupType(v as PatientGroupType)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(GROUP_TYPE_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block">Membros</Label>
                  <div className="flex flex-wrap gap-2">
                    {patients.map((p) => {
                      const isSelected = selectedMembers.includes(p.id);
                      const isCurrent = p.id === patient.id;
                      return (
                        <Badge
                          key={p.id}
                          variant={isSelected ? 'default' : 'outline'}
                          className={cn(
                            'cursor-pointer transition-all',
                            isSelected && !isCurrent && 'hover:bg-destructive',
                            isCurrent && 'cursor-not-allowed'
                          )}
                          onClick={() => toggleMember(p.id)}
                        >
                          {p.name}
                          {isSelected && !isCurrent && (
                            <X className="h-3 w-3 ml-1" />
                          )}
                        </Badge>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" onClick={handleCreateGroup}>
                    Criar Grupo
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsCreatingGroup(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}

            {currentGroups.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>Nenhum grupo encontrado</p>
                <p className="text-sm">Crie grupos para organizar famílias e casais</p>
              </div>
            ) : (
              <div className="space-y-4">
                {currentGroups.map((group) => (
                  <div
                    key={group.id}
                    className="p-4 rounded-lg border border-border bg-card"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-foreground">{group.name}</h4>
                        <Badge variant="secondary" className="text-xs">
                          {GROUP_TYPE_LABELS[group.type]}
                        </Badge>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => handleDeleteGroup(group.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {group.memberIds.map((memberId) => {
                        const member = patients.find((p) => p.id === memberId);
                        if (!member) return null;
                        return (
                          <Badge
                            key={memberId}
                            variant={memberId === patient.id ? 'default' : 'outline'}
                            className="gap-1"
                          >
                            {member.name}
                            {memberId !== patient.id && (
                              <X
                                className="h-3 w-3 cursor-pointer hover:text-destructive"
                                onClick={() => handleRemoveMemberFromGroup(group.id, memberId)}
                              />
                            )}
                          </Badge>
                        );
                      })}
                      
                      {/* Add member dropdown */}
                      <Select
                        value=""
                        onValueChange={(v) => handleAddMemberToGroup(group.id, v)}
                      >
                        <SelectTrigger className="w-[140px] h-6 text-xs">
                          <Plus className="h-3 w-3 mr-1" />
                          <span>Adicionar</span>
                        </SelectTrigger>
                        <SelectContent>
                          {patients
                            .filter((p) => !group.memberIds.includes(p.id))
                            .map((p) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
