"use client";

import { useEffect, useState } from "react";
import { request } from "@/lib/api";

type Preference = { opted_in: boolean; suppressed: boolean };
export default function MarketingPreference({ token }: { token: string }) {
  const [preference, setPreference] = useState<Preference | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    request<Preference>("/marketing-preferences", { token })
      .then((result) => {
        if (active) setPreference(result);
      })
      .catch(() => {
        if (active) setMessage("Unable to load email preferences.");
      });
    return () => {
      active = false;
    };
  }, [token, retry]);
  async function change() {
    if (!preference || busy) return;
    setBusy(true);
    setMessage("");
    try {
      const result = await request<Preference>("/marketing-preferences", {
        token,
        method: "PUT",
        body: { opted_in: !preference.opted_in },
      });
      setPreference(result);
      setMessage(
        result.suppressed
          ? "This address is suppressed. Please contact support."
          : "Email preference saved.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to save preference.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="bg-white rounded-2xl border border-gray-100 p-6 mb-5">
      <h2 className="font-bold text-gray-900 mb-2">
        Marketing email preferences
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        Choose whether to receive property updates, offers and company news.
        Account and security messages are unaffected. You can unsubscribe at any
        time.
      </p>
      <button
        type="button"
        disabled={!preference || busy || preference.suppressed}
        onClick={change}
        className="rounded-lg bg-green-600 text-white px-4 py-2 text-sm font-semibold disabled:opacity-50"
      >
        {busy
          ? "Saving..."
          : !preference
            ? "Loading..."
            : preference.opted_in
              ? "Unsubscribe from marketing"
              : "Opt in to marketing emails"}
      </button>
      {message && (
        <p role="status" className="text-sm mt-3">
          {message}{" "}
          {!preference && (
            <button
              type="button"
              className="underline"
              onClick={() => {
                setMessage("");
                setRetry((value) => value + 1);
              }}
            >
              Retry
            </button>
          )}
        </p>
      )}
    </section>
  );
}
