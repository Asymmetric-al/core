import { withPayload } from "@payloadcms/next/withPayload";
import { withSentryConfig } from "@sentry/nextjs/config";
import { withEve } from "eve/next";

import { normalizeEveVercelEnvironment } from "./eve-runtime-environment";
import { legacyRedirects } from "./lib/legacy-redirects";
import { copyMaplibreWorkerAssetsForApp } from "../../scripts/copy-maplibre-worker-assets.mjs";
import { loadWorkspaceEnvironment } from "../../scripts/load-workspace-env.mjs";
import { migrationHeadsBuildEnv } from "../../scripts/release/migration-heads.mjs";
import { serveUnderPathsNextConfig } from "../../scripts/release/serve-under-paths.mjs";
import { resolveMonorepoRoot } from "../../scripts/resolve-monorepo-root.mjs";
import { buildSentryNextConfigOptions } from "../../scripts/sentry/next-config.mjs";

import type { NextConfig } from "next";

/** Load the repo-root `.env.local`; app-local files should be symlinks only when needed by external tooling. */
const WORKSPACE_ROOT = resolveMonorepoRoot(import.meta.url);
loadWorkspaceEnvironment(WORKSPACE_ROOT);
normalizeEveVercelEnvironment(process.env);
copyMaplibreWorkerAssetsForApp({
  workspaceRoot: WORKSPACE_ROOT,
  fromConfigUrl: import.meta.url,
});

/**
 * The two flags Instant Navigation needs are pinned in the type, not just set
 * in the literal: dropping either one, or flipping it to false, then fails
 * this app's typecheck instead of silently un-instanting every route.
 */
const underPaths = serveUnderPathsNextConfig("admin");

export const nextConfig: NextConfig & {
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
  /** Dev HMR when opening the app via `http://127.0.0.1:3030` instead of `localhost`. */
  allowedDevOrigins: ["127.0.0.1"],
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
  async redirects() {
    return underPaths.basePath ? [] : legacyRedirects;
  },
  ...(underPaths.basePath ? { skipTrailingSlashRedirect: true } : {}),
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
const sentryConfig = withSentryConfig(
  payloadConfig,
  buildSentryNextConfigOptions(),
);

export default withEve(sentryConfig, {
  eveRoot: `${WORKSPACE_ROOT}/packages/eve-runtime`,
  eveBuildCommand: "bun run build:service",
});
