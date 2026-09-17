"use client";

import { useEffect, useRef, useState } from "react";
import { DroneModel } from "./DroneModel";
import CloudSky from "./CloudSky";

const FAKE_PATHS = ["/", "/events", "/clubs", "/calendar"];

export function LoadingScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<"loading" | "ready" | "split">("loading");
  const [pathIndex, setPathIndex] = useState(0);
  const topPanelRef = useRef<HTMLDivElement>(null);
  const bottomPanelRef = useRef<HTMLDivElement>(null);

  // Brief intro pause, then show ENTER EMS button
  useEffect(() => {
    const t = setTimeout(() => setPhase("ready"), 1800);
    return () => clearTimeout(t);
  }, []);

  function handleEnter() {
    const top = topPanelRef.current;
    const bot = bottomPanelRef.current;
    if (!top || !bot) return;

    // Phase 1 — snap panels to center with no transition
    top.style.transition = "none";
    top.style.transform = "translateY(0)";
    bot.style.transition = "none";
    bot.style.transform = "translateY(0)";

    // Phase 2 — next paint: slide them out
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const ease = "transform 0.92s cubic-bezier(0.76,0,0.24,1)";
        top.style.transition = ease;
        top.style.transform = "translateY(-100%)";
        bot.style.transition = ease;
        bot.style.transform = "translateY(100%)";
      });
    });

    setPhase("split");
    setTimeout(onDone, 1000);
  }

  // Cycle paths to trigger BrandMark 180° spin
  useEffect(() => {
    const t = setInterval(() => setPathIndex((i) => (i + 1) % FAKE_PATHS.length), 600);
    return () => clearInterval(t);
  }, []);

  const splitting = phase === "split";

  return (
    <>
      {/* CloudSky animated background — always visible during loading */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9998,
          pointerEvents: splitting ? "none" : "auto",
        }}
      >
        <CloudSky
          background="#4A90D9"
          baseColor="#A8CFEF"
          accentColor="#FFFFFF"
          density={65}
          speed={55}
          size={120}
        />
      </div>

      {/* Split curtain panels — start off-screen, snap+slide on exit */}
      <div
        ref={topPanelRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "50%",
          zIndex: 10010,
          transform: "translateY(-100%)",
          background: "linear-gradient(to bottom, #4A90D9, #6AAEDE)",
          pointerEvents: "none",
        }}
      />
      <div
        ref={bottomPanelRef}
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: "50%",
          zIndex: 10010,
          transform: "translateY(100%)",
          background: "linear-gradient(to bottom, #A8CFEF, #BCD9F2)",
          pointerEvents: "none",
        }}
      />

      {/* Drone — full-screen layer above the sky */}
      {!splitting && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10000,
            pointerEvents: "none",
          }}
        >
          <DroneModel onLoaded={() => setPhase("ready")} />
        </div>
      )}

      {/* Text UI — floats on top of everything */}
      {!splitting && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10002,
            pointerEvents: "none",
          }}
        >
          {/* Top-center: Logo + EMS · MLRIT + subtitle */}
          <div
            style={{
              position: "absolute",
              top: "clamp(2rem, 5vh, 4rem)",
              left: 0,
              right: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.55rem",
            }}
          >
            {/* Logo + wordmark row */}
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: "clamp(0.8rem, 1.5vw, 1.4rem)",
              }}
            >
              {/* Spinning logo mark */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transform: "scale(1.8)",
                  transformOrigin: "center center",
                }}
              >
                <SpinningMark pathIndex={pathIndex} />
              </div>

              {/* EMS · MLRIT — white text */}
              <span
                aria-label="EMS · MLRIT"
                style={{
                  fontFamily: "var(--font-heading)",
                  fontWeight: 900,
                  fontSize: "clamp(2rem, 4.2vw, 3.8rem)",
                  lineHeight: 1,
                  letterSpacing: "0.04em",
                  color: "#FFFFFF",
                  display: "block",
                  whiteSpace: "nowrap",
                  userSelect: "none",
                  textShadow: "0 2px 16px rgba(0,0,0,0.28)",
                }}
              >
                EMS<span style={{ color: "#FFFFFF" }}> · </span>MLRIT
              </span>
            </div>

            {/* Two subtitle lines */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.2rem",
                marginTop: "0.3rem",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(0.75rem, 1.1vw, 0.95rem)",
                  fontWeight: 500,
                  letterSpacing: "0.06em",
                  color: "rgba(255,255,255,0.9)",
                  textShadow: "0 1px 8px rgba(0,0,0,0.25)",
                  textAlign: "center",
                }}
              >
                Your all-in-one platform for campus events at MLRIT
              </p>
              <p
                style={{
                  margin: 0,
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(0.65rem, 0.9vw, 0.8rem)",
                  fontWeight: 400,
                  letterSpacing: "0.08em",
                  color: "rgba(255,255,255,0.65)",
                  textShadow: "0 1px 6px rgba(0,0,0,0.2)",
                  textAlign: "center",
                }}
              >
                Discover · Register · Celebrate
              </p>
            </div>
          </div>

          {/* Bottom-right: ENTER EMS button */}
          <div
            style={{
              position: "absolute",
              bottom: "clamp(1.5rem, 4vh, 3rem)",
              right: "clamp(2rem, 5vw, 4.5rem)",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: "0.6rem",
            }}
          >
            <button
              onClick={handleEnter}
              style={{
                pointerEvents: "auto",
                fontFamily: "var(--font-display)",
                fontSize: "clamp(0.85rem, 1.1vw, 1rem)",
                fontWeight: 800,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "#FAF7EE",
                backgroundColor: "var(--clr-orange, #FB5607)",
                border: "none",
                borderRadius: "4px",
                padding: "0.75rem 2rem",
                cursor: "pointer",
                transition: "background-color 0.15s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#E04800";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  "var(--clr-orange, #FB5607)";
              }}
            >
              ENTER EMS
            </button>
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(0.55rem, 0.8vw, 0.65rem)",
                fontWeight: 700,
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                color: "rgba(255, 255, 255, 0.7)",
                margin: 0,
                textAlign: "right",
                whiteSpace: "nowrap",
                textShadow: "0 1px 4px rgba(0,0,0,0.25)",
              }}
            >
              Campus Events, Reframed.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

function SpinningMark({ pathIndex }: { pathIndex: number }) {
  const colorPairs = [
    { c1: "var(--clr-purple, #8338EC)", c2: "var(--clr-orange, #FB5607)" },
    { c1: "var(--clr-orange, #FB5607)", c2: "var(--clr-purple, #8338EC)" },
  ];
  const [rotation, setRotation] = useState(0);
  const [activeColors, setActiveColors] = useState(colorPairs[0]);
  const prevIndex = useRef(pathIndex);

  useEffect(() => {
    if (prevIndex.current === pathIndex) return;
    prevIndex.current = pathIndex;
    setRotation((r) => r + 180);
    setTimeout(() => {
      setActiveColors(colorPairs[pathIndex % colorPairs.length]);
    }, 300);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathIndex]);

  return (
    <span
      className="site-brand-mark"
      aria-hidden="true"
      style={{
        transform: `rotate(${rotation}deg)`,
        transition: "transform 0.6s cubic-bezier(0.4,0,0.2,1)",
        display: "inline-flex",
        alignItems: "center",
      }}
    >
      <span style={{ borderColor: activeColors.c1 }} />
      <span style={{ borderColor: activeColors.c2 }} />
    </span>
  );
}
