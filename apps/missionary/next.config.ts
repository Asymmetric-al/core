import { fileURLToPath } from "node:url";

import type { NextConfig } from "next";

const WORKSPACE_ROOT = fileURLToPath(new URL("../..", import.meta.url));

const nextConfig: NextConfig = {
  reactStrictMode: true,
  cacheComponents: true,
  reactCompiler: {
    compilationMode: "annotation",
  },
  turbopack: {
    root: WORKSPACE_ROOT,
  },
  transpilePackages: [
    "@asym/api",
    "@asym/ui",
    "@asym/database",
    "@asym/lib",
    "@asym/config",
    "@asym/auth",
    "@asym/email",
  ],
  experimental: {
    viewTransition: true,
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
        hostname: "images.unsplash.com",
      },
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
