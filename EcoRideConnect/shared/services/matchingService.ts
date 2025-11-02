import { apiFetch, withApiBase } from "@shared/lib/api";
import { auth } from "@shared/lib/firebase";

async function getAuthHeader(): Promise<HeadersInit> {
  try {
    const token = await auth?.currentUser?.getIdToken();
    if (token) return { Authorization: `Bearer ${token}` };
  } catch {}
  return {};
}

export interface CreateRideInput {
  pickupLocation: string;
  pickupLat: number;
  pickupLng: number;
  dropoffLocation: string;
  dropoffLat: number;
  dropoffLng: number;
  vehicleType: 'e_rickshaw' | 'e_scooter' | 'cng_car';
  femalePrefRequested?: boolean;
}

export const matchingService = {
  async createRide(input: CreateRideInput) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(await getAuthHeader()),
    };
    const res = await apiFetch('/api/rides', {
      method: 'POST',
      headers,
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async getPendingRides() {
    const headers: HeadersInit = { ...(await getAuthHeader()) };
    const res = await apiFetch('/api/driver/pending-rides', { headers });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async acceptRide(rideId: string) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(await getAuthHeader()),
    };
    const res = await apiFetch(withApiBase(`/api/rides/${rideId}/accept`), { method: 'POST', headers });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async startRide(rideId: string) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(await getAuthHeader()),
    };
    const res = await apiFetch(withApiBase(`/api/rides/${rideId}/start`), { method: 'POST', headers });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async completeRide(rideId: string, actualFare?: number) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(await getAuthHeader()),
    };
    const res = await apiFetch(withApiBase(`/api/rides/${rideId}/complete`), {
      method: 'POST',
      headers,
      body: JSON.stringify({ actualFare }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async sos(rideId: string) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(await getAuthHeader()),
    };
    const res = await apiFetch(withApiBase(`/api/rides/${rideId}/sos`), { method: 'POST', headers });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
};

export default matchingService;
