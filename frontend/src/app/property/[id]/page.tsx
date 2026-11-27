import type { Metadata } from 'next';
import { cache } from 'react';
import { notFound } from 'next/navigation';
import PropertyDetailClient from './PropertyDetailClient';
import { type Property } from '@/lib/api';
import { serverGet, ServerApiError } from '@/lib/server-api';
import { formatPrice, formatLandSize } from '@/lib/utils';

type Props = {
  params: Promise<{ id: string }>;
};

const SITE_URL = 'https://greenbrickz.com';

type PropertyFetchResult = {
  property: Property | null;
  isNotFound: boolean;
};

// Deduped so generateMetadata and the page body share a single SSR fetch.
const getPropertyResult = cache(async (id: string): Promise<PropertyFetchResult> => {
  try {
    const property = await serverGet<Property>(`/properties/${encodeURIComponent(id)}`, {
      revalidate: 300,
      timeoutMs: 4000,
    });
    return { property, isNotFound: false };
  } catch (err) {
    if (err instanceof ServerApiError && (err.status === 404 || err.status === 410)) {
      return { property: null, isNotFound: true };
    }
    return { property: null, isNotFound: false };
  }
});

function absoluteUrl(raw?: string | null): string {
  if (!raw) return `${SITE_URL}/GreenBricksLogo.png`;
  if (/^https?:\/\//i.test(raw)) return raw;
  return `${SITE_URL}${raw.startsWith('/') ? '' : '/'}${raw}`;
}

function buildPropertyTitle(property: Property): string {
  const headline = (property.title || property.address || 'Property Listing').trim();
  const priceText = formatPrice(property);
  const full = `${headline} - ${priceText} | Greenbricks`;
  if (full.length <= 65) return full;

  const withHeadlineOnly = `${headline} | Greenbricks`;
  if (withHeadlineOnly.length <= 65) return withHeadlineOnly;

  const maxLen = 65 - ' | Greenbricks'.length - 1;
  return `${headline.slice(0, maxLen).trimEnd()}… | Greenbricks`;
}

function buildPropertyDescription(property: Property): string {
  const priceText = formatPrice(property);
  const verb =
    property.listing_type === 'rent'
      ? 'for rent'
      : property.listing_type === 'sold'
        ? 'sold'
        : 'for sale';
  const loc = [property.suburb, property.district || property.state].filter(Boolean).join(', ');
  const landText = formatLandSize(property.land_size);
  const specs = [
    property.beds ? `${property.beds} bed${property.beds !== 1 ? 's' : ''}` : null,
    property.baths ? `${property.baths} bath${property.baths !== 1 ? 's' : ''}` : null,
    landText,
  ]
    .filter(Boolean)
    .join(', ');
  const label = (property.title || property.address || property.property_type).trim();
  const base = `${label} — ${property.property_type} ${verb} in ${loc} at ${priceText}${specs ? ` (${specs})` : ''}.`;
  const cleanDesc = (property.description || '').replace(/\s+/g, ' ').trim();
  const combined = cleanDesc ? `${base} ${cleanDesc}` : `${base} View photos and details on Greenbricks.`;
  return combined.length <= 158 ? combined : `${combined.slice(0, 155).trimEnd()}...`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const { property, isNotFound } = await getPropertyResult(id);

  if (!property) {
    return {
      title: isNotFound ? 'Property Not Found | Greenbricks' : 'Property Details | Greenbricks',
      description: 'View verified property listings across Sri Lanka on Greenbricks.',
      ...(isNotFound ? { robots: { index: false, follow: false } } : {}),
    };
  }

  const title = buildPropertyTitle(property);
  const description = buildPropertyDescription(property);
  const primaryRaw =
    property.images && property.images.length > 0
      ? property.images.find((img) => img.is_primary)?.url || property.images[0]?.url
      : null;
  const image = absoluteUrl(primaryRaw);
  const url = `${SITE_URL}/property/${property.id}`;

  return {
    title,
    description,
    keywords: [
      property.property_type,
      property.suburb,
      property.district || property.state,
      `property ${property.listing_type === 'rent' ? 'for rent' : 'for sale'} Sri Lanka`,
    ]
      .filter(Boolean)
      .join(', '),
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      images: [{ url: image, width: 1200, height: 630, alt: property.title || property.address }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

/** Maps property_type to a valid schema.org Place/Accommodation type. */
function accommodationSchemaType(propertyType: string): { type: string; isAccommodation: boolean } {
  const t = (propertyType || '').toLowerCase();
  if (t.includes('apartment') || t.includes('unit') || t.includes('studio') || t.includes('annex')) {
    return { type: 'Apartment', isAccommodation: true };
  }
  if (t.includes('house') || t.includes('villa') || t.includes('townhouse') || t.includes('bungalow')) {
    return { type: 'SingleFamilyResidence', isAccommodation: true };
  }
  return { type: 'Place', isAccommodation: false };
}

function listingSchema(property: Property) {
  const url = `${SITE_URL}/property/${property.id}`;
  const images = (property.images ?? []).map((img) => absoluteUrl(img.url)).filter(Boolean);
  const isSold = property.listing_type === 'sold';
  const { type: aboutType, isAccommodation } = accommodationSchemaType(property.property_type);
  const numericPrice = Number(property.price);

  const address: Record<string, string> = {
    '@type': 'PostalAddress',
    addressCountry: 'LK',
  };
  if (property.address?.trim()) address.streetAddress = property.address.trim();
  if (property.suburb?.trim()) address.addressLocality = property.suburb.trim();
  if ((property.district || property.state)?.trim()) {
    address.addressRegion = (property.district || property.state).trim();
  }
  if (property.postcode?.trim()) address.postalCode = property.postcode.trim();

  const about: Record<string, unknown> = {
    '@type': aboutType,
    name: property.title || property.address,
    address,
  };
  if (isAccommodation) {
    if (property.beds > 0) about.numberOfBedrooms = property.beds;
    if (property.baths > 0) about.numberOfBathroomsTotal = property.baths;
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    '@id': url,
    url,
    name: property.title || property.address,
    description: buildPropertyDescription(property),
    ...(property.created_at ? { datePosted: property.created_at } : {}),
    image: images.length > 0 ? images : [`${SITE_URL}/GreenBricksLogo.png`],
    about,
    offers: {
      '@type': 'Offer',
      url,
      ...(Number.isFinite(numericPrice) && numericPrice > 0 ? { price: numericPrice } : {}),
      priceCurrency: 'LKR',
      availability: isSold ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock',
      ...(property.agency_name?.trim()
        ? { seller: { '@type': 'RealEstateAgent', name: property.agency_name.trim() } }
        : {}),
    },
  };
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  const { property, isNotFound } = await getPropertyResult(id);

  if (isNotFound) {
    notFound();
  }

  return (
    <>
      {property && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(listingSchema(property)) }}
        />
      )}
      <PropertyDetailClient initialProperty={property} />
    </>
  );
}
