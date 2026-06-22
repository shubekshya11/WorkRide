import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { useAuth } from '../hooks/useAuth';
import { getUserData } from '../utils/auth';

import { USER_ROLE } from '../constants/enums';
import { ROUTE_HOME } from '../constants/routes';

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user } = useAuth();
  const role = user?.role ?? getUserData()?.role;
  const isAdmin = role?.toLowerCase() === USER_ROLE.ADMIN;

  useEffect(() => {
    if (role && !isAdmin) {
      toast.error('Admin access required. Your account does not have admin privileges.');
    }
  }, [role, isAdmin]);

  if (!isAdmin) {
    return <Navigate to={ROUTE_HOME} replace />;
  }

  return <>{children}</>;
};