import { apiClient } from "@shared/lib/apiBase";
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
    return apiClient.request('/api/rides', {
      method: 'POST',
      headers,
      body: JSON.stringify(input),
    });
  },

  async getPendingRides() {
    const headers: HeadersInit = { ...(await getAuthHeader()) };
    return apiClient.request('/api/driver/pending-rides', { headers });
  },

  async acceptRide(rideId: string) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(await getAuthHeader()),
    };
    return apiClient.request(`/api/rides/${rideId}/accept`, { method: 'POST', headers });
  },

  async startRide(rideId: string) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(await getAuthHeader()),
    };
    return apiClient.request(`/api/rides/${rideId}/start`, { method: 'POST', headers });
  },

  async completeRide(rideId: string, actualFare?: number) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(await getAuthHeader()),
    };
    return apiClient.request(`/api/rides/${rideId}/complete`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ actualFare }),
    });
  },

  async sos(rideId: string) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(await getAuthHeader()),
    };
    return apiClient.request(`/api/rides/${rideId}/sos`, { method: 'POST', headers });
  },
};

export default matchingService;
