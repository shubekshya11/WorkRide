// import { FaAward } from 'react-icons/fa6';
// import { Link } from 'react-router-dom';

import { ReflectionStats, RideHistory } from '../interfaces/types';
import { USER_ROLE } from '../constants/enums';
// import { ROUTE_REDEEM, ROUTE_VIEW_SCORE } from '../constants/routes';

import UserCard from './UserCard';
// import TitleBar from './ui/TitleBar';
import PeopleImpactedWithScore from './ui/PeopleImpactedWithScore';

// import tree1 from '../assets/trees/1.webp';

interface ReflectionDashboardProps {
  stats: ReflectionStats;
  completedRides: RideHistory[];
  currentUserId: number;
  userRole: USER_ROLE;
}

const ReflectionDashboard = ({
  stats,
  currentUserId,
  userRole,
}: ReflectionDashboardProps) => {
  return (
    <div className="mb-8 space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="rounded-xl border border-teal-200 bg-teal-50 p-4 dark:border-teal-700 dark:bg-dark">
          <p className="text-sm text-teal-700 dark:text-teal-300">
            Completed rides
          </p>
          <p className="mt-1 text-3xl font-semibold text-teal-950 dark:text-teal-100">
            {stats.confirmedCount}
          </p>
        </div>

        <div className="rounded-xl border border-teal-200 bg-teal-50 p-4 dark:border-teal-700 dark:bg-dark">
          <p className="text-sm text-teal-700 dark:text-teal-300">
            {userRole === USER_ROLE.RIDER ? 'Rides posted' : 'Rides requested'}
          </p>
          <p className="mt-1 text-3xl font-semibold text-teal-950 dark:text-teal-100">
            {stats.postedCount}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-teal-200 bg-teal-50 p-4 dark:border-teal-700 dark:bg-dark">
        <p className="text-sm text-teal-700 dark:text-teal-300">
          Distance travelled
        </p>
        <p className="mt-1 text-3xl font-semibold text-teal-950 dark:text-teal-100">
          {stats.distanceTravelled.toLocaleString()} km
        </p>
      </div>

      {/* Karma points / credit score board — hidden for now */}
      {/* <div className="relative flex flex-col items-center rounded-2xl border border-amber-300 bg-gradient-to-br from-amber-300 to-amber-100 p-4 shadow-lg ...">
        ...
      </div> */}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-teal-200 bg-teal-50 p-4 dark:border-teal-700 dark:bg-dark">
          <p className="mb-3 text-sm font-medium text-teal-800 dark:text-teal-200">
            People impacted
          </p>
          <PeopleImpactedWithScore userId={currentUserId} />
        </div>

        <div className="rounded-xl border border-teal-200 bg-teal-50 p-2 dark:border-teal-700 dark:bg-dark">
          <UserCard />
        </div>
      </div>

      <div className="rounded-xl border border-teal-200 bg-teal-200/40 px-4 py-3 text-center text-sm text-teal-800">
        {userRole === USER_ROLE.RIDER
          ? 'Thanks for sharing rides and helping your co-workers commute.'
          : 'Thanks for choosing shared rides and building community connections.'}
      </div>

      {/* CO₂ reduced — hidden for now */}
      {/* <div className="relative mt-4 flex flex-col items-center rounded-3xl border border-green-200 bg-gradient-to-br ...">
        <span className="text-xl font-bold text-green-700">CO₂ Reduced</span>
        <span className="text-5xl font-extrabold text-green-700">{stats.co2Reduced.toFixed(1)}</span>
        ...
      </div> */}

      {/* <div>
        <img src={tree1} alt="Trees" className="..." />
      </div> */}
    </div>
  );
};

export default ReflectionDashboard;
