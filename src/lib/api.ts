const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';

type RequestOptions = {
  method?: string;
  body?: unknown;
  token?: string;
};

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, token } = options;

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (body && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const error = new Error(data.message ?? 'Request failed') as Error & {
      status: number;
      errors?: Record<string, string[]>;
    };
    error.status = res.status;
    error.errors = data.errors;
    throw error;
  }

  return data as T;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export type User = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: 'buyer' | 'seller' | 'agent' | 'admin';
  avatar: string | null;
  suburb: string | null;
  state: string | null;
  postcode: string | null;
  country: string | null;
};

export type AuthResponse = { user: User; token: string };

export const auth = {
  register: (data: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    phone?: string;
    role?: string;
  }) => request<AuthResponse>('/register', { method: 'POST', body: data }),

  login: (data: { email: string; password: string }) =>
    request<AuthResponse>('/login', { method: 'POST', body: data }),

  logout: (token: string) =>
    request<{ message: string }>('/logout', { method: 'POST', token }),

  me: (token: string) => request<User>('/me', { token }),
};

// ─── Properties ──────────────────────────────────────────────────────────────

export type PropertyImage = {
  id: number;
  property_id: number;
  image_path: string;
  url: string;
  is_primary: boolean;
  sort_order: number;
};

export type PropertyOwner = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
};

export type Property = {
  id: number;
  user_id: number;
  user?: PropertyOwner;
  title: string;
  price: number;
  price_per_week: number | null;
  address: string;
  suburb: string;
  state: string;
  postcode: string;
  beds: number;
  baths: number;
  cars: number;
  land_size: string | null;
  property_type: string;
  listing_type: 'buy' | 'rent' | 'sold';
  description: string;
  agent_name: string;
  agency_name: string;
  sold_date: string | null;
  days_listed: number;
  is_featured: boolean;
  status: 'active' | 'inactive' | 'sold';
  images: PropertyImage[];
  created_at: string;
  updated_at: string;
};

export type PaginatedProperties = {
  data: Property[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

export type PropertyFilters = {
  listing_type?: 'buy' | 'rent' | 'sold';
  q?: string;
  property_type?: string;
  suburb?: string;
  state?: string;
  postcode?: string;
  min_price?: number;
  max_price?: number;
  beds?: number;
  baths?: number;
  cars?: number;
  featured?: boolean;
  per_page?: number;
  page?: number;
};

export const properties = {
  list: (filters?: PropertyFilters) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== null) params.set(k, String(v));
      });
    }
    const qs = params.toString();
    return request<PaginatedProperties>(`/properties${qs ? `?${qs}` : ''}`);
  },

  get: (id: number | string) => request<Property>(`/properties/${id}`),

  create: (data: FormData, token: string) =>
    request<Property>('/properties', { method: 'POST', body: data, token }),

  update: (id: number, data: Partial<Property>, token: string) =>
    request<Property>(`/properties/${id}`, { method: 'PUT', body: data, token }),

  delete: (id: number, token: string) =>
    request<{ message: string }>(`/properties/${id}`, { method: 'DELETE', token }),

  uploadImages: (id: number, formData: FormData, token: string) =>
    request<PropertyImage[]>(`/properties/${id}/images`, {
      method: 'POST',
      body: formData,
      token,
    }),

  deleteImage: (propertyId: number, imageId: number, token: string) =>
    request<{ message: string }>(`/properties/${propertyId}/images/${imageId}`, {
      method: 'DELETE',
      token,
    }),

  mine: (token: string) =>
    request<PaginatedProperties>('/my-properties', { token }),
};

// ─── Inquiries ───────────────────────────────────────────────────────────────

export type InquiryProperty = {
  id: number;
  title: string;
  address: string;
  suburb: string;
  state: string;
  postcode: string;
  listing_type: string;
  price: number;
  price_per_week: number | null;
};

export type Inquiry = {
  id: number;
  property_id: number;
  user_id: number | null;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  inquiry_type: 'buying' | 'renting' | 'general';
  status: 'pending' | 'contacted' | 'resolved';
  created_at: string;
  property?: InquiryProperty;
  user?: { id: number; name: string; email: string; phone: string | null; avatar: string | null };
};

export const inquiries = {
  submit: (
    propertyId: number,
    data: { name: string; email: string; phone?: string; message: string; inquiry_type?: string },
    token?: string,
  ) =>
    request<Inquiry>(`/properties/${propertyId}/inquiries`, {
      method: 'POST',
      body: data,
      token,
    }),

  forProperty: (propertyId: number, token: string) =>
    request<Inquiry[]>(`/properties/${propertyId}/inquiries`, { token }),

  mine: (token: string) => request<Inquiry[]>('/my-inquiries', { token }),

  received: (token: string) => request<Inquiry[]>('/received-inquiries', { token }),
};

// ─── Agents ──────────────────────────────────────────────────────────────────

export type Agent = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  suburb: string | null;
  state: string | null;
  postcode: string | null;
  country: string | null;
};

export type PaginatedAgents = {
  data: Agent[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

export type AgentFilters = {
  search?: string;
  suburb?: string;
  state?: string;
  page?: number;
};

export const agentsApi = {
  list: (filters?: AgentFilters) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== '') params.set(k, String(v));
      });
    }
    const qs = params.toString();
    return request<PaginatedAgents>(`/agents${qs ? `?${qs}` : ''}`);
  },
};

// ─── Profile ─────────────────────────────────────────────────────────────────

export const profile = {
  update: (data: {
    name?: string;
    email?: string;
    phone?: string | null;
    suburb?: string | null;
    state?: string | null;
    postcode?: string | null;
    country?: string | null;
  }, token: string) =>
    request<User>('/profile', { method: 'PATCH', body: data, token }),

  updatePassword: (data: { current_password: string; password: string; password_confirmation: string }, token: string) =>
    request<{ message: string }>('/profile/password', { method: 'PUT', body: data, token }),

  uploadAvatar: (formData: FormData, token: string) =>
    request<User>('/profile/avatar', { method: 'POST', body: formData, token }),

  deleteAvatar: (token: string) =>
    request<User>('/profile/avatar', { method: 'DELETE', token }),
};
