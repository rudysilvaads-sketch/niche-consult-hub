import { useState } from 'react';
import { User, Building, Bell, Shield, Palette } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CATEGORY_LABELS, ProfessionalCategory } from '@/types';
import { cn } from '@/lib/utils';

const tabs = [
  { id: 'profile', label: 'Perfil', icon: User },
  { id: 'clinic', label: 'Consultório', icon: Building },
  { id: 'notifications', label: 'Notificações', icon: Bell },
  { id: 'security', label: 'Segurança', icon: Shield },
  { id: 'appearance', label: 'Aparência', icon: Palette },
];

const Configuracoes = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [category, setCategory] = useState<ProfessionalCategory>('terapeuta');

  return (
    <MainLayout>
      <Header 
        title="Configurações" 
        subtitle="Gerencie suas preferências e dados do consultório"
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="card-elevated p-4">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200',
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-secondary/50 text-foreground'
                )}
              >
                <tab.icon className="h-5 w-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 card-elevated p-6">
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="font-display text-xl font-semibold text-foreground mb-1">
                  Informações do Perfil
                </h2>
                <p className="text-sm text-muted-foreground">
                  Atualize suas informações pessoais e profissionais.
                </p>
              </div>

              <div className="flex items-center gap-6">
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground text-2xl font-bold">
                  DR
                </div>
                <div>
                  <Button variant="outline">Alterar Foto</Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    JPG, PNG ou GIF. Máximo 2MB.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input id="name" defaultValue="Dr. Rafael Mendes" className="input-styled mt-1" />
                </div>
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" defaultValue="rafael@consultorio.com" className="input-styled mt-1" />
                </div>
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input id="phone" defaultValue="(11) 99999-8888" className="input-styled mt-1" />
                </div>
                <div>
                  <Label htmlFor="category">Categoria Profissional</Label>
                  <Select value={category} onValueChange={(v) => setCategory(v as ProfessionalCategory)}>
                    <SelectTrigger className="input-styled mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="crp">Registro Profissional (CRP/CRM/OAB)</Label>
                  <Input id="crp" defaultValue="CRP 06/12345" className="input-styled mt-1" />
                </div>
                <div>
                  <Label htmlFor="specialty">Especialidade</Label>
                  <Input id="specialty" defaultValue="Terapia Cognitivo-Comportamental" className="input-styled mt-1" />
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <Button className="btn-gradient">Salvar Alterações</Button>
              </div>
            </div>
          )}

          {activeTab === 'clinic' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="font-display text-xl font-semibold text-foreground mb-1">
                  Dados do Consultório
                </h2>
                <p className="text-sm text-muted-foreground">
                  Configure as informações do seu local de atendimento.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="clinicName">Nome do Consultório</Label>
                  <Input id="clinicName" defaultValue="Espaço Bem-Estar" className="input-styled mt-1" />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Input id="address" defaultValue="Rua das Flores, 123 - Sala 401" className="input-styled mt-1" />
                </div>
                <div>
                  <Label htmlFor="city">Cidade</Label>
                  <Input id="city" defaultValue="São Paulo" className="input-styled mt-1" />
                </div>
                <div>
                  <Label htmlFor="state">Estado</Label>
                  <Input id="state" defaultValue="SP" className="input-styled mt-1" />
                </div>
                <div>
                  <Label htmlFor="duration">Duração Padrão da Consulta</Label>
                  <Select defaultValue="60">
                    <SelectTrigger className="input-styled mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutos</SelectItem>
                      <SelectItem value="45">45 minutos</SelectItem>
                      <SelectItem value="60">1 hora</SelectItem>
                      <SelectItem value="90">1h 30min</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="interval">Intervalo entre Consultas</Label>
                  <Select defaultValue="15">
                    <SelectTrigger className="input-styled mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 minutos</SelectItem>
                      <SelectItem value="15">15 minutos</SelectItem>
                      <SelectItem value="30">30 minutos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <Button className="btn-gradient">Salvar Alterações</Button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="font-display text-xl font-semibold text-foreground mb-1">
                  Preferências de Notificação
                </h2>
                <p className="text-sm text-muted-foreground">
                  Escolha como deseja receber alertas e lembretes.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  { id: 'emailReminders', label: 'Lembretes por e-mail', description: 'Receba lembretes de consultas por e-mail' },
                  { id: 'smsReminders', label: 'Lembretes por SMS', description: 'Receba lembretes de consultas via SMS' },
                  { id: 'newPatient', label: 'Novo paciente', description: 'Notificação quando um novo paciente é cadastrado' },
                  { id: 'cancelation', label: 'Cancelamentos', description: 'Alerta quando uma consulta é cancelada' },
                  { id: 'dailySummary', label: 'Resumo diário', description: 'Receba um resumo das consultas do dia' },
                ].map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
                    <div>
                      <p className="font-medium text-foreground">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-border">
                <Button className="btn-gradient">Salvar Preferências</Button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="font-display text-xl font-semibold text-foreground mb-1">
                  Segurança da Conta
                </h2>
                <p className="text-sm text-muted-foreground">
                  Mantenha sua conta segura atualizando suas credenciais.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Senha Atual</Label>
                  <Input id="currentPassword" type="password" className="input-styled mt-1" />
                </div>
                <div>
                  <Label htmlFor="newPassword">Nova Senha</Label>
                  <Input id="newPassword" type="password" className="input-styled mt-1" />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                  <Input id="confirmPassword" type="password" className="input-styled mt-1" />
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <Button className="btn-gradient">Alterar Senha</Button>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="font-display text-xl font-semibold text-foreground mb-1">
                  Aparência
                </h2>
                <p className="text-sm text-muted-foreground">
                  Personalize a aparência do sistema.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
                  <div>
                    <p className="font-medium text-foreground">Tema do Sistema</p>
                    <p className="text-sm text-muted-foreground">Selecione o tema preferido</p>
                  </div>
                  <Select defaultValue="light">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Claro</SelectItem>
                      <SelectItem value="dark">Escuro</SelectItem>
                      <SelectItem value="system">Sistema</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
                  <div>
                    <p className="font-medium text-foreground">Animações</p>
                    <p className="text-sm text-muted-foreground">Ativar animações de interface</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
                  <div>
                    <p className="font-medium text-foreground">Menu Compacto</p>
                    <p className="text-sm text-muted-foreground">Manter menu lateral recolhido</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Configuracoes;
