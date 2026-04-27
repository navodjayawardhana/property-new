"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PropertyForm from "@/components/PropertyForm";
import { useAuth } from "@/lib/auth-context";
import { properties as propertiesApi, type Property } from "@/lib/api";
import { ArrowLeft } from "lucide-react";

export default function EditPropertyPage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const [property, setProperty] = useState<Property | null>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && (!user || (user.role !== 'seller' && user.role !== 'agent' && user.role !== 'admin'))) {
      router.replace('/signin');
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!id) return;
    propertiesApi.get(id)
      .then(setProperty)
      .catch(() => router.replace('/dashboard/admin'))
      .finally(() => setFetching(false));
  }, [id]);

  function handleSuccess(updated: Property) {
    if (user?.role === 'admin') {
      router.push('/dashboard/admin');
    } else {
      router.push(`/property/${updated.id}`);
    }
  }

  if (loading || fetching || !user) return null;
  if (!property) return null;

  const backHref = user.role === 'admin' ? '/dashboard/admin' : user.role === 'agent' ? '/dashboard/agent' : '/dashboard/seller';
  const dashLabel = user.role === 'admin' ? 'Admin Dashboard' : user.role === 'agent' ? 'Agent Dashboard' : 'Seller Dashboard';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-8 w-full flex-1">
        <Link href={backHref} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#16a34a] transition-colors mb-6">
          <ArrowLeft size={14} /> Back to dashboard
        </Link>

        <div className="mb-6">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{dashLabel}</p>
          <h1 className="text-2xl font-black text-gray-900 mt-0.5">Edit Listing</h1>
          <p className="text-sm text-gray-500 mt-1">{property.title}</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <PropertyForm
            mode="edit"
            propertyId={property.id}
            initialData={{
              title: property.title,
              listing_type: property.listing_type,
              property_type: property.property_type,
              condition: property.condition as 'new' | 'used',
              category: property.category as 'domestic' | 'commercial' | 'both',
              address: property.address,
              suburb: property.suburb,
              state: property.state,
              postcode: property.postcode ?? '',
              country: property.country ?? 'Sri Lanka',
              beds: String(property.beds),
              baths: String(property.baths),
              cars: String(property.cars),
              land_size: property.land_size ?? '',
              price: String(property.price),
              price_per_week: property.price_per_week ? String(property.price_per_week) : '',
              description: property.description,
              status: property.status,
              is_featured: property.is_featured,
            }}
            existingImages={property.images ?? []}
            token={token!}
            onSuccess={handleSuccess}
          />
        </div>
      </div>

      <Footer />
    </div>
  );
}
