"use client";
import logger from "@/lib/logger";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function Partner() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleConvert = async () => {
    const ok = window.confirm(
      "By continuing, your account will be converted to an organizer (club) account. This action cannot be undone. Continue?"
    );
    if (!ok) return;

    try {
      setLoading(true);
      const res = await fetch("/api/partner/convert", { method: "PATCH" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        alert(j?.error || "Failed to convert account.");
        return;
      }
      // success → go to /club
      router.replace("/club");
    } catch (e) {
      logger.error("Failed to convert account:", e);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-xl text-center space-y-6">
        <h1 className="text-2xl sm:text-3xl font-semibold">
          Partner with us and host events
        </h1>

        <p className="text-sm sm:text-base text-neutral-500 dark:text-neutral-400">
          By continuing, you choose to convert this account into an organizer
          account and cannot go back.
        </p>

        <button
          onClick={handleConvert}
          disabled={loading}
          className="inline-flex items-center justify-center rounded-md px-5 py-2.5 text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
        >
          {loading ? "Converting…" : "Convert to Organizer"}
        </button>
      </div>
    </main>
  );
}
