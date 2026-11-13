import { realpathSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

import { pinWorkspacePackages } from "../../../../../../../../vitest.pin-workspace-packages.mts";

const ownedDirectory = fileURLToPath(new URL(".", import.meta.url));
const rootDirectory = realpathSync(process.cwd());
const expectedDirectory = "C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12";

if (rootDirectory.replaceAll("\\", "/") !== expectedDirectory) {
  throw new Error(
    "Run this bounded reproduction only from the frozen r12 checkout.",
  );
}

export default defineConfig({
  root: rootDirectory,
  envDir: false,
  cacheDir: path.join(ownedDirectory, "vite-cache"),
  plugins: [pinWorkspacePackages(rootDirectory), react()],
  resolve: { dedupe: ["react", "react-dom"] },
  test: {
    include: [
      path
        .relative(
          rootDirectory,
          path.join(ownedDirectory, "grid-rebinding.test.tsx"),
        )
        .replaceAll("\\", "/"),
    ],
    environment: "jsdom",
    pool: "threads",
    maxWorkers: 1,
    fileParallelism: false,
    testTimeout: 10_000,
    hookTimeout: 10_000,
    clearMocks: true,
    coverage: { enabled: false },
  },
});
