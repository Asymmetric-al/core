import { loadEnvConfig } from "@next/env";
import { withSentryConfig } from "@sentry/nextjs";

import { resolveMonorepoRoot } from "../../scripts/resolve-monorepo-root.mjs";
import { buildSentryNextConfigOptions } from "../../scripts/sentry/next-config.mjs";

import type { NextConfig } from "next";

const WORKSPACE_ROOT = resolveMonorepoRoot(import.meta.url);
loadEnvConfig(WORKSPACE_ROOT);

/**
 * The two flags Instant Navigation needs are pinned in the type, not just set
 * in the literal: dropping either one, or flipping it to false, then fails
 * this app's typecheck instead of silently un-instanting every route.
 */
const nextConfig: NextConfig & {
  cacheComponents: true;
  partialPrefetching: true;
} = {
  reactStrictMode: true,
  cacheComponents: true,
  partialPrefetching: true,
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
  experimental: {
    globalNotFound: true,
    viewTransition: true,
    optimizePackageImports: ["@asym/ui", "lucide-react"],
    /** Instant-navigation e2e rig only (see instant-nav.rig.md); preview deploys only. */
    exposeTestingApiInProductionBuild:
      process.env.EXPOSE_TESTING_API === "1" &&
      process.env.VERCEL_ENV === "preview",
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

export default withSentryConfig(nextConfig, buildSentryNextConfigOptions());
