/**
 * OSRM (OpenStreetMap) routing service.
 * Fetches route geometry from a public or self-hosted OSRM instance.
 *
 * @see https://project-osrm.org/docs/v5.24.0/api/
 */

import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_NEST_PROVIDER, WinstonLogger } from 'nest-winston';

import { LatLng, decodePolyline } from '../utils/polyline.util';

export interface RoutingRequest {
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  profile?: 'bike' | 'car' | 'foot';
}

export interface RouteStep {
  instruction: string;
  distance: number;
  duration: number;
  polyline: string;
  startLocation: LatLng;
  endLocation: LatLng;
}

export interface RoutingResponse {
  polyline: string;
  distance: number;
  duration: number;
  decodedPath: LatLng[];
  steps: RouteStep[];
}

const DEFAULT_OSRM_BASE_URL = 'https://router.project-osrm.org';
const DEFAULT_OSRM_PROFILE = 'bike';

@Injectable()
export class OsrmRoutingService {
  private readonly baseUrl: string;
  private readonly profile: string;

  constructor(
    private readonly configService: ConfigService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: WinstonLogger,
  ) {
    this.baseUrl = (
      this.configService.get<string>('OSRM_BASE_URL') || DEFAULT_OSRM_BASE_URL
    ).replace(/\/$/, '');
    this.profile =
      this.configService.get<string>('OSRM_PROFILE') || DEFAULT_OSRM_PROFILE;
  }

  isAvailable(): boolean {
    return !!this.baseUrl;
  }

  async getDirections(request: RoutingRequest): Promise<RoutingResponse> {
    const profile = request.profile ?? this.profile;
    const coordinates = `${request.origin.lng},${request.origin.lat};${request.destination.lng},${request.destination.lat}`;
    const params = new URLSearchParams({
      overview: 'full',
      geometries: 'polyline',
      steps: 'true',
    });

    const url = `${this.baseUrl}/route/v1/${profile}/${coordinates}?${params}`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.log({
          level: 'error',
          message: 'OSRM routing request failed',
          tag: 'osrm-routing',
          status: response.status,
          error: errorText,
        });
        throw new Error(`OSRM routing HTTP ${response.status}`);
      }

      const data = (await response.json()) as {
        code: string;
        message?: string;
        routes?: Array<{
          geometry: string;
          distance: number;
          duration: number;
          legs: Array<{
            distance: number;
            duration: number;
            steps: Array<{
              geometry: string;
              distance: number;
              duration: number;
              name: string;
              maneuver: { location: [number, number] };
            }>;
          }>;
        }>;
      };

      if (data.code !== 'Ok' || !data.routes?.length) {
        this.logger.log({
          level: 'warn',
          message: 'OSRM returned no routes',
          tag: 'osrm-routing',
          code: data.code,
          osrmMessage: data.message,
        });
        throw new Error(data.message || 'No route found from OSRM');
      }

      const route = data.routes[0];
      const leg = route.legs[0];

      return {
        polyline: route.geometry,
        distance: route.distance,
        duration: route.duration,
        decodedPath: decodePolyline(route.geometry),
        steps: leg.steps.map((step) => ({
          instruction: step.name || 'Continue',
          distance: step.distance,
          duration: step.duration,
          polyline: step.geometry,
          startLocation: {
            lng: step.maneuver.location[0],
            lat: step.maneuver.location[1],
          },
          endLocation: {
            lng: step.maneuver.location[0],
            lat: step.maneuver.location[1],
          },
        })),
      };
    } catch (error) {
      this.logger.log({
        level: 'error',
        message: 'Failed to fetch OSRM directions',
        tag: 'osrm-routing',
        error: error instanceof Error ? error.message : String(error),
        request,
      });
      throw error;
    }
  }

  async getBatchDirections(
    requests: RoutingRequest[],
  ): Promise<RoutingResponse[]> {
    const results = await Promise.allSettled(
      requests.map((request) => this.getDirections(request)),
    );

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      }

      this.logger.log({
        level: 'error',
        message: `Failed to fetch OSRM directions for request ${index}`,
        tag: 'osrm-routing',
        error:
          result.reason instanceof Error
            ? result.reason.message
            : String(result.reason),
      });
      throw result.reason;
    });
  }
}
