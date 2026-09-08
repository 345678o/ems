import { cn } from "@/lib/utils";

/**
 * A card with a ripped-paper bottom edge, like a page torn from a
 * scrapbook. Wrap event cards, info panels, etc. in this.
 */
export function TornCard({
  className,
  children,
  rotate = 0,
  variant = "bottom",
  ...props
}: React.ComponentProps<"div"> & {
  rotate?: number;
  /** "bottom" rips only the lower edge; "both" rips top and bottom, for a
   * card that reads as a torn-off scrap rather than a page. */
  variant?: "bottom" | "both";
}) {
  return (
    <div
      className={cn(
        variant === "both" ? "torn-edge-both" : "torn-edge-bottom",
        "paper-grain bg-card pb-6 shadow-[0_1px_2px_rgb(0_0_0_/_0.06),0_10px_20px_-8px_rgb(0_0_0_/_0.18)]",
        variant === "both" && "pt-4",
        className
      )}
      style={rotate ? { transform: `rotate(${rotate}deg)` } : undefined}
      {...props}
    >
      {children}
    </div>
  );
}
