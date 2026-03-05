import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const srcPath = fileURLToPath(new URL("./src", import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": srcPath,
    },
  },
  test: {
    include: ["tests/unit/**/*.test.ts", "tests/unit/**/*.test.tsx"],
    environment: "node",
    clearMocks: true,
    coverage: {
      provider: "custom",
      customProviderModule: "./vitest.coverage-provider.mjs",
      reportsDirectory: "coverage",
    },
  },
});
