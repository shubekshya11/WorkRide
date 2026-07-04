import { LatLng, calculatePolylineDistance } from './polyline.util';
import { haversineDistance } from './rideStats.util';

/** Maximum detour (km) before the match-score penalty reaches its cap */
export const MAX_ACCEPTABLE_DETOUR_KM = 2;

/** Maximum points subtracted from the final hybrid match score */
export const MAX_DETOUR_PENALTY = 20;

/**
 * Calculates how much longer a route is compared to a direct origin→destination trip.
 */
export function calculateRouteDetourKm(
  routePath: LatLng[],
  origin: LatLng,
  destination: LatLng,
): number {
  const directDistanceKm = haversineDistance(
    origin.lat,
    origin.lng,
    destination.lat,
    destination.lng,
  );
  const actualDistanceKm = calculatePolylineDistance(routePath);

  return Math.max(0, actualDistanceKm - directDistanceKm);
}

/**
 * Penalty applied to the final hybrid score when pickup requires significant deviation.
 * Uses the average of driver and passenger detour distances.
 */
export function calculateDetourPenalty(
  driverDetourKm: number,
  passengerDetourKm: number = 0,
): number {
  const averageDetourKm = (driverDetourKm + passengerDetourKm) / 2;

  return Math.min(
    MAX_DETOUR_PENALTY,
    (averageDetourKm / MAX_ACCEPTABLE_DETOUR_KM) * MAX_DETOUR_PENALTY,
  );
}
