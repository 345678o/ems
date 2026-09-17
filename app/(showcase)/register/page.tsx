"use client";
import logger from "@/lib/logger";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { ScribbleArrow } from "@/components/ui/scribble";

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
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-3xl">
        <div className="grid overflow-hidden rounded-[28px] bg-card shadow-2xl md:grid-cols-2">
          {/* Left Side — photo panel, hidden on small screens */}
          <div className="relative hidden md:block">
            <Image
              src="/events/welcome-gate.jpg"
              alt=""
              fill
              sizes="400px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-ink/35" />
            <div className="absolute top-6 left-6 flex items-center gap-3">
              <Image
                src="/logos/mlrit.svg"
                alt="MLRIT Logo"
                width={80}
                height={40}
                className="h-8 w-auto object-contain brightness-0 invert"
              />
            </div>
            <p className="font-marker absolute bottom-6 left-6 right-6 flex items-center gap-2 text-3xl leading-none text-white">
              Good + things ahead
              <ScribbleArrow className="h-6 w-10 text-hotpink" />
            </p>
          </div>

          {/* Right Side — Register Form */}
          <div className="paper-grain flex flex-col justify-center p-8 sm:p-10">
            <div className="w-full">
              <h1 className="font-display text-2xl text-ink sm:text-3xl">
                Join EMS
              </h1>
              <p className="mt-1 mb-6 text-sm text-muted-foreground">
                Create your account to start registering for events.
              </p>

              {error && (
                <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-center text-xs text-destructive">
                  {error}
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-ink/70">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full rounded-xl border border-border bg-secondary px-4 py-2.5 text-sm text-ink transition-all placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-hotpink"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-ink/70">
                    Email address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full rounded-xl border border-border bg-secondary px-4 py-2.5 text-sm text-ink transition-all placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-hotpink"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-ink/70">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-border bg-secondary px-4 py-2.5 text-sm text-ink transition-all placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-hotpink"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Min. 8 characters
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-full bg-primary py-3 px-6 text-sm font-semibold text-primary-foreground shadow-md transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {isLoading ? "Creating account..." : "Sign Up"}
                </button>
              </form>

              <p className="mt-4 text-center text-xs text-muted-foreground">
                Already have an account?{" "}
                <button
                  onClick={() => router.push("/")}
                  className="font-semibold text-hotpink hover:underline"
                >
                  Sign In
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
