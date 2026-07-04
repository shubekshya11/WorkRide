import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { RIDE_STATUS, RIDE_ROLE } from '../constants/enums';
import { ROUTE_LOGIN } from '../constants/routes';
import { API_RIDES_HISTORY } from '../constants/api';

import { RideHistory, ReflectionStats } from '../interfaces/types';

import { apiFetch } from '../utils/api';
import { getStoredUser } from '../utils/functions';
import { useKarmaPoints } from '../hooks/useKarmaPoints';
import { useCreditScore } from '../hooks/useCreditScore';

import Dashboard from '../components/Dashboard';
import ReflectionDashboard from '../components/ReflectionDashboard';

// TODO: Implement infinite scroll for ride history (pagination, fetch more on scroll)
// TODO: Backend checklist for infinite scroll:
//   1. Add pagination support to /rides/history endpoint (accept page, limit params)
//   2. Return total count or hasMore flag in response
//   3. Optimize query for large datasets (indexes, limits)
//   4. Document API changes for frontend
const SelfReflection = () => {
  const [rides, setRides] = useState<RideHistory[]>([]);
  const [userId, setUserId] = useState<number | null>(null);

  const { karmaPoints } = useKarmaPoints();
  const { creditScore } = useCreditScore();
  const navigate = useNavigate();

  // TODO: Refactor ride history fetching to support pagination and infinite scroll
  useEffect(() => {
    let cancelled = false;
    const storedUser = getStoredUser();
    if (!storedUser) {
      navigate(ROUTE_LOGIN);
      return;
    }
    setUserId(storedUser.id ?? null);

    const fetchWithRetry = async (retries = 3) => {
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      const url = `${baseUrl}${API_RIDES_HISTORY}?userId=${storedUser.id}`;

      for (let attempt = 0; attempt < retries; attempt++) {
        try {
          const res = await apiFetch<{ rides: RideHistory[] }>(url);
          if (!cancelled) setRides(res.rides);
          break;
        } catch (error) {
          if (attempt === retries - 1 && !cancelled) setRides([]);
        }
      }
    };

    fetchWithRetry();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const getTotalRideCount = (userId: number | null) => {
    return rides.filter(
      ({ rider, riderId, createdBy, passengerId, passengers }) =>
        rider?.id === userId ||
        riderId === userId ||
        createdBy === userId ||
        passengerId === userId ||
        (Array.isArray(passengers) && passengers.some((p) => p.id === userId)),
    ).length;
  };

  const getUserCompletedRides = (userId: number | null) => {
    return rides.filter(({ status, rider, riderId, passengerId, createdBy, passengers }) => {
      if (status !== RIDE_STATUS.COMPLETED) return false;

      return (
        rider?.id === userId ||
        riderId === userId ||
        createdBy === userId ||
        passengerId === userId ||
        (Array.isArray(passengers) && passengers.some((p) => p.id === userId))
      );
    });
  };

  const completedRides = getUserCompletedRides(userId);

  const stats: ReflectionStats = {
    postedCount: getTotalRideCount(userId),
    confirmedCount: completedRides.length,
    karmaPoints: karmaPoints ?? 0,
    creditScore: creditScore ?? 0,
    distanceTravelled: completedRides.reduce(
      (sum, ride) => sum + (ride.distance ?? 0),
      0,
    ),
    co2Reduced: completedRides.reduce(
      (sum, ride) => sum + (ride.co2Saved ?? 0),
      0,
    ),
    peopleImpacted: completedRides.length,
  };

  return (
    <>
      <main className="mx-auto max-w-4xl overflow-hidden p-4 md:p-6">
        <h1 className="mb-6 text-2xl font-semibold text-teal-950 dark:text-teal-100">
          Your activity
        </h1>

        <ReflectionDashboard
          stats={stats}
          completedRides={completedRides}
          currentUserId={userId || 0}
          userRole={RIDE_ROLE.RIDER}
        />
        {/* TODO: Update Dashboard to support incremental loading (infinite scroll) */}
        <Dashboard rides={rides} />
      </main>
    </>
  );
};

export default SelfReflection;
