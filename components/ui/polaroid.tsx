import Image from "next/image";
import { cn } from "@/lib/utils";

export function Polaroid({
  src,
  alt,
  caption,
  rotate = 0,
  className,
  imgClassName,
  sizes,
}: {
  src: string;
  alt: string;
  caption?: string;
  /** Degrees to tilt the frame, e.g. -3 or 4. */
  rotate?: number;
  className?: string;
  imgClassName?: string;
  sizes?: string;
}) {
  return (
    <div
      className={cn("polaroid inline-block", className)}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <div className={cn("relative aspect-[4/5] w-full overflow-hidden", imgClassName)}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes ?? "(max-width: 768px) 60vw, 320px"}
          className="object-cover"
          unoptimized
        />
      </div>
      {caption && (
        <p className="font-marker mt-2 text-center text-lg leading-none text-ink/80">
          {caption}
        </p>
      )}
    </div>
  );
}
