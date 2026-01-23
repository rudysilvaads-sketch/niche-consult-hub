import { useState } from 'react';
import { Users, UserCheck, UserX, TrendingUp, DollarSign, AlertCircle, Calendar } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Header } from '@/components/layout/Header';
import { StatCard } from '@/components/dashboard/StatCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentPatients } from '@/components/dashboard/RecentPatients';
import { UpcomingSessions } from '@/components/dashboard/UpcomingSessions';
import { AppointmentFormDialog } from '@/components/appointments/AppointmentFormDialog';
import { useApp } from '@/contexts/AppContext';
import { Appointment } from '@/types';
import { toast } from 'sonner';

const Index = () => {
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false);
  const { patients, appointments, stats, addAppointment } = useApp();

  const handleSaveAppointment = (appointment: Partial<Appointment>) => {
    addAppointment(appointment);
    toast.success('Consulta agendada com sucesso!');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Calculate patient stats
  const activePatients = patients.filter(p => p.status === 'ativo').length;
  const inactivePatients = patients.filter(p => p.status === 'inativo').length;
  
  // Calculate new patients (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const newPatients = patients.filter(p => new Date(p.createdAt) >= thirtyDaysAgo).length;

  return (
    <MainLayout>
      <Header 
        title="Dashboard" 
        subtitle="Visão geral do seu consultório terapêutico"
        onNewAppointment={() => setAppointmentDialogOpen(true)}
      />

      {/* Patient Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total de Pacientes"
          value={stats.totalPatients}
          subtitle="Pacientes cadastrados"
          icon={Users}
          iconBgColor="bg-primary"
          iconColor="text-primary-foreground"
        />
        <StatCard
          title="Pacientes Ativos"
          value={activePatients}
          subtitle="Em tratamento"
          icon={UserCheck}
          iconBgColor="bg-success"
          iconColor="text-success-foreground"
        />
        <StatCard
          title="Pacientes Inativos"
          value={inactivePatients}
          subtitle="Não ativos"
          icon={UserX}
          iconBgColor="bg-muted"
          iconColor="text-muted-foreground"
        />
        <StatCard
          title="Novos (30 dias)"
          value={newPatients}
          subtitle="Cadastros recentes"
          icon={TrendingUp}
          iconBgColor="bg-accent"
          iconColor="text-accent-foreground"
          trend={newPatients > 0 ? { value: newPatients * 10, isPositive: true } : undefined}
        />
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-card border border-border/50 rounded-2xl p-5 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="h-11 w-11 rounded-xl bg-success flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-success-foreground" />
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-success/10 text-success">Este mês</span>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Receitas</p>
          <p className="text-2xl font-bold text-success">{formatCurrency(stats.monthRevenue)}</p>
        </div>

        <div className="bg-card border border-border/50 rounded-2xl p-5 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="h-11 w-11 rounded-xl bg-primary flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">Lucro</span>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Saldo do Mês</p>
          <p className="text-2xl font-bold text-primary">{formatCurrency(stats.monthRevenue - stats.monthExpenses)}</p>
        </div>

        <div className="bg-card border border-border/50 rounded-2xl p-5 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="h-11 w-11 rounded-xl bg-warning flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-warning-foreground" />
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning">Pendente</span>
          </div>
          <p className="text-sm text-muted-foreground mb-1">A Receber</p>
          <p className="text-2xl font-bold text-warning">{formatCurrency(stats.pendingPayments)}</p>
        </div>
      </div>

      {/* Main Content Grid - 3 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div>
          <QuickActions 
            onNewAppointment={() => setAppointmentDialogOpen(true)} 
            hasPatients={patients.length > 0}
          />
        </div>

        {/* Recent Patients */}
        <div>
          <RecentPatients patients={patients} />
        </div>

        {/* Upcoming Sessions */}
        <div>
          <UpcomingSessions appointments={appointments} />
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
