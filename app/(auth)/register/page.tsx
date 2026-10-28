"use client";

import logger from "@/lib/logger";
import React, { Suspense, useId, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";
import { supabase } from "@/lib/supabase/browserClient";
import {
  ROLE_HOME,
  toUserRole,
  useUserRole,
} from "@/components/discover/useUserRole";
import { AlertCircle, ArrowUpRight, CheckCircle2, Loader2 } from "lucide-react";

const ALLOWED_DOMAINS = ["gmail.com", "mlrit.ac.in"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;

type Mode = "signin" | "signup";
type Field = "fullName" | "email" | "password";
type Status = "idle" | "submitting" | "success";

const isValidEmailDomain = (value: string) => {
  const domain = value.trim().toLowerCase().split("@")[1] ?? "";
  return ALLOWED_DOMAINS.includes(domain);
};

/**
 * Where to go after signing in. Only same-site paths are honoured, so a
 * crafted ?callbackUrl= can't bounce people to another site.
 */
function safeCallback(raw: string | null) {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/discover";
  if (raw.startsWith("/register")) return "/discover";
  return raw;
}

function validate(
  mode: Mode,
  values: { fullName: string; email: string; password: string }
) {
  const errors: Partial<Record<Field, string>> = {};
  const email = values.email.trim();
  if (mode === "signup" && !values.fullName.trim())
    errors.fullName = "Enter your full name.";
  if (!email) errors.email = "Enter your email address.";
  else if (!EMAIL_RE.test(email))
    errors.email = "Enter a valid email, like you@mlrit.ac.in.";
  else if (mode === "signup" && !isValidEmailDomain(email))
    errors.email = "Use an @mlrit.ac.in or @gmail.com address.";
  if (!values.password) errors.password = "Enter your password.";
  else if (mode === "signup" && values.password.length < MIN_PASSWORD)
    errors.password = `Use at least ${MIN_PASSWORD} characters.`;
  return errors;
}

function SignInView() {
  const params = useSearchParams();
  // An explicit ?callbackUrl= wins; otherwise each role goes to its home.
  const hasCallback = params.has("callbackUrl");
  const callbackUrl = safeCallback(params.get("callbackUrl"));
  const { data: session, status: sessionStatus } = useSession();
  const signedInRole = useUserRole(
    sessionStatus === "authenticated" ? session?.user?.email : null
  );
  const continueHref = hasCallback
    ? callbackUrl
    : ROLE_HOME[signedInRole ?? "student"];
  // ?mode=signup opens on "Create account" (e.g. from the landing page).
  const [mode, setMode] = useState<Mode>(
    params.get("mode") === "signup" ? "signup" : "signin"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<Field, string>>
  >({});
  const ids = useId();
  const busy = status !== "idle";

  const credentialsSignIn = () =>
    signIn("credentials", {
      email: email.trim().toLowerCase(),
      password,
      redirect: false,
    });

  const finish = async () => {
    setStatus("success");
    let target = callbackUrl;
    if (!hasCallback) {
      // Same role lookup the app uses elsewhere; a failure means the
      // default home, and the role pages redirect on from there.
      const { data } = await supabase
        .from("users")
        .select("role")
        .eq("email", email.trim().toLowerCase())
        .maybeSingle();
      target = ROLE_HOME[toUserRole(data?.role)];
    }
    // Full reload so the session is picked up everywhere.
    window.location.replace(target);
  };

  const handleSignIn = async () => {
    const res = await credentialsSignIn();
    if (res?.error) {
      setError(
        res.error === "CredentialsSignin"
          ? "That email and password don't match an account."
          : `Sign in error: ${res.error}`
      );
      setStatus("idle");
      return;
    }
    await finish();
  };

  const handleRegister = async () => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        password,
        full_name: fullName.trim(),
      }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      // Server faults aren't the user's to fix; don't show raw DB messages.
      setError(
        res.status >= 500
          ? "We couldn't create your account right now. Please try again later."
          : json.error || "Registration failed. Please try again."
      );
      setStatus("idle");
      return;
    }

    // Registration successful — auto-login
    const signInRes = await credentialsSignIn();
    if (signInRes?.error) {
      setError("Account created, but signing in failed. Please sign in.");
      setMode("signin");
      setStatus("idle");
      return;
    }
    await finish();
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const errors = validate(mode, { fullName, email, password });
    setFieldErrors(errors);
    setError(null);
    if (Object.keys(errors).length) {
      // Move focus to the first field that needs fixing.
      const first = (["fullName", "email", "password"] as Field[]).find(
        (f) => errors[f]
      );
      document.getElementById(`${ids}-${first}`)?.focus();
      return;
    }
    setStatus("submitting");
    try {
      await (mode === "signin" ? handleSignIn() : handleRegister());
    } catch (err) {
      logger.error("[RegisterPage] exception:", err);
      setError("Something went wrong. Please try again.");
      setStatus("idle");
    }
  };

  const switchMode = (m: Mode) => {
    if (busy) return;
    setMode(m);
    setError(null);
    setFieldErrors({});
  };

  const field = (
    name: Field,
    label: string,
    input: React.InputHTMLAttributes<HTMLInputElement>
  ) => {
    const id = `${ids}-${name}`;
    const err = fieldErrors[name];
    return (
      <div>
        <label htmlFor={id} className="block text-ui font-medium text-zinc-300">
          {label}
        </label>
        <input
          id={id}
          {...input}
          disabled={busy}
          aria-invalid={!!err}
          aria-describedby={err ? `${id}-error` : undefined}
          onInput={() =>
            err && setFieldErrors((prev) => ({ ...prev, [name]: undefined }))
          }
          className={`dz-input mt-1.5 h-11 w-full px-3 disabled:opacity-60 ${
            err ? "!border-[var(--danger)]" : ""
          }`}
        />
        {err && (
          <p
            id={`${id}-error`}
            className="mt-1.5 flex items-center gap-1.5 text-xs text-[var(--danger)]"
          >
            <AlertCircle className="size-3.5 shrink-0" aria-hidden />
            {err}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="grid items-stretch gap-6 md:grid-cols-2">
      {/* Image side */}
      <section className="dz-media relative flex min-h-[520px] flex-col justify-end rounded-2xl border border-[var(--dz-border)] p-8 max-md:min-h-[300px] max-md:p-6">
        {/* Replaceable local asset: public/events/welcome-gate.jpg */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/events/welcome-gate.jpg" alt="" />
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,11,13,0.1)_0%,rgba(11,11,13,0.35)_45%,rgba(11,11,13,0.92)_100%)] max-md:bg-[linear-gradient(180deg,rgba(11,11,13,0.45)_0%,rgba(11,11,13,0.75)_40%,rgba(11,11,13,0.95)_100%)]"
        />
        <div className="relative max-w-[380px]">
          <p className="flex items-center gap-2 text-ui font-medium text-zinc-200">
            <span
              aria-hidden
              className="size-1.5 rounded-full bg-[var(--dz-accent)]"
            />
            Your campus pass
          </p>
          <h1 className="mt-3 text-[32px] font-semibold leading-tight tracking-[-0.02em] sm:text-[36px]">
            Step into
            <br />
            what&apos;s next.
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-zinc-300">
            One account for every club at MLRIT. Register for events in a tap
            and keep your semester in one calendar.
          </p>
        </div>
      </section>

      {/* Form side */}
      <section className="dz-panel flex items-center justify-center p-8 shadow-[0_24px_48px_-32px_rgba(0,0,0,0.8)] max-md:p-6">
        <div className="w-full max-w-[380px]">
          <p className="text-ui font-medium text-zinc-400">EMS.MLRIT account</p>

          {sessionStatus === "authenticated" ? (
            /* Already signed in: no form, just the way onward. */
            <div className="mt-2">
              <h2 className="text-2xl font-semibold">You&apos;re signed in</h2>
              <p className="mt-2 text-sm text-zinc-400">
                Signed in as{" "}
                <span className="font-medium text-zinc-200">
                  {session?.user?.email}
                </span>
                .
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <Link href={continueHref} className="dz-btn dz-btn--primary">
                  Continue
                  <ArrowUpRight className="size-4" aria-hidden />
                </Link>
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/register" })}
                  className="dz-btn dz-btn--ghost"
                >
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <>
              <h2 className="mt-2 text-2xl font-semibold">
                {mode === "signin" ? "Welcome back" : "Join the community"}
              </h2>

              <div
                role="tablist"
                aria-label="Account action"
                className="mt-6 flex rounded-lg border border-[var(--dz-border)] bg-[var(--dz-surface-2)] p-1 text-sm"
              >
                {(["signin", "signup"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    role="tab"
                    id={`${ids}-tab-${m}`}
                    aria-selected={mode === m}
                    aria-controls={`${ids}-form`}
                    disabled={busy && mode !== m}
                    onClick={() => switchMode(m)}
                    className={`h-9 flex-1 rounded-md transition-colors ${
                      mode === m
                        ? "bg-white/10 font-medium text-white"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    {m === "signin" ? "Sign in" : "Create account"}
                  </button>
                ))}
              </div>

              {error && (
                <p
                  role="alert"
                  className="mt-4 flex items-start gap-2 rounded-lg border border-[rgba(248,113,113,0.25)] bg-[var(--destructive-soft)] px-3 py-2.5 text-ui text-[var(--danger)]"
                >
                  <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
                  {error}
                </p>
              )}
              {status === "success" && (
                <p
                  role="status"
                  className="mt-4 flex items-center gap-2 rounded-lg border border-[rgba(74,222,128,0.25)] bg-[var(--success-soft)] px-3 py-2.5 text-ui text-[var(--success)]"
                >
                  <CheckCircle2 className="size-4 shrink-0" aria-hidden />
                  {mode === "signin"
                    ? "Signed in. Taking you there…"
                    : "Account created. Taking you there…"}
                </p>
              )}

              <form
                id={`${ids}-form`}
                role="tabpanel"
                aria-labelledby={`${ids}-tab-${mode}`}
                onSubmit={onSubmit}
                noValidate
                aria-busy={busy}
                className="mt-6 space-y-4"
              >
                {mode === "signup" &&
                  field("fullName", "Full name", {
                    value: fullName,
                    onChange: (e) => setFullName(e.target.value),
                    type: "text",
                    placeholder: "Your name",
                    autoComplete: "name",
                  })}
                {field("email", "Email", {
                  value: email,
                  onChange: (e) => setEmail(e.target.value),
                  type: "email",
                  inputMode: "email",
                  placeholder: "you@mlrit.ac.in",
                  autoComplete: "email",
                })}
                {field("password", "Password", {
                  value: password,
                  onChange: (e) => setPassword(e.target.value),
                  type: "password",
                  placeholder: "••••••••",
                  autoComplete:
                    mode === "signin" ? "current-password" : "new-password",
                })}
                <button
                  type="submit"
                  disabled={busy}
                  className="dz-btn dz-btn--primary h-11 w-full"
                >
                  {status === "submitting" ? (
                    <>
                      <Loader2 className="size-4 animate-spin" aria-hidden />
                      {mode === "signin" ? "Signing in…" : "Creating account…"}
                    </>
                  ) : (
                    <>
                      {mode === "signin" ? "Sign in" : "Create account"}
                      <ArrowUpRight className="size-4" aria-hidden />
                    </>
                  )}
                </button>
              </form>

              <p className="mt-4 text-xs text-faint">
                {mode === "signup"
                  ? `Only @mlrit.ac.in or @gmail.com addresses. Passwords need ${MIN_PASSWORD}+ characters.`
                  : "New here? Choose Create account above."}
              </p>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

export default function RegisterPage() {
  // useSearchParams needs a Suspense boundary for static rendering.
  return (
    <Suspense>
      <SignInView />
    </Suspense>
  );
}
