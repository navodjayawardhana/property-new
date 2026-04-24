import type { Property } from "@/lib/api";

export function formatPrice(property: Property): string {
  if (property.listing_type === "rent" && property.price_per_week) {
    return `Rs ${property.price_per_week.toLocaleString()} / week`;
  }
  return `Rs ${property.price.toLocaleString()}`;
}

export function getPrimaryImageUrl(property: Property): string {
  const primary = property.images.find((i) => i.is_primary);
  return primary?.url ?? property.images[0]?.url ?? "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80";
}

export function getImageUrls(property: Property): string[] {
  if (property.images.length === 0) {
    return ["https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80"];
  }
  return property.images.map((i) => i.url);
}
