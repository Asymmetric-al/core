import { withSentryConfig } from "@sentry/nextjs/config";

import { legacyRedirects } from "./lib/legacy-redirects";
import { loadWorkspaceEnvironment } from "../../scripts/load-workspace-env.mjs";
import { migrationHeadsBuildEnv } from "../../scripts/release/migration-heads.mjs";
import { serveUnderPathsNextConfig } from "../../scripts/release/serve-under-paths.mjs";
import { resolveMonorepoRoot } from "../../scripts/resolve-monorepo-root.mjs";
import { buildSentryNextConfigOptions } from "../../scripts/sentry/next-config.mjs";

import type { NextConfig } from "next";

const WORKSPACE_ROOT = resolveMonorepoRoot(import.meta.url);
loadWorkspaceEnvironment(WORKSPACE_ROOT);

/**
 * The two flags Instant Navigation needs are pinned in the type, not just set
 * in the literal: dropping either one, or flipping it to false, then fails
 * this app's typecheck instead of silently un-instanting every route.
 */
const underPaths = serveUnderPathsNextConfig("missionary");

const nextConfig: NextConfig & {
  cacheComponents: true;
  partialPrefetching: true;
} = {
  reactStrictMode: true,
  ...(underPaths.basePath ? { basePath: underPaths.basePath } : {}),
  // Each build carries the migration heads it was built against, for
  // /api/health/migrations (scripts/release/migration-heads.mjs).
  env: {
    ...migrationHeadsBuildEnv(WORKSPACE_ROOT),
    ...underPaths.env,
  },
  cacheComponents: true,
  partialPrefetching: true,
  async headers() {
    const protectedActionHeaders = [
      {
        key: "Cache-Control",
        value: "private, no-store, no-transform, max-age=0",
      },
      { key: "CDN-Cache-Control", value: "no-store" },
      { key: "Vercel-CDN-Cache-Control", value: "no-store" },
      { key: "Referrer-Policy", value: "no-referrer" },
    ];
    return [
      { source: "/invite", headers: protectedActionHeaders },
      { source: "/invite/:path*", headers: protectedActionHeaders },
    ];
  },
  // Retired addresses answer a real 308 before the proxy runs (council
  // round 1, A11; lib/legacy-redirects.ts).
  async redirects() {
    return legacyRedirects;
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
  experimental: {
    agentUpgrade: "latest",
    globalNotFound: true,
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
