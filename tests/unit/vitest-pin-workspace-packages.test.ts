import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import {
  discoverWorkspacePackages,
  findWorkspacePackage,
  resolveWorkspaceFile,
} from "../../vitest.pin-workspace-packages";

const repoRoot = fileURLToPath(new URL("../..", import.meta.url));

describe("pinWorkspacePackages", () => {
  it("discovers @asym/database and @asym/auth in this checkout", () => {
    const names = discoverWorkspacePackages(repoRoot).map((pkg) => pkg.name);

    expect(names).toEqual(
      expect.arrayContaining(["@asym/database", "@asym/auth", "@asym/api"]),
    );
  });

  it("resolves Support Hub schema and admin client to this checkout", () => {
    const packages = discoverWorkspacePackages(repoRoot);
    const schema = findWorkspacePackage(
      packages,
      "@asym/database/collections/support-hub.schema",
    );
    const admin = findWorkspacePackage(
      packages,
      "@asym/database/supabase/admin",
    );
    const authContext = findWorkspacePackage(packages, "@asym/auth/context");

    expect(schema).toBeDefined();
    expect(admin).toBeDefined();
    expect(authContext).toBeDefined();
    expect(resolveWorkspaceFile(schema!.pkg, schema!.subpath)).toBe(
      path.join(
        repoRoot,
        "packages/database/collections/support-hub.schema.ts",
      ),
    );
    expect(resolveWorkspaceFile(admin!.pkg, admin!.subpath)).toBe(
      path.join(repoRoot, "packages/database/supabase/admin.ts"),
    );
    expect(resolveWorkspaceFile(authContext!.pkg, authContext!.subpath)).toBe(
      path.join(repoRoot, "packages/auth/context.ts"),
    );
  });

  it("prefers the longer package name so missionary-app is not missionary", () => {
    const packages = discoverWorkspacePackages(repoRoot);
    const match = findWorkspacePackage(packages, "@asym/missionary-app/foo");

    expect(match?.pkg.name).toBe("@asym/missionary-app");
    expect(match?.subpath).toBe("foo");
  });
});
