"use client";

import { useState, useEffect, useId } from "react";
import { ChevronDown } from "lucide-react";
import { SL_PROVINCES, SL_DISTRICTS, SL_CITIES } from "@/lib/srilanka";
import { properties as propertiesApi } from "@/lib/api";

interface Props {
  province: string;
  district: string;
  city: string;
  postcode: string;
  onProvinceChange: (v: string) => void;
  onDistrictChange: (v: string) => void;
  onCityChange: (v: string) => void;
  onPostcodeChange: (v: string) => void;
}

const inp = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/10 transition-all bg-white";
const lbl = "block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2";

export default function SriLankaAddressFields({
  province, district, city, postcode,
  onProvinceChange, onDistrictChange, onCityChange, onPostcodeChange,
}: Props) {
  const uid = useId();
  const [dbCities, setDbCities] = useState<string[]>([]);

  // When province changes, reset district if it no longer belongs to that province
  useEffect(() => {
    if (province) {
      const provinceDistricts = SL_DISTRICTS[province as keyof typeof SL_DISTRICTS] ?? [];
      if (district && !provinceDistricts.includes(district)) {
        onDistrictChange('');
      }
    }
  }, [province]);

  // Fetch cities already in the DB for the selected province
  useEffect(() => {
    if (!province) { setDbCities([]); return; }
    propertiesApi.list({ state: province, per_page: 200 } as any)
      .then(res => {
        const unique = [...new Set(
          res.data.map((p: any) => p.suburb).filter((s: string) => s && s.trim())
        )] as string[];
        setDbCities(unique.sort());
      })
      .catch(() => setDbCities([]));
  }, [province]);

  const availableDistricts = province
    ? (SL_DISTRICTS[province as keyof typeof SL_DISTRICTS] ?? [])
    : [];

  const staticCities = district ? (SL_CITIES[district] ?? []) : [];
  const allCities = [...new Set([...staticCities, ...dbCities])].sort();

  const datalistId = `${uid}-cities`;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">

      {/* Province */}
      <div className="lg:col-span-2">
        <label className={lbl}>Province</label>
        <div className="relative">
          <select
            value={province}
            onChange={(e) => { onProvinceChange(e.target.value); onDistrictChange(''); onCityChange(''); }}
            className={inp + " appearance-none pr-9 cursor-pointer"}
          >
            <option value="">Select province</option>
            {SL_PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* District */}
      <div className="lg:col-span-2">
        <label className={lbl}>District</label>
        <div className="relative">
          <select
            value={district}
            onChange={(e) => { onDistrictChange(e.target.value); onCityChange(''); }}
            disabled={!province}
            className={inp + " appearance-none pr-9 cursor-pointer disabled:bg-gray-50 disabled:text-gray-400"}
          >
            <option value="">Select district</option>
            {availableDistricts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* City / Town */}
      <div className="lg:col-span-3">
        <label className={lbl}>City / Town</label>
        <input
          list={datalistId}
          value={city}
          onChange={(e) => onCityChange(e.target.value)}
          placeholder={district ? `Type or select a city in ${district}` : 'Select a district first'}
          className={inp}
          autoComplete="off"
        />
        <datalist id={datalistId}>
          {allCities.map(c => <option key={c} value={c} />)}
        </datalist>
      </div>

      {/* Postcode */}
      <div>
        <label className={lbl}>Postcode</label>
        <input
          value={postcode}
          onChange={(e) => onPostcodeChange(e.target.value)}
          placeholder="e.g. 10100"
          maxLength={10}
          className={inp}
        />
      </div>

    </div>
  );
}
