import { useState } from 'react';
import { Users, UserCheck, UserX, TrendingUp, DollarSign, AlertCircle, ArrowUpRight } from 'lucide-react';
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

  const activePatients = patients.filter(p => p.status === 'ativo').length;
  const inactivePatients = patients.filter(p => p.status === 'inativo').length;
  
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const newPatients = patients.filter(p => new Date(p.createdAt) >= thirtyDaysAgo).length;

  return (
    <MainLayout>
      <Header 
        title="Dashboard" 
        subtitle="Visão geral do seu consultório"
        onNewAppointment={() => setAppointmentDialogOpen(true)}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total de Pacientes"
          value={stats.totalPatients}
          subtitle="Cadastrados"
          icon={Users}
          iconBgColor="bg-blue-50"
          iconColor="text-blue-500"
        />
        <StatCard
          title="Pacientes Ativos"
          value={activePatients}
          subtitle="Em tratamento"
          icon={UserCheck}
          iconBgColor="bg-green-50"
          iconColor="text-green-500"
        />
        <StatCard
          title="Pacientes Inativos"
          value={inactivePatients}
          subtitle="Não ativos"
          icon={UserX}
          iconBgColor="bg-slate-100"
          iconColor="text-slate-500"
        />
        <StatCard
          title="Novos (30 dias)"
          value={newPatients}
          subtitle="Cadastros recentes"
          icon={TrendingUp}
          iconBgColor="bg-violet-50"
          iconColor="text-violet-500"
          trend={newPatients > 0 ? { value: newPatients * 10, isPositive: true } : undefined}
        />
      </div>

      {/* Financial Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="stat-card group">
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
            </div>
            <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-600">
              Este mês
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Receitas</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-emerald-600 tracking-tight">{formatCurrency(stats.monthRevenue)}</p>
            <ArrowUpRight className="h-4 w-4 text-emerald-500" />
          </div>
        </div>

        <div className="stat-card group">
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-primary/10 text-primary">
              Lucro
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Saldo do Mês</p>
          <p className="text-2xl font-bold text-primary tracking-tight">{formatCurrency(stats.monthRevenue - stats.monthExpenses)}</p>
        </div>

        <div className="stat-card group">
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-amber-500" />
            </div>
            <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-50 text-amber-600">
              Pendente
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-1">A Receber</p>
          <p className="text-2xl font-bold text-amber-600 tracking-tight">{formatCurrency(stats.pendingPayments)}</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <QuickActions 
          onNewAppointment={() => setAppointmentDialogOpen(true)} 
          hasPatients={patients.length > 0}
        />
        <RecentPatients patients={patients} />
        <UpcomingSessions appointments={appointments} />
      </div>

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
