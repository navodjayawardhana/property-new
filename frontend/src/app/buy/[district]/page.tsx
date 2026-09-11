import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DistrictLanding from "@/components/DistrictLanding";
import { DISTRICTS, getDistrict } from "@/lib/districts";

type Props = { params: Promise<{ district: string }> };

// Only the 25 real districts exist; anything else 404s rather than generating
// a thin auto-built page. Listings refresh hourly via ISR.
export const dynamicParams = false;
export const revalidate = 3600;

export function generateStaticParams() {
  return DISTRICTS.map((d) => ({ district: d.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { district: slug } = await params;
  const district = getDistrict(slug);
  if (!district) return { title: "District Not Found | Greenbricks" };

  const title = `Property for Sale in ${district.name}, Sri Lanka | Greenbricks`;
  const description = `Browse houses, apartments and land for sale in ${district.name}, ${district.province} Province. ${district.blurb}`.slice(0, 160);
  const url = `https://greenbrickz.com/buy/${district.slug}`;

  return {
    title,
    description,
    keywords: `property for sale ${district.name}, houses for sale ${district.name}, land for sale ${district.name}, real estate ${district.name} Sri Lanka`,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      images: [
        {
          url: "https://greenbrickz.com/GreenBricksLogo.png",
          width: 1200,
          height: 630,
          alt: `Property for sale in ${district.name}, Sri Lanka`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://greenbrickz.com/GreenBricksLogo.png"],
    },
  };
}

export default async function BuyDistrictPage({ params }: Props) {
  const { district: slug } = await params;
  const district = getDistrict(slug);
  if (!district) notFound();

  return <DistrictLanding district={district} mode="buy" />;
}
