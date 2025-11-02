// Central API client for all apps
// Uses Vite env (import.meta.env.VITE_API_URL) instead of process.env
export class ApiClient {
  private baseURL: string;

  constructor() {
    const base = (import.meta as any).env?.VITE_API_URL || '';
    this.baseURL = typeof base === 'string' ? base.replace(/\/$/, '') : '';
  }

  async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const response = await fetch(url, {
      credentials: 'include',
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
    // callers can handle non-2xx by catching
    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(text || `Request failed: ${response.status}`);
    }
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) return response.json();
    return (await response.text()) as unknown as T;
  }
}

export const apiClient = new ApiClient();
export default apiClient;
