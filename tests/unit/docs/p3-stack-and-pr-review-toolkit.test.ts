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
const reviewers = [
  "code-reviewer",
  "code-simplifier",
  "comment-analyzer",
  "pr-test-analyzer",
  "silent-failure-hunter",
  "type-design-analyzer",
];

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
    expect(read("docs/ai/skills/make-bot-ui/SKILL.md")).toContain(
      "Bind to `127.0.0.1`",
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
      reviewers.map((name) => `${name}.md`),
    );
    expect(lock.skills["review-pr"]).toBeUndefined();
  });

  it.each(reviewers)(
    "publishes %s as a Core launcher for Cursor and Claude Code",
    (name) => {
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
        `docs/ai/skills/review-pr/references/agents/${name}.md`,
      );
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
