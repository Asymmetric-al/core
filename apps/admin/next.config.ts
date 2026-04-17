import { fileURLToPath } from "node:url";

import { withPayload } from "@payloadcms/next/withPayload";

import type { NextConfig } from "next";

const WORKSPACE_ROOT = fileURLToPath(new URL("../..", import.meta.url));

const nextConfig: NextConfig = {
  reactStrictMode: true,
  cacheComponents: true,
  async redirects() {
    return [
      { source: "/mc", destination: "/", permanent: false },
      { source: "/mc/", destination: "/", permanent: false },
      { source: "/mc/:path*", destination: "/:path*", permanent: false },
    ];
  },
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
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      ".cjs": [".cts", ".cjs"],
      ".js": [".ts", ".tsx", ".js", ".jsx"],
      ".mjs": [".mts", ".mjs"],
    };

    return webpackConfig;
  },
  experimental: {
    viewTransition: true,
    optimizePackageImports: ["@asym/ui", "lucide-react"],
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
