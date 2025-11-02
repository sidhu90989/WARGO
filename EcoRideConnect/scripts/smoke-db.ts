/*
  DB-mode smoke test.
  Preconditions:
    - API is running with SIMPLE_AUTH=false and ALLOW_SIMPLE_AUTH_ROUTES=true
    - DATABASE_URL points to a reachable Postgres and migrations are applied
  What it does:
    - Logs in as rider and completes profile
    - Creates a ride
    - Logs in as driver, completes profile, sets availability, lists pending rides
    - Driver accepts, starts and completes the ride
    - Logs in as admin and fetches admin stats
  Note:
    Uses cookie-based session by parsing Set-Cookie from the login response.
*/

const BASE = process.env.API_URL || 'http://localhost:5000';

function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

function extractCookie(setCookie: string | null): string | undefined {
  if (!setCookie) return undefined;
  // grab the first cookie pair, e.g., "connect.sid=...; Path=/; HttpOnly; ..."
  const match = setCookie.match(/^([^;]+);/);
  return match ? match[1] : undefined;
}

async function login(email: string, name: string, role: 'rider'|'driver'|'admin'): Promise<string> {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, name, role }),
  });
  if (!res.ok) throw new Error(`login failed: ${res.status}`);
  const cookie = extractCookie(res.headers.get('set-cookie'));
  if (!cookie) throw new Error('no session cookie received');
  return cookie;
}

async function completeProfile(cookie: string, body: any) {
  const res = await fetch(`${BASE}/api/auth/complete-profile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`complete-profile: ${res.status} ${JSON.stringify(json)}`);
  return json;
}

async function createRide(cookie: string, body: any) {
  const res = await fetch(`${BASE}/api/rides`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`create-ride: ${res.status} ${JSON.stringify(json)}`);
  return json;
}

async function setDriverAvailability(cookie: string, available: boolean) {
  const res = await fetch(`${BASE}/api/driver/availability`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
    body: JSON.stringify({ available }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`availability: ${res.status} ${JSON.stringify(json)}`);
  return json;
}

async function listPending(cookie: string) {
  const res = await fetch(`${BASE}/api/driver/pending-rides`, {
    headers: { 'Cookie': cookie },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`pending-rides: ${res.status} ${JSON.stringify(json)}`);
  return json as any[];
}

async function acceptRide(cookie: string, rideId: string) {
  const res = await fetch(`${BASE}/api/rides/${rideId}/accept`, {
    method: 'POST',
    headers: { 'Cookie': cookie },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`accept: ${res.status} ${JSON.stringify(json)}`);
  return json;
}

async function startRide(cookie: string, rideId: string) {
  const res = await fetch(`${BASE}/api/rides/${rideId}/start`, {
    method: 'POST',
    headers: { 'Cookie': cookie },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`start: ${res.status} ${JSON.stringify(json)}`);
  return json;
}

async function completeRide(cookie: string, rideId: string, actualFare: number) {
  const res = await fetch(`${BASE}/api/rides/${rideId}/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
    body: JSON.stringify({ actualFare }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`complete: ${res.status} ${JSON.stringify(json)}`);
  return json;
}

async function adminStats(cookie: string) {
  const res = await fetch(`${BASE}/api/admin/stats`, {
    headers: { 'Cookie': cookie },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`admin-stats: ${res.status} ${JSON.stringify(json)}`);
  return json;
}

async function main() {
  const health = await fetch(`${BASE}/api/health`).then(r => r.json());
  console.log('health:', health);

  // Rider flow
  const riderCookie = await login('rider@demo.com', 'Rider Demo', 'rider');
  console.log('rider cookie:', riderCookie.split('=')[0], '...');
  const rider = await completeProfile(riderCookie, { name: 'Rider Demo', role: 'rider', phone: '+911234567890' });
  console.log('rider profile:', rider.id);

  // Create a ride
  const ride = await createRide(riderCookie, {
    pickupLocation: 'Connaught Place', pickupLat: 28.6328, pickupLng: 77.2197,
    dropoffLocation: 'India Gate', dropoffLat: 28.6129, dropoffLng: 77.2295,
    vehicleType: 'e_rickshaw', femalePrefRequested: false,
  });
  console.log('ride created:', ride.id);

  // Driver flow
  const driverCookie = await login('driver@demo.com', 'Driver Demo', 'driver');
  console.log('driver cookie:', driverCookie.split('=')[0], '...');
  const driver = await completeProfile(driverCookie, { name: 'Driver Demo', role: 'driver', phone: '+911234567891' });
  console.log('driver profile:', driver.id);

  await setDriverAvailability(driverCookie, true);
  await sleep(250);
  const pending = await listPending(driverCookie);
  console.log('pending rides:', pending.map(p => p.id));

  // Accept/start/complete the ride
  const accepted = await acceptRide(driverCookie, ride.id);
  console.log('accepted:', accepted.status);

  const started = await startRide(driverCookie, ride.id);
  console.log('started:', started.status);

  const completed = await completeRide(driverCookie, ride.id, Number(accepted.estimatedFare || '45'));
  console.log('completed:', completed.status);

  // Admin stats
  const adminCookie = await login('admin@demo.com', 'Admin Demo', 'admin');
  const stats = await adminStats(adminCookie);
  console.log('admin stats:', stats);
}

main().catch((e) => {
  console.error('DB smoke failed:', e);
  process.exit(1);
});
/*
  DB-mode smoke test using session login via simple-auth routes.
  Pre-reqs:
    - API running with SIMPLE_AUTH=false and ALLOW_SIMPLE_AUTH_ROUTES=true
    - DATABASE_URL set and migrations applied
  Flow:
    - Rider: login -> complete-profile -> create ride
    - Driver: login -> complete-profile -> availability on -> list pending -> accept -> start -> complete
    - Admin: login -> complete-profile -> stats
*/

const base = process.env.API_URL || 'http://localhost:5000';

type CookieHeader = Record<string, string>;

function parseSetCookie(setCookie: string | null): string | undefined {
  if (!setCookie) return undefined;
  // Take only the first cookie pair before ;
  const parts = setCookie.split(',');
  // If multiple Set-Cookie headers were concatenated, try the first one with a key=value;
  const first = parts[0];
  const pair = first.split(';')[0];
  return pair.trim();
}

async function post(path: string, body: any, headers: CookieHeader = {}): Promise<{ status: number; json: any; cookie?: string }>
{
  const res = await fetch(`${base}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
    redirect: 'manual',
  });
  const text = await res.text();
  let json: any;
  try { json = JSON.parse(text); } catch { json = { raw: text }; }
  const cookie = parseSetCookie(res.headers.get('set-cookie'));
  return { status: res.status, json, cookie };
}

async function get(path: string, headers: CookieHeader = {}): Promise<{ status: number; json: any }>
{
  const res = await fetch(`${base}${path}`, { headers });
  const text = await res.text();
  let json: any;
  try { json = JSON.parse(text); } catch { json = { raw: text }; }
  return { status: res.status, json };
}

async function put(path: string, body: any, headers: CookieHeader = {}): Promise<{ status: number; json: any }>
{
  const res = await fetch(`${base}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json: any;
  try { json = JSON.parse(text); } catch { json = { raw: text }; }
  return { status: res.status, json };
}

async function run() {
  const pretty = (o: any) => JSON.stringify(o, null, 2);

  // Health
  const health = await get('/api/health');
  console.log('GET /api/health ->', health.status, pretty(health.json));

  // Rider session
  const riderLogin = await post('/api/auth/login', { email: 'rider@demo.com', name: 'Rider Demo', role: 'rider' });
  if (!riderLogin.cookie) throw new Error('No session cookie from rider login');
  const riderCookieHeader = { Cookie: riderLogin.cookie };
  console.log('Rider login ->', riderLogin.status);

  const riderProfile = await post('/api/auth/complete-profile', { name: 'Rider Demo', phone: '+911234567890', role: 'rider' }, riderCookieHeader);
  if (riderProfile.status !== 200) throw new Error('Rider complete-profile failed: ' + pretty(riderProfile.json));
  console.log('Rider profile ->', riderProfile.status);

  const rideCreate = await post('/api/rides', {
    pickupLocation: 'Connaught Place', pickupLat: 28.6328, pickupLng: 77.2197,
    dropoffLocation: 'India Gate', dropoffLat: 28.6129, dropoffLng: 77.2295,
    vehicleType: 'e_rickshaw', femalePrefRequested: false,
  }, riderCookieHeader);
  if (rideCreate.status !== 200) throw new Error('Ride create failed: ' + pretty(rideCreate.json));
  const rideId = rideCreate.json.id;
  console.log('Ride created ->', rideId);

  // Driver session
  const driverLogin = await post('/api/auth/login', { email: 'driver@demo.com', name: 'Driver Demo', role: 'driver' });
  if (!driverLogin.cookie) throw new Error('No session cookie from driver login');
  const driverCookieHeader = { Cookie: driverLogin.cookie };
  console.log('Driver login ->', driverLogin.status);

  const driverProfile = await post('/api/auth/complete-profile', { name: 'Driver Demo', phone: '+911111111111', role: 'driver' }, driverCookieHeader);
  if (driverProfile.status !== 200) throw new Error('Driver complete-profile failed: ' + pretty(driverProfile.json));
  console.log('Driver profile ->', driverProfile.status);

  const driverAvail = await put('/api/driver/availability', { available: true }, driverCookieHeader);
  if (driverAvail.status !== 200) throw new Error('Driver availability failed: ' + pretty(driverAvail.json));
  console.log('Driver availability ->', driverAvail.status);

  const pending = await get('/api/driver/pending-rides', driverCookieHeader);
  console.log('Driver pending ->', pending.status, Array.isArray(pending.json) ? pending.json.length : pending.json);

  const accept = await post(`/api/rides/${rideId}/accept`, {}, driverCookieHeader);
  if (accept.status !== 200) throw new Error('Accept failed: ' + pretty(accept.json));
  console.log('Ride accepted ->', accept.status);

  const start = await post(`/api/rides/${rideId}/start`, {}, driverCookieHeader);
  if (start.status !== 200) throw new Error('Start failed: ' + pretty(start.json));
  console.log('Ride started ->', start.status);

  const complete = await post(`/api/rides/${rideId}/complete`, { actualFare: 50 }, driverCookieHeader);
  if (complete.status !== 200) throw new Error('Complete failed: ' + pretty(complete.json));
  console.log('Ride completed ->', complete.status);

  // Admin session
  const adminLogin = await post('/api/auth/login', { email: 'admin@demo.com', name: 'Admin Demo', role: 'admin' });
  if (!adminLogin.cookie) throw new Error('No session cookie from admin login');
  const adminCookieHeader = { Cookie: adminLogin.cookie };

  const adminProfile = await post('/api/auth/complete-profile', { name: 'Admin Demo', phone: '+919999999999', role: 'admin' }, adminCookieHeader);
  if (adminProfile.status !== 200) throw new Error('Admin complete-profile failed: ' + pretty(adminProfile.json));

  const adminStats = await get('/api/admin/stats', adminCookieHeader);
  console.log('Admin stats ->', adminStats.status, pretty(adminStats.json));

  console.log('\nAll DB-mode smoke steps passed.');
}

run().catch((e) => {
  console.error('Smoke DB test failed:', e);
  process.exit(1);
});
export {};
