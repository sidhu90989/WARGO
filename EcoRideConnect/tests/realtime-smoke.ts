import { io, Socket } from 'socket.io-client';

const SERVER = process.env.BASE_URL || 'http://127.0.0.1:' + (process.env.PORT || '5100');

function delay(ms: number) { return new Promise((res) => setTimeout(res, ms)); }

async function main() {
  console.log('[test] starting realtime smoke against', SERVER);

  let rideId: string | null = null;
  let sawRideRequest = false;
  let sawDriverAssigned = false;
  let sawDriverLocation = false;
  let sawRideStarted = false;
  let sawRideCompleted = false;

  const driver: Socket = io(SERVER, { auth: { userId: 'driver-test-1', userType: 'driver' }, transports: ['websocket'] });
  const rider: Socket = io(SERVER, { auth: { userId: 'rider-test-1', userType: 'rider' }, transports: ['websocket'] });

  await new Promise<void>((resolve, reject) => {
    let ready = 0;
    const check = () => { if (++ready === 2) resolve(); };
    driver.on('connect', check).on('connect_error', reject);
    rider.on('connect', check).on('connect_error', reject);
  });

  // Bring driver online
  driver.emit('driver:online', { location: { lat: 28.6139, lng: 77.209 } });

  // Listen for ride request on driver
  driver.on('ride:request', (ride: any) => {
    console.log('[driver] got ride:request', ride?.id);
    sawRideRequest = true;
    rideId = ride?.id || rideId;
    if (ride?.id) {
      driver.emit('ride:accept', { rideId: ride.id });
    }
  });

  // Rider listeners
  rider.on('ride:driver_assigned', (data: any) => {
    console.log('[rider] driver assigned', data?.rideId);
    sawDriverAssigned = true;
  });
  rider.on('ride:driver_location', (_loc: any) => {
    sawDriverLocation = true;
  });
  rider.on('ride:started', () => { sawRideStarted = true; });
  rider.on('ride:completed', () => { sawRideCompleted = true; });

  // Rider requests a ride
  rider.emit('ride:request', {
    riderId: 'rider-test-1',
    pickup: { lat: 28.61, lng: 77.21, address: 'A' },
    drop: { lat: 28.62, lng: 77.22, address: 'B' },
    vehicleType: 'bike',
    fare: 50,
    distance: 1,
  });

  // Allow time for assignment
  await delay(1500);

  // Send location updates
  driver.emit('driver:location_update', { location: { lat: 28.615, lng: 77.215 } });
  await delay(500);

  // Start and complete ride
  if (rideId) {
    driver.emit('ride:start', { rideId });
    await delay(500);
    driver.emit('ride:complete', { rideId });
  }

  await delay(1000);

  console.log('[assert] request:', sawRideRequest, 'assigned:', sawDriverAssigned, 'loc:', sawDriverLocation, 'started:', sawRideStarted, 'completed:', sawRideCompleted);

  driver.disconnect();
  rider.disconnect();

  const ok = sawRideRequest && sawDriverAssigned && sawDriverLocation && sawRideStarted && sawRideCompleted;
  if (!ok) {
    console.error('Realtime smoke test failed');
    process.exit(1);
  } else {
    console.log('Realtime smoke test passed');
    process.exit(0);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
