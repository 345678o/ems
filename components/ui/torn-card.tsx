import { cn } from "@/lib/utils";

/**
 * A card with a ripped-paper bottom edge, like a page torn from a
 * scrapbook. Wrap event cards, info panels, etc. in this.
 */
export function TornCard({
  className,
  children,
  rotate = 0,
  ...props
}: React.ComponentProps<"div"> & { rotate?: number }) {
  return (
    <div
      className={cn(
        "torn-edge-bottom paper-grain bg-card pb-6 shadow-[0_1px_2px_rgb(0_0_0_/_0.06),0_10px_20px_-8px_rgb(0_0_0_/_0.18)]",
        className
      )}
      style={rotate ? { transform: `rotate(${rotate}deg)` } : undefined}
      {...props}
    >
      {children}
    </div>
  );
}
