"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Search, Users } from "lucide-react";
import Link from "next/link";

import TopBar from "@/components/top-bar";
import { supabase } from "@/lib/supabase/browserClient";

const eventClubNames = [
  "APEX",
  "AREO",
  "CAME",
  "CIE",
  "CODE",
  "EWB",
  "LIT",
  "MUN",
  "NSS",
  "SCOPE",
];

const clubImages: Record<string, string> = {
  APEX: "/clubs/apex",
  AREO: "/clubs/areo",
  CAME: "/clubs/came",
  CIE: "/clubs/cie",
  CODE: "/clubs/code",
  EWB: "/clubs/EWB",
  LIT: "/clubs/lit",
  MUN: "/clubs/mun",
  NSS: "/clubs/nss",
  SCOPE: "/clubs/scope",
};

type Club = {
  id: string;
  name: string;
  avatar_url: string | null;
};

const fallbackClubs: Club[] = eventClubNames.map((name) => ({
  id: name.toLowerCase(),
  name,
  avatar_url: clubImages[name],
}));

function ClubMark({ club, large = false }: { club: Club; large?: boolean }) {
  const image = club.avatar_url || clubImages[club.name.toUpperCase()];

  return (
    <div
      className={`grid shrink-0 place-items-center overflow-hidden rounded-2xl border border-black/10 bg-white ${large ? "h-20 w-20" : "h-14 w-14"}`}
    >
      {image ? (
        <img src={image} alt="" className="h-full w-full object-contain p-2" />
      ) : (
        <span className="text-lg font-semibold text-neutral-500">
          {club.name.slice(0, 2).toUpperCase()}
        </span>
      )}
    </div>
  );
}

export default function ClubsPage() {
  const [clubs, setClubs] = useState<Club[]>(fallbackClubs);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadClubs = async () => {
      const { data, error } = await supabase
        .from("clubs")
        .select("id,name,avatar_url")
        .order("name", { ascending: true });

      if (!error && data?.length) {
        const clubsByName = new Map<string, Club>();
        [...fallbackClubs, ...(data as Club[])].forEach((club) => {
          const key = club.name.trim().toLowerCase();
          if (key && !clubsByName.has(key)) clubsByName.set(key, club);
        });
        setClubs([...clubsByName.values()]);
      }
    };

    void loadClubs();
  }, []);

  const filteredClubs = useMemo(
    () =>
      clubs.filter((club) =>
        club.name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [clubs, searchTerm]
  );

  const featuredClub = filteredClubs[0] ?? clubs[0];

  return (
    <div className="min-h-screen bg-[#121212] font-poppins text-white">
      <TopBar />
      <main className="mx-auto max-w-7xl px-5 pb-20 pt-28 sm:px-8 lg:px-12">
        <section className="grid gap-8 border-b border-white/10 pb-12 lg:grid-cols-[1fr_0.85fr] lg:items-end">
          <div>
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.28em] text-white/45">
              Campus clubs
            </p>
            <h1 className="max-w-xl text-5xl font-semibold tracking-[-0.06em] sm:text-7xl">
              Browse clubs.
            </h1>
            <p className="mt-5 max-w-md text-base leading-7 text-white/60">
              Explore student communities and open a club page to see its events.
            </p>
          </div>

          <label className="relative block w-full max-w-lg justify-self-end">
            <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-500" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search clubs"
              aria-label="Search clubs"
              className="h-16 w-full rounded-2xl border border-white/15 bg-white/5 pl-14 pr-5 text-base text-white outline-none transition placeholder:text-white/35 focus:border-white/40 focus:ring-4 focus:ring-white/10"
            />
          </label>
        </section>

        {featuredClub && (
          <section className="grid gap-5 py-12 lg:grid-cols-[1.5fr_0.7fr_0.7fr]">
            <Link
                    href={`/clubs/view/${featuredClub.name.toLowerCase()}`}
              className="group relative flex min-h-[290px] flex-col justify-between overflow-hidden rounded-xl border border-white/10 bg-[#242424] p-7 text-white transition-transform hover:-translate-y-1 sm:p-10"
            >
              <div className="flex items-start justify-between gap-4">
                <ClubMark club={featuredClub} large />
                <ArrowUpRight className="h-6 w-6 text-white/60 transition group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-white" />
              </div>
              <div>
                <p className="mb-2 text-xs uppercase tracking-[0.22em] text-white/50">
                  Featured club
                </p>
                <h2 className="text-3xl font-semibold tracking-[-0.04em]">
                  {featuredClub.name}
                </h2>
                <p className="mt-2 text-sm text-white/60">View club events</p>
              </div>
            </Link>

            <div className="rounded-xl border border-white/10 bg-[#1d3027] p-7 sm:p-8">
              <Users className="mb-16 h-7 w-7 text-[#9cc7a8]" />
              <p className="text-4xl font-semibold tracking-[-0.05em] text-white">
                {clubs.length}
              </p>
              <p className="mt-2 text-sm text-[#9cc7a8]">active communities</p>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#342b22] p-7 text-white sm:p-8">
              <p className="mb-16 text-xs font-semibold uppercase tracking-[0.22em] text-orange-300/70">
                Find a club
              </p>
              <p className="text-lg font-medium leading-7 text-white/85">
                Open a community and discover what is next.
              </p>
            </div>
          </section>
        )}

        <section>
          <div className="mb-7 flex items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/45">
                Browse your clubs
              </p>
              <h2 className="text-3xl font-semibold tracking-[-0.04em] text-white">
                All clubs
              </h2>
            </div>
            <span className="text-sm text-white/40">
              {filteredClubs.length} results
            </span>
          </div>

          {filteredClubs.length ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredClubs.map((club) => (
                <Link
                  key={club.id}
                        href={`/clubs/view/${club.name.toLowerCase()}`}
                  className="group flex items-center gap-4 rounded-xl border border-white/10 bg-[#1d1d1d] p-4 transition hover:border-white/30 hover:bg-[#242424] hover:shadow-lg hover:shadow-black/20"
                >
                  <ClubMark club={club} />
                  <span className="min-w-0 flex-1 truncate font-medium text-white">
                    {club.name}
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-white/35 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" />
                </Link>
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-white/20 p-10 text-center text-white/50">
              No clubs match your search.
            </p>
          )}
        </section>
      </main>
    </div>
  );
}