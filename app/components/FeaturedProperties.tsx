import PropertyCard from "./PropertyCard";

const properties = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80",
    price: "AUD $1,250,000",
    title: "Luxury Beachfront Villa with Ocean Views",
    location: "Gold Coast, Queensland, Australia",
    beds: 4,
    baths: 3,
    area: "320 m²",
    type: "House",
    badge: "Featured",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80",
    price: "USD $850,000",
    title: "Modern Penthouse in the Heart of the City",
    location: "Manhattan, New York, USA",
    beds: 3,
    baths: 2,
    area: "210 m²",
    type: "Apartment",
    badge: "New",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&q=80",
    price: "GBP £920,000",
    title: "Elegant Townhouse with Private Garden",
    location: "Chelsea, London, UK",
    beds: 5,
    baths: 4,
    area: "410 m²",
    type: "House",
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=600&q=80",
    price: "EUR €480,000",
    title: "Charming Apartment Near the Eiffel Tower",
    location: "Paris 7e Arrondissement, France",
    beds: 2,
    baths: 1,
    area: "95 m²",
    type: "Apartment",
    badge: "Price Drop",
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&q=80",
    price: "SGD $3,200,000",
    title: "Luxury Condo with Rooftop Pool",
    location: "Orchard Road, Singapore",
    beds: 4,
    baths: 3,
    area: "280 m²",
    type: "Apartment",
    badge: "Featured",
  },
  {
    id: 6,
    image: "https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=600&q=80",
    price: "AED 4,500,000",
    title: "Stunning Villa with Private Pool & Sea View",
    location: "Palm Jumeirah, Dubai, UAE",
    beds: 5,
    baths: 5,
    area: "520 m²",
    type: "Villa",
  },
];

export default function FeaturedProperties() {
  return (
    <section className="py-14 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Featured Properties</h2>
            <p className="text-gray-500 text-sm mt-1">Hand-picked international listings</p>
          </div>
          <a href="#" className="text-red-600 text-sm font-semibold hover:underline">
            View all →
          </a>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((p) => (
            <PropertyCard key={p.id} {...p} />
          ))}
        </div>
      </div>
    </section>
  );
}
