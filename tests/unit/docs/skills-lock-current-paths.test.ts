import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const repoRoot = process.cwd();

function readRepoFile(relativePath: string) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function readLock() {
  return JSON.parse(readRepoFile("skills-lock.json")) as {
    skills: Record<
      string,
      { source?: string; skillPath?: string; computedHash?: string }
    >;
  };
}

describe("skills lock current upstream paths", () => {
  it("keeps the current lockfile skill names", () => {
    expect(Object.keys(readLock().skills)).toHaveLength(203);
  });

  it("pins the reviewed vercel-labs/ui ui-sdk skill without its maintainer skills", () => {
    const { skills } = readLock();
    const provenance = readRepoFile(
      "docs/ai/skills/ui-sdk/references/upstream.md",
    );

    const reviewedLockHash =
      "76946872dfa4db3d144c1629ce2fe8a44b1cd4442ef70eeb82f3da4cb5f68f07";
    const reviewedLicenseHash =
      "85dc930b9f77edd477ceddd7658dd3a4bb4411186718d19e137a7a5724ee7007";

    expect(skills["ui-sdk"]).toMatchObject({
      source: "vercel-labs/ui",
      sourceType: "github",
      skillPath: "packages/core/skills/ui-sdk/SKILL.md",
      computedHash: reviewedLockHash,
    });
    const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/u.exec(
      provenance,
    )?.[1];
    expect(frontmatter).toBeDefined();
    const metadata = frontmatter?.split(/\r?\n/u) ?? [];
    for (const [key, value] of [
      ["reviewed_commit", "8ff6bcf7100d48230a3fab8c72475d99316cc58a"],
      [
        "upstream_skill_md_sha256",
        "bbcb19f944023dd8f36f895378852c325b811ced38fdd7dae234825c3d9c858a",
      ],
      ["skills_lock_hash", reviewedLockHash],
      ["upstream_license_sha256", reviewedLicenseHash],
    ]) {
      expect(metadata.filter((line) => line.startsWith(`${key}:`))).toEqual([
        `${key}: ${value}`,
      ]);
    }
    const license = readFileSync(
      path.join(repoRoot, "docs/ai/skills/ui-sdk/LICENSE"),
    );
    expect(createHash("sha256").update(license).digest("hex")).toBe(
      reviewedLicenseHash,
    );
    for (const excluded of [
      "ui-sdk-expert-review",
      "ui-sdk-unslop",
      "ui-sdk-write-code",
      "ui-sdk-write-docs",
    ]) {
      expect(Object.hasOwn(skills, excluded), excluded).toBe(false);
      expect(existsSync(path.join(repoRoot, "docs/ai/skills", excluded))).toBe(
        false,
      );
    }
  });

  it("pins the reviewed tstack council source without the rest of the pack", () => {
    const { skills } = readLock();
    const provenance = readRepoFile(
      "docs/ai/skills/council/references/upstream.md",
    );

    const reviewedLockHash =
      "a1993f93b9157a8c73d4b8c16da267a3addd2bec94bcffb6b5f4caea23a8854b";
    const reviewedLicenseHash =
      "8095f9a9f97d074131f6a2ce09b952d12c18b36f09f4e5df0517c4e64e82c851";

    expect(skills.council).toMatchObject({
      source: "t3dotgg/tstack",
      sourceType: "github",
      skillPath: "skills/council/SKILL.md",
      computedHash: reviewedLockHash,
    });
    const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/u.exec(
      provenance,
    )?.[1];
    expect(frontmatter).toBeDefined();
    const metadata = frontmatter?.split(/\r?\n/u) ?? [];
    for (const [key, value] of [
      ["reviewed_commit", "1085050f3baed1ac724caa4a8166145fb2ac88af"],
      [
        "upstream_skill_md_sha256",
        "598fb2c7cdd48ddd9643cb22999e1b624c357aa6579aa0af0e7268ae16a8a164",
      ],
      ["skills_lock_hash", reviewedLockHash],
      ["upstream_license_sha256", reviewedLicenseHash],
    ]) {
      expect(metadata.filter((line) => line.startsWith(`${key}:`))).toEqual([
        `${key}: ${value}`,
      ]);
    }
    const license = readFileSync(
      path.join(repoRoot, "docs/ai/skills/council/LICENSE"),
    );
    expect(createHash("sha256").update(license).digest("hex")).toBe(
      reviewedLicenseHash,
    );
    for (const excluded of [
      "full-send",
      "full-stop",
      "sol-loop",
      "file-pr",
      "takeover",
      "babysit-pr",
      "modernize",
      "leaving-pr-comments",
    ]) {
      expect(Object.hasOwn(skills, excluded), excluded).toBe(false);
    }
  });

  it("pins moved GitHub skill paths and the Resend CLI source", () => {
    const { skills } = readLock();

    expect(skills.eve).toMatchObject({
      source: "vercel/eve",
      skillPath: "skills/eve/SKILL.md",
    });
    expect(skills["playwright-best-practices"]).toMatchObject({
      source: "currents-dev/playwright-best-practices-skill",
      skillPath: "playwright-best-practices/SKILL.md",
    });
    expect(skills["nestjs-best-practices"]).toMatchObject({
      source: "Kadajett/agent-nestjs-skills",
      skillPath: "skills/nestjs-best-practices/SKILL.md",
    });
    expect(skills["resend-cli"]).toMatchObject({
      source: "resend/resend-cli",
      skillPath: "skills/resend-cli/SKILL.md",
    });
    expect(skills["playwright-skill"]).toMatchObject({
      source: "testdino-hq/playwright-skill",
      skillPath: "SKILL.md",
    });
    expect(skills["create-agent"]).toMatchObject({
      source: "ikindacodes/ship-eve",
      skillPath: "skills/create-agent/SKILL.md",
    });
  });

  it("keeps promoted canonical copies and Core overlays without pack bloat", () => {
    expect(readRepoFile("docs/ai/skills/eve/SKILL.md")).toContain(
      "filesystem-first framework",
    );
    expect(readRepoFile("docs/ai/skills/eve/references/upstream.md")).toContain(
      "upstream_path: skills/eve/SKILL.md",
    );

    expect(
      readRepoFile(
        "docs/ai/skills/playwright-best-practices/references/upstream.md",
      ),
    ).toContain("upstream_path: playwright-best-practices/SKILL.md");

    expect(
      readRepoFile("docs/ai/skills/nestjs-best-practices/SKILL.md"),
    ).toContain("## This repository (Asymmetric-al/core)");
    expect(
      readRepoFile("docs/ai/skills/nestjs-best-practices/SKILL.md"),
    ).toContain("not a NestJS application");
    expect(
      existsSync(
        path.join(
          repoRoot,
          "docs/ai/skills/nestjs-best-practices/rules/_sections.md",
        ),
      ),
    ).toBe(true);
    expect(
      existsSync(
        path.join(repoRoot, "docs/ai/skills/nestjs-best-practices/.github"),
      ),
    ).toBe(false);
    expect(
      existsSync(
        path.join(repoRoot, "docs/ai/skills/nestjs-best-practices/scripts"),
      ),
    ).toBe(false);
    expect(
      existsSync(
        path.join(repoRoot, ".agents/skills/nestjs-best-practices/.github"),
      ),
    ).toBe(false);
    expect(
      existsSync(
        path.join(repoRoot, ".agents/skills/nestjs-best-practices/scripts"),
      ),
    ).toBe(false);

    const resendCli = readRepoFile("docs/ai/skills/resend-cli/SKILL.md");
    expect(resendCli).toContain("## This repository (Asymmetric-al/core)");
    expect(resendCli).toContain("### Triggers");
    expect(
      readRepoFile("docs/ai/skills/resend-cli/references/upstream.md"),
    ).toContain("d4367e18c194f2bb555aad99bf8851f21e81606a");
    expect(
      readRepoFile("docs/ai/skills/resend-cli/references/upstream.md"),
    ).toContain("source_url: https://github.com/resend/resend-cli");

    expect(
      existsSync(path.join(repoRoot, "docs/ai/skills/playwright-skill")),
    ).toBe(false);
  });

  it("records the create-agent snapshot and NestJS routing", () => {
    const createAgentUpstream = readRepoFile(
      "docs/ai/skills/create-agent/references/upstream.md",
    );
    expect(createAgentUpstream).toContain("kept snapshot");
    expect(createAgentUpstream).toContain("no longer publishes");

    const routing = readRepoFile("docs/ai/rules/agent-skill-routing.md");
    expect(routing).toContain("docs/ai/skills/nestjs-best-practices/SKILL.md");
    expect(routing).toContain("kept snapshot");
  });

  it("keeps the bendc README wrapper current", () => {
    const upstream = readRepoFile(
      "docs/ai/skills/bendc-frontend-guidelines/references/upstream.md",
    );
    expect(upstream).toContain("last_reviewed: 2026-09-16");
  });

  it("keeps Matt Pocock removed skills as documented snapshots", () => {
    const snapshots = [
      "design-an-interface",
      "edit-article",
      "obsidian-vault",
      "qa",
      "request-refactor-plan",
      "ubiquitous-language",
      "writing-great-skills",
    ] as const;
    const { skills } = readLock();
    const routing = readRepoFile("docs/ai/rules/agent-skill-routing.md");

    for (const name of snapshots) {
      expect(skills[name], name).toBeDefined();
      expect(
        existsSync(path.join(repoRoot, "docs/ai/skills", name, "SKILL.md")),
        name,
      ).toBe(true);
      const upstream = readRepoFile(
        `docs/ai/skills/${name}/references/upstream.md`,
      );
      expect(upstream, name).toContain("kept snapshot");
      expect(upstream, name).toContain(skills[name]!.computedHash);
      expect(routing, name).toContain(`docs/ai/skills/${name}/SKILL.md`);
    }

    expect(
      existsSync(
        path.join(repoRoot, "docs/ai/skills/writing-great-skills/GLOSSARY.md"),
      ),
    ).toBe(true);
    expect(skills["writing-for-agents"]).toBeUndefined();
    expect(
      existsSync(path.join(repoRoot, "docs/ai/skills/writing-for-agents")),
    ).toBe(false);
    expect(routing).toContain("writing-for-agents");
    expect(routing).toContain("not lockfile-managed");
  });
});
