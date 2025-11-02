import { useEffect, useRef, useState } from 'react';
import socketService from '@shared/realtime/socketClient';

export function useLocation(userType: 'rider' | 'driver' | 'admin', autoConnect = true) {
  const [coords, setCoords] = useState<{ lat: number; lng: number; accuracy?: number } | null>(null);
  const watchId = useRef<number | null>(null);

  useEffect(() => {
    if (autoConnect) socketService.connect(userType);
    if (!('geolocation' in navigator)) return;

    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy });
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 },
    );

    return () => {
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    };
  }, [userType, autoConnect]);

  return { coords } as const;
}

export default useLocation;
