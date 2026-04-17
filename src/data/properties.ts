export type Property = {
  id: string;
  price: string;
  pricePerWeek?: string;
  address: string;
  suburb: string;
  state: string;
  postcode: string;
  beds: number;
  baths: number;
  cars: number;
  landSize?: string;
  propertyType: string;
  listingType: "buy" | "rent" | "sold";
  image: string;
  images: string[];
  agent: string;
  agency: string;
  description: string;
  soldDate?: string;
  daysListed?: number;
};

export const properties: Property[] = [
  {
    id: "1",
    price: "$1,250,000",
    address: "42 Rosewood Drive",
    suburb: "Hawthorn",
    state: "VIC",
    postcode: "3122",
    beds: 4,
    baths: 2,
    cars: 2,
    landSize: "620 m²",
    propertyType: "House",
    listingType: "buy",
    image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80",
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
    ],
    agent: "Sarah Mitchell",
    agency: "Ray White Hawthorn",
    description:
      "A stunning family home in the heart of Hawthorn featuring a modern open-plan kitchen and living area, four spacious bedrooms, and a beautifully landscaped backyard. Walking distance to top schools, cafes, and transport.",
    daysListed: 5,
  },
  {
    id: "2",
    price: "$875,000",
    address: "17 Bayside Avenue",
    suburb: "Brighton",
    state: "VIC",
    postcode: "3186",
    beds: 3,
    baths: 1,
    cars: 1,
    landSize: "450 m²",
    propertyType: "House",
    listingType: "buy",
    image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80",
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80",
    ],
    agent: "James Thornton",
    agency: "Hocking Stuart Brighton",
    description:
      "Charming period home with loads of character, located just minutes from Brighton Beach. Features original hardwood floors, high ceilings, and a large rear garden with development potential (STCA).",
    daysListed: 12,
  },
  {
    id: "3",
    price: "$2,100,000",
    address: "8 Hillside Court",
    suburb: "Toorak",
    state: "VIC",
    postcode: "3142",
    beds: 5,
    baths: 3,
    cars: 3,
    landSize: "980 m²",
    propertyType: "House",
    listingType: "buy",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80",
    ],
    agent: "Emma Clarke",
    agency: "Kay & Burton Toorak",
    description:
      "Grand family estate in prestigious Toorak with resort-style pool, home theatre, and chef's kitchen. This exceptional property offers the ultimate in luxury living with impeccable attention to detail throughout.",
    daysListed: 3,
  },
  {
    id: "4",
    price: "$650 / week",
    pricePerWeek: "$650",
    address: "5/22 Collins Street",
    suburb: "Melbourne CBD",
    state: "VIC",
    postcode: "3000",
    beds: 2,
    baths: 1,
    cars: 1,
    propertyType: "Apartment",
    listingType: "rent",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
    ],
    agent: "Tom Nguyen",
    agency: "Nelson Alexander Carlton",
    description:
      "Modern CBD apartment with stunning city views, open-plan living, and a gourmet kitchen. Includes secure parking and storage. Steps to trams, restaurants, and entertainment precincts.",
    daysListed: 2,
  },
  {
    id: "5",
    price: "$480 / week",
    pricePerWeek: "$480",
    address: "12 Park Lane",
    suburb: "Fitzroy",
    state: "VIC",
    postcode: "3065",
    beds: 2,
    baths: 1,
    cars: 0,
    propertyType: "Townhouse",
    listingType: "rent",
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
    ],
    agent: "Lily Chen",
    agency: "Biggin & Scott Fitzroy",
    description:
      "Stylish townhouse in vibrant Fitzroy featuring polished concrete floors, exposed brick, and a private courtyard. Close to cafes, bars, and public transport.",
    daysListed: 7,
  },
  {
    id: "6",
    price: "$990,000",
    address: "33 Maple Street",
    suburb: "St Kilda",
    state: "VIC",
    postcode: "3182",
    beds: 3,
    baths: 2,
    cars: 1,
    landSize: "310 m²",
    propertyType: "Townhouse",
    listingType: "sold",
    soldDate: "14 Apr 2026",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
    ],
    agent: "Marco Rossi",
    agency: "Jellis Craig St Kilda",
    description:
      "Contemporary townhouse steps from St Kilda Beach. Sold at auction for above reserve, demonstrating the strong demand in this blue-chip coastal suburb.",
  },
  {
    id: "7",
    price: "$1,480,000",
    address: "91 Elm Crescent",
    suburb: "Camberwell",
    state: "VIC",
    postcode: "3124",
    beds: 4,
    baths: 2,
    cars: 2,
    landSize: "720 m²",
    propertyType: "House",
    listingType: "buy",
    image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80",
    ],
    agent: "David Park",
    agency: "Marshall White Camberwell",
    description:
      "Elegant Californian bungalow on a premium 720sqm block in coveted Camberwell. Beautifully renovated with respect for original character, featuring a new kitchen, master ensuite, and north-facing garden.",
    daysListed: 18,
  },
  {
    id: "8",
    price: "$550 / week",
    pricePerWeek: "$550",
    address: "3/45 Beach Road",
    suburb: "St Kilda",
    state: "VIC",
    postcode: "3182",
    beds: 1,
    baths: 1,
    cars: 1,
    propertyType: "Apartment",
    listingType: "rent",
    image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80",
    ],
    agent: "Priya Sharma",
    agency: "Gary Peer St Kilda",
    description:
      "Sun-drenched apartment with breathtaking bay views. Fully furnished option available. Walk to beach, Acland Street cafes, and tram stop.",
    daysListed: 1,
  },
];

export const getPropertiesByType = (type: "buy" | "rent" | "sold") =>
  properties.filter((p) => p.listingType === type);

export const getPropertyById = (id: string) =>
  properties.find((p) => p.id === id);
