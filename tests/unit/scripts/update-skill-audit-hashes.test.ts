import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  mkdir,
  mkdtemp,
  readFile,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

const script = path.join(
  process.cwd(),
  "scripts/update-skill-audit-hashes.mjs",
);
const roots: string[] = [];
const selected = {
  name: "example",
  ownership: "canonical",
  status: "unresolved",
  rawSkillHash: "reviewed-upstream-identity",
  license: { status: "unresolved-applicable-license" },
  reviewEvidence: [{ kind: "historical", entrypointSha256: "original" }],
  entrypointHash: "old-entrypoint",
  treeHash: "old-tree",
};
const unrelated = {
  name: "unrelated",
  ownership: "canonical",
  treeHash: "keep",
};
async function fixture() {
  const root = await mkdtemp(path.join(os.tmpdir(), "core-skill-audit-"));
  roots.push(root);
  await mkdir(path.join(root, ".agents/skills/example/references"), {
    recursive: true,
  });
  await mkdir(path.join(root, "docs/ai/skills/example/references"), {
    recursive: true,
  });
  await mkdir(path.join(root, "docs/ai"), { recursive: true });
  await writeFile(
    path.join(root, ".agents/skills/example/SKILL.md"),
    "# Reviewed Core guidance\n",
  );
  await writeFile(
    path.join(root, ".agents/skills/example/references/raw.md"),
    "Original upstream bytes\n",
  );
  await writeFile(
    path.join(root, "docs/ai/skills/example/SKILL.md"),
    "# Reviewed Core guidance\n",
  );
  await writeFile(
    path.join(root, "docs/ai/skills/example/references/raw.md"),
    "Original upstream bytes\n",
  );
  const audit = {
    schemaVersion: 1,
    reviewedAt: "historical-date",
    skills: [selected, unrelated],
  };
  const auditPath = path.join(root, "docs/ai/skill-source-audit.json");
  await writeFile(auditPath, JSON.stringify(audit, null, 2) + "\n");
  return { root, auditPath, audit };
}
function update(root: string, ...names: string[]) {
  return spawnSync(
    process.execPath,
    [
      script,
      "--repo-root",
      root,
      ...names.flatMap((name) => ["--skill", name]),
    ],
    { encoding: "utf8" },
  );
}
afterEach(async () => {
  for (const root of roots.splice(0))
    await rm(root, { recursive: true, force: true });
});
describe("targeted installed skill audit hashes", () => {
  it("updates only selected payload hashes without changing historical review or permission decisions", async () => {
    const { root, auditPath, audit } = await fixture();
    const result = update(root, "example");
    expect(result.status, result.stdout + result.stderr).toBe(0);
    const updated = JSON.parse(await readFile(auditPath, "utf8"));
    const entrypointHash = createHash("sha256")
      .update("# Reviewed Core guidance\n")
      .digest("hex");
    const treeHash = createHash("sha256")
      .update("SKILL.md\0# Reviewed Core guidance\n\0")
      .update("references/raw.md\0Original upstream bytes\n\0")
      .digest("hex");
    expect(updated).toEqual({
      ...audit,
      skills: [{ ...selected, entrypointHash, treeHash }, unrelated],
    });
    const first = await readFile(auditPath, "utf8");
    expect(update(root, "example").status).toBe(0);
    expect(await readFile(auditPath, "utf8")).toBe(first);
  });
  it.each(["changed", "missing", "extra"])(
    "refuses to stamp a canonical record when the source payload is %s",
    async (difference) => {
      const { root, auditPath } = await fixture();
      const original = await readFile(auditPath, "utf8");
      const canonical = path.join(root, "docs/ai/skills/example");
      if (difference === "changed")
        await writeFile(
          path.join(canonical, "SKILL.md"),
          "# Raw upstream guidance\n",
        );
      if (difference === "missing")
        await rm(path.join(canonical, "references/raw.md"));
      if (difference === "extra")
        await writeFile(
          path.join(canonical, "references/extra.md"),
          "Unpublished\n",
        );
      const result = update(root, "example");
      expect(result.status, result.stdout + result.stderr).not.toBe(0);
      expect(result.stderr).toContain(
        "Canonical and installed skill payloads differ",
      );
      expect(await readFile(auditPath, "utf8")).toBe(original);
    },
  );
  it("rejects canonical symlinks before changing the audit", async () => {
    const { root, auditPath } = await fixture();
    const original = await readFile(auditPath, "utf8");
    await symlink(
      "raw.md",
      path.join(root, "docs/ai/skills/example/references/link.md"),
    );
    const result = update(root, "example");
    expect(result.status, result.stdout + result.stderr).not.toBe(0);
    expect(result.stderr).toContain("symlink");
    expect(await readFile(auditPath, "utf8")).toBe(original);
  });
  it("validates every selection before writing and rejects symlink payloads", async () => {
    const { root, auditPath } = await fixture();
    const first = await readFile(auditPath, "utf8");
    expect(update(root, "example", "missing").status).not.toBe(0);
    expect(await readFile(auditPath, "utf8")).toBe(first);
    await symlink(
      "raw.md",
      path.join(root, ".agents/skills/example/references/link.md"),
    );
    const result = update(root, "example");
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("symlink");
    expect(await readFile(auditPath, "utf8")).toBe(first);
  });
});
