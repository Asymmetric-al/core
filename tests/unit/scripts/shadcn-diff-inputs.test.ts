import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { shadcnResolutionChanged } from "../../../scripts/verify/ci-preflight-shadcn.mjs";
import {
  SHADCN_REVIEW_BASELINE,
  shadcnDiffInputs,
  shadcnTsconfigChain,
} from "../../../scripts/verify/shadcn-diff.mjs";

const created: string[] = [];
const linked: string[] = [];
afterEach(() => {
  for (const link of linked.splice(0)) rmSync(link, { force: true });
  for (const dir of created.splice(0))
    rmSync(dir, { recursive: true, force: true });
});

// The root manifest as the CLI and Bun see it; each case changes one part.
function manifest(extra: Record<string, unknown> = {}) {
  return JSON.stringify(
    {
      name: "give-hope",
      version: "0.1.0",
      private: true,
      packageManager: "bun@1.4.3",
      workspaces: ["apps/*", "packages/*", "tooling/*"],
      scripts: { lint: "turbo run lint" },
      dependencies: { next: "16.4.5" },
      devDependencies: { shadcn: "4.22.1", vitest: "4.0.0" },
      "lint-staged": { "*": "prettier --ignore-unknown --write" },
      engines: { bun: "1.4.3" },
      ...extra,
    },
    null,
    2,
  );
}

type Lock = {
  lockfileVersion: number;
  workspaces: Record<string, Record<string, unknown>>;
  overrides?: Record<string, string>;
  packages: Record<string, unknown[]>;
};

// A bun.lock in Bun's text form (JSON with trailing commas). shadcn depends
// on @shadcn/registry, on cn (nested at shadcn/cn) and on the hoisted zod;
// @shadcn/registry has its own nested zod.
function lock(change: (value: Lock) => void = () => {}) {
  const value: Lock = {
    lockfileVersion: 1,
    workspaces: {
      "": {
        name: "give-hope",
        dependencies: { next: "16.4.5" },
        devDependencies: { shadcn: "4.22.1", vitest: "4.0.0" },
      },
      "apps/admin": { name: "@asym/admin", dependencies: { next: "16.4.5" } },
      "packages/ui": {
        name: "@asym/ui",
        dependencies: { "@base-ui/react": "1.9.0" },
      },
    },
    overrides: { sharp: "0.35.5" },
    packages: {
      shadcn: [
        "shadcn@4.22.1",
        "",
        {
          dependencies: {
            "@shadcn/registry": "0.2.0",
            cn: "^0.2.4",
            zod: "^3.24.0",
          },
        },
        "sha512-shadcn",
      ],
      "@shadcn/registry": [
        "@shadcn/registry@0.2.0",
        "",
        { dependencies: { zod: "^4.0.0" } },
        "sha512-registry",
      ],
      "@shadcn/registry/zod": ["zod@4.1.0", "", {}, "sha512-zod4"],
      "shadcn/cn": ["cn@0.2.4", "", {}, "sha512-cn02"],
      cn: ["cn@0.5.0", "", {}, "sha512-cn05"],
      zod: ["zod@3.25.0", "", {}, "sha512-zod3"],
      next: ["next@16.4.5", "", {}, "sha512-next"],
      vitest: ["vitest@4.0.0", "", {}, "sha512-vitest"],
    },
  };
  change(value);
  return JSON.stringify(value, null, 2).replace(/\n(\s*)([}\]])/g, ",\n$1$2");
}

describe("what the shadcn CLI resolves through the root manifest", () => {
  it("ignores scripts, lint-staged, metadata and other dependencies", () => {
    for (const after of [
      manifest({ scripts: { lint: "turbo run lint", "verify:x": "node x" } }),
      manifest({ "lint-staged": {} }),
      manifest({
        devDependencies: { shadcn: "4.22.1", vitest: "4.1.0", tsx: "4.0.0" },
      }),
      manifest({ dependencies: { next: "16.5.0", pg: "8.20.0" } }),
      manifest({ version: "0.2.0", engines: { bun: "1.4.4" } }),
    ])
      expect(shadcnResolutionChanged("package.json", manifest(), after)).toBe(
        false,
      );
  });

  it("selects a change to the shadcn entry, package manager, workspaces, resolution or an unknown key", () => {
    for (const after of [
      manifest({ devDependencies: { shadcn: "4.23.0", vitest: "4.0.0" } }),
      manifest({ dependencies: { next: "16.4.5", shadcn: "4.22.1" } }),
      manifest({ packageManager: "bun@1.5.0" }),
      manifest({ workspaces: ["apps/*", "packages/*"] }),
      manifest({ overrides: { zod: "4.0.0" } }),
      manifest({ patchedDependencies: { "cn@0.2.4": "x.patch" } }),
      manifest({ imports: { "#x": "./x.js" } }),
    ])
      expect(shadcnResolutionChanged("package.json", manifest(), after)).toBe(
        true,
      );
  });

  it("selects when it cannot tell", () => {
    expect(shadcnResolutionChanged("package.json", null, manifest())).toBe(
      true,
    );
    expect(shadcnResolutionChanged("package.json", manifest(), null)).toBe(
      true,
    );
    expect(shadcnResolutionChanged("package.json", "{", manifest())).toBe(true);
    expect(shadcnResolutionChanged("package.json", manifest(), "[]")).toBe(
      true,
    );
    expect(shadcnResolutionChanged("other.json", "{}", "{}")).toBe(true);
  });
});

describe("what the shadcn CLI resolves through bun.lock", () => {
  it("ignores packages outside the CLI's own dependency tree and other workspaces", () => {
    for (const change of [
      (value: Lock) => {
        value.packages.next = ["next@16.5.0", "", {}, "sha512-next2"];
      },
      (value: Lock) => {
        value.packages["left-pad"] = ["left-pad@1.3.0", "", {}, "sha512-lp"];
      },
      // Hoisted cn is not the cn shadcn resolves (shadcn/cn is).
      (value: Lock) => {
        value.packages.cn = ["cn@0.6.0", "", {}, "sha512-cn06"];
      },
      (value: Lock) => {
        value.workspaces["apps/admin"].dependencies = { next: "16.5.0" };
      },
      (value: Lock) => {
        value.workspaces[""].devDependencies = {
          shadcn: "4.22.1",
          vitest: "4.1.0",
        };
      },
    ])
      expect(shadcnResolutionChanged("bun.lock", lock(), lock(change))).toBe(
        false,
      );
  });

  it("selects a change to shadcn, its dependency tree, the UI workspace or resolution settings", () => {
    for (const change of [
      (value: Lock) => {
        value.packages.shadcn[0] = "shadcn@4.23.0";
      },
      (value: Lock) => {
        value.packages["@shadcn/registry"][3] = "sha512-other";
      },
      (value: Lock) => {
        value.packages["@shadcn/registry/zod"][0] = "zod@4.2.0";
      },
      (value: Lock) => {
        value.packages["shadcn/cn"][0] = "cn@0.2.5";
      },
      (value: Lock) => {
        value.packages.zod[0] = "zod@3.26.0";
      },
      (value: Lock) => {
        value.workspaces["packages/ui"].dependencies = {
          "@base-ui/react": "1.10.0",
        };
      },
      (value: Lock) => {
        value.workspaces[""].devDependencies = {
          shadcn: "4.23.0",
          vitest: "4.0.0",
        };
      },
      (value: Lock) => {
        value.overrides = { sharp: "0.35.5", zod: "3.25.1" };
      },
      (value: Lock) => {
        value.lockfileVersion = 2;
      },
    ])
      expect(shadcnResolutionChanged("bun.lock", lock(), lock(change))).toBe(
        true,
      );
  });

  it("selects when it cannot tell", () => {
    expect(shadcnResolutionChanged("bun.lock", "{", lock())).toBe(true);
    expect(shadcnResolutionChanged("bun.lock", null, lock())).toBe(true);
    expect(
      shadcnResolutionChanged(
        "bun.lock",
        lock(),
        lock((value) => {
          delete value.packages.shadcn;
        }),
      ),
    ).toBe(true);
  });

  it("reads this repository's bun.lock", () => {
    const text = readFileSync("bun.lock", "utf8");
    const edit = (key: string, index: number, value: string) => {
      const parsed = JSON.parse(text.replace(/,(\s*[}\]])/g, "$1"));
      parsed.packages[key][index] = value;
      return JSON.stringify(parsed, null, 2);
    };
    expect(shadcnResolutionChanged("bun.lock", text, text)).toBe(false);
    expect(
      shadcnResolutionChanged(
        "bun.lock",
        text,
        edit("@axe-core/playwright", 3, "sha512-changed"),
      ),
    ).toBe(false);
    expect(
      shadcnResolutionChanged(
        "bun.lock",
        text,
        edit("@shadcn/registry", 3, "sha512-changed"),
      ),
    ).toBe(true);
  });
});

describe("the tsconfig extends chain the CLI follows", () => {
  it("adds the chain of packages/ui/tsconfig.json to the review's inputs", () => {
    const chain = shadcnTsconfigChain(process.cwd());
    expect(chain).toEqual(
      expect.arrayContaining([
        "tooling/typescript-config/package.json",
        "tooling/typescript-config/library-transitional.json",
        "tooling/typescript-config/base.json",
      ]),
    );
    const baseline = JSON.parse(readFileSync(SHADCN_REVIEW_BASELINE, "utf8"));
    expect(shadcnDiffInputs(baseline)).toEqual(
      expect.arrayContaining(chain as string[]),
    );
    expect(
      shadcnDiffInputs(baseline, { tsconfigChain: ["x/base.json"] }),
    ).toContain("x/base.json");
    // An unresolved chain means the inputs cannot be told.
    expect(shadcnDiffInputs(baseline, { tsconfigChain: null })).toBeNull();
  });

  function project(files: Record<string, unknown>) {
    const root = mkdtempSync(path.join(os.tmpdir(), "core-shadcn-tsconfig-"));
    created.push(root);
    for (const [relative, value] of Object.entries(files)) {
      mkdirSync(path.dirname(path.join(root, relative)), { recursive: true });
      writeFileSync(path.join(root, relative), JSON.stringify(value));
    }
    return root;
  }
  function link(root: string, relative: string, target: string) {
    mkdirSync(path.dirname(path.join(root, relative)), { recursive: true });
    symlinkSync(target, path.join(root, relative), "junction");
    linked.push(path.join(root, relative));
  }

  it("follows relative and package extends, arrays included", () => {
    const root = project({
      "packages/ui/tsconfig.json": {
        extends: ["../../tsconfig.shared.json", "@x/cfg/strict.json"],
      },
      "tsconfig.shared.json": { extends: "./tsconfig.deep" },
      "tsconfig.deep.json": {},
      "tooling/cfg/package.json": { name: "@x/cfg" },
      "tooling/cfg/strict.json": { extends: "./base.json" },
      "tooling/cfg/base.json": {},
    });
    link(root, "node_modules/@x/cfg", path.join(root, "tooling", "cfg"));
    expect(shadcnTsconfigChain(root)?.sort()).toEqual(
      [
        "tsconfig.shared.json",
        "tsconfig.deep.json",
        "tooling/cfg/package.json",
        "tooling/cfg/strict.json",
        "tooling/cfg/base.json",
      ].sort(),
    );
  });

  it("cannot tell when a link is missing, unreadable or outside the checkout", () => {
    expect(
      shadcnTsconfigChain(
        project({ "packages/ui/tsconfig.json": { extends: "./missing.json" } }),
      ),
    ).toBeNull();
    expect(
      shadcnTsconfigChain(
        project({ "packages/ui/tsconfig.json": { extends: "@x/absent/a" } }),
      ),
    ).toBeNull();
    const outside = project({ "base.json": {} });
    const root = project({
      "packages/ui/tsconfig.json": { extends: "@x/ext/base.json" },
    });
    link(root, "node_modules/@x/ext", outside);
    expect(shadcnTsconfigChain(root)).toBeNull();
    const broken = project({});
    mkdirSync(path.join(broken, "packages", "ui"), { recursive: true });
    writeFileSync(path.join(broken, "packages", "ui", "tsconfig.json"), "{");
    expect(shadcnTsconfigChain(broken)).toBeNull();
  });
});
