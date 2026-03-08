import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

const adminAppPath = fileURLToPath(new URL("./apps/admin", import.meta.url));
const uiPkgPath = fileURLToPath(new URL("./packages/ui", import.meta.url));
const reactPath = fileURLToPath(
  new URL("./node_modules/react", import.meta.url),
);
const reactDomPath = fileURLToPath(
  new URL("./node_modules/react-dom", import.meta.url),
);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      // Deduplicate React — force all imports to the root copy to prevent
      // "Invalid hook call" errors from multiple-React-copies in a monorepo.
      { find: /^react$/, replacement: reactPath },
      { find: /^react-dom$/, replacement: reactDomPath },
      {
        find: /^react\/jsx-runtime$/,
        replacement: `${reactPath}/jsx-runtime`,
      },
      {
        find: /^react\/jsx-dev-runtime$/,
        replacement: `${reactPath}/jsx-dev-runtime`,
      },
      // Admin app's "@/" alias — resolves internal "@/" imports inside admin
      // source files that are loaded transitively by the DOM tests.
      { find: /^@\//, replacement: `${adminAppPath}/` },
      // @asym/ui deep imports resolved to package source files directly so
      // Vite can transform them without relying on workspace symlinks.
      {
        find: /^@asym\/ui\/lib\/utils$/,
        replacement: `${uiPkgPath}/lib/utils.ts`,
      },
      {
        find: /^@asym\/ui\/components\/shadcn\/badge$/,
        replacement: `${uiPkgPath}/components/shadcn/badge.tsx`,
      },
      {
        find: /^@asym\/ui\/components\/shadcn\/separator$/,
        replacement: `${uiPkgPath}/components/shadcn/separator.tsx`,
      },
    ],
  },
  test: {
    include: ["tests/unit/**/*.test.ts", "tests/unit/**/*.test.tsx"],
    environment: "node",
    setupFiles: ["./tests/setup.ts"],
    clearMocks: true,
    coverage: {
      provider: "custom",
      customProviderModule: "./vitest.coverage-provider.mjs",
      reportsDirectory: "coverage",
    },
  },
});
