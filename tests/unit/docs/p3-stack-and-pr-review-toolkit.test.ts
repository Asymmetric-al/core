import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const repoRoot = process.cwd();
const P3_COMMIT = "09909ebb5c0125e27fad3e57d96b81e832696d69";
const P3_LICENSE_SHA256 =
  "84195d1f9f76cc9ad7c1290981473fc725d9d255dfccc9bbe40d5639928158e2";
const APACHE_LICENSE_SHA256 =
  "cfc7749b96f63bd31c3c42b5c471bf756814053e847c10f3eb003417bc523d30";
const runtimeRoots = [".agents/skills", ".cursor/skills", ".claude/skills"];
const renamed: Record<string, string> = {
  "p3-tdd": "tdd",
  "p3-teach": "teach",
};
// Upstream prompt file -> [published launcher name, upstream LF sha256].
const reviewers: Record<string, [string, string]> = {
  "code-reviewer": [
    "pr-code-reviewer",
    "019395c3ce457460115cc703e2f4a86fed4bbe560dc58355051c4d877155d366",
  ],
  "code-simplifier": [
    "code-simplifier",
    "976ddb22b84bc5a714216531a75db5e73169554add6b953442beeedb49b56891",
  ],
  "comment-analyzer": [
    "comment-analyzer",
    "4a9c1f2eb8234a4b9231983e75739663d512e1aed242388964a165a719b84698",
  ],
  "pr-test-analyzer": [
    "pr-test-analyzer",
    "fcb1cde9ba7b21694b508766a8d6a79bc91bed9982f828f816210059934f46b4",
  ],
  "silent-failure-hunter": [
    "silent-failure-hunter",
    "fa9b0daec5a267e7e66435cc48b3328301fc9f70c3af259fe248881327a1babc",
  ],
  "type-design-analyzer": [
    "type-design-analyzer",
    "c1cf67843d3c4fd27ddf6b24aa92521414b16c01610e7f7e87212c7b8681198d",
  ],
};
// T3 Code tools the pack names; each needs a Core adapter mapping.
const t3ToolPattern =
  /\b(?:t3_[a-z_]+|delegate_task|task_status|task_cancel|orchestrator_capabilities|watch_pull_request|unwatch_pull_request|schedule_task|run_scheduled_task_now|delete_scheduled_task|link_pull_request|list_thread_pull_requests|request_secret|preview_[a-z_]+|device_[a-z_]+)\b/gu;

function read(relativePath: string) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function sha256(relativePath: string) {
  return createHash("sha256")
    .update(readFileSync(path.join(repoRoot, relativePath)))
    .digest("hex");
}

function frontmatter(content: string) {
  return /^---\n([\s\S]*?)\n---\n/u.exec(content)?.[1] ?? "";
}

function filesUnder(relativeRoot: string, directory = ""): string[] {
  return readdirSync(path.join(repoRoot, relativeRoot, directory), {
    withFileTypes: true,
  })
    .flatMap((entry) => {
      const relativePath = path.posix.join(directory, entry.name);
      return entry.isDirectory()
        ? filesUnder(relativeRoot, relativePath)
        : [relativePath];
    })
    .sort();
}

const lock = JSON.parse(read("skills-lock.json")) as {
  skills: Record<
    string,
    {
      source: string;
      sourceType: string;
      skillPath: string;
      computedHash: string;
    }
  >;
};
const p3Skills = Object.entries(lock.skills)
  .filter(([, entry]) => entry.source === "uzairansaruzi/p3-stack")
  .map(([name]) => name)
  .sort();

describe("p3-stack pack import", () => {
  it("pins all 51 upstream skills with CLI lock entries and per-skill provenance", () => {
    expect(p3Skills).toHaveLength(51);
    for (const name of p3Skills) {
      const upstreamName = renamed[name] ?? name;
      const root = `docs/ai/skills/${name}`;
      expect(lock.skills[name], name).toMatchObject({
        sourceType: "github",
        skillPath: `skills/${upstreamName}/SKILL.md`,
      });
      expect(sha256(`${root}/LICENSE`), name).toBe(P3_LICENSE_SHA256);
      const provenance = read(`${root}/references/upstream.md`);
      expect(provenance, name).toContain(`reviewed_commit: ${P3_COMMIT}`);
      expect(provenance, name).toContain(
        `skills_lock_hash: ${lock.skills[name]!.computedHash}`,
      );
      expect(provenance, name).toContain(
        `upstream_path: skills/${upstreamName}/`,
      );
    }
  });

  it("keeps every skill except p3-help explicit-only in Claude Code, Cursor, and Codex", () => {
    for (const name of p3Skills) {
      const skill = read(`docs/ai/skills/${name}/SKILL.md`);
      const metadata = frontmatter(skill);
      expect(metadata, name).toContain(`name: ${name}`);
      const codexMetadataPath = `docs/ai/skills/${name}/agents/openai.yaml`;
      if (name === "p3-help") {
        expect(metadata).not.toContain("disable-model-invocation");
        expect(existsSync(path.join(repoRoot, codexMetadataPath))).toBe(false);
        continue;
      }
      expect(metadata, name).toContain("disable-model-invocation: true");
      expect(read(codexMetadataPath), name).toContain(
        "allow_implicit_invocation: false",
      );
    }
  });

  it("ends every entrypoint with a marked Core overlay that keeps Core authority", () => {
    for (const name of p3Skills) {
      const skill = read(`docs/ai/skills/${name}/SKILL.md`);
      const overlay = skill.slice(skill.indexOf("<!-- CORE-OVERLAY-START -->"));
      expect(overlay, name).toContain(
        "## This repository (Asymmetric-al/core)",
      );
      expect(overlay, name).toContain("<!-- CORE-OVERLAY-END -->");
      expect(overlay, name).toContain("root `AGENTS.md`");
      expect(overlay, name).toContain("Confirm before outward-facing");
    }
    const mode = read("docs/ai/skills/p3-mode/SKILL.md");
    expect(mode).toContain("does not grant standing permission in Core");
    expect(mode).toContain("Never push to `develop` or `production` directly");
    expect(read("docs/ai/skills/p3-tdd/SKILL.md")).toContain(
      "`docs/ai/skills/tdd/SKILL.md` stays authoritative",
    );
    const botUi = read("docs/ai/skills/make-bot-ui/SKILL.md");
    expect(botUi).toContain("Bind to `127.0.0.1`");
    expect(botUi).toContain("require authenticated, CSRF-resistant requests");
    const help = read("docs/ai/skills/p3-help/SKILL.md");
    expect(help).toContain("explicit-only, so do not start it from here");
    expect(help).toContain("It never starts `p3-mode`");
    expect(help).not.toContain("do the work under it");
  });

  it("maps every T3 Code tool the pack names in the Core adapter", () => {
    const adapter = read("docs/ai/skills/p3-mode/references/core-adapter.md");
    const tools = new Set<string>();
    for (const name of p3Skills) {
      const root = `docs/ai/skills/${name}`;
      for (const file of filesUnder(root)) {
        if (!file.endsWith(".md") || file === "references/core-adapter.md")
          continue;
        for (const match of read(`${root}/${file}`).matchAll(t3ToolPattern))
          tools.add(match[0]);
      }
    }
    expect(tools.size).toBeGreaterThan(20);
    for (const tool of tools) {
      const family = /^(t3_queue|t3_pending_request|preview|device)_/u.exec(
        tool,
      )?.[1];
      const mapped =
        adapter.includes("`" + tool + "`") ||
        (family !== undefined && adapter.includes("`" + family + "_*`"));
      expect(mapped, tool).toBe(true);
    }
    expect(adapter).toContain("**One writer per branch.**");
    expect(adapter).toContain("continuous watching is unavailable");
    expect(adapter).toContain("`baseRef`, branch, or PR head SHA");
    expect(adapter).toContain("plain `git worktree remove <path>`");
    expect(read("docs/ai/skills/p3-mode/SKILL.md")).toContain(
      "Verifier and swarm verdicts stay in the local report",
    );
    expect(adapter).toContain("## Model roles");
    expect(adapter).toContain("`~/.agents/p3-models.md`");
    expect(read("docs/ai/skills/swarm/SKILL.md")).toContain(
      "`auto`, `inherit`, or `inherit-parent`, omit `target`",
    );
  });

  it("does not displace Core's own tdd and teach skills", () => {
    expect(lock.skills.tdd?.source).toBe("mattpocock/skills");
    expect(lock.skills.teach?.source).toBe("mattpocock/skills");
    expect(frontmatter(read("docs/ai/skills/tdd/SKILL.md"))).toContain(
      "name: tdd",
    );
  });

  it("resolves the pack's relative links and Core paths after the renames", () => {
    for (const name of p3Skills) {
      const root = `docs/ai/skills/${name}`;
      for (const file of filesUnder(root).filter((f) => f.endsWith(".md"))) {
        const content = read(`${root}/${file}`);
        for (const match of content.matchAll(/\]\(([^)]+)\)/gu)) {
          const target = match[1]!.split("#")[0]!;
          // Upstream templates use placeholders such as `[PR #123](url)`.
          if (!target || target.includes(":") || !/(?:\.md|\/)$/u.test(target))
            continue;
          expect(
            existsSync(
              path.resolve(repoRoot, root, path.dirname(file), target),
            ),
            `${root}/${file}: ${target}`,
          ).toBe(true);
        }
        for (const match of content.matchAll(/`(docs\/ai\/skills\/[^`<>]+)`/gu))
          expect(
            existsSync(path.join(repoRoot, match[1]!)),
            `${root}/${file}: ${match[1]}`,
          ).toBe(true);
        // Core-authored provenance and the adapter name the upstream paths
        // on purpose; vendored instructions must use the Core paths.
        if (
          file === "references/upstream.md" ||
          file === "references/core-adapter.md"
        )
          continue;
        expect(content, `${root}/${file}`).not.toMatch(
          /`agents\/(?:p3-agent|comment-sicko)\.md`|\(\.\.\/(?:tdd|teach)\/SKILL\.md\)|origin\/main|off main|from `main`|against `main`/u,
        );
      }
    }
  });

  it("keeps the reviewed log script executable and unslop's citable rule numbers", () => {
    expect(read("scripts/lib/skill-file-modes.mjs")).toContain(
      '["show-me-your-work", ["scripts/log.sh"]]',
    );
    if (process.platform !== "win32") {
      for (const root of ["docs/ai/skills", ...runtimeRoots]) {
        const script = path.join(
          repoRoot,
          root,
          "show-me-your-work/scripts/log.sh",
        );
        expect(statSync(script).mode & 0o111, root).not.toBe(0);
      }
    }
    const unslop = read("docs/ai/skills/unslop/SKILL.md");
    expect(unslop).toContain("5. **Vague attributions.**");
    expect(unslop).toContain("14. **Colon overuse.**");
    expect(unslop).toContain("22. **Sycophantic tone.**");
    expect(read(".prettierignore")).toContain("docs/ai/skills/unslop/SKILL.md");
    const gitignore = read(".gitignore");
    expect(gitignore).toContain("/p3-models.md");
    expect(gitignore).toContain("/orchestrate/");
    expect(gitignore).toMatch(/^decision\.tsv\r?$/mu);
    expect(read("docs/ai/skills/show-me-your-work/SKILL.md")).toContain(
      "`docs/ai/skills/show-me-your-work/scripts/log.sh <logfile>",
    );
    expect(read("docs/ai/skills/architect/SKILL.md")).toContain(
      "`docs/ai/skills/architect/references/runner-prompt.md`",
    );
  });
});

describe("pr-review-toolkit adaptation", () => {
  it("keeps review-pr explicit-only with the Apache-2.0 notice and six upstream prompts", () => {
    const skill = read("docs/ai/skills/review-pr/SKILL.md");
    const metadata = frontmatter(skill);
    expect(metadata).toContain("name: review-pr");
    expect(metadata).toContain("disable-model-invocation: true");
    expect(metadata).not.toContain("allowed-tools");
    expect(read("docs/ai/skills/review-pr/agents/openai.yaml")).toContain(
      "allow_implicit_invocation: false",
    );
    expect(sha256("docs/ai/skills/review-pr/LICENSE")).toBe(
      APACHE_LICENSE_SHA256,
    );
    expect(skill).toContain("Modified by Asymmetric-al/core");
    expect(skill).toContain("<!-- CORE-OVERLAY-END -->");
    expect(filesUnder("docs/ai/skills/review-pr/references/agents")).toEqual(
      Object.keys(reviewers).map((name) => `${name}.md`),
    );
    // Byte-identical upstream prompts carry no Apache-2.0 modification.
    for (const [upstream, [, hash]] of Object.entries(reviewers))
      expect(
        sha256(`docs/ai/skills/review-pr/references/agents/${upstream}.md`),
        upstream,
      ).toBe(hash);
    expect(read(".prettierignore")).toContain(
      "docs/ai/skills/review-pr/references/agents/",
    );
    expect(skill).toContain("by its actual impact");
    expect(skill).toContain("staged, unstaged, and untracked changes");
    expect(skill).toContain(
      "Run `pr-test-analyzer` whenever the change alters behavior",
    );
    expect(skill).not.toContain("Map Critical to P0");
    expect(lock.skills["review-pr"]).toBeUndefined();
  });

  it("does not reuse Cursor's existing code-reviewer agent name", () => {
    for (const root of [".cursor/agents", ".claude/agents"])
      expect(existsSync(path.join(repoRoot, root, "code-reviewer.md"))).toBe(
        false,
      );
  });

  it.each(Object.entries(reviewers))(
    "publishes %s as a Core launcher for Cursor and Claude Code",
    (upstream, [name]) => {
      const launcher = read(`.cursor/agents/${name}.md`);
      const metadata = frontmatter(launcher);
      expect(metadata).toContain(`name: ${name}`);
      expect(metadata).toContain("model: inherit");
      expect(metadata).toContain("review-pr skill");
      expect(metadata).not.toMatch(/proactive|automatically/iu);
      expect(metadata).toContain(
        name === "code-simplifier" ? "Edits files in scope." : "Read-only.",
      );
      expect(launcher).toContain(
        `docs/ai/skills/review-pr/references/agents/${upstream}.md`,
      );
      expect(launcher).toContain("unchanged byte for byte");
      expect(launcher).toContain("Modified by Asymmetric-al/core");
      expect(read(`.claude/agents/${name}.md`)).toBe(launcher);
    },
  );
});

describe("generated mirrors and routing", () => {
  it("publishes identical entrypoints to every runtime and routes both packs", () => {
    for (const name of [...p3Skills, "review-pr"]) {
      const canonical = read(`docs/ai/skills/${name}/SKILL.md`);
      for (const root of runtimeRoots)
        expect(read(`${root}/${name}/SKILL.md`), `${root}/${name}`).toBe(
          canonical,
        );
    }
    const routing = read("docs/ai/rules/agent-skill-routing.md");
    expect(routing).toContain("docs/ai/skills/p3-mode/SKILL.md");
    expect(routing).toContain(
      "docs/ai/skills/p3-mode/references/core-adapter.md",
    );
    expect(routing).toContain("docs/ai/skills/review-pr/SKILL.md");
  });
});
