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
      /** Vitest runs in Node (a server context); the marker must not throw. */
      "server-only": path.join(rootDir, "tests/mocks/server-only.ts"),
      "@tiptap/react/menus": path.join(
        rootDir,
        "tests/mocks/tiptap-react-menus.tsx",
      ),
      /** Bun's isolated store can split `next` into per-peer-set copies (root vs apps); pin one instance so `vi.mock("next/navigation")` patches the same module the app code under test imports. */
      next: path.join(rootDir, "node_modules/next"),
      /** Tests live outside `packages/ui`; pin Sonner so `vi.mock('sonner')` patches the same module as `@asym/ui`. */
      sonner: path.join(rootDir, "packages/ui/node_modules/sonner"),
      /** Tests live outside `packages/database`; pin the Supabase adapter so `vi.mock("@supabase-labs/tanstack-db")` patches the same module as `@asym/database`. */
      "@supabase-labs/tanstack-db": path.join(
        rootDir,
        "packages/database/node_modules/@supabase-labs/tanstack-db",
      ),
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
    ...(process.platform === "win32" ? { maxWorkers: 4 } : {}),
    env: {
      SKIP_ENV_VALIDATION: "1",
      NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "test-anon-key",
    },
    testTimeout: 20_000,
    hookTimeout: 120_000,
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
