"use client";
import React, { useEffect, useMemo, useState } from "react";
import AccordionGallery from "@/components/AccordionGallery";
import FadeContent from "@/components/FadeContent";
import LogoLoop from "@/components/LogoLoop";
import GradientWaves from "@/components/GradientWaves";
import { supabase } from "@/lib/supabase/browserClient";
function Page() {
  const [events, setEvents] = useState<
    Array<{ id: string; name: string; banners: Record<string, string> }>
  >([]);
  const [clubs, setClubs] = useState<
    Array<{ id: string; name: string; avatar_url: string | null }>
  >([]);

  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from("events")
          .select("id,name,banners,created_at")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("[home] events fetch error:", error.message);
          setEvents([]);
          return;
        }

        type HomeEvent = {
          id: string;
          name: string;
          banners: Record<string, string> | null;
        };
        const filtered = ((data as HomeEvent[]) || []).filter((e) => {
          let b: Record<string, string> = {};
          try {
            b =
              typeof e.banners === "string"
                ? JSON.parse(e.banners)
                : (e.banners ?? {});
          } catch (_) {
            console.warn("Invalid banners JSON:", e.banners);
          }
          return (
            Boolean(b?.["1x1"]) && Boolean(b?.["16:9"]) && Boolean(b?.["21:9"])
          );
        });

        setEvents(filtered.map((e) => ({ ...e, banners: e.banners ?? {} })));
      } catch (err: unknown) {
        console.error(
          "[home] events fetch error:",
          err instanceof Error ? err.message : err
        );
        setEvents([]);
      }
    };
    load();
  }, []);

  // Fetch clubs for the homepage clubs section
  useEffect(() => {
    const loadClubs = async () => {
      console.log("[home] Fetching clubs...");
      try {
        const { data, error } = await supabase
          .from("clubs")
          .select("id,name,avatar_url")
          .order("name", { ascending: true });

        if (error) {
          console.error("[home] clubs fetch error:", error.message);
          setClubs([]);
          return;
        }

        console.log("[home] Clubs fetched:", data);
        setClubs(
          (data || []).map((club) => ({
            id: club.id,
            name: club.name || "Unnamed Club",
            avatar_url: club.avatar_url,
          }))
        );
      } catch (err: unknown) {
        console.error(
          "[home] clubs fetch error:",
          err instanceof Error ? err.message : err
        );
        setClubs([]);
      }
    };
    loadClubs();
  }, []);

  const imageLogos = [
    {
      src: "/logos/company1.png",
      alt: "Company 1",
      href: "https://company1.com",
    },
    {
      src: "/logos/company2.png",
      alt: "Company 2",
      href: "https://company2.com",
    },
  ];
  const galleryItems = useMemo(
    () =>
      events.map((e) => ({
        image: e.banners?.["1x1"] || e.banners?.["16:9"] || "",
        label: e.name,
        link: `/event/${e.id}`,
      })),
    [events]
  );

  const clubItems = useMemo(
    () =>
      clubs.map((club) => ({
        image: club.avatar_url || "/logos/iic.png", // fallback to IIC logo if no avatar
        label: club.name,
        link: `/club`, // TODO: Link to club profile or events filtered by club
      })),
    [clubs]
  );

  return (
    <div className="relative min-h-screen dark:bg-[#0A0B1E] bg-white overflow-hidden">
      {/* Hero section — animated wave background confined to just this block */}
      <section className="relative w-full flex items-center justify-center overflow-hidden min-h-[85vh]">
        <div className="absolute inset-0 z-0">
          <GradientWaves
            horizonColor="#0A0B1E"
            waveColor="#7B4DFF"
            crestColor="#FF9FFC"
            speed={0.4}
            amplitude={2.5}
            waveScale={0.6}
            waveRatio={0.9}
            swell={35}
            turbulence={20}
            tilt={1.11}
            zoom={1.0}
            height={5.5}
            fogDepth={15}
            detail="medium"
            brightness={1.4}
            opacity={1}
            mouseInteraction
            parallaxStrength={0.5}
            grain
            grainIntensity={0.05}
          />
        </div>
      </section>

      <div className="relative z-10 w-full mb-10">
        <div className="mt-20">
          <FadeContent
            blur={true}
            duration={500}
            easing="ease-out"
            initialOpacity={0}
            delay={500}
          >
            {/* Width + left padding mirror CarouselItem: basis + pl */}
            <div className="mx-auto w-[90%] sm:w-[85%] md:w-[75%] lg:w-[70%] px-4 md:px-6">
              <h2 className="text-3xl font-bold mb-6 font-poppins">Live Now</h2>
              <AccordionGallery
                items={galleryItems.length ? galleryItems : undefined}
                defaultIndex={Math.floor((galleryItems.length || 5) / 2)}
                expandRatio={0.52}
                trigger="hover"
                accentColor="#ffffff"
                overlayColor="#060010"
                textColor="#ffffff"
                grayscale
                showLabels
                duration={0.6}
                ease="power3.out"
                parallax={0.5}
                tilt={8}
                stagger={0.06}
                height={460}
                gap={10}
                radius={16}
                orientation="horizontal"
              />
            </div>
          </FadeContent>
        </div>
        <div className="mt-20">
          <FadeContent
            blur={true}
            duration={500}
            easing="ease-out"
            initialOpacity={0}
          >
            {/* Keep the heading aligned with the carousel's main slide */}
            <div className="mx-auto w-[90%] sm:w-[85%] md:w-[75%] lg:w-[70%] px-4 md:px-6 mb-10">
              <h2 className="text-3xl font-bold mb-6 font-poppins">
                Clubs
              </h2>
            </div>

            {/* Clubs Gallery */}
            <div className="mx-auto w-[90%] sm:w-[85%] md:w-[75%] lg:w-[70%] px-4 md:px-6">
              <AccordionGallery
                items={clubItems.length ? clubItems : undefined}
                defaultIndex={Math.floor((clubItems.length || 5) / 2)}
                expandRatio={0.52}
                trigger="hover"
                accentColor="#ffffff"
                overlayColor="#060010"
                textColor="#ffffff"
                grayscale
                showLabels
                duration={0.6}
                ease="power3.out"
                parallax={0.5}
                tilt={8}
                stagger={0.06}
                height={460}
                gap={10}
                radius={16}
                orientation="horizontal"
              />
            </div>
          </FadeContent>
        </div>
        <div className="mt-20">
          <FadeContent
            blur={true}
            duration={500}
            easing="ease-out"
            initialOpacity={0}
          >
            {/* Full-bleed LogoLoop like the carousel */}
            <div className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden">
              <LogoLoop
                logos={imageLogos}
                speed={120}
                direction="left"
                logoHeight={48}
                gap={40}
                pauseOnHover
                scaleOnHover
                fadeOut
                fadeOutColor="transparent"
                ariaLabel="Technology partners"
              />
            </div>
          </FadeContent>
        </div>
      </div>
    </div>
  );
}

export default Page;
