import { useEffect, useState, useCallback } from 'react';
import { USER_ROLE, RIDE_STATUS } from '../constants/enums';
import { apiFetch } from '../utils/api';

interface CurrentRideData {
  id: number;
  from: string;
  to: string;
  message: string;
  role: USER_ROLE;
  timestamp: string;
  status: RIDE_STATUS;
  expiryTimeSeconds: number;
  remainingTimeSeconds: number;
  fromLat?: number;
  fromLng?: number;
  toLat?: number;
  toLng?: number;
  createdBy: number;
  riderId?: number;
  passengerId?: number;
}

interface UseCurrentRideReturn {
  currentRide: CurrentRideData | null;
  hasActiveRide: boolean;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch and manage current user's active ride with real-time expiry data from backend
 */
export function useCurrentRide(userId?: number): UseCurrentRideReturn {
  const [currentRide, setCurrentRide] = useState<CurrentRideData | null>(null);
  const [hasActiveRide, setHasActiveRide] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrentRide = useCallback(async () => {
    if (!userId) {
      setCurrentRide(null);
      setHasActiveRide(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiFetch<{
        hasActiveRide: boolean;
        ride: CurrentRideData | null;
      }>(`${import.meta.env.VITE_API_BASE_URL}/rides/user/${userId}/current`);

      setHasActiveRide(response.hasActiveRide);
      setCurrentRide(response.ride);
    } catch (err) {
      setError((err as Error).message || 'Failed to fetch current ride');
      setCurrentRide(null);
      setHasActiveRide(false);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchCurrentRide();
  }, [fetchCurrentRide]);

  // Poll while user has an in-progress ride; faster during ACTIVE search window
  useEffect(() => {
    if (!userId || !hasActiveRide || !currentRide) return;

    const pollInterval =
      currentRide.status === RIDE_STATUS.ACTIVE ? 10000 : 30000;

    const interval = setInterval(() => {
      fetchCurrentRide();
    }, pollInterval);

    return () => clearInterval(interval);
  }, [fetchCurrentRide, userId, hasActiveRide, currentRide?.status]);

  return {
    currentRide,
    hasActiveRide,
    isLoading,
    error,
    refetch: fetchCurrentRide,
  };
}
