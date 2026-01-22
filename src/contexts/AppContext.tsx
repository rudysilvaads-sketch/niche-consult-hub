import React, { createContext, useContext, ReactNode } from 'react';
import { useAppData } from '@/hooks/useAppData';

type AppContextType = ReturnType<typeof useAppData>;

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const appData = useAppData();

  return (
    <AppContext.Provider value={appData}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
