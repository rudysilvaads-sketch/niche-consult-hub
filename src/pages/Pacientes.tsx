import { useState } from 'react';
import { Search, Plus, Filter } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Header } from '@/components/layout/Header';
import { PatientTable } from '@/components/patients/PatientTable';
import { PatientFormDialog } from '@/components/patients/PatientFormDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mockPatients } from '@/data/mockData';
import { Patient } from '@/types';

const Pacientes = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [patientDialogOpen, setPatientDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const filteredPatients = mockPatients.filter((patient) =>
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

  const handleSavePatient = (patient: Partial<Patient>) => {
    console.log('Paciente salvo:', patient);
  };

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
          <p className="text-2xl font-bold text-foreground mt-1">{mockPatients.length}</p>
        </div>
        <div className="card-elevated p-4">
          <p className="text-sm text-muted-foreground">Novos este mês</p>
          <p className="text-2xl font-bold text-success mt-1">+3</p>
        </div>
        <div className="card-elevated p-4">
          <p className="text-sm text-muted-foreground">Ativos</p>
          <p className="text-2xl font-bold text-primary mt-1">{mockPatients.length}</p>
        </div>
      </div>

      {/* Patient Table */}
      <PatientTable
        patients={filteredPatients}
        onEdit={handleEditPatient}
        onView={(patient) => console.log('Ver paciente:', patient)}
        onDelete={(patient) => console.log('Excluir paciente:', patient)}
      />

      {/* Patient Dialog */}
      <PatientFormDialog
        open={patientDialogOpen}
        onOpenChange={setPatientDialogOpen}
        patient={selectedPatient}
        onSave={handleSavePatient}
      />
    </MainLayout>
  );
};

export default Pacientes;
