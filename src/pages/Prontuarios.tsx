import { useState } from 'react';
import { Search, Plus, Filter } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Header } from '@/components/layout/Header';
import { RecordCard } from '@/components/records/RecordCard';
import { RecordFormDialog } from '@/components/records/RecordFormDialog';
import { RecordViewDialog } from '@/components/records/RecordViewDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useApp } from '@/contexts/AppContext';
import { ConsultationRecord } from '@/types';
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

const Prontuarios = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [recordDialogOpen, setRecordDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ConsultationRecord | null>(null);

  const { patients, records, addRecord, updateRecord, deleteRecord } = useApp();

  const filteredRecords = records.filter((record) =>
    record.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNewRecord = () => {
    setSelectedRecord(null);
    setRecordDialogOpen(true);
  };

  const handleEditRecord = (record: ConsultationRecord) => {
    setSelectedRecord(record);
    setRecordDialogOpen(true);
  };

  const handleViewRecord = (record: ConsultationRecord) => {
    setSelectedRecord(record);
    setViewDialogOpen(true);
  };

  const handleDeleteClick = (record: ConsultationRecord) => {
    setSelectedRecord(record);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedRecord) {
      deleteRecord(selectedRecord.id);
      toast.success('Prontuário excluído com sucesso!');
      setDeleteDialogOpen(false);
      setSelectedRecord(null);
    }
  };

  const handleSaveRecord = (record: Partial<ConsultationRecord>) => {
    if (selectedRecord) {
      updateRecord(selectedRecord.id, record);
      toast.success('Prontuário atualizado com sucesso!');
    } else {
      addRecord(record);
      toast.success('Prontuário registrado com sucesso!');
    }
  };

  const uniquePatients = new Set(records.map(r => r.patientId)).size;

  return (
    <MainLayout>
      <Header 
        title="Prontuários" 
        subtitle="Registros de atendimentos e histórico clínico"
      />

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por paciente ou diagnóstico..."
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
          <Button onClick={handleNewRecord} className="btn-gradient gap-2">
            <Plus className="h-4 w-4" />
            Novo Prontuário
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card-elevated p-4">
          <p className="text-sm text-muted-foreground">Total de Registros</p>
          <p className="text-2xl font-bold text-foreground mt-1">{records.length}</p>
        </div>
        <div className="card-elevated p-4">
          <p className="text-sm text-muted-foreground">Este mês</p>
          <p className="text-2xl font-bold text-success mt-1">+{records.length}</p>
        </div>
        <div className="card-elevated p-4">
          <p className="text-sm text-muted-foreground">Pacientes atendidos</p>
          <p className="text-2xl font-bold text-primary mt-1">{uniquePatients}</p>
        </div>
      </div>

      {/* Records Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredRecords.length === 0 ? (
          <div className="col-span-full card-elevated p-12 text-center">
            <p className="text-muted-foreground">Nenhum prontuário encontrado</p>
            <Button onClick={handleNewRecord} className="btn-gradient mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Prontuário
            </Button>
          </div>
        ) : (
          filteredRecords.map((record) => (
            <RecordCard
              key={record.id}
              record={record}
              onEdit={handleEditRecord}
              onView={handleViewRecord}
              onDelete={handleDeleteClick}
            />
          ))
        )}
      </div>

      {/* Record Dialog */}
      <RecordFormDialog
        open={recordDialogOpen}
        onOpenChange={(open) => {
          setRecordDialogOpen(open);
          if (!open) setSelectedRecord(null);
        }}
        record={selectedRecord}
        onSave={handleSaveRecord}
        patients={patients}
      />

      {/* View Dialog */}
      <RecordViewDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        record={selectedRecord}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este prontuário de "{selectedRecord?.patientName}"? 
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

export default Prontuarios;
