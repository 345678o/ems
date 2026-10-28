"use client";

import { Suspense } from "react";
import AdminPage from "./admin-page";

export default function Admin() {
  // Access is checked by RoleGate in app/admin/layout.tsx.
  // useSearchParams (section from ?tab=) needs a Suspense boundary.
  return (
    <Suspense>
      <AdminPage />
    </Suspense>
  );
}
