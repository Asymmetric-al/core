import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  checkProgramCoverage,
  classify,
  discoverPrograms,
  type FileEntry,
  listMembers,
  type Program,
  programsScriptConfigs,
  rollUp,
  root,
} from "../../../scripts/verify/typescript-programs.mts";

const program = (config: string): Program => ({
  config,
  role: "typecheck",
  gate: "test",
  reason: "test",
});

const entry = (
  file: string,
  roots = "a/tsconfig.json",
  fileClass: FileEntry["class"] = "compiled",
): FileEntry => ({ file, class: fileClass, roots, kind: "" });

describe("program inventory", () => {
  it("reads each config of the typecheck:programs script in order", () => {
    expect(
      programsScriptConfigs(
        "tsc -p tsconfig.root.json && tsc -p scripts/tsconfig.json",
      ),
    ).toEqual(["tsconfig.root.json", "scripts/tsconfig.json"]);
  });

  it.each(["", "tsc --noEmit", "tsc -p a.json && node other.mjs"])(
    "refuses a typecheck:programs script it cannot read in full: %j",
    (script) => {
      expect(() => programsScriptConfigs(script)).toThrow(
        "Unexpected typecheck:programs script",
      );
    },
  );

  it("classes a file by the strongest program it is in", () => {
    expect(classify(["lint-context", "typecheck"])).toBe("compiled");
    expect(classify(["lint-context", "other-gate"])).toBe("compiled-elsewhere");
    expect(classify(["lint-context"])).toBe("lint-context");
    expect(classify([])).toBe("none");
  });

  it("refuses an unclassified, duplicate or missing program config", () => {
    expect(() =>
      checkProgramCoverage([program("a/tsconfig.json")], ["a/tsconfig.json"]),
    ).not.toThrow();
    expect(() =>
      checkProgramCoverage(
        [program("a/tsconfig.json")],
        ["a/tsconfig.json", "b/tsconfig.json"],
      ),
    ).toThrow("Unclassified tsconfig files");
    expect(() =>
      checkProgramCoverage(
        [program("a/tsconfig.json"), program("a/tsconfig.json")],
        ["a/tsconfig.json"],
      ),
    ).toThrow("Programs listed twice");
    expect(() =>
      checkProgramCoverage([program("a/tsconfig.json")], []),
    ).toThrow("Programs without a tracked config");
  });

  it("states a directory's default once and lists only the exceptions", () => {
    expect(
      rollUp([
        entry("a/one.ts"),
        entry("a/two.ts"),
        entry("a/sub/three.ts"),
        entry("a/sub/odd.ts", "b/tsconfig.json"),
        entry("a/other/four.ts", "", "none"),
        entry("a/other/five.ts", "", "none"),
      ]),
    ).toEqual([
      {
        path: "a/**",
        files: 3,
        class: "compiled",
        roots: "a/tsconfig.json",
        kind: "",
      },
      { path: "a/other/**", files: 2, class: "none", roots: "", kind: "" },
      {
        path: "a/sub/odd.ts",
        files: 1,
        class: "compiled",
        roots: "b/tsconfig.json",
        kind: "",
      },
    ]);
  });

  it("does not give a directory the program of one of its subdirectories", () => {
    expect(
      rollUp([
        entry("p/x/one.ts", "p/x/tsconfig.json"),
        entry("p/x/two.ts", "p/x/tsconfig.json"),
        entry("p/y/three.ts", "p/y/tsconfig.json"),
        entry("root.ts", "tsconfig.root.json"),
      ]).map((scope) => [scope.path, scope.files, scope.roots]),
    ).toEqual([
      ["**", 1, "tsconfig.root.json"],
      ["p/x/**", 2, "p/x/tsconfig.json"],
      ["p/y/**", 1, "p/y/tsconfig.json"],
    ]);
  });
});

describe("root, scripts and tooling programs", () => {
  const tracked = execFileSync(
    "git",
    ["ls-files", "--cached", "--others", "--exclude-standard"],
    { cwd: root, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
  )
    .split("\n")
    .filter((file) => /\.(?:ts|tsx|mts|cts)$/.test(file));

  it("wires typecheck:programs into every Turbo typecheck, so CI runs it without a workflow change", () => {
    const manifest: unknown = JSON.parse(
      readFileSync(path.join(root, "package.json"), "utf8"),
    );
    expect(manifest).toMatchObject({
      scripts: {
        typecheck: "turbo run typecheck",
        "typecheck:programs":
          "tsc -p tsconfig.root.json && tsc -p scripts/tsconfig.json && tsc -p tooling/tsconfig.json",
      },
    });
    const turbo: unknown = JSON.parse(
      readFileSync(path.join(root, "turbo.json"), "utf8"),
    );
    expect(turbo).toMatchObject({
      tasks: {
        typecheck: {
          dependsOn: expect.arrayContaining(["//#typecheck:programs"]),
        },
        "//#typecheck:programs": { outputs: [] },
      },
    });
    const workflow = readFileSync(
      path.join(root, ".github/workflows/ci.yml"),
      "utf8",
    );
    // The pull-request job runs `turbo run typecheck --affected`, which pulls in the root task.
    expect(workflow).toContain("run: bunx turbo run typecheck --affected");
  });

  it("lists every tracked tsconfig as a program or a named non-program", () => {
    const configs = execFileSync(
      "git",
      [
        "ls-files",
        "--cached",
        "--others",
        "--exclude-standard",
        "--",
        "*tsconfig*.json",
      ],
      { cwd: root, encoding: "utf8" },
    )
      .split("\n")
      .filter((file) => /(?:^|\/)tsconfig[^/]*\.json$/.test(file));
    expect(() =>
      checkProgramCoverage(discoverPrograms(), configs),
    ).not.toThrow();
  });

  it.each([
    {
      config: "tsconfig.root.json",
      scope: (file: string) => !file.includes("/"),
    },
    {
      config: "scripts/tsconfig.json",
      scope: (file: string) =>
        file.startsWith("scripts/") &&
        !file.startsWith("scripts/archon-factory/pack/"),
    },
    {
      config: "tooling/tsconfig.json",
      scope: (file: string) => file.startsWith("tooling/"),
    },
  ])(
    "$config compiles every tracked TypeScript file in its scope",
    async ({ config, scope }) => {
      const members = new Set(await listMembers(config));
      const inScope = tracked.filter(scope);
      expect(inScope.length).toBeGreaterThan(0);
      expect(inScope.filter((file) => !members.has(file))).toEqual([]);
    },
    60_000,
  );
});
