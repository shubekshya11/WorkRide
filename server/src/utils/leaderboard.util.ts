import { PrismaService } from '../prisma.service';
import { RIDE_ROLE, RIDE_STATUS } from '../constants/enums';

export interface LeaderboardEntry {
  id: number;
  name: string;
  profilePicture: string | null;
  role: string;
  rides: number;
  karma: number;
  feedback: number;
}

export interface LeaderboardData {
  topRiders: LeaderboardEntry[];
  topKarmaPoints: LeaderboardEntry[];
  topFeedback: LeaderboardEntry[];
}

function toLeaderboardEntry(
  user: {
    id: number;
    fullname: string;
    profilePicture: string | null;
    karmaPoints: number;
    ratings: number | null;
  },
  rides: number,
): LeaderboardEntry {
  return {
    id: user.id,
    name: user.fullname,
    profilePicture: user.profilePicture,
    role: RIDE_ROLE.RIDER,
    rides,
    karma: user.karmaPoints ?? 0,
    feedback: user.ratings ?? 0,
  };
}

export async function fetchLeaderboardData(
  prisma: PrismaService,
): Promise<LeaderboardData> {
  const completedRides = await prisma.ride.findMany({
    where: { status: RIDE_STATUS.COMPLETED },
    select: { riderId: true, passengerId: true },
  });

  const rideCountByUserId = new Map<number, number>();
  for (const ride of completedRides) {
    if (ride.riderId != null) {
      rideCountByUserId.set(
        ride.riderId,
        (rideCountByUserId.get(ride.riderId) ?? 0) + 1,
      );
    }
    if (ride.passengerId != null) {
      rideCountByUserId.set(
        ride.passengerId,
        (rideCountByUserId.get(ride.passengerId) ?? 0) + 1,
      );
    }
  }

  const users = await prisma.user.findMany({
    where: { role: { not: 'ADMIN' } },
    select: {
      id: true,
      fullname: true,
      profilePicture: true,
      karmaPoints: true,
      ratings: true,
    },
  });

  const usersWithRideCounts = users.map((user) => ({
    user,
    rides: rideCountByUserId.get(user.id) ?? 0,
  }));

  const topRiders = usersWithRideCounts
    .filter(({ rides }) => rides > 0)
    .sort((a, b) => b.rides - a.rides)
    .slice(0, 10)
    .map(({ user, rides }) => toLeaderboardEntry(user, rides));

  const topKarmaPoints = [...users]
    .sort((a, b) => b.karmaPoints - a.karmaPoints)
    .slice(0, 10)
    .map((user) =>
      toLeaderboardEntry(user, rideCountByUserId.get(user.id) ?? 0),
    );

  const topFeedback = users
    .filter((user) => user.ratings != null && user.ratings > 0)
    .sort((a, b) => (b.ratings ?? 0) - (a.ratings ?? 0))
    .slice(0, 10)
    .map((user) =>
      toLeaderboardEntry(user, rideCountByUserId.get(user.id) ?? 0),
    );

  return { topRiders, topKarmaPoints, topFeedback };
}
