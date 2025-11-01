function detectCodespacesApiBase(): string | null {
  if (typeof window === "undefined") return null;
  const { protocol, hostname } = window.location; // e.g. https:, x-5175.app.github.dev
  const m = hostname.match(/^(.*)-(\d+)\.app\.github\.dev$/);
  if (m) {
    const prefix = m[1];
    return `${protocol}//${prefix}-5000.app.github.dev`;
  }
  return null;
}

export function apiBase(): string {
  const raw = (import.meta as any).env?.VITE_API_URL as string | undefined;
  // If explicitly provided and not 'auto', honor it.
  if (raw && raw !== 'auto') {
    return raw.replace(/\/$/, "");
  }
  // Auto-detect Codespaces/GitHub dev URL when possible
  const auto = detectCodespacesApiBase();
  if (auto) return auto;
  // Fallback to localhost for traditional local dev
  return "http://localhost:5000";
}

export function withApiBase(path: string): string {
  if (!path) return apiBase();
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${apiBase()}${p}`;
}

export async function apiFetch(input: string, init?: RequestInit): Promise<Response> {
  const url = withApiBase(input);
  return fetch(url, { credentials: "include", ...init });
}
