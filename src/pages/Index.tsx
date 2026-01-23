import { useState } from 'react';
import { Users, Calendar, CheckCircle, Clock, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
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
    (apt) => apt.date === new Date().toISOString().split('T')[0] && apt.status !== 'concluido' && apt.status !== 'cancelado'
  ).slice(0, 4);

  const handleSaveAppointment = (appointment: Partial<Appointment>) => {
    addAppointment(appointment);
    toast.success('Consulta agendada com sucesso!');
  };

  const handleUpdateStatus = (id: string, status: Appointment['status']) => {
    updateAppointment(id, { status });
    toast.success('Status atualizado!');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value);
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

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card-elevated p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-success" />
            </div>
            <span className="badge-status bg-success/10 text-success">Este mês</span>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Receitas</p>
          <p className="text-2xl font-bold text-success">{formatCurrency(stats.monthRevenue)}</p>
        </div>

        <div className="card-elevated p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <span className="badge-status bg-primary/10 text-primary">Lucro</span>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Saldo do Mês</p>
          <p className="text-2xl font-bold text-primary">{formatCurrency(stats.monthRevenue - stats.monthExpenses)}</p>
        </div>

        <div className="card-elevated p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-full bg-warning/10 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-warning" />
            </div>
            <span className="badge-status bg-warning/10 text-warning">Pendente</span>
          </div>
          <p className="text-sm text-muted-foreground mb-1">A Receber</p>
          <p className="text-2xl font-bold text-warning">{formatCurrency(stats.pendingPayments)}</p>
        </div>
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
