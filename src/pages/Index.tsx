import { useState } from 'react';
import { Users, Calendar, CheckCircle, Clock } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Header } from '@/components/layout/Header';
import { StatCard } from '@/components/dashboard/StatCard';
import { AppointmentList } from '@/components/dashboard/AppointmentList';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentPatients } from '@/components/dashboard/RecentPatients';
import { AppointmentFormDialog } from '@/components/appointments/AppointmentFormDialog';
import { useApp } from '@/contexts/AppContext';
import { Appointment } from '@/types';
import { toast } from 'sonner';

const Index = () => {
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false);
  const { patients, appointments, stats, addAppointment, updateAppointment } = useApp();

  const todayAppointments = appointments.filter(
    (apt) => apt.status !== 'concluido' && apt.status !== 'cancelado'
  ).slice(0, 4);

  const handleSaveAppointment = (appointment: Partial<Appointment>) => {
    addAppointment(appointment);
    toast.success('Consulta agendada com sucesso!');
  };

  const handleUpdateStatus = (id: string, status: Appointment['status']) => {
    updateAppointment(id, { status });
    toast.success('Status atualizado!');
  };

  return (
    <MainLayout>
      <Header 
        title="Dashboard" 
        subtitle="Bem-vindo de volta! Aqui está o resumo do seu dia."
        onNewAppointment={() => setAppointmentDialogOpen(true)}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total de Pacientes"
          value={stats.totalPatients}
          change={`+${Math.max(0, stats.totalPatients - 2)} este mês`}
          changeType="positive"
          icon={Users}
        />
        <StatCard
          title="Consultas Hoje"
          value={stats.todayAppointments}
          icon={Calendar}
          iconColor="text-accent"
        />
        <StatCard
          title="Concluídas (Mês)"
          value={stats.completedThisMonth}
          change="+12% vs último mês"
          changeType="positive"
          icon={CheckCircle}
          iconColor="text-success"
        />
        <StatCard
          title="Próxima Semana"
          value={stats.weekAppointments}
          icon={Clock}
          iconColor="text-warning"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Appointments - Takes 2 columns */}
        <div className="lg:col-span-2">
          <AppointmentList 
            appointments={todayAppointments} 
            title="Consultas de Hoje"
            onUpdateStatus={handleUpdateStatus}
          />
        </div>

        {/* Sidebar Content */}
        <div className="space-y-6">
          <QuickActions onNewAppointment={() => setAppointmentDialogOpen(true)} />
          <RecentPatients patients={patients} />
        </div>
      </div>

      {/* Dialogs */}
      <AppointmentFormDialog
        open={appointmentDialogOpen}
        onOpenChange={setAppointmentDialogOpen}
        onSave={handleSaveAppointment}
        patients={patients}
      />
    </MainLayout>
  );
};

export default Index;
