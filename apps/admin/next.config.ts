import { fileURLToPath } from "node:url";

import { withPayload } from "@payloadcms/next/withPayload";

import type { NextConfig } from "next";

const WORKSPACE_ROOT = fileURLToPath(new URL("../..", import.meta.url));

const nextConfig: NextConfig = {
  reactStrictMode: true,
  cacheComponents: true,
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
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      ".cjs": [".cts", ".cjs"],
      ".js": [".ts", ".tsx", ".js", ".jsx"],
      ".mjs": [".mts", ".mjs"],
    };

    return webpackConfig;
  },
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
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default withPayload(nextConfig, { devBundleServerPackages: false });
