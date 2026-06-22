import React from 'react';
import { Outlet } from 'react-router-dom';

import { ProtectedRoute } from './ProtectedRoute';
import { OnboardingGuard } from './OnboardingGuard';

export const EmployeeRoute: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => (
  <ProtectedRoute>
    <OnboardingGuard>{children ?? <Outlet />}</OnboardingGuard>
  </ProtectedRoute>
);
