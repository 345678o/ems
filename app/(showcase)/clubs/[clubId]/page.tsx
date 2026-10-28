"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CalendarDays, CalendarPlus, MapPin } from "lucide-react";
import { supabase } from "@/lib/supabase/browserClient";
import { HeroBanner } from "@/components/discover/HeroBanner";
import { EventCard } from "@/components/discover/EventCard";
import {
  clubLogo,
  eventCategory,
  eventCover,
  eventLocation,
  formatEventDate,
  type DiscoverEvent,
} from "@/components/discover/types";

type Club = {
  id: string;
  name: string;
  about: string | null;
  avatar_url: string | null;
};

export default function ClubPage() {
  const { clubId } = useParams<{ clubId: string }>();
  const [club, setClub] = useState<Club | null>(null);
  const [events, setEvents] = useState<DiscoverEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [now] = useState(() => Date.now());

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const name = decodeURIComponent(clubId);
      const select = "id,name,about,avatar_url";
      // Exact name first, then a prefix match so short slugs like "cie"
      // still resolve to "CIE MLRIT".
      let { data: found } = await supabase
        .from("clubs")
        .select(select)
        .ilike("name", name)
        .limit(1);
      if (!found?.length) {
        ({ data: found } = await supabase
          .from("clubs")
          .select(select)
          .ilike("name", `${name}%`)
          .limit(1));
      }

      const matched = found?.[0] as Club | undefined;
      if (!matched) {
        setClub({
          id: name,
          name: name.toUpperCase(),
          about: null,
          avatar_url: null,
        });
        setIsLoading(false);
        return;
      }

      setClub(matched);
      const { data: eventData } = await supabase
        .from("events")
        .select(
          "id,name,description,start_datetime,event_type,theme,venue,city,banners"
        )
        .eq("club_id", matched.id)
        .order("start_datetime", { ascending: true });
      setEvents(
        ((eventData as Omit<DiscoverEvent, "club">[]) || []).map((e) => ({
          ...e,
          club: { name: matched.name },
        }))
      );
      setIsLoading(false);
    };
    void load();
  }, [clubId]);

  if (isLoading || !club) {
    return (
      <p className="py-24 text-center text-ui text-zinc-400">
        Loading club…
      </p>
    );
  }

  const logo = clubLogo(club.name) || club.avatar_url;
  const upcoming = events.filter(
    (e) => e.start_datetime && new Date(e.start_datetime).getTime() >= now
  );
  const banner = events.find((e) => e.banners && Object.keys(e.banners).length);

  return (
    <div className="grid lg:grid-cols-[280px_minmax(0,1fr)] gap-6 grid-cols-1">
      <aside className="flex flex-col gap-6 max-lg:order-2">
        <section className="dz-panel flex flex-col items-center p-5 text-center">
          <Link
            href="/clubs"
            className="flex items-center gap-1.5 self-start text-xs text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="size-3" aria-hidden />
            All clubs
          </Link>
          <span className="mt-4 grid size-24 place-items-center overflow-hidden rounded-full border-2 border-white/30 bg-white text-2xl font-semibold text-[#18181b]">
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logo} alt="" className="size-full object-cover" />
            ) : (
              club.name.slice(0, 2).toUpperCase()
            )}
          </span>
          <h2 className="mt-3 text-ui font-semibold leading-snug">
            {club.name}
          </h2>
          <p className="mt-0.5 text-xs text-zinc-400">Student community</p>
          <div className="mt-4 grid w-full grid-cols-2 gap-2">
            <div className="rounded-xl bg-white/[0.06] py-2.5">
              <p className="text-lg font-semibold">{events.length}</p>
              <p className="text-xs text-zinc-400">Events</p>
            </div>
            <div className="rounded-xl bg-white/[0.06] py-2.5">
              <p className="text-lg font-semibold">{upcoming.length}</p>
              <p className="text-xs text-zinc-400">Upcoming</p>
            </div>
          </div>
        </section>

        {upcoming.length > 0 && (
          <section className="dz-panel p-5">
            <h2 className="text-lg font-semibold">Coming up</h2>
            <ul className="mt-3 flex flex-col gap-3">
              {upcoming.slice(0, 4).map((e) => (
                <li key={e.id}>
                  <Link href={`/events/${e.id}`} className="block">
                    <p className="truncate text-xs font-medium">{e.name}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-zinc-400">
                      <MapPin className="size-2.5" aria-hidden />
                      {eventLocation(e) || "Venue TBA"}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </aside>

      <div className="flex min-w-0 flex-col gap-6 max-lg:order-1">
        <HeroBanner
          titleAs="h1"
          image={banner ? eventCover(banner, 0) : "/events/welcome-gate.jpg"}
          eyebrow="Student community"
          tags={[
            `${events.length} event${events.length === 1 ? "" : "s"}`,
            "MLRIT",
          ]}
          title={club.name}
          description={
            club.about || `${club.name} is part of the MLRIT student community.`
          }
          primary={{
            label: "View events",
            href: "#club-events",
            icon: <CalendarDays className="size-3.5" aria-hidden />,
          }}
          secondary={{
            label: "Calendar",
            href: "/calendar",
            icon: (
              <CalendarPlus
                className="size-3.5"
                strokeWidth={1.8}
                aria-hidden
              />
            ),
          }}
        />

        <section id="club-events">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Events</h2>
            <span className="dz-chip">{events.length} listed</span>
          </div>
          {events.length === 0 ? (
            <p className="dz-panel mt-3 p-6 text-ui text-zinc-400">
              No events posted yet. Check back soon.
            </p>
          ) : (
            <div className="mt-3 grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 xl:grid-cols-3">
              {events.map((e, i) => (
                <EventCard
                  key={e.id}
                  href={`/events/${e.id}`}
                  title={e.name}
                  meta={`${formatEventDate(e.start_datetime)}${e.club ? ` · ${e.club.name}` : ""}`}
                  category={eventCategory(e)}
                  image={eventCover(e, i)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
