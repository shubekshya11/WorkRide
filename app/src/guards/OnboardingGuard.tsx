import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';
import { USER_ROLE } from '../constants/enums';
import {
  ROUTE_ONBOARDING_CHANGE_PASSWORD,
  ROUTE_ONBOARDING_PROFILE,
  ROUTE_ADMIN_DASHBOARD,
  ROUTE_HOME,
} from '../constants/routes';
import { getOnboardingStatus, type OnboardingStatus } from '../services/onboardingApi';

interface OnboardingGuardProps {
  children: React.ReactNode;
}

export const OnboardingGuard: React.FC<OnboardingGuardProps> = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role?.toLowerCase() === USER_ROLE.ADMIN;
  const isOnboardingRoute = location.pathname.startsWith('/onboarding');

  useEffect(() => {
    if (!user || isAdmin) {
      setLoading(false);
      return;
    }

    getOnboardingStatus()
      .then(setStatus)
      .catch(() => setStatus(null))
      .finally(() => setLoading(false));
  }, [user, isAdmin, location.pathname]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600" />
      </div>
    );
  }

  if (isAdmin) {
    return <>{children}</>;
  }

  if (status?.mustChangePassword && location.pathname !== ROUTE_ONBOARDING_CHANGE_PASSWORD) {
    return <Navigate to={ROUTE_ONBOARDING_CHANGE_PASSWORD} replace />;
  }

  if (
    !status?.mustChangePassword &&
    status &&
    status.profileCompleteness < 100 &&
    !isOnboardingRoute &&
    location.pathname !== ROUTE_ONBOARDING_PROFILE
  ) {
    return <Navigate to={ROUTE_ONBOARDING_PROFILE} replace />;
  }

  if (isOnboardingRoute && status && !status.mustChangePassword && status.profileCompleteness >= 100) {
    return <Navigate to={isAdmin ? ROUTE_ADMIN_DASHBOARD : ROUTE_HOME} replace />;
  }

  return <>{children}</>;
};
