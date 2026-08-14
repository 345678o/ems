import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Figtree } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import Footer from "@/components/ui/footer";

export const metadata: Metadata = {
  title: "Club Event Dashboard",
  description: "Event management dashboard",
  generator: "v0.app",
};

const figtree = Figtree({
  subsets: ["latin"],
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
        className={`font-sans ${GeistSans.variable} ${GeistMono.variable} ${figtree.className}`}
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
