import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Users,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Stethoscope,
  DollarSign,
  FileCheck,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Calendar, label: 'Agenda', path: '/agenda' },
  { icon: Users, label: 'Pacientes', path: '/pacientes' },
  { icon: FileText, label: 'Prontuários', path: '/prontuarios' },
  { icon: DollarSign, label: 'Financeiro', path: '/financeiro' },
  { icon: FileCheck, label: 'Documentos', path: '/documentos' },
  { icon: BarChart3, label: 'Relatórios', path: '/relatorios' },
  { icon: Settings, label: 'Configurações', path: '/configuracoes' },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-sidebar-border">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Stethoscope className="h-5 w-5" />
        </div>
        {!collapsed && (
          <div className="animate-fade-in">
            <h1 className="font-display text-lg font-bold text-sidebar-foreground">
              ConsultaPro
            </h1>
            <p className="text-xs text-muted-foreground">Gestão de Consultas</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'sidebar-item',
                isActive && 'active'
              )}
            >
              <item.icon className={cn('h-5 w-5 flex-shrink-0', isActive ? 'text-primary-foreground' : 'text-muted-foreground')} />
              {!collapsed && (
                <span className={cn('font-medium animate-fade-in', isActive ? 'text-primary-foreground' : 'text-sidebar-foreground')}>
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90 transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>

      {/* User Info */}
      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-semibold text-primary">DR</span>
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <p className="text-sm font-medium text-sidebar-foreground">Dr. Rafael</p>
              <p className="text-xs text-muted-foreground">Terapeuta</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
