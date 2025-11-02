import { apiFetch } from "@shared/lib/api";
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
    const res = await apiFetch('/api/admin/stats', { headers });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  async getActiveRides() {
    const headers: HeadersInit = { ...(await getAuthHeader()) };
    const res = await apiFetch('/api/admin/active-rides', { headers });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
};

export default adminAnalytics;
