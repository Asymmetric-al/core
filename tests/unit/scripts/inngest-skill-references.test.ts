import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { findBrokenInngestSkillReferences } from "../../../scripts/verify/inngest-skill-references.mjs";

const repoRoot = path.resolve(import.meta.dirname, "../../..");
const skillsRoot = path.join(repoRoot, "docs", "ai", "skills");
const refreshScriptPath = path.join(
  repoRoot,
  "scripts",
  "refresh-inngest-skills.mjs",
);

describe("Inngest skill reference verifier", () => {
  it("keeps vendored Inngest skill markdown links local and readable", async () => {
    await expect(findBrokenInngestSkillReferences()).resolves.toEqual([]);
  });

  it("vendors the current Inngest API skill split and drops the retired friction note", async () => {
    const refreshScript = await readFile(refreshScriptPath, "utf8");

    expect(refreshScript).toContain('"inngest-api-cli"');
    expect(refreshScript).toContain("rest-api-v2.md");
    expect(refreshScript).toContain("cli-commands.md");
    expect(refreshScript).not.toContain(
      "inngest-api/references/agent-friction.md",
    );

    expect(
      existsSync(
        path.join(skillsRoot, "inngest-api", "references", "rest-api-v2.md"),
      ),
    ).toBe(true);
    expect(
      existsSync(path.join(skillsRoot, "inngest-api-cli", "SKILL.md")),
    ).toBe(true);
    expect(
      existsSync(
        path.join(
          skillsRoot,
          "inngest-api-cli",
          "references",
          "cli-commands.md",
        ),
      ),
    ).toBe(true);
    expect(
      existsSync(
        path.join(skillsRoot, "inngest-api", "references", "agent-friction.md"),
      ),
    ).toBe(false);
  });

  it("points the rest-api-v2 Insights cross-reference at the vendored CLI companion", async () => {
    const restApi = await readFile(
      path.join(skillsRoot, "inngest-api", "references", "rest-api-v2.md"),
      "utf8",
    );

    expect(restApi).toContain(
      "../../inngest-api-cli/references/cli-commands.md#insights-sql-over-execution-data",
    );
    expect(restApi).not.toContain("(cli-commands.md");
  });
});
