import { loadEnvConfig } from "@next/env";

import { resolveMonorepoRoot } from "../../scripts/resolve-monorepo-root.mjs";

import type { NextConfig } from "next";

/** Load the repo-root `.env.local`; app-local files should be symlinks only when needed by external tooling. */
const WORKSPACE_ROOT = resolveMonorepoRoot(import.meta.url);
loadEnvConfig(WORKSPACE_ROOT);

/**
 * Paths relative to `turbopack.root` (monorepo root). Absolute filesystem paths
 * are mis-resolved by Turbopack as `./workspace/...` and break the donor build.
 */
const BONEYARD_JS_ALIAS = "apps/donor/node_modules/boneyard-js";
const BONEYARD_JS_REACT_ALIAS = `${BONEYARD_JS_ALIAS}/dist/react.js`;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  cacheComponents: true,
  reactCompiler: {
    compilationMode: "annotation",
  },
  turbopack: {
    root: WORKSPACE_ROOT,
    // Bun may hoist `boneyard-js` out of the repo-root `node_modules/` symlink; with
    // `turbopack.root` = monorepo root, bare `boneyard-js` imports from `apps/donor/bones`
    // otherwise fail to resolve. Pin to the workspace-linked copy under this app.
    resolveAlias: {
      "boneyard-js": BONEYARD_JS_ALIAS,
      "boneyard-js/react": BONEYARD_JS_REACT_ALIAS,
    },
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
      {
        protocol: "https",
        hostname: "cdn.shadcnstudio.com",
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com",
      },
      {
        protocol: "https",
        hostname: "www.transparenttextures.com",
      },
    ],
    qualities: [75, 85],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  compress: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
        ],
      },
      {
        source: "/:all*(svg|jpg|jpeg|png|gif|ico|webp|avif)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:all*(js|css)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:all*(woff|woff2|ttf|otf|eot)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/sitemap.xml",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=43200",
          },
        ],
      },
      {
        source: "/robots.txt",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=43200",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/home",
        destination: "/",
        permanent: true,
      },
      {
        source: "/missionaries",
        destination: "/workers",
        permanent: true,
      },
      {
        source: "/donate",
        destination: "/workers",
        permanent: true,
      },
      {
        source: "/give",
        destination: "/workers",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
