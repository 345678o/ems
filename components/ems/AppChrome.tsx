"use client";

import dynamic from "next/dynamic";
import { useState, type ReactNode } from "react";
import { GlobalNav } from "@/components/ems/GlobalNav";

// LoadingScreen pulls in CloudSky (raw WebGL canvas) and DroneModel
// (three.js), both of which touch `window`/`document` outside effects
// in ways that don't tolerate SSR — load it client-only.
const LoadingScreen = dynamic(
  () => import("@/components/ems/LoadingScreen").then((m) => m.LoadingScreen),
  { ssr: false }
);

export function AppChrome({ children }: { children: ReactNode }) {
  const [entered, setEntered] = useState(false);

  return (
    <>
      {!entered && <LoadingScreen onDone={() => setEntered(true)} />}
      <GlobalNav />
      {children}
    </>
  );
}
