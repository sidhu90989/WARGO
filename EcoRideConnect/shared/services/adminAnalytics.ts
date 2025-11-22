import { apiClient } from "@shared/lib/apiBase";
import { auth } from "@shared/lib/firebase";

async function getAuthHeader(): Promise<HeadersInit> {
  try {
    const token = await auth?.currentUser?.getIdToken();
    if (token) return { Authorization: `Bearer ${token}` };
  } catch {}
  return {};
}

export const adminAnalytics = {
  async getStats() {
    const headers: HeadersInit = { ...(await getAuthHeader()) };
    return apiClient.request('/api/admin/stats', { headers });
  },
  async getActiveRides() {
    const headers: HeadersInit = { ...(await getAuthHeader()) };
    return apiClient.request('/api/admin/active-rides', { headers });
  },
};

export default adminAnalytics;
