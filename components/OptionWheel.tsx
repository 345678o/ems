"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import "./OptionWheel.css";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface OptionWheelProps {
  items?: string[];
  /** Index of the initially selected item. @default 3 */
  defaultSelected?: number;
  /** Called with (index, label) when the selection changes. */
  onChange?: (index: number, label: string) => void;
  /** CSS colour for non-active items. @default "#a6a6a6" */
  textColor?: string;
  /** CSS colour for the active item. @default "#ffffff" */
  activeColor?: string;
  /** Which side the wheel is anchored to. @default "left" */
  side?: "left" | "right";
  /** Base font size in rem. @default 3 */
  fontSize?: number;
  /** Row spacing multiplier. @default 1.4 */
  spacing?: number;
  /** How tightly the list curls (0 = flat). @default 1 */
  curve?: number;
  /** Perspective tilt in degrees. @default 6 */
  tilt?: number;
  /** Blur in px applied per row of distance from selection. @default 2 */
  blur?: number;
  /** Opacity reduction per row away from selection. @default 0.25 */
  fade?: number;
  /** Floor opacity for distant items. @default 0.05 */
  minOpacity?: number;
  /** Easing time constant in ms. @default 200 */
  smoothing?: number;
  /** Horizontal offset of the selected item from the container edge in px.
   *  @default 80 */
  inset?: number;
  /** Wrap around the ends. @default false */
  loop?: boolean;
  /** Allow click-drag scrolling. @default true */
  draggable?: boolean;
  /** URL of an audio clip played on each step. @default "" */
  soundUrl?: string;
  /** Volume for the tick sound (0–1). @default 0.5 */
  soundVolume?: number;
  /** Extra class names applied to the root element. @default "" */
  className?: string;
}

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

const DEFAULT_ITEMS: string[] = [
  "Ambient",
  "House",
  "Techno",
  "Jazz",
  "Lo-Fi",
  "Synthwave",
  "Trance",
  "Funk",
  "Disco",
  "Hip-Hop",
  "Chillwave",
  "Drum & Bass",
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const OptionWheel = ({
  items = DEFAULT_ITEMS,
  defaultSelected = 3,
  onChange,
  textColor = "#a6a6a6",
  activeColor = "#ffffff",
  side = "left",
  fontSize = 3,
  spacing = 1.4,
  curve = 1,
  tilt = 6,
  blur = 2,
  fade = 0.25,
  minOpacity = 0.05,
  smoothing = 200,
  inset = 80,
  loop = false,
  draggable = true,
  soundUrl = "",
  soundVolume = 0.5,
  className = "",
}: OptionWheelProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const posRef = useRef(defaultSelected);
  const targetRef = useRef(defaultSelected);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef(0);
  const cfgRef = useRef<Record<string, unknown>>({});
  const onChangeRef = useRef(onChange);
  const selectedRef = useRef(defaultSelected);
  const wheelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragRef = useRef<{ y: number; start: number; id: number } | null>(null);
  const dragMovedRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef("");
  const lastTickRef = useRef(0);

  const [selectedIndex, setSelectedIndex] = useState(defaultSelected);
  const [isDragging, setIsDragging] = useState(false);

  const remPx =
    typeof window !== "undefined"
      ? parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
      : 16;

  // Keep refs in sync with the latest props so callbacks always read current values
  // without triggering re-renders. This is the documented ref-as-mutable-value pattern.

  onChangeRef.current = onChange;

  cfgRef.current = {
    count: items.length,
    items,
    rowH: Math.max(fontSize * spacing * remPx, 1),
    curve,
    tilt,
    blur,
    fade,
    minOpacity,
    side,
    loop,
    smoothing,
    draggable,
    soundUrl,
    soundVolume,
  };

  // ── rAF render loop ────────────────────────────────────────────────────────
  const runFrame = useCallback((now: number) => {
    const dt = Math.min((now - lastRef.current) / 1000, 0.05);
    lastRef.current = now;
    const cfg = cfgRef.current as {
      smoothing: number;
      count: number;
      side: string;
      rowH: number;
      curve: number;
      tilt: number;
      blur: number;
      fade: number;
      minOpacity: number;
      loop: boolean;
    };

    const tau = Math.max(cfg.smoothing, 1) / 1000;
    const k = 1 - Math.exp(-dt / tau);

    let next = posRef.current + (targetRef.current - posRef.current) * k;
    if (Math.abs(targetRef.current - next) < 0.001) next = targetRef.current;
    posRef.current = next;

    const els = itemRefs.current;
    const n = cfg.count;
    const mirror = cfg.side === "right" ? -1 : 1;
    const tiltRad = (cfg.tilt * Math.PI) / 180;
    const R = tiltRad > 0.0005 ? cfg.rowH / tiltRad : 0;

    for (let i = 0; i < n; i++) {
      const el = els[i];
      if (!el) continue;
      let d = i - next;
      if (cfg.loop && n > 1) {
        d = ((d % n) + n) % n;
        if (d > n / 2) d -= n;
      }
      const dist = Math.abs(d);
      let x = 0;
      let y = d * cfg.rowH;
      let rot = 0;
      if (R > 0) {
        const ang = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, d * tiltRad));
        y = R * Math.sin(ang);
        x = -mirror * R * (1 - Math.cos(ang)) * cfg.curve;
        rot = (mirror * ang * 180) / Math.PI;
      }
      el.style.transform = `translate(${x.toFixed(2)}px, calc(${y.toFixed(2)}px - 50%)) rotate(${rot.toFixed(3)}deg)`;
      el.style.opacity = String(Math.max(cfg.minOpacity, 1 - dist * cfg.fade));
      el.style.filter =
        cfg.blur > 0 ? `blur(${(dist * cfg.blur).toFixed(2)}px)` : "none";
      el.style.setProperty(
        "--ow-p",
        Math.max(0, 1 - Math.min(dist, 1)).toFixed(4)
      );
    }

    rafRef.current =
      posRef.current === targetRef.current
        ? null
        : requestAnimationFrame(runFrame);
  }, []);

  const startLoop = useCallback(() => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    lastRef.current = performance.now();
    rafRef.current = requestAnimationFrame(runFrame);
  }, [runFrame]);

  const playTick = useCallback(() => {
    const { soundUrl: url, soundVolume: vol } = cfgRef.current as {
      soundUrl: string;
      soundVolume: number;
    };
    if (!url) return;
    const now = performance.now();
    if (now - lastTickRef.current < 70) return;
    lastTickRef.current = now;
    if (!audioRef.current || audioUrlRef.current !== url) {
      audioRef.current = new Audio(url);
      audioRef.current.preload = "auto";
      audioUrlRef.current = url;
    }
    const audio = audioRef.current;
    audio.volume = Math.min(Math.max(vol, 0), 1);
    audio.currentTime = 0;
    audio.play()?.catch(() => {});
  }, []);

  const applyTarget = useCallback(
    (value: number, snap: boolean) => {
      const cfg = cfgRef.current as {
        loop: boolean;
        count: number;
        items: string[];
      };
      let v = value;
      if (!cfg.loop) v = Math.min(Math.max(v, 0), Math.max(cfg.count - 1, 0));
      if (snap) v = Math.round(v);
      targetRef.current = v;
      const idx = ((Math.round(v) % cfg.count) + cfg.count) % cfg.count;
      if (idx !== selectedRef.current) {
        selectedRef.current = idx;
        setSelectedIndex(idx);
        onChangeRef.current?.(idx, cfg.items[idx]);
        playTick();
      }
      startLoop();
    },
    [startLoop, playTick]
  );

  // ── Wheel / touchpad ───────────────────────────────────────────────────────
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const cfg = cfgRef.current as { rowH: number };
      const delta = e.deltaMode === 1 ? e.deltaY * 24 : e.deltaY;
      const step = Math.max(-1, Math.min(1, delta / cfg.rowH));
      applyTarget(targetRef.current + step, false);
      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
      wheelTimerRef.current = setTimeout(
        () => applyTarget(targetRef.current, true),
        140
      );
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
    };
  }, [applyTarget]);

  // ── Pointer drag ───────────────────────────────────────────────────────────
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!(cfgRef.current as { draggable: boolean }).draggable) return;
    dragRef.current = {
      y: e.clientY,
      start: targetRef.current,
      id: e.pointerId,
    };
    dragMovedRef.current = false;
    setIsDragging(true);
  }, []);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      const dy = e.clientY - drag.y;
      if (!dragMovedRef.current && Math.abs(dy) > 4) {
        dragMovedRef.current = true;
        rootRef.current?.setPointerCapture(drag.id);
      }
      if (dragMovedRef.current)
        applyTarget(
          drag.start - dy / (cfgRef.current as { rowH: number }).rowH,
          false
        );
    },
    [applyTarget]
  );

  const handlePointerEnd = useCallback(() => {
    if (!dragRef.current) return;
    dragRef.current = null;
    setIsDragging(false);
    if (dragMovedRef.current) applyTarget(targetRef.current, true);
  }, [applyTarget]);

  const handleItemClick = useCallback(
    (index: number) => {
      if (dragMovedRef.current) return;
      const cfg = cfgRef.current as { count: number; loop: boolean };
      const cur = targetRef.current;
      let d = index - (((cur % cfg.count) + cfg.count) % cfg.count);
      if (cfg.loop && cfg.count > 1) {
        if (d > cfg.count / 2) d -= cfg.count;
        else if (d < -cfg.count / 2) d += cfg.count;
      }
      applyTarget(cur + d, true);
    },
    [applyTarget]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      let delta: number | null = null;
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") delta = -1;
      else if (e.key === "ArrowDown" || e.key === "ArrowRight") delta = 1;
      if (delta == null) return;
      e.preventDefault();
      applyTarget(Math.round(targetRef.current) + delta, true);
    },
    [applyTarget]
  );

  // Re-layout when visual props change
  useEffect(() => {
    applyTarget(targetRef.current, false);
  }, [
    items,
    fontSize,
    spacing,
    curve,
    tilt,
    blur,
    fade,
    minOpacity,
    side,
    loop,
    smoothing,
    applyTarget,
  ]);

  // Cleanup on unmount
  useEffect(
    () => () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      audioRef.current?.pause();
    },
    []
  );

  return (
    <div
      ref={rootRef}
      role="listbox"
      tabIndex={0}
      aria-label="Option wheel"
      className={[
        "option-wheel",
        side === "right" ? "option-wheel--right" : "",
        isDragging ? "option-wheel--dragging" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={
        {
          "--ow-text-color": textColor,
          "--ow-active-color": activeColor,
          "--ow-font-size": `${fontSize}rem`,
          "--ow-inset": `${inset}px`,
        } as React.CSSProperties
      }
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onKeyDown={handleKeyDown}
    >
      {items.map((label, index) => (
        <div
          key={`${label}-${index}`}
          ref={(el) => {
            itemRefs.current[index] = el;
          }}
          role="option"
          aria-selected={selectedIndex === index}
          className={[
            "option-wheel__item",
            selectedIndex === index ? "option-wheel__item--selected" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={() => handleItemClick(index)}
        >
          {label}
        </div>
      ))}
    </div>
  );
};

export default OptionWheel;
