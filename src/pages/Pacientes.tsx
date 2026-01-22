import { useState } from 'react';
import { Search, Plus, Filter } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Header } from '@/components/layout/Header';
import { PatientTable } from '@/components/patients/PatientTable';
import { PatientFormDialog } from '@/components/patients/PatientFormDialog';
import { PatientViewDialog } from '@/components/patients/PatientViewDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useApp } from '@/contexts/AppContext';
import { Patient } from '@/types';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const Pacientes = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [patientDialogOpen, setPatientDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const { patients, addPatient, updatePatient, deletePatient } = useApp();

  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.cpf.includes(searchTerm)
  );

  const handleNewPatient = () => {
    setSelectedPatient(null);
    setPatientDialogOpen(true);
  };

  const handleEditPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setPatientDialogOpen(true);
  };

  const handleViewPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setViewDialogOpen(true);
  };

  const handleDeleteClick = (patient: Patient) => {
    setSelectedPatient(patient);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedPatient) {
      deletePatient(selectedPatient.id);
      toast.success('Paciente excluído com sucesso!');
      setDeleteDialogOpen(false);
      setSelectedPatient(null);
    }
  };

  const handleSavePatient = (patient: Partial<Patient>) => {
    if (selectedPatient) {
      updatePatient(selectedPatient.id, patient);
      toast.success('Paciente atualizado com sucesso!');
    } else {
      addPatient(patient);
      toast.success('Paciente cadastrado com sucesso!');
    }
  };

  const newThisMonth = patients.filter((p) => {
    const created = new Date(p.createdAt);
    const now = new Date();
    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
  }).length;

  return (
    <MainLayout>
      <Header 
        title="Pacientes" 
        subtitle="Gerencie sua base de pacientes"
      />

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email ou CPF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 input-styled"
          />
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filtros
          </Button>
          <Button onClick={handleNewPatient} className="btn-gradient gap-2">
            <Plus className="h-4 w-4" />
            Novo Paciente
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card-elevated p-4">
          <p className="text-sm text-muted-foreground">Total de Pacientes</p>
          <p className="text-2xl font-bold text-foreground mt-1">{patients.length}</p>
        </div>
        <div className="card-elevated p-4">
          <p className="text-sm text-muted-foreground">Novos este mês</p>
          <p className="text-2xl font-bold text-success mt-1">+{newThisMonth}</p>
        </div>
        <div className="card-elevated p-4">
          <p className="text-sm text-muted-foreground">Ativos</p>
          <p className="text-2xl font-bold text-primary mt-1">{patients.length}</p>
        </div>
      </div>

      {/* Patient Table */}
      <PatientTable
        patients={filteredPatients}
        onEdit={handleEditPatient}
        onView={handleViewPatient}
        onDelete={handleDeleteClick}
      />

      {/* Patient Dialog */}
      <PatientFormDialog
        open={patientDialogOpen}
        onOpenChange={setPatientDialogOpen}
        patient={selectedPatient}
        onSave={handleSavePatient}
      />

      {/* View Dialog */}
      <PatientViewDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        patient={selectedPatient}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o paciente "{selectedPatient?.name}"? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
};

export default Pacientes;
