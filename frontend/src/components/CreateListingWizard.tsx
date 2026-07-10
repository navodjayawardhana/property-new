"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle, Search } from "lucide-react";
import PropertyForm, { type SellerPayload } from "@/components/PropertyForm";
import SriLankaAddressFields from "@/components/SriLankaAddressFields";
import { admin as adminApi, type PaginatedUsers, type Property, type User } from "@/lib/api";

type NewSellerForm = {
  name: string; email: string; phone: string;
  role: 'buyer' | 'seller' | 'agent';
  country: string; state: string; district: string; suburb: string; postcode: string;
};

const EMPTY_NEW_SELLER: NewSellerForm = {
  name: "", email: "", phone: "",
  role: "seller",
  country: "Sri Lanka", state: "", district: "", suburb: "", postcode: "",
};

type Props = {
  token: string;
  submitSellerListing?: (data: FormData, token: string) => Promise<{ property: Property; seller: User; temporary_password: string | null }>;
  searchUsers?: (filters: { role?: string; search?: string }, token: string) => Promise<PaginatedUsers>;
};

export function CreateListingWizard({ token, submitSellerListing, searchUsers }: Props) {
  const [subTab, setSubTab] = useState<"seller" | "listing">("seller");
  const [sellerMode, setSellerMode] = useState<"existing" | "new">("new");

  // Existing-seller search
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"" | "buyer" | "seller" | "agent">("");
  const [results, setResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState<User | null>(null);

  // New-seller form
  const [newSeller, setNewSeller] = useState<NewSellerForm>(EMPTY_NEW_SELLER);

  const [result, setResult] = useState<{ seller: User; temporaryPassword: string | null; propertyId: number } | null>(null);

  useEffect(() => {
    if (sellerMode !== "existing" || !search.trim()) { setResults([]); return; }
    setSearching(true);
    const t = setTimeout(() => {
      (searchUsers ?? adminApi.users)({ role: roleFilter || undefined, search }, token)
        .then((res) => setResults(res.data))
        .catch(() => setResults([]))
        .finally(() => setSearching(false));
    }, 350);
    return () => clearTimeout(t);
  }, [search, roleFilter, sellerMode, token, searchUsers]);

  const sellerReady = sellerMode === "existing"
    ? !!selectedSeller
    : !!(newSeller.name && newSeller.email);

  const sellerPayload: SellerPayload | undefined = sellerReady
    ? (sellerMode === "existing"
        ? { mode: "existing", sellerId: selectedSeller!.id }
        : {
            mode: "new",
            name: newSeller.name, email: newSeller.email,
            phone: newSeller.phone || undefined, role: newSeller.role,
            country: newSeller.country || undefined, state: newSeller.state || undefined,
            district: newSeller.district || undefined, suburb: newSeller.suburb || undefined,
          })
    : undefined;

  const inp = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#16a34a] transition-colors bg-white";
  const lbl = "block text-xs font-semibold text-gray-600 mb-1.5";

  if (result) {
    return (
      <div className="max-w-xl bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <div className="flex items-center gap-2 text-[#16a34a]">
          <CheckCircle size={20} />
          <h3 className="font-black text-gray-900">Listing created</h3>
        </div>
        <p className="text-sm text-gray-600">
          The listing has been created for <span className="font-semibold">{result.seller.name}</span>
          {result.seller.email && <> ({result.seller.email})</>}.
        </p>
        {result.temporaryPassword && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
            <p className="font-bold mb-1">Temporary password (share securely — shown only once):</p>
            <code className="bg-white border border-amber-200 rounded-lg px-2 py-1 inline-block mt-1">{result.temporaryPassword}</code>
            {result.seller.phone && <p className="mt-2 text-xs">An SMS with these details was also sent to {result.seller.phone}.</p>}
          </div>
        )}
        <div className="flex items-center gap-3 pt-2">
          <Link href={`/property/${result.propertyId}`} target="_blank"
            className="bg-[#16a34a] hover:bg-[#15803d] text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors">
            View Listing
          </Link>
          <button onClick={() => {
            setResult(null); setSubTab("seller"); setSelectedSeller(null);
            setNewSeller(EMPTY_NEW_SELLER); setSearch(""); setResults([]);
          }}
            className="border border-gray-200 text-gray-700 text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
            Create Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-5">
      {/* Sub-tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200">
        {([
          { id: "seller" as const, label: "1. Seller Details" },
          { id: "listing" as const, label: "2. Listing Details" },
        ]).map((t) => (
          <button key={t.id} onClick={() => setSubTab(t.id)}
            disabled={t.id === "listing" && !sellerReady}
            className={`px-4 py-2.5 text-sm font-bold border-b-2 -mb-px transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
              subTab === t.id ? "border-[#16a34a] text-[#16a34a]" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {subTab === "seller" ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
          <div className="flex gap-2">
            {([
              { id: "new" as const, label: "Create New Seller Account" },
              { id: "existing" as const, label: "Use Existing User" },
            ]).map((m) => (
              <button key={m.id} type="button" onClick={() => setSellerMode(m.id)}
                className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-colors ${
                  sellerMode === m.id ? "bg-[#16a34a] text-white border-[#16a34a]" : "bg-white text-gray-600 border-gray-200 hover:border-[#16a34a] hover:text-[#16a34a]"
                }`}>
                {m.label}
              </button>
            ))}
          </div>

          {sellerMode === "existing" ? (
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input className={inp + " pl-9"} value={search} onChange={(e) => { setSearch(e.target.value); setSelectedSeller(null); }}
                    placeholder="Search by name, email or phone" />
                </div>
                <select className={inp + " w-36"} value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}>
                  <option value="">Any role</option>
                  <option value="seller">Seller</option>
                  <option value="agent">Agent</option>
                  <option value="buyer">Buyer</option>
                </select>
              </div>

              {selectedSeller ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                  <div>
                    <p className="text-sm font-bold text-gray-900">{selectedSeller.name}</p>
                    <p className="text-xs text-gray-500">{selectedSeller.email} · {selectedSeller.phone ?? "no phone"} · {selectedSeller.role}</p>
                  </div>
                  <button onClick={() => setSelectedSeller(null)} className="text-xs font-semibold text-gray-500 hover:text-red-500">Change</button>
                </div>
              ) : (
                <div className="border border-gray-100 rounded-xl divide-y divide-gray-50 max-h-64 overflow-y-auto">
                  {searching ? (
                    <p className="text-sm text-gray-400 p-4">Searching…</p>
                  ) : results.length === 0 ? (
                    <p className="text-sm text-gray-400 p-4">{search ? "No users found." : "Type to search for a user."}</p>
                  ) : results.map((u) => (
                    <button key={u.id} onClick={() => setSelectedSeller(u)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors">
                      <p className="text-sm font-semibold text-gray-900">{u.name}</p>
                      <p className="text-xs text-gray-500">{u.email} · {u.phone ?? "no phone"} · {u.role}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>Full Name *</label>
                  <input className={inp} value={newSeller.name} onChange={(e) => setNewSeller((p) => ({ ...p, name: e.target.value }))} />
                </div>
                <div>
                  <label className={lbl}>Account Type *</label>
                  <select className={inp} value={newSeller.role} onChange={(e) => setNewSeller((p) => ({ ...p, role: e.target.value as NewSellerForm["role"] }))}>
                    <option value="seller">Seller</option>
                    <option value="agent">Agent</option>
                    <option value="buyer">Buyer</option>
                  </select>
                </div>
                <div>
                  <label className={lbl}>Email *</label>
                  <input type="email" className={inp} value={newSeller.email} onChange={(e) => setNewSeller((p) => ({ ...p, email: e.target.value }))} />
                </div>
                <div>
                  <label className={lbl}>Phone</label>
                  <input className={inp} value={newSeller.phone} onChange={(e) => setNewSeller((p) => ({ ...p, phone: e.target.value }))} placeholder="07XXXXXXXX" />
                </div>
              </div>
              <p className="text-xs text-gray-400">A password will be generated automatically and sent to the seller by SMS.</p>
              <SriLankaAddressFields
                province={newSeller.state} district={newSeller.district}
                city={newSeller.suburb} postcode={newSeller.postcode}
                onProvinceChange={(v) => setNewSeller((p) => ({ ...p, state: v }))}
                onDistrictChange={(v) => setNewSeller((p) => ({ ...p, district: v }))}
                onCityChange={(v) => setNewSeller((p) => ({ ...p, suburb: v }))}
                onPostcodeChange={(v) => setNewSeller((p) => ({ ...p, postcode: v }))}
              />
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button onClick={() => setSubTab("listing")} disabled={!sellerReady}
              className="flex items-center gap-2 bg-[#16a34a] hover:bg-[#15803d] disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors">
              Next: Listing Details
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <PropertyForm
            mode="create"
            isAdmin
            token={token}
            sellerPayload={sellerPayload}
            submitSellerListing={submitSellerListing}
            onSellerCreated={(seller, temporaryPassword) => {
              setResult({ seller, temporaryPassword, propertyId: 0 });
            }}
            onSuccess={(property) => {
              setResult((prev) => prev && { ...prev, propertyId: property.id });
            }}
          />
        </div>
      )}
    </div>
  );
}
