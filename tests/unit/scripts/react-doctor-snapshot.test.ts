import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import {
  createAuditSnapshot,
  auditSourceHashes,
  assertAuditSourcesUnchanged,
  runReactDoctorAudit,
} from "../../../scripts/react-doctor-audit.mjs";

const roots: string[] = [];
function fixture() {
  const root = mkdtempSync(path.join(tmpdir(), "core-doctor-copy-"));
  roots.push(root);
  mkdirSync(path.join(root, "apps/admin"), { recursive: true });
  writeFileSync(
    path.join(root, "apps/admin/component.tsx"),
    "// eslint-disable-next-line\nexport const Component = () => null;\n",
  );
  writeFileSync(path.join(root, "package.json"), '{"workspaces":["apps/*"]}');
  writeFileSync(
    path.join(root, "doctor.config.json"),
    '{"ignore":{"files":[]},"rules":{"react-doctor/react-in-jsx-scope":"off"}}',
  );
  writeFileSync(path.join(root, ".env.local"), "PRIVATE_CANARY=never-copy\n");
  const snapshot = path.join(root, "output");
  const sourcePaths = [
    "package.json",
    "doctor.config.json",
    "apps/admin/component.tsx",
    ".env.local",
  ];
  return { root, snapshot, sourcePaths };
}
afterEach(() => {
  for (const root of roots.splice(0))
    rmSync(root, { recursive: true, force: true });
});

describe("React Doctor disposable source snapshots", () => {
  it("rejects source edits and new files made while an audit is running", () => {
    const { root } = fixture();
    execFileSync("git", ["init", "--quiet", root]);
    const expected = auditSourceHashes(root);
    writeFileSync(
      path.join(root, "apps/admin/component.tsx"),
      "changed source",
    );
    expect(() => assertAuditSourcesUnchanged({ root, expected })).toThrow(
      /changed/i,
    );
    writeFileSync(
      path.join(root, "apps/admin/component.tsx"),
      "// eslint-disable-next-line\nexport const Component = () => null;\n",
    );
    writeFileSync(
      path.join(root, "apps/admin/new.tsx"),
      "export const New = () => null;",
    );
    expect(() => assertAuditSourcesUnchanged({ root, expected })).toThrow(
      /changed/i,
    );
  });

  it("rejects snapshot rewrites, deletions, and added source files", () => {
    const { root, snapshot, sourcePaths } = fixture();
    createAuditSnapshot({
      root,
      snapshot,
      sourcePaths,
      linkDependencies: false,
    });
    const expected = auditSourceHashes(snapshot, { inventory: "physical" });
    rmSync(path.join(snapshot, "apps/admin/component.tsx"));
    expect(() =>
      assertAuditSourcesUnchanged({
        root: snapshot,
        expected,
        inventory: "physical",
      }),
    ).toThrow(/changed/i);
    writeFileSync(
      path.join(snapshot, "apps/admin/component.tsx"),
      "// eslint-disable-next-line\nexport const Component = () => null;\n",
    );
    writeFileSync(
      path.join(snapshot, "apps/admin/new.tsx"),
      "export const New = () => null;",
    );
    expect(() =>
      assertAuditSourcesUnchanged({
        root: snapshot,
        expected,
        inventory: "physical",
      }),
    ).toThrow(/changed/i);
    rmSync(path.join(snapshot, "apps/admin/new.tsx"));
    writeFileSync(
      path.join(snapshot, "apps/admin/component.tsx"),
      "rewritten by scanner",
    );
    expect(() =>
      assertAuditSourcesUnchanged({
        root: snapshot,
        expected,
        inventory: "physical",
      }),
    ).toThrow(/changed/i);
  });
  it("physically copies source and excludes secret inputs while isolating scanner rewrites", () => {
    const { root, snapshot, sourcePaths } = fixture();
    createAuditSnapshot({
      root,
      snapshot,
      sourcePaths,
      linkDependencies: false,
    });
    expect(existsSync(path.join(snapshot, ".env.local"))).toBe(false);
    writeFileSync(
      path.join(snapshot, "apps/admin/component.tsx"),
      "rewritten by scanner",
    );
    expect(
      readFileSync(path.join(root, "apps/admin/component.tsx"), "utf8"),
    ).toContain("eslint-disable");
    expect(
      realpathSync(path.join(snapshot, "apps/admin/component.tsx")),
    ).not.toBe(realpathSync(path.join(root, "apps/admin/component.tsx")));
  });
  it("refuses to reuse an output directory before touching any previous evidence", () => {
    const { root } = fixture();
    const output = path.join(root, "existing-audit");
    mkdirSync(output);
    writeFileSync(path.join(output, "scans.json"), "previous evidence");
    expect(() =>
      runReactDoctorAudit({ root, outputDirectory: output }),
    ).toThrow(/fresh|empty|already/i);
    expect(readFileSync(path.join(output, "scans.json"), "utf8")).toBe(
      "previous evidence",
    );
  });
  it("enables the classic JSX rule only in the raw snapshot, preserving the modern profile in the repository", () => {
    const { root, snapshot, sourcePaths } = fixture();
    createAuditSnapshot({
      root,
      snapshot,
      sourcePaths,
      linkDependencies: false,
      raw: true,
    });
    expect(
      JSON.parse(
        readFileSync(path.join(snapshot, "doctor.config.json"), "utf8"),
      ).rules["react-doctor/react-in-jsx-scope"],
    ).toBe("warn");
    expect(
      JSON.parse(readFileSync(path.join(root, "doctor.config.json"), "utf8"))
        .rules["react-doctor/react-in-jsx-scope"],
    ).toBe("off");
  });
  it.skipIf(process.platform === "win32")(
    "rejects source symlinks and traversal rather than copying opaque inputs",
    () => {
      const { root, snapshot, sourcePaths } = fixture();
      symlinkSync(
        path.join(root, ".env.local"),
        path.join(root, "apps/admin/alias.tsx"),
      );
      expect(() =>
        createAuditSnapshot({
          root,
          snapshot,
          sourcePaths: [...sourcePaths, "apps/admin/alias.tsx"],
          linkDependencies: false,
        }),
      ).toThrow(/symlink/i);
      expect(() =>
        createAuditSnapshot({
          root,
          snapshot: path.join(root, "output2"),
          sourcePaths: ["../outside.tsx"],
          linkDependencies: false,
        }),
      ).toThrow(/path/i);
    },
  );
});
