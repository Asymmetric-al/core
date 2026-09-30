import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";
import { createViteServer } from "vitest/node";

import {
  discoverWorkspacePackages,
  findWorkspacePackage,
  pinWorkspacePackages,
} from "../../vitest.pin-workspace-packages";

const repoRoot = fileURLToPath(new URL("../..", import.meta.url));

describe("pinWorkspacePackages", () => {
  it("discovers @asym/database and @asym/auth in this checkout", () => {
    const names = discoverWorkspacePackages(repoRoot).map((pkg) => pkg.name);

    expect(names).toEqual(
      expect.arrayContaining(["@asym/database", "@asym/auth", "@asym/api"]),
    );
  });

  it("resolves Support Hub schema and admin client to this checkout", async () => {
    const server = await createViteServer({
      configFile: false,
      root: repoRoot,
      plugins: [pinWorkspacePackages(repoRoot)],
      server: { middlewareMode: true, watch: null, ws: false },
      ssr: { noExternal: true },
      optimizeDeps: { noDiscovery: true, include: [] },
    });
    try {
      for (const [source, relativePath] of [
        [
          "@asym/database/collections/support-hub.schema",
          "packages/database/collections/support-hub.schema.ts",
        ],
        [
          "@asym/database/supabase/admin",
          "packages/database/supabase/admin.ts",
        ],
        ["@asym/auth/context", "packages/auth/context.ts"],
      ]) {
        const resolved =
          await server.environments.ssr.pluginContainer.resolveId(
            source,
            path.join(repoRoot, "entry.js"),
          );
        expect(resolved?.id).toBe(path.join(repoRoot, relativePath));
      }
    } finally {
      await server.close();
    }
  });

  it("prefers the longer package name so missionary-app is not missionary", () => {
    const packages = discoverWorkspacePackages(repoRoot);
    const match = findWorkspacePackage(packages, "@asym/missionary-app/foo");

    expect(match?.pkg.name).toBe("@asym/missionary-app");
    expect(match?.subpath).toBe("foo");
  });
});

describe("workspace package export boundaries", () => {
  it("matches Node for public and private subpaths in an explicit export map", async () => {
    const root = mkdtempSync(path.join(tmpdir(), "workspace-exports-"));
    const dir = path.join(root, "packages", "fixture");
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      path.join(dir, "package.json"),
      JSON.stringify({
        name: "@asym/fixture",
        type: "module",
        exports: { "./public": "./public.js" },
      }),
    );
    writeFileSync(
      path.join(dir, "public.js"),
      "export const value = 'public';",
    );
    writeFileSync(
      path.join(dir, "private.js"),
      "export const value = 'private';",
    );
    const require = createRequire(path.join(dir, "package.json"));
    const server = await createViteServer({
      configFile: false,
      root,
      plugins: [pinWorkspacePackages(root)],
      server: { middlewareMode: true, watch: null, ws: false },
      ssr: { noExternal: true },
      optimizeDeps: { noDiscovery: true, include: [] },
    });
    try {
      expect(require.resolve("@asym/fixture/public")).toBe(
        path.join(dir, "public.js"),
      );
      expect(() => require.resolve("@asym/fixture/private")).toThrow(
        /not defined by "exports"/,
      );
      const resolve = (source: string) =>
        server.environments.ssr.pluginContainer.resolveId(
          source,
          path.join(root, "entry.js"),
        );
      expect((await resolve("@asym/fixture/public"))?.id).toBe(
        path.join(dir, "public.js"),
      );
      await expect(resolve("@asym/fixture/private")).rejects.toThrow();
    } finally {
      await server.close();
      rmSync(root, { recursive: true, force: true });
    }
  });
});

const exportCases = [
  {
    label: "conditional import instead of types or require targets",
    exports: {
      "./entry": {
        types: "./types.d.ts",
        require: "./require.js",
        import: "./import.js",
        default: "./default.js",
      },
    },
    subpath: "entry",
    expected: "import.js",
  },
  {
    label: "declared wildcard mapping to a different directory",
    exports: { "./features/*": "./source/*.js" },
    subpath: "features/public",
    expected: "source/public.js",
  },
  {
    label: "explicit denial overriding a wildcard",
    exports: { "./*": "./*.js", "./private": null },
    subpath: "private",
    expected: null,
  },
  {
    label: "wildcard denial overriding a broader wildcard",
    exports: { "./*": "./*.js", "./private/*": null },
    subpath: "private/secret",
    expected: null,
  },
  {
    label: "missing mapped target despite an existing private subpath file",
    exports: { "./private": "./absent.js" },
    subpath: "private",
    expected: null,
  },
  {
    label: "empty exports object",
    exports: {},
    subpath: "private",
    expected: null,
  },
  {
    label: "conditional-only package root",
    exports: { import: "./import.js", default: "./default.js" },
    subpath: "",
    expected: "import.js",
  },
  {
    label: "package without exports retaining filesystem lookup",
    exports: undefined,
    subpath: "private.js",
    expected: "private.js",
  },
] as const;

it.each(exportCases)(
  "preserves $label",
  async ({ exports, subpath, expected }) => {
    const root = mkdtempSync(path.join(tmpdir(), "workspace-exports-"));
    const dir = path.join(root, "packages", "fixture");
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      path.join(dir, "package.json"),
      JSON.stringify({ name: "@asym/fixture", type: "module", exports }),
    );
    for (const file of [
      "types.d.ts",
      "require.js",
      "import.js",
      "default.js",
      "source/public.js",
      "private.js",
      "private/secret.js",
    ]) {
      const target = path.join(dir, file);
      mkdirSync(path.dirname(target), { recursive: true });
      writeFileSync(target, "export const value = 'fixture';");
    }
    const server = await createViteServer({
      configFile: false,
      root,
      plugins: [pinWorkspacePackages(root)],
      server: { middlewareMode: true, watch: null, ws: false },
      ssr: { noExternal: true },
      optimizeDeps: { noDiscovery: true, include: [] },
    });
    try {
      const source = `@asym/fixture${subpath ? `/${subpath}` : ""}`;
      const resolved = server.environments.ssr.pluginContainer.resolveId(
        source,
        path.join(root, "entry.js"),
      );
      // Node self-reference requires exports. The no-exports legacy case is
      // covered by the Vite path assertion instead.
      const nodeResolve = () =>
        execFileSync(
          process.execPath,
          [
            "--input-type=module",
            "-e",
            "await import(process.argv[1]); console.log(import.meta.resolve(process.argv[1]));",
            source,
          ],
          { cwd: dir, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
        ).trim();
      if (expected === null) {
        await expect(resolved).rejects.toThrow();
        expect(nodeResolve).toThrow();
      } else {
        expect((await resolved)?.id).toBe(path.join(dir, expected));
        if (exports !== undefined)
          expect(fileURLToPath(nodeResolve())).toBe(path.join(dir, expected));
      }
    } finally {
      await server.close();
      rmSync(root, { recursive: true, force: true });
    }
  },
);
