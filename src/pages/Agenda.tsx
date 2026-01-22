import { useState } from 'react';
import { format, addDays, startOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Header } from '@/components/layout/Header';
import { AppointmentList } from '@/components/dashboard/AppointmentList';
import { AppointmentFormDialog } from '@/components/appointments/AppointmentFormDialog';
import { Button } from '@/components/ui/button';
import { mockAppointments } from '@/data/mockData';
import { Appointment } from '@/types';
import { cn } from '@/lib/utils';

const Agenda = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false);

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const filteredAppointments = mockAppointments.filter(
    (apt) => apt.date === format(selectedDate, 'yyyy-MM-dd')
  );

  const handleSaveAppointment = (appointment: Partial<Appointment>) => {
    console.log('Consulta salva:', appointment);
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const days = direction === 'next' ? 7 : -7;
    setSelectedDate(addDays(selectedDate, days));
  };

  return (
    <MainLayout>
      <Header 
        title="Agenda" 
        subtitle="Gerencie suas consultas e horários"
        onNewAppointment={() => setAppointmentDialogOpen(true)}
      />

      {/* Week Navigation */}
      <div className="card-elevated p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="icon" onClick={() => navigateWeek('prev')}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          <h2 className="font-display text-lg font-semibold text-foreground">
            {format(weekStart, "MMMM 'de' yyyy", { locale: ptBR })}
          </h2>
          
          <Button variant="ghost" size="icon" onClick={() => navigateWeek('next')}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Week Days */}
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => {
            const isSelected = format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
            const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
            const dayAppointments = mockAppointments.filter(
              (apt) => apt.date === format(day, 'yyyy-MM-dd')
            );

            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className={cn(
                  'flex flex-col items-center p-3 rounded-xl transition-all duration-200',
                  isSelected
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-secondary/50',
                  isToday && !isSelected && 'ring-2 ring-primary/30'
                )}
              >
                <span className={cn(
                  'text-xs font-medium uppercase',
                  isSelected ? 'text-primary-foreground/70' : 'text-muted-foreground'
                )}>
                  {format(day, 'EEE', { locale: ptBR })}
                </span>
                <span className={cn(
                  'text-xl font-bold mt-1',
                  isSelected ? 'text-primary-foreground' : 'text-foreground'
                )}>
                  {format(day, 'd')}
                </span>
                {dayAppointments.length > 0 && (
                  <span className={cn(
                    'text-xs mt-1 px-2 py-0.5 rounded-full',
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

      {/* Appointments for Selected Day */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AppointmentList
            appointments={filteredAppointments}
            title={`Consultas - ${format(selectedDate, "d 'de' MMMM", { locale: ptBR })}`}
          />
        </div>

        {/* Day Summary */}
        <div className="card-elevated p-6">
          <h3 className="font-display text-lg font-semibold text-foreground mb-4">
            Resumo do Dia
          </h3>
          
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-primary/10">
              <p className="text-2xl font-bold text-primary">{filteredAppointments.length}</p>
              <p className="text-sm text-muted-foreground">Consultas agendadas</p>
            </div>
            
            <div className="p-4 rounded-xl bg-success/10">
              <p className="text-2xl font-bold text-success">
                {filteredAppointments.filter(a => a.status === 'confirmado').length}
              </p>
              <p className="text-sm text-muted-foreground">Confirmadas</p>
            </div>
            
            <div className="p-4 rounded-xl bg-warning/10">
              <p className="text-2xl font-bold text-warning">
                {filteredAppointments.filter(a => a.status === 'agendado').length}
              </p>
              <p className="text-sm text-muted-foreground">Aguardando confirmação</p>
            </div>
          </div>

          <Button 
            className="w-full mt-6 btn-gradient"
            onClick={() => setAppointmentDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Consulta
          </Button>
        </div>
      </div>

      <AppointmentFormDialog
        open={appointmentDialogOpen}
        onOpenChange={setAppointmentDialogOpen}
        onSave={handleSaveAppointment}
      />
    </MainLayout>
  );
};

export default Agenda;
