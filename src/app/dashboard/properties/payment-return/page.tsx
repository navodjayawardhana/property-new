"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { properties as propertiesApi } from "@/lib/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

type PageStatus = "verifying" | "completed" | "failed" | "cancelled";

function PaymentReturnContent() {
  const searchParams             = useSearchParams();
  const router                   = useRouter();
  const { token, loading }       = useAuth();
  const orderId                  = searchParams.get("order_id");
  const cancelled                = searchParams.get("cancelled") === "1";
  const [status, setStatus]      = useState<PageStatus>("verifying");
  const [propertyId, setPropertyId] = useState<number | null>(null);
  const [errMsg, setErrMsg]      = useState("");

  useEffect(() => {
    if (cancelled) {
      setStatus("cancelled");
      return;
    }

    if (!orderId || loading) return;

    if (!token) {
      setStatus("failed");
      setErrMsg("Session expired. Please sign in and try again.");
      return;
    }

    let alive = true;

    // Give the server-to-server notify_url 3 seconds to arrive first.
    // Then call /payment/complete which creates the listing if not already done.
    const run = async () => {
      await new Promise((r) => setTimeout(r, 3000));
      if (!alive) return;

      try {
        const data = await propertiesApi.completePayment(orderId, token);
        if (!alive) return;
        setPropertyId(data.property_id);
        setStatus("completed");
      } catch (err: unknown) {
        if (!alive) return;
        const e = err as Error & { status?: number };
        if (e.status === 422) {
          // Backend explicitly said payment failed
          setStatus("failed");
          setErrMsg("Your payment was not successful. No charge was made.");
        } else {
          setStatus("failed");
          setErrMsg("Something went wrong confirming your payment. Please contact support.");
        }
      }
    };

    run();

    return () => { alive = false; };
  }, [orderId, token, loading, cancelled]);

  // Redirect to listing once confirmed
  useEffect(() => {
    if (status === "completed" && propertyId) {
      const t = setTimeout(() => router.push(`/property/${propertyId}`), 2500);
      return () => clearTimeout(t);
    }
  }, [status, propertyId, router]);

  if (loading) return null;

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-16">
      <div className="bg-white rounded-2xl border border-gray-100 p-8 max-w-md w-full text-center shadow-sm">

        {status === "verifying" && (
          <>
            <Loader2 size={48} className="animate-spin text-[#16a34a] mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Confirming Payment</h2>
            <p className="text-sm text-gray-500">
              Please wait while we verify your payment and create your listing&hellip;
            </p>
          </>
        )}

        {status === "completed" && (
          <>
            <CheckCircle size={48} className="text-[#16a34a] mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-sm text-gray-500">
              Your listing has been created. Redirecting&hellip;
            </p>
          </>
        )}

        {(status === "failed" || status === "cancelled") && (
          <>
            <XCircle size={48} className="text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {status === "cancelled" ? "Payment Cancelled" : "Payment Failed"}
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              {status === "cancelled"
                ? "You cancelled the payment. Your listing was not created."
                : errMsg || "Your payment could not be processed. Your listing was not created."}
            </p>
            <button
              onClick={() => router.push("/dashboard/properties/new")}
              className="bg-[#16a34a] hover:bg-[#15803d] text-white font-bold py-3 px-6 rounded-xl transition-colors"
            >
              Try Again
            </button>
          </>
        )}

      </div>
    </div>
  );
}

export default function PaymentReturnPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={32} className="animate-spin text-[#16a34a]" />
        </div>
      }>
        <PaymentReturnContent />
      </Suspense>
      <Footer />
    </div>
  );
}
