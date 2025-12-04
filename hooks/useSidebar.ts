'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SidebarContextType {
  isCollapsed: boolean;
  toggle: () => void;
  isLoaded: boolean;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Read from localStorage on mount
    const stored = localStorage.getItem('sidebar-collapsed');
    if (stored !== null) {
      setIsCollapsed(stored === 'true');
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    // Save to localStorage when state changes
    if (isLoaded) {
      localStorage.setItem('sidebar-collapsed', String(isCollapsed));
    }
  }, [isCollapsed, isLoaded]);

  const toggle = () => {
    setIsCollapsed(prev => !prev);
  };

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggle, isLoaded }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
