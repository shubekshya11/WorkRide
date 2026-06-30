import React, { createContext, useState } from 'react';

import type { StoredUserData } from '../interfaces/types';

import { getStoredAdminUser, isAuthenticated as hasAdminAuthTokens } from '../utils/adminAuth';
import { adminLogoutUser } from '../utils/adminAuthApi';

export interface AdminAuthContextType {
  user: StoredUserData | null;
  setUser: (user: StoredUserData | null) => void;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
}

export const AdminAuthContext = createContext<AdminAuthContextType | undefined>(
  undefined,
);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<StoredUserData | null>(() => getStoredAdminUser());

  const logout = async (): Promise<void> => {
    try {
      await adminLogoutUser();
    } catch (error) {
      console.error('Admin logout error:', error);
      // Continue with local cleanup even if server call fails
    } finally {
      setUser(null);
    }
  };

  const isAuthenticated = hasAdminAuthTokens() && user !== null;

  return (
    <AdminAuthContext.Provider value={{ user, setUser, isAuthenticated, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};
