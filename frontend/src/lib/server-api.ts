const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';

export class ServerApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/**
 * Lightweight server-side GET helper with ISR revalidation and strict timeout.
 * Keeps public SSR pages and sitemap.xml fast and resilient when the upstream
 * Laravel API is slow or unreachable during builds.
 */
export async function serverGet<T>(
  endpoint: string,
  options: { revalidate?: number; timeoutMs?: number } = {},
): Promise<T> {
  const { revalidate = 300, timeoutMs = 3000 } = options;

  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: { Accept: 'application/json' },
    next: { revalidate },
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!res.ok) {
    throw new ServerApiError(`Upstream error ${res.status}`, res.status);
  }

  return (await res.json()) as T;
}
