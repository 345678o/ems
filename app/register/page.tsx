"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Separator } from "@/components/ui/separator";

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
      console.error("[RegisterPage] exception:", err);
      setError("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-800 from-gray-50 via-white to-gray-100">
      <div className="max-w-3xl w-full">
        <div className="flex items-center rounded-3xl overflow-hidden dark:bg-[#141414] bg-white shadow-2xl relative">
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-tl dark:from-violet-600/20 from-pink-100 via-transparent to-transparent pointer-events-none" />

          {/* Left Side — Logos */}
          <div className="flex-1 p-12 flex flex-col justify-center items-center gap-8 relative z-10">
            <img
              src="/logos/mlrit.svg"
              alt="MLRIT Logo"
              className="h-20 w-auto object-contain"
            />
            <img
              src="/logos/iic.svg"
              alt="Institution's Innovation Council Logo"
              className="h-24 w-auto object-contain"
            />
          </div>

          {/* Vertical Separator */}
          <Separator
            orientation="vertical"
            className="h-96 dark:bg-white/10 bg-black/10"
          />

          {/* Right Side — Register Form */}
          <div className="flex-1 p-10 flex flex-col justify-center items-center relative z-10">
            <div className="w-full max-w-sm">
              <h1 className="font-figtree text-2xl font-bold text-center mb-6">
                Create Account
              </h1>

              {error && (
                <div className="mb-4 p-3 rounded-lg text-xs text-red-500 bg-red-500/10 border border-red-500/20 text-center">
                  {error}
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium mb-1 opacity-80">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-4 py-2.5 rounded-xl border dark:border-white/10 border-black/10 dark:bg-white/5 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1 opacity-80">
                    Email address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full px-4 py-2.5 rounded-xl border dark:border-white/10 border-black/10 dark:bg-white/5 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1 opacity-80">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-xl border dark:border-white/10 border-black/10 dark:bg-white/5 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  />
                  <p className="text-xs opacity-60 mt-1">Min. 8 characters</p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-[#FF8AC9] via-[#D96CE5] to-[#7B2FE5] text-white font-medium text-sm hover:opacity-95 transition-opacity disabled:opacity-50 shadow-md"
                >
                  {isLoading ? "Creating account..." : "Sign Up"}
                </button>
              </form>

              <p className="text-center text-xs opacity-60 mt-4">
                Already have an account?{" "}
                <button
                  onClick={() => router.push("/")}
                  className="text-purple-500 hover:underline"
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
