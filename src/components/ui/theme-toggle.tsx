import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const options = [
    { value: 'light' as const, icon: Sun, label: 'Claro' },
    { value: 'dark' as const, icon: Moon, label: 'Escuro' },
    { value: 'system' as const, icon: Monitor, label: 'Sistema' },
  ];

  return (
    <div className="flex items-center gap-1 p-1 rounded-xl bg-secondary">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => setTheme(option.value)}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
            theme === option.value
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <option.icon className="h-4 w-4" />
          <span className="hidden sm:inline">{option.label}</span>
        </button>
      ))}
    </div>
  );
}
