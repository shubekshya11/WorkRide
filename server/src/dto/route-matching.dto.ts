/**
 * Route Matching DTOs
 * Data transfer objects for route matching operations
 */

import { IsNumber, IsString, IsOptional, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { RIDE_ROLE } from '../constants/enums';

/**
 * Route matching request DTO
 */
export class RouteMatchingRequestDto {
  @IsNumber()
  driverOriginLat: number;

  @IsNumber()
  driverOriginLng: number;

  @IsNumber()
  driverDestinationLat: number;

  @IsNumber()
  driverDestinationLng: number;

  @IsNumber()
  passengerOriginLat: number;

  @IsNumber()
  passengerOriginLng: number;

  @IsNumber()
  passengerDestinationLat: number;

  @IsNumber()
  passengerDestinationLng: number;

  @IsString()
  driverTimestamp: string;

  @IsString()
  passengerTimestamp: string;

  @IsNumber()
  driverRating: number;

  @IsOptional()
  @IsString()
  driverPolyline?: string;

  @IsOptional()
  @IsString()
  passengerPolyline?: string;

  @IsOptional()
  @IsEnum(['haversine', 'polyline', 'hybrid'])
  algorithm?: 'haversine' | 'polyline' | 'hybrid';
}

/**
 * Haversine matching result DTO
 */
export class HaversineMatchingResultDto {
  @IsNumber()
  matchScore: number;

  @IsNumber()
  distanceKm: number;

  @IsNumber()
  timeDifferenceMinutes: number;

  @IsNumber()
  destinationDistanceKm: number;

  @IsNumber()
  driverRating: number;

  @IsNumber()
  executionTimeMs: number;

  @IsString()
  computationalComplexity: string;
}

/**
 * Polyline matching result DTO
 */
export class PolylineMatchingResultDto {
  @IsNumber()
  similarityScore: number;

  @IsEnum(['Excellent', 'Good', 'Fair', 'Poor'])
  classification: 'Excellent' | 'Good' | 'Fair' | 'Poor';

  @IsNumber()
  overlapPercentage: number;

  @IsNumber()
  driverDetour: number;

  @IsNumber()
  passengerDetour: number;

  @IsNumber()
  sharedDistance: number;

  @IsNumber()
  totalDriverDistance: number;

  @IsNumber()
  totalPassengerDistance: number;

  @IsNumber()
  executionTimeMs: number;

  @IsString()
  computationalComplexity: string;

  @IsString()
  memoryUsage: string;
}

/**
 * Comparison metrics DTO
 */
export class ComparisonMetricsDto {
  matchAccuracy: {
    haversine: number;
    polyline: number;
    winner: 'Haversine' | 'Polyline' | 'Tie';
    improvement: number;
  };

  routeSimilarity: {
    haversine: number;
    polyline: number;
    winner: 'Haversine' | 'Polyline' | 'Tie';
    improvement: number;
  };

  driverDetour: {
    haversine: number;
    polyline: number;
    winner: 'Haversine' | 'Polyline' | 'Tie';
    reduction: number;
  };

  executionTime: {
    haversine: number;
    polyline: number;
    winner: 'Haversine' | 'Polyline' | 'Tie';
    slowdown: number;
  };

  computationalComplexity: {
    haversine: string;
    polyline: string;
    winner: 'Haversine' | 'Polyline' | 'Tie';
  };
}

/**
 * Comparison result DTO
 */
export class ComparisonResultDto {
  @ValidateNested()
  haversine: HaversineMatchingResultDto;

  @ValidateNested()
  polyline: PolylineMatchingResultDto;

  @ValidateNested()
  comparison: ComparisonMetricsDto;

  @IsString()
  recommendation: string;

  @IsString()
  analysis: string;
}

/**
 * Enhanced match score parameters with route similarity
 */
export class EnhancedMatchScoreParams {
  @IsNumber()
  distanceKm: number;

  @IsNumber()
  timeDifferenceMinutes: number;

  @IsNumber()
  routeSimilarityScore: number; // Replaces destinationDistanceKm

  @IsNumber()
  driverRating: number;

  @IsOptional()
  @IsNumber()
  driverDetour?: number;

  @IsOptional()
  @IsNumber()
  passengerDetour?: number;
}

/**
 * Matched ride with enhanced scoring
 */
export class EnhancedMatchedRideDto {
  @IsNumber()
  rideId: number;

  @IsString()
  from: string;

  @IsString()
  to: string;

  @IsString()
  message: string;

  @IsEnum(RIDE_ROLE)
  role: RIDE_ROLE;

  @IsString()
  timestamp: string;

  @IsNumber()
  matchScore: number;

  @IsNumber()
  routeSimilarityScore: number;

  @IsEnum(['Excellent', 'Good', 'Fair', 'Poor'])
  routeClassification: 'Excellent' | 'Good' | 'Fair' | 'Poor';

  @IsNumber()
  distanceKm: number;

  @IsNumber()
  timeDifferenceMinutes: number;

  @IsOptional()
  @IsNumber()
  driverDetour?: number;

  @IsOptional()
  @IsNumber()
  passengerDetour?: number;

  @IsNumber()
  driverRating: number;

  @IsString()
  algorithm: 'haversine' | 'polyline' | 'hybrid';

  @IsNumber()
  executionTimeMs: number;
}

/**
 * Batch comparison request DTO
 */
export class BatchComparisonRequestDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RouteMatchingRequestDto)
  testCases: RouteMatchingRequestDto[];
}

/**
 * Batch comparison result DTO
 */
export class BatchComparisonResultDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ComparisonResultDto)
  results: ComparisonResultDto[];

  aggregateStats: {
    totalTests: number;
    polylineWins: number;
    haversineWins: number;
    ties: number;
    averageExecutionTime: {
      polyline: number;
      haversine: number;
      ratio: number;
    };
    averageSimilarity: {
      polyline: number;
      haversine: number;
      difference: number;
    };
  };
}
