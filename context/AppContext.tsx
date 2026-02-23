/**
 * React Context for app-wide state management
 */

'use client';

import React, { createContext, useContext, ReactNode } from 'react';

interface AppContextType {
  isDarkMode: boolean;
  setIsDarkMode: (isDark: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isDarkMode, setIsDarkMode] = React.useState(true);

  return (
    <AppContext.Provider value={{ isDarkMode, setIsDarkMode }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}
