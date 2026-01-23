import { ReactNode, useState } from 'react';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { useIsMobile } from '@/hooks/use-mobile';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      {!isMobile && <Sidebar />}
      
      {/* Mobile Navigation */}
      {isMobile && (
        <MobileNav 
          isOpen={mobileMenuOpen} 
          onToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
          onClose={() => setMobileMenuOpen(false)}
        />
      )}
      
      {/* Main Content */}
      <main className={`
        transition-all duration-300 min-h-screen
        ${isMobile ? 'pt-16 px-4 pb-20' : 'ml-64 p-8'}
      `}>
        {children}
      </main>
    </div>
  );
}
