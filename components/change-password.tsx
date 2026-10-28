"use client";

import logger from "@/lib/logger";
import React, { useId, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

const MIN_PASSWORD = 8;
type Field = "current" | "next" | "confirm";

/** Profile section: change your own password (PATCH /api/me/password). */
export function ChangePassword() {
  const ids = useId();
  const [values, setValues] = useState<Record<Field, string>>({
    current: "",
    next: "",
    confirm: "",
  });
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<Field, string>>
  >({});
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState<string | null>(null);

  const validate = () => {
    const e: Partial<Record<Field, string>> = {};
    if (!values.current) e.current = "Enter your current password.";
    if (!values.next) e.next = "Enter a new password.";
    else if (values.next.length < MIN_PASSWORD)
      e.next = `Use at least ${MIN_PASSWORD} characters.`;
    else if (values.next === values.current)
      e.next = "Pick a password different from the current one.";
    if (values.confirm !== values.next) e.confirm = "Passwords don't match.";
    return e;
  };

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (status === "saving") return;
    const errors = validate();
    setFieldErrors(errors);
    setError(null);
    setStatus("idle");
    const first = (["current", "next", "confirm"] as Field[]).find(
      (f) => errors[f]
    );
    if (first) {
      document.getElementById(`${ids}-${first}`)?.focus();
      return;
    }
    setStatus("saving");
    try {
      const res = await fetch("/api/me/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current_password: values.current,
          new_password: values.next,
        }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setError(
          res.status >= 500
            ? "Couldn't change your password right now. Please try again later."
            : json.error || "Couldn't change your password."
        );
        setStatus("idle");
        return;
      }
      setValues({ current: "", next: "", confirm: "" });
      setStatus("saved");
    } catch (e) {
      logger.error("[ChangePassword] error:", e);
      setError("Something went wrong. Please try again.");
      setStatus("idle");
    }
  };

  const input = (name: Field, label: string, autoComplete: string) => {
    const id = `${ids}-${name}`;
    const err = fieldErrors[name];
    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={id} className="text-ui font-medium text-zinc-300">
          {label}
        </label>
        <input
          id={id}
          type="password"
          autoComplete={autoComplete}
          value={values[name]}
          disabled={status === "saving"}
          onChange={(e) => {
            setValues((v) => ({ ...v, [name]: e.target.value }));
            if (err) setFieldErrors((f) => ({ ...f, [name]: undefined }));
            if (status === "saved") setStatus("idle");
          }}
          aria-invalid={!!err}
          aria-describedby={err ? `${id}-error` : undefined}
          className={`dz-input h-10 px-3 disabled:opacity-60 ${
            err ? "!border-[var(--danger)]" : ""
          }`}
        />
        {err && (
          <p
            id={`${id}-error`}
            className="flex items-center gap-1.5 text-xs text-[var(--danger)]"
          >
            <AlertCircle className="size-3.5 shrink-0" aria-hidden />
            {err}
          </p>
        )}
      </div>
    );
  };

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      aria-labelledby={`${ids}-title`}
      className="dz-panel flex flex-col gap-5 p-6"
    >
      <div>
        <h2 id={`${ids}-title`} className="text-lg font-semibold">
          Change password
        </h2>
        <p className="mt-1 text-ui text-zinc-400">
          Enter your current password, then choose a new one.
        </p>
      </div>

      {error && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-[rgba(248,113,113,0.25)] bg-[var(--destructive-soft)] px-3 py-2.5 text-ui text-[var(--danger)]"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          {error}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-3">
        {input("current", "Current password", "current-password")}
        {input("next", "New password", "new-password")}
        {input("confirm", "Confirm new password", "new-password")}
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-[var(--dz-border)] pt-5">
        <button
          type="submit"
          disabled={status === "saving"}
          className="dz-btn dz-btn--ghost"
        >
          {status === "saving" && (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          )}
          {status === "saving" ? "Updating…" : "Update password"}
        </button>
        <p aria-live="polite" className="text-ui">
          {status === "saved" && (
            <span className="flex items-center gap-1.5 text-[var(--success)]">
              <CheckCircle2 className="size-4" aria-hidden />
              Password updated. Use it next time you sign in.
            </span>
          )}
        </p>
      </div>
    </form>
  );
}
