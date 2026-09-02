import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DistrictLanding from "@/components/DistrictLanding";
import { DISTRICTS, getDistrict } from "@/lib/districts";

type Props = { params: Promise<{ district: string }> };

export const dynamicParams = false;
export const revalidate = 3600;

export function generateStaticParams() {
  return DISTRICTS.map((d) => ({ district: d.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { district: slug } = await params;
  const district = getDistrict(slug);
  if (!district) return { title: "District Not Found | Greenbricks" };

  const title = `Property for Rent in ${district.name}, Sri Lanka | Greenbricks`;
  const description = `Find houses, apartments and annexes for rent in ${district.name}, ${district.province} Province. ${district.blurb}`.slice(0, 160);
  const url = `https://greenbricks.net/rent/${district.slug}`;

  return {
    title,
    description,
    keywords: `property for rent ${district.name}, houses for rent ${district.name}, apartments for rent ${district.name}, rentals ${district.name} Sri Lanka`,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      images: [
        {
          url: "https://greenbricks.net/GreenBricksLogo.png",
          width: 1200,
          height: 630,
          alt: `Property for rent in ${district.name}, Sri Lanka`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://greenbricks.net/GreenBricksLogo.png"],
    },
  };
}

export default async function RentDistrictPage({ params }: Props) {
  const { district: slug } = await params;
  const district = getDistrict(slug);
  if (!district) notFound();

  return <DistrictLanding district={district} mode="rent" />;
}
