/**
 * Route Matching Service
 * Compares routes using polyline-based matching algorithm
 * Calculates route similarity, overlap, and detour metrics
 */

import { Injectable, Inject } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER, WinstonLogger } from 'nest-winston';

import { LatLng, decodePolyline, calculatePolylineDistance, simplifyPolyline } from '../utils/polyline.util';
import { GoogleDirectionsService, DirectionsResponse, RouteSimilarityResult } from './google-directions.service';

export interface RouteMatchingParams {
  driverOrigin: { lat: number; lng: number };
  driverDestination: { lat: number; lng: number };
  passengerOrigin: { lat: number; lng: number };
  passengerDestination: { lat: number; lng: number };
  driverPolyline?: string;
  passengerPolyline?: string;
}

export interface RouteOverlapSegment {
  start: LatLng;
  end: LatLng;
  distance: number;
}

export interface MatchingMetrics {
  executionTimeMs: number;
  computationalComplexity: string;
  memoryUsage: string;
}

@Injectable()
export class RouteMatchingService {
  private readonly PROXIMITY_THRESHOLD_KM = 0.05; // 50 meters for point proximity
  private readonly OVERLAP_THRESHOLD_KM = 0.1; // 100 meters for segment overlap

  constructor(
    private readonly googleDirectionsService: GoogleDirectionsService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: WinstonLogger,
  ) {}

  /**
   * Calculates route similarity between driver and passenger routes
   * 
   * @param params Route matching parameters
   * @returns Route similarity result with detailed metrics
   */
  async calculateRouteSimilarity(
    params: RouteMatchingParams,
  ): Promise<RouteSimilarityResult & { metrics: MatchingMetrics }> {
    const startTime = performance.now();

    let driverPath: LatLng[];
    let passengerPath: LatLng[];

    // Use provided polylines or fetch from Google Directions API
    if (params.driverPolyline && params.passengerPolyline) {
      driverPath = decodePolyline(params.driverPolyline);
      passengerPath = decodePolyline(params.passengerPolyline);
    } else if (this.googleDirectionsService.isAvailable()) {
      const [driverRoute, passengerRoute] = await this.googleDirectionsService.getBatchDirections([
        {
          origin: params.driverOrigin,
          destination: params.driverDestination,
          mode: 'driving',
        },
        {
          origin: params.passengerOrigin,
          destination: params.passengerDestination,
          mode: 'driving',
        },
      ]);

      driverPath = driverRoute.decodedPath;
      passengerPath = passengerRoute.decodedPath;
    } else {
      throw new Error('No polylines provided and Google Directions API not available');
    }

    // Simplify polylines to reduce computational complexity
    const simplifiedDriverPath = simplifyPolyline(driverPath, 0.001);
    const simplifiedPassengerPath = simplifyPolyline(passengerPath, 0.001);

    // Calculate total distances
    const totalDriverDistance = calculatePolylineDistance(simplifiedDriverPath);
    const totalPassengerDistance = calculatePolylineDistance(simplifiedPassengerPath);

    // Find overlapping segments
    const overlapSegments = this.findOverlappingSegments(
      simplifiedDriverPath,
      simplifiedPassengerPath,
    );

    // Calculate shared distance
    const sharedDistance = overlapSegments.reduce((sum, seg) => sum + seg.distance, 0);

    // Calculate overlap percentage
    const overlapPercentage = (sharedDistance / Math.max(totalDriverDistance, totalPassengerDistance)) * 100;

    // Calculate detours
    const driverDetour = this.calculateDetour(
      simplifiedDriverPath,
      params.driverOrigin,
      params.driverDestination,
      params.passengerOrigin,
      params.passengerDestination,
    );

    const passengerDetour = this.calculateDetour(
      simplifiedPassengerPath,
      params.passengerOrigin,
      params.passengerDestination,
      params.driverOrigin,
      params.driverDestination,
    );

    // Calculate similarity score (0-100)
    const similarityScore = this.calculateSimilarityScore(
      overlapPercentage,
      driverDetour,
      passengerDetour,
      totalDriverDistance,
      totalPassengerDistance,
    );

    // Classify similarity
    const classification = this.classifySimilarity(similarityScore);

    const executionTimeMs = performance.now() - startTime;

    this.logger.info('Route similarity calculated', {
      similarityScore,
      classification,
      overlapPercentage,
      driverDetour,
      passengerDetour,
      executionTimeMs,
    });

    return {
      similarityScore,
      classification,
      overlapPercentage,
      driverDetour,
      passengerDetour,
      sharedDistance,
      totalDriverDistance,
      totalPassengerDistance,
      metrics: {
        executionTimeMs,
        computationalComplexity: this.estimateComplexity(
          simplifiedDriverPath.length,
          simplifiedPassengerPath.length,
        ),
        memoryUsage: this.estimateMemoryUsage(
          simplifiedDriverPath.length,
          simplifiedPassengerPath.length,
        ),
      },
    };
  }

  /**
   * Finds overlapping segments between two polylines
   * Uses spatial proximity to identify shared route segments
   */
  private findOverlappingSegments(
    path1: LatLng[],
    path2: LatLng[],
  ): RouteOverlapSegment[] {
    const overlaps: RouteOverlapSegment[] = [];

    for (let i = 0; i < path1.length - 1; i++) {
      const segment1 = { start: path1[i], end: path1[i + 1] };

      for (let j = 0; j < path2.length - 1; j++) {
        const segment2 = { start: path2[j], end: path2[j + 1] };

        const overlap = this.calculateSegmentOverlap(segment1, segment2);
        if (overlap.distance > this.OVERLAP_THRESHOLD_KM) {
          overlaps.push(overlap);
        }
      }
    }

    return overlaps;
  }

  /**
   * Calculates overlap between two line segments
   * Returns the overlapping segment and its distance
   */
  private calculateSegmentOverlap(
    segment1: { start: LatLng; end: LatLng },
    segment2: { start: LatLng; end: LatLng },
  ): RouteOverlapSegment {
    // Check if segments are close enough to be considered overlapping
    const midPoint1 = {
      lat: (segment1.start.lat + segment1.end.lat) / 2,
      lng: (segment1.start.lng + segment1.end.lng) / 2,
    };
    const midPoint2 = {
      lat: (segment2.start.lat + segment2.end.lat) / 2,
      lng: (segment2.start.lng + segment2.end.lng) / 2,
    };

    const distance = this.haversineDistance(midPoint1.lat, midPoint1.lng, midPoint2.lat, midPoint2.lng);

    if (distance > this.PROXIMITY_THRESHOLD_KM) {
      return { start: segment1.start, end: segment1.end, distance: 0 };
    }

    // Calculate segment length
    const segmentLength = this.haversineDistance(
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

  /**
   * Calculates the detour distance for a route when including an additional stop
   */
  private calculateDetour(
    routePath: LatLng[],
    originalOrigin: LatLng,
    originalDestination: LatLng,
    additionalOrigin: LatLng,
    additionalDestination: LatLng,
  ): number {
    const originalDistance = this.haversineDistance(
      originalOrigin.lat,
      originalOrigin.lng,
      originalDestination.lat,
      originalDestination.lng,
    );

    const actualDistance = calculatePolylineDistance(routePath);

    return Math.max(0, actualDistance - originalDistance);
  }

  /**
   * Calculates the overall similarity score (0-100)
   * Based on overlap percentage, detour distances, and route lengths
   */
  private calculateSimilarityScore(
    overlapPercentage: number,
    driverDetour: number,
    passengerDetour: number,
    totalDriverDistance: number,
    totalPassengerDistance: number,
  ): number {
    // Overlap score (weight: 0.5)
    const overlapScore = Math.min(100, overlapPercentage * 2);

    // Detour penalty (weight: 0.3)
    const maxAcceptableDetour = Math.max(totalDriverDistance, totalPassengerDistance) * 0.3; // 30% of route
    const avgDetour = (driverDetour + passengerDetour) / 2;
    const detourScore = Math.max(0, 100 - (avgDetour / maxAcceptableDetour) * 100);

    // Route length compatibility (weight: 0.2)
    const lengthRatio = Math.min(totalDriverDistance, totalPassengerDistance) / 
                       Math.max(totalDriverDistance, totalPassengerDistance);
    const lengthScore = lengthRatio * 100;

    // Weighted final score
    const finalScore =
      overlapScore * 0.5 +
      detourScore * 0.3 +
      lengthScore * 0.2;

    return Math.round(finalScore * 100) / 100;
  }

  /**
   * Classifies similarity score into categories
   */
  private classifySimilarity(score: number): 'Excellent' | 'Good' | 'Fair' | 'Poor' {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  }

  /**
   * Estimates computational complexity based on path lengths
   */
  private estimateComplexity(path1Length: number, path2Length: number): string {
    const n = path1Length * path2Length;
    if (n < 1000) return 'O(n) - Low';
    if (n < 10000) return 'O(n²) - Medium';
    return 'O(n²) - High';
  }

  /**
   * Estimates memory usage based on path lengths
   */
  private estimateMemoryUsage(path1Length: number, path2Length: number): string {
    const totalPoints = path1Length + path2Length;
    const estimatedBytes = totalPoints * 32; // 32 bytes per LatLng point
    if (estimatedBytes < 1024) return `${estimatedBytes} B`;
    if (estimatedBytes < 1024 * 1024) return `${(estimatedBytes / 1024).toFixed(2)} KB`;
    return `${(estimatedBytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  /**
   * Haversine distance calculation
   */
  private haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}
