import type React from "react";
import type { Metadata } from "next";
import { GeistMono } from "geist/font/mono";
import { DM_Sans, Space_Grotesk, Big_Shoulders, Caveat } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import Footer from "@/components/ui/footer";

export const metadata: Metadata = {
  title: "Club Event Dashboard",
  description: "Event management dashboard",
  generator: "v0.app",
};

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

const bigShouldersDisplay = Big_Shoulders({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-big-shoulders",
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-caveat",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme');
                const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (theme === 'dark' || (!theme && systemDark)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className={`font-sans ${GeistMono.variable} ${dmSans.variable} ${spaceGrotesk.variable} ${bigShouldersDisplay.variable} ${caveat.variable} ${dmSans.className}`}
      >
        <Providers>
          {/* Spacer to offset the fixed top bar height */}
          <main className="min-h-screen bg-background text-foreground">
            {children}
          </main>
        </Providers>
        <Footer />
      </body>
    </html>
  );
}
