import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@asym/ui",
    "@asym/database",
    "@asym/lib",
    "@asym/config",
    "@asym/auth",
    "@asym/email",
  ],
  experimental: {
    optimizePackageImports: [
      "@asym/ui",
      "lucide-react",
      "@radix-ui/react-icons",
    ],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },
};

export default nextConfig;

