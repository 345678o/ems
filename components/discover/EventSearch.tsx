"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Search } from "lucide-react";
import logger from "@/lib/logger";
import { supabase } from "@/lib/supabase/browserClient";
import { formatEventDate } from "@/components/discover/types";

type Hit = { id: string; name: string; start_datetime: string | null };
type Result =
  { q: string; kind: "error" } | { q: string; kind: "done"; hits: Hit[] };
type State = { kind: "idle" } | { kind: "loading" } | Result;

/**
 * Event search box with live results listed under it (name match, top 5).
 * Enter opens the full results on /events?q=…; arrow keys move through the
 * suggestions. Errors are shown as errors, not as "no results".
 */
export function EventSearch({
  onNavigate,
  className = "",
}: {
  /** Called before leaving, e.g. to close the dialog holding the search. */
  onNavigate?: () => void;
  className?: string;
}) {
  const router = useRouter();
  const listId = useId();
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [active, setActive] = useState(-1);
  const q = query.trim();
  // Results belong to the query that produced them; a newer query is loading.
  const state: State =
    q.length < 2
      ? { kind: "idle" }
      : result?.q === q
        ? result
        : { kind: "loading" };

  useEffect(() => {
    if (q.length < 2) return;
    let cancelled = false;
    const t = setTimeout(async () => {
      // Escape LIKE wildcards so "100%" searches literally.
      const pattern = `%${q.replace(/[%_\\]/g, (c) => `\\${c}`)}%`;
      const { data, error } = await supabase
        .from("events")
        .select("id,name,start_datetime")
        .eq("status", "approved")
        .ilike("name", pattern)
        .order("start_datetime", { ascending: false })
        .limit(5);
      if (cancelled) return;
      if (error) {
        logger.warn("[search] error:", error.message);
        setResult({ q, kind: "error" });
        return;
      }
      setActive(-1);
      setResult({ q, kind: "done", hits: (data as Hit[]) ?? [] });
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [q]);

  const hits = state.kind === "done" ? state.hits : [];

  const go = (href: string) => {
    onNavigate?.();
    router.push(href);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (active >= 0 && hits[active]) return go(`/events/${hits[active].id}`);
    go(q ? `/events?q=${encodeURIComponent(q)}` : "/events");
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!hits.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % hits.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i <= 0 ? hits.length - 1 : i - 1));
    }
  };

  const showPanel = q.length >= 2;

  return (
    <div className={className}>
      <form
        role="search"
        onSubmit={onSubmit}
        className="dz-input flex h-11 items-center gap-2 px-3 text-faint"
      >
        {state.kind === "loading" ? (
          <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
        ) : (
          <Search className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
        )}
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
          onKeyDown={onKeyDown}
          placeholder="Search events"
          aria-label="Search events"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={
            active >= 0 ? `${listId}-${active}` : undefined
          }
          className="w-full bg-transparent text-sm text-white outline-none placeholder:text-faint"
        />
      </form>

      {showPanel && (
        <div className="mt-2 text-sm">
          {state.kind === "loading" && (
            <p className="px-3 py-2.5 text-zinc-400">Searching…</p>
          )}
          {state.kind === "error" && (
            <p className="px-3 py-2.5 text-[var(--danger)]">
              Search is unavailable right now.
            </p>
          )}
          {state.kind === "done" && hits.length === 0 && (
            <p className="px-3 py-2.5 text-zinc-400">
              No events named &ldquo;{q}&rdquo;.
            </p>
          )}
          {hits.length > 0 && (
            <ul id={listId} role="listbox" aria-label="Matching events">
              {hits.map((h, i) => (
                <li
                  key={h.id}
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={i === active}
                >
                  <Link
                    href={`/events/${h.id}`}
                    onClick={onNavigate}
                    className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2 hover:bg-white/[0.06] ${
                      i === active ? "bg-white/[0.06]" : ""
                    }`}
                  >
                    <span className="truncate text-white">{h.name}</span>
                    <span className="shrink-0 text-xs text-faint">
                      {formatEventDate(h.start_datetime)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {state.kind !== "error" && (
            <Link
              href={`/events?q=${encodeURIComponent(q)}`}
              onClick={onNavigate}
              className="mt-1 flex h-9 items-center rounded-lg border-t border-[var(--dz-border)] px-3 text-ui text-zinc-400 hover:bg-white/[0.06] hover:text-white"
            >
              Search all events for &ldquo;{q}&rdquo;
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
