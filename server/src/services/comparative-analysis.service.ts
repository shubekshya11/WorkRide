/**
 * Comparative Analysis Service
 * Compares Haversine-based matching with Polyline-based matching algorithms
 * Generates metrics for accuracy, similarity, detour, execution time, and complexity
 */

import { Injectable, Inject } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER, WinstonLogger } from 'nest-winston';

import { haversineDistance, calculateMatchScore } from '../utils/rideStats.util';
import { RouteMatchingService, RouteMatchingParams, MatchingMetrics } from './route-matching.service';

export interface HaversineMatchingResult {
  matchScore: number;
  distanceKm: number;
  timeDifferenceMinutes: number;
  destinationDistanceKm: number;
  driverRating: number;
  executionTimeMs: number;
  computationalComplexity: string;
}

export interface PolylineMatchingResult {
  similarityScore: number;
  classification: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  overlapPercentage: number;
  driverDetour: number;
  passengerDetour: number;
  sharedDistance: number;
  totalDriverDistance: number;
  totalPassengerDistance: number;
  executionTimeMs: number;
  computationalComplexity: string;
  memoryUsage: string;
}

export interface ComparisonResult {
  haversine: HaversineMatchingResult;
  polyline: PolylineMatchingResult;
  comparison: {
    matchAccuracy: {
      haversine: number;
      polyline: number;
      winner: 'Haversine' | 'Polyline' | 'Tie';
      improvement: number; // percentage improvement
    };
    routeSimilarity: {
      haversine: number; // derived from destination similarity
      polyline: number;
      winner: 'Haversine' | 'Polyline' | 'Tie';
      improvement: number;
    };
    driverDetour: {
      haversine: number; // estimated
      polyline: number;
      winner: 'Haversine' | 'Polyline' | 'Tie';
      reduction: number; // percentage reduction
    };
    executionTime: {
      haversine: number;
      polyline: number;
      winner: 'Haversine' | 'Polyline' | 'Tie';
      slowdown: number; // percentage slowdown
    };
    computationalComplexity: {
      haversine: string;
      polyline: string;
      winner: 'Haversine' | 'Polyline' | 'Tie';
    };
  };
  recommendation: string;
  analysis: string;
}

export interface ComparisonTestParams {
  driverOrigin: { lat: number; lng: number };
  driverDestination: { lat: number; lng: number };
  passengerOrigin: { lat: number; lng: number };
  passengerDestination: { lat: number; lng: number };
  driverTimestamp: string;
  passengerTimestamp: string;
  driverRating: number;
}

@Injectable()
export class ComparativeAnalysisService {
  constructor(
    private readonly routeMatchingService: RouteMatchingService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: WinstonLogger,
  ) {}

  /**
   * Performs a comparative analysis between Haversine and Polyline matching
   * 
   * @param params Test parameters for both algorithms
   * @returns Detailed comparison result with metrics and recommendations
   */
  async compareAlgorithms(params: ComparisonTestParams): Promise<ComparisonResult> {
    this.logger.log({
      level: 'info',
      message: 'Starting comparative analysis',
      tag: 'comparative-analysis',
      params,
    });

    // Run Haversine matching
    const haversineResult = await this.runHaversineMatching(params);

    // Run Polyline matching
    const polylineResult = await this.runPolylineMatching(params);

    // Generate comparison metrics
    const comparison = this.generateComparison(haversineResult, polylineResult);

    // Generate recommendation
    const recommendation = this.generateRecommendation(comparison);

    // Generate analysis
    const analysis = this.generateAnalysis(comparison);

    this.logger.log({
      level: 'info',
      message: 'Comparative analysis completed',
      tag: 'comparative-analysis',
      comparison,
      recommendation,
    });

    return {
      haversine: haversineResult,
      polyline: polylineResult,
      comparison,
      recommendation,
      analysis,
    };
  }

  /**
   * Runs Haversine-based matching algorithm
   */
  private async runHaversineMatching(params: ComparisonTestParams): Promise<HaversineMatchingResult> {
    const startTime = performance.now();

    // Calculate distances using Haversine
    const distanceKm = haversineDistance(
      params.driverOrigin.lat,
      params.driverOrigin.lng,
      params.passengerOrigin.lat,
      params.passengerOrigin.lng,
    );

    const destinationDistanceKm = haversineDistance(
      params.driverDestination.lat,
      params.driverDestination.lng,
      params.passengerDestination.lat,
      params.passengerDestination.lng,
    );

    // Calculate time difference
    const timeDifferenceMinutes = this.calculateTimeDifferenceMinutes(
      params.driverTimestamp,
      params.passengerTimestamp,
    );

    // Calculate match score using existing weighted algorithm
    const matchScore = calculateMatchScore({
      distanceKm,
      timeDifferenceMinutes,
      destinationDistanceKm,
      driverRating: params.driverRating,
    });

    const executionTimeMs = performance.now() - startTime;

    return {
      matchScore,
      distanceKm,
      timeDifferenceMinutes,
      destinationDistanceKm,
      driverRating: params.driverRating,
      executionTimeMs,
      computationalComplexity: 'O(1) - Constant',
    };
  }

  /**
   * Runs Polyline-based matching algorithm
   */
  private async runPolylineMatching(params: ComparisonTestParams): Promise<PolylineMatchingResult> {
    const result = await this.routeMatchingService.calculateRouteSimilarity({
      driverOrigin: params.driverOrigin,
      driverDestination: params.driverDestination,
      passengerOrigin: params.passengerOrigin,
      passengerDestination: params.passengerDestination,
    });

    return {
      similarityScore: result.similarityScore,
      classification: result.classification,
      overlapPercentage: result.overlapPercentage,
      driverDetour: result.driverDetour,
      passengerDetour: result.passengerDetour,
      sharedDistance: result.sharedDistance,
      totalDriverDistance: result.totalDriverDistance,
      totalPassengerDistance: result.totalPassengerDistance,
      executionTimeMs: result.metrics.executionTimeMs,
      computationalComplexity: result.metrics.computationalComplexity,
      memoryUsage: result.metrics.memoryUsage,
    };
  }

  /**
   * Generates comparison metrics between the two algorithms
   */
  private generateComparison(
    haversine: HaversineMatchingResult,
    polyline: PolylineMatchingResult,
  ): ComparisonResult['comparison'] {
    // Match Accuracy comparison
    const haversineAccuracy = haversine.matchScore;
    const polylineAccuracy = polyline.similarityScore;
    const accuracyWinner = haversineAccuracy > polylineAccuracy ? 'Haversine' : 
                          polylineAccuracy > haversineAccuracy ? 'Polyline' : 'Tie';
    const accuracyImprovement = accuracyWinner === 'Polyline' 
      ? ((polylineAccuracy - haversineAccuracy) / haversineAccuracy) * 100
      : ((haversineAccuracy - polylineAccuracy) / polylineAccuracy) * 100;

    // Route Similarity comparison
    // For Haversine, we use destination similarity as a proxy
    const haversineSimilarity = Math.max(0, 100 - (haversine.destinationDistanceKm / 5) * 100);
    const polylineSimilarity = polyline.overlapPercentage;
    const similarityWinner = haversineSimilarity > polylineSimilarity ? 'Haversine' :
                           polylineSimilarity > haversineSimilarity ? 'Polyline' : 'Tie';
    const similarityImprovement = similarityWinner === 'Polyline'
      ? ((polylineSimilarity - haversineSimilarity) / haversineSimilarity) * 100
      : ((haversineSimilarity - polylineSimilarity) / polylineSimilarity) * 100;

    // Driver Detour comparison
    // For Haversine, estimate detour as destination distance
    const haversineDetour = haversine.destinationDistanceKm;
    const polylineDetour = polyline.driverDetour;
    const detourWinner = haversineDetour < polylineDetour ? 'Haversine' :
                        polylineDetour < haversineDetour ? 'Polyline' : 'Tie';
    const detourReduction = detourWinner === 'Polyline'
      ? ((haversineDetour - polylineDetour) / haversineDetour) * 100
      : ((polylineDetour - haversineDetour) / polylineDetour) * 100;

    // Execution Time comparison
    const timeWinner = haversine.executionTimeMs < polyline.executionTimeMs ? 'Haversine' :
                      polyline.executionTimeMs < haversine.executionTimeMs ? 'Polyline' : 'Tie';
    const timeSlowdown = timeWinner === 'Polyline'
      ? ((haversine.executionTimeMs - polyline.executionTimeMs) / haversine.executionTimeMs) * 100
      : ((polyline.executionTimeMs - haversine.executionTimeMs) / polyline.executionTimeMs) * 100;

    // Computational Complexity comparison
    const complexityWinner = haversine.computationalComplexity.includes('Constant') ? 'Haversine' : 'Polyline';

    return {
      matchAccuracy: {
        haversine: haversineAccuracy,
        polyline: polylineAccuracy,
        winner: accuracyWinner,
        improvement: Math.abs(accuracyImprovement),
      },
      routeSimilarity: {
        haversine: haversineSimilarity,
        polyline: polylineSimilarity,
        winner: similarityWinner,
        improvement: Math.abs(similarityImprovement),
      },
      driverDetour: {
        haversine: haversineDetour,
        polyline: polylineDetour,
        winner: detourWinner,
        reduction: Math.abs(detourReduction),
      },
      executionTime: {
        haversine: haversine.executionTimeMs,
        polyline: polyline.executionTimeMs,
        winner: timeWinner,
        slowdown: Math.abs(timeSlowdown),
      },
      computationalComplexity: {
        haversine: haversine.computationalComplexity,
        polyline: polyline.computationalComplexity,
        winner: complexityWinner,
      },
    };
  }

  /**
   * Generates recommendation based on comparison results
   */
  private generateRecommendation(comparison: ComparisonResult['comparison']): string {
    const polylineWins = [
      comparison.routeSimilarity.winner === 'Polyline',
      comparison.driverDetour.winner === 'Polyline',
    ].filter(Boolean).length;

    const haversineWins = [
      comparison.executionTime.winner === 'Haversine',
      comparison.computationalComplexity.winner === 'Haversine',
    ].filter(Boolean).length;

    if (polylineWins >= 2) {
      return 'Polyline Route Matching is recommended for production use due to superior route similarity and detour accuracy. Use Haversine for initial candidate filtering to reduce API calls and improve performance.';
    } else if (haversineWins >= 2) {
      return 'Haversine-based matching is recommended for scenarios requiring fast matching with acceptable accuracy. Consider Polyline matching for critical routes where accuracy is paramount.';
    } else {
      return 'Both algorithms have comparable performance. Use a hybrid approach: Haversine for fast candidate filtering, followed by Polyline matching for final route similarity assessment.';
    }
  }

  /**
   * Generates detailed analysis text
   */
  private generateAnalysis(comparison: ComparisonResult['comparison']): string {
    return `
Match Accuracy: ${comparison.matchAccuracy.winner} wins with ${comparison.matchAccuracy.improvement.toFixed(1)}% ${comparison.matchAccuracy.winner === 'Polyline' ? 'improvement' : 'advantage'}
Route Similarity: ${comparison.routeSimilarity.winner} wins with ${comparison.routeSimilarity.improvement.toFixed(1)}% ${comparison.routeSimilarity.winner === 'Polyline' ? 'improvement' : 'advantage'}
Driver Detour: ${comparison.driverDetour.winner} wins with ${comparison.driverDetour.reduction.toFixed(1)}% ${comparison.driverDetour.winner === 'Polyline' ? 'reduction' : 'advantage'}
Execution Time: ${comparison.executionTime.winner} is ${comparison.executionTime.slowdown.toFixed(1)}% ${comparison.executionTime.winner === 'Haversine' ? 'faster' : 'slower'}
Computational Complexity: ${comparison.computationalComplexity.winner} has lower complexity (${comparison.computationalComplexity.winner === 'Haversine' ? comparison.computationalComplexity.haversine : comparison.computationalComplexity.polyline})

${comparison.routeSimilarity.winner === 'Polyline' 
  ? 'Polyline matching provides more accurate route similarity assessment by analyzing actual route paths rather than just destination proximity.' 
  : 'Haversine matching provides faster results with acceptable accuracy for most use cases.'}

${comparison.driverDetour.winner === 'Polyline'
  ? 'Polyline matching better estimates actual driver detour by considering the full route path.'
  : 'Haversine matching provides a reasonable detour estimate based on destination distance.'}
    `.trim();
  }

  /**
   * Calculates time difference in minutes between two ISO timestamps
   */
  private calculateTimeDifferenceMinutes(timestamp1: string, timestamp2: string): number {
    const date1 = new Date(timestamp1);
    const date2 = new Date(timestamp2);
    const diffMs = Math.abs(date1.getTime() - date2.getTime());
    return diffMs / (1000 * 60);
  }

  /**
   * Runs a batch of comparative tests
   * 
   * @param testCases Array of test parameters
   * @returns Array of comparison results
   */
  async runBatchComparisons(testCases: ComparisonTestParams[]): Promise<ComparisonResult[]> {
    this.logger.log({
      level: 'info',
      message: 'Running batch comparative analysis',
      tag: 'comparative-analysis',
      testCasesCount: testCases.length,
    });

    const results = await Promise.all(
      testCases.map((params) => this.compareAlgorithms(params))
    );

    // Generate aggregate statistics
    const aggregateStats = this.generateAggregateStatistics(results);

    this.logger.log({
      level: 'info',
      message: 'Batch comparative analysis completed',
      tag: 'comparative-analysis',
      aggregateStats,
    });

    return results;
  }

  /**
   * Generates aggregate statistics from batch comparison results
   */
  private generateAggregateStatistics(results: ComparisonResult[]): any {
    const polylineWins = results.filter((r) => r.comparison.routeSimilarity.winner === 'Polyline').length;
    const haversineWins = results.filter((r) => r.comparison.routeSimilarity.winner === 'Haversine').length;

    const avgPolylineTime = results.reduce((sum, r) => sum + r.polyline.executionTimeMs, 0) / results.length;
    const avgHaversineTime = results.reduce((sum, r) => sum + r.haversine.executionTimeMs, 0) / results.length;

    const avgPolylineSimilarity = results.reduce((sum, r) => sum + r.polyline.similarityScore, 0) / results.length;
    const avgHaversineSimilarity = results.reduce((sum, r) => sum + r.comparison.routeSimilarity.haversine, 0) / results.length;

    return {
      totalTests: results.length,
      polylineWins,
      haversineWins,
      ties: results.length - polylineWins - haversineWins,
      averageExecutionTime: {
        polyline: avgPolylineTime,
        haversine: avgHaversineTime,
        ratio: avgPolylineTime / avgHaversineTime,
      },
      averageSimilarity: {
        polyline: avgPolylineSimilarity,
        haversine: avgHaversineSimilarity,
        difference: avgPolylineSimilarity - avgHaversineSimilarity,
      },
    };
  }
}
