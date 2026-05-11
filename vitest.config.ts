import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const rootDir = fileURLToPath(new URL(".", import.meta.url));
const srcPath = fileURLToPath(new URL("./src", import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": srcPath,
      "@tiptap/react/menus": path.join(
        rootDir,
        "tests/mocks/tiptap-react-menus.tsx",
      ),
      /** Tests live outside `packages/ui`; pin Sonner so `vi.mock('sonner')` patches the same module as `@asym/ui`. */
      sonner: path.join(rootDir, "packages/ui/node_modules/sonner"),
    },
  },
  test: {
    setupFiles: ["./tests/setup/unit-env.ts"],
    include: [
      "tests/unit/**/*.test.ts",
      "tests/unit/**/*.test.tsx",
      "packages/api/tests/unit/**/*.test.ts",
      "packages/api/tests/unit/**/*.test.tsx",
      "packages/auth/**/*.test.ts",
    ],
    environment: "node",
    clearMocks: true,
    /** TipTap React ships ESM subpaths; inline so `vi.mock` replaces the same module graph under coverage. */
    server: {
      deps: {
        inline: ["@tiptap/react", "@tiptap/react/menus", "sonner"],
      },
    },
    coverage: {
      provider: "custom",
      customProviderModule: "./vitest.coverage-provider.mjs",
      reportsDirectory: "coverage",
    },
  },
});
