import { Bell, Search, Plus, Command, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { motion } from 'framer-motion';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onNewAppointment?: () => void;
}

export function Header({ title, subtitle, onNewAppointment }: HeaderProps) {
  const { resolvedTheme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="flex items-center justify-between mb-8">
      <div className="space-y-0.5">
        <h1 className="font-display text-2xl font-bold text-foreground tracking-tight">{title}</h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Buscar..."
            className="h-9 w-56 pl-9 pr-12 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/50 transition-all"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
            <Command className="h-3 w-3" />
            <span className="text-[10px] font-medium">K</span>
          </div>
        </div>

        {/* Theme Toggle */}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleTheme}
          className="relative h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-secondary overflow-hidden"
        >
          <motion.div
            key={resolvedTheme}
            initial={{ y: -20, opacity: 0, rotate: -90 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: 20, opacity: 0, rotate: 90 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {resolvedTheme === 'dark' ? (
              <Moon className="h-[18px] w-[18px]" />
            ) : (
              <Sun className="h-[18px] w-[18px]" />
            )}
          </motion.div>
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-secondary">
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
        </Button>

        {/* New Appointment */}
        {onNewAppointment && (
          <Button onClick={onNewAppointment} className="btn-gradient h-9 px-4 gap-2 rounded-lg">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline text-sm font-medium">Nova Consulta</span>
          </Button>
        )}
      </div>
    </header>
  );
}
