import { apiFetch } from "@shared/lib/api";
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
    const res = await apiFetch('/api/create-payment-intent', {
      method: 'POST',
      headers,
      body: JSON.stringify({ amount: amountInINR }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
};

export default paymentService;
