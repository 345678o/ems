import { cn } from "@/lib/utils";

type ScribbleProps = React.SVGProps<SVGSVGElement>;

/** Hand-drawn 4-point sparkle/star, used as a decorative scrapbook accent. */
export function ScribbleStar({ className, ...props }: ScribbleProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={cn("h-5 w-5", className)}
      {...props}
    >
      <path
        d="M12 2 C12.5 8 13.8 10.2 21 12 C13.8 13.8 12.5 16 12 22 C11.5 16 10.2 13.8 3 12 C10.2 10.2 11.5 8 12 2Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Loose, hand-sketched arrow — for pointing at a nearby element. */
export function ScribbleArrow({ className, ...props }: ScribbleProps) {
  return (
    <svg
      viewBox="0 0 60 40"
      fill="none"
      className={cn("h-8 w-12", className)}
      {...props}
    >
      <path
        d="M2 32C16 10 34 4 56 10"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M44 5C48 7 52 9 56 10C53 12 49 15 47 20"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Wobbly marker underline, meant to sit just beneath a headline word. */
export function ScribbleUnderline({ className, ...props }: ScribbleProps) {
  return (
    <svg
      viewBox="0 0 200 16"
      fill="none"
      preserveAspectRatio="none"
      className={cn("h-3 w-full", className)}
      {...props}
    >
      <path
        d="M2 10C40 3 90 2 130 6C155 8.5 175 6 198 9"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
      />
    </svg>
  );
}
