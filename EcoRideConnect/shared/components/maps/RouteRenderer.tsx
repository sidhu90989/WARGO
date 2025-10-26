import { useEffect, useRef } from 'react';
import { useMap } from '@vis.gl/react-google-maps';

export type LatLng = google.maps.LatLngLiteral;

export function RouteRenderer({ path, color = '#1a73e8', weight = 5 }: { path: LatLng[]; color?: string; weight?: number }) {
  const map = useMap();
  const polylineRef = useRef<google.maps.Polyline | null>(null);

  useEffect(() => {
    if (!map) return;
    if (!path || path.length === 0) {
      polylineRef.current?.setMap(null);
      polylineRef.current = null;
      return;
    }
    if (!polylineRef.current) {
      polylineRef.current = new google.maps.Polyline({ path, strokeColor: color, strokeOpacity: 0.9, strokeWeight: weight, map });
    } else {
      polylineRef.current.setPath(path);
      if (!polylineRef.current.getMap()) polylineRef.current.setMap(map);
    }
  }, [map, path, color, weight]);

  return null;
}

export default RouteRenderer;
