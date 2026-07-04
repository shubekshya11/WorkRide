/**
 * Hybrid Route Matching Service
 *
 * Stage 1 — Haversine proximity filter (handled upstream) + weighted Haversine score for all candidates.
 * Stage 2 — Polyline route similarity for the top N candidates only, then enhanced re-scoring.
 */

import { Injectable, Inject } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER, WinstonLogger } from 'nest-winston';
import { Ride, User } from 'generated/prisma';

import { RIDE_ROLE } from '../constants/enums';
import {
  calculateMatchScore,
  calculateEnhancedMatchScore,
  calculateTimeDifferenceMinutes,
  haversineDistance,
} from '../utils/rideStats.util';
import { calculateDetourPenalty } from '../utils/detour.util';
import {
  RouteMatchingParams,
  RouteMatchingService,
} from './route-matching.service';

export const HYBRID_TOP_CANDIDATES = 5;

export type MatchingAlgorithm = 'haversine' | 'polyline' | 'hybrid';

export interface RideMatchContext {
  fromLat: number;
  fromLng: number;
  toLat: number | null;
  toLng: number | null;
  timestamp: string;
  role: RIDE_ROLE;
  algorithm: MatchingAlgorithm;
}

type RideWithRelations = Ride & {
  rider: User | null;
  passengers: User[];
  createdByUser: User;
  estimatedTimeOfArrival?: number | null;
  distance?: number | null;
};

export interface ScoredRideResult extends RideWithRelations {
  matchScore: number;
  routeSimilarityScore: number;
  routeClassification: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  driverDetour: number;
  passengerDetour: number;
  detourPenalty: number;
  distanceKm: number;
  timeDifferenceMinutes: number;
  algorithm: MatchingAlgorithm | 'haversine-fallback';
}

interface PreliminaryCandidate {
  ride: RideWithRelations;
  distanceKm: number;
  timeDifferenceMinutes: number;
  destinationDistanceKm: number;
  driverRating: number;
  haversineScore: number;
}

@Injectable()
export class HybridMatchingService {
  constructor(
    private readonly routeMatchingService: RouteMatchingService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: WinstonLogger,
  ) {}

  async scoreCandidates(
    candidates: RideWithRelations[],
    context: RideMatchContext,
  ): Promise<ScoredRideResult[]> {
    const preliminary = candidates.map((ride) =>
      this.buildPreliminaryCandidate(ride, context),
    );

    if (context.algorithm === 'haversine') {
      return preliminary
        .map((candidate) => this.toHaversineResult(candidate))
        .sort((a, b) => b.matchScore - a.matchScore);
    }

    const polylineTargetIds = this.selectPolylineTargets(
      preliminary,
      context.algorithm,
    );

    const scored = await Promise.all(
      preliminary.map((candidate) =>
        this.scoreCandidate(candidate, context, polylineTargetIds),
      ),
    );

    return scored.sort((a, b) => b.matchScore - a.matchScore);
  }

  private buildPreliminaryCandidate(
    ride: RideWithRelations,
    context: RideMatchContext,
  ): PreliminaryCandidate {
    const distanceKm = ride.distance ?? 0;
    const timeDifferenceMinutes = calculateTimeDifferenceMinutes(
      context.timestamp,
      ride.timestamp.toISOString(),
    );

    let destinationDistanceKm = 0;
    if (
      context.toLat !== null &&
      context.toLng !== null &&
      Number.isFinite(ride.toLat) &&
      Number.isFinite(ride.toLng)
    ) {
      destinationDistanceKm = haversineDistance(
        context.toLat,
        context.toLng,
        ride.toLat as number,
        ride.toLng as number,
      );
    }

    const driverRating = this.getDriverRating(ride, context.role);
    const haversineScore = calculateMatchScore({
      distanceKm,
      timeDifferenceMinutes,
      destinationDistanceKm,
      driverRating,
    });

    return {
      ride,
      distanceKm,
      timeDifferenceMinutes,
      destinationDistanceKm,
      driverRating,
      haversineScore,
    };
  }

  private selectPolylineTargets(
    preliminary: PreliminaryCandidate[],
    algorithm: MatchingAlgorithm,
  ): Set<number> {
    if (algorithm === 'polyline') {
      return new Set(preliminary.map((candidate) => candidate.ride.id));
    }

    const topCandidates = [...preliminary]
      .sort((a, b) => b.haversineScore - a.haversineScore)
      .slice(0, HYBRID_TOP_CANDIDATES);

    return new Set(topCandidates.map((candidate) => candidate.ride.id));
  }

  private async scoreCandidate(
    candidate: PreliminaryCandidate,
    context: RideMatchContext,
    polylineTargetIds: Set<number>,
  ): Promise<ScoredRideResult> {
    const baseResult = {
      ...candidate.ride,
      distanceKm: candidate.distanceKm,
      timeDifferenceMinutes: candidate.timeDifferenceMinutes,
      routeSimilarityScore: 0,
      routeClassification: 'Fair' as const,
      driverDetour: 0,
      passengerDetour: 0,
      detourPenalty: 0,
    };

    if (!polylineTargetIds.has(candidate.ride.id)) {
      return {
        ...baseResult,
        matchScore: candidate.haversineScore,
        algorithm: 'haversine',
      };
    }

    if (
      context.toLat === null ||
      context.toLng === null ||
      !Number.isFinite(candidate.ride.toLat) ||
      !Number.isFinite(candidate.ride.toLng)
    ) {
      return {
        ...baseResult,
        matchScore: candidate.haversineScore,
        algorithm: 'haversine',
      };
    }

    try {
      const routeParams = this.buildRouteParams(context, candidate.ride);
      const routeSimilarity =
        await this.routeMatchingService.calculateRouteSimilarity(routeParams);
      const detourPenalty = calculateDetourPenalty(
        routeSimilarity.driverDetour,
        routeSimilarity.passengerDetour,
      );
      const matchScore = calculateEnhancedMatchScore({
        distanceKm: candidate.distanceKm,
        timeDifferenceMinutes: candidate.timeDifferenceMinutes,
        routeSimilarityScore: routeSimilarity.similarityScore,
        driverRating: candidate.driverRating,
        driverDetour: routeSimilarity.driverDetour,
        passengerDetour: routeSimilarity.passengerDetour,
      });

      return {
        ...baseResult,
        matchScore,
        routeSimilarityScore: routeSimilarity.similarityScore,
        routeClassification: routeSimilarity.classification,
        driverDetour: routeSimilarity.driverDetour,
        passengerDetour: routeSimilarity.passengerDetour,
        detourPenalty,
        algorithm: context.algorithm,
      };
    } catch (error) {
      this.logger.log({
        level: 'warn',
        message: 'OSRM route matching failed, falling back to Haversine score',
        tag: 'hybrid-matching',
        rideId: candidate.ride.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      return {
        ...baseResult,
        matchScore: candidate.haversineScore,
        algorithm: 'haversine-fallback',
      };
    }
  }

  private toHaversineResult(candidate: PreliminaryCandidate): ScoredRideResult {
    return {
      ...candidate.ride,
      matchScore: candidate.haversineScore,
      routeSimilarityScore: 0,
      routeClassification: 'Fair',
      driverDetour: 0,
      passengerDetour: 0,
      detourPenalty: 0,
      distanceKm: candidate.distanceKm,
      timeDifferenceMinutes: candidate.timeDifferenceMinutes,
      algorithm: 'haversine',
    };
  }

  private buildRouteParams(
    context: RideMatchContext,
    ride: RideWithRelations,
  ): RouteMatchingParams {
    const userOrigin = { lat: context.fromLat, lng: context.fromLng };
    const userDestination = {
      lat: context.toLat as number,
      lng: context.toLng as number,
    };
    const rideOrigin = {
      lat: ride.fromLat as number,
      lng: ride.fromLng as number,
    };
    const rideDestination = {
      lat: ride.toLat as number,
      lng: ride.toLng as number,
    };

    if (context.role === RIDE_ROLE.RIDER) {
      return {
        driverOrigin: userOrigin,
        driverDestination: userDestination,
        passengerOrigin: rideOrigin,
        passengerDestination: rideDestination,
      };
    }

    return {
      driverOrigin: rideOrigin,
      driverDestination: rideDestination,
      passengerOrigin: userOrigin,
      passengerDestination: userDestination,
    };
  }

  private getDriverRating(ride: RideWithRelations, searchingRole: RIDE_ROLE): number {
    const driverUser =
      searchingRole === RIDE_ROLE.RIDER ? null : ride.rider ?? ride.createdByUser;
    const rating = driverUser?.ratings;

    if (typeof rating === 'number' && rating > 0) {
      return rating;
    }

    return 3;
  }
}
