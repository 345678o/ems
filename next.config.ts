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
  // ✅ Fix turbopack root detection with multiple lockfiles
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
