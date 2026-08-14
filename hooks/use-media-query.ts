"use client";

import { useState, useEffect } from "react";

/**
 * Custom hook to handle media queries in React components
 * @param query - The media query string (e.g., '(min-width: 768px)')
 * @returns boolean - Whether the media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const media = window.matchMedia(query);

    // Update the state with the current value
    const listener = () => setMatches(media.matches);

    // Set the initial value
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMatches(media.matches);

    // Add listener for changes
    media.addEventListener("change", listener);

    // Clean up
    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
}

/**
 * Common media query breakpoints
 */
export const breakpoints = {
  sm: "(min-width: 640px)",
  md: "(min-width: 768px)",
  lg: "(min-width: 1024px)",
  xl: "(min-width: 1280px)",
  "2xl": "(min-width: 1536px)",
} as const;
