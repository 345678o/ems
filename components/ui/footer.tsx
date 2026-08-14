// app/components/Footer.tsx (or wherever you keep components)
"use client";

import Image from "next/image";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import {
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  Mail,
  Phone,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-black text-white font-figtree">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-10 md:gap-12 py-10">
          {/* Left: Logos */}
          <div className="flex flex-col items-start gap-6 shrink-0">
            <Image
              src="/logos/mlrit.svg"
              alt="MLRIT"
              width={160}
              height={64}
              className="h-auto w-36"
            />
            <Image
              src="/logos/iic.png"
              alt="Institution's Innovation Council"
              width={180}
              height={80}
              className="h-auto w-40"
            />
          </div>

          {/* Vertical Separator (shadcn) */}
          <Separator
            orientation="vertical"
            className="hidden md:block h-200 bg-white/10"
          />

          {/* Right: Link Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-3 w-full ml-[200px]">
            {/* Quick Links */}
            <div>
              <h3 className="text-4xl font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-3 list-disc marker:text-white/70 pl-5 text-xl">
                <li>
                  <Link
                    href="/"
                    className="hover:opacity-90 transition-opacity"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/events"
                    className="hover:opacity-90 transition-opacity"
                  >
                    Events
                  </Link>
                </li>
                <li>
                  <Link
                    href="/bookings"
                    className="hover:opacity-90 transition-opacity"
                  >
                    Bookings
                  </Link>
                </li>
              </ul>
            </div>

            {/* Socials */}
            <div>
              <h3 className="text-4xl font-semibold mb-4 ">Socials</h3>
              <ul className="space-y-3 text-xl">
                <li>
                  <a
                    href="https://www.instagram.com/mlritofficial?igsh=MXJnMnJlZGl4dHM3aw=="
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-3 hover:opacity-90 transition-opacity"
                  >
                    <Instagram className="size-5" aria-hidden="true" />
                    Instagram
                  </a>
                </li>
                <li>
                  <a
                    href="https://x.com/mlritin?s=09"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-3 hover:opacity-90 transition-opacity"
                  >
                    <Twitter className="size-5" aria-hidden="true" />
                    Twitter
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.linkedin.com/school/mlr-institute-of-technology/"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-3 hover:opacity-90 transition-opacity"
                  >
                    <Linkedin className="size-5" aria-hidden="true" />
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.youtube.com/@MLRInstituteofTechnology"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-3 hover:opacity-90 transition-opacity"
                  >
                    <Youtube className="size-5" aria-hidden="true" />
                    YouTube
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact Us */}
            <div className="-ml-6">
              <h3 className="text-4xl font-semibold mb-4">Contact Us</h3>
              <ul className="space-y-3 text-xl">
                <li className="inline-flex items-center gap-3">
                  <Phone className="size-5" aria-hidden="true" />
                  <a
                    href="tel:+919951312204"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:opacity-90 transition-opacity"
                  >
                    +91 99513 12204
                  </a>
                </li>
                <li className="inline-flex items-center gap-3">
                  <Mail className="size-5" aria-hidden="true" />
                  <a
                    href="mailto:ciemlrit@mlrit.ac.in"
                    className="hover:opacity-90 transition-opacity"
                  >
                    ciemlrit@mlrit.ac.in
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* subtle bottom line */}
        <div className="border-t border-white/10 py-6 text-sm text-white/70">
          <p>© {new Date().getFullYear()} CIE, MLRIT. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
