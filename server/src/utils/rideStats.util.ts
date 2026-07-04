/**
 * Utility functions for ride statistics and carbon emission calculations.
 *
 * Includes Haversine distance calculation and carbon emission estimation using DEFRA factors.
 *
 * @see https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2024
 */

import { calculateDetourPenalty } from './detour.util';

/**
 * The radius of the Earth in kilometers (mean radius)
 */
export const EARTH_RADIUS_KM = 6371;

/**
 * Conversion factor from degrees to radians
 */
export const DEG_TO_RAD = Math.PI / 180;

/**
 * Maximum allowed proximity for ride matching (in km)
 */
export const MAX_RIDE_PROXIMITY_KM = 3;

/**
 * Match scoring constants for weighted multi-criteria ride matching
 */

/**
 * Maximum distance for distance scoring (in km)
 * Rides at or beyond this distance receive 0 points
 */
export const MAX_DISTANCE_SCORE_KM = 2;

/**
 * Maximum time difference for time compatibility scoring (in minutes)
 * Rides with time difference at or beyond this receive 0 points
 */
export const MAX_TIME_DIFFERENCE_MINUTES = 30;

/**
 * Maximum destination distance for destination similarity scoring (in km)
 * Destinations at or beyond this distance receive 0 points
 */
export const MAX_DESTINATION_DISTANCE_KM = 5;

/**
 * Weight distribution for match scoring (must sum to 1.0)
 * Original: DISTANCE: 0.4, TIME: 0.3, DESTINATION: 0.2, RATING: 0.1
 * Enhanced: DISTANCE: 0.35, TIME: 0.25, ROUTE_SIMILARITY: 0.25, RATING: 0.15
 */
export const MATCH_SCORE_WEIGHTS = {
  DISTANCE: 0.4,
  TIME: 0.3,
  DESTINATION: 0.2,
  RATING: 0.1,
} as const;

/**
 * Enhanced weight distribution for polyline-based route matching
 */
export const ENHANCED_MATCH_SCORE_WEIGHTS = {
  DISTANCE: 0.35,
  TIME: 0.25,
  ROUTE_SIMILARITY: 0.25,
  RATING: 0.15,
} as const;

/**
 * Minimum and maximum rating values (1-5 star scale)
 */
export const MIN_RATING = 1;
export const MAX_RATING = 5;

/**
 * DEFRA 2024 average car emission factor (kg CO2 per km)
 */

/**
 * Speed constants for transport (km/h)
 *
 * https://smarter-usa.org/wp-content/uploads/2019/01/1-Motorcycle-Speeds-at-Urban-Intersections.pdf
 */
export enum TransportSpeed {
  BIKE = 38.28,
}

/**
 * Emission factors for different modes of transport (kg CO2 per km)
 */
export enum EmissionFactor {
  BIKE = 0.016,
  CAR = 0.17144,
}

/**
 * Calculates the great-circle distance between two points on Earth using the Haversine formula.
 * @param lat1 Latitude of the first point (degrees)
 * @param lon1 Longitude of the first point (degrees)
 * @param lat2 Latitude of the second point (degrees)
 * @param lon2 Longitude of the second point (degrees)
 *
 * @returns Distance in kilometers between the two points
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const dLat = (lat2 - lat1) * DEG_TO_RAD;
  const dLon = (lon2 - lon1) * DEG_TO_RAD;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * DEG_TO_RAD) *
      Math.cos(lat2 * DEG_TO_RAD) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
}

/**
 *
 * Tier 1 Emission Factor Method
 * Emissions = Activity Data × Emission Factor
 *
 * Estimates CO₂ emissions for a given distance and vehicle type using DEFRA 2024 factors.
 *
 * @param distanceKm - Distance in kilometers
 * @param vehicle - Vehicle type (EmissionFactor)
 * @returns Estimated CO₂ emissions in kilograms
 *
 */
export function estimateCO2FromDistance(
  distanceKm: number,
  vehicle: EmissionFactor = EmissionFactor.BIKE, // Default to bike
): number {
  return distanceKm * vehicle;
}

/**
 * Calculates the estimated time of arrival (ETA) based on distance and transport mode.
 *
 * @param distanceKm - Distance to travel in kilometers
 * @returns Estimated time of arrival in minutes, rounded to nearest minute
 *
 * @example
 * const eta = calculateETA(5); // Returns ETA for a 5km bike ride
 */
export function calculateETA(distanceKm: number): number {
  // Always use bike speed since rider will be on bike
  const speed = TransportSpeed.BIKE;

  // Convert distance and speed to consistent units (km and hours)
  const timeInHours = distanceKm / speed;

  // Convert to minutes and round to nearest minute
  return Math.round(timeInHours * 60);
}

/**
 * Calculates the distance score based on proximity.
 * Closer rides receive higher scores.
 *
 * @param distanceKm - Distance in kilometers
 * @returns Score from 0 to 100
 *
 * @example
 * distanceScore(0) // Returns 100
 * distanceScore(1) // Returns 50
 * distanceScore(2) // Returns 0
 */
export function calculateDistanceScore(distanceKm: number): number {
  if (distanceKm <= 0) return 100;
  if (distanceKm >= MAX_DISTANCE_SCORE_KM) return 0;

  // Linear scaling: score = 100 * (1 - distance / max_distance)
  return Math.max(0, Math.min(100, 100 * (1 - distanceKm / MAX_DISTANCE_SCORE_KM)));
}

/**
 * Calculates the time compatibility score based on departure time difference.
 * Exact same departure time receives highest score.
 *
 * @param timeDifferenceMinutes - Time difference in minutes
 * @returns Score from 0 to 100
 *
 * @example
 * timeCompatibilityScore(0) // Returns 100
 * timeCompatibilityScore(15) // Returns 50
 * timeCompatibilityScore(30) // Returns 0
 */
export function calculateTimeCompatibilityScore(timeDifferenceMinutes: number): number {
  if (timeDifferenceMinutes <= 0) return 100;
  if (timeDifferenceMinutes >= MAX_TIME_DIFFERENCE_MINUTES) return 0;

  // Linear scaling: score = 100 * (1 - timeDiff / maxTimeDiff)
  return Math.max(0, Math.min(100, 100 * (1 - timeDifferenceMinutes / MAX_TIME_DIFFERENCE_MINUTES)));
}

/**
 * Calculates the destination similarity score based on distance between destinations.
 * Closer destinations receive higher scores.
 *
 * @param destinationDistanceKm - Distance between destinations in kilometers
 * @returns Score from 0 to 100
 *
 * @example
 * destinationSimilarityScore(0) // Returns 100
 * destinationSimilarityScore(2.5) // Returns 50
 * destinationSimilarityScore(5) // Returns 0
 */
export function calculateDestinationSimilarityScore(destinationDistanceKm: number): number {
  if (destinationDistanceKm <= 0) return 100;
  if (destinationDistanceKm >= MAX_DESTINATION_DISTANCE_KM) return 0;

  // Linear scaling: score = 100 * (1 - distance / max_distance)
  return Math.max(0, Math.min(100, 100 * (1 - destinationDistanceKm / MAX_DESTINATION_DISTANCE_KM)));
}

/**
 * Converts a 1-5 star rating to a 0-100 score.
 *
 * @param rating - Rating from 1 to 5 stars
 * @returns Score from 0 to 100
 *
 * @example
 * ratingToScore(5) // Returns 100
 * ratingToScore(3) // Returns 50
 * ratingToScore(1) // Returns 0
 */
export function ratingToScore(rating: number): number {
  if (rating <= MIN_RATING) return 0;
  if (rating >= MAX_RATING) return 100;

  // Linear scaling: score = ((rating - min) / (max - min)) * 100
  return ((rating - MIN_RATING) / (MAX_RATING - MIN_RATING)) * 100;
}

/**
 * Calculates the weighted match score for a ride based on multiple criteria.
 *
 * @param params - Match scoring parameters
 * @returns Match score from 0 to 100
 *
 * @example
 * const score = calculateMatchScore({
 *   distanceKm: 0.5,
 *   timeDifferenceMinutes: 10,
 *   destinationDistanceKm: 1,
 *   driverRating: 4.5
 * }); // Returns weighted score
 */
export interface MatchScoreParams {
  distanceKm: number;
  timeDifferenceMinutes: number;
  destinationDistanceKm: number;
  driverRating: number;
}

export function calculateMatchScore(params: MatchScoreParams): number {
  const {
    distanceKm,
    timeDifferenceMinutes,
    destinationDistanceKm,
    driverRating,
  } = params;

  // Calculate individual scores
  const distanceScore = calculateDistanceScore(distanceKm);
  const timeScore = calculateTimeCompatibilityScore(timeDifferenceMinutes);
  const destinationScore = calculateDestinationSimilarityScore(destinationDistanceKm);
  const ratingScore = ratingToScore(driverRating);

  // Calculate weighted final score
  const finalScore =
    distanceScore * MATCH_SCORE_WEIGHTS.DISTANCE +
    timeScore * MATCH_SCORE_WEIGHTS.TIME +
    destinationScore * MATCH_SCORE_WEIGHTS.DESTINATION +
    ratingScore * MATCH_SCORE_WEIGHTS.RATING;

  // Round to 2 decimal places and clamp between 0 and 100
  return Math.max(0, Math.min(100, Math.round(finalScore * 100) / 100));
}

/**
 * Enhanced match scoring parameters with route similarity
 */
export interface EnhancedMatchScoreParams {
  distanceKm: number;
  timeDifferenceMinutes: number;
  routeSimilarityScore: number; // 0-100 from polyline matching
  driverRating: number;
  driverDetour?: number;
  passengerDetour?: number;
}

/**
 * Calculates the enhanced weighted match score using route similarity instead of destination distance.
 * This provides more accurate matching by considering actual route overlap.
 *
 * @param params - Enhanced match scoring parameters
 * @returns Match score from 0 to 100
 *
 * @example
 * const score = calculateEnhancedMatchScore({
 *   distanceKm: 0.5,
 *   timeDifferenceMinutes: 10,
 *   routeSimilarityScore: 75,
 *   driverRating: 4.5
 * }); // Returns weighted score with route similarity
 */
export function calculateEnhancedMatchScore(params: EnhancedMatchScoreParams): number {
  const {
    distanceKm,
    timeDifferenceMinutes,
    routeSimilarityScore,
    driverRating,
    driverDetour = 0,
    passengerDetour = 0,
  } = params;

  // Calculate individual scores
  const distanceScore = calculateDistanceScore(distanceKm);
  const timeScore = calculateTimeCompatibilityScore(timeDifferenceMinutes);
  const routeScore = routeSimilarityScore; // Already 0-100
  const ratingScore = ratingToScore(driverRating);
  const detourPenalty = calculateDetourPenalty(driverDetour, passengerDetour);

  const finalScore =
    distanceScore * ENHANCED_MATCH_SCORE_WEIGHTS.DISTANCE +
    timeScore * ENHANCED_MATCH_SCORE_WEIGHTS.TIME +
    routeScore * ENHANCED_MATCH_SCORE_WEIGHTS.ROUTE_SIMILARITY +
    ratingScore * ENHANCED_MATCH_SCORE_WEIGHTS.RATING -
    detourPenalty;

  // Round to 2 decimal places and clamp between 0 and 100
  return Math.max(0, Math.min(100, Math.round(finalScore * 100) / 100));
}

/**
 * Calculates the time difference in minutes between two ISO timestamp strings.
 *
 * @param timestamp1 - First timestamp (ISO string)
 * @param timestamp2 - Second timestamp (ISO string)
 * @returns Absolute time difference in minutes
 */
export function calculateTimeDifferenceMinutes(timestamp1: string, timestamp2: string): number {
  const date1 = new Date(timestamp1);
  const date2 = new Date(timestamp2);
  const diffMs = Math.abs(date1.getTime() - date2.getTime());
  return diffMs / (1000 * 60); // Convert milliseconds to minutes
}
