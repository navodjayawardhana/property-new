"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { properties as propertiesApi, type PaymentReceiptData } from "@/lib/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Loader2, CheckCircle, XCircle, Printer, ArrowRight } from "lucide-react";

type PageStatus = "verifying" | "completed" | "failed" | "cancelled";

function fmt(n: number) {
  return "LKR " + n.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function ReceiptCard({ receipt, onViewListing }: { receipt: PaymentReceiptData; onViewListing: () => void }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm w-full max-w-lg mx-auto print:shadow-none print:rounded-none print:border-none">
      {/* Header */}
      <div className="bg-[#16a34a] rounded-t-2xl px-6 py-5 flex items-center justify-between print:rounded-none">
        <span className="text-white font-black text-lg">Greenbrick.net</span>
        <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
          Payment Receipt
        </span>
      </div>

      <div className="px-6 py-5 space-y-5">
        {/* Success badge */}
        <div className="flex items-center gap-2">
          <CheckCircle size={20} className="text-[#16a34a] shrink-0" />
          <span className="text-sm font-semibold text-[#16a34a]">Payment Successful — Listing Published</span>
        </div>

        {/* Order ID box */}
        <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl px-4 py-3">
          <p className="text-[10px] font-bold text-[#16a34a] uppercase tracking-widest mb-0.5">Receipt / Order No.</p>
          <p className="text-xl font-black text-[#14532d] tracking-widest">{receipt.order_id}</p>
          <p className="text-xs text-gray-400 mt-0.5">{receipt.paid_at}</p>
        </div>

        {/* Billing */}
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Billed To</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Name</span>
              <span className="font-medium text-gray-800">{receipt.user_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Email</span>
              <span className="font-medium text-gray-800">{receipt.user_email}</span>
            </div>
          </div>
        </div>

        <hr className="border-dashed border-gray-200" />

        {/* Listing */}
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Listing</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-gray-500 shrink-0">Property</span>
              <span className="font-medium text-gray-800 text-right">{receipt.listing_title}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-500 shrink-0">Address</span>
              <span className="font-medium text-gray-800 text-right">{receipt.listing_address}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Listing Price</span>
              <span className="font-medium text-gray-800">{fmt(receipt.listing_price)}</span>
            </div>
          </div>
        </div>

        <hr className="border-dashed border-gray-200" />

        {/* Payment summary */}
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Payment Summary</p>
          <div className="flex justify-between text-sm mb-3">
            <span className="text-gray-500">Listing Fee (Fixed Rate)</span>
            <span className="font-medium text-gray-800">{fmt(receipt.payment_amount)}</span>
          </div>
          <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
            <span className="font-bold text-gray-700 text-sm">Total Paid</span>
            <span className="text-xl font-black text-[#16a34a]">{fmt(receipt.payment_amount)}</span>
          </div>
          <div className="text-center mt-3">
            <span className="inline-block bg-[#dcfce7] text-[#15803d] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
              ✓ Paid via PayHere
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 pb-6 flex gap-3 print:hidden">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 border border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-800 font-semibold text-sm py-2.5 px-4 rounded-xl transition-colors"
        >
          <Printer size={15} /> Print
        </button>
        <button
          onClick={onViewListing}
          className="flex-1 flex items-center justify-center gap-2 bg-[#16a34a] hover:bg-[#15803d] text-white font-bold text-sm py-2.5 px-4 rounded-xl transition-colors"
        >
          View Listing <ArrowRight size={15} />
        </button>
      </div>

      <div className="bg-gray-50 rounded-b-2xl px-6 py-3 text-center text-xs text-gray-400 print:rounded-none">
        A receipt has been sent to <span className="font-medium">{receipt.user_email}</span>
      </div>
    </div>
  );
}

function PaymentReturnContent() {
  const searchParams  = useSearchParams();
  const router        = useRouter();
  const { token, loading } = useAuth();

  const orderId   = searchParams.get("order_id");
  const cancelled = searchParams.get("cancelled") === "1";

  const [status, setStatus]       = useState<PageStatus>("verifying");
  const [receipt, setReceipt]     = useState<PaymentReceiptData | null>(null);
  const [errMsg, setErrMsg]       = useState("");

  useEffect(() => {
    if (cancelled) { setStatus("cancelled"); return; }
    if (!orderId || loading) return;

    if (!token) {
      setStatus("failed");
      setErrMsg("Session expired. Please sign in and try again.");
      return;
    }

    let alive = true;

    const run = async () => {
      // Give notify_url 3 s to arrive first (works on production)
      await new Promise((r) => setTimeout(r, 3000));
      if (!alive) return;

      try {
        // Confirm payment + create listing
        await propertiesApi.completePayment(orderId, token);
        if (!alive) return;

        // Fetch receipt data
        const data = await propertiesApi.getReceipt(orderId, token);
        if (!alive) return;

        setReceipt(data);
        setStatus("completed");
      } catch (err: unknown) {
        if (!alive) return;
        const e = err as Error & { status?: number };
        if (e.status === 422) {
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

  if (loading) return null;

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-10">

      {status === "verifying" && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 max-w-sm w-full text-center shadow-sm">
          <Loader2 size={44} className="animate-spin text-[#16a34a] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Confirming Payment</h2>
          <p className="text-sm text-gray-500">
            Verifying your payment and creating your listing&hellip;
          </p>
        </div>
      )}

      {status === "completed" && receipt && (
        <ReceiptCard
          receipt={receipt}
          onViewListing={() => router.push(`/property/${receipt.property_id}`)}
        />
      )}

      {(status === "failed" || status === "cancelled") && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 max-w-sm w-full text-center shadow-sm">
          <XCircle size={44} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {status === "cancelled" ? "Payment Cancelled" : "Payment Failed"}
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            {status === "cancelled"
              ? "You cancelled the payment. Your listing was not created."
              : errMsg || "Your payment could not be processed."}
          </p>
          <button
            onClick={() => router.push("/dashboard/properties/new")}
            className="bg-[#16a34a] hover:bg-[#15803d] text-white font-bold py-3 px-6 rounded-xl transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

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
