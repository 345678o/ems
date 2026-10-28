"use client";
import logger from "@/lib/logger";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CalendarPlus, Handshake, Users } from "lucide-react";

export default function Partner() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConvert = async () => {
    const ok = window.confirm(
      "By continuing, your account will be converted to an organizer (club) account. This action cannot be undone. Continue?"
    );
    if (!ok) return;

    try {
      setError(null);
      setLoading(true);
      const res = await fetch("/api/partner/convert", { method: "PATCH" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j?.error || "Failed to convert account.");
        return;
      }
      // success → go to /club
      router.replace("/club");
    } catch (e) {
      logger.error("Failed to convert account:", e);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="dz-panel max-w-2xl p-6 sm:p-8">
      <span className="grid size-12 place-items-center rounded-xl bg-[rgba(255,117,71,0.12)] text-[var(--dz-accent)] ring-1 ring-[rgba(255,117,71,0.25)]">
        <Handshake className="size-6" aria-hidden />
      </span>
      <h2 className="mt-4 text-xl font-semibold">
        Partner with us and host events
      </h2>
      <ul className="mt-4 flex flex-col gap-2.5 text-sm text-zinc-300">
        <li className="flex items-center gap-2.5">
          <CalendarPlus className="size-4 text-faint" aria-hidden />
          Create and publish events for your club
        </li>
        <li className="flex items-center gap-2.5">
          <Users className="size-4 text-faint" aria-hidden />
          Manage participants, tickets and reports
        </li>
      </ul>

      <div className="mt-6 flex items-start gap-3 rounded-lg border border-[rgba(251,191,36,0.25)] bg-[var(--warning-soft)] p-3 text-ui text-[var(--warning)]">
        <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
        <p>
          This converts your account into an organizer account. You can&apos;t
          switch back to a student account afterwards.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleConvert}
          disabled={loading}
          className="dz-btn dz-btn--accent"
        >
          {loading ? "Converting…" : "Convert to Organizer"}
        </button>
        {error && (
          <p role="alert" className="text-ui text-[var(--danger)]">
            {error}
          </p>
        )}
      </div>
    </section>
  );
}
