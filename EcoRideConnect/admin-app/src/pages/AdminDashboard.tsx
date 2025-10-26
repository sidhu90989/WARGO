import React, { useEffect, useState } from 'react';
import SuryaRideLayout from '@shared/components/layouts/SuryaRideLayout';
import { useAuth } from '@shared/hooks/useAuth';
import { Card } from '@shared/components/ui/card';
import { Button } from '@shared/components/ui/Button';
import { initSocket, onAllDriversLocations, onAllActiveRides, onPlatformMetrics, requestAllDrivers } from '@shared/realtime/socketClient';

type DriverLocation = { driverId: string; location: { lat: number; lng: number } };
type Ride = { id: string; status: string };

export default function AdminDashboard() {
	const { user } = useAuth();
	const [drivers, setDrivers] = useState<DriverLocation[]>([]);
	const [rides, setRides] = useState<Ride[]>([]);
	const [metrics, setMetrics] = useState<{ activeDrivers: number; activeRiders: number; ongoingRides: number; todayRevenue: number } | null>(null);

	useEffect(() => {
		if (!user?.id) return;
		const s = initSocket(user.id, 'admin');
		onAllDriversLocations((d: any) => setDrivers(d as any));
		onAllActiveRides((r: any) => setRides(r as any));
		onPlatformMetrics((m: any) => setMetrics(m as any));
		requestAllDrivers();
		return () => { s?.disconnect(); };
	}, [user?.id]);

	const header = (
		<div className="p-4 border-b">
			<div className="text-xl font-semibold">Admin Dashboard</div>
		</div>
	);

	const sidebar = (
		<div className="p-4 space-y-2">
			<Button variant="ghost" className="w-full justify-start">Overview</Button>
			<Button variant="ghost" className="w-full justify-start">Drivers</Button>
			<Button variant="ghost" className="w-full justify-start">Rides</Button>
		</div>
	);

	return (
		<SuryaRideLayout role="admin" header={header} sidebar={sidebar}>
			<div className="p-4 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
				<Card className="p-6"><div className="text-sm text-muted-foreground">Active Drivers</div><div className="text-3xl font-bold">{metrics?.activeDrivers ?? drivers.length}</div></Card>
				<Card className="p-6"><div className="text-sm text-muted-foreground">Ongoing Rides</div><div className="text-3xl font-bold">{metrics?.ongoingRides ?? rides.filter(r=>r.status!=='completed').length}</div></Card>
				<Card className="p-6"><div className="text-sm text-muted-foreground">Today Revenue</div><div className="text-3xl font-bold">₹{metrics?.todayRevenue ?? 0}</div></Card>
				<Card className="p-6 md:col-span-2 lg:col-span-3"><div className="font-semibold mb-2">Recent Rides</div><div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2">{rides.slice(0,6).map((r)=> (<div key={r.id} className="p-3 border rounded">Ride #{String(r.id).slice(0,6)} • {r.status}</div>))}</div></Card>
			</div>
		</SuryaRideLayout>
	);
}

