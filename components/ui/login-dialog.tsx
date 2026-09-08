"use client";
import logger from "@/lib/logger";

import React, { useState } from "react";
import Image from "next/image";
import { signIn } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScribbleArrow } from "@/components/ui/scribble";

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
        logger.error("[LoginDialog] signIn error:", res.error);
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
      logger.error("[LoginDialog] exception:", err);
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
        <div className="grid overflow-hidden rounded-[28px] bg-card shadow-2xl md:grid-cols-2">
          {/* Left Side - photo panel, hidden on small screens */}
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
              Good things ahead
              <ScribbleArrow className="h-6 w-10 text-hotpink" />
            </p>
          </div>

          {/* Right Side - Sign In */}
          <div className="paper-grain flex flex-col justify-center p-8 sm:p-10">
            <div className="w-full">
              <DialogTitle className="font-display text-2xl text-ink sm:text-3xl">
                Welcome Back!
              </DialogTitle>
              <p className="mt-1 mb-6 text-sm text-muted-foreground">
                Login to continue to your account.
              </p>

              {error && (
                <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-center text-xs text-destructive">
                  {error}
                </div>
              )}

              <form onSubmit={handleCredentialsSignIn} className="space-y-4">
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Leave blank if you don't have one"
                    autoComplete="current-password"
                    className="w-full rounded-xl border border-border bg-secondary px-4 py-2.5 text-sm text-ink transition-all placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-hotpink"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full cursor-pointer rounded-full bg-primary py-3 px-6 text-sm font-semibold text-primary-foreground shadow-md transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
