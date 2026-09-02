import type { Metadata } from 'next';
import { cache } from 'react';
import PropertyDetailClient from './PropertyDetailClient';
import { properties as propertiesApi, type Property } from '@/lib/api';
import { formatPrice } from '@/lib/utils';

type Props = {
  params: Promise<{ id: string }>;
};

// Deduped so generateMetadata and the page body share a single fetch.
const getProperty = cache(async (id: string): Promise<Property | null> => {
  try {
    return await propertiesApi.get(id);
  } catch {
    return null;
  }
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const property = await getProperty(id);

  if (!property) {
    return {
      title: "Property Details | Greenbricks",
      description: "View property details on Greenbricks",
    };
  }

  const title = `${property.address} - ${formatPrice(property)} | Greenbricks`;
  const description = `${property.property_type} in ${property.suburb}, ${property.state}. ${property.beds} bed${property.beds !== 1 ? 's' : ''}, ${property.baths} bath${property.baths !== 1 ? 's' : ''}. Listed on Greenbricks.`;
  const image = property.images && property.images.length > 0
    ? property.images.find(img => img.is_primary)?.url || property.images[0]?.url
    : '/GreenBricksLogo.png';
  const url = `https://greenbricks.net/property/${property.id}`;

  return {
    title,
    description,
    keywords: `${property.property_type}, ${property.suburb}, ${property.state}, property for ${property.listing_type}`,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      images: [{ url: image, width: 1200, height: 630, alt: property.address }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

/** Maps a listing's property_type onto the closest schema.org accommodation type. */
function residenceType(propertyType: string): string {
  const t = propertyType.toLowerCase();
  if (t.includes("apartment") || t.includes("unit") || t.includes("studio")) return "Apartment";
  if (t.includes("house") || t.includes("villa") || t.includes("townhouse")) return "House";
  return "Residence";
}

function listingSchema(property: Property) {
  const url = `https://greenbricks.net/property/${property.id}`;
  const images = (property.images ?? []).map((img) => img.url).filter(Boolean);
  const isSold = property.listing_type === "sold";

  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "@id": url,
    url,
    name: property.title || property.address,
    description: property.description || `${property.property_type} in ${property.suburb}, ${property.state}.`,
    datePosted: property.created_at,
    image: images.length > 0 ? images : ["https://greenbricks.net/GreenBricksLogo.png"],
    about: {
      "@type": residenceType(property.property_type),
      name: property.address,
      address: {
        "@type": "PostalAddress",
        streetAddress: property.address,
        addressLocality: property.suburb,
        addressRegion: property.state,
        postalCode: property.postcode,
        addressCountry: "LK",
      },
      ...(property.beds ? { numberOfBedrooms: property.beds } : {}),
      ...(property.baths ? { numberOfBathroomsTotal: property.baths } : {}),
    },
    offers: {
      "@type": "Offer",
      url,
      price: property.price,
      priceCurrency: "LKR",
      availability: isSold ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
      ...(property.agency_name
        ? { seller: { "@type": "RealEstateAgent", name: property.agency_name } }
        : {}),
    },
  };
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  const property = await getProperty(id);

  return (
    <>
      {property && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(listingSchema(property)) }}
        />
      )}
      <PropertyDetailClient />
    </>
  );
}
