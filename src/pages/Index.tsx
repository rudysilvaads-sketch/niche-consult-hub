import { useState } from 'react';
import { Users, Calendar, CheckCircle, Clock } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Header } from '@/components/layout/Header';
import { StatCard } from '@/components/dashboard/StatCard';
import { AppointmentList } from '@/components/dashboard/AppointmentList';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentPatients } from '@/components/dashboard/RecentPatients';
import { AppointmentFormDialog } from '@/components/appointments/AppointmentFormDialog';
import { mockAppointments, mockPatients, mockStats } from '@/data/mockData';
import { Appointment } from '@/types';

const Index = () => {
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false);

  const todayAppointments = mockAppointments.filter(
    (apt) => apt.status !== 'concluido' && apt.status !== 'cancelado'
  ).slice(0, 4);

  const handleSaveAppointment = (appointment: Partial<Appointment>) => {
    console.log('Nova consulta:', appointment);
    // Here you would save to backend
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
          value={mockStats.totalPatients}
          change="+3 este mês"
          changeType="positive"
          icon={Users}
        />
        <StatCard
          title="Consultas Hoje"
          value={mockStats.todayAppointments}
          icon={Calendar}
          iconColor="text-accent"
        />
        <StatCard
          title="Concluídas (Mês)"
          value={mockStats.completedThisMonth}
          change="+12% vs último mês"
          changeType="positive"
          icon={CheckCircle}
          iconColor="text-success"
        />
        <StatCard
          title="Próxima Semana"
          value={mockStats.weekAppointments}
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
          />
        </div>

        {/* Sidebar Content */}
        <div className="space-y-6">
          <QuickActions />
          <RecentPatients patients={mockPatients} />
        </div>
      </div>

      {/* Dialogs */}
      <AppointmentFormDialog
        open={appointmentDialogOpen}
        onOpenChange={setAppointmentDialogOpen}
        onSave={handleSaveAppointment}
      />
    </MainLayout>
  );
};

export default Index;
