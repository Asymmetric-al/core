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
  it("keeps the original 128 lockfile names", () => {
    expect(Object.keys(readLock().skills)).toHaveLength(128);
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
    ).toContain("v2.21.0");
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
