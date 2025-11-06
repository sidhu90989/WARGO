/*
  DB-mode smoke test with real Firebase ID token verification.

  Requirements:
    - SIMPLE_AUTH=false on the API server
    - ALLOW_SIMPLE_AUTH_ROUTES=false (to force Bearer token verification)
    - A Firebase Admin service account JSON available at FIREBASE_SERVICE_ACCOUNT_KEY_PATH
    - A Firebase Web API key set in FIREBASE_WEB_API_KEY (any of your app API keys)

  What it does:
    - Initializes firebase-admin from the service account JSON
    - Mints a custom token for a synthetic UID
    - Exchanges the custom token for an ID token via Identity Toolkit REST
    - Calls protected API endpoints using Authorization: Bearer <ID_TOKEN>
*/

import { readFileSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const BASE = process.env.API_URL || 'http://localhost:5000';

async function getIdToken(): Promise<string> {
  const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH || './service-account.json';
  const apiKey = process.env.FIREBASE_WEB_API_KEY;
  if (!apiKey) {
    throw new Error('FIREBASE_WEB_API_KEY is required (use any Firebase Web API key from your project)');
  }

  // Lazy import firebase-admin to avoid requiring it elsewhere
  const admin = await import('firebase-admin');

  // Initialize admin SDK with service account
  const svc = JSON.parse(readFileSync(keyPath, 'utf8')) as any;
  if (!admin.apps.length) {
    admin.initializeApp({ credential: admin.credential.cert(svc) as any });
  }

  const uid = `smoke-${Date.now()}`;
  const customToken = await admin.auth().createCustomToken(uid, { role: 'rider' });

  // Exchange custom token for ID token via REST
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: customToken, returnSecureToken: true }),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(`signInWithCustomToken failed: ${res.status} ${JSON.stringify(json)}`);
  }
  const idToken = json.idToken as string;
  if (!idToken) throw new Error('No idToken in response');
  return idToken;
}

function authHeaders(idToken: string): Record<string,string> {
  return { 'Authorization': `Bearer ${idToken}` };
}

async function request(method: string, path: string, headers: Record<string,string> = {}, body?: any) {
  const url = `${BASE}${path}`;
  const res = await fetch(url, {
    method,
    headers: { 'Accept': 'application/json', ...(body ? { 'Content-Type': 'application/json' } : {}), ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json: any = undefined;
  try { json = JSON.parse(text); } catch {}
  return { status: res.status, headers: res.headers, json, text };
}

function pretty(obj: any) { return JSON.stringify(obj, null, 2); }

async function run() {
  // Wait briefly if server just started
  await sleep(200);

  const idToken = await getIdToken();
  const headers = authHeaders(idToken);

  // Verify health (unprotected but useful)
  const h = await request('GET', '/api/health');
  console.log('GET /api/health ->', h.status, pretty(h.json));

  // Complete profile (id token maps to firebaseUid on server)
  const profileBody = { name: 'Token Rider', role: 'rider', phone: '+919999000001' };
  const p = await request('POST', '/api/auth/complete-profile', headers, profileBody);
  if (p.status < 200 || p.status >= 300) throw new Error(`complete-profile failed: ${p.status} ${pretty(p.json)}`);
  console.log('POST /api/auth/complete-profile ->', p.status, pretty(p.json));

  // Create a ride
  const rideBody = {
    pickupLocation: 'Connaught Place', pickupLat: 28.6328, pickupLng: 77.2197,
    dropoffLocation: 'India Gate', dropoffLat: 28.6129, dropoffLng: 77.2295,
    vehicleType: 'e_rickshaw', femalePrefRequested: false,
  };
  const r = await request('POST', '/api/rides', headers, rideBody);
  if (r.status < 200 || r.status >= 300) throw new Error(`create-ride failed: ${r.status} ${pretty(r.json)}`);
  console.log('POST /api/rides ->', r.status, pretty(r.json));
}

run().catch((e) => {
  console.error('DB token smoke failed:', e);
  process.exit(1);
});
export {};
