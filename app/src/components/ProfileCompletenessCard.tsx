import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

import { PROFILE_FIELD_LABELS, USER_ROLE } from '../constants/enums';
import {
  ROUTE_ONBOARDING_CHANGE_PASSWORD,
  ROUTE_ONBOARDING_PROFILE,
  ROUTE_RIDER_APPLICATION,
} from '../constants/routes';
import {
  getOnboardingStatus,
  type OnboardingStatus,
} from '../services/onboardingApi';
import { useAuth } from '../hooks/useAuth';

const ProfileCompletenessCard: React.FC = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role?.toLowerCase() === USER_ROLE.ADMIN;

  useEffect(() => {
    if (!user || isAdmin) {
      setLoading(false);
      return;
    }

    getOnboardingStatus()
      .then(setStatus)
      .catch(() => toast.error('Failed to load profile status'))
      .finally(() => setLoading(false));
  }, [user, isAdmin]);

  if (!user || isAdmin || loading || !status) {
    return null;
  }

  const isComplete = status.profileCompleteness >= 100;

  return (
    <div className="rounded-xl border border-teal-200 bg-white p-4 shadow-sm dark:border-teal-700 dark:bg-dark">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-teal-950 dark:text-teal-100">
            Profile completeness
          </h2>
          <p className="mt-1 text-sm text-teal-700 dark:text-teal-300">
            {isComplete
              ? 'Your employee profile is complete.'
              : 'Complete your profile to post or request rides.'}
          </p>
        </div>
        <span className="text-2xl font-bold text-teal-600 dark:text-teal-400">
          {status.profileCompleteness}%
        </span>
      </div>

      <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-teal-100 dark:bg-teal-900">
        <div
          className="h-full rounded-full bg-teal-500 transition-all duration-300"
          style={{ width: `${status.profileCompleteness}%` }}
        />
      </div>

      {status.missingFields.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
            Missing fields
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {status.missingFields.map((field) => (
              <li
                key={field}
                className="rounded-full bg-amber-50 px-3 py-1 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
              >
                {PROFILE_FIELD_LABELS[field] || field}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {!isComplete && (
          <Link
            to={ROUTE_ONBOARDING_PROFILE}
            className="rounded-full bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
          >
            Complete profile
          </Link>
        )}
        {status.mustChangePassword && (
          <Link
            to={ROUTE_ONBOARDING_CHANGE_PASSWORD}
            className="rounded-full border border-teal-300 px-4 py-2 text-sm font-medium text-teal-800 hover:bg-teal-50 dark:text-teal-200 dark:hover:bg-teal-950"
          >
            Change password
          </Link>
        )}
        {!status.isApprovedRider && status.riderApplicationStatus !== 'PENDING_RIDER_APPROVAL' && (
          <Link
            to={ROUTE_RIDER_APPLICATION}
            className="rounded-full border border-teal-300 px-4 py-2 text-sm font-medium text-teal-800 hover:bg-teal-50 dark:text-teal-200 dark:hover:bg-teal-950"
          >
            Apply to become a rider
          </Link>
        )}
      </div>
    </div>
  );
};

export default ProfileCompletenessCard;
