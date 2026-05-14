import { loadEnvConfig } from "@next/env";
import { withSentryConfig } from "@sentry/nextjs";

import { resolveMonorepoRoot } from "../../scripts/resolve-monorepo-root.mjs";

import type { NextConfig } from "next";

const WORKSPACE_ROOT = resolveMonorepoRoot(import.meta.url);
loadEnvConfig(WORKSPACE_ROOT);

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
    globalNotFound: true,
    viewTransition: true,
    optimizePackageImports: ["@asym/ui", "lucide-react"],
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

export default withSentryConfig(nextConfig, {
  authToken: process.env.SENTRY_AUTH_TOKEN,
  org: "asymmetrical-4w",
  project: "javascript-nextjs",
  silent: !process.env.CI,
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },
  widenClientFileUpload: Boolean(process.env.SENTRY_AUTH_TOKEN),
  webpack: {
    treeshake: {
      removeDebugLogging: true,
    },
  },
});
