"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth } from "@/lib/api";

export default function AuthCallbackPage() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const token = params.get("token");
    const error = params.get("error");

    if (error || !token) {
      router.replace("/signin?error=google_failed");
      return;
    }

    auth.me(token).then((user) => {
      localStorage.setItem("auth_token", token);
      // Dispatch a storage event so AuthProvider picks it up across tabs
      window.dispatchEvent(new StorageEvent("storage", { key: "auth_token", newValue: token }));
      router.replace("/");
    }).catch(() => {
      router.replace("/signin?error=google_failed");
    });
  }, [params, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <svg className="animate-spin w-8 h-8 text-[#121e80] mx-auto mb-3" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeDashoffset="12" />
        </svg>
        <p className="text-sm text-gray-500">Signing you in&hellip;</p>
      </div>
    </div>
  );
}
