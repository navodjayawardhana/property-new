/**
 * Shared TypeScript type definitions for the admin panel.
 * These types mirror the backend API response shapes.
 * Keep in sync with the Laravel models in backend/app/Models/.
 */

export type UserRole = 'buyer' | 'seller' | 'agent' | 'admin';

// Registered user account (buyer, seller, agent, or admin)
export type User = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  role: UserRole;
  avatar: string | null;
  is_blocked: boolean;
  suburb: string | null;
  state: string | null;
  postcode: string | null;
  country: string | null;
  created_at?: string;
};

// Single image attached to a property listing
export type PropertyImage = {
  id: number;
  property_id: number;
  url: string;
  is_primary: boolean;
  sort_order: number;
};

// Full property listing record including nested images and owner info
export type Property = {
  id: number;
  user_id: number;
  user?: { id: number; name: string; email: string; phone: string | null; avatar: string | null };
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

// Contact message sent by a buyer/renter about a specific property
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
  property?: {
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
  user?: { id: number; name: string; email: string; phone: string | null; avatar: string | null };
};

// Loan pre-approval application submitted via the public app
export type LoanEnquiry = {
  id: number;
  user_id: number | null;
  name: string;
  selected_bank: string | null;
  nic_number: string | null;
  email: string;
  phone: string | null;
  employment_type: 'full_time' | 'part_time' | 'self_employed' | 'casual';
  annual_income: number;
  deposit_amount: number;
  loan_amount: number;
  loan_term: number | null;
  loan_purpose: 'buy_home' | 'investment' | 'refinance';
  property_type: string;
  property_state: string;
  estimated_property_value: number | null;
  message: string | null;
  status: 'new' | 'in_review' | 'pre_approved' | 'declined';
  created_at: string;
  updated_at: string;
};

// News/blog article published on the public app
export type NewsArticle = {
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

// Bank loan product shown on the public app's finance page
export type BankLoanRate = {
  id: number;
  bank_name: string;
  logo_url: string | null;
  loan_type: 'variable' | 'fixed' | 'split' | 'interest_only';
  interest_rate: number;
  min_loan: number;
  max_loan: number;
  max_term: number;
  features: string[] | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

// Homepage carousel slide (image or video)
export type Slide = {
  id: number;
  title: string | null;
  subtitle: string | null;
  media_type: 'image' | 'video';
  media_url: string;
  sort_order: number;
  is_active: boolean;
};

// Platform-wide pricing configuration (stored in the backend settings table)
export type AdminSettings = {
  listing_fee: number;
  processing_fee_pct: number;
  commission_pct: number;
};

// Aggregated counts returned by GET /admin/stats for the dashboard
export type AdminStats = {
  users: {
    total: number;
    buyers: number;
    sellers: number;
    agents: number;
    admins: number;
    new_this_week: number;
  };
  properties: {
    total: number;
    active: number;
    inactive: number;
    sold: number;
    featured: number;
    buy: number;
    rent: number;
    new_this_week: number;
  };
  inquiries: {
    total: number;
    pending: number;
    contacted: number;
    resolved: number;
    new_this_week: number;
  };
};

// Standard Laravel paginator response wrapper used by all list endpoints
export type PaginatedResponse<T> = {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};
