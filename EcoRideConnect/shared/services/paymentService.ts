import { apiClient } from "@shared/lib/apiBase";
import { auth } from "@shared/lib/firebase";

async function getAuthHeader(): Promise<HeadersInit> {
  try {
    const token = await auth?.currentUser?.getIdToken();
    if (token) return { Authorization: `Bearer ${token}` };
  } catch {}
  return {};
}

export const paymentService = {
  async createPaymentIntent(amountInINR: number): Promise<{ clientSecret: string }> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(await getAuthHeader()),
    };
    return apiClient.request('/api/create-payment-intent', {
      method: 'POST',
      headers,
      body: JSON.stringify({ amount: amountInINR }),
    });
  },
};

export default paymentService;
