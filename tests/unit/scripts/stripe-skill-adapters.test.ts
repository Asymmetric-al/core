import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { restoreStripeCoreGuidance } from "../../../scripts/lib/stripe-skill-adapters.mjs";
const repo = process.cwd();
const source = path.join(repo, "tests/fixtures/stripe-skill-refresh");
const roots: string[] = [];
async function putRaw(from: string, to: string) {
  await mkdir(to, { recursive: true });
  for (const entry of await readdir(from, { withFileTypes: true })) {
    if (entry.name === "source-manifest.json") continue;
    if (entry.isDirectory())
      await putRaw(path.join(from, entry.name), path.join(to, entry.name));
    else
      await cp(
        path.join(from, entry.name),
        path.join(to, entry.name.replace(/\.raw$/u, "")),
      );
  }
}
async function fixture() {
  const root = await mkdtemp(path.join(repo, ".tmp/stripe-adapter-test-"));
  roots.push(root);
  await mkdir(path.join(root, "scripts/refresh-overlays"), { recursive: true });
  await cp(
    path.join(repo, "scripts/refresh-overlays/stripe-core-guidance.json"),
    path.join(root, "scripts/refresh-overlays/stripe-core-guidance.json"),
  );
  await putRaw(source, path.join(root, ".agents/skills"));
  return root;
}
afterEach(async () => {
  for (const root of roots.splice(0))
    await rm(root, { recursive: true, force: true });
});
describe("current official Stripe bundle adapters", () => {
  it("keeps exact reviewed hosted source fixture hashes without claiming a Git commit", async () => {
    const manifest = JSON.parse(
      await readFile(path.join(source, "source-manifest.json"), "utf8"),
    );
    expect(manifest.sourceIndexSha256).toBe(
      "05e1a41ba66b644ee5543c0fb8958e4bb3d41ab58aac12a2f8286438d975d406",
    );
    for (const [file, hash] of Object.entries(manifest.files))
      expect(
        createHash("sha256")
          .update(await readFile(path.join(source, file + ".raw")))
          .digest("hex"),
      ).toBe(hash);
  });
  it("restores approved version pins, quoted gift methods, tax classification and authorization through sync in all mirrors", async () => {
    const root = await fixture();
    await mkdir(path.join(root, "scripts"), { recursive: true });
    await cp(
      path.join(repo, "scripts/sync-agent-skills.mjs"),
      path.join(root, "scripts/sync-agent-skills.mjs"),
    );
    await cp(path.join(repo, "scripts/lib"), path.join(root, "scripts/lib"), {
      recursive: true,
    });
    await mkdir(path.join(root, "docs/ai/skills/fixture"), { recursive: true });
    await writeFile(
      path.join(root, "docs/ai/skills/fixture/SKILL.md"),
      "---\nname: fixture\ndescription: Fixture\n---\n",
    );
    const run = () =>
      spawnSync(process.execPath, ["scripts/sync-agent-skills.mjs"], {
        cwd: root,
        encoding: "utf8",
      });
    const result = run();
    expect(result.status, result.stdout + result.stderr).toBe(0);
    for (const runtime of [".agents", ".cursor", ".claude"]) {
      for (const name of [
        "stripe-best-practices",
        "stripe-projects",
        "upgrade-stripe",
      ]) {
        const content = await readFile(
          path.join(root, runtime, "skills", name, "SKILL.md"),
          "utf8",
        );
        expect(content).toContain("packages/api/src/stripe/api-version.ts");
        expect(content).toContain("packages/api/package.json");
        expect(content).toContain(
          "never side effects of installing or refreshing",
        );
        expect(content).not.toContain(
          "Always use the latest API version and SDK",
        );
      }
      const payments = await readFile(
        path.join(root, runtime, "skills/stripe-best-practices/SKILL.md"),
        "utf8",
      );
      expect(payments).toContain("Preserve Core's quoted payment method");
      expect(payments).not.toContain("Never include");
      expect(payments).not.toContain(
        "use " + String.fromCharCode(96) + "allowed_payment_method_types",
      );
      expect(payments).toContain("2026-09-30.endive");
    }
    const before = await readFile(
      path.join(root, ".agents/skills/stripe-best-practices/SKILL.md"),
      "utf8",
    );
    const second = run();
    expect(second.status, second.stdout + second.stderr).toBe(0);
    expect(
      await readFile(
        path.join(root, ".agents/skills/stripe-best-practices/SKILL.md"),
        "utf8",
      ),
    ).toBe(before);
  });
  it("restores the credential and provisioning boundary for a stripe-projects-only install", async () => {
    const root = await fixture();
    for (const name of ["stripe-best-practices", "upgrade-stripe"])
      await rm(path.join(root, ".agents/skills", name), { recursive: true });
    await cp(
      path.join(repo, "scripts/sync-agent-skills.mjs"),
      path.join(root, "scripts/sync-agent-skills.mjs"),
    );
    await cp(path.join(repo, "scripts/lib"), path.join(root, "scripts/lib"), {
      recursive: true,
    });
    await mkdir(path.join(root, "docs/ai/skills/fixture"), { recursive: true });
    await writeFile(
      path.join(root, "docs/ai/skills/fixture/SKILL.md"),
      "---\\nname: fixture\\ndescription: Fixture\\n---\\n",
    );
    const result = spawnSync(
      process.execPath,
      ["scripts/sync-agent-skills.mjs"],
      { cwd: root, encoding: "utf8" },
    );
    expect(result.status, result.stdout + result.stderr).toBe(0);
    for (const runtime of [".agents", ".cursor", ".claude"]) {
      const text = await readFile(
        path.join(root, runtime, "skills/stripe-projects/SKILL.md"),
        "utf8",
      );
      expect(text).toContain("<!-- CORE-OVERLAY-START -->");
      expect(text).toContain("Never print, copy, commit or rotate credentials");
      expect(text).toContain(
        "Product provisioning, CLI/plugin installs, terms acceptance",
      );
      expect(text).toContain("require the corresponding explicit task scope");
      await expect(
        readFile(
          path.join(root, runtime, "skills/stripe-best-practices/SKILL.md"),
        ),
      ).rejects.toMatchObject({ code: "ENOENT" });
    }
  });
  it("rejects source drift before writing any Stripe file", async () => {
    const root = await fixture();
    const file = path.join(
      root,
      ".agents/skills/stripe-best-practices/SKILL.md",
    );
    const before = await readFile(file, "utf8");
    const upgrade = path.join(root, ".agents/skills/upgrade-stripe/SKILL.md");
    await writeFile(
      upgrade,
      (await readFile(upgrade, "utf8")).replace(
        "If the user specifies a target API version",
        "Unexpected vendor version-selection behavior",
      ),
    );
    await expect(restoreStripeCoreGuidance(root)).rejects.toThrow(
      "Core Stripe adapter no longer matches",
    );
    expect(await readFile(file, "utf8")).toBe(before);
  });
});
