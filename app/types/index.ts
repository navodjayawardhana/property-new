export interface Property {
  id: number;
  type: "House" | "Apartment" | "Villa" | "Land" | "Commercial" | "Rural";
  listingType: "buy" | "rent" | "sold" | "new";
  title: string;
  description: string;
  price: string;
  priceValue: number;
  location: {
    address: string;
    suburb: string;
    city: string;
    state: string;
    country: string;
    postcode: string;
  };
  features: {
    beds: number;
    baths: number;
    parking: number;
    area: string;
    landArea?: string;
  };
  images: string[];
  badge?: string;
  badgeColor?: string;
  views: string;
  listedDate: string;
  agent: {
    id: number;
    name: string;
    agency: string;
    image: string;
    phone: string;
  };
  amenities: string[];
  inspectionTimes?: string[];
}

export interface Agent {
  id: number;
  name: string;
  title: string;
  agency: string;
  agencyLogo?: string;
  image: string;
  phone: string;
  email: string;
  location: string;
  bio: string;
  specialties: string[];
  stats: {
    propertiesSold: number;
    avgDaysOnMarket: number;
    totalSalesValue: string;
    reviews: number;
    rating: number;
  };
  currentListings: number[];
  recentSales: number[];
}

export interface NewsArticle {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  category: "Market News" | "Buying Tips" | "Selling Tips" | "Investing" | "Lifestyle";
  author: {
    name: string;
    image: string;
  };
  publishedAt: string;
  readTime: string;
}

export interface SuburbProfile {
  id: number;
  name: string;
  postcode: string;
  state: string;
  medianHousePrice: string;
  medianUnitPrice: string;
  rentalYield: string;
  population: number;
  demographics: {
    families: number;
    singles: number;
    couples: number;
  };
  schools: number;
  parks: number;
  shops: number;
  publicTransport: string;
  description: string;
}

export interface SearchFilters {
  listingType: "buy" | "rent" | "sold" | "new";
  propertyTypes: string[];
  location: string;
  priceMin?: number;
  priceMax?: number;
  bedsMin?: number;
  bedsMax?: number;
  bathsMin?: number;
  parking?: number;
  keywords?: string;
  sortBy: "newest" | "price-asc" | "price-desc" | "beds";
}
