/*
  Simple smoke test for SIMPLE_AUTH mode without relying on cookies.
  Sends header-based identity and exercises profile completion and ride creation.
*/

const base = process.env.API_URL || 'http://localhost:5000';

async function run() {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-simple-email': 'rider@demo.com',
    'x-simple-role': 'rider',
  };

  const profileBody = {
    name: 'Rider Demo',
    phone: '+911234567890',
    role: 'rider',
  };

  const rideBody = {
    pickupLocation: 'Connaught Place',
    pickupLat: 28.6328,
    pickupLng: 77.2197,
    dropoffLocation: 'India Gate',
    dropoffLat: 28.6129,
    dropoffLng: 77.2295,
    vehicleType: 'e_rickshaw',
    femalePrefRequested: false,
  };

  const pretty = (o: any) => JSON.stringify(o, null, 2);

  const healthRes = await fetch(`${base}/api/health`);
  console.log('GET /api/health ->', await healthRes.json());
  await new Promise((r) => setTimeout(r, 200));

  const completeRes = await fetch(`${base}/api/auth/complete-profile`, {
    method: 'POST',
    headers,
    body: JSON.stringify(profileBody),
  });
  const completeJson = await completeRes.json();
  console.log('POST /api/auth/complete-profile ->', completeRes.status, '\n', pretty(completeJson));
  await new Promise((r) => setTimeout(r, 200));

  const rideRes = await fetch(`${base}/api/rides`, {
    method: 'POST',
    headers,
    body: JSON.stringify(rideBody),
  });
  const rideJson = await rideRes.json();
  console.log('POST /api/rides ->', rideRes.status, '\n', pretty(rideJson));
}

run().catch((e) => {
  console.error('Smoke test failed:', e);
  process.exit(1);
});
export {};
