import {
  LatLng,
  calculatePolylineDistance,
  simplifyPolyline,
} from './polyline.util';
import { haversineDistance } from './rideStats.util';

export interface RouteOverlapSegment {
  start: LatLng;
  end: LatLng;
  distance: number;
}

export interface PolylineSimilarityResult {
  similarityScore: number;
  classification: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  overlapPercentage: number;
  driverDetour: number;
  passengerDetour: number;
  sharedDistance: number;
  totalDriverDistance: number;
  totalPassengerDistance: number;
}

const PROXIMITY_THRESHOLD_KM = 0.05;
const OVERLAP_THRESHOLD_KM = 0.1;
const SIMPLIFY_TOLERANCE_KM = 0.001;

/**
 * Compares two route polylines and returns overlap / similarity metrics.
 */
export function calculatePolylineSimilarity(
  driverPath: LatLng[],
  passengerPath: LatLng[],
  driverOrigin: LatLng,
  driverDestination: LatLng,
  passengerOrigin: LatLng,
  passengerDestination: LatLng,
): PolylineSimilarityResult {
  const simplifiedDriverPath = simplifyPolyline(driverPath, SIMPLIFY_TOLERANCE_KM);
  const simplifiedPassengerPath = simplifyPolyline(
    passengerPath,
    SIMPLIFY_TOLERANCE_KM,
  );

  const totalDriverDistance = calculatePolylineDistance(simplifiedDriverPath);
  const totalPassengerDistance = calculatePolylineDistance(simplifiedPassengerPath);

  const overlapSegments = findOverlappingSegments(
    simplifiedDriverPath,
    simplifiedPassengerPath,
  );
  const sharedDistance = overlapSegments.reduce(
    (sum, segment) => sum + segment.distance,
    0,
  );

  const overlapPercentage =
    (sharedDistance / Math.max(totalDriverDistance, totalPassengerDistance, 0.001)) *
    100;

  const driverDetour = calculatePathDetour(
    simplifiedDriverPath,
    driverOrigin,
    driverDestination,
  );
  const passengerDetour = calculatePathDetour(
    simplifiedPassengerPath,
    passengerOrigin,
    passengerDestination,
  );

  const similarityScore = calculateSimilarityScore(
    overlapPercentage,
    driverDetour,
    passengerDetour,
    totalDriverDistance,
    totalPassengerDistance,
  );

  return {
    similarityScore,
    classification: classifySimilarity(similarityScore),
    overlapPercentage,
    driverDetour,
    passengerDetour,
    sharedDistance,
    totalDriverDistance,
    totalPassengerDistance,
  };
}

export function findOverlappingSegments(
  path1: LatLng[],
  path2: LatLng[],
): RouteOverlapSegment[] {
  const overlaps: RouteOverlapSegment[] = [];

  for (let i = 0; i < path1.length - 1; i++) {
    const segment1 = { start: path1[i], end: path1[i + 1] };

    for (let j = 0; j < path2.length - 1; j++) {
      const segment2 = { start: path2[j], end: path2[j + 1] };
      const overlap = calculateSegmentOverlap(segment1, segment2);

      if (overlap.distance > OVERLAP_THRESHOLD_KM) {
        overlaps.push(overlap);
      }
    }
  }

  return overlaps;
}

function calculateSegmentOverlap(
  segment1: { start: LatLng; end: LatLng },
  segment2: { start: LatLng; end: LatLng },
): RouteOverlapSegment {
  const midPoint1 = {
    lat: (segment1.start.lat + segment1.end.lat) / 2,
    lng: (segment1.start.lng + segment1.end.lng) / 2,
  };
  const midPoint2 = {
    lat: (segment2.start.lat + segment2.end.lat) / 2,
    lng: (segment2.start.lng + segment2.end.lng) / 2,
  };

  const distance = haversineDistance(
    midPoint1.lat,
    midPoint1.lng,
    midPoint2.lat,
    midPoint2.lng,
  );

  if (distance > PROXIMITY_THRESHOLD_KM) {
    return { start: segment1.start, end: segment1.end, distance: 0 };
  }

  const segmentLength = haversineDistance(
    segment1.start.lat,
    segment1.start.lng,
    segment1.end.lat,
    segment1.end.lng,
  );

  return {
    start: segment1.start,
    end: segment1.end,
    distance: segmentLength,
  };
}

function calculatePathDetour(
  routePath: LatLng[],
  origin: LatLng,
  destination: LatLng,
): number {
  const directDistance = haversineDistance(
    origin.lat,
    origin.lng,
    destination.lat,
    destination.lng,
  );
  const actualDistance = calculatePolylineDistance(routePath);

  return Math.max(0, actualDistance - directDistance);
}

function calculateSimilarityScore(
  overlapPercentage: number,
  driverDetour: number,
  passengerDetour: number,
  totalDriverDistance: number,
  totalPassengerDistance: number,
): number {
  const overlapScore = Math.min(100, overlapPercentage * 2);
  const maxAcceptableDetour =
    Math.max(totalDriverDistance, totalPassengerDistance) * 0.3;
  const averageDetour = (driverDetour + passengerDetour) / 2;
  const detourScore = Math.max(
    0,
    100 - (averageDetour / Math.max(maxAcceptableDetour, 0.001)) * 100,
  );
  const lengthRatio =
    Math.min(totalDriverDistance, totalPassengerDistance) /
    Math.max(totalDriverDistance, totalPassengerDistance, 0.001);
  const lengthScore = lengthRatio * 100;

  const finalScore = overlapScore * 0.5 + detourScore * 0.3 + lengthScore * 0.2;

  return Math.round(finalScore * 100) / 100;
}

export function classifySimilarity(
  score: number,
): 'Excellent' | 'Good' | 'Fair' | 'Poor' {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Poor';
}
