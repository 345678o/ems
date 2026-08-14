"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

interface LoginDialogProps {
  children?: React.ReactNode;
  triggerClassName?: string;
}

export function LoginDialog({ children, triggerClassName }: LoginDialogProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/home",
      });
      if (res?.error) {
        console.error("[LoginDialog] signIn error:", res.error);
        setError(
          res.error === "CredentialsSignin"
            ? "Invalid email or password."
            : `Sign in error: ${res.error}`
        );
      } else if (res?.ok) {
        // Force a full page reload so Next.js session is refreshed everywhere
        window.location.replace("/home");
      }
    } catch (err) {
      console.error("[LoginDialog] exception:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild className={triggerClassName}>
        {children}
      </DialogTrigger>
      <DialogContent
        className="max-w-3xl w-full p-0 overflow-hidden border-0 bg-transparent shadow-none"
        showCloseButton={false}
      >
        <div className="flex items-center rounded-3xl overflow-hidden dark:bg-[#141414] bg-white shadow-2xl relative">
          {/* Violet gradient overlay from bottom-right to top-left */}
          <div className="absolute inset-0 bg-gradient-to-tl dark:from-violet-600/20 from-pink-100 via-transparent to-transparent pointer-events-none" />

          {/* Left Side - Logos stacked vertically */}
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
            className="h-96 dark:bg-white/10 white-90"
          />

          {/* Right Side - Sign In */}
          <div className="flex-1 p-10 flex flex-col justify-center items-center relative z-10">
            <div className="w-full max-w-sm">
              <DialogTitle className="font-figtree text-2xl font-bold text-center mb-6">
                Welcome Back
              </DialogTitle>

              {error && (
                <div className="mb-4 p-3 rounded-lg text-xs text-red-500 bg-red-500/10 border border-red-500/20 text-center">
                  {error}
                </div>
              )}

              <form onSubmit={handleCredentialsSignIn} className="space-y-4">
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-xl border dark:border-white/10 border-black/10 dark:bg-white/5 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-[#FF8AC9] via-[#D96CE5] to-[#7B2FE5] text-white font-medium text-sm hover:opacity-95 transition-opacity disabled:opacity-50 shadow-md cursor-pointer"
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </button>
              </form>

              <p className="text-center text-xs opacity-60 mt-4">
                Don&apos;t have an account?{" "}
                <a href="/register" className="text-purple-500 hover:underline">
                  Sign Up
                </a>
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
