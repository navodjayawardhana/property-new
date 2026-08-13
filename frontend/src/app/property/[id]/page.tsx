import type { Metadata } from 'next';
import PropertyDetailClient from './PropertyDetailClient';
import { properties as propertiesApi } from '@/lib/api';
import { formatPrice } from '@/lib/utils';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { id } = await params;
    const property = await propertiesApi.get(id);

    const title = `${property.address} - ${formatPrice(property)} | Greenbricks`;
    const description = `${property.property_type} in ${property.suburb}, ${property.state}. ${property.beds} bed${property.beds !== 1 ? 's' : ''}, ${property.baths} bath${property.baths !== 1 ? 's' : ''}. Listed on Greenbricks.`;
    const image = property.images && property.images.length > 0
      ? property.images.find(img => img.is_primary)?.url || property.images[0]?.url
      : '/GreenBricksLogo.png';

    return {
      title,
      description,
      keywords: `${property.property_type}, ${property.suburb}, ${property.state}, property for ${property.listing_type}`,
      openGraph: {
        title,
        description,
        url: `https://greenbricks.net/property/${property.id}`,
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
  } catch (error) {
    return {
      title: "Property Details | Greenbricks",
      description: "View property details on Greenbricks",
    };
  }
}

export default function Page() {
  return <PropertyDetailClient />;
}
