import {
  mkdtempSync,
  mkdirSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";
import { createViteServer } from "vitest/node";

import { pinWorkspacePackages } from "../../vitest.pin-workspace-packages";

function createLegacyFixture() {
  const sandbox = mkdtempSync(path.join(tmpdir(), "workspace-legacy-"));
  const root = path.join(sandbox, "checkout");
  const foreign = path.join(sandbox, "foreign-checkout");
  const write = (file: string, value: string) => {
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, value);
  };
  for (const checkout of [root, foreign]) {
    write(path.join(checkout, "package.json"), '{"type":"module"}');
    write(path.join(checkout, "entry.js"), "export {};");
    for (const name of ["fixture", "sibling"]) {
      write(
        path.join(checkout, "packages", name, "package.json"),
        JSON.stringify({ name: `@asym/${name}`, type: "module" }),
      );
    }
    for (const file of [
      "packages/fixture/index.js",
      "packages/fixture/child.js",
      "packages/fixture/..notes.js",
      "packages/sibling/x.js",
      "packages/index.js",
      "bar/x.js",
    ]) {
      write(path.join(checkout, file), "export const value = 'fixture';");
    }
  }
  write(path.join(sandbox, "outside.js"), "export const value = 'outside';");
  mkdirSync(path.join(root, "node_modules", "@asym"), { recursive: true });
  for (const name of ["fixture", "sibling"]) {
    symlinkSync(
      path.join(foreign, "packages", name),
      path.join(root, "node_modules", "@asym", name),
      "dir",
    );
  }
  return { sandbox, root, foreign };
}

async function createResolver(root: string, pinned: boolean) {
  return createViteServer({
    configFile: false,
    root,
    plugins: pinned ? [pinWorkspacePackages(root)] : [],
    server: { middlewareMode: true, watch: null, ws: false },
    ssr: { noExternal: true },
    optimizeDeps: { noDiscovery: true, include: [] },
  });
}

describe("legacy workspace package containment", () => {
  it("keeps contained and dot-prefixed files pinned to this checkout", async () => {
    const fixture = createLegacyFixture();
    const server = await createResolver(fixture.root, true);
    try {
      for (const subpath of ["", "child.js", "..notes.js"]) {
        const resolved =
          await server.environments.ssr.pluginContainer.resolveId(
            `@asym/fixture${subpath ? `/${subpath}` : ""}`,
            path.join(fixture.root, "entry.js"),
          );
        expect(resolved?.id).toBe(
          path.join(fixture.root, "packages", "fixture", subpath || "index.js"),
        );
      }
    } finally {
      await server.close();
      rmSync(fixture.sandbox, { recursive: true, force: true });
    }
  });

  it("refuses escaping segments without falling through to another checkout", async () => {
    const fixture = createLegacyFixture();
    const server = await createResolver(fixture.root, true);
    const native = await createResolver(fixture.root, false);
    try {
      const source = "@asym/fixture/../sibling/x.js";
      const importer = path.join(fixture.root, "entry.js");
      // Returning null from the pinning plugin would allow this foreign result.
      expect(
        (
          await native.environments.ssr.pluginContainer.resolveId(
            source,
            importer,
          )
        )?.id,
      ).toBe(path.join(fixture.foreign, "packages", "sibling", "x.js"));
      for (const subpath of [
        "../sibling/x.js",
        "..",
        "../../bar/x.js",
        "../../../outside.js",
        "nested/../../sibling/x.js",
      ]) {
        await expect(
          server.environments.ssr.pluginContainer.resolveId(
            `@asym/fixture/${subpath}`,
            importer,
          ),
        ).rejects.toThrow("Workspace import escapes package directory:");
      }
    } finally {
      await server.close();
      await native.close();
      rmSync(fixture.sandbox, { recursive: true, force: true });
    }
  });
});
