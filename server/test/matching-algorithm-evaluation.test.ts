/**
 * Synthetic test dataset for evaluating ride matching algorithms
 * 
 * Contains 40 labeled ride pairs with ground truth labels (Match/No-Match)
 * Based on realistic scenarios in Kathmandu, Nepal area
 */

import {
  calculateMatchScore,
  calculateEnhancedMatchScore,
  calculateDistanceScore,
  calculateTimeCompatibilityScore,
  calculateDestinationSimilarityScore,
  ratingToScore,
} from '../src/utils/rideStats.util';
import { calculatePolylineSimilarity as calcPolylineSimilarity } from '../src/utils/polyline-matching.util';

export interface RidePair {
  id: string;
  driver: {
    origin: { lat: number; lng: number };
    destination: { lat: number; lng: number };
    departureTime: string;
    rating: number;
    polyline?: { lat: number; lng: number }[];
  };
  passenger: {
    origin: { lat: number; lng: number };
    destination: { lat: number; lng: number };
    departureTime: string;
    rating: number;
    polyline?: { lat: number; lng: number }[];
  };
  groundTruth: 'Match' | 'No-Match';
  reason: string;
}

/**
 * Synthetic ride pairs with ground truth labels
 * Coordinates are based on Kathmandu, Nepal area
 */
export const TEST_RIDE_PAIRS: RidePair[] = [
  // === PERFECT MATCHES (10 pairs) ===
  {
    id: '1',
    driver: {
      origin: { lat: 27.7172, lng: 85.3240 }, // Thamel
      destination: { lat: 27.6920, lng: 85.3180 }, // Lazimpat
      departureTime: '2024-01-15T08:00:00Z',
      rating: 4.8,
      polyline: [
        { lat: 27.7172, lng: 85.3240 },
        { lat: 27.7150, lng: 85.3220 },
        { lat: 27.7100, lng: 85.3200 },
        { lat: 27.6920, lng: 85.3180 },
      ],
    },
    passenger: {
      origin: { lat: 27.7165, lng: 85.3235 }, // Near Thamel
      destination: { lat: 27.6915, lng: 85.3175 }, // Near Lazimpat
      departureTime: '2024-01-15T08:02:00Z',
      rating: 4.5,
      polyline: [
        { lat: 27.7165, lng: 85.3235 },
        { lat: 27.7145, lng: 85.3215 },
        { lat: 27.7095, lng: 85.3195 },
        { lat: 27.6915, lng: 85.3175 },
      ],
    },
    groundTruth: 'Match',
    reason: 'Very close origins, same destination, similar time, high ratings',
  },
  {
    id: '2',
    driver: {
      origin: { lat: 27.7145, lng: 85.3260 }, // Durbar Marg
      destination: { lat: 27.6850, lng: 85.3100 }, // Baluwatar
      departureTime: '2024-01-15T09:00:00Z',
      rating: 4.7,
      polyline: [
        { lat: 27.7145, lng: 85.3260 },
        { lat: 27.7100, lng: 85.3220 },
        { lat: 27.7000, lng: 85.3150 },
        { lat: 27.6850, lng: 85.3100 },
      ],
    },
    passenger: {
      origin: { lat: 27.7140, lng: 85.3255 }, // Near Durbar Marg
      destination: { lat: 27.6845, lng: 85.3095 }, // Near Baluwatar
      departureTime: '2024-01-15T09:01:00Z',
      rating: 4.6,
      polyline: [
        { lat: 27.7140, lng: 85.3255 },
        { lat: 27.7095, lng: 85.3215 },
        { lat: 27.6995, lng: 85.3145 },
        { lat: 27.6845, lng: 85.3095 },
      ],
    },
    groundTruth: 'Match',
    reason: 'Nearby origins, nearby destinations, same time, good ratings',
  },
  {
    id: '3',
    driver: {
      origin: { lat: 27.7200, lng: 85.3200 }, // Lazimpat area
      destination: { lat: 27.6950, lng: 85.3000 }, // Maharajgunj
      departureTime: '2024-01-15T07:30:00Z',
      rating: 4.9,
      polyline: [
        { lat: 27.7200, lng: 85.3200 },
        { lat: 27.7150, lng: 85.3150 },
        { lat: 27.7050, lng: 85.3080 },
        { lat: 27.6950, lng: 85.3000 },
      ],
    },
    passenger: {
      origin: { lat: 27.7195, lng: 85.3195 }, // Near Lazimpat
      destination: { lat: 27.6945, lng: 85.2995 }, // Near Maharajgunj
      departureTime: '2024-01-15T07:31:00Z',
      rating: 4.8,
      polyline: [
        { lat: 27.7195, lng: 85.3195 },
        { lat: 27.7145, lng: 85.3145 },
        { lat: 27.7045, lng: 85.3075 },
        { lat: 27.6945, lng: 85.2995 },
      ],
    },
    groundTruth: 'Match',
    reason: 'Almost identical routes, same time, excellent ratings',
  },
  {
    id: '4',
    driver: {
      origin: { lat: 27.7100, lng: 85.3300 }, // New Road
      destination: { lat: 27.6900, lng: 85.3200 }, // Kamaladi
      departureTime: '2024-01-15T08:30:00Z',
      rating: 4.5,
      polyline: [
        { lat: 27.7100, lng: 85.3300 },
        { lat: 27.7050, lng: 85.3280 },
        { lat: 27.6980, lng: 85.3240 },
        { lat: 27.6900, lng: 85.3200 },
      ],
    },
    passenger: {
      origin: { lat: 27.7095, lng: 85.3295 }, // Near New Road
      destination: { lat: 27.6895, lng: 85.3195 }, // Near Kamaladi
      departureTime: '2024-01-15T08:32:00Z',
      rating: 4.4,
      polyline: [
        { lat: 27.7095, lng: 85.3295 },
        { lat: 27.7045, lng: 85.3275 },
        { lat: 27.6975, lng: 85.3235 },
        { lat: 27.6895, lng: 85.3195 },
      ],
    },
    groundTruth: 'Match',
    reason: 'Close proximity, same destination, similar time',
  },
  {
    id: '5',
    driver: {
      origin: { lat: 27.7250, lng: 85.3150 }, // Naxal
      destination: { lat: 27.7000, lng: 85.3050 }, // Baneshwor
      departureTime: '2024-01-15T10:00:00Z',
      rating: 4.6,
      polyline: [
        { lat: 27.7250, lng: 85.3150 },
        { lat: 27.7200, lng: 85.3120 },
        { lat: 27.7100, lng: 85.3080 },
        { lat: 27.7000, lng: 85.3050 },
      ],
    },
    passenger: {
      origin: { lat: 27.7245, lng: 85.3145 }, // Near Naxal
      destination: { lat: 27.6995, lng: 85.3045 }, // Near Baneshwor
      departureTime: '2024-01-15T10:02:00Z',
      rating: 4.7,
      polyline: [
        { lat: 27.7245, lng: 85.3145 },
        { lat: 27.7195, lng: 85.3115 },
        { lat: 27.7095, lng: 85.3075 },
        { lat: 27.6995, lng: 85.3045 },
      ],
    },
    groundTruth: 'Match',
    reason: 'Nearby locations, same route, good time alignment',
  },
  {
    id: '6',
    driver: {
      origin: { lat: 27.7150, lng: 85.3350 }, // Putalisadak
      destination: { lat: 27.6800, lng: 85.3150 }, // Budhanilkantha
      departureTime: '2024-01-15T07:00:00Z',
      rating: 4.8,
      polyline: [
        { lat: 27.7150, lng: 85.3350 },
        { lat: 27.7100, lng: 85.3300 },
        { lat: 27.6950, lng: 85.3220 },
        { lat: 27.6800, lng: 85.3150 },
      ],
    },
    passenger: {
      origin: { lat: 27.7145, lng: 85.3345 }, // Near Putalisadak
      destination: { lat: 27.6795, lng: 85.3145 }, // Near Budhanilkantha
      departureTime: '2024-01-15T07:01:00Z',
      rating: 4.9,
      polyline: [
        { lat: 27.7145, lng: 85.3345 },
        { lat: 27.7095, lng: 85.3295 },
        { lat: 27.6945, lng: 85.3215 },
        { lat: 27.6795, lng: 85.3145 },
      ],
    },
    groundTruth: 'Match',
    reason: 'Very close pickup/dropoff, same time, excellent ratings',
  },
  {
    id: '7',
    driver: {
      origin: { lat: 27.7050, lng: 85.3250 }, // Sundhara
      destination: { lat: 27.6750, lng: 85.3000 }, // Gongabu
      departureTime: '2024-01-15T08:15:00Z',
      rating: 4.4,
      polyline: [
        { lat: 27.7050, lng: 85.3250 },
        { lat: 27.7000, lng: 85.3200 },
        { lat: 27.6880, lng: 85.3100 },
        { lat: 27.6750, lng: 85.3000 },
      ],
    },
    passenger: {
      origin: { lat: 27.7045, lng: 85.3245 }, // Near Sundhara
      destination: { lat: 27.6745, lng: 85.2995 }, // Near Gongabu
      departureTime: '2024-01-15T08:16:00Z',
      rating: 4.5,
      polyline: [
        { lat: 27.7045, lng: 85.3245 },
        { lat: 27.6995, lng: 85.3195 },
        { lat: 27.6875, lng: 85.3095 },
        { lat: 27.6745, lng: 85.2995 },
      ],
    },
    groundTruth: 'Match',
    reason: 'Close proximity, same route, similar time',
  },
  {
    id: '8',
    driver: {
      origin: { lat: 27.7300, lng: 85.3100 }, // Maharajgunj
      destination: { lat: 27.7050, lng: 85.2900 }, // Bansbari
      departureTime: '2024-01-15T09:30:00Z',
      rating: 4.7,
      polyline: [
        { lat: 27.7300, lng: 85.3100 },
        { lat: 27.7250, lng: 85.3050 },
        { lat: 27.7150, lng: 85.2970 },
        { lat: 27.7050, lng: 85.2900 },
      ],
    },
    passenger: {
      origin: { lat: 27.7295, lng: 85.3095 }, // Near Maharajgunj
      destination: { lat: 27.7045, lng: 85.2895 }, // Near Bansbari
      departureTime: '2024-01-15T09:31:00Z',
      rating: 4.6,
      polyline: [
        { lat: 27.7295, lng: 85.3095 },
        { lat: 27.7245, lng: 85.3045 },
        { lat: 27.7145, lng: 85.2965 },
        { lat: 27.7045, lng: 85.2895 },
      ],
    },
    groundTruth: 'Match',
    reason: 'Nearby locations, same route, good time alignment',
  },
  {
    id: '9',
    driver: {
      origin: { lat: 27.7120, lng: 85.3400 }, // Jamal
      destination: { lat: 27.6870, lng: 85.3250 }, // Chabahil
      departureTime: '2024-01-15T07:45:00Z',
      rating: 4.5,
      polyline: [
        { lat: 27.7120, lng: 85.3400 },
        { lat: 27.7070, lng: 85.3350 },
        { lat: 27.6970, lng: 85.3300 },
        { lat: 27.6870, lng: 85.3250 },
      ],
    },
    passenger: {
      origin: { lat: 27.7115, lng: 85.3395 }, // Near Jamal
      destination: { lat: 27.6865, lng: 85.3245 }, // Near Chabahil
      departureTime: '2024-01-15T07:46:00Z',
      rating: 4.4,
      polyline: [
        { lat: 27.7115, lng: 85.3395 },
        { lat: 27.7065, lng: 85.3345 },
        { lat: 27.6965, lng: 85.3295 },
        { lat: 27.6865, lng: 85.3245 },
      ],
    },
    groundTruth: 'Match',
    reason: 'Close pickup/dropoff, same time, good ratings',
  },
  {
    id: '10',
    driver: {
      origin: { lat: 27.7080, lng: 85.3180 }, // Dilli Bazar
      destination: { lat: 27.6830, lng: 85.2980 }, // Maharajgunj
      departureTime: '2024-01-15T08:45:00Z',
      rating: 4.8,
      polyline: [
        { lat: 27.7080, lng: 85.3180 },
        { lat: 27.7030, lng: 85.3130 },
        { lat: 27.6930, lng: 85.3050 },
        { lat: 27.6830, lng: 85.2980 },
      ],
    },
    passenger: {
      origin: { lat: 27.7075, lng: 85.3175 }, // Near Dilli Bazar
      destination: { lat: 27.6825, lng: 85.2975 }, // Near Maharajgunj
      departureTime: '2024-01-15T08:46:00Z',
      rating: 4.7,
      polyline: [
        { lat: 27.7075, lng: 85.3175 },
        { lat: 27.7025, lng: 85.3125 },
        { lat: 27.6925, lng: 85.3045 },
        { lat: 27.6825, lng: 85.2975 },
      ],
    },
    groundTruth: 'Match',
    reason: 'Very close locations, same route, excellent ratings',
  },

  // === GOOD MATCHES (10 pairs) ===
  {
    id: '11',
    driver: {
      origin: { lat: 27.7172, lng: 85.3240 }, // Thamel
      destination: { lat: 27.6920, lng: 85.3180 }, // Lazimpat
      departureTime: '2024-01-15T08:00:00Z',
      rating: 4.5,
      polyline: [
        { lat: 27.7172, lng: 85.3240 },
        { lat: 27.7100, lng: 85.3200 },
        { lat: 27.6920, lng: 85.3180 },
      ],
    },
    passenger: {
      origin: { lat: 27.7150, lng: 85.3220 }, // 200m away
      destination: { lat: 27.6910, lng: 85.3170 }, // 100m away
      departureTime: '2024-01-15T08:05:00Z',
      rating: 4.2,
      polyline: [
        { lat: 27.7150, lng: 85.3220 },
        { lat: 27.7080, lng: 85.3180 },
        { lat: 27.6910, lng: 85.3170 },
      ],
    },
    groundTruth: 'Match',
    reason: 'Moderate distance, 5 min time diff, acceptable ratings',
  },
  {
    id: '12',
    driver: {
      origin: { lat: 27.7145, lng: 85.3260 }, // Durbar Marg
      destination: { lat: 27.6850, lng: 85.3100 }, // Baluwatar
      departureTime: '2024-01-15T09:00:00Z',
      rating: 4.3,
      polyline: [
        { lat: 27.7145, lng: 85.3260 },
        { lat: 27.7000, lng: 85.3150 },
        { lat: 27.6850, lng: 85.3100 },
      ],
    },
    passenger: {
      origin: { lat: 27.7120, lng: 85.3240 }, // 300m away
      destination: { lat: 27.6860, lng: 85.3110 }, // 150m away
      departureTime: '2024-01-15T09:08:00Z',
      rating: 4.4,
      polyline: [
        { lat: 27.7120, lng: 85.3240 },
        { lat: 27.6980, lng: 85.3140 },
        { lat: 27.6860, lng: 85.3110 },
      ],
    },
    groundTruth: 'Match',
    reason: 'Acceptable distance, 8 min time diff, decent ratings',
  },
  {
    id: '13',
    driver: {
      origin: { lat: 27.7200, lng: 85.3200 }, // Lazimpat
      destination: { lat: 27.6950, lng: 85.3000 }, // Maharajgunj
      departureTime: '2024-01-15T07:30:00Z',
      rating: 4.6,
      polyline: [
        { lat: 27.7200, lng: 85.3200 },
        { lat: 27.7050, lng: 85.3080 },
        { lat: 27.6950, lng: 85.3000 },
      ],
    },
    passenger: {
      origin: { lat: 27.7170, lng: 85.3180 }, // 350m away
      destination: { lat: 27.6930, lng: 85.2980 }, // 250m away
      departureTime: '2024-01-15T07:25:00Z',
      rating: 4.1,
      polyline: [
        { lat: 27.7170, lng: 85.3180 },
        { lat: 27.7020, lng: 85.3060 },
        { lat: 27.6930, lng: 85.2980 },
      ],
    },
    groundTruth: 'Match',
    reason: 'Moderate distance, 5 min early, acceptable ratings',
  },
  {
    id: '14',
    driver: {
      origin: { lat: 27.7100, lng: 85.3300 }, // New Road
      destination: { lat: 27.6900, lng: 85.3200 }, // Kamaladi
      departureTime: '2024-01-15T08:30:00Z',
      rating: 4.4,
      polyline: [
        { lat: 27.7100, lng: 85.3300 },
        { lat: 27.6980, lng: 85.3240 },
        { lat: 27.6900, lng: 85.3200 },
      ],
    },
    passenger: {
      origin: { lat: 27.7070, lng: 85.3270 }, // 400m away
      destination: { lat: 27.6880, lng: 85.3180 }, // 250m away
      departureTime: '2024-01-15T08:22:00Z',
      rating: 4.3,
      polyline: [
        { lat: 27.7070, lng: 85.3270 },
        { lat: 27.6950, lng: 85.3210 },
        { lat: 27.6880, lng: 85.3180 },
      ],
    },
    groundTruth: 'Match',
    reason: 'Acceptable distance, 8 min early, decent ratings',
  },
  {
    id: '15',
    driver: {
      origin: { lat: 27.7250, lng: 85.3150 }, // Naxal
      destination: { lat: 27.7000, lng: 85.3050 }, // Baneshwor
      departureTime: '2024-01-15T10:00:00Z',
      rating: 4.2,
      polyline: [
        { lat: 27.7250, lng: 85.3150 },
        { lat: 27.7100, lng: 85.3080 },
        { lat: 27.7000, lng: 85.3050 },
      ],
    },
    passenger: {
      origin: { lat: 27.7220, lng: 85.3120 }, // 400m away
      destination: { lat: 27.6980, lng: 85.3020 }, // 250m away
      departureTime: '2024-01-15T10:10:00Z',
      rating: 4.5,
      polyline: [
        { lat: 27.7220, lng: 85.3120 },
        { lat: 27.7070, lng: 85.3050 },
        { lat: 27.6980, lng: 85.3020 },
      ],
    },
    groundTruth: 'Match',
    reason: 'Moderate distance, 10 min diff, acceptable ratings',
  },
  {
    id: '16',
    driver: {
      origin: { lat: 27.7150, lng: 85.3350 }, // Putalisadak
      destination: { lat: 27.6800, lng: 85.3150 }, // Budhanilkantha
      departureTime: '2024-01-15T07:00:00Z',
      rating: 4.5,
      polyline: [
        { lat: 27.7150, lng: 85.3350 },
        { lat: 27.6950, lng: 85.3220 },
        { lat: 27.6800, lng: 85.3150 },
      ],
    },
    passenger: {
      origin: { lat: 27.7110, lng: 85.3310 }, // 500m away
      destination: { lat: 27.6820, lng: 85.3160 }, // 250m away
      departureTime: '2024-01-15T07:12:00Z',
      rating: 4.3,
      polyline: [
        { lat: 27.7110, lng: 85.3310 },
        { lat: 27.6910, lng: 85.3230 },
        { lat: 27.6820, lng: 85.3160 },
      ],
    },
    groundTruth: 'Match',
    reason: 'Acceptable distance, 12 min diff, decent ratings',
  },
  {
    id: '17',
    driver: {
      origin: { lat: 27.7050, lng: 85.3250 }, // Sundhara
      destination: { lat: 27.6750, lng: 85.3000 }, // Gongabu
      departureTime: '2024-01-15T08:15:00Z',
      rating: 4.1,
      polyline: [
        { lat: 27.7050, lng: 85.3250 },
        { lat: 27.6880, lng: 85.3100 },
        { lat: 27.6750, lng: 85.3000 },
      ],
    },
    passenger: {
      origin: { lat: 27.7010, lng: 85.3210 }, // 500m away
      destination: { lat: 27.6770, lng: 85.3010 }, // 250m away
      departureTime: '2024-01-15T08:05:00Z',
      rating: 4.4,
      polyline: [
        { lat: 27.7010, lng: 85.3210 },
        { lat: 27.6840, lng: 85.3110 },
        { lat: 27.6770, lng: 85.3010 },
      ],
    },
    groundTruth: 'Match',
    reason: 'Moderate distance, 10 min early, acceptable ratings',
  },
  {
    id: '18',
    driver: {
      origin: { lat: 27.7300, lng: 85.3100 }, // Maharajgunj
      destination: { lat: 27.7050, lng: 85.2900 }, // Bansbari
      departureTime: '2024-01-15T09:30:00Z',
      rating: 4.3,
      polyline: [
        { lat: 27.7300, lng: 85.3100 },
        { lat: 27.7150, lng: 85.2970 },
        { lat: 27.7050, lng: 85.2900 },
      ],
    },
    passenger: {
      origin: { lat: 27.7260, lng: 85.3060 }, // 500m away
      destination: { lat: 27.7070, lng: 85.2910 }, // 250m away
      departureTime: '2024-01-15T09:20:00Z',
      rating: 4.2,
      polyline: [
        { lat: 27.7260, lng: 85.3060 },
        { lat: 27.7110, lng: 85.2980 },
        { lat: 27.7070, lng: 85.2910 },
      ],
    },
    groundTruth: 'Match',
    reason: 'Acceptable distance, 10 min early, decent ratings',
  },
  {
    id: '19',
    driver: {
      origin: { lat: 27.7120, lng: 85.3400 }, // Jamal
      destination: { lat: 27.6870, lng: 85.3250 }, // Chabahil
      departureTime: '2024-01-15T07:45:00Z',
      rating: 4.0,
      polyline: [
        { lat: 27.7120, lng: 85.3400 },
        { lat: 27.6970, lng: 85.3300 },
        { lat: 27.6870, lng: 85.3250 },
      ],
    },
    passenger: {
      origin: { lat: 27.7070, lng: 85.3350 }, // 600m away
      destination: { lat: 27.6890, lng: 85.3260 }, // 250m away
      departureTime: '2024-01-15T07:55:00Z',
      rating: 4.5,
      polyline: [
        { lat: 27.7070, lng: 85.3350 },
        { lat: 27.6920, lng: 85.3310 },
        { lat: 27.6890, lng: 85.3260 },
      ],
    },
    groundTruth: 'Match',
    reason: 'Borderline distance, 10 min diff, acceptable ratings',
  },
  {
    id: '20',
    driver: {
      origin: { lat: 27.7080, lng: 85.3180 }, // Dilli Bazar
      destination: { lat: 27.6830, lng: 85.2980 }, // Maharajgunj
      departureTime: '2024-01-15T08:45:00Z',
      rating: 4.2,
      polyline: [
        { lat: 27.7080, lng: 85.3180 },
        { lat: 27.6930, lng: 85.3050 },
        { lat: 27.6830, lng: 85.2980 },
      ],
    },
    passenger: {
      origin: { lat: 27.7030, lng: 85.3130 }, // 600m away
      destination: { lat: 27.6850, lng: 85.2990 }, // 250m away
      departureTime: '2024-01-15T08:35:00Z',
      rating: 4.4,
      polyline: [
        { lat: 27.7030, lng: 85.3130 },
        { lat: 27.6880, lng: 85.3060 },
        { lat: 27.6850, lng: 85.2990 },
      ],
    },
    groundTruth: 'Match',
    reason: 'Borderline distance, 10 min early, acceptable ratings',
  },

  // === CLEAR NO-MATCHES (10 pairs) ===
  {
    id: '21',
    driver: {
      origin: { lat: 27.7172, lng: 85.3240 }, // Thamel
      destination: { lat: 27.6920, lng: 85.3180 }, // Lazimpat
      departureTime: '2024-01-15T08:00:00Z',
      rating: 4.5,
      polyline: [
        { lat: 27.7172, lng: 85.3240 },
        { lat: 27.6920, lng: 85.3180 },
      ],
    },
    passenger: {
      origin: { lat: 27.7000, lng: 85.3500 }, // 3km away
      destination: { lat: 27.6800, lng: 85.3400 }, // Different area
      departureTime: '2024-01-15T08:05:00Z',
      rating: 4.2,
      polyline: [
        { lat: 27.7000, lng: 85.3500 },
        { lat: 27.6800, lng: 85.3400 },
      ],
    },
    groundTruth: 'No-Match',
    reason: 'Too far from origin (3km), different destination area',
  },
  {
    id: '22',
    driver: {
      origin: { lat: 27.7145, lng: 85.3260 }, // Durbar Marg
      destination: { lat: 27.6850, lng: 85.3100 }, // Baluwatar
      departureTime: '2024-01-15T09:00:00Z',
      rating: 4.8,
      polyline: [
        { lat: 27.7145, lng: 85.3260 },
        { lat: 27.6850, lng: 85.3100 },
      ],
    },
    passenger: {
      origin: { lat: 27.7140, lng: 85.3255 }, // Close origin
      destination: { lat: 27.6500, lng: 85.2800 }, // 5km away
      departureTime: '2024-01-15T09:01:00Z',
      rating: 4.6,
      polyline: [
        { lat: 27.7140, lng: 85.3255 },
        { lat: 27.6500, lng: 85.2800 },
      ],
    },
    groundTruth: 'No-Match',
    reason: 'Close origin but destination too far (5km)',
  },
  {
    id: '23',
    driver: {
      origin: { lat: 27.7200, lng: 85.3200 }, // Lazimpat
      destination: { lat: 27.6950, lng: 85.3000 }, // Maharajgunj
      departureTime: '2024-01-15T07:30:00Z',
      rating: 4.9,
      polyline: [
        { lat: 27.7200, lng: 85.3200 },
        { lat: 27.6950, lng: 85.3000 },
      ],
    },
    passenger: {
      origin: { lat: 27.7195, lng: 85.3195 }, // Close origin
      destination: { lat: 27.6945, lng: 85.2995 }, // Close destination
      departureTime: '2024-01-15T09:30:00Z', // 2 hours later
      rating: 4.8,
      polyline: [
        { lat: 27.7195, lng: 85.3195 },
        { lat: 27.6945, lng: 85.2995 },
      ],
    },
    groundTruth: 'No-Match',
    reason: 'Perfect location match but 2 hour time difference',
  },
  {
    id: '24',
    driver: {
      origin: { lat: 27.7100, lng: 85.3300 }, // New Road
      destination: { lat: 27.6900, lng: 85.3200 }, // Kamaladi
      departureTime: '2024-01-15T08:30:00Z',
      rating: 4.5,
      polyline: [
        { lat: 27.7100, lng: 85.3300 },
        { lat: 27.6900, lng: 85.3200 },
      ],
    },
    passenger: {
      origin: { lat: 27.7200, lng: 85.3400 }, // 1.5km away
      destination: { lat: 27.7000, lng: 85.3300 }, // 1.5km away
      departureTime: '2024-01-15T08:32:00Z',
      rating: 4.4,
      polyline: [
        { lat: 27.7200, lng: 85.3400 },
        { lat: 27.7000, lng: 85.3300 },
      ],
    },
    groundTruth: 'No-Match',
    reason: 'Both origin and destination too far (1.5km each)',
  },
  {
    id: '25',
    driver: {
      origin: { lat: 27.7250, lng: 85.3150 }, // Naxal
      destination: { lat: 27.7000, lng: 85.3050 }, // Baneshwor
      departureTime: '2024-01-15T10:00:00Z',
      rating: 4.6,
      polyline: [
        { lat: 27.7250, lng: 85.3150 },
        { lat: 27.7000, lng: 85.3050 },
      ],
    },
    passenger: {
      origin: { lat: 27.7245, lng: 85.3145 }, // Close origin
      destination: { lat: 27.6995, lng: 85.3045 }, // Close destination
      departureTime: '2024-01-15T10:45:00Z', // 45 min later
      rating: 4.7,
      polyline: [
        { lat: 27.7245, lng: 85.3145 },
        { lat: 27.6995, lng: 85.3045 },
      ],
    },
    groundTruth: 'No-Match',
    reason: 'Perfect location match but 45 min time difference',
  },
  {
    id: '26',
    driver: {
      origin: { lat: 27.7150, lng: 85.3350 }, // Putalisadak
      destination: { lat: 27.6800, lng: 85.3150 }, // Budhanilkantha
      departureTime: '2024-01-15T07:00:00Z',
      rating: 4.8,
      polyline: [
        { lat: 27.7150, lng: 85.3350 },
        { lat: 27.6800, lng: 85.3150 },
      ],
    },
    passenger: {
      origin: { lat: 27.6900, lng: 85.3000 }, // 3km away
      destination: { lat: 27.6700, lng: 85.2900 }, // Different area
      departureTime: '2024-01-15T07:01:00Z',
      rating: 4.9,
      polyline: [
        { lat: 27.6900, lng: 85.3000 },
        { lat: 27.6700, lng: 85.2900 },
      ],
    },
    groundTruth: 'No-Match',
    reason: 'Both origin and destination in different areas (3km+)',
  },
  {
    id: '27',
    driver: {
      origin: { lat: 27.7050, lng: 85.3250 }, // Sundhara
      destination: { lat: 27.6750, lng: 85.3000 }, // Gongabu
      departureTime: '2024-01-15T08:15:00Z',
      rating: 4.4,
      polyline: [
        { lat: 27.7050, lng: 85.3250 },
        { lat: 27.6750, lng: 85.3000 },
      ],
    },
    passenger: {
      origin: { lat: 27.7045, lng: 85.3245 }, // Close origin
      destination: { lat: 27.6745, lng: 85.2995 }, // Close destination
      departureTime: '2024-01-15T07:00:00Z', // 1 hour 15 min earlier
      rating: 4.5,
      polyline: [
        { lat: 27.7045, lng: 85.3245 },
        { lat: 27.6745, lng: 85.2995 },
      ],
    },
    groundTruth: 'No-Match',
    reason: 'Perfect location match but 75 min time difference',
  },
  {
    id: '28',
    driver: {
      origin: { lat: 27.7300, lng: 85.3100 }, // Maharajgunj
      destination: { lat: 27.7050, lng: 85.2900 }, // Bansbari
      departureTime: '2024-01-15T09:30:00Z',
      rating: 4.7,
      polyline: [
        { lat: 27.7300, lng: 85.3100 },
        { lat: 27.7050, lng: 85.2900 },
      ],
    },
    passenger: {
      origin: { lat: 27.7100, lng: 85.2900 }, // 2.5km away
      destination: { lat: 27.6850, lng: 85.2700 }, // 2.5km away
      departureTime: '2024-01-15T09:31:00Z',
      rating: 4.6,
      polyline: [
        { lat: 27.7100, lng: 85.2900 },
        { lat: 27.6850, lng: 85.2700 },
      ],
    },
    groundTruth: 'No-Match',
    reason: 'Both origin and destination too far (2.5km each)',
  },
  {
    id: '29',
    driver: {
      origin: { lat: 27.7120, lng: 85.3400 }, // Jamal
      destination: { lat: 27.6870, lng: 85.3250 }, // Chabahil
      departureTime: '2024-01-15T07:45:00Z',
      rating: 4.5,
      polyline: [
        { lat: 27.7120, lng: 85.3400 },
        { lat: 27.6870, lng: 85.3250 },
      ],
    },
    passenger: {
      origin: { lat: 27.7115, lng: 85.3395 }, // Close origin
      destination: { lat: 27.6865, lng: 85.3245 }, // Close destination
      departureTime: '2024-01-15T08:45:00Z', // 1 hour later
      rating: 4.4,
      polyline: [
        { lat: 27.7115, lng: 85.3395 },
        { lat: 27.6865, lng: 85.3245 },
      ],
    },
    groundTruth: 'No-Match',
    reason: 'Perfect location match but 1 hour time difference',
  },
  {
    id: '30',
    driver: {
      origin: { lat: 27.7080, lng: 85.3180 }, // Dilli Bazar
      destination: { lat: 27.6830, lng: 85.2980 }, // Maharajgunj
      departureTime: '2024-01-15T08:45:00Z',
      rating: 4.8,
      polyline: [
        { lat: 27.7080, lng: 85.3180 },
        { lat: 27.6830, lng: 85.2980 },
      ],
    },
    passenger: {
      origin: { lat: 27.6800, lng: 85.2900 }, // 3.5km away
      destination: { lat: 27.6600, lng: 85.2700 }, // 3km away
      departureTime: '2024-01-15T08:46:00Z',
      rating: 4.7,
      polyline: [
        { lat: 27.6800, lng: 85.2900 },
        { lat: 27.6600, lng: 85.2700 },
      ],
    },
    groundTruth: 'No-Match',
    reason: 'Both origin and destination in different areas (3km+)',
  },

  // === BORDERLINE CASES (10 pairs) ===
  {
    id: '31',
    driver: {
      origin: { lat: 27.7172, lng: 85.3240 }, // Thamel
      destination: { lat: 27.6920, lng: 85.3180 }, // Lazimpat
      departureTime: '2024-01-15T08:00:00Z',
      rating: 4.5,
      polyline: [
        { lat: 27.7172, lng: 85.3240 },
        { lat: 27.6920, lng: 85.3180 },
      ],
    },
    passenger: {
      origin: { lat: 27.7150, lng: 85.3220 }, // 300m away
      destination: { lat: 27.6900, lng: 85.3160 }, // 300m away
      departureTime: '2024-01-15T08:28:00Z', // 28 min later
      rating: 4.2,
      polyline: [
        { lat: 27.7150, lng: 85.3220 },
        { lat: 27.6900, lng: 85.3160 },
      ],
    },
    groundTruth: 'No-Match',
    reason: 'Acceptable distance but time difference at threshold (28 min)',
  },
  {
    id: '32',
    driver: {
      origin: { lat: 27.7145, lng: 85.3260 }, // Durbar Marg
      destination: { lat: 27.6850, lng: 85.3100 }, // Baluwatar
      departureTime: '2024-01-15T09:00:00Z',
      rating: 4.3,
      polyline: [
        { lat: 27.7145, lng: 85.3260 },
        { lat: 27.6850, lng: 85.3100 },
      ],
    },
    passenger: {
      origin: { lat: 27.7120, lng: 85.3240 }, // 300m away
      destination: { lat: 27.6860, lng: 85.3110 }, // 150m away
      departureTime: '2024-01-15T09:31:00Z', // 31 min later
      rating: 4.4,
      polyline: [
        { lat: 27.7120, lng: 85.3240 },
        { lat: 27.6860, lng: 85.3110 },
      ],
    },
    groundTruth: 'No-Match',
    reason: 'Good distance but time exceeds threshold (31 min)',
  },
  {
    id: '33',
    driver: {
      origin: { lat: 27.7200, lng: 85.3200 }, // Lazimpat
      destination: { lat: 27.6950, lng: 85.3000 }, // Maharajgunj
      departureTime: '2024-01-15T07:30:00Z',
      rating: 4.6,
      polyline: [
        { lat: 27.7200, lng: 85.3200 },
        { lat: 27.6950, lng: 85.3000 },
      ],
    },
    passenger: {
      origin: { lat: 27.7170, lng: 85.3180 }, // 350m away
      destination: { lat: 27.6930, lng: 85.2980 }, // 250m away
      departureTime: '2024-01-15T07:05:00Z', // 25 min early
      rating: 4.1,
      polyline: [
        { lat: 27.7170, lng: 85.3180 },
        { lat: 27.6930, lng: 85.2980 },
      ],
    },
    groundTruth: 'Match',
    reason: 'Moderate distance, time within threshold (25 min), low rating',
  },
  {
    id: '34',
    driver: {
      origin: { lat: 27.7100, lng: 85.3300 }, // New Road
      destination: { lat: 27.6900, lng: 85.3200 }, // Kamaladi
      departureTime: '2024-01-15T08:30:00Z',
      rating: 4.4,
      polyline: [
        { lat: 27.7100, lng: 85.3300 },
        { lat: 27.6900, lng: 85.3200 },
      ],
    },
    passenger: {
      origin: { lat: 27.7070, lng: 85.3270 }, // 400m away
      destination: { lat: 27.6880, lng: 85.3180 }, // 250m away
      departureTime: '2024-01-15T08:02:00Z', // 28 min early
      rating: 4.3,
      polyline: [
        { lat: 27.7070, lng: 85.3270 },
        { lat: 27.6880, lng: 85.3180 },
      ],
    },
    groundTruth: 'Match',
    reason: 'Acceptable distance, time within threshold (28 min)',
  },
  {
    id: '35',
    driver: {
      origin: { lat: 27.7250, lng: 85.3150 }, // Naxal
      destination: { lat: 27.7000, lng: 85.3050 }, // Baneshwor
      departureTime: '2024-01-15T10:00:00Z',
      rating: 4.2,
      polyline: [
        { lat: 27.7250, lng: 85.3150 },
        { lat: 27.7000, lng: 85.3050 },
      ],
    },
    passenger: {
      origin: { lat: 27.7220, lng: 85.3120 }, // 400m away
      destination: { lat: 27.6980, lng: 85.3020 }, // 250m away
      departureTime: '2024-01-15T10:29:00Z', // 29 min later
      rating: 4.5,
      polyline: [
        { lat: 27.7220, lng: 85.3120 },
        { lat: 27.6980, lng: 85.3020 },
      ],
    },
    groundTruth: 'No-Match',
    reason: 'Good distance but time at threshold (29 min)',
  },
  {
    id: '36',
    driver: {
      origin: { lat: 27.7150, lng: 85.3350 }, // Putalisadak
      destination: { lat: 27.6800, lng: 85.3150 }, // Budhanilkantha
      departureTime: '2024-01-15T07:00:00Z',
      rating: 4.5,
      polyline: [
        { lat: 27.7150, lng: 85.3350 },
        { lat: 27.6800, lng: 85.3150 },
      ],
    },
    passenger: {
      origin: { lat: 27.7110, lng: 85.3310 }, // 500m away
      destination: { lat: 27.6820, lng: 85.3160 }, // 250m away
      departureTime: '2024-01-15T07:29:00Z', // 29 min later
      rating: 4.3,
      polyline: [
        { lat: 27.7110, lng: 85.3310 },
        { lat: 27.6820, lng: 85.3160 },
      ],
    },
    groundTruth: 'No-Match',
    reason: 'Acceptable distance but time at threshold (29 min)',
  },
  {
    id: '37',
    driver: {
      origin: { lat: 27.7050, lng: 85.3250 }, // Sundhara
      destination: { lat: 27.6750, lng: 85.3000 }, // Gongabu
      departureTime: '2024-01-15T08:15:00Z',
      rating: 4.1,
      polyline: [
        { lat: 27.7050, lng: 85.3250 },
        { lat: 27.6750, lng: 85.3000 },
      ],
    },
    passenger: {
      origin: { lat: 27.7010, lng: 85.3210 }, // 500m away
      destination: { lat: 27.6770, lng: 85.3010 }, // 250m away
      departureTime: '2024-01-15T08:44:00Z', // 29 min later
      rating: 4.4,
      polyline: [
        { lat: 27.7010, lng: 85.3210 },
        { lat: 27.6770, lng: 85.3010 },
      ],
    },
    groundTruth: 'No-Match',
    reason: 'Acceptable distance but time at threshold (29 min)',
  },
  {
    id: '38',
    driver: {
      origin: { lat: 27.7300, lng: 85.3100 }, // Maharajgunj
      destination: { lat: 27.7050, lng: 85.2900 }, // Bansbari
      departureTime: '2024-01-15T09:30:00Z',
      rating: 4.3,
      polyline: [
        { lat: 27.7300, lng: 85.3100 },
        { lat: 27.7050, lng: 85.2900 },
      ],
    },
    passenger: {
      origin: { lat: 27.7260, lng: 85.3060 }, // 500m away
      destination: { lat: 27.7070, lng: 85.2910 }, // 250m away
      departureTime: '2024-01-15T09:01:00Z', // 29 min early
      rating: 4.2,
      polyline: [
        { lat: 27.7260, lng: 85.3060 },
        { lat: 27.7070, lng: 85.2910 },
      ],
    },
    groundTruth: 'Match',
    reason: 'Acceptable distance, time within threshold (29 min)',
  },
  {
    id: '39',
    driver: {
      origin: { lat: 27.7120, lng: 85.3400 }, // Jamal
      destination: { lat: 27.6870, lng: 85.3250 }, // Chabahil
      departureTime: '2024-01-15T07:45:00Z',
      rating: 4.0,
      polyline: [
        { lat: 27.7120, lng: 85.3400 },
        { lat: 27.6870, lng: 85.3250 },
      ],
    },
    passenger: {
      origin: { lat: 27.7070, lng: 85.3350 }, // 600m away
      destination: { lat: 27.6890, lng: 85.3260 }, // 250m away
      departureTime: '2024-01-15T07:16:00Z', // 29 min early
      rating: 4.5,
      polyline: [
        { lat: 27.7070, lng: 85.3350 },
        { lat: 27.6890, lng: 85.3260 },
      ],
    },
    groundTruth: 'Match',
    reason: 'Borderline distance, time within threshold (29 min)',
  },
  {
    id: '40',
    driver: {
      origin: { lat: 27.7080, lng: 85.3180 }, // Dilli Bazar
      destination: { lat: 27.6830, lng: 85.2980 }, // Maharajgunj
      departureTime: '2024-01-15T08:45:00Z',
      rating: 4.2,
      polyline: [
        { lat: 27.7080, lng: 85.3180 },
        { lat: 27.6830, lng: 85.2980 },
      ],
    },
    passenger: {
      origin: { lat: 27.7030, lng: 85.3130 }, // 600m away
      destination: { lat: 27.6850, lng: 85.2990 }, // 250m away
      departureTime: '2024-01-15T08:16:00Z', // 29 min early
      rating: 4.4,
      polyline: [
        { lat: 27.7030, lng: 85.3130 },
        { lat: 27.6850, lng: 85.2990 },
      ],
    },
    groundTruth: 'Match',
    reason: 'Borderline distance, time within threshold (29 min)',
  },
];

/**
 * Algorithm evaluation results interface
 */
export interface AlgorithmResult {
  algorithm: string;
  predictions: ('Match' | 'No-Match')[];
  truePositives: number;
  trueNegatives: number;
  falsePositives: number;
  falseNegatives: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
}

/**
 * Threshold for considering a prediction as "Match"
 */
const MATCH_THRESHOLD = 50; // Score >= 50 is considered a match

/**
 * Haversine distance calculation
 */
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
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

/**
 * Calculate time difference in minutes between two ISO timestamps
 */
function calculateTimeDifferenceMinutes(timestamp1: string, timestamp2: string): number {
  const date1 = new Date(timestamp1);
  const date2 = new Date(timestamp2);
  const diffMs = Math.abs(date1.getTime() - date2.getTime());
  return diffMs / (1000 * 60);
}

/**
 * Algorithm 1: Basic Weighted Match Scoring
 * Uses distance, time, destination similarity, and rating
 */
function evaluateBasicAlgorithm(pairs: RidePair[]): ('Match' | 'No-Match')[] {
  return pairs.map((pair) => {
    const distanceKm = haversineDistance(
      pair.driver.origin.lat,
      pair.driver.origin.lng,
      pair.passenger.origin.lat,
      pair.passenger.origin.lng,
    );

    const timeDiffMinutes = calculateTimeDifferenceMinutes(
      pair.driver.departureTime,
      pair.passenger.departureTime,
    );

    const destinationDistanceKm = haversineDistance(
      pair.driver.destination.lat,
      pair.driver.destination.lng,
      pair.passenger.destination.lat,
      pair.passenger.destination.lng,
    );

    const score = calculateMatchScore({
      distanceKm,
      timeDifferenceMinutes: timeDiffMinutes,
      destinationDistanceKm,
      driverRating: pair.driver.rating,
    });

    return score >= MATCH_THRESHOLD ? 'Match' : 'No-Match';
  });
}

/**
 * Algorithm 2: Enhanced Route-Based Match Scoring
 * Uses distance, time, route similarity (from polylines), and rating
 */
function evaluateEnhancedAlgorithm(pairs: RidePair[]): ('Match' | 'No-Match')[] {
  return pairs.map((pair) => {
    const distanceKm = haversineDistance(
      pair.driver.origin.lat,
      pair.driver.origin.lng,
      pair.passenger.origin.lat,
      pair.passenger.origin.lng,
    );

    const timeDiffMinutes = calculateTimeDifferenceMinutes(
      pair.driver.departureTime,
      pair.passenger.departureTime,
    );

    let routeSimilarityScore = 0;
    let driverDetour = 0;
    let passengerDetour = 0;

    if (pair.driver.polyline && pair.passenger.polyline) {
      const similarity = calcPolylineSimilarity(
        pair.driver.polyline,
        pair.passenger.polyline,
        pair.driver.origin,
        pair.driver.destination,
        pair.passenger.origin,
        pair.passenger.destination,
      );
      routeSimilarityScore = similarity.similarityScore;
      driverDetour = similarity.driverDetour;
      passengerDetour = similarity.passengerDetour;
    }

    const score = calculateEnhancedMatchScore({
      distanceKm,
      timeDifferenceMinutes: timeDiffMinutes,
      routeSimilarityScore,
      driverRating: pair.driver.rating,
      driverDetour,
      passengerDetour,
    });

    return score >= MATCH_THRESHOLD ? 'Match' : 'No-Match';
  });
}

/**
 * Algorithm 3: Distance-Only Scoring
 * Only considers pickup proximity
 */
function evaluateDistanceOnlyAlgorithm(pairs: RidePair[]): ('Match' | 'No-Match')[] {
  return pairs.map((pair) => {
    const distanceKm = haversineDistance(
      pair.driver.origin.lat,
      pair.driver.origin.lng,
      pair.passenger.origin.lat,
      pair.passenger.origin.lng,
    );

    const score = calculateDistanceScore(distanceKm);
    return score >= MATCH_THRESHOLD ? 'Match' : 'No-Match';
  });
}

/**
 * Algorithm 4: Time-Only Scoring
 * Only considers departure time compatibility
 */
function evaluateTimeOnlyAlgorithm(pairs: RidePair[]): ('Match' | 'No-Match')[] {
  return pairs.map((pair) => {
    const timeDiffMinutes = calculateTimeDifferenceMinutes(
      pair.driver.departureTime,
      pair.passenger.departureTime,
    );

    const score = calculateTimeCompatibilityScore(timeDiffMinutes);
    return score >= MATCH_THRESHOLD ? 'Match' : 'No-Match';
  });
}

/**
 * Compute confusion matrix and metrics for an algorithm
 */
function computeMetrics(
  predictions: ('Match' | 'No-Match')[],
  groundTruth: ('Match' | 'No-Match')[],
): {
  truePositives: number;
  trueNegatives: number;
  falsePositives: number;
  falseNegatives: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
} {
  let truePositives = 0;
  let trueNegatives = 0;
  let falsePositives = 0;
  let falseNegatives = 0;

  for (let i = 0; i < predictions.length; i++) {
    if (predictions[i] === 'Match' && groundTruth[i] === 'Match') {
      truePositives++;
    } else if (predictions[i] === 'No-Match' && groundTruth[i] === 'No-Match') {
      trueNegatives++;
    } else if (predictions[i] === 'Match' && groundTruth[i] === 'No-Match') {
      falsePositives++;
    } else if (predictions[i] === 'No-Match' && groundTruth[i] === 'Match') {
      falseNegatives++;
    }
  }

  const total = predictions.length;
  const accuracy = (truePositives + trueNegatives) / total;
  const precision = truePositives / (truePositives + falsePositives) || 0;
  const recall = truePositives / (truePositives + falseNegatives) || 0;
  const f1Score = 2 * ((precision * recall) / (precision + recall)) || 0;

  return {
    truePositives,
    trueNegatives,
    falsePositives,
    falseNegatives,
    accuracy,
    precision,
    recall,
    f1Score,
  };
}

/**
 * Run evaluation for all algorithms
 */
export function evaluateAllAlgorithms(): AlgorithmResult[] {
  const groundTruth = TEST_RIDE_PAIRS.map((pair) => pair.groundTruth);

  const basicPredictions = evaluateBasicAlgorithm(TEST_RIDE_PAIRS);
  const enhancedPredictions = evaluateEnhancedAlgorithm(TEST_RIDE_PAIRS);
  const distanceOnlyPredictions = evaluateDistanceOnlyAlgorithm(TEST_RIDE_PAIRS);
  const timeOnlyPredictions = evaluateTimeOnlyAlgorithm(TEST_RIDE_PAIRS);

  const basicMetrics = computeMetrics(basicPredictions, groundTruth);
  const enhancedMetrics = computeMetrics(enhancedPredictions, groundTruth);
  const distanceOnlyMetrics = computeMetrics(distanceOnlyPredictions, groundTruth);
  const timeOnlyMetrics = computeMetrics(timeOnlyPredictions, groundTruth);

  return [
    {
      algorithm: 'Basic Weighted Scoring',
      predictions: basicPredictions,
      ...basicMetrics,
    },
    {
      algorithm: 'Enhanced Route-Based Scoring',
      predictions: enhancedPredictions,
      ...enhancedMetrics,
    },
    {
      algorithm: 'Distance-Only Scoring',
      predictions: distanceOnlyPredictions,
      ...distanceOnlyMetrics,
    },
    {
      algorithm: 'Time-Only Scoring',
      predictions: timeOnlyPredictions,
      ...timeOnlyMetrics,
    },
  ];
}

/**
 * Generate CSV export of predictions
 */
export function generatePredictionCSV(): string {
  const results = evaluateAllAlgorithms();
  let csv = 'Pair ID,Ground Truth,Basic,Enhanced,Distance-Only,Time-Only\n';

  for (let i = 0; i < TEST_RIDE_PAIRS.length; i++) {
    csv += `${TEST_RIDE_PAIRS[i].id},${TEST_RIDE_PAIRS[i].groundTruth}`;
    csv += `,${results[0].predictions[i]}`;
    csv += `,${results[1].predictions[i]}`;
    csv += `,${results[2].predictions[i]}`;
    csv += `,${results[3].predictions[i]}\n`;
  }

  return csv;
}

/**
 * Main function to run evaluation and output results
 */
function runEvaluation(): void {
  const results = evaluateAllAlgorithms();

  console.log('\n=== MATCHING ALGORITHM EVALUATION RESULTS ===\n');
  console.log('Dataset Size:', TEST_RIDE_PAIRS.length, 'ride pairs');
  console.log('Match Threshold:', MATCH_THRESHOLD, '\n');

  results.forEach((result) => {
    console.log(`--- ${result.algorithm} ---`);
    console.log(`True Positives:  ${result.truePositives}`);
    console.log(`True Negatives:  ${result.trueNegatives}`);
    console.log(`False Positives: ${result.falsePositives}`);
    console.log(`False Negatives: ${result.falseNegatives}`);
    console.log(`Accuracy:  ${(result.accuracy * 100).toFixed(2)}%`);
    console.log(`Precision: ${(result.precision * 100).toFixed(2)}%`);
    console.log(`Recall:    ${(result.recall * 100).toFixed(2)}%`);
    console.log(`F1 Score:  ${result.f1Score.toFixed(4)}\n`);
  });

  console.log('=== PREDICTIONS CSV ===\n');
  console.log(generatePredictionCSV());
}

// Run evaluation if this file is executed directly
if (require.main === module) {
  runEvaluation();
}

export { runEvaluation };
