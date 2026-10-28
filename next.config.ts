import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ Skip ESLint during `next build`
  eslint: {
    ignoreDuringBuilds: true,
  },
  // ✅ Skip TypeScript type checking during `next build`
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: [
      "source.unsplash.com",
      "images.unsplash.com",
      "hxcygmrgqrfjoggeuwnw.supabase.co",
    ],
  },
  // /discover is the main landing UI; the old /home page is kept in the
  // repo but every link and auth redirect that targets /home lands here.
  async redirects() {
    return [
      { source: "/home", destination: "/discover", permanent: false },
      // The profile's old "My Bookings" tab showed sample tickets; real
      // bookings live on /bookings now.
      {
        source: "/user/profile",
        has: [{ type: "query", key: "tab", value: "my-bookings" }],
        destination: "/bookings",
        permanent: false,
      },
    ];
  },
  // ✅ Fix turbopack root detection with multiple lockfiles
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
