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
  DollarSign,
  FileCheck,
  BarChart3,
  LogOut,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Branding } from '@/components/branding/Branding';
import { motion, AnimatePresence } from 'framer-motion';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/', color: 'text-blue-500' },
  { icon: Calendar, label: 'Agenda', path: '/agenda', color: 'text-green-500' },
  { icon: Users, label: 'Pacientes', path: '/pacientes', color: 'text-violet-500' },
  { icon: FileText, label: 'Prontuários', path: '/prontuarios', color: 'text-orange-500' },
  { icon: DollarSign, label: 'Financeiro', path: '/financeiro', color: 'text-emerald-500' },
  { icon: FileCheck, label: 'Documentos', path: '/documentos', color: 'text-pink-500' },
  { icon: BarChart3, label: 'Relatórios', path: '/relatorios', color: 'text-cyan-500' },
];

const bottomItems = [
  { icon: Settings, label: 'Configurações', path: '/configuracoes', color: 'text-slate-500' },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    setLogoutDialogOpen(false);
  };

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <>
      <motion.aside
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={cn(
          'fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-out flex flex-col',
          collapsed ? 'w-[72px]' : 'w-64'
        )}
      >
        {/* Header */}
        <div className={cn(
          'flex items-center h-16 px-4 border-b border-sidebar-border',
          collapsed ? 'justify-center' : 'justify-between'
        )}>
          <AnimatePresence mode="wait">
            {collapsed ? (
              <motion.div
                key="icon"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Branding variant="icon" size="sm" />
              </motion.div>
            ) : (
              <motion.div
                key="full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Branding variant="full" size="sm" />
              </motion.div>
            )}
          </AnimatePresence>
          {!collapsed && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCollapsed(true)}
              className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </motion.button>
          )}
        </div>

        {/* Collapse button when collapsed */}
        {collapsed && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCollapsed(false)}
            className="mx-auto mt-3 h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </motion.button>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
              >
                <Link
                  to={item.path}
                  className={cn(
                    'sidebar-item relative group',
                    isActive && 'active',
                    collapsed && 'justify-center px-0'
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <motion.div 
                    className={cn(
                      'h-9 w-9 rounded-lg flex items-center justify-center transition-colors shrink-0',
                      isActive ? 'bg-accent' : 'bg-secondary group-hover:bg-accent/50'
                    )}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <item.icon className={cn(
                      'h-[18px] w-[18px] transition-colors',
                      isActive ? item.color : 'text-muted-foreground group-hover:' + item.color
                    )} />
                  </motion.div>
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span 
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        className={cn(
                          'text-sm font-medium overflow-hidden whitespace-nowrap',
                          isActive ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'
                        )}
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </motion.div>
            );
          })}
          
          {/* External link */}
          <AnimatePresence>
            {!collapsed && (
              <motion.div 
                className="pt-4 mt-4 border-t border-sidebar-border"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <a
                  href="/agendar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sidebar-item group"
                >
                  <div className="h-9 w-9 rounded-lg flex items-center justify-center bg-secondary group-hover:bg-accent/50 transition-colors shrink-0">
                    <ExternalLink className="h-[18px] w-[18px] text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground">
                    Agenda Online
                  </span>
                </a>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        {/* Bottom section */}
        <div className="px-3 py-2 border-t border-sidebar-border">
          {bottomItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'sidebar-item relative group',
                  isActive && 'active',
                  collapsed && 'justify-center px-0'
                )}
                title={collapsed ? item.label : undefined}
              >
                <motion.div 
                  className={cn(
                    'h-9 w-9 rounded-lg flex items-center justify-center transition-colors shrink-0',
                    isActive ? 'bg-accent' : 'bg-secondary group-hover:bg-accent/50'
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <item.icon className={cn(
                    'h-[18px] w-[18px] transition-colors',
                    isActive ? item.color : 'text-muted-foreground'
                  )} />
                </motion.div>
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={cn(
                        'text-sm font-medium',
                        isActive ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'
                      )}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </div>

        {/* User section */}
        <div className="p-3 border-t border-sidebar-border">
          <motion.div 
            className={cn(
              'flex items-center gap-3 p-2 rounded-lg hover:bg-secondary transition-colors cursor-pointer',
              collapsed && 'justify-center p-1'
            )}
            onClick={collapsed ? () => setCollapsed(false) : undefined}
            whileHover={{ backgroundColor: 'hsl(var(--secondary))' }}
          >
            <motion.div 
              className="h-9 w-9 rounded-lg avatar-gradient flex-shrink-0 text-xs"
              whileHover={{ scale: 1.05 }}
            >
              {getInitials(user?.displayName)}
            </motion.div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div 
                  className="flex-1 min-w-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <p className="text-sm font-medium text-foreground truncate">
                    {user?.displayName || 'Usuário'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
            {!collapsed && (
              <Button
                variant="ghost"
                size="icon"
                className="flex-shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                onClick={(e) => {
                  e.stopPropagation();
                  setLogoutDialogOpen(true);
                }}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </motion.div>
        </div>
      </motion.aside>

      <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sair do sistema?</AlertDialogTitle>
            <AlertDialogDescription>
              Você será desconectado e precisará fazer login novamente para acessar o sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} className="bg-destructive hover:bg-destructive/90">
              Sair
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
