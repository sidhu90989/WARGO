import { useEffect, useMemo, useRef, useState } from "react";
import { APIProvider, Map, Marker, useMap } from "@vis.gl/react-google-maps";

export type LatLng = { lat: number; lng: number };

export function RideMap({
  apiKey,
  pickup,
  dropoff,
  rider,
  driver,
  height = 320,
  autoFit = false,
  path,
  showUserDot = false,
  mapTheme = "light",
  onMapDrag,
  onMapIdle,
}: {
  apiKey: string;
  pickup?: LatLng;
  dropoff?: LatLng;
  rider?: LatLng | null;
  driver?: LatLng | null;
  height?: number;
  autoFit?: boolean;
  path?: LatLng[];
  showUserDot?: boolean;
  mapTheme?: "light" | "dark";
  onMapDrag?: (center: LatLng) => void;
  onMapIdle?: (center: LatLng) => void;
}) {
  const center = useMemo<LatLng>(() => {
    if (rider) return rider;
    if (driver) return driver;
    if (pickup) return pickup;
    return { lat: 28.6139, lng: 77.209 };
  }, [rider, driver, pickup]);

  const points = useMemo(() => {
    const pts: LatLng[] = [];
    if (pickup) pts.push(pickup);
    if (dropoff) pts.push(dropoff);
    if (rider) pts.push(rider);
    if (driver) pts.push(driver);
    return pts;
  }, [pickup, dropoff, rider, driver]);

  const routePath = useMemo<LatLng[] | undefined>(() => {
    if (path && path.length >= 2) return path;
    if (pickup && dropoff) return [pickup, dropoff];
    return undefined;
  }, [path, pickup, dropoff]);

  function FitBounds({ enable, pts }: { enable: boolean; pts: LatLng[] }) {
    const map = useMap();
    useEffect(() => {
      if (!map || !enable || !pts.length) return;
      // @ts-ignore
      const bounds = new google.maps.LatLngBounds();
      pts.forEach((p) => bounds.extend(p as any));
      try { map.fitBounds(bounds, 64); } catch {}
    }, [map, enable, JSON.stringify(pts)]);
    return null;
  }

  function PolylineRenderer({ p }: { p: LatLng[] }) {
    const map = useMap();
    useEffect(() => {
      if (!map || !p || p.length < 2) return;
      // @ts-ignore
      const poly = new google.maps.Polyline({
        map,
        path: p as any,
        strokeColor: mapTheme === 'dark' ? '#00B894' : '#27AE60',
        strokeOpacity: 0.9,
        strokeWeight: 4,
      });
      return () => { poly.setMap(null); };
    }, [map, JSON.stringify(p), mapTheme]);
    return null;
  }

  function MapEventBridge() {
    const map = useMap();
    const dragRef = useRef(false);
    useEffect(() => {
      if (!map) return;
      const dragListener = map.addListener('drag', () => {
        dragRef.current = true;
        if (onMapDrag) {
          const c = map.getCenter();
          if (c) onMapDrag({ lat: c.lat(), lng: c.lng() });
        }
      });
      const idleListener = map.addListener('idle', () => {
        const c = map.getCenter();
        if (c && onMapIdle) onMapIdle({ lat: c.lat(), lng: c.lng() });
        dragRef.current = false;
      });
      return () => {
        dragListener.remove();
        idleListener.remove();
      };
    }, [map, onMapDrag, onMapIdle]);
    return null;
  }

  function ThemeStyler({ theme }: { theme: 'light' | 'dark' }) {
    const map = useMap();
    useEffect(() => {
      if (!map) return;
      // Apply a dark style dynamically when requested; otherwise reset to default.
      const darkStyles = [
        { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
        { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
        { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
        { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
        { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
        { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#263c3f' }] },
        { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#6b9a76' }] },
        { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] },
        { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212a37' }] },
        { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9ca5b3' }] },
        { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#746855' }] },
        { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#1f2835' }] },
        { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#f3d19c' }] },
        { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#2f3948' }] },
        { featureType: 'transit.station', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
        { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] },
        { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#515c6d' }] },
        { featureType: 'water', elementType: 'labels.text.stroke', stylers: [{ color: '#17263c' }] },
      ] as google.maps.MapTypeStyle[];
      try {
        map.setOptions({ styles: theme === 'dark' ? (darkStyles as any) : [] });
      } catch {}
    }, [map, theme]);
    return null;
  }

  const [userDot, setUserDot] = useState<LatLng | null>(null);
  useEffect(() => {
    if (!showUserDot || typeof window === 'undefined' || !('geolocation' in navigator)) return;
    const id = navigator.geolocation.watchPosition(
      (pos) => setUserDot({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => void 0,
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 },
    );
    return () => { try { navigator.geolocation.clearWatch(id as any); } catch {} };
  }, [showUserDot]);

  return (
    <APIProvider apiKey={apiKey} libraries={["places"]} onLoad={() => {}}>
      <div style={{ height }}>
        <Map
          defaultZoom={13}
          defaultCenter={center}
          gestureHandling="greedy"
          disableDefaultUI
        >
          <ThemeStyler theme={mapTheme} />
          <FitBounds enable={autoFit} pts={points} />
          <MapEventBridge />
          {pickup && <Marker position={pickup} label="P" />}
          {dropoff && <Marker position={dropoff} label="D" />}
          {rider && <Marker position={rider} label="R" />}
          {driver && <Marker position={driver} label="DRV" />}
          {showUserDot && userDot && (
            <Marker position={userDot} label="" />
          )}
          {routePath && <PolylineRenderer p={routePath} />}
        </Map>
      </div>
    </APIProvider>
  );
}
