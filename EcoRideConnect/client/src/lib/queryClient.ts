import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { withApiBase } from "./apiBase";
import { auth } from "./firebase";

const SIMPLE_AUTH = (import.meta as any).env?.VITE_SIMPLE_AUTH === 'true';

async function buildAuthHeaders(base: Record<string, string> = {}): Promise<Record<string, string>> {
  const headers: Record<string, string> = { ...base };
  if (!SIMPLE_AUTH && auth?.currentUser) {
    try {
      const token = await auth.currentUser.getIdToken();
      headers["Authorization"] = `Bearer ${token}`;
    } catch {
      // no token available; treat as unauthenticated
    }
  }
  return headers;
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const ct = res.headers.get("content-type") || "";
    let reason = res.statusText;
    try {
      if (ct.includes("application/json")) {
        const data = await res.json();
        reason = data?.error || data?.message || JSON.stringify(data);
      } else {
        reason = (await res.text()) || res.statusText;
      }
    } catch {
      // fall back to status text
    }
    throw new Error(`${res.status}: ${reason}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const headers = await buildAuthHeaders(data ? { "Content-Type": "application/json" } : {});
  const res = await fetch(withApiBase(url), {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const headers = await buildAuthHeaders();
    const res = await fetch(withApiBase(queryKey.join("/") as string), {
      credentials: "include",
      headers,
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
