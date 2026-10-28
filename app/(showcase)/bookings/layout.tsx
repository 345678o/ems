import type React from "react";

export const metadata = {
  title: "My Bookings — EMS.MLRIT",
  description: "Events you registered for at MLRIT.",
};

export default function BookingsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
