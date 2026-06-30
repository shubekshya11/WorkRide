import React from 'react';
import { Navigate } from 'react-router-dom';

import { useAdminAuth } from '../hooks/useAdminAuth';

import { ROUTE_ADMIN_LOGIN, ROUTE_ADMIN_DASHBOARD } from '../constants/routes';

const AdminRedirect: React.FC = () => {
  const { isAuthenticated } = useAdminAuth();

  if (isAuthenticated) {
    return <Navigate to={ROUTE_ADMIN_DASHBOARD} replace />;
  }

  return <Navigate to={ROUTE_ADMIN_LOGIN} replace />;
};

export default AdminRedirect;
