import { useCallback, useState } from 'react';
import type { RideDetails, RideRequest } from '@shared/realtime/socketClient';
import { requestRide, cancelRide } from '@shared/realtime/socketClient';

export function useRides() {
  const [currentRide, setCurrentRide] = useState<RideDetails | null>(null);
  const [history, setHistory] = useState<RideDetails[]>([]);

  const createRide = useCallback((req: RideRequest) => {
    requestRide(req);
  }, []);

  const cancel = useCallback((rideId: string, reason?: string) => {
    cancelRide(rideId, reason);
  }, []);

  const completeLocal = useCallback((ride: RideDetails) => {
    setCurrentRide(null);
    setHistory((h) => [ride, ...h]);
  }, []);

  return { currentRide, setCurrentRide, history, setHistory, createRide, cancel, completeLocal };
}
