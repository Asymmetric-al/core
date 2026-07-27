import { describe, expect, it } from "vitest";

import {
  collectBunLockDriftViolations,
  findBunLockDrift,
  parseBunLock,
  stripTrailingCommas,
} from "../../../scripts/verify/bun-lock-drift.mjs";

type Manifest = Record<string, unknown>;

function manifestsOf(entries: Record<string, Manifest>) {
  return new Map(
    Object.entries(entries).map(([workspaceKey, manifest]) => [
      workspaceKey,
      {
        manifestPath: workspaceKey
          ? `${workspaceKey}/package.json`
          : "package.json",
        manifest,
      },
    ]),
  );
}

const ROOT_MANIFEST: Manifest = {
  name: "give-hope",
  dependencies: {
    "@asym/api": "workspace:*",
    "@supabase/supabase-js": "^2.89.0",
  },
  devDependencies: { typescript: "^5.7.3" },
};

const ADMIN_MANIFEST: Manifest = {
  name: "@asym/admin",
  dependencies: { next: "16.2.6" },
};

const MATCHING_LOCK_WORKSPACES = {
  "": {
    name: "give-hope",
    dependencies: {
      "@asym/api": "workspace:*",
      "@supabase/supabase-js": "^2.89.0",
    },
    devDependencies: { typescript: "^5.7.3" },
  },
  "apps/admin": {
    name: "@asym/admin",
    dependencies: { next: "16.2.6" },
  },
};

describe("bun.lock trailing-comma parsing", () => {
  it("parses the JSONC-ish lockfile shape Bun writes", () => {
    const lockText = [
      "{",
      '  "lockfileVersion": 1,',
      '  "workspaces": {',
      '    "": {',
      '      "name": "give-hope",',
      '      "dependencies": {',
      '        "@supabase/supabase-js": "^2.89.0",',
      "      },",
      "    },",
      "  },",
      "}",
    ].join("\n");

    expect(parseBunLock(lockText).workspaces[""].dependencies).toEqual({
      "@supabase/supabase-js": "^2.89.0",
    });
  });

  it("leaves commas inside string values untouched", () => {
    const lockText = '{ "peer": "^18.0.0 || ^19.0.0", "odd": "a, } b", }';

    expect(stripTrailingCommas(lockText)).toBe(
      '{ "peer": "^18.0.0 || ^19.0.0", "odd": "a, } b" }',
    );
    expect(parseBunLock(lockText)).toEqual({
      peer: "^18.0.0 || ^19.0.0",
      odd: "a, } b",
    });
  });

  it("keeps an escaped quote from ending the string early", () => {
    expect(parseBunLock('{ "quoted": "say \\", }", }')).toEqual({
      quoted: 'say ", }',
    });
  });
});

describe("bun.lock workspace-manifest drift", () => {
  it("passes when every workspace manifest matches its lockfile block", () => {
    expect(
      collectBunLockDriftViolations({
        lockWorkspaces: MATCHING_LOCK_WORKSPACES,
        manifests: manifestsOf({
          "": ROOT_MANIFEST,
          "apps/admin": ADMIN_MANIFEST,
        }),
      }),
    ).toEqual([]);
  });

  it("fails when a manifest dependency is missing from the lockfile block", () => {
    // Reproduces commit ea9a7673: a root dependency landed without the regenerated bun.lock.
    const lockWorkspaces = {
      ...MATCHING_LOCK_WORKSPACES,
      "": {
        name: "give-hope",
        dependencies: { "@asym/api": "workspace:*" },
        devDependencies: { typescript: "^5.7.3" },
      },
    };

    const violations = collectBunLockDriftViolations({
      lockWorkspaces,
      manifests: manifestsOf({
        "": ROOT_MANIFEST,
        "apps/admin": ADMIN_MANIFEST,
      }),
    });

    expect(violations).toEqual([
      'package.json: dependencies "@supabase/supabase-js": "^2.89.0" is missing from bun.lock workspaces[""]',
    ]);
  });

  it("names the package and the workspace for a non-root manifest", () => {
    const violations = collectBunLockDriftViolations({
      lockWorkspaces: {
        ...MATCHING_LOCK_WORKSPACES,
        "apps/admin": { name: "@asym/admin" },
      },
      manifests: manifestsOf({
        "": ROOT_MANIFEST,
        "apps/admin": ADMIN_MANIFEST,
      }),
    });

    expect(violations).toHaveLength(1);
    expect(violations[0]).toContain("apps/admin/package.json");
    expect(violations[0]).toContain('"next"');
    expect(violations[0]).toContain('bun.lock workspaces["apps/admin"]');
  });

  it("flags a specifier that drifted between the manifest and the lockfile", () => {
    const violations = collectBunLockDriftViolations({
      lockWorkspaces: {
        ...MATCHING_LOCK_WORKSPACES,
        "apps/admin": { name: "@asym/admin", dependencies: { next: "16.1.0" } },
      },
      manifests: manifestsOf({
        "": ROOT_MANIFEST,
        "apps/admin": ADMIN_MANIFEST,
      }),
    });

    expect(violations).toEqual([
      'apps/admin/package.json: dependencies "next" specifier drift: manifest has "16.2.6", bun.lock workspaces["apps/admin"] has "16.1.0"',
    ]);
  });

  it("flags a lockfile-only dependency the manifest no longer declares", () => {
    const violations = collectBunLockDriftViolations({
      lockWorkspaces: {
        ...MATCHING_LOCK_WORKSPACES,
        "apps/admin": {
          name: "@asym/admin",
          dependencies: { next: "16.2.6", "left-pad": "^1.3.0" },
        },
      },
      manifests: manifestsOf({
        "": ROOT_MANIFEST,
        "apps/admin": ADMIN_MANIFEST,
      }),
    });

    expect(violations).toEqual([
      'bun.lock workspaces["apps/admin"]: dependencies "left-pad": "^1.3.0" is not declared in apps/admin/package.json',
    ]);
  });

  it("covers dev, peer, and optional dependency groups", () => {
    const manifest: Manifest = {
      name: "@asym/ui",
      devDependencies: { eslint: "^9.39.2" },
      peerDependencies: { react: "^18.0.0 || ^19.0.0" },
      optionalDependencies: { canvas: "^3.2.1" },
    };

    const violations = collectBunLockDriftViolations({
      lockWorkspaces: { "packages/ui": { name: "@asym/ui" } },
      manifests: manifestsOf({ "packages/ui": manifest }),
    });

    expect(violations).toEqual([
      'packages/ui/package.json: devDependencies "eslint": "^9.39.2" is missing from bun.lock workspaces["packages/ui"]',
      'packages/ui/package.json: peerDependencies "react": "^18.0.0 || ^19.0.0" is missing from bun.lock workspaces["packages/ui"]',
      'packages/ui/package.json: optionalDependencies "canvas": "^3.2.1" is missing from bun.lock workspaces["packages/ui"]',
    ]);
  });

  it("flags a workspace that only one side records", () => {
    const violations = collectBunLockDriftViolations({
      lockWorkspaces: { "": MATCHING_LOCK_WORKSPACES[""], "packages/gone": {} },
      manifests: manifestsOf({
        "": ROOT_MANIFEST,
        "packages/new": { name: "@asym/new" },
      }),
    });

    expect(violations).toEqual([
      'bun.lock workspaces["packages/gone"] has no matching package.json on disk',
      'packages/new/package.json declares a workspace that bun.lock workspaces["packages/new"] does not record',
    ]);
  });
});

describe("live repository state", () => {
  it("keeps bun.lock in sync with every workspace package.json", async () => {
    await expect(findBunLockDrift()).resolves.toEqual([]);
  });
});
