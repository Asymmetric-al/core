import { loadEnvConfig } from "@next/env";
import { withPayload } from "@payloadcms/next/withPayload";
import { withSentryConfig } from "@sentry/nextjs";

import { resolveMonorepoRoot } from "../../scripts/resolve-monorepo-root.mjs";
import { buildSentryNextConfigOptions } from "../../scripts/sentry/next-config.mjs";

import type { NextConfig } from "next";

/** Load the repo-root `.env.local`; app-local files should be symlinks only when needed by external tooling. */
const WORKSPACE_ROOT = resolveMonorepoRoot(import.meta.url);
loadEnvConfig(WORKSPACE_ROOT);

const nextConfig: NextConfig = {
  reactStrictMode: true,
  /** Dev HMR when opening the app via `http://127.0.0.1:3030` instead of `localhost`. */
  allowedDevOrigins: ["127.0.0.1"],
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
    "@asym/mock-data",
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
    globalNotFound: true,
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

const payloadConfig = withPayload(nextConfig, {
  devBundleServerPackages: false,
});

export default withSentryConfig(payloadConfig, buildSentryNextConfigOptions());
