import { createRequire } from "node:module";
import path from "node:path";

const root = process.cwd();
const require = createRequire(path.join(root, "apps/donor/package.json"));
const imageComponent = require.resolve("next/dist/client/image-component");
const result = await Bun.build({
  entrypoints: ["tests/e2e/fixtures/donor-wallet.tsx"],
  outdir: path.dirname(process.argv[2]),
  naming: path.basename(process.argv[2]),
  target: "browser",
  format: "iife",
  define: {
    "process.env.NODE_ENV": '"production"',
    "process.env.__NEXT_IMAGE_OPTS": JSON.stringify({
      unoptimized: true,
      deviceSizes: [640, 750, 1080],
      imageSizes: [32, 64],
      loader: "default",
      path: "/_next/image",
      domains: [],
      remotePatterns: [],
    }),
  },
  plugins: [
    {
      name: "wallet-fixture-boundaries",
      setup(builder) {
        builder.onResolve({ filter: /^@asym\/env$/ }, () => ({
          path: "environment",
          namespace: "wallet-fixture",
        }));
        builder.onResolve({ filter: /^next\/image$/ }, () => ({
          path: "image",
          namespace: "wallet-fixture",
        }));
        builder.onLoad(
          { filter: /.*/, namespace: "wallet-fixture" },
          ({ path: boundary }) => ({
            // Keep the actual Next Image; adapt its package export for Bun.
            // The route uses an in-memory model, not a payment provider.
            contents:
              boundary === "image"
                ? `import { Image } from ${JSON.stringify(imageComponent)}; export default Image;`
                : "export const clientEnv = { NEXT_PUBLIC_VIEW_TRANSITIONS_ENABLED: false };",
            loader: "js",
          }),
        );
      },
    },
  ],
});
if (!result.success) throw new Error(result.logs.map(String).join("\n"));
