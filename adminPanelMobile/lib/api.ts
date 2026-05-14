/**
 * Centralized API client for the backend REST API.
 *
 * All HTTP calls go through the single `request()` function which handles:
 *   - Automatic Bearer token injection from the caller
 *   - JSON body serialization (FormData is passed through unchanged for file uploads)
 *   - 30-second request timeout via AbortController
 *   - Structured ApiError (with HTTP status + field-level validation errors) on non-2xx responses
 *
 * Base URL: set EXPO_PUBLIC_API_URL in .env (or app.config.js).
 *           Falls back to http://localhost:8000/api in development.
 *
 * All console logs are gated behind __DEV__ so they are stripped from production builds.
 */

import {
  AdminSettings,
  AdminStats,
  BankLoanRate,
  Inquiry,
  LoanEnquiry,
  NewsArticle,
  PaginatedResponse,
  Property,
  Slide,
  User,
} from './types';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000/api';

if (__DEV__) console.log('[API] Base URL:', API_URL);

type RequestOptions = {

  method?: string;
  body?: unknown;
  token?: string;
};

class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, token } = options;
  const fullUrl = `${API_URL}${endpoint}`;

  if (__DEV__) console.log(`[API] ▶ ${method} ${fullUrl}`);
  if (__DEV__ && token) console.log('[API]   Auth: Bearer', token.slice(0, 12) + '…');

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (body && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => {
    if (__DEV__) console.warn('[API]   ⏱ Request timed out:', fullUrl);
    controller.abort();
  }, 30000);

  try {
    const res = await fetch(fullUrl, {
      method,
      headers,
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      if (__DEV__) console.error(`[API] ✖ ${method} ${fullUrl} → ${res.status}`, data);
      throw new ApiError(data.message ?? 'Request failed', res.status, data.errors);
    }

    if (__DEV__) console.log(`[API] ✔ ${method} ${fullUrl} → ${res.status}`);
    return data as T;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (__DEV__) console.error('[API]   Network/parse error:', err);
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const auth = {
  login: (email: string, password: string) =>
    request<{ token: string; user: User }>('/login', {
      method: 'POST',
      body: { email, password },
    }),

  me: (token: string) =>
    request<User>('/me', { token }),

  logout: (token: string) =>
    request<void>('/logout', { method: 'POST', token }),
};

// ─── Admin Stats ──────────────────────────────────────────────────────────────

export const adminStats = {
  get: (token: string) =>
    request<AdminStats>('/admin/stats', { token }),
};

// ─── Admin Users ──────────────────────────────────────────────────────────────

export const adminUsers = {
  list: (token: string, params: { role?: string; search?: string; page?: number } = {}) => {
    const q = new URLSearchParams();
    if (params.role) q.set('role', params.role);
    if (params.search) q.set('search', params.search);
    if (params.page) q.set('page', String(params.page));
    return request<PaginatedResponse<User>>(`/admin/users?${q.toString()}`, { token });
  },

  update: (token: string, id: number, data: Partial<User>) =>
    request<User>(`/admin/users/${id}`, { method: 'PATCH', body: data, token }),

  delete: (token: string, id: number) =>
    request<void>(`/admin/users/${id}`, { method: 'DELETE', token }),

  toggleBlock: (token: string, id: number) =>
    request<User>(`/admin/users/${id}/toggle-block`, { method: 'POST', token }),
};

// ─── Admin Properties ─────────────────────────────────────────────────────────

export const adminProperties = {
  get: (token: string, id: number) =>
    request<Property>(`/properties/${id}`, { token }),

  list: (
    token: string,
    params: { status?: string; listing_type?: string; search?: string; page?: number } = {}
  ) => {
    const q = new URLSearchParams();
    if (params.status) q.set('status', params.status);
    if (params.listing_type) q.set('listing_type', params.listing_type);
    if (params.search) q.set('search', params.search);
    if (params.page) q.set('page', String(params.page));
    return request<PaginatedResponse<Property>>(`/admin/properties?${q.toString()}`, { token });
  },

  create: (token: string, data: FormData) =>
    request<Property>('/admin/properties', { method: 'POST', body: data, token }),

  update: (token: string, id: number, data: Partial<Property>) =>
    request<Property>(`/admin/properties/${id}`, { method: 'PATCH', body: data, token }),

  delete: (token: string, id: number) =>
    request<void>(`/admin/properties/${id}`, { method: 'DELETE', token }),
};

// ─── Admin Inquiries ──────────────────────────────────────────────────────────

export const adminInquiries = {
  list: (
    token: string,
    params: { status?: string; inquiry_type?: string; search?: string; page?: number } = {}
  ) => {
    const q = new URLSearchParams();
    if (params.status) q.set('status', params.status);
    if (params.inquiry_type) q.set('inquiry_type', params.inquiry_type);
    if (params.search) q.set('search', params.search);
    if (params.page) q.set('page', String(params.page));
    return request<PaginatedResponse<Inquiry>>(`/admin/inquiries?${q.toString()}`, { token });
  },

  update: (token: string, id: number, data: { status: string }) =>
    request<Inquiry>(`/admin/inquiries/${id}`, { method: 'PATCH', body: data, token }),

  delete: (token: string, id: number) =>
    request<void>(`/admin/inquiries/${id}`, { method: 'DELETE', token }),
};

// ─── Admin News ───────────────────────────────────────────────────────────────

export const adminNews = {
  list: (token: string, params: { is_published?: string; search?: string; page?: number } = {}) => {
    const q = new URLSearchParams();
    if (params.is_published) q.set('is_published', params.is_published);
    if (params.search) q.set('search', params.search);
    if (params.page) q.set('page', String(params.page));
    return request<PaginatedResponse<NewsArticle>>(`/admin/news?${q.toString()}`, { token });
  },

  create: (token: string, data: FormData) =>
    request<NewsArticle>('/admin/news', { method: 'POST', body: data, token }),

  update: (token: string, id: number, data: FormData | Partial<NewsArticle>) =>
    request<NewsArticle>(`/admin/news/${id}`, { method: 'PATCH', body: data, token }),

  delete: (token: string, id: number) =>
    request<void>(`/admin/news/${id}`, { method: 'DELETE', token }),
};

// ─── Admin Loans ──────────────────────────────────────────────────────────────

export const adminLoans = {
  list: (token: string, params: { status?: string; search?: string; page?: number } = {}) => {
    const q = new URLSearchParams();
    if (params.status) q.set('status', params.status);
    if (params.search) q.set('search', params.search);
    if (params.page) q.set('page', String(params.page));
    return request<PaginatedResponse<LoanEnquiry>>(`/admin/loan-enquiries?${q.toString()}`, {
      token,
    });
  },

  update: (token: string, id: number, data: { status: string }) =>
    request<LoanEnquiry>(`/admin/loan-enquiries/${id}`, { method: 'PATCH', body: data, token }),

  delete: (token: string, id: number) =>
    request<void>(`/admin/loan-enquiries/${id}`, { method: 'DELETE', token }),
};

// ─── Admin Banks ──────────────────────────────────────────────────────────────

export const adminBanks = {
  list: (token: string) =>
    request<BankLoanRate[]>('/admin/bank-loan-rates', { token }),

  create: (token: string, data: FormData) =>
    request<BankLoanRate>('/admin/bank-loan-rates', { method: 'POST', body: data, token }),

  update: (token: string, id: number, data: FormData | Partial<BankLoanRate>) =>
    request<BankLoanRate>(`/admin/bank-loan-rates/${id}`, { method: 'PUT', body: data, token }),

  delete: (token: string, id: number) =>
    request<void>(`/admin/bank-loan-rates/${id}`, { method: 'DELETE', token }),
};

// ─── Admin Slides ─────────────────────────────────────────────────────────────

export const adminSlides = {
  list: (token: string) =>
    request<Slide[]>('/admin/slides', { token }),

  create: (token: string, data: FormData) =>
    request<Slide>('/admin/slides', { method: 'POST', body: data, token }),

  update: (token: string, id: number, data: Partial<Slide>) =>
    request<Slide>(`/admin/slides/${id}`, { method: 'PATCH', body: data, token }),

  delete: (token: string, id: number) =>
    request<void>(`/admin/slides/${id}`, { method: 'DELETE', token }),
};

// ─── Admin Settings ───────────────────────────────────────────────────────────

export const adminSettings = {
  get: (token: string) =>
    request<AdminSettings>('/admin/settings', { token }),

  update: (token: string, data: Partial<AdminSettings>) =>
    request<AdminSettings>('/admin/settings', { method: 'PUT', body: data, token }),
};

export { ApiError };
