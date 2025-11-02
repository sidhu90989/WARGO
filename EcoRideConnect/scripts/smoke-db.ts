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

import http from 'node:http';
import https from 'node:https';
import { URL } from 'node:url';

const BASE = process.env.API_URL || 'http://localhost:5000';

function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

function extractCookieHeader(res: Response): string | undefined {
  const h: any = (res as any).headers;
  try {
    if (h && typeof h.getSetCookie === 'function') {
      const arr = h.getSetCookie();
      if (arr && arr.length) return arr[0] as string;
    }
  } catch {}
  const sc = res.headers.get('set-cookie');
  return sc || undefined;
}

function extractCookie(setCookie: string | null | undefined): string | undefined {
  if (!setCookie) return undefined;
  // grab the first cookie pair, e.g., "connect.sid=...; Path=/; HttpOnly; ..."
  const match = setCookie.match(/^([^;]+);/);
  return match ? match[1] : undefined;
}

type ResPkg = { status: number; headers: http.IncomingHttpHeaders; body: string };

function requestJson(method: string, path: string, headers: Record<string,string> = {}, body?: any): Promise<ResPkg> {
  return new Promise((resolve, reject) => {
    const u = new URL(BASE);
    const isHttps = u.protocol === 'https:';
    const client = isHttps ? https : http;
    const data = body ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined;
    const req = client.request({
      protocol: u.protocol,
      hostname: u.hostname,
      port: u.port ? Number(u.port) : (isHttps ? 443 : 80),
      path,
      method,
      headers: {
        'Accept': 'application/json',
        ...(data ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data).toString() } : {}),
        ...headers,
      },
    }, (res) => {
      const chunks: Buffer[] = [];
      res.on('data', (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
      res.on('end', () => {
        resolve({ status: res.statusCode || 0, headers: res.headers, body: Buffer.concat(chunks).toString('utf8') });
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

type Auth = { cookie?: string; email?: string; role?: 'rider'|'driver'|'admin' };

function authHeaders(auth: Auth): Record<string,string> {
  if (auth.cookie) return { 'Cookie': auth.cookie };
  const hdrs: Record<string,string> = {};
  if (auth.email) hdrs['x-simple-email'] = auth.email;
  if (auth.role) hdrs['x-simple-role'] = auth.role;
  return hdrs;
}

async function login(email: string, name: string, role: 'rider'|'driver'|'admin'): Promise<Auth> {
  const resp = await requestJson('POST', '/api/auth/login', {}, { email, name, role });
  if (resp.status < 200 || resp.status >= 300) throw new Error(`login failed: ${resp.status} ${resp.body}`);
  const sc = resp.headers['set-cookie'];
  const headerStr = Array.isArray(sc) ? sc[0] : sc || '';
  const cookie = extractCookie(headerStr);
  if (!cookie) {
    // Fallback to header-bypass auth when cookies are not persisted in this environment
    return { email, role };
  }
  return { cookie };
}

async function completeProfile(auth: Auth, body: any) {
  const r = await requestJson('POST', '/api/auth/complete-profile', authHeaders(auth), body);
  const json = JSON.parse(r.body);
  if (r.status < 200 || r.status >= 300) throw new Error(`complete-profile: ${r.status} ${JSON.stringify(json)}`);
  return json;
}

async function createRide(auth: Auth, body: any) {
  const r = await requestJson('POST', '/api/rides', authHeaders(auth), body);
  const json = JSON.parse(r.body);
  if (r.status < 200 || r.status >= 300) throw new Error(`create-ride: ${r.status} ${JSON.stringify(json)}`);
  return json;
}

async function setDriverAvailability(auth: Auth, available: boolean) {
  const r = await requestJson('PUT', '/api/driver/availability', authHeaders(auth), { available });
  const json = JSON.parse(r.body);
  if (r.status < 200 || r.status >= 300) throw new Error(`availability: ${r.status} ${JSON.stringify(json)}`);
  return json;
}

async function listPending(auth: Auth) {
  const r = await requestJson('GET', '/api/driver/pending-rides', authHeaders(auth));
  const json = JSON.parse(r.body);
  if (r.status < 200 || r.status >= 300) throw new Error(`pending-rides: ${r.status} ${JSON.stringify(json)}`);
  return json as any[];
}

async function acceptRide(auth: Auth, rideId: string) {
  const r = await requestJson('POST', `/api/rides/${rideId}/accept`, authHeaders(auth));
  const json = JSON.parse(r.body);
  if (r.status < 200 || r.status >= 300) throw new Error(`accept: ${r.status} ${JSON.stringify(json)}`);
  return json;
}

async function startRide(auth: Auth, rideId: string) {
  const r = await requestJson('POST', `/api/rides/${rideId}/start`, authHeaders(auth));
  const json = JSON.parse(r.body);
  if (r.status < 200 || r.status >= 300) throw new Error(`start: ${r.status} ${JSON.stringify(json)}`);
  return json;
}

async function completeRide(auth: Auth, rideId: string, actualFare: number) {
  const r = await requestJson('POST', `/api/rides/${rideId}/complete`, authHeaders(auth), { actualFare });
  const json = JSON.parse(r.body);
  if (r.status < 200 || r.status >= 300) throw new Error(`complete: ${r.status} ${JSON.stringify(json)}`);
  return json;
}

async function adminStats(auth: Auth) {
  const r = await requestJson('GET', `/api/admin/stats`, authHeaders(auth));
  const json = JSON.parse(r.body);
  if (r.status < 200 || r.status >= 300) throw new Error(`admin-stats: ${r.status} ${JSON.stringify(json)}`);
  return json;
}

async function main() {
  const health = await fetch(`${BASE}/api/health`).then(r => r.json());
  console.log('health:', health);

  // Rider flow
  const riderAuth = await login('rider@demo.com', 'Rider Demo', 'rider');
  console.log('rider auth:', riderAuth.cookie ? 'cookie' : 'header');
  const rider = await completeProfile(riderAuth, { name: 'Rider Demo', role: 'rider', phone: '+911234567890' });
  console.log('rider profile:', rider.id);

  // Create a ride
  const ride = await createRide(riderAuth, {
    pickupLocation: 'Connaught Place', pickupLat: 28.6328, pickupLng: 77.2197,
    dropoffLocation: 'India Gate', dropoffLat: 28.6129, dropoffLng: 77.2295,
    vehicleType: 'e_rickshaw', femalePrefRequested: false,
  });
  console.log('ride created:', ride.id);

  // Driver flow
  const driverAuth = await login('driver@demo.com', 'Driver Demo', 'driver');
  console.log('driver auth:', driverAuth.cookie ? 'cookie' : 'header');
  const driver = await completeProfile(driverAuth, { name: 'Driver Demo', role: 'driver', phone: '+911234567891' });
  console.log('driver profile:', driver.id);

  await setDriverAvailability(driverAuth, true);
  await sleep(250);
  const pending = await listPending(driverAuth);
  console.log('pending rides:', pending.map(p => p.id));

  // Accept/start/complete the ride
  const accepted = await acceptRide(driverAuth, ride.id);
  console.log('accepted:', accepted.status);

  const started = await startRide(driverAuth, ride.id);
  console.log('started:', started.status);

  const completed = await completeRide(driverAuth, ride.id, Number(accepted.estimatedFare || '45'));
  console.log('completed:', completed.status);

  // Admin stats
  const adminAuth = await login('admin@demo.com', 'Admin Demo', 'admin');
  await completeProfile(adminAuth, { name: 'Admin Demo', role: 'admin', phone: '+919999999999' });
  const stats = await adminStats(adminAuth);
  console.log('admin stats:', stats);
}

main().catch((e) => {
  console.error('DB smoke failed:', e);
  process.exit(1);
});
