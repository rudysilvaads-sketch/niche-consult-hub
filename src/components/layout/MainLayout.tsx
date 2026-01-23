import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Gradient glow effect */}
      <div 
        className="fixed top-0 left-64 right-0 h-[500px] pointer-events-none opacity-50"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% -20%, hsl(262 83% 58% / 0.12), transparent)'
        }}
      />
      
      <Sidebar />
      <main className="ml-64 p-8 relative transition-all duration-300">
        {children}
      </main>
    </div>
  );
}
