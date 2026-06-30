import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { useAdminAuth } from '../hooks/useAdminAuth';

import { ROUTE_ADMIN_LOGIN } from '../constants/routes';

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAdminAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Admin authentication required. Please log in.');
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to={ROUTE_ADMIN_LOGIN} replace />;
  }

  return <>{children}</>;
};