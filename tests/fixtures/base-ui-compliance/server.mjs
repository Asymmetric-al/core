import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import tailwind from "@tailwindcss/postcss";
import react from "@vitejs/plugin-react";

const fixtureDirectory = fileURLToPath(new URL(".", import.meta.url));
const repositoryRoot = resolve(fixtureDirectory, "../../..");
const outputDirectory = resolve(
  repositoryRoot,
  "test-results/base-ui-compliance/assets",
);
const cssPath = resolve(repositoryRoot, "packages/ui/styles/globals.css");
const compiledCssPath = resolve(outputDirectory, "globals.css");
// Use the repository's installed dependency graph without adding another Vite or PostCSS version.
const vitestRequire = createRequire(import.meta.resolve("vitest"));
const { build, preview } = await import(vitestRequire.resolve("vite"));
const postcssRequire = createRequire(
  import.meta.resolve("@tailwindcss/postcss"),
);
const { default: postcss } = await import(postcssRequire.resolve("postcss"));
await mkdir(outputDirectory, { recursive: true });
const compiled = await postcss([tailwind()]).process(
  await readFile(cssPath, "utf8"),
  { from: cssPath },
);
await writeFile(compiledCssPath, compiled.css);

const buildDirectory = resolve(outputDirectory, "dist");
await build({
  configFile: false,
  envFile: false,
  root: fixtureDirectory,
  cacheDir: resolve(outputDirectory, "vite-cache"),
  plugins: [
    {
      name: "base-ui-compliance-boundaries",
      enforce: "pre",
      resolveId(source, importer) {
        if (source === "virtual:base-ui-styles") return compiledCssPath;
        if (
          source === "@asym/lib/view-transitions" &&
          importer?.replaceAll("\\", "/").endsWith("/primitives/page-shell.tsx")
        ) {
          return resolve(fixtureDirectory, "support-navigation-stub.ts");
        }
        if (
          source === "@asym/api/admin/support/loaders" &&
          importer?.replaceAll("\\", "/").endsWith("/support/tickets/page.tsx")
        ) {
          return resolve(fixtureDirectory, "support-loader-stub.ts");
        }
        // This real form's mutation stub records the submitted
        // value for assertions without issuing a request to an application API.
        if (
          source === "../../hooks/use-support-mutations" &&
          importer?.replaceAll("\\", "/").endsWith("/labels/LabelForm.tsx")
        ) {
          return resolve(fixtureDirectory, "label-mutation-stub.ts");
        }
      },
    },
    react(),
  ],
  resolve: {
    alias: { "@": resolve(repositoryRoot, "packages/ui") },
    dedupe: ["react", "react-dom"],
  },
  css: { postcss: { plugins: [] } },
  logLevel: "warn",
  build: {
    outDir: buildDirectory,
    emptyOutDir: true,
    target: "esnext",
    rollupOptions: {
      input: {
        main: resolve(fixtureDirectory, "index.html"),
        support: resolve(fixtureDirectory, "support.html"),
      },
      onwarn(warning, warn) {
        // Every imported component runs in this client-only fixture. Rollup can
        // safely omit Next's module boundary directive, while other warnings remain visible.
        if (
          warning.code === "MODULE_LEVEL_DIRECTIVE" &&
          warning.message.includes('"use client"')
        )
          return;
        warn(warning);
      },
    },
  },
});
// Serve only the completed bundle: a fresh run cannot race dev dependency
// optimization or reload another test's page when a dependency is discovered.
const server = await preview({
  configFile: false,
  envFile: false,
  root: fixtureDirectory,
  build: { outDir: buildDirectory },
  preview: { host: "127.0.0.1", port: 5198, strictPort: true },
});
console.log("Base UI compliance fixture: http://127.0.0.1:5198");
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, async () => {
    await new Promise((resolveClose) => server.httpServer.close(resolveClose));
    process.exit(0);
  });
}
