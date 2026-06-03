"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { properties as propertiesApi, type PaymentReceiptData } from "@/lib/api";
import { Loader2, CheckCircle, XCircle, Printer, ArrowRight } from "lucide-react";

type PageStatus = "verifying" | "completed" | "failed" | "cancelled";

function fmt(n: number) {
  return "LKR " + n.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Only visible when the user triggers window.print()
function PrintReceipt({ receipt }: { receipt: PaymentReceiptData }) {
  return (
    <div className="hidden print:block w-full max-w-lg mx-auto">
      {/* Header */}
      <div style={{ background: "#16a34a", padding: "24px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ color: "#fff", fontWeight: 900, fontSize: 20 }}>Greenbrick.net</span>
        <span style={{ color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", background: "rgba(255,255,255,0.2)", padding: "4px 12px", borderRadius: 20 }}>
          Payment Receipt
        </span>
      </div>

      <div style={{ padding: "28px 32px", fontFamily: "Arial, sans-serif" }}>
        {/* Order ID */}
        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "14px 18px", marginBottom: 24 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: "#16a34a", letterSpacing: 2, textTransform: "uppercase", margin: 0 }}>Receipt / Order No.</p>
          <p style={{ fontSize: 22, fontWeight: 900, color: "#14532d", letterSpacing: 3, margin: "4px 0 2px" }}>{receipt.order_id}</p>
          <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>{receipt.paid_at}</p>
        </div>

        {/* Billed To */}
        <p style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Billed To</p>
        <Row label="Name" value={receipt.user_name} />
        <Row label="Email" value={receipt.user_email} />

        <Divider />

        {/* Listing */}
        <p style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Listing</p>
        <Row label="Property"      value={receipt.listing_title} />
        <Row label="Address"       value={receipt.listing_address} />
        <Row label="Listing Price" value={fmt(receipt.listing_price)} />

        <Divider />

        {/* Payment */}
        <p style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Payment Summary</p>
        <Row label="Listing Fee (Fixed Rate)"  value={fmt(receipt.listing_fee)} />
        <Row label="Processing Fee (3.3%)"     value={fmt(receipt.processing_fee)} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f9fafb", borderRadius: 8, padding: "12px 16px", marginTop: 12 }}>
          <span style={{ fontWeight: 700, fontSize: 13 }}>Total Paid</span>
          <span style={{ fontWeight: 900, fontSize: 20, color: "#16a34a" }}>{fmt(receipt.payment_amount)}</span>
        </div>

        <div style={{ textAlign: "center", marginTop: 16 }}>
          <span style={{ display: "inline-block", background: "#dcfce7", color: "#15803d", fontSize: 11, fontWeight: 700, padding: "4px 14px", borderRadius: 20, letterSpacing: 1, textTransform: "uppercase" }}>
            ✓ Paid via PayHere
          </span>
        </div>
      </div>

      <div style={{ background: "#f9fafb", padding: "16px 32px", textAlign: "center", fontSize: 12, color: "#9ca3af", borderTop: "1px solid #f3f4f6" }}>
        Official receipt from Greenbrick.net &nbsp;|&nbsp; support@greenbrick.net
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "5px 0", borderBottom: "1px solid #f3f4f6" }}>
      <span style={{ color: "#6b7280" }}>{label}</span>
      <span style={{ color: "#374151", textAlign: "right", maxWidth: "55%" }}>{value}</span>
    </div>
  );
}

function Divider() {
  return <hr style={{ border: "none", borderTop: "1px dashed #d1d5db", margin: "18px 0" }} />;
}

function PaymentReturnContent() {
  const searchParams       = useSearchParams();
  const router             = useRouter();
  const { token, loading } = useAuth();

  const orderId   = searchParams.get("order_id");
  const cancelled = searchParams.get("cancelled") === "1";

  const [status, setStatus]   = useState<PageStatus>("verifying");
  const [receipt, setReceipt] = useState<PaymentReceiptData | null>(null);
  const [errMsg, setErrMsg]   = useState("");

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
      await new Promise((r) => setTimeout(r, 3000));
      if (!alive) return;

      try {
        await propertiesApi.completePayment(orderId, token);
        if (!alive) return;

        const data = await propertiesApi.getReceipt(orderId, token);
        if (!alive) return;

        setReceipt(data);
        setStatus("completed");
      } catch (err: unknown) {
        if (!alive) return;
        const e = err as Error & { status?: number };
        setStatus("failed");
        setErrMsg(
          e.status === 422
            ? "Your payment was not successful. No charge was made."
            : "Something went wrong confirming your payment. Please contact support.",
        );
      }
    };

    run();
    return () => { alive = false; };
  }, [orderId, token, loading, cancelled]);

  if (loading) return null;

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-10">

      {/* ── Verifying ── */}
      {status === "verifying" && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 max-w-sm w-full text-center shadow-sm print:hidden">
          <Loader2 size={44} className="animate-spin text-[#16a34a] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Confirming Payment</h2>
          <p className="text-sm text-gray-500">Verifying your payment and creating your listing&hellip;</p>
        </div>
      )}

      {/* ── Success (screen only) + PrintReceipt (print only) ── */}
      {status === "completed" && receipt && (
        <>
          {/* Screen card — hidden when printing */}
          <div className="bg-white rounded-2xl border border-gray-100 p-8 max-w-sm w-full text-center shadow-sm print:hidden">
            <CheckCircle size={48} className="text-[#16a34a] mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-1">Payment Successful!</h2>
            <p className="text-xs font-mono text-gray-400 mb-3 tracking-widest">{receipt.order_id}</p>
            <p className="text-sm text-gray-500 mb-6">
              Your listing has been published. A receipt has been sent to{" "}
              <span className="font-medium text-gray-700">{receipt.user_email}</span>.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 border border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-800 font-semibold text-sm py-2.5 px-4 rounded-xl transition-colors"
              >
                <Printer size={15} /> Print Receipt
              </button>
              <button
                onClick={() => router.push(`/property/${receipt.property_id}`)}
                className="flex-1 flex items-center justify-center gap-2 bg-[#16a34a] hover:bg-[#15803d] text-white font-bold text-sm py-2.5 px-4 rounded-xl transition-colors"
              >
                View Listing <ArrowRight size={15} />
              </button>
            </div>
          </div>

          {/* Full receipt — only visible when printing */}
          <PrintReceipt receipt={receipt} />
        </>
      )}

      {/* ── Failed / Cancelled ── */}
      {(status === "failed" || status === "cancelled") && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 max-w-sm w-full text-center shadow-sm print:hidden">
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
    <div className="min-h-screen bg-gray-50 flex flex-col print:bg-white">
      {/* Hide nav/footer when printing */}

      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center print:hidden">
          <Loader2 size={32} className="animate-spin text-[#16a34a]" />
        </div>
      }>
        <PaymentReturnContent />
      </Suspense>

    </div>
  );
}
