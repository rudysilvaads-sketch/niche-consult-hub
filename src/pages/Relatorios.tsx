import { useState, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar,
  DollarSign,
  PieChart,
  Activity
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Header } from '@/components/layout/Header';
import { useApp } from '@/contexts/AppContext';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Relatorios = () => {
  const [period, setPeriod] = useState('mes');
  const { patients, appointments, transactions, stats } = useApp();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Filter data by selected period
  const getDateRange = useMemo(() => {
    const now = new Date();
    const start = new Date();

    switch (period) {
      case 'semana':
        start.setDate(now.getDate() - 7);
        break;
      case 'mes':
        start.setMonth(now.getMonth() - 1);
        break;
      case 'trimestre':
        start.setMonth(now.getMonth() - 3);
        break;
      case 'ano':
        start.setFullYear(now.getFullYear() - 1);
        break;
    }

    return { start, end: now };
  }, [period]);

  // Generate real revenue data from transactions grouped by month
  const revenueData = useMemo(() => {
    const months: Record<string, { receita: number; despesa: number }> = {};
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      months[key] = { receita: 0, despesa: 0 };
    }

    transactions.forEach((t) => {
      const date = new Date(t.date);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      if (months[key] && t.status === 'pago') {
        if (t.type === 'receita') {
          months[key].receita += t.value;
        } else {
          months[key].despesa += t.value;
        }
      }
    });

    return Object.entries(months).map(([key, values]) => {
      const [year, month] = key.split('-').map(Number);
      return {
        name: monthNames[month],
        receita: values.receita,
        despesa: values.despesa,
      };
    });
  }, [transactions]);

  // Real appointment data by type
  const filteredAppointments = useMemo(() => {
    return appointments.filter((a) => {
      const date = new Date(a.date);
      return date >= getDateRange.start && date <= getDateRange.end;
    });
  }, [appointments, getDateRange]);

  const appointmentTypeData = useMemo(() => {
    const byType = filteredAppointments.reduce((acc, apt) => {
      const type = apt.type || 'Não definido';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(byType).map(([name, value]) => ({
      name: name.length > 15 ? name.substring(0, 15) + '...' : name,
      value,
    }));
  }, [filteredAppointments]);

  const statusData = useMemo(() => {
    return [
      { name: 'Agendado', value: filteredAppointments.filter(a => a.status === 'agendado').length },
      { name: 'Confirmado', value: filteredAppointments.filter(a => a.status === 'confirmado').length },
      { name: 'Concluído', value: filteredAppointments.filter(a => a.status === 'concluido').length },
      { name: 'Cancelado', value: filteredAppointments.filter(a => a.status === 'cancelado').length },
    ].filter(d => d.value > 0);
  }, [filteredAppointments]);

  const COLORS = ['hsl(173, 58%, 39%)', 'hsl(38, 92%, 50%)', 'hsl(152, 69%, 40%)', 'hsl(0, 72%, 51%)'];

  // Real appointments by day of week
  const weekDayData = useMemo(() => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
    const counts = new Array(7).fill(0);

    filteredAppointments.forEach((a) => {
      const dayOfWeek = new Date(a.date).getDay();
      counts[dayOfWeek]++;
    });

    // Return Mon-Sat (skip Sunday index 0, or include all)
    return days.map((name, i) => ({ name, consultas: counts[i] })).filter((_, i) => i >= 1); // Mon-Sat
  }, [filteredAppointments]);

  // Completion rate for filtered period
  const completionRate = useMemo(() => {
    if (filteredAppointments.length === 0) return 0;
    const completed = filteredAppointments.filter(a => a.status === 'concluido').length;
    return Math.round((completed / filteredAppointments.length) * 100);
  }, [filteredAppointments]);

  return (
    <MainLayout>
      <Header 
        title="Relatórios" 
        subtitle="Análises e estatísticas do seu consultório"
      />

      {/* Period Filter */}
      <div className="flex justify-end mb-4 sm:mb-6">
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-32 sm:w-40 input-styled text-sm">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="semana">Esta Semana</SelectItem>
            <SelectItem value="mes">Este Mês</SelectItem>
            <SelectItem value="trimestre">Trimestre</SelectItem>
            <SelectItem value="ano">Este Ano</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="card-elevated p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-muted-foreground truncate">Pacientes</p>
              <p className="text-lg sm:text-xl font-bold text-foreground">{patients.length}</p>
            </div>
          </div>
        </div>

        <div className="card-elevated p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-muted-foreground truncate">Consultas</p>
              <p className="text-lg sm:text-xl font-bold text-foreground">{filteredAppointments.length}</p>
            </div>
          </div>
        </div>

        <div className="card-elevated p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
              <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-success" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-muted-foreground truncate">Faturamento</p>
              <p className="text-lg sm:text-xl font-bold text-foreground truncate">{formatCurrency(stats.monthRevenue)}</p>
            </div>
          </div>
        </div>

        <div className="card-elevated p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-warning/10 flex items-center justify-center flex-shrink-0">
              <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-warning" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-muted-foreground truncate">Taxa Conclusão</p>
              <p className="text-lg sm:text-xl font-bold text-foreground">{completionRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Revenue Chart */}
        <div className="card-elevated p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div>
              <h3 className="font-semibold text-foreground text-sm sm:text-base">Receitas vs Despesas</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Últimos 6 meses</p>
            </div>
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-success" />
          </div>
          <div className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickFormatter={(v) => `${v/1000}k`} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Area 
                  type="monotone" 
                  dataKey="receita" 
                  stackId="1"
                  stroke="hsl(152, 69%, 40%)" 
                  fill="hsl(152, 69%, 40%, 0.3)" 
                  name="Receita"
                />
                <Area 
                  type="monotone" 
                  dataKey="despesa" 
                  stackId="2"
                  stroke="hsl(0, 72%, 51%)" 
                  fill="hsl(0, 72%, 51%, 0.3)" 
                  name="Despesa"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Appointment Status */}
        <div className="card-elevated p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div>
              <h3 className="font-semibold text-foreground text-sm sm:text-base">Status das Consultas</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Distribuição no período</p>
            </div>
            <PieChart className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          </div>
          <div className="h-48 sm:h-64 flex items-center justify-center">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                    fontSize={10}
                  >
                    {statusData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                </RechartsPie>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-sm">Nenhum dado no período selecionado</p>
            )}
          </div>
        </div>

        {/* Appointments by Day */}
        <div className="card-elevated p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div>
              <h3 className="font-semibold text-foreground text-sm sm:text-base">Consultas por Dia da Semana</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Distribuição no período</p>
            </div>
            <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
          </div>
          <div className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekDayData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="consultas" fill="hsl(173, 58%, 39%)" radius={[4, 4, 0, 0]} name="Consultas" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Types of Appointments */}
        <div className="card-elevated p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div>
              <h3 className="font-semibold text-foreground text-sm sm:text-base">Tipos de Consulta</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Distribuição por tipo</p>
            </div>
            <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-warning" />
          </div>
          <div className="space-y-4">
            {appointmentTypeData.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Nenhum dado disponível</p>
            ) : (
              appointmentTypeData.map((item, index) => {
                const total = appointmentTypeData.reduce((sum, i) => sum + i.value, 0);
                const percentage = total > 0 ? (item.value / total) * 100 : 0;
                return (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-foreground font-medium">{item.name}</span>
                      <span className="text-muted-foreground">{item.value} ({percentage.toFixed(0)}%)</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Top Patients */}
      <div className="card-elevated p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <h3 className="font-semibold text-foreground text-sm sm:text-base">Pacientes Mais Ativos</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">Maior número de consultas</p>
          </div>
          <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Paciente</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Email</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Consultas</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Valor Total</th>
              </tr>
            </thead>
            <tbody>
              {patients
                .map((patient) => {
                  const patientAppointments = appointments.filter(a => a.patientId === patient.id);
                  const totalValue = patientAppointments.reduce((sum, a) => sum + (a.value || 0), 0);
                  return { patient, count: patientAppointments.length, totalValue };
                })
                .sort((a, b) => b.count - a.count)
                .slice(0, 5)
                .map(({ patient, count, totalValue }) => (
                  <tr key={patient.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-semibold text-primary">
                            {patient.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                          </span>
                        </div>
                        <span className="font-medium text-foreground">{patient.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{patient.email}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-sm font-medium">
                        {count}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-success">{formatCurrency(totalValue)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
};

export default Relatorios;
