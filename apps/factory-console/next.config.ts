import path from "node:path";

import type { NextConfig } from "next";

const config: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  transpilePackages: ["@asym/ui"],
  output: "standalone",
  outputFileTracingRoot: path.resolve(import.meta.dirname, "../.."),
  poweredByHeader: false,
  webpack(config, { dev }) {
    if (!dev) config.cache = false;
    config.resolve.modules = [
      path.resolve(import.meta.dirname, "node_modules"),
      ...(config.resolve.modules ?? []),
    ];
    return config;
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'none'; object-src 'none'; base-uri 'self'",
          },
        ],
      },
      {
        // Pages, the icon and every API answer are never stored. Hashed build
        // assets are left out so Next serves them `immutable`: over the
        // operator's tunnel a visit otherwise downloads the whole application
        // again.
        source: "/((?!_next/static/).*)",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
    ];
  },
};

export default config;
