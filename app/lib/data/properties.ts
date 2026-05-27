import { Property } from "@/app/types";

export const properties: Property[] = [
  {
    id: 1,
    type: "House",
    listingType: "buy",
    title: "Stunning Waterfront Family Home",
    description: "Experience luxury waterfront living in this magnificent 4-bedroom family home. Featuring panoramic ocean views, a private jetty, and resort-style pool. The open-plan living area flows seamlessly to outdoor entertaining spaces. Gourmet kitchen with premium appliances, home office, and three-car garage. Located in a prestigious neighborhood with easy access to top schools and amenities.",
    price: "LKR 125,000,000",
    priceValue: 125000000,
    location: {
      address: "42 Marine Drive",
      suburb: "Colombo 3",
      city: "Colombo",
      state: "Western Province",
      country: "Sri Lanka",
      postcode: "00300",
    },
    features: { beds: 4, baths: 3, parking: 3, area: "420m²", landArea: "850m²" },
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&q=80",
    ],
    badge: "Premium",
    badgeColor: "bg-amber-500",
    views: "5.2k",
    listedDate: "2024-01-15",
    agent: {
      id: 1,
      name: "Kasun Perera",
      agency: "GreenBrick Premier",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80",
      phone: "+94 77 123 4567",
    },
    amenities: ["Pool", "Garden", "Security", "Garage", "Air Conditioning", "Solar Panels"],
    inspectionTimes: ["Sat 10:00 AM - 10:30 AM", "Sun 2:00 PM - 2:30 PM"],
  },
  {
    id: 2,
    type: "Apartment",
    listingType: "buy",
    title: "Luxury Penthouse with City Views",
    description: "Exclusive penthouse apartment offering breathtaking city skyline views. This sophisticated residence features floor-to-ceiling windows, designer finishes, and a private rooftop terrace. Open-plan living with gourmet kitchen, three spacious bedrooms, and a master suite with walk-in wardrobe. Building amenities include gym, pool, and 24/7 concierge.",
    price: "LKR 85,000,000",
    priceValue: 85000000,
    location: {
      address: "Level 25, Azure Tower",
      suburb: "Colombo 2",
      city: "Colombo",
      state: "Western Province",
      country: "Sri Lanka",
      postcode: "00200",
    },
    features: { beds: 3, baths: 2, parking: 2, area: "280m²" },
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80",
    ],
    badge: "New",
    badgeColor: "bg-emerald-500",
    views: "3.8k",
    listedDate: "2024-01-20",
    agent: {
      id: 2,
      name: "Amaya Silva",
      agency: "GreenBrick Premier",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
      phone: "+94 77 234 5678",
    },
    amenities: ["Gym", "Pool", "Concierge", "Parking", "Air Conditioning", "Balcony"],
    inspectionTimes: ["By Appointment"],
  },
  {
    id: 3,
    type: "Villa",
    listingType: "buy",
    title: "Colonial Heritage Villa with Modern Upgrades",
    description: "A rare opportunity to own a piece of history. This beautifully restored colonial villa combines period charm with modern luxury. Set on a sprawling estate with manicured gardens, pool, and guest cottage. Features include high ceilings, original teak flooring, and a grand veranda perfect for entertaining.",
    price: "LKR 250,000,000",
    priceValue: 250000000,
    location: {
      address: "18 Temple Road",
      suburb: "Galle Fort",
      city: "Galle",
      state: "Southern Province",
      country: "Sri Lanka",
      postcode: "80000",
    },
    features: { beds: 6, baths: 5, parking: 4, area: "650m²", landArea: "2000m²" },
    images: [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80",
    ],
    badge: "Heritage",
    badgeColor: "bg-purple-500",
    views: "8.1k",
    listedDate: "2024-01-10",
    agent: {
      id: 3,
      name: "Rohan Fernando",
      agency: "GreenBrick Luxury",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
      phone: "+94 77 345 6789",
    },
    amenities: ["Pool", "Garden", "Guest House", "Security", "Staff Quarters", "Wine Cellar"],
  },
  {
    id: 4,
    type: "Land",
    listingType: "buy",
    title: "Prime Beachfront Land - Development Opportunity",
    description: "Exceptional beachfront land parcel perfect for resort development or private estate. 200 meters of pristine beach frontage with clear title. Surrounded by luxury developments with all utilities available. Rare opportunity in a tightly held coastal location.",
    price: "LKR 180,000,000",
    priceValue: 180000000,
    location: {
      address: "Coastal Road",
      suburb: "Mirissa",
      city: "Matara",
      state: "Southern Province",
      country: "Sri Lanka",
      postcode: "81740",
    },
    features: { beds: 0, baths: 0, parking: 0, area: "5,000m²", landArea: "5,000m²" },
    images: [
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80",
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=80",
    ],
    badge: "Exclusive",
    badgeColor: "bg-blue-500",
    views: "2.4k",
    listedDate: "2024-01-18",
    agent: {
      id: 1,
      name: "Kasun Perera",
      agency: "GreenBrick Premier",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80",
      phone: "+94 77 123 4567",
    },
    amenities: ["Beach Access", "Road Access", "Utilities Available", "Clear Title"],
  },
  {
    id: 5,
    type: "Apartment",
    listingType: "rent",
    title: "Modern 2BR Apartment in Prime Location",
    description: "Stylish fully-furnished apartment in the heart of the city. Features modern kitchen, spacious living area, and balcony with city views. Building amenities include gym and rooftop pool. Walking distance to shopping, dining, and public transport.",
    price: "LKR 250,000/month",
    priceValue: 250000,
    location: {
      address: "Unit 1205, Skyline Residencies",
      suburb: "Colombo 4",
      city: "Colombo",
      state: "Western Province",
      country: "Sri Lanka",
      postcode: "00400",
    },
    features: { beds: 2, baths: 2, parking: 1, area: "120m²" },
    images: [
      "https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=1200&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80",
    ],
    badge: "Furnished",
    badgeColor: "bg-teal-500",
    views: "1.9k",
    listedDate: "2024-01-22",
    agent: {
      id: 2,
      name: "Amaya Silva",
      agency: "GreenBrick Premier",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
      phone: "+94 77 234 5678",
    },
    amenities: ["Furnished", "Gym", "Pool", "Security", "Parking", "Balcony"],
  },
  {
    id: 6,
    type: "House",
    listingType: "rent",
    title: "Spacious Family Home with Garden",
    description: "Beautiful 4-bedroom family home in quiet residential area. Large garden perfect for children, modern kitchen, and separate servant quarters. Close to international schools and supermarkets. Long-term lease preferred.",
    price: "LKR 450,000/month",
    priceValue: 450000,
    location: {
      address: "25 Flower Road",
      suburb: "Colombo 7",
      city: "Colombo",
      state: "Western Province",
      country: "Sri Lanka",
      postcode: "00700",
    },
    features: { beds: 4, baths: 3, parking: 2, area: "350m²", landArea: "600m²" },
    images: [
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&q=80",
      "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=1200&q=80",
    ],
    views: "2.3k",
    listedDate: "2024-01-19",
    agent: {
      id: 3,
      name: "Rohan Fernando",
      agency: "GreenBrick Luxury",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
      phone: "+94 77 345 6789",
    },
    amenities: ["Garden", "Parking", "Security", "Servant Quarters", "Air Conditioning"],
  },
  {
    id: 7,
    type: "Commercial",
    listingType: "buy",
    title: "Prime Commercial Building - CBD",
    description: "Exceptional commercial property in the heart of Colombo's business district. 5-story building with retail on ground floor and office space above. High foot traffic location with excellent visibility. Ideal for headquarters or investment.",
    price: "LKR 450,000,000",
    priceValue: 450000000,
    location: {
      address: "88 Galle Road",
      suburb: "Colombo 3",
      city: "Colombo",
      state: "Western Province",
      country: "Sri Lanka",
      postcode: "00300",
    },
    features: { beds: 0, baths: 8, parking: 20, area: "2,500m²", landArea: "500m²" },
    images: [
      "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&q=80",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80",
    ],
    badge: "Investment",
    badgeColor: "bg-orange-500",
    views: "4.5k",
    listedDate: "2024-01-12",
    agent: {
      id: 1,
      name: "Kasun Perera",
      agency: "GreenBrick Commercial",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80",
      phone: "+94 77 123 4567",
    },
    amenities: ["Elevator", "Parking", "Generator", "Security", "Central AC"],
  },
  {
    id: 8,
    type: "House",
    listingType: "sold",
    title: "Elegant Suburban Family Home",
    description: "Recently sold - beautiful family home in sought-after suburb. Featured 4 bedrooms, modern renovations, and landscaped gardens.",
    price: "LKR 95,000,000",
    priceValue: 95000000,
    location: {
      address: "15 Park Avenue",
      suburb: "Rajagiriya",
      city: "Colombo",
      state: "Western Province",
      country: "Sri Lanka",
      postcode: "10100",
    },
    features: { beds: 4, baths: 3, parking: 2, area: "320m²", landArea: "400m²" },
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80",
    ],
    badge: "Sold",
    badgeColor: "bg-gray-500",
    views: "6.2k",
    listedDate: "2023-12-01",
    agent: {
      id: 2,
      name: "Amaya Silva",
      agency: "GreenBrick Premier",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
      phone: "+94 77 234 5678",
    },
    amenities: ["Garden", "Parking", "Modern Kitchen", "Air Conditioning"],
  },
  {
    id: 9,
    type: "Apartment",
    listingType: "new",
    title: "Off-Plan Luxury Apartments - The Residences",
    description: "Brand new development launching soon. Premium apartments with world-class amenities including infinity pool, sky lounge, and concierge services. Early bird pricing available. Completion expected Q4 2025.",
    price: "From LKR 45,000,000",
    priceValue: 45000000,
    location: {
      address: "The Residences, Galle Face",
      suburb: "Colombo 3",
      city: "Colombo",
      state: "Western Province",
      country: "Sri Lanka",
      postcode: "00300",
    },
    features: { beds: 2, baths: 2, parking: 1, area: "150m²" },
    images: [
      "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=1200&q=80",
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80",
    ],
    badge: "Off-Plan",
    badgeColor: "bg-indigo-500",
    views: "7.8k",
    listedDate: "2024-01-25",
    agent: {
      id: 3,
      name: "Rohan Fernando",
      agency: "GreenBrick New Developments",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
      phone: "+94 77 345 6789",
    },
    amenities: ["Pool", "Gym", "Concierge", "Sky Lounge", "Parking", "Security"],
  },
];

export function getPropertyById(id: number): Property | undefined {
  return properties.find((p) => p.id === id);
}

export function getPropertiesByType(listingType: string): Property[] {
  return properties.filter((p) => p.listingType === listingType);
}

export function getFeaturedProperties(): Property[] {
  return properties.filter((p) => p.badge === "Premium" || p.badge === "Featured").slice(0, 6);
}

export function searchProperties(filters: Partial<{
  listingType: string;
  propertyType: string;
  location: string;
  minPrice: number;
  maxPrice: number;
  minBeds: number;
}>): Property[] {
  return properties.filter((p) => {
    if (filters.listingType && p.listingType !== filters.listingType) return false;
    if (filters.propertyType && p.type !== filters.propertyType) return false;
    if (filters.location && !p.location.city.toLowerCase().includes(filters.location.toLowerCase())) return false;
    if (filters.minPrice && p.priceValue < filters.minPrice) return false;
    if (filters.maxPrice && p.priceValue > filters.maxPrice) return false;
    if (filters.minBeds && p.features.beds < filters.minBeds) return false;
    return true;
  });
}
