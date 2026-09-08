/**
 * lib/utils.ts
 *
 * Common styling and class name utility. Combines `clsx` and `tailwind-merge` (`cn`) to
 * conditionally join and deduplicate Tailwind CSS classes across components.
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
