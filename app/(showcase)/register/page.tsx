"use client";

import logger from "@/lib/logger";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ALLOWED_DOMAINS = ["gmail.com", "mlrit.ac.in"];

  const isValidEmailDomain = (value: string) => {
    const domain = value.trim().toLowerCase().split("@")[1] ?? "";
    return ALLOWED_DOMAINS.includes(domain);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidEmailDomain(email)) {
      setError("Only @gmail.com or @mlrit.ac.in email addresses are allowed.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          full_name: fullName.trim(),
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Registration failed");
        setIsLoading(false);
        return;
      }

      // Registration successful — auto-login
      const signInRes = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (signInRes?.error) {
        setError("Account created but auto-login failed. Please sign in.");
        setIsLoading(false);
        return;
      }

      // Success — redirect to home
      window.location.replace("/home");
    } catch (err) {
      logger.error("[RegisterPage] exception:", err);
      setError("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  return (
    <main className="grid min-h-svh md:grid-cols-2">
      {/* ── Left panel — purple background, white text ── */}
      <div
        className="relative min-h-80"
        style={{ background: "var(--clr-purple)", color: "var(--clr-white)" }}
      >
        <div className="page-gutter absolute bottom-12">
          <p className="meta" style={{ color: "var(--clr-orange)" }}>
            Your campus pass
          </p>
          <h1 className="mt-4 text-5xl font-semibold md:text-7xl" style={{ color: "var(--clr-white)" }}>
            Step into
            <br />
            what&apos;s next.
          </h1>
        </div>
      </div>

      {/* ── Right panel — off-white background, dark text ── */}
      <div className="flex items-center justify-center p-6 md:p-14" style={{ background: "var(--clr-white)" }}>
        <div className="w-full max-w-md">
          <p className="meta" style={{ color: "var(--clr-purple)" }}>
            EMS.MLRIT account
          </p>
          <h2 className="mt-4 text-4xl font-semibold" style={{ color: "var(--clr-black)" }}>
            Join the community.
          </h2>

          {error && (
            <p className="mt-6 text-sm" style={{ color: "#dc2626" }}>
              {error}
            </p>
          )}

          <form onSubmit={handleRegister} className="mt-8 space-y-5">
            <label className="block">
              <span className="meta" style={{ color: "var(--clr-black)" }}>
                Full name
              </span>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                type="text"
                required
                placeholder="John Doe"
                className="mt-2 h-12 w-full border border-input bg-transparent px-4 outline-none focus:border-primary"
                style={{ color: "var(--clr-black)" }}
              />
            </label>
            <label className="block">
              <span className="meta" style={{ color: "var(--clr-black)" }}>
                Email
              </span>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                placeholder="you@gmail.com"
                className="mt-2 h-12 w-full border border-input bg-transparent px-4 outline-none focus:border-primary"
                style={{ color: "var(--clr-black)" }}
              />
            </label>
            <label className="block">
              <span className="meta" style={{ color: "var(--clr-black)" }}>
                Password
              </span>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
                minLength={8}
                className="mt-2 h-12 w-full border border-input bg-transparent px-4 outline-none focus:border-primary"
                style={{ color: "var(--clr-black)" }}
              />
            </label>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex h-12 w-full items-center justify-center font-display text-sm font-bold uppercase tracking-wide transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50"
              style={{ background: "var(--clr-purple)", color: "var(--clr-white)" }}
            >
              {isLoading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="mt-7 text-sm" style={{ color: "rgba(33,37,41,0.6)" }}>
            Only @gmail.com or @mlrit.ac.in email addresses are accepted.
          </p>

          <button
            type="button"
            onClick={() => router.push("/")}
            className="mt-7 font-display text-sm font-semibold underline underline-offset-4"
            style={{ color: "var(--clr-black)" }}
          >
            Already registered? Sign in
          </button>
        </div>
      </div>
    </main>
  );
}
