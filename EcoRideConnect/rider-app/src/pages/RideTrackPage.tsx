import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { Card } from '@shared/components/ui/card';
import { Button } from '@shared/components/ui/Button';
import { Badge } from '@shared/components/ui/badge';
import { MapComponent, type LatLng } from '@shared/components/maps/MapComponent';
import { withApiBase, apiFetch } from '@shared/lib/apiBase';
import { MapPin, Navigation, Car, ShieldAlert, ArrowLeft } from 'lucide-react';

type Ride = {
	id: string;
	pickupLocation: string;
	dropoffLocation: string;
	status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
	estimatedFare?: number | string;
	actualFare?: number | string;
	pickupLat?: number | string;
	pickupLng?: number | string;
	dropoffLat?: number | string;
	dropoffLng?: number | string;
};

export default function RideTrackPage() {
	const params = useParams<{ id: string }>();
	const rideId = params?.id || '';
	const [, setLocation] = useLocation();
	const [ride, setRide] = useState<Ride | null>(null);
	const [loading, setLoading] = useState(true);
	const [riderLoc, setRiderLoc] = useState<LatLng | null>(null);
	const [driverLoc, setDriverLoc] = useState<LatLng | null>(null);

	const loadRide = async () => {
		const res = await apiFetch(withApiBase(`/api/rides/${rideId}`));
		if (res.ok) setRide(await res.json());
	};

	useEffect(() => {
		(async () => { try { await loadRide(); } finally { setLoading(false); } })();
		const t = setInterval(loadRide, 5000);
		return () => clearInterval(t);
	}, [rideId]);

	useEffect(() => {
		let watchId: number | null = null;
		if ('geolocation' in navigator) {
			watchId = navigator.geolocation.watchPosition(
				(pos) => setRiderLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
				() => {},
				{ enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
			);
		}
		return () => { if (watchId !== null) navigator.geolocation.clearWatch(watchId); };
	}, []);

	if (loading) return <div className="p-6">Loading...</div>;
	if (!ride) return <div className="p-6">Ride not found.</div>;

	const pickup = ride?.pickupLat && ride?.pickupLng ? { lat: Number(ride.pickupLat), lng: Number(ride.pickupLng) } : undefined;
	const drop = ride?.dropoffLat && ride?.dropoffLng ? { lat: Number(ride.dropoffLat), lng: Number(ride.dropoffLng) } : undefined;

	return (
		<div className="min-h-screen bg-background p-4 max-w-3xl mx-auto space-y-4">
			<header className="sticky top-0 z-50 bg-card border-b">
				<div className="flex items-center gap-4 px-4 py-3">
					<Button size="icon" variant="ghost" onClick={() => setLocation('/rider')}><ArrowLeft className="h-5 w-5" /></Button>
					<h1 className="font-serif text-xl font-bold">Ride Tracking</h1>
				</div>
			</header>
			<Card className="overflow-hidden">
				<div style={{ height: 260 }}>
					<MapComponent pickup={pickup ?? null} drop={drop ?? null} style={{ height: 260 }} />
				</div>
			</Card>
			<Card className="p-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="p-2 bg-primary/10 rounded-md"><Car className="h-5 w-5 text-primary" /></div>
						<div>
							<div className="font-semibold">Ride #{ride.id?.slice(0, 6)}</div>
							<div className="text-xs text-muted-foreground uppercase">{String(ride.status).replace('_',' ')}</div>
						</div>
					</div>
					<Badge>{String(ride.status).replace('_',' ')}</Badge>
				</div>
			</Card>
			<Card className="p-6">
				<div className="space-y-2">
					<div className="flex items-center gap-2"><MapPin className="h-4 w-4" /><div><div className="text-xs text-muted-foreground">Pickup</div><div className="font-medium">{ride.pickupLocation}</div></div></div>
					<div className="flex items-center gap-2"><Navigation className="h-4 w-4" /><div><div className="text-xs text-muted-foreground">Dropoff</div><div className="font-medium">{ride.dropoffLocation}</div></div></div>
				</div>
			</Card>
			<Card className="p-6">
				<div className="flex items-center justify-between">
					<div>
						<div className="text-sm text-muted-foreground">Fare</div>
						<div className="text-2xl font-bold">₹{Number(ride.actualFare ?? ride.estimatedFare ?? 0).toFixed(0)}</div>
					</div>
					<Button variant="destructive"><ShieldAlert className="h-4 w-4 mr-2" />SOS</Button>
				</div>
			</Card>
		</div>
	);
}

