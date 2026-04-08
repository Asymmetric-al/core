import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const srcPath = fileURLToPath(new URL("./src", import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": srcPath,
    },
  },
  test: {
    include: [
      "tests/unit/**/*.test.ts",
      "tests/unit/**/*.test.tsx",
      "packages/api/tests/unit/**/*.test.ts",
      "packages/api/tests/unit/**/*.test.tsx",
    ],
    environment: "node",
    clearMocks: true,
    coverage: {
      provider: "custom",
      customProviderModule: "./vitest.coverage-provider.mjs",
      reportsDirectory: "coverage",
    },
  },
});
