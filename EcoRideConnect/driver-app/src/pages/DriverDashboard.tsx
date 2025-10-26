import React, { useEffect, useRef, useState } from 'react';
import SuryaRideLayout from '@shared/components/layouts/SuryaRideLayout';
import { Button } from '@shared/components/ui/Button';
import { Card } from '@shared/components/ui/card';
import { Switch } from '@shared/components/ui/switch';
import { useAuth } from '@shared/hooks/useAuth';
import { usePWAInstall } from '@shared/hooks/usePWAInstall';
import { MapComponent, type LatLng } from '@shared/components/maps/MapComponent';
import { initSocket, onRideRequest, offRideRequest, sendDriverLocationUpdate, acceptRideRequest, rejectRideRequest } from '@shared/realtime/socketClient';
import { Menu, Download, Wallet, CheckCircle, XCircle } from 'lucide-react';

type RideRequest = { id: string; pickup: LatLng & { address?: string }; drop: LatLng & { address?: string }; vehicleType: string; fare: number };

export default function DriverDashboard() {
	const { user } = useAuth();
	const { canInstall, installed, isIOS, isStandalone, promptInstall } = usePWAInstall();
	const [online, setOnline] = useState(false);
	const [driverLoc, setDriverLoc] = useState<LatLng | null>(null);
	const [pending, setPending] = useState<RideRequest | null>(null);

	useEffect(() => {
		if (!user?.id) return;
		const s = initSocket(user.id, 'driver');
		onRideRequest((ride: any) => setPending(ride));
		return () => { offRideRequest(); s?.disconnect(); };
	}, [user?.id]);

	// Track driver location
	useEffect(() => {
		if (!online) return;
		let watchId: number | null = null;
		if ('geolocation' in navigator) {
			watchId = navigator.geolocation.watchPosition(
				(pos) => {
					const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
					setDriverLoc(loc);
					if (user?.id) sendDriverLocationUpdate(user.id, loc);
				},
				() => {},
				{ enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
			);
		}
		return () => { if (watchId !== null) navigator.geolocation.clearWatch(watchId); };
	}, [online, user?.id]);

	const header = (
		<div className="p-4 bg-gradient-to-b from-background/90 to-transparent">
			<div className="flex items-center justify-between">
				<Button variant="ghost" size="icon" className="bg-background shadow-lg"><Menu className="h-5 w-5" /></Button>
				<div className="flex items-center gap-3">
					{(canInstall || isIOS) && !installed && !isStandalone && (
						<Button size="sm" variant="outline" className="rounded-full bg-background shadow-lg" onClick={promptInstall}>
							<Download className="h-4 w-4 mr-2" />Install
						</Button>
					)}
					<div className="flex items-center gap-2 bg-background rounded-full px-4 py-2 shadow-lg"><Wallet className="h-4 w-4 text-green-600" /><span className="text-sm font-semibold">₹0</span></div>
				</div>
			</div>
		</div>
	);

	const bottomPanel = (
		<div className="p-4 space-y-4">
			<Card className="p-4 flex items-center justify-between">
				<div className="font-medium">Go Online</div>
				<Switch checked={online} onCheckedChange={setOnline} />
			</Card>
			{pending && (
				<Card className="p-4 space-y-2">
					<div className="font-semibold">Incoming Ride</div>
					<div className="text-sm text-muted-foreground">Fare: ₹{pending.fare} • Vehicle: {pending.vehicleType}</div>
					<div className="flex gap-2">
						<Button className="flex-1" onClick={() => { acceptRideRequest(pending.id, user!.id); setPending(null); }}><CheckCircle className="h-4 w-4 mr-2" />Accept</Button>
						<Button variant="outline" className="flex-1" onClick={() => { rejectRideRequest(pending.id, user!.id); setPending(null); }}><XCircle className="h-4 w-4 mr-2" />Reject</Button>
					</div>
				</Card>
			)}
		</div>
	);

	return (
		<SuryaRideLayout role="driver" header={header} mapArea={<div className="relative w-full h-full"><MapComponent initialZoom={14} /></div>} bottomPanel={bottomPanel} />
	);
}

