"use client";

import { useState } from "react";
import { RefineFrame } from "@/components/ui/refine-frame";

/**
 * Poster image that reveals through RefineFrame. It shows the blurred,
 * working look until the image loads, then sharpens into place.
 * The frame is sized by its parent: width is huge so the parent caps it.
 */
export function PosterReveal({
  image,
  aspectRatio,
}: {
  image: string;
  aspectRatio: string;
}) {
  // Keep the src with the result, so a new image starts over as "generating".
  const [done, setDone] = useState<{ src: string; ok: boolean } | null>(null);
  const status =
    done?.src === image ? (done.ok ? "complete" : "error") : "generating";

  return (
    <RefineFrame
      status={status}
      aspectRatio={aspectRatio}
      width={1200}
      radius={0}
      background="#18181b"
      color="#f5f5f5"
      showStatus={false}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image}
        alt=""
        loading="lazy"
        // SSR images can finish loading before hydration, so React never sees
        // their onLoad. Check on mount. Returning prev keeps this from looping.
        ref={(el) => {
          if (el?.complete && el.naturalWidth > 0)
            setDone((prev) =>
              prev?.src === image ? prev : { src: image, ok: true }
            );
        }}
        onLoad={() => setDone({ src: image, ok: true })}
        onError={() => setDone({ src: image, ok: false })}
      />
    </RefineFrame>
  );
}
