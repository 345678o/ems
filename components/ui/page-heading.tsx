import * as React from "react";

import { cn } from "@/lib/utils";

type PageHeadingProps = Omit<React.ComponentProps<"div">, "title"> & {
  title: React.ReactNode;
  eyebrow?: React.ReactNode;
  description?: React.ReactNode;
  /** Buttons / toggles shown at the right of the heading (wraps on phones). */
  actions?: React.ReactNode;
};

function PageHeading({
  title,
  eyebrow,
  description,
  actions,
  className,
  ...props
}: PageHeadingProps) {
  return (
    <div
      data-slot="page-heading"
      className={cn(
        "flex flex-wrap items-center justify-between gap-x-4 gap-y-3",
        className
      )}
      {...props}
    >
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-ui text-faint mb-1">{eyebrow}</p>
        ) : null}
        <h1 className="text-page-title font-semibold tracking-tight">
          {title}
        </h1>
        {description ? (
          <p className="text-ui text-muted-foreground mt-1">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-3">{actions}</div>
      ) : null}
    </div>
  );
}

export { PageHeading };
