import { useEffect, useRef, useState } from 'react';

export type GeoPosition = { lat: number; lng: number; accuracy?: number };

export function useLocation(options: PositionOptions = { enableHighAccuracy: true }) {
  const [location, setLocation] = useState<GeoPosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const watchId = useRef<number | null>(null);

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setError('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy }),
      (err) => setError(err.message),
      options
    );

    watchId.current = navigator.geolocation.watchPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy }),
      (err) => setError(err.message),
      options
    );

    return () => {
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    };
  }, []);

  return { location, error };
}
