/**
 * Google Directions API Service
 * Handles route requests and polyline retrieval from Google Maps Directions API
 * 
 * @see https://developers.google.com/maps/documentation/directions
 */

import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_NEST_PROVIDER, WinstonLogger } from 'nest-winston';

import { LatLng } from '../utils/polyline.util';

export interface DirectionsRequest {
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  departureTime?: Date;
  mode?: 'driving' | 'walking' | 'bicycling' | 'transit';
}

export interface DirectionsResponse {
  polyline: string;
  distance: number; // in meters
  duration: number; // in seconds
  decodedPath: LatLng[];
  steps: RouteStep[];
}

export interface RouteStep {
  instruction: string;
  distance: number;
  duration: number;
  polyline: string;
  startLocation: LatLng;
  endLocation: LatLng;
}

export interface RouteSimilarityResult {
  similarityScore: number; // 0-100
  classification: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  overlapPercentage: number;
  driverDetour: number; // in km
  passengerDetour: number; // in km
  sharedDistance: number; // in km
  totalDriverDistance: number; // in km
  totalPassengerDistance: number; // in km
}

@Injectable()
export class GoogleDirectionsService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://maps.googleapis.com/maps/api/directions/json';

  constructor(
    private readonly configService: ConfigService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: WinstonLogger,
  ) {
    this.apiKey = this.configService.get<string>('GOOGLE_MAPS_API_KEY') || '';
    if (!this.apiKey) {
      this.logger.warn('Google Maps API Key not configured. Route matching will fall back to Haversine.');
    }
  }

  /**
   * Gets directions between two points using Google Directions API
   * 
   * @param request Directions request parameters
   * @returns Directions response with polyline and route information
   */
  async getDirections(request: DirectionsRequest): Promise<DirectionsResponse> {
    if (!this.apiKey) {
      throw new Error('Google Maps API Key not configured');
    }

    const { origin, destination, departureTime, mode = 'driving' } = request;

    const params = new URLSearchParams({
      origin: `${origin.lat},${origin.lng}`,
      destination: `${destination.lat},${destination.lng}`,
      mode,
      key: this.apiKey,
      departure_time: departureTime ? Math.floor(departureTime.getTime() / 1000).toString() : 'now',
      alternatives: 'false',
      optimize: 'false',
    });

    try {
      const response = await fetch(`${this.baseUrl}?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        this.logger.error('Google Directions API error', {
          status: response.status,
          error: errorData,
        });
        throw new Error(`Google Directions API error: ${errorData.error_message || response.statusText}`);
      }

      const data = await response.json();

      if (data.status !== 'OK' || !data.routes || data.routes.length === 0) {
        this.logger.warn('No routes found', { request });
        throw new Error('No routes found for the given origin and destination');
      }

      const route = data.routes[0];
      const leg = route.legs[0];

      return {
        polyline: route.overview_polyline.points,
        distance: leg.distance.value,
        duration: leg.duration.value,
        decodedPath: this.decodePolyline(route.overview_polyline.points),
        steps: leg.steps.map((step: any) => ({
          instruction: step.html_instructions.replace(/<[^>]*>/g, ''),
          distance: step.distance.value,
          duration: step.duration.value,
          polyline: step.polyline.points,
          startLocation: {
            lat: step.start_location.lat,
            lng: step.start_location.lng,
          },
          endLocation: {
            lat: step.end_location.lat,
            lng: step.end_location.lng,
          },
        })),
      };
    } catch (error) {
      this.logger.error('Failed to fetch directions', { error, request });
      throw error;
    }
  }

  /**
   * Batch fetch directions for multiple routes
   * 
   * @param requests Array of direction requests
   * @returns Array of direction responses
   */
  async getBatchDirections(requests: DirectionsRequest[]): Promise<DirectionsResponse[]> {
    const results = await Promise.allSettled(
      requests.map((request) => this.getDirections(request))
    );

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        this.logger.error(`Failed to fetch directions for request ${index}`, {
          error: result.reason,
        });
        throw result.reason;
      }
    });
  }

  /**
   * Decodes a polyline string into LatLng coordinates
   * 
   * @param encoded Encoded polyline string
   * @returns Array of LatLng coordinates
   */
  private decodePolyline(encoded: string): LatLng[] {
    const points: LatLng[] = [];
    let index = 0;
    let lat = 0;
    let lng = 0;

    while (index < encoded.length) {
      let shift = 0;
      let result = 0;
      let byte: number;

      do {
        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);

      const deltaLat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
      lat += deltaLat;

      shift = 0;
      result = 0;

      do {
        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);

      const deltaLng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
      lng += deltaLng;

      points.push({ lat: lat / 1e5, lng: lng / 1e5 });
    }

    return points;
  }

  /**
   * Checks if the service is available (API key configured)
   */
  isAvailable(): boolean {
    return !!this.apiKey;
  }
}
