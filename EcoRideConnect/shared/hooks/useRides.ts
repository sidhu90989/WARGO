import { useCallback } from 'react';
import { matchingService, type CreateRideInput } from '@shared/services/matchingService';

export function useRides() {
  const createRide = useCallback(async (input: CreateRideInput) => matchingService.createRide(input), []);
  const getPendingRides = useCallback(async () => matchingService.getPendingRides(), []);
  const acceptRide = useCallback(async (rideId: string) => matchingService.acceptRide(rideId), []);
  const startRide = useCallback(async (rideId: string) => matchingService.startRide(rideId), []);
  const completeRide = useCallback(async (rideId: string, actualFare?: number) => matchingService.completeRide(rideId, actualFare), []);
  const sos = useCallback(async (rideId: string) => matchingService.sos(rideId), []);

  return { createRide, getPendingRides, acceptRide, startRide, completeRide, sos } as const;
}

export default useRides;
