'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole } from '@/lib/types';

interface AdminViewContextType {
  viewAs: UserRole | null;
  setViewAs: (role: UserRole | null) => void;
  isAdmin: boolean;
}

const AdminViewContext = createContext<AdminViewContextType | undefined>(undefined);

export function AdminViewProvider({ children, userRole }: { children: React.ReactNode; userRole: UserRole }) {
  const [viewAs, setViewAsState] = useState<UserRole | null>(() => {
    if (typeof window !== 'undefined' && userRole === 'admin') {
      const savedView = localStorage.getItem('adminViewAs') as UserRole | null;
      return savedView && savedView !== 'admin' ? savedView : null;
    }
    return null;
  });
  const isAdmin = userRole === 'admin';

  const setViewAs = React.useCallback((role: UserRole | null) => {
    if (role === 'admin') {
      setViewAsState(null);
      localStorage.removeItem('adminViewAs');
    } else {
      setViewAsState(role);
      if (role) {
        localStorage.setItem('adminViewAs', role);
      } else {
        localStorage.removeItem('adminViewAs');
      }
    }
  }, []);

  return (
    <AdminViewContext.Provider value={{ viewAs, setViewAs, isAdmin }}>
      {children}
    </AdminViewContext.Provider>
  );
}

export function useAdminView() {
  const context = useContext(AdminViewContext);
  if (context === undefined) {
    throw new Error('useAdminView must be used within an AdminViewProvider');
  }
  return context;
}
