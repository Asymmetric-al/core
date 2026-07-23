import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vitest/config";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

/**
 * Workspaces whose tsconfig maps `@/*` to their own root (the repo
 * convention is `"@/*": ["./*"]`). There is no repo-root `src/`, so `@/`
 * has no single target; it must resolve against the workspace that contains
 * the importing file, mirroring per-workspace tsconfig `paths`.
 */
function findAtAliasWorkspaceRoots(): string[] {
  const workspaceRoots: string[] = [];

  for (const group of ["apps", "packages"]) {
    const groupDir = path.join(rootDir, group);
    for (const entry of fs.readdirSync(groupDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) {
        continue;
      }

      const workspaceDir = path.join(groupDir, entry.name);
      const tsconfigPath = path.join(workspaceDir, "tsconfig.json");
      if (!fs.existsSync(tsconfigPath)) {
        continue;
      }

      const tsconfig = fs.readFileSync(tsconfigPath, "utf8");
      if (tsconfig.includes('"@/*"')) {
        workspaceRoots.push(workspaceDir);
      }
    }
  }

  return workspaceRoots;
}

const atAliasWorkspaceRoots = findAtAliasWorkspaceRoots();

function findWorkspaceRootForImporter(importer: string): string | undefined {
  const [importerFsPath] = importer.split("?");
  if (!importerFsPath) {
    return undefined;
  }

  const normalizedImporter = path.normalize(importerFsPath);
  return atAliasWorkspaceRoots.find((workspaceRoot) => {
    const relative = path.relative(workspaceRoot, normalizedImporter);
    const isInsideWorkspace =
      relative !== "" &&
      !relative.startsWith("..") &&
      !path.isAbsolute(relative);
    return isInsideWorkspace;
  });
}

/**
 * Per-importer `@/` alias: `packages/ui` files resolve `@/x` to
 * `packages/ui/x`, `apps/donor` files to `apps/donor/x`, and so on. Files
 * outside an `@/`-mapped workspace (including test files) get no fallback and
 * fail loudly as an unresolved import.
 */
function perImporterAtAlias(): Plugin {
  return {
    name: "core:per-importer-at-alias",
    enforce: "pre",
    async resolveId(source, importer, options) {
      if (!source.startsWith("@/") || !importer) {
        return null;
      }

      const workspaceRoot = findWorkspaceRootForImporter(importer);
      if (!workspaceRoot) {
        return null;
      }

      const target = path.join(workspaceRoot, source.slice("@/".length));
      const resolved = await this.resolve(target, importer, {
        skipSelf: true,
        ...options,
      });
      return resolved ?? target;
    },
  };
}

export default defineConfig({
  plugins: [perImporterAtAlias(), react()],
  resolve: {
    alias: {
      /** Vitest runs in Node (a server context); the marker must not throw. */
      "server-only": path.join(rootDir, "tests/mocks/server-only.ts"),
      "@tiptap/react/menus": path.join(
        rootDir,
        "tests/mocks/tiptap-react-menus.tsx",
      ),
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
