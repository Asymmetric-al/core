import {
  mkdtemp,
  mkdir,
  rm,
  symlink,
  writeFile,
  copyFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { afterEach, describe, expect, it } from "vitest";

import { verifyDesignSystemHealth } from "../../../tooling/eslint-config/health.mjs";

const rootDir = fileURLToPath(new URL("../../../", import.meta.url));
const temporaryRoots: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryRoots
      .splice(0)
      .map((root) => rm(root, { recursive: true, force: true })),
  );
});

async function createFixture({
  brokenTheme = false,
  brokenButton = false,
  missingButton = false,
  disabledRule = false,
} = {}) {
  const fixtureRoot = await mkdtemp(
    path.join(os.tmpdir(), "core-design-system-health-"),
  );
  temporaryRoots.push(fixtureRoot);
  for (const directory of [
    "apps/donor/app",
    "apps/donor/components",
    "packages/ui/styles",
    "packages/ui/components/shadcn",
    "packages/ui/lib",
    "node_modules/@asym",
  ]) {
    await mkdir(path.join(fixtureRoot, directory), { recursive: true });
  }
  for (const relative of [
    "packages/ui/package.json",
    "packages/ui/components.json",
    "packages/ui/styles/globals.css",
    "packages/ui/components/shadcn/button.tsx",
    "packages/ui/lib/utils.ts",
  ]) {
    await copyFile(
      path.join(rootDir, relative),
      path.join(fixtureRoot, relative),
    );
  }
  await writeFile(
    path.join(fixtureRoot, "package.json"),
    JSON.stringify({
      private: true,
      type: "module",
      workspaces: ["apps/*", "packages/*"],
    }),
  );
  await writeFile(
    path.join(fixtureRoot, "apps/donor/package.json"),
    JSON.stringify({
      name: "@fixture/donor",
      private: true,
      type: "module",
      dependencies: { "@asym/ui": "workspace:*" },
    }),
  );
  for (const workspace of ["apps/donor", "packages/ui"]) {
    await writeFile(
      path.join(fixtureRoot, workspace, "tsconfig.json"),
      JSON.stringify({
        compilerOptions: {
          jsx: "react-jsx",
          baseUrl: ".",
          paths: { "@/*": ["./*"] },
        },
        include: ["**/*.tsx"],
      }),
    );
  }
  await symlink(
    path.join(fixtureRoot, "packages/ui"),
    path.join(fixtureRoot, "node_modules/@asym/ui"),
    "junction",
  );
  await symlink(
    path.join(rootDir, "packages/ui/node_modules"),
    path.join(fixtureRoot, "packages/ui/node_modules"),
    "junction",
  );
  for (const name of ["tailwindcss", "@tailwindcss", "tw-animate-css"]) {
    await symlink(
      path.join(rootDir, "node_modules", name),
      path.join(fixtureRoot, "node_modules", name),
      "junction",
    );
  }
  await writeFile(
    path.join(fixtureRoot, "apps/donor/app/globals.css"),
    brokenTheme
      ? '@import "./missing-core-theme.css";\n'
      : '@import "@asym/ui/styles/globals.css";\n',
  );
  if (brokenButton) {
    await writeFile(
      path.join(fixtureRoot, "packages/ui/components/shadcn/button.tsx"),
      'export const Button = "button";\n',
    );
  }
  if (missingButton) {
    await rm(
      path.join(fixtureRoot, "packages/ui/components/shadcn/button.tsx"),
    );
  }
  const moduleUrl = pathToFileURL(
    path.join(rootDir, "tooling/eslint-config/design-system.mjs"),
  ).href;
  const baseUrl = pathToFileURL(
    path.join(rootDir, "tooling/eslint-config/library.mjs"),
  ).href;
  const config = `import { libraryConfig } from ${JSON.stringify(baseUrl)};
import { designSystemConfig } from ${JSON.stringify(moduleUrl)};
export default [...libraryConfig, ...designSystemConfig({ workspace: "apps/donor", rootDir: ${JSON.stringify(fixtureRoot)} })${disabledRule ? ', { rules: { "shadcn/no-restyle": "warn" } }' : ""}];\n`;
  await writeFile(
    path.join(fixtureRoot, "apps/donor/eslint.config.mjs"),
    config,
  );
  return fixtureRoot;
}

describe("design-system health", () => {
  it("proves discovery and all six blocking rules through actual root configuration", async () => {
    const result = await verifyDesignSystemHealth({ rootDir });
    expect(
      result.workspaces.map((entry: { workspace: string }) => entry.workspace),
    ).toEqual([
      "apps/admin",
      "apps/donor",
      "apps/missionary",
      "packages/ui",
      "packages/missionary",
    ]);
  }, 120_000);

  it.each([
    "apps/admin",
    "apps/donor",
    "apps/missionary",
    "packages/ui",
    "packages/missionary",
  ])(
    "proves discovery through %s's own configuration",
    async (workspace) => {
      const result = await verifyDesignSystemHealth({ rootDir, workspace });
      expect(result.workspaces).toHaveLength(1);
      expect(result.workspaces[0].workspace).toBe(workspace);
    },
    120_000,
  );

  it("uses an isolated copy of real components and the exported Core policy", async () => {
    const fixtureRoot = await createFixture();
    await expect(
      verifyDesignSystemHealth({
        rootDir: fixtureRoot,
        workspace: "apps/donor",
      }),
    ).resolves.toMatchObject({
      workspaces: [{ workspace: "apps/donor" }],
    });
  }, 120_000);

  it("rejects a missing theme import instead of accepting fallback analysis", async () => {
    const fixtureRoot = await createFixture({ brokenTheme: true });
    await expect(
      verifyDesignSystemHealth({
        rootDir: fixtureRoot,
        workspace: "apps/donor",
      }),
    ).rejects.toThrow(
      /design-system health.*apps\/donor.*(theme|Tailwind|semantic)/i,
    );
  }, 120_000);

  it("rejects unresolved primitive definitions even if the import is recognized", async () => {
    const fixtureRoot = await createFixture({ brokenButton: true });
    await expect(
      verifyDesignSystemHealth({
        rootDir: fixtureRoot,
        workspace: "apps/donor",
      }),
    ).rejects.toThrow(
      /design-system health.*apps\/donor.*(Button|definition)/i,
    );
  }, 120_000);

  it("rejects a missing primitive import instead of trusting a familiar name", async () => {
    const fixtureRoot = await createFixture({ missingButton: true });
    await expect(
      verifyDesignSystemHealth({
        rootDir: fixtureRoot,
        workspace: "apps/donor",
      }),
    ).rejects.toThrow(
      /design-system health.*apps\/donor.*(Button|definition)/i,
    );
  }, 120_000);

  it("rejects a later config entry that weakens a rule", async () => {
    const fixtureRoot = await createFixture({ disabledRule: true });
    await expect(
      verifyDesignSystemHealth({
        rootDir: fixtureRoot,
        workspace: "apps/donor",
      }),
    ).rejects.toThrow(/shadcn\/no-restyle.*error/i);
  });

  it("rejects unsupported workspace names", async () => {
    await expect(
      verifyDesignSystemHealth({ rootDir, workspace: "../elsewhere" }),
    ).rejects.toThrow(/unsupported.*workspace/i);
  });
});
