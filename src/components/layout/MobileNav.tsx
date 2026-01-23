import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Users,
  FileText,
  Settings,
  DollarSign,
  FileCheck,
  BarChart3,
  LogOut,
  Menu,
  X,
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
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/', color: 'text-blue-500' },
  { icon: Calendar, label: 'Agenda', path: '/agenda', color: 'text-green-500' },
  { icon: Users, label: 'Pacientes', path: '/pacientes', color: 'text-violet-500' },
  { icon: FileText, label: 'Prontuários', path: '/prontuarios', color: 'text-orange-500' },
  { icon: DollarSign, label: 'Financeiro', path: '/financeiro', color: 'text-emerald-500' },
  { icon: FileCheck, label: 'Documentos', path: '/documentos', color: 'text-pink-500' },
  { icon: BarChart3, label: 'Relatórios', path: '/relatorios', color: 'text-cyan-500' },
  { icon: Settings, label: 'Configurações', path: '/configuracoes', color: 'text-slate-500' },
];

interface MobileNavProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export function MobileNav({ isOpen, onToggle, onClose }: MobileNavProps) {
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    setLogoutDialogOpen(false);
    onClose();
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
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-background/95 backdrop-blur-md border-b border-border flex items-center justify-between px-4">
        <Branding variant="full" size="sm" />
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="h-10 w-10"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </header>

      {/* Mobile Menu Sheet */}
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="left" className="w-[280px] p-0">
          <SheetHeader className="p-4 border-b border-border">
            <SheetTitle className="text-left">
              <Branding variant="full" size="sm" />
            </SheetTitle>
          </SheetHeader>
          
          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {menuItems.map((item, index) => {
              const isActive = location.pathname === item.path;
              return (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03, duration: 0.2 }}
                >
                  <Link
                    to={item.path}
                    onClick={onClose}
                    className={cn(
                      'flex items-center gap-3 px-3 py-3 rounded-xl transition-all',
                      isActive 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                    )}
                  >
                    <div className={cn(
                      'h-10 w-10 rounded-xl flex items-center justify-center transition-colors',
                      isActive ? 'bg-primary/20' : 'bg-secondary'
                    )}>
                      <item.icon className={cn(
                        'h-5 w-5',
                        isActive ? item.color : 'text-muted-foreground'
                      )} />
                    </div>
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          {/* User section */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-background">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-xl avatar-gradient flex-shrink-0 text-xs">
                {getInitials(user?.displayName)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.displayName || 'Usuário'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
              onClick={() => setLogoutDialogOpen(true)}
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 bg-background/95 backdrop-blur-md border-t border-border flex items-center justify-around px-2 safe-area-pb">
        {menuItems.slice(0, 5).map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-lg transition-colors min-w-[56px]',
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground'
              )}
            >
              <item.icon className={cn(
                'h-5 w-5',
                isActive && item.color
              )} />
              <span className="text-[10px] font-medium">{item.label.slice(0, 8)}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout Dialog */}
      <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sair do sistema?</AlertDialogTitle>
            <AlertDialogDescription>
              Você será desconectado e precisará fazer login novamente.
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
