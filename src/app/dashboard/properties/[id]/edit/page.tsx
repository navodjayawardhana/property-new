"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PropertyForm from "@/components/PropertyForm";
import { useAuth } from "@/lib/auth-context";
import { properties as propertiesApi, type Property } from "@/lib/api";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";

export default function EditPropertyPage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const [property, setProperty] = useState<Property | null>(null);
  const [fetching, setFetching] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!loading && (!user || (user.role !== 'seller' && user.role !== 'agent' && user.role !== 'admin'))) {
      router.replace('/signin');
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!id) return;
    propertiesApi.get(id)
      .then((p) => {
        if (user && p.user_id !== user.id && user.role !== 'admin') {
          setNotFound(true);
        } else {
          setProperty(p);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setFetching(false));
  }, [id, user]);

  function handleSuccess(updated: Property) {
    router.push(`/property/${updated.id}`);
  }

  if (loading || !user) return null;

  const backHref = user.role === 'agent' ? '/dashboard/agent' : '/dashboard/seller';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-8 w-full flex-1">
        <Link href={backHref} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#16a34a] transition-colors mb-6">
          <ArrowLeft size={14} /> Back to dashboard
        </Link>

        <div className="mb-6">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
            {user.role === 'agent' ? 'Agent Dashboard' : 'Seller Dashboard'}
          </p>
          <h1 className="text-2xl font-black text-gray-900 mt-0.5">Edit Listing</h1>
        </div>

        {fetching ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-gray-400" />
          </div>
        ) : notFound ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
            <AlertCircle size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Listing not found</p>
            <p className="text-gray-400 text-sm mt-1">This listing doesn't exist or you don't have permission to edit it.</p>
            <Link href={backHref} className="inline-block mt-5 text-sm font-semibold text-[#16a34a] hover:underline">
              Back to dashboard
            </Link>
          </div>
        ) : property ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <PropertyForm
              mode="edit"
              propertyId={property.id}
              existingImages={property.images}
              initialData={{
                title: property.title,
                listing_type: property.listing_type,
                property_type: property.property_type,
                address: property.address,
                suburb: property.suburb,
                state: property.state,
                postcode: property.postcode,
                beds: String(property.beds),
                baths: String(property.baths),
                cars: String(property.cars),
                land_size: property.land_size ?? '',
                price: String(property.price),
                price_per_week: property.price_per_week ? String(property.price_per_week) : '',
                description: property.description,
                agent_name: property.agent_name,
                agency_name: property.agency_name,
                status: property.status,
                is_featured: property.is_featured,
              }}
              token={token!}
              onSuccess={handleSuccess}
            />
          </div>
        ) : null}
      </div>

      <Footer />
    </div>
  );
}
