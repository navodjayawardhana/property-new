"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PropertyForm from "@/components/PropertyForm";
import { useAuth } from "@/lib/auth-context";
import { type Property } from "@/lib/api";
import { ArrowLeft } from "lucide-react";

export default function NewPropertyPage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || (user.role !== 'seller' && user.role !== 'agent' && user.role !== 'admin'))) {
      router.replace('/signin');
    }
  }, [loading, user, router]);

  function handleSuccess(property: Property) {
    router.push(`/property/${property.id}`);
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
          <h1 className="text-2xl font-black text-gray-900 mt-0.5">Create New Listing</h1>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <PropertyForm
            mode="create"
            token={token!}
            onSuccess={handleSuccess}
          />
        </div>
      </div>

      <Footer />
    </div>
  );
}
