import { useState } from 'react';
import { Patient, RELATIONSHIP_LABELS, GROUP_TYPE_LABELS } from '@/types';
import { User, Mail, Phone, Calendar, MapPin, FileText, Users, Link2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/AppContext';
import { PatientGroupDialog } from './PatientGroupDialog';

interface PatientViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient | null;
}

export function PatientViewDialog({ open, onOpenChange, patient }: PatientViewDialogProps) {
  const { getRelatedPatients, getPatientGroups, patients } = useApp();
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);

  if (!patient) return null;

  const relatedPatients = getRelatedPatients(patient.id);
  const groups = getPatientGroups(patient.id);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
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
                    {patient.birthDate ? new Date(patient.birthDate).toLocaleDateString('pt-BR') : 'Não informado'}
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

            {/* Family/Group Section */}
            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Vínculos Familiares
                </h4>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setGroupDialogOpen(true)}
                  className="gap-1"
                >
                  <Link2 className="h-4 w-4" />
                  Gerenciar
                </Button>
              </div>

              {/* Related Patients */}
              {relatedPatients.length > 0 && (
                <div className="space-y-2 mb-4">
                  <p className="text-xs text-muted-foreground">Vínculos individuais:</p>
                  <div className="flex flex-wrap gap-2">
                    {relatedPatients.map(({ relationship, patient: relatedPatient }) => (
                      <Badge key={relationship.id} variant="secondary" className="gap-1">
                        {relatedPatient?.name}
                        <span className="text-muted-foreground">
                          ({RELATIONSHIP_LABELS[relationship.relationship]})
                        </span>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Groups */}
              {groups.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Grupos:</p>
                  {groups.map((group) => (
                    <div key={group.id} className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-foreground">{group.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {GROUP_TYPE_LABELS[group.type]}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {group.memberIds.map((memberId) => {
                          const member = patients.find((p) => p.id === memberId);
                          if (!member) return null;
                          return (
                            <Badge
                              key={memberId}
                              variant={memberId === patient.id ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {member.name}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {relatedPatients.length === 0 && groups.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum vínculo registrado. Clique em "Gerenciar" para adicionar.
                </p>
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

      <PatientGroupDialog
        open={groupDialogOpen}
        onOpenChange={setGroupDialogOpen}
        patient={patient}
      />
    </>
  );
}
