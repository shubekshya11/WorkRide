/**
 * Enum representing user roles in the application.
 * Use this for type safety and to avoid hardcoded role strings.
 *
 * Example usage:
 *   role === USER_ROLE.ADMIN
 */
export enum USER_ROLE {
  USER = 'user',
  ADMIN = 'admin',
}

// Action-based roles for ride creation (not stored in user table)
export enum RIDE_ROLE {
  RIDER = 'rider',
  PASSENGER = 'passenger',
}

export enum RIDER_APPROVAL_STATUS {
  PENDING_RIDER_APPROVAL = 'PENDING_RIDER_APPROVAL',
  APPROVED_RIDER = 'APPROVED_RIDER',
  REJECTED_RIDER = 'REJECTED_RIDER',
}

export const USER_ROLES = [USER_ROLE.USER, USER_ROLE.ADMIN] as const;
export type UserRoleType = (typeof USER_ROLES)[number];

/**
 * Enum representing ride statuses in the application.
 * Use this for type safety and to avoid hardcoded status strings.
 *
 * Example usage:
 *   status === RideStatus.ACTIVE
 */
export enum RIDE_STATUS {
  IDLE = 'IDLE',
  ACTIVE = 'ACTIVE',
  CONFIRMED = 'CONFIRMED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

/**
 * Time window (in minutes) for ride matching (how far apart rides can be matched)
 */
export const RIDE_MATCH_WINDOW_MINUTES = 5;

/**
 * Expiration window (in minutes) for how long a ride remains ACTIVE after its creation time
 */
export const RIDE_EXPIRATION_GRACE_MINUTES = 5;

/**
 * Enum representing feedback emoji types in the application.
 * Use this for type safety and to avoid hardcoded emoji strings.
 *
 * Values are stored as index-based integers for better database performance
 * and easier querying/sorting.
 */
export enum FEEDBACK_EMOJI {
  SATISFIED = 0,
  NEUTRAL = 1,
  DISSATISFIED = 2,
}

/**
 * Distance tiers for karma multipliers (in kilometers)
 */
export enum DISTANCE_TIER {
  SHORT = 'short',
  MEDIUM = 'medium',
  LONG = 'long',
  VERY_LONG = 'very_long',
}

/**
 * Enum representing redemption statuses in the karma redemption system.
 */
export enum REDEMPTION_STATUS {
  ACTIVE = 'ACTIVE',
  USED = 'USED',
  EXPIRED = 'EXPIRED',
  LOCKED = 'LOCKED',
}
