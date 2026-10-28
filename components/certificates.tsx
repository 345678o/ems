import Link from "next/link";
import { Award } from "lucide-react";
import { EmptyState } from "@/components/discover/LoadStates";

/**
 * Certificates section of the profile. There is no certificates table or
 * issuing flow in the backend yet, so this shows an honest empty state
 * instead of the demo cards it used to render.
 */
export default function Certificates() {
  return (
    <EmptyState
      icon={<Award className="size-5" aria-hidden />}
      title="No certificates yet"
      message="Certificates aren't issued through EMS yet. When clubs start issuing them for events you attend, they'll appear here."
      action={
        <Link href="/bookings" className="dz-btn dz-btn--ghost">
          View my bookings
        </Link>
      }
    />
  );
}
