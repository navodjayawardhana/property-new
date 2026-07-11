"use client";

import { useState, useRef, useEffect } from "react";
import { properties as propertiesApi, admin as adminApi, publicSettings as publicSettingsApi, type Property, type PropertyImage, type AdminSettings, type User } from "@/lib/api";
import { COUNTRY_CODES } from "@/lib/countries";
import { X, Upload, Loader2, Info } from "lucide-react";
import SriLankaAddressFields from "@/components/SriLankaAddressFields";

type FormState = {
  title: string;
  listing_type: 'buy' | 'rent' | 'sold';
  property_type: string;
  condition: 'new' | 'used';
  category: 'domestic' | 'commercial' | 'both';
  address: string;
  suburb: string;
  district: string;
  state: string;
  postcode: string;
  country: string;
  beds: string;
  baths: string;
  cars: string;
  land_size: string;
  price: string;
  price_per_week: string;
  description: string;
  agent_name: string;
  agency_name: string;
  status: 'active' | 'inactive' | 'sold';
  is_featured: boolean;
};

export type SellerPayload =
  | { mode: 'existing'; sellerId: number }
  | {
      mode: 'new';
      name: string;
      email: string;
      phone?: string;
      role?: 'buyer' | 'seller' | 'agent';
      country?: string;
      state?: string;
      district?: string;
      suburb?: string;
    };

type Props = {
  mode: 'create' | 'edit';
  initialData?: Partial<FormState>;
  propertyId?: number;
  existingImages?: PropertyImage[];
  token: string;
  isAdmin?: boolean;
  sellerPayload?: SellerPayload;
  submitSellerListing?: (data: FormData, token: string) => Promise<{ property: Property; seller: User; temporary_password: string | null }>;
  onSellerCreated?: (seller: User, temporaryPassword: string | null) => void;
  onSuccess: (property: Property) => void;
};

const defaultForm: FormState = {
  title: '',
  listing_type: 'buy',
  property_type: 'House',
  condition: 'used',
  category: 'domestic',
  address: '',
  suburb: '',
  district: '',
  state: '',
  postcode: '',
  country: 'Sri Lanka',
  beds: '3',
  baths: '2',
  cars: '1',
  land_size: '',
  price: '',
  price_per_week: '',
  description: '',
  agent_name: '',
  agency_name: '',
  status: 'active',
  is_featured: false,
};

const TYPES = ['House', 'Apartment', 'Townhouse', 'Land', 'Unit', 'Villa', 'Acreage'];

export default function PropertyForm({ mode, initialData, propertyId, existingImages = [], token, isAdmin = false, sellerPayload, submitSellerListing, onSellerCreated, onSuccess }: Props) {
  const [form, setForm] = useState<FormState>({ ...defaultForm, ...initialData });
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [currentImages, setCurrentImages] = useState<PropertyImage[]>(existingImages);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpPhase, setOtpPhase] = useState<'form' | 'otp'>('form');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [settings, setSettings] = useState<AdminSettings | null>(null);

  useEffect(() => {
    if (isAdmin && token) {
      adminApi.getSettings(token).then(setSettings).catch(() => {});
    } else if (!isAdmin) {
      publicSettingsApi.getFees().then(setSettings).catch(() => {});
    }
  }, [isAdmin, token]);

  function set(field: keyof FormState, value: string | boolean) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleFiles(files: FileList | null) {
    if (!files) return;
    Array.from(files).forEach((f) => {
      setNewFiles((prev) => [...prev, f]);
      const reader = new FileReader();
      reader.onload = (e) => setPreviews((prev) => [...prev, e.target?.result as string]);
      reader.readAsDataURL(f);
    });
  }

  function removeNewFile(idx: number) {
    setNewFiles((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => prev.filter((_, i) => i !== idx));
  }

  async function removeExistingImage(imageId: number) {
    if (!propertyId) return;
    try {
      await propertiesApi.deleteImage(propertyId, imageId, token);
      setCurrentImages((prev) => prev.filter((i) => i.id !== imageId));
    } catch { /* ignore */ }
  }

  function buildFormData(otp?: string): FormData {
    const fd = new FormData();
    fd.append('title', form.title);
    fd.append('listing_type', form.listing_type);
    fd.append('property_type', form.property_type);
    fd.append('condition', form.condition);
    fd.append('category', form.category);
    fd.append('address', form.address);
    fd.append('suburb', form.suburb);
    if (form.district) fd.append('district', form.district);
    fd.append('state', form.state);
    fd.append('postcode', form.postcode);
    fd.append('country', form.country);
    fd.append('beds', form.beds);
    fd.append('baths', form.baths);
    fd.append('cars', form.cars);
    if (form.land_size) fd.append('land_size', form.land_size);
    fd.append('price', form.price);
    if (form.price_per_week) fd.append('price_per_week', form.price_per_week);
    fd.append('description', form.description);
    if (form.agent_name)  fd.append('agent_name',  form.agent_name);
    if (form.agency_name) fd.append('agency_name', form.agency_name);
    fd.append('status', form.status);
    fd.append('is_featured', form.is_featured ? '1' : '0');
    if (otp) fd.append('listing_otp', otp);
    newFiles.forEach((file) => fd.append('images[]', file));
    return fd;
  }

  async function handleOtpSubmit() {
    setOtpError(null);
    setSubmitting(true);
    try {
      const checkout = await propertiesApi.initiatePayment(buildFormData(otpCode), token);

      if (!('checkout_url' in checkout)) {
        // Payment gateway disabled — listing was created directly, pending admin approval.
        setOtpPhase('form');
        onSuccess(checkout);
        return;
      }

      // Auto-submit a hidden form to PayHere checkout page
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = checkout.checkout_url;

      const fields = [
        'merchant_id', 'return_url', 'cancel_url', 'notify_url',
        'order_id', 'items', 'currency', 'amount',
        'first_name', 'last_name', 'email', 'phone',
        'address', 'city', 'country', 'hash',
      ] as const;

      fields.forEach((key) => {
        const input = document.createElement('input');
        input.type  = 'hidden';
        input.name  = key;
        input.value = checkout[key];
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
      // page navigates away — no finally block needed
    } catch (err: unknown) {
      const e = err as Error & { errors?: Record<string, string[]> };
      const msg = e.errors ? Object.values(e.errors).flat().join(' · ') : (e.message ?? 'Something went wrong');
      setOtpError(msg);
      setSubmitting(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (mode === 'create') {
      if (isAdmin) {
        setSubmitting(true);
        try {
          const fd = buildFormData();
          let property: Property;
          if (sellerPayload) {
            fd.append('seller_mode', sellerPayload.mode);
            if (sellerPayload.mode === 'existing') {
              fd.append('seller_id', String(sellerPayload.sellerId));
            } else {
              fd.append('seller_name', sellerPayload.name);
              fd.append('seller_email', sellerPayload.email);
              if (sellerPayload.phone) fd.append('seller_phone', sellerPayload.phone);
              if (sellerPayload.role) fd.append('seller_role', sellerPayload.role);
              if (sellerPayload.country) fd.append('seller_country', sellerPayload.country);
              if (sellerPayload.state) fd.append('seller_state', sellerPayload.state);
              if (sellerPayload.district) fd.append('seller_district', sellerPayload.district);
              if (sellerPayload.suburb) fd.append('seller_suburb', sellerPayload.suburb);
            }
            const result = await (submitSellerListing ?? adminApi.createListingForSeller)(fd, token);
            property = result.property;
            onSellerCreated?.(result.seller, result.temporary_password);
          } else {
            property = await adminApi.createProperty(fd, token);
          }
          onSuccess(property);
        } catch (err: unknown) {
          const e = err as Error & { errors?: Record<string, string[]> };
          setError(e.errors ? Object.values(e.errors).flat().join(' · ') : (e.message ?? 'Something went wrong'));
        } finally {
          setSubmitting(false);
        }
        return;
      }

      setSubmitting(true);
      try {
        const res = await propertiesApi.sendListingOtp(token);
        setMaskedEmail(res.masked_email);
        setOtpCode('');
        setOtpError(null);
        setOtpPhase('otp');
      } catch (err: unknown) {
        const e = err as Error;
        setError(e.message ?? 'Failed to send verification code.');
      } finally {
        setSubmitting(false);
      }
      return;
    }

    setSubmitting(true);
    try {
      let property: Property;

      property = await propertiesApi.update(propertyId!, {
        title: form.title,
        listing_type: form.listing_type,
        property_type: form.property_type,
        condition: form.condition,
        category: form.category,
        address: form.address,
        suburb: form.suburb,
        district: form.district || undefined,
        state: form.state,
        postcode: form.postcode,
        country: form.country,
        beds: parseInt(form.beds) || 0,
        baths: parseInt(form.baths) || 0,
        cars: parseInt(form.cars) || 0,
        land_size: form.land_size || null,
        price: parseInt(form.price) || 0,
        price_per_week: form.price_per_week ? parseInt(form.price_per_week) : null,
        description: form.description,
        agent_name: form.agent_name || undefined,
        agency_name: form.agency_name || undefined,
        status: form.status,
        is_featured: form.is_featured,
      }, token);
      if (newFiles.length > 0) {
        const imgFd = new FormData();
        newFiles.forEach((file) => imgFd.append('images[]', file));
        await propertiesApi.uploadImages(propertyId!, imgFd, token);
        property = await propertiesApi.get(propertyId!);
      }
      onSuccess(property);
    } catch (err: unknown) {
      const e = err as Error & { errors?: Record<string, string[]> };
      setError(e.errors ? Object.values(e.errors).flat().join(' · ') : (e.message ?? 'Something went wrong'));
    } finally {
      setSubmitting(false);
    }
  }

  const inp = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#16a34a] transition-colors bg-white";
  const lbl = "block text-xs font-semibold text-gray-600 mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className={lbl}>Title *</label>
          <input required className={inp} value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Charming 3BR Family Home in Brighton" />
        </div>

        <div>
          <label className={lbl}>Listing Type *</label>
          <select required className={inp} value={form.listing_type} onChange={(e) => set('listing_type', e.target.value as FormState['listing_type'])}>
            <option value="buy">For Sale</option>
            <option value="rent">For Rent</option>
            <option value="sold">Sold</option>
          </select>
        </div>

        <div>
          <label className={lbl}>Property Type *</label>
          <select required className={inp} value={form.property_type} onChange={(e) => set('property_type', e.target.value)}>
            {TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>

        {/* Condition */}
        <div>
          <label className={lbl}>Condition *</label>
          <div className="flex gap-2">
            {(['new', 'used'] as const).map((c) => (
              <button key={c} type="button"
                onClick={() => set('condition', c)}
                className={`flex-1 py-2 rounded-lg border text-sm font-semibold capitalize transition-colors ${
                  form.condition === c
                    ? 'bg-[#16a34a] text-white border-[#16a34a]'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-[#16a34a] hover:text-[#16a34a]'
                }`}>
                {c === 'new' ? 'New' : 'Used'}
              </button>
            ))}
          </div>
        </div>

        {/* Category — both can be selected at once */}
        <div>
          <label className={lbl}>Category *</label>
          <div className="flex gap-2">
            {(['domestic', 'commercial'] as const).map((c) => {
              const active = form.category === c || form.category === 'both';
              return (
                <button key={c} type="button"
                  onClick={() => {
                    if (form.category === 'both') {
                      // deselect this one, keep the other
                      set('category', c === 'domestic' ? 'commercial' : 'domestic');
                    } else if (form.category === c) {
                      // already solo — don't allow deselecting the last one
                    } else {
                      // other is selected → select both
                      set('category', 'both');
                    }
                  }}
                  className={`flex-1 py-2 rounded-lg border text-sm font-semibold capitalize transition-colors ${
                    active
                      ? 'bg-[#16a34a] text-white border-[#16a34a]'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-[#16a34a] hover:text-[#16a34a]'
                  }`}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </button>
              );
            })}
          </div>
          <p className="text-[10px] text-gray-400 mt-1">Select one or both</p>
        </div>

        <div className="md:col-span-2">
          <label className={lbl}>Address *</label>
          <input required className={inp} value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="e.g. 12 Oak Street" />
        </div>

        <div className="md:col-span-2">
          <SriLankaAddressFields
            province={form.state}
            district={form.district}
            city={form.suburb}
            postcode={form.postcode}
            onProvinceChange={(v) => set('state', v)}
            onDistrictChange={(v) => set('district', v)}
            onCityChange={(v) => set('suburb', v)}
            onPostcodeChange={(v) => set('postcode', v)}
          />
        </div>

        <div className="md:col-span-2">
          <label className={lbl}>Country *</label>
          <select required className={inp} value={form.country} onChange={(e) => set('country', e.target.value)}>
            <option value="">Select country</option>
            {COUNTRY_CODES.map((c) => (
              <option key={c.code} value={c.name}>{c.flag} {c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={lbl}>Price (LKR) *</label>
          <input required type="number" min={0} className={inp} value={form.price} onChange={(e) => set('price', e.target.value)} placeholder="e.g. 15000000" />
        </div>

        {/* Fee breakdown — shown to agents/sellers when they enter a price, unless the payment gateway is disabled */}
        {!isAdmin && settings && settings.payment_gateway_enabled && form.price && Number(form.price) > 0 && (() => {
          const listingFee = settings.listing_fee;
          const procFee    = parseFloat((listingFee * settings.processing_fee_pct / 100).toFixed(2));
          const total      = parseFloat((listingFee + procFee).toFixed(2));
          const net        = parseFloat((listingFee - procFee).toFixed(2));
          const lkr = (n: number) => `LKR ${n.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
          return (
            <div className="md:col-span-2 bg-blue-50 border border-blue-100 rounded-xl p-4">
              <p className="text-xs font-bold text-blue-800 flex items-center gap-1.5 mb-3">
                <Info size={13} /> Fee Breakdown
              </p>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-700">
                  <span>Listing Fee</span>
                  <span className="font-semibold">{lkr(listingFee)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Processing Fee ({settings.processing_fee_pct}%)</span>
                  <span>+ {lkr(procFee)}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 border-t border-blue-200 pt-1.5 text-sm">
                  <span>Total Fee</span>
                  <span>{lkr(total)}</span>
                </div>
              </div>
            </div>
          );
        })()}

        {form.listing_type === 'rent' && (
          <div className="md:col-span-2">
            <label className={lbl}>Price per month (LKR)</label>
            <input type="number" min={0} className={inp} value={form.price_per_week} onChange={(e) => set('price_per_week', e.target.value)} placeholder="e.g. 50000" />
          </div>
        )}

        <div>
          <label className={lbl}>Beds *</label>
          <input required type="number" min={0} max={20} className={inp} value={form.beds} onChange={(e) => set('beds', e.target.value)} />
        </div>

        <div>
          <label className={lbl}>Baths *</label>
          <input required type="number" min={0} max={20} className={inp} value={form.baths} onChange={(e) => set('baths', e.target.value)} />
        </div>

        <div>
          <label className={lbl}>Car Spaces *</label>
          <input required type="number" min={0} max={20} className={inp} value={form.cars} onChange={(e) => set('cars', e.target.value)} />
        </div>

        <div>
          <label className={lbl}>Land Size</label>
          <input className={inp} value={form.land_size} onChange={(e) => set('land_size', e.target.value)} placeholder="e.g. 500 sqft" />
        </div>

        <div>
          <label className={lbl}>Status</label>
          <select className={inp} value={form.status} onChange={(e) => set('status', e.target.value as FormState['status'])}>
            <option value="active">Active</option>
            <option value="inactive">Draft (Hidden)</option>
            <option value="sold">Sold</option>
          </select>
        </div>

        <div className="flex items-center gap-3 pt-5">
          <input type="checkbox" id="is_featured" checked={form.is_featured} onChange={(e) => set('is_featured', e.target.checked)} className="w-4 h-4 accent-[#16a34a]" />
          <label htmlFor="is_featured" className="text-sm font-medium text-gray-700">Feature on homepage</label>
        </div>

        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={lbl}>Agent Name <span className="text-gray-400 font-normal">(optional)</span></label>
            <input className={inp} value={form.agent_name} onChange={(e) => set('agent_name', e.target.value)} placeholder="e.g. John Silva" />
          </div>
          <div>
            <label className={lbl}>Agency Name <span className="text-gray-400 font-normal">(optional)</span></label>
            <input className={inp} value={form.agency_name} onChange={(e) => set('agency_name', e.target.value)} placeholder="e.g. Greenbrick Realty" />
          </div>
        </div>

        <div className="md:col-span-2">
          <label className={lbl}>Description *</label>
          <textarea required rows={5} className={inp} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Describe the property in detail..." />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-2">Photos</label>
        <div className="flex flex-wrap gap-2 mb-3">
          {currentImages.map((img) => (
            <div key={img.id} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
              <img src={img.url} alt="" className="w-full h-full object-cover" />
              <button type="button" onClick={() => removeExistingImage(img.id)}
                className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors">
                <X size={10} />
              </button>
              {img.is_primary && (
                <span className="absolute bottom-1 left-1 text-[9px] bg-[#16a34a] text-white px-1 rounded">Primary</span>
              )}
            </div>
          ))}
          {previews.map((src, i) => (
            <div key={`new-${i}`} className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-dashed border-gray-300">
              <img src={src} alt="" className="w-full h-full object-cover" />
              <button type="button" onClick={() => removeNewFile(i)}
                className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors">
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => fileRef.current?.click()}
          className="flex items-center gap-2 text-sm text-[#16a34a] border border-[#16a34a] border-dashed px-4 py-2 rounded-lg hover:bg-[#16a34a]/5 transition-colors">
          <Upload size={14} /> Add photos
        </button>
        <input ref={fileRef} type="file" multiple accept="image/jpeg,image/png,image/jpg,image/webp" className="hidden"
          onChange={(e) => handleFiles(e.target.files)} />
      </div>

      <button type="submit" disabled={submitting}
        className="w-full bg-[#16a34a] hover:bg-[#15803d] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
        {submitting && <Loader2 size={16} className="animate-spin" />}
        {mode === 'create' ? 'Create Listing' : 'Save Changes'}
      </button>

      {otpPhase === 'otp' && !isAdmin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              {settings?.payment_gateway_enabled === false ? 'Verify & Submit' : 'Verify & Pay'}
            </h2>
            <p className="text-sm text-gray-500 mb-1">
              A 6-digit code was sent to <span className="font-medium text-gray-700">{maskedEmail}</span>.
            </p>
            <p className="text-xs text-gray-400 mb-4">
              {settings?.payment_gateway_enabled === false
                ? 'After verification your listing will be submitted for admin review and published once approved.'
                : 'After verification you will be redirected to PayHere to pay a 10% listing fee.'}
            </p>
            {otpError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 mb-3">{otpError}</div>
            )}
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-center text-2xl font-bold tracking-widest outline-none focus:border-[#16a34a] mb-4"
              autoFocus
            />
            <button
              type="button"
              onClick={handleOtpSubmit}
              disabled={otpCode.length !== 6 || submitting}
              className="w-full bg-[#16a34a] hover:bg-[#15803d] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              {submitting
                ? (settings?.payment_gateway_enabled === false ? 'Submitting...' : 'Redirecting to payment...')
                : (settings?.payment_gateway_enabled === false ? 'Verify & Submit for Review' : 'Verify & Proceed to Payment')}
            </button>
            <button
              type="button"
              onClick={() => { setOtpPhase('form'); setOtpCode(''); setOtpError(null); }}
              className="w-full mt-2 text-sm text-gray-500 hover:text-gray-700 py-2 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
