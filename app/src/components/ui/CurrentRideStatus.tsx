import React from 'react';
import { TbAlarm, TbCircleDashed, TbMapPin, TbCheck } from 'react-icons/tb';
import { USER_ROLE, RIDE_STATUS } from '../../constants/enums';
import { RideExpiryTimer } from './RideExpiryTimer';

interface CurrentRideStatusProps {
  details: {
    from: string;
    to: string;
    message: string;
    time?: string;
    role: USER_ROLE;
    expiryTime: number;
    originalDuration?: number;
    status: RIDE_STATUS;
    timestamp?: string;
    id?: number;
    riderId?: number;
    passengerId?: number;
  };
  onSearchAgain: () => void;
  onCancelRide: () => void;
  onCompleteRide?: () => void;
  onProvideFeedback?: () => void;
  onExpiry?: () => void; // Handle expiry callback for UI updates
}

const CurrentRideStatus: React.FC<CurrentRideStatusProps> = ({
  details,
  onSearchAgain,
  onCancelRide,
  onCompleteRide,
  onProvideFeedback,
  onExpiry,
}) => {
  const getStatusTitle = () => {
    switch (details.status) {
      case RIDE_STATUS.ACTIVE:
        return 'Current Ride Status (Searching)';
      case RIDE_STATUS.CONFIRMED:
        return 'Current Ride Status (Confirmed)';
      case RIDE_STATUS.EXPIRED:
        return 'Current Ride Status (Expired)';
      case RIDE_STATUS.COMPLETED:
        return 'Current Ride Status (Completed)';
      default:
        return 'Current Ride Status';
    }
  };

  const getStatusIcon = () => {
    switch (details.status) {
      case RIDE_STATUS.CONFIRMED:
        return <TbCheck className="text-base text-green-500" />;
      case RIDE_STATUS.COMPLETED:
        return <TbCheck className="text-base text-green-600" />;
      default:
        return <TbCircleDashed className="text-base text-teal-500" />;
    }
  };

  return (
    <main className="relative flex size-full flex-col items-center justify-center overflow-hidden bg-teal-100 p-0 dark:bg-dark sm:p-5">
      <div className="pointer-events-none absolute left-0 -z-10 size-96 -translate-x-1/2 rounded-full bg-teal-300 opacity-40 blur-[100px]" />
      <div className="pointer-events-none absolute right-0 top-1/4 -z-10 size-[36rem] translate-x-1/2 rounded-full bg-teal-300 opacity-80 blur-[200px]" />
      <div className="relative flex size-full max-w-xl flex-col justify-center p-5 md:h-auto md:rounded-3xl">
        <h3 className="pb-3 text-base font-medium text-teal-500 dark:text-teal-300 md:text-lg">
          {getStatusTitle()}
        </h3>

        <div className="space-y-3 rounded-xl border bg-teal-100/60 p-4 shadow-sm transition-shadow hover:shadow-md dark:border-teal-300/50 dark:bg-teal-950">
          {/* Real-time expiry timer for ACTIVE rides */}
          {details.status === RIDE_STATUS.ACTIVE && (
            <RideExpiryTimer
              expiryTime={details.expiryTime}
              originalDuration={details.originalDuration}
              onExpiry={onExpiry}
              rideCreationTimestamp={details.timestamp}
            />
          )}

          {/* CONFIRMED ride status */}
          {details.status === RIDE_STATUS.CONFIRMED && (
            <div className="rounded-lg bg-green-100 p-3 text-center dark:bg-green-900">
              <p className="flex items-center justify-center gap-2 text-sm font-medium text-green-600 dark:text-green-300">
                <TbCheck className="text-lg" />
                Ride confirmed! Ready to start.
              </p>
            </div>
          )}

          {/* COMPLETED ride status */}
          {details.status === RIDE_STATUS.COMPLETED && (
            <div className="space-y-3">
              <div className="rounded-lg bg-blue-100 p-3 text-center dark:bg-blue-900">
                <p className="flex items-center justify-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-300">
                  <TbCheck className="text-lg" />
                  Ride completed! Thank you for riding.
                </p>
              </div>
              {onProvideFeedback && (
                <button
                  type="button"
                  onClick={onProvideFeedback}
                  className="transition-150 w-full rounded-lg border border-amber-400 bg-amber-400 px-4 py-2 text-sm font-medium tracking-wide text-amber-950 hover:border-amber-500 hover:bg-amber-500 hover:text-light dark:hover:bg-amber-500"
                >
                  Provide Feedback
                </button>
              )}
            </div>
          )}

          {/* EXPIRED ride status */}
          {details.status === RIDE_STATUS.EXPIRED && (
            <div className="rounded-lg bg-red-100 p-3 text-center dark:bg-red-900">
              <p className="text-sm font-medium text-red-600 dark:text-red-300">
                This ride has expired. You can create a new ride request.
              </p>
            </div>
          )}

          {/* <hr className="border-teal-600/20 dark:border-teal-300/20" /> */}

          <div className="flex items-center gap-2">
            <div className="flex flex-col items-center">
              {getStatusIcon()}
              <div className="h-4 w-px border border-dashed border-teal-500"></div>
              <TbMapPin className="text-base text-teal-500" />
            </div>
            <div className="flex-1 space-y-3 text-sm font-normal text-dark dark:text-light">
              <p>{details.from}</p>
              <p>{details.to}</p>
            </div>
          </div>
          <div className="relative rounded-xl bg-teal-200 p-3">
            <div className="absolute -top-2 right-5 size-0 origin-top rotate-90 scale-[2] border-l-[10px] border-r-[2px] border-t-[10px] border-l-transparent border-r-transparent border-t-teal-200"></div>
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-normal text-dark">{details.message}</p>
              <p className="flex min-w-24 items-center justify-center gap-0.5 rounded-full bg-teal-50 py-1 text-sm font-normal lowercase text-teal-500 shadow dark:bg-teal-950 dark:text-teal-300">
                <TbAlarm className="text-xl" />
                {details.time
                  ? new Date(details.time).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Just now'}
              </p>
            </div>
          </div>

          {/* Action buttons based on status */}
          {details.status === RIDE_STATUS.ACTIVE && (
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onSearchAgain}
                className="transition-150 w-full rounded-lg border border-teal-300 bg-teal-600 px-4 py-2 text-sm font-medium tracking-wide text-light hover:border-teal-500 hover:bg-teal-500 hover:text-light disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-teal-500"
              >
                Search Again
              </button>
              <button
                type="button"
                onClick={onCancelRide}
                className="transition-150 w-full rounded-lg border border-red-500 bg-red-100 px-4 py-2 text-sm font-medium tracking-wide text-red-500 hover:border-red-500 hover:bg-red-500 hover:text-light disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-red-500"
              >
                Cancel Ride
              </button>
            </div>
          )}

          {details.status === RIDE_STATUS.CONFIRMED && onCompleteRide && (
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onCancelRide}
                className="transition-150 w-full rounded-lg border border-red-500 bg-red-100 px-4 py-2 text-sm font-medium tracking-wide text-red-500 hover:border-red-500 hover:bg-red-500 hover:text-light dark:hover:bg-red-500"
              >
                Cancel Ride
              </button>
              <button
                type="button"
                onClick={onCompleteRide}
                className="transition-150 flex w-full items-center justify-center gap-2 rounded-lg border border-green-500 bg-green-600 px-4 py-2 text-sm font-medium tracking-wide text-light hover:border-green-500 hover:bg-green-500 hover:text-light dark:hover:bg-green-500"
              >
                <TbCheck className="text-lg" />
                Complete Ride
              </button>
            </div>
          )}

          {details.status === RIDE_STATUS.EXPIRED && (
            <button
              type="button"
              onClick={onSearchAgain}
              className="transition-150 w-full rounded-lg border border-teal-300 bg-teal-600 px-4 py-2 text-sm font-medium tracking-wide text-light hover:border-teal-500 hover:bg-teal-500 hover:text-light dark:hover:bg-teal-500"
            >
              Create New Ride
            </button>
          )}
        </div>
      </div>
    </main>
  );
};

export default CurrentRideStatus;