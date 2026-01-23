import { useState } from 'react';
import { format, addDays, startOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, Link2, Video } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Header } from '@/components/layout/Header';
import { AppointmentList } from '@/components/dashboard/AppointmentList';
import { AppointmentFormDialog } from '@/components/appointments/AppointmentFormDialog';
import { RegistrationLinkManager } from '@/components/telehealth/RegistrationLinkManager';
import { StartSessionDialog } from '@/components/telehealth/StartSessionDialog';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { Appointment } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const Agenda = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [linkManagerOpen, setLinkManagerOpen] = useState(false);
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
  const [sessionAppointment, setSessionAppointment] = useState<Appointment | null>(null);

  const { patients, appointments, addAppointment, updateAppointment, deleteAppointment } = useApp();

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const filteredAppointments = appointments.filter(
    (apt) => apt.date === format(selectedDate, 'yyyy-MM-dd')
  );

  const handleSaveAppointment = (appointment: Partial<Appointment>) => {
    if (selectedAppointment) {
      updateAppointment(selectedAppointment.id, appointment);
      toast.success('Consulta atualizada com sucesso!');
    } else {
      addAppointment(appointment);
      toast.success('Consulta agendada com sucesso!');
    }
    setSelectedAppointment(null);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setAppointmentDialogOpen(true);
  };

  const handleUpdateStatus = (id: string, status: Appointment['status']) => {
    updateAppointment(id, { status });
    toast.success('Status atualizado!');
  };

  const handleDeleteAppointment = (id: string) => {
    deleteAppointment(id);
    toast.success('Consulta cancelada!');
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const days = direction === 'next' ? 7 : -7;
    setSelectedDate(addDays(selectedDate, days));
  };

  const handleNewAppointment = () => {
    setSelectedAppointment(null);
    setAppointmentDialogOpen(true);
  };

  const handleStartSession = (appointment: Appointment) => {
    setSessionAppointment(appointment);
    setSessionDialogOpen(true);
  };

  return (
    <MainLayout>
      {/* Header with responsive layout */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <Header 
          title="Agenda" 
          subtitle="Gerencie suas consultas"
          onNewAppointment={handleNewAppointment}
        />
        <Button 
          variant="outline" 
          onClick={() => setLinkManagerOpen(true)} 
          className="gap-2 w-full sm:w-auto"
        >
          <Link2 className="h-4 w-4" />
          <span className="sm:inline">Links de Cadastro</span>
        </Button>
      </div>

      {/* Week Navigation - Mobile optimized */}
      <div className="card-elevated p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <Button variant="ghost" size="icon" onClick={() => navigateWeek('prev')} className="h-9 w-9">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          <h2 className="font-display text-base sm:text-lg font-semibold text-foreground text-center">
            {format(weekStart, "MMMM 'de' yyyy", { locale: ptBR })}
          </h2>
          
          <Button variant="ghost" size="icon" onClick={() => navigateWeek('next')} className="h-9 w-9">
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Week Days - Scrollable on mobile */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {weekDays.map((day) => {
            const isSelected = format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
            const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
            const dayAppointments = appointments.filter(
              (apt) => apt.date === format(day, 'yyyy-MM-dd')
            );

            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className={cn(
                  'flex flex-col items-center p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all duration-200',
                  isSelected
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-secondary/50',
                  isToday && !isSelected && 'ring-2 ring-primary/30'
                )}
              >
                <span className={cn(
                  'text-[10px] sm:text-xs font-medium uppercase',
                  isSelected ? 'text-primary-foreground/70' : 'text-muted-foreground'
                )}>
                  {format(day, 'EEE', { locale: ptBR }).slice(0, 3)}
                </span>
                <span className={cn(
                  'text-lg sm:text-xl font-bold mt-0.5 sm:mt-1',
                  isSelected ? 'text-primary-foreground' : 'text-foreground'
                )}>
                  {format(day, 'd')}
                </span>
                {dayAppointments.length > 0 && (
                  <span className={cn(
                    'text-[10px] sm:text-xs mt-0.5 sm:mt-1 px-1.5 sm:px-2 py-0.5 rounded-full',
                    isSelected 
                      ? 'bg-primary-foreground/20 text-primary-foreground' 
                      : 'bg-primary/10 text-primary'
                  )}>
                    {dayAppointments.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Appointments for Selected Day - Stack on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Day Summary - Show first on mobile */}
        <div className="order-first lg:order-last card-elevated p-4 sm:p-6">
          <h3 className="font-display text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">
            Resumo do Dia
          </h3>
          
          <div className="grid grid-cols-3 lg:grid-cols-1 gap-2 sm:gap-4">
            <div className="p-3 sm:p-4 rounded-xl bg-primary/10 text-center lg:text-left">
              <p className="text-xl sm:text-2xl font-bold text-primary">{filteredAppointments.length}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Agendadas</p>
            </div>
            
            <div className="p-3 sm:p-4 rounded-xl bg-success/10 text-center lg:text-left">
              <p className="text-xl sm:text-2xl font-bold text-success">
                {filteredAppointments.filter(a => a.status === 'confirmado').length}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">Confirmadas</p>
            </div>
            
            <div className="p-3 sm:p-4 rounded-xl bg-warning/10 text-center lg:text-left">
              <p className="text-xl sm:text-2xl font-bold text-warning">
                {filteredAppointments.filter(a => a.status === 'agendado').length}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">Aguardando</p>
            </div>
          </div>

          <Button 
            className="w-full mt-4 sm:mt-6 btn-gradient"
            onClick={handleNewAppointment}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Consulta
          </Button>
        </div>

        {/* Appointments List */}
        <div className="lg:col-span-2">
          <AppointmentList
            appointments={filteredAppointments}
            title={`Consultas - ${format(selectedDate, "d 'de' MMMM", { locale: ptBR })}`}
            onEdit={handleEditAppointment}
            onUpdateStatus={handleUpdateStatus}
            onDelete={handleDeleteAppointment}
            onStartSession={handleStartSession}
          />
        </div>
      </div>

      <AppointmentFormDialog
        open={appointmentDialogOpen}
        onOpenChange={(open) => {
          setAppointmentDialogOpen(open);
          if (!open) setSelectedAppointment(null);
        }}
        appointment={selectedAppointment}
        onSave={handleSaveAppointment}
        patients={patients}
        defaultDate={format(selectedDate, 'yyyy-MM-dd')}
      />

      <RegistrationLinkManager
        open={linkManagerOpen}
        onOpenChange={setLinkManagerOpen}
      />

      <StartSessionDialog
        open={sessionDialogOpen}
        onOpenChange={setSessionDialogOpen}
        appointment={sessionAppointment}
      />
    </MainLayout>
  );
};

export default Agenda;
