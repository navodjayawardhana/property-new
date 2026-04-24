"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { profile, type User } from "@/lib/api";

async function detectCountryFromIp(): Promise<{ name: string; code: string } | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const res = await fetch("https://ipapi.co/json/", { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = await res.json();
    return data.country_name && data.country_code
      ? { name: data.country_name, code: data.country_code as string }
      : null;
  } catch {
    return null;
  }
}

function toGbCountry(isoCode: string): string {
  if (isoCode === "AU") return "AU";
  if (isoCode === "LK") return "LK";
  if (isoCode === "AE") return "UAE";
  return "LK";
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { loginWithToken, updateUser } = useAuth();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const token = params.get("token");
    const error = params.get("error");

    if (error || !token) {
      router.replace("/signin?error=google_failed");
      return;
    }

    (async () => {
      try {
        const ipCountry = await detectCountryFromIp();

        await loginWithToken(token);

        if (ipCountry) {
          localStorage.setItem("gb_country", toGbCountry(ipCountry.code));
          const updated: User | null = await profile.update({ country: ipCountry.name }, token).catch(() => null);
          if (updated) updateUser(updated);
        }

        router.replace("/");
      } catch {
        router.replace("/signin?error=google_failed");
      }
    })();
  }, [params, router, loginWithToken]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <svg className="animate-spin w-8 h-8 text-[#16a34a] mx-auto mb-3" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeDashoffset="12" />
        </svg>
        <p className="text-sm text-gray-500">Signing you in&hellip;</p>
      </div>
    </div>
  );
}
