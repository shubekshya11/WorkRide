/**
 * Route Matching Service
 * Fetches route polylines from OSRM and delegates overlap/similarity math to utility modules.
 */

import { Injectable, Inject } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER, WinstonLogger } from 'nest-winston';

import { LatLng, decodePolyline } from '../utils/polyline.util';
import {
  calculatePolylineSimilarity,
  PolylineSimilarityResult,
} from '../utils/polyline-matching.util';
import { OsrmRoutingService } from './osrm-routing.service';

export interface RouteMatchingParams {
  driverOrigin: { lat: number; lng: number };
  driverDestination: { lat: number; lng: number };
  passengerOrigin: { lat: number; lng: number };
  passengerDestination: { lat: number; lng: number };
  driverPolyline?: string;
  passengerPolyline?: string;
}

export interface RouteSimilarityResult extends PolylineSimilarityResult {}

export interface MatchingMetrics {
  executionTimeMs: number;
  computationalComplexity: string;
  memoryUsage: string;
}

@Injectable()
export class RouteMatchingService {
  constructor(
    private readonly osrmRoutingService: OsrmRoutingService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: WinstonLogger,
  ) {}

  async calculateRouteSimilarity(
    params: RouteMatchingParams,
  ): Promise<RouteSimilarityResult & { metrics: MatchingMetrics }> {
    const startTime = performance.now();

    let driverPath: LatLng[];
    let passengerPath: LatLng[];

    if (params.driverPolyline && params.passengerPolyline) {
      driverPath = decodePolyline(params.driverPolyline);
      passengerPath = decodePolyline(params.passengerPolyline);
    } else if (this.osrmRoutingService.isAvailable()) {
      const [driverRoute, passengerRoute] =
        await this.osrmRoutingService.getBatchDirections([
          {
            origin: params.driverOrigin,
            destination: params.driverDestination,
          },
          {
            origin: params.passengerOrigin,
            destination: params.passengerDestination,
          },
        ]);

      driverPath = driverRoute.decodedPath;
      passengerPath = passengerRoute.decodedPath;
    } else {
      throw new Error('No polylines provided and OSRM routing is not available');
    }

    const similarity = calculatePolylineSimilarity(
      driverPath,
      passengerPath,
      params.driverOrigin,
      params.driverDestination,
      params.passengerOrigin,
      params.passengerDestination,
    );

    const executionTimeMs = performance.now() - startTime;

    this.logger.log({
      level: 'info',
      message: 'Route similarity calculated',
      tag: 'route-matching',
      similarityScore: similarity.similarityScore,
      classification: similarity.classification,
      overlapPercentage: similarity.overlapPercentage,
      driverDetour: similarity.driverDetour,
      passengerDetour: similarity.passengerDetour,
      executionTimeMs,
    });

    return {
      ...similarity,
      metrics: {
        executionTimeMs,
        computationalComplexity: this.estimateComplexity(
          driverPath.length,
          passengerPath.length,
        ),
        memoryUsage: this.estimateMemoryUsage(
          driverPath.length,
          passengerPath.length,
        ),
      },
    };
  }

  private estimateComplexity(path1Length: number, path2Length: number): string {
    const n = path1Length * path2Length;
    if (n < 1000) return 'O(n) - Low';
    if (n < 10000) return 'O(n²) - Medium';
    return 'O(n²) - High';
  }

  private estimateMemoryUsage(path1Length: number, path2Length: number): string {
    const totalPoints = path1Length + path2Length;
    const estimatedBytes = totalPoints * 32;
    if (estimatedBytes < 1024) return `${estimatedBytes} B`;
    if (estimatedBytes < 1024 * 1024) {
      return `${(estimatedBytes / 1024).toFixed(2)} KB`;
    }
    return `${(estimatedBytes / (1024 * 1024)).toFixed(2)} MB`;
  }
}
