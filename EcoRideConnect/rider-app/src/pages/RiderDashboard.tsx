import React, { useEffect, useMemo, useRef, useState } from 'react';
import SuryaRideLayout from '@shared/components/layouts/SuryaRideLayout';
import { useAuth } from '@shared/hooks/useAuth';
import { usePWAInstall } from '@shared/hooks/usePWAInstall';
import { useLocation } from 'wouter';
import { Button } from '@shared/components/ui/Button';
import { Card } from '@shared/components/ui/card';
import { Input } from '@shared/components/ui/Input';
import { Badge } from '@shared/components/ui/badge';
import { MapComponent, type LatLng } from '@shared/components/maps/MapComponent';
import { calculateDistance, estimateFare } from '@shared/utils/mapUtils';
import {
	initSocket,
	onDriverAssigned,
	onDriverLocationUpdate,
	onRideStatusUpdate,
	removeRiderListeners,
	requestRide,
	type RideDetails,
	type RideRequest,
} from '@shared/realtime/socketClient';
import { Menu, Wallet, Download, Clock, IndianRupee, Bike, Car, X, History, User, Settings, LogOut, Navigation } from 'lucide-react';

type BookingStep = 'location' | 'vehicle' | 'searching' | 'active';
type VehicleType = 'auto' | 'bike' | 'car';

interface VehicleOption {
	type: VehicleType;
	name: string;
	eta: number;
	fare: number;
	capacity: string;
}

export default function RiderDashboard() {
	const { user, signOut } = useAuth();
	const [, setLocation] = useLocation();
	const { canInstall, installed, isIOS, isStandalone, promptInstall } = usePWAInstall();

	const [pickup, setPickup] = useState<LatLng | null>(null);
	const [drop, setDrop] = useState<LatLng | null>(null);
	const [bookingStep, setBookingStep] = useState<BookingStep>('location');
	const [vehicleOptions, setVehicleOptions] = useState<VehicleOption[]>([]);
	const [selectedVehicle, setSelectedVehicle] = useState<VehicleType | null>(null);
	const [currentRide, setCurrentRide] = useState<RideDetails | null>(null);
	const [showMenu, setShowMenu] = useState(false);
	const [driverLoc, setDriverLoc] = useState<LatLng | null>(null);

	// Init realtime
	useEffect(() => {
		if (!user?.id) return;
		const s = initSocket(user.id, 'rider');
		onDriverAssigned((data) => {
			setBookingStep('active');
		});
		onRideStatusUpdate((ride) => {
			setCurrentRide(ride);
			if (ride.status === 'completed') {
				setBookingStep('location');
				setDrop(null);
				setSelectedVehicle(null);
				setCurrentRide(null);
			}
		});
		onDriverLocationUpdate((loc) => setDriverLoc(loc));
		return () => { removeRiderListeners(); s?.disconnect(); };
	}, [user?.id]);

	// Calculate options when both points set
	useEffect(() => {
		if (!pickup || !drop) return;
		const distKm = calculateDistance(pickup.lat, pickup.lng, drop.lat, drop.lng);
		const mk = (type: VehicleType, name: string, speed: number, capacity: string): VehicleOption => ({
			type,
			name,
			eta: Math.max(2, Math.ceil((distKm / Math.max(speed, 5)) * 60)),
			fare: Math.round((estimateFare(distKm, 'E-Scooter') + (type === 'car' ? 20 : type === 'auto' ? 10 : 0)) * 100) / 100,
			capacity,
		});
		setVehicleOptions([
			mk('auto', 'Auto', 22, '3 seats'),
			mk('bike', 'Bike', 28, '1 seat'),
			mk('car', 'Prime Sedan', 24, '4 seats'),
		]);
		setBookingStep('vehicle');
	}, [pickup?.lat, pickup?.lng, drop?.lat, drop?.lng]);

	const handleConfirmRide = () => {
		if (!pickup || !drop || !selectedVehicle || !user?.id) return;
		const opt = vehicleOptions.find(v => v.type === selectedVehicle);
		if (!opt) return;
		const rideRequest: RideRequest = {
			riderId: user.id,
			pickup: { ...pickup, address: 'Pickup' },
			drop: { ...drop, address: 'Drop' },
			vehicleType: selectedVehicle,
			fare: opt.fare,
			distance: 0,
		};
		requestRide(rideRequest);
		setBookingStep('searching');
	};

	if (!user) { setLocation('/login'); return null; }

	const header = (
		<div className="p-4 bg-gradient-to-b from-background/90 to-transparent">
			<div className="flex items-center justify-between">
				<Button variant="ghost" size="icon" className="bg-background shadow-lg" onClick={() => setShowMenu(true)}>
					<Menu className="h-5 w-5" />
				</Button>
				<div className="flex items-center gap-2">
					{(canInstall || isIOS) && !installed && !isStandalone && (
						<Button size="sm" variant="outline" className="rounded-full bg-background shadow-lg" onClick={promptInstall}>
							<Download className="h-4 w-4 mr-2" />
							Install Surya Ride
						</Button>
					)}
					<div className="flex items-center gap-2 bg-background rounded-full px-4 py-2 shadow-lg">
						<Wallet className="h-4 w-4 text-green-600" /><span className="text-sm font-semibold">₹0</span>
					</div>
				</div>
			</div>
		</div>
	);

	const mapArea = (
		<div className="relative w-full h-full">
			<MapComponent drawRoute pickup={pickup} drop={drop} onPickupSelected={setPickup} onDropSelected={setDrop} style={{ height: '100%' }} />
		</div>
	);

	const bottomPanel = (
		<>
			{bookingStep === 'location' && (
				<div className="bg-background rounded-t-3xl shadow-2xl p-6 max-h-[50vh] overflow-y-auto">
					<div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6" />
					<h2 className="text-xl font-bold mb-4">Tap map to set pickup and drop</h2>
					<p className="text-sm text-muted-foreground">First tap sets pickup, second tap sets drop. Adjust by tapping again.</p>
				</div>
			)}
			{bookingStep === 'vehicle' && (
				<div className="bg-background rounded-t-3xl shadow-2xl p-6 max-h-[70vh] overflow-y-auto">
					<div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
					<Button variant="ghost" size="icon" className="absolute top-4 right-4" onClick={() => setBookingStep('location')}><X className="h-5 w-5" /></Button>
					<h2 className="text-xl font-bold mb-4">Choose your ride</h2>
					<div className="space-y-3">
						{vehicleOptions.map((v) => (
							<Card key={v.type} className={`p-4 cursor-pointer ${selectedVehicle === v.type ? 'border-green-600 border-2 bg-green-50' : ''}`} onClick={() => setSelectedVehicle(v.type)}>
								<div className="flex items-center justify-between">
									<div>
										<div className="font-semibold">{v.name}</div>
										<p className="text-sm text-gray-600 flex items-center gap-2"><Clock className="h-3 w-3" />{v.eta} mins • {v.capacity}</p>
									</div>
									<div className="flex items-center font-bold text-lg"><IndianRupee className="h-4 w-4" />{v.fare}</div>
								</div>
							</Card>
						))}
					</div>
					<Button className="w-full mt-6 h-12" disabled={!selectedVehicle} onClick={handleConfirmRide}>Confirm Ride</Button>
				</div>
			)}
			{bookingStep === 'searching' && (
				<div className="bg-background rounded-t-3xl shadow-2xl p-8 text-center">
					<div className="mx-auto mb-4 animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
					<h2 className="text-xl font-bold mb-2">Finding your driver...</h2>
					<p className="text-gray-600">This usually takes a few seconds</p>
					<Button variant="outline" className="mt-6" onClick={() => setBookingStep('location')}>Cancel</Button>
				</div>
			)}
			{bookingStep === 'active' && currentRide && (
				<div className="bg-background rounded-t-3xl shadow-2xl p-6">
					<div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
					<div className="flex items-center gap-4 mb-4">
						<div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center"><User className="h-6 w-6" /></div>
						<div className="flex-1">
							<h3 className="font-semibold">Driver Assigned</h3>
							<p className="text-sm text-gray-600">{selectedVehicle?.toUpperCase()} • live</p>
						</div>
						<Button size="icon" variant="outline"><Navigation className="h-5 w-5" /></Button>
					</div>
				</div>
			)}
		</>
	);

	return (
		<>
			<SuryaRideLayout role="rider" header={header} mapArea={mapArea} bottomPanel={bottomPanel} />
			{showMenu && (
				<div className="fixed inset-0 bg-black/40 z-50" onClick={() => setShowMenu(false)}>
					<div className="absolute right-0 top-0 h-full w-80 bg-background p-4" onClick={(e) => e.stopPropagation()}>
						<div className="space-y-2">
							<Button variant="ghost" className="w-full justify-start" onClick={() => { setShowMenu(false); setLocation('/rider/history'); }}><History className="mr-2 h-4 w-4" />Ride History</Button>
							<Button variant="ghost" className="w-full justify-start" onClick={() => { setShowMenu(false); setLocation('/rider/wallet'); }}><Wallet className="mr-2 h-4 w-4" />Wallet</Button>
							<Button variant="ghost" className="w-full justify-start" onClick={() => { setShowMenu(false); setLocation('/rider/settings'); }}><Settings className="mr-2 h-4 w-4" />Settings</Button>
							<hr className="my-2" />
							<Button variant="ghost" className="w-full justify-start text-red-600" onClick={() => { signOut(); setLocation('/login'); }}><LogOut className="mr-2 h-4 w-4" />Sign Out</Button>
						</div>
					</div>
				</div>
			)}
		</>
	);
}

