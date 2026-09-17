"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowUpRight } from "lucide-react";
import { SiteFooter } from "@/components/ems/site-shell";
import { supabase } from "@/lib/supabase/browserClient";

// GalleryTunnel is raw three.js — load it client-only.
const GalleryTunnel = dynamic(
  () => import("@/components/ems/GalleryTunnel").then((m) => m.GalleryTunnel),
  { ssr: false }
);

const EVENT_IMAGES = [
  "/events/welcome-gate.jpg",
  "/events/B2B.png",
  "/events/equniox.png",
  "/events/gi.png",
  "/events/hustle mania.png",
  "/events/metaloop.png",
  "/events/wc 2.0.png",
  "/events/wc.png",
];

type Club = {
  id: string;
  name: string;
  focus: string | null;
};

export default function ClubsPage() {
  const [clubs, setClubs] = useState<Club[]>([]);

  useEffect(() => {
    const loadClubs = async () => {
      const { data, error } = await supabase
        .from("clubs")
        .select("id,name,about")
        .order("name", { ascending: true });

      if (error) {
        console.error("[clubs] fetch error:", error.message);
        return;
      }

      setClubs((data || []).map((c) => ({ id: c.id, name: c.name, focus: c.about })));
    };
    void loadClubs();
  }, []);

  useEffect(() => {
    const cards = document.querySelectorAll<HTMLElement>(".club-card");
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const d = el.dataset.delay ?? "0";
            setTimeout(() => {
              el.style.opacity = "1";
              el.style.transform = "translateY(0)";
            }, parseInt(d));
            obs.unobserve(el);
          }
        });
      },
      { threshold: 0.08 }
    );
    cards.forEach((c) => obs.observe(c));
    return () => obs.disconnect();
  }, [clubs]);

  return (
    <>
      {/* ── Hero ── GalleryTunnel full bleed */}
      <div
        style={{
          position: "relative",
          height: "60vh",
          minHeight: "500px",
          overflow: "hidden",
          display: "block",
          width: "100%",
          background: "#212529",
        }}
      >
        <GalleryTunnel
          images={EVENT_IMAGES}
          colors={["#212529", "#1a1d21", "#2d3748", "#E9ECEF"]}
          background="#212529"
          lineColor="#ffffff"
          lineOpacity={25}
          grid={3}
          speed={40}
          fade={70}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(33,37,41,0.9) 30%, transparent 100%)",
            zIndex: 1,
          }}
        />
        <div
          className="page-gutter"
          style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 2, paddingBottom: "3rem" }}
        >
          <div className="mx-auto max-w-[1400px]">
            <p className="meta mb-4" style={{ color: "var(--clr-orange)" }}>
              Campus communities
            </p>
            <h1 className="display-lg uppercase" style={{ color: "var(--clr-white)" }}>
              Find your
              <br />
              circle.
            </h1>
            <p className="mt-6 max-w-xl text-lg" style={{ color: "rgba(233,236,239,0.7)" }}>
              {clubs.length} active clubs and communities across campus.
            </p>
          </div>
        </div>
      </div>

      <main style={{ background: "var(--clr-white)" }}>
        {/* ── All Clubs ── */}
        <div className="page-gutter py-20" style={{ background: "var(--clr-white)" }}>
          <div className="mx-auto max-w-[1400px]">
            <div className="mb-10 flex items-end justify-between">
              <div>
                <p className="meta mb-2" style={{ color: "var(--clr-purple)" }}>
                  Student communities
                </p>
                <h2 className="text-4xl font-semibold" style={{ color: "var(--clr-black)" }}>
                  All clubs
                </h2>
              </div>
              <span className="meta" style={{ color: "var(--clr-black)", opacity: 0.3 }}>
                {clubs.length} clubs
              </span>
            </div>

            {clubs.length === 0 ? (
              <p style={{ color: "rgba(33,37,41,0.5)" }}>No clubs yet.</p>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                  gap: "1px",
                  background: "var(--border)",
                }}
              >
                {clubs.map((c, i) => (
                  <ClubCard
                    key={c.id}
                    club={c}
                    delay={i * 60}
                    accent={i % 2 === 0 ? "var(--clr-purple)" : "var(--clr-orange)"}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <SiteFooter />
      </main>
    </>
  );
}

function ClubCard({
  club,
  delay,
  accent,
}: {
  club: Club;
  delay: number;
  accent: string;
}) {
  const abbr = club.name.slice(0, 4).toUpperCase();
  return (
    <Link
      href={`/clubs/${club.name.toLowerCase()}`}
      className="club-card group"
      data-delay={delay}
      style={{
        background: "#fff",
        padding: "2rem",
        display: "flex",
        flexDirection: "column",
        gap: "1.25rem",
        opacity: 0,
        transform: "translateY(32px)",
        transition:
          "opacity 0.65s ease, transform 0.65s cubic-bezier(0.25,0.46,0.45,0.94), background 0.2s ease",
        textDecoration: "none",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background =
          accent === "var(--clr-purple)" ? "rgba(131,56,236,0.06)" : "rgba(251,86,7,0.06)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = "#fff";
      }}
    >
      <div
        style={{
          width: "3.5rem",
          height: "3.5rem",
          borderRadius: "50%",
          background: accent === "var(--clr-purple)" ? "rgba(131,56,236,0.1)" : "rgba(251,86,7,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: "0.9rem",
          letterSpacing: "0.05em",
          color: accent,
          flexShrink: 0,
        }}
      >
        {abbr}
      </div>

      <div style={{ flex: 1 }}>
        <h3
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.35rem",
            fontWeight: 700,
            color: "var(--clr-black)",
            margin: 0,
            lineHeight: 1.15,
            transition: "color 0.2s ease",
          }}
          className="group-hover:text-[var(--clr-purple)]"
        >
          {club.name}
        </h3>
        <p
          style={{
            marginTop: "0.4rem",
            fontSize: "0.78rem",
            color: "rgba(33,37,41,0.5)",
            lineHeight: 1.4,
          }}
        >
          {club.focus || "Student community at MLRIT."}
        </p>
      </div>

      <ArrowUpRight className="club-card-arrow size-4" style={{ color: accent }} />

      <div className="club-card-bar" style={{ background: accent }} />
    </Link>
  );
}
