"use client";
import logger from "@/lib/logger";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { CheckCircle2 } from "lucide-react";
import { ErrorState } from "@/components/discover/LoadStates";

type ProfileState = {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  avatar_url?: string | null;
};

const EMPTY: ProfileState = {
  first_name: "",
  last_name: "",
  email: "",
  phone_number: "",
  avatar_url: null,
};

function Field({
  id,
  label,
  hint,
  ...input
}: React.InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-ui font-medium text-zinc-300">
        {label}
      </label>
      <input
        id={id}
        {...input}
        className="dz-input h-10 px-3 read-only:cursor-not-allowed read-only:text-zinc-400"
      />
      {hint && <p className="text-xs text-faint">{hint}</p>}
    </div>
  );
}

/** Profile details form backed by GET/PATCH /api/me. */
export function UserProfile() {
  const { data: session } = useSession();
  const [status, setStatus] = useState<"loading" | "error" | "ready">(
    "loading"
  );
  const [attempt, setAttempt] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<"saved" | "failed" | null>(null);
  const [profileData, setProfileData] = useState<ProfileState>(EMPTY);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/me", { cache: "no-store" });
        if (!res.ok) {
          logger.error(
            "[UserProfile] GET /api/me failed",
            await res.json().catch(() => res.status)
          );
          if (mounted) setStatus("error");
          return;
        }
        const { user } = await res.json();
        if (!mounted) return;
        if (user) {
          setProfileData({
            first_name: user.first_name ?? "",
            last_name: user.last_name ?? "",
            email: user.email ?? "",
            phone_number: user.phone_number ?? "",
            avatar_url: user.avatar_url ?? null,
          });
        }
        setStatus("ready");
      } catch (e) {
        logger.error("[UserProfile] load error:", e);
        if (mounted) setStatus("error");
      }
    })();
    return () => {
      mounted = false;
    };
  }, [attempt]);

  const retry = useCallback(() => {
    setStatus("loading");
    setAttempt((n) => n + 1);
  }, []);

  const handleInputChange = (field: keyof ProfileState, value: string) => {
    setSaveResult(null);
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveResult(null);
    try {
      setSaving(true);
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          phone_number: profileData.phone_number,
        }),
      });
      if (!res.ok) {
        logger.error(
          "[UserProfile] PATCH /api/me failed",
          await res.json().catch(() => res.status)
        );
        setSaveResult("failed");
        return;
      }
      setSaveResult("saved");
    } catch (e) {
      logger.error("[UserProfile] update error:", e);
      setSaveResult("failed");
    } finally {
      setSaving(false);
    }
  };

  if (status === "error") {
    return (
      <ErrorState
        title="Your profile didn't load"
        message="We couldn't fetch your account details. Please try again."
        onRetry={retry}
      />
    );
  }

  const loading = status === "loading";
  const fullName = `${profileData.first_name} ${profileData.last_name}`.trim();
  const displayName = fullName || session?.user?.name || "Student";
  const avatar = profileData.avatar_url || session?.user?.image;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
      <section
        aria-label="Account summary"
        className="dz-panel flex flex-col items-center gap-4 p-6 text-center lg:self-start"
      >
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatar}
            alt=""
            className="size-24 rounded-full object-cover ring-1 ring-[var(--dz-border)]"
          />
        ) : (
          <span className="grid size-24 place-items-center rounded-full bg-[var(--dz-accent)] text-3xl font-semibold text-[#1a0d06]">
            {displayName[0]?.toUpperCase()}
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold">
            {loading ? "Loading…" : displayName}
          </p>
          <p className="truncate text-ui text-zinc-400">
            {profileData.email || session?.user?.email}
          </p>
        </div>
        <span className="dz-chip">Student</span>
      </section>

      <form
        onSubmit={handleUpdate}
        className="dz-panel flex flex-col gap-5 p-6"
      >
        <h2 className="text-lg font-semibold">Profile details</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            id="firstname"
            label="First name"
            value={profileData.first_name}
            onChange={(e) => handleInputChange("first_name", e.target.value)}
            placeholder={loading ? "Loading…" : "Enter first name"}
            disabled={loading}
            autoComplete="given-name"
          />
          <Field
            id="lastname"
            label="Last name"
            value={profileData.last_name}
            onChange={(e) => handleInputChange("last_name", e.target.value)}
            placeholder={loading ? "Loading…" : "Enter last name"}
            disabled={loading}
            autoComplete="family-name"
          />
          <Field
            id="email"
            label="Email"
            value={profileData.email}
            readOnly
            hint="Your sign-in email can't be changed here."
          />
          <Field
            id="phone"
            type="tel"
            label="Phone number"
            value={profileData.phone_number}
            onChange={(e) => handleInputChange("phone_number", e.target.value)}
            placeholder={loading ? "Loading…" : "Enter phone number"}
            disabled={loading}
            autoComplete="tel"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-[var(--dz-border)] pt-5">
          <button
            type="submit"
            disabled={saving || loading}
            className="dz-btn dz-btn--accent"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
          <p aria-live="polite" className="text-ui">
            {saveResult === "saved" && (
              <span className="flex items-center gap-1.5 text-[var(--success)]">
                <CheckCircle2 className="size-4" aria-hidden />
                Profile saved
              </span>
            )}
            {saveResult === "failed" && (
              <span className="text-[var(--danger)]">
                Couldn&apos;t save your changes. Please try again.
              </span>
            )}
          </p>
        </div>
      </form>
    </div>
  );
}
