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
  email: string | null;
  phone: string | null;
  role: 'buyer' | 'seller' | 'agent' | 'admin';
  avatar: string | null;
  suburb: string | null;
  state: string | null;
  postcode: string | null;
  country: string | null;
};

export type AuthResponse = { user: User; token: string };
export type OtpRequiredResponse = { requires_otp: true; email: string; masked_email: string };
export type VerificationRequiredResponse = { requires_verification: true; email: string; masked_email: string };
export type LoginResponse = AuthResponse | OtpRequiredResponse | VerificationRequiredResponse;
export type RegisterResponse = VerificationRequiredResponse;

export const auth = {
  register: (data: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    phone?: string;
    role?: string;
    country?: string;
    state?: string;
    suburb?: string;
  }) => request<RegisterResponse>('/register', { method: 'POST', body: data }),

  login: (data: { email: string; password: string }) =>
    request<LoginResponse>('/login', { method: 'POST', body: data }),

  verifyOtp: (data: { email: string; otp: string }) =>
    request<AuthResponse>('/verify-otp', { method: 'POST', body: data }),

  verifyEmail: (data: { email: string; otp: string }) =>
    request<AuthResponse>('/verify-email', { method: 'POST', body: data }),

  resendVerification: (email: string) =>
    request<{ message: string }>('/resend-verification', { method: 'POST', body: { email } }),

  contact: (data: { name: string; email: string; message: string }) =>
    request<{ message: string }>('/contact', { method: 'POST', body: data }),

  forgotPassword: (email: string) =>
    request<{ message: string; masked_email: string }>('/forgot-password', { method: 'POST', body: { email } }),

  resetPassword: (data: { email: string; otp: string; password: string; password_confirmation: string }) =>
    request<{ message: string }>('/reset-password', { method: 'POST', body: data }),

  sendPhoneOtp: (phone: string, role?: string) =>
    request<{ requires_otp: true; masked_phone: string; dev_otp?: string }>('/phone-login', { method: 'POST', body: { phone, role } }),

  verifyPhoneOtp: (data: { phone: string; otp: string; country?: string }) =>
    request<AuthResponse>('/verify-phone-otp', { method: 'POST', body: data }),

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
  country: string | null;
  beds: number;
  baths: number;
  cars: number;
  land_size: string | null;
  property_type: string;
  condition: 'new' | 'used';
  category: 'domestic' | 'commercial' | 'both';
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
  condition?: 'new' | 'used';
  category?: 'domestic' | 'commercial' | 'both';
  user_id?: number;
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

export type PaymentReceiptData = {
  order_id: string;
  paid_at: string;
  user_name: string;
  user_email: string;
  listing_title: string;
  listing_address: string;
  listing_price: number;
  payment_amount: number;
  property_id: number;
};

export type PayHereCheckout = {
  checkout_url: string;
  order_id: string;
  merchant_id: string;
  amount: string;
  currency: string;
  items: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  hash: string;
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

  sendListingOtp: (token: string) =>
    request<{ message: string; masked_email: string }>('/send-listing-otp', { method: 'POST', token }),

  initiatePayment: (data: FormData, token: string) =>
    request<PayHereCheckout>('/payment/initiate', { method: 'POST', body: data, token }),

  checkPaymentStatus: (orderId: string, token: string) =>
    request<{ status: 'pending' | 'completed' | 'failed'; property_id: number | null }>(
      `/payment/status/${orderId}`,
      { token },
    ),

  completePayment: (orderId: string, token: string) =>
    request<{ status: string; property_id: number }>(
      `/payment/complete/${orderId}`,
      { method: 'POST', token },
    ),

  getReceipt: (orderId: string, token: string) =>
    request<PaymentReceiptData>(`/payment/receipt/${orderId}`, { token }),

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

  get: (id: number) => request<Agent>(`/agents/${id}`),
};

// ─── Admin ───────────────────────────────────────────────────────────────────

export type AdminStats = {
  users: { total: number; buyers: number; sellers: number; agents: number; admins: number; new_this_week: number };
  properties: { total: number; active: number; inactive: number; sold: number; featured: number; buy: number; rent: number; new_this_week: number };
  inquiries: { total: number; pending: number; contacted: number; resolved: number; new_this_week: number };
};

export type PaginatedUsers = {
  data: (User & { created_at: string })[];
  current_page: number; last_page: number; per_page: number; total: number;
};

export type PaginatedInquiries = {
  data: Inquiry[];
  current_page: number; last_page: number; per_page: number; total: number;
};

function buildQs(obj: Record<string, unknown>): string {
  const p = new URLSearchParams();
  Object.entries(obj).forEach(([k, v]) => { if (v !== undefined && v !== '' && v !== null) p.set(k, String(v)); });
  return p.toString();
}

export const admin = {
  stats: (token: string) =>
    request<AdminStats>('/admin/stats', { token }),

  users: (filters: { role?: string; search?: string; page?: number }, token: string) => {
    const qs = buildQs(filters);
    return request<PaginatedUsers>(`/admin/users${qs ? '?' + qs : ''}`, { token });
  },

  updateUser: (id: number, data: { role?: string; name?: string; email?: string }, token: string) =>
    request<User>(`/admin/users/${id}`, { method: 'PATCH', body: data, token }),

  deleteUser: (id: number, token: string) =>
    request<{ message: string }>(`/admin/users/${id}`, { method: 'DELETE', token }),

  properties: (filters: { status?: string; listing_type?: string; search?: string; featured?: string; page?: number }, token: string) => {
    const qs = buildQs(filters);
    return request<PaginatedProperties>(`/admin/properties${qs ? '?' + qs : ''}`, { token });
  },

  updateProperty: (id: number, data: { status?: string; is_featured?: boolean; listing_type?: string }, token: string) =>
    request<Property>(`/admin/properties/${id}`, { method: 'PATCH', body: data, token }),

  deleteProperty: (id: number, token: string) =>
    request<{ message: string }>(`/admin/properties/${id}`, { method: 'DELETE', token }),

  inquiries: (filters: { status?: string; inquiry_type?: string; search?: string; page?: number }, token: string) => {
    const qs = buildQs(filters);
    return request<PaginatedInquiries>(`/admin/inquiries${qs ? '?' + qs : ''}`, { token });
  },

  updateInquiry: (id: number, status: string, token: string) =>
    request<Inquiry>(`/admin/inquiries/${id}`, { method: 'PATCH', body: { status }, token }),

  deleteInquiry: (id: number, token: string) =>
    request<{ message: string }>(`/admin/inquiries/${id}`, { method: 'DELETE', token }),

  loanEnquiries: (filters: { status?: string; search?: string; page?: number }, token: string) => {
    const qs = buildQs(filters);
    return request<PaginatedLoanEnquiries>(`/admin/loan-enquiries${qs ? '?' + qs : ''}`, { token });
  },

  updateLoanEnquiry: (id: number, status: string, token: string) =>
    request<LoanEnquiry>(`/admin/loan-enquiries/${id}`, { method: 'PATCH', body: { status }, token }),

  deleteLoanEnquiry: (id: number, token: string) =>
    request<{ message: string }>(`/admin/loan-enquiries/${id}`, { method: 'DELETE', token }),
};

// ─── Favorites ───────────────────────────────────────────────────────────────

export const favorites = {
  /** Returns full property objects the user has saved */
  list: (token: string) =>
    request<Property[]>('/favorites', { token }),

  /** Returns a plain array of saved property IDs */
  ids: (token: string) =>
    request<number[]>('/favorites/ids', { token }),

  /** Toggle save/unsave a property. Returns { saved: boolean } */
  toggle: (propertyId: number, token: string) =>
    request<{ saved: boolean }>(`/favorites/${propertyId}`, { method: 'POST', token }),
};

// ─── Loan Enquiries ───────────────────────────────────────────────────────────

export type LoanEnquiry = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  employment_type: 'full_time' | 'part_time' | 'self_employed' | 'casual';
  annual_income: number;
  deposit_amount: number;
  loan_amount: number;
  loan_purpose: 'buy_home' | 'investment' | 'refinance';
  property_type: string;
  property_state: string;
  estimated_property_value: number | null;
  message: string | null;
  status: 'new' | 'in_review' | 'pre_approved' | 'declined';
  created_at: string;
  updated_at: string;
};

export type PaginatedLoanEnquiries = {
  data: LoanEnquiry[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

export const loanEnquiries = {
  submit: (data: Omit<LoanEnquiry, 'id' | 'status' | 'created_at' | 'updated_at'>) =>
    request<LoanEnquiry>('/loan-enquiries', { method: 'POST', body: data }),
};

// ─── News ─────────────────────────────────────────────────────────────────────

export type NewsArticleApi = {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  tag: string | null;
  image_url: string;
  read_time: string;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type PaginatedNews = {
  data: NewsArticleApi[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

const NEWS_READONLY = new Set(['id', 'created_at', 'updated_at']);

function appendNewsFields(fd: FormData, data: Partial<NewsArticleApi> & { imageFile?: File }) {
  Object.entries(data).forEach(([k, v]) => {
    if (NEWS_READONLY.has(k)) return;
    if (k === 'imageFile') { if (v) fd.append('image', v as File); return; }
    if (v === undefined || v === null) return;
    if (typeof v === 'boolean') { fd.append(k, v ? '1' : '0'); return; }
    fd.append(k, String(v));
  });
}

export const newsApi = {
  list: (filters?: { category?: string; search?: string; per_page?: number; page?: number }) => {
    const qs = filters ? new URLSearchParams(
      Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== undefined && v !== '').map(([k, v]) => [k, String(v)]))
    ).toString() : '';
    return request<PaginatedNews>(`/news${qs ? '?' + qs : ''}`);
  },

  get: (id: number) => request<NewsArticleApi>(`/news/${id}`),

  adminList: (filters: { search?: string; is_published?: string; page?: number }, token: string) => {
    const qs = buildQs(filters);
    return request<PaginatedNews>(`/admin/news${qs ? '?' + qs : ''}`, { token });
  },

  create: (data: Partial<NewsArticleApi> & { imageFile?: File }, token: string) => {
    const fd = new FormData();
    appendNewsFields(fd, data);
    return request<NewsArticleApi>('/admin/news', { method: 'POST', body: fd, token });
  },

  update: (id: number, data: Partial<NewsArticleApi> & { imageFile?: File }, token: string) => {
    if (data.imageFile || Object.keys(data).some((k) => !['imageFile'].includes(k))) {
      const fd = new FormData();
      fd.append('_method', 'PATCH');
      appendNewsFields(fd, data);
      return request<NewsArticleApi>(`/admin/news/${id}`, { method: 'POST', body: fd, token });
    }
    return request<NewsArticleApi>(`/admin/news/${id}`, { method: 'PATCH', body: data, token });
  },

  delete: (id: number, token: string) =>
    request<{ message: string }>(`/admin/news/${id}`, { method: 'DELETE', token }),
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
