import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export interface GradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  innerClassName?: string;
}

/**
 * GradientButton
 *
 * A reusable gradient-border button that mirrors the styling used in TopBar.
 * Usage examples:
 *
 * <GradientButton onClick={() => signIn("google", { callbackUrl: "/home" })}>
 *   <span className="flex items-center">
 *     Login
 *     <MoveRight className="ml-1 h-4 w-4 transition-transform duration-200 ease-out group-hover:translate-x-2" />
 *   </span>
 * </GradientButton>
 *
 * // As link or custom element
 * <GradientButton asChild>
 *   <a href="/somewhere">Go</a>
 * </GradientButton>
 */
export const GradientButton = React.forwardRef<
  HTMLButtonElement,
  GradientButtonProps
>(function GradientButton(
  { asChild = false, className, innerClassName, children, style, ...props },
  ref
) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      ref={ref}
      className={cn(
        // No outer margins; behave like the base Button for layout
        "group inline-flex items-center rounded-sm bg-gradient-to-r from-[#FF8AC9] via-[#D96CE5] to-[#7B2FE5] p-1 shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500/40",
        className
      )}
      style={style}
      {...props}
    >
      <span
        className={cn(
          // Remove width constraints so it sizes like the base Button
          "flex items-center justify-center rounded-xs bg-white px-6 py-1 text-md font-light text-black dark:bg-[#1A1A1A] dark:text-white",
          innerClassName
        )}
      >
        {children}
      </span>
    </Comp>
  );
});

export default GradientButton;
