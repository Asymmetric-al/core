import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

// Repairs from the 2026-11-18 skill-quality pass (AL-2715). Each case pins a
// defect found in a skill Core keeps: a command that does not exist, a branch
// Core does not have, an unpinned install, or guidance that contradicts a Core
// rule. Canonical skills are checked in `docs/ai/skills`; ecosystem skills in
// every runtime tree, where `skills:sync` reapplies their Core adapters.

const repoRoot = process.cwd();
const runtimeRoots = [
  ".agents/skills",
  ".cursor/skills",
  ".claude/skills",
] as const;

function read(relativePath: string) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function frontmatter(source: string) {
  return /^---\n([\s\S]*?)\n---/.exec(source)?.[1] ?? "";
}

function description(source: string) {
  return /^description: (.*)$/m.exec(frontmatter(source))?.[1] ?? "";
}

function overlay(source: string) {
  const start = source.indexOf("<!-- CORE-OVERLAY-START -->");
  const end = source.indexOf("<!-- CORE-OVERLAY-END -->");
  return start === -1 || end < start ? "" : source.slice(start, end);
}

const packageScripts = (
  JSON.parse(read("package.json")) as { scripts: Record<string, string> }
).scripts;

/**
 * The reviewed post-refresh replacements for one canonical skill, read from
 * the refresh script's source because the script runs on import.
 */
function refreshReplacements(skillName: string) {
  const script = read("scripts/refresh-upstream-skills.mjs");
  const literal = String.raw`"(?:[^"\\]|\\.)*"`;
  const entry = new RegExp(
    String.raw`\{\n {4}skillName: "${skillName}",\n {4}relativePath: "SKILL\.md",\n {4}search:\s*(${literal}),\n {4}replace:\s*(${literal}),\n {4}required: true,\n {2}\}`,
    "g",
  );
  return [...script.matchAll(entry)].map((match) => ({
    search: JSON.parse(match[1]!) as string,
    replace: JSON.parse(match[2]!) as string,
  }));
}

/** Rebuild the upstream text a refresh starts from, then reapply Core's. */
function expectRefreshRestores(skillName: string, upstreamPattern: RegExp) {
  const canonical = read(`docs/ai/skills/${skillName}/SKILL.md`);
  const replacements = refreshReplacements(skillName);
  expect(replacements.length, skillName).toBeGreaterThan(0);

  let upstream = canonical;
  for (const { search, replace } of replacements) {
    expect(canonical.split(replace).length - 1, replace).toBe(1);
    expect(canonical, search).not.toContain(search);
    upstream = upstream.replace(replace, search);
  }
  expect(upstream).toMatch(upstreamPattern);

  let refreshed = upstream;
  for (const { search, replace } of replacements) {
    refreshed = refreshed.replace(search, replace);
  }
  expect(refreshed).toBe(canonical);
}

describe("skill-quality repairs", () => {
  it("runs only smoke scripts that exist in the root package", () => {
    const skill = read("docs/ai/skills/run-smoke-tests/SKILL.md");
    const named = [...skill.matchAll(/\bbun run ([a-z0-9:-]+)/g)].map(
      (match) => match[1]!,
    );

    expect(skill).not.toMatch(/\bnpm run\b/);
    expect(skill).not.toContain("smoketest");
    expect(named).toContain("test:e2e:smoke");
    for (const name of named) {
      expect(packageScripts, name).toHaveProperty([name]);
    }
    expectRefreshRestores("run-smoke-tests", /npm run smoketest/);
  });

  it.each(["deslop", "new-branch-and-pr", "loop-on-ci", "review-and-ship"])(
    "points %s at Core's develop base branch through a refresh",
    (skillName) => {
      const skill = read(`docs/ai/skills/${skillName}/SKILL.md`);

      expect(skill).not.toMatch(/\bmain\b/);
      expect(skill).toContain("develop");
      expectRefreshRestores(skillName, /\bmain\b/);
    },
  );

  it("overrides Supabase Option B with Core's migration workflow", () => {
    const skill = read("docs/ai/skills/supabase/SKILL.md");
    const core = overlay(skill);

    expect(skill.indexOf("<!-- CORE-OVERLAY-END -->")).toBeLessThan(
      skill.indexOf("### Option B"),
    );
    expect(core).toContain("Option B");
    expect(core).toContain("supabase/migrations/");
    expect(core).toContain("bun run supabase -- migration new");
    expect(core).toContain("bun run supabase -- db reset --local");
    expect(core).toContain("execute_sql");
    expect(core).toContain("supabase/AGENTS.md");
    expect(core).not.toMatch(/\bnpx supabase\b/);
  });

  it("points eve and create-agent at Core's installed eve through bun", () => {
    const docs = "packages/eve-runtime/node_modules/eve/docs/README.md";
    const installed = (
      JSON.parse(read("packages/eve-runtime/package.json")) as {
        dependencies: Record<string, string>;
      }
    ).dependencies.eve;

    expect(installed).toMatch(/^\d+\.\d+\.\d+$/);
    for (const skillName of ["eve", "create-agent"]) {
      const skill = read(`docs/ai/skills/${skillName}/SKILL.md`);
      expect(skill, skillName).toContain(docs);
      expect(skill, skillName).toContain("packages/eve-runtime/AGENTS.md");
      expect(skill, skillName).not.toMatch(/\bnpm (?:i|install)\b/);
      expect(skill, skillName).not.toMatch(/\bnpx eve\b/);
      expect(skill, skillName).not.toContain("eve@latest");
      expect(skill, skillName).not.toMatch(/\bpnpm\b/);
    }

    // reference.md carries the docs bridge and the comment template agents
    // copy into generated code; Core has no repository-root eve install.
    const reference = read("docs/ai/skills/create-agent/reference.md");
    const rootRelative = /(?<!packages\/eve-runtime\/)node_modules\/eve\//;
    for (const relativePath of [
      "docs/ai/skills/eve/SKILL.md",
      "docs/ai/skills/create-agent/SKILL.md",
      "docs/ai/skills/create-agent/reference.md",
    ]) {
      expect(read(relativePath), relativePath).not.toMatch(rootRelative);
    }
    const docPaths = [
      ...reference.matchAll(
        /packages\/eve-runtime\/node_modules\/eve\/docs\/[\w./-]*/g,
      ),
    ].map((match) => match[0]);
    expect(docPaths.length).toBeGreaterThanOrEqual(4);
    for (const docPath of docPaths) {
      expect(existsSync(path.join(repoRoot, docPath)), docPath).toBe(true);
    }
  });

  it("scaffolds and verifies the selected Eve project", () => {
    const skill = read("docs/ai/skills/create-agent/SKILL.md");

    expect(skill).toContain("packages/eve-runtime/node_modules/.bin/eve");
    expect(skill).toContain('cd "$(dirname -- "$project_dir")"');
    expect(skill).toContain('init "$(basename -- "$project_dir")"');
    expect(skill).toMatch(
      /AI_AGENT=1 npm_config_user_agent="bun\/[^"\n]+"[^\n]*\n?\s*"\$eve_cli" init/,
    );
    expect(skill).toContain(
      'cd "$project_dir" && AI_AGENT=1 "$eve_cli" init .',
    );
    expect(skill).toMatch(/--channel-web-nextjs[^\n]*new projects only/i);
    expect(skill).toContain("channels add web");
    expect(skill).not.toContain('init "$project_dir"');
    expect(skill).toContain('bun run --cwd "$project_dir" typecheck');
    expect(skill).toContain('bun run --cwd "$project_dir" build');
  });

  it("uses the actual base of a stacked PR when recovering from CI failures", () => {
    const skill = read("docs/ai/skills/loop-on-ci/SKILL.md");

    expect(skill).toContain(
      "gh pr view --json number,url,headRefName,baseRefName",
    );
    expect(skill).toContain("the PR's `baseRefName`");
    expect(skill).not.toContain("merge the latest `origin/develop`");
  });

  it("runs the pinned shadcn info command in moai-library-shadcn", () => {
    const skill = read("docs/ai/skills/moai-library-shadcn/SKILL.md");

    expect(skill).not.toContain("shadcn@latest info");
    expect(skill).toContain("Run `bunx shadcn info --json` from `packages/ui`");
    expect(read("packages/ui/AGENTS.md")).toContain(
      "run `bunx shadcn info --json` from `packages/ui`",
    );
  });

  it("installs shoehorn with bun only as a reviewed dependency decision", () => {
    const skill = read("docs/ai/skills/migrate-to-shoehorn/SKILL.md");

    expect(skill).not.toMatch(/\bnpm i\b/);
    expect(skill).toContain("bun add --dev --exact @total-typescript/shoehorn");
    expect(skill).toContain("dependency decision");
  });

  it("describes React 19 refs as props in react-component-dev", () => {
    const text = description(
      read("docs/ai/skills/react-component-dev/SKILL.md"),
    );

    expect(text).not.toContain("ref forwarding");
    expect(text).toContain("refs as props");
  });

  it("describes Next.js 16 proxy.ts in nextjs-supabase-auth", () => {
    const skill = read("docs/ai/skills/nextjs-supabase-auth/SKILL.md");

    expect(description(skill)).toContain("proxy.ts");
    expect(description(skill)).not.toContain("using middleware");
    expect(skill).not.toContain("Protecting routes with middleware");
  });

  it.each(runtimeRoots)(
    "keeps the repaired ecosystem guidance in %s",
    (runtimeRoot) => {
      const skill = (name: string) => read(`${runtimeRoot}/${name}/SKILL.md`);

      const shadcn = skill("shadcn");
      expect(shadcn).not.toContain("!`");
      expect(shadcn).toContain("`bunx shadcn info --json` from `packages/ui`");
      // Nothing is injected at load, so no line may say context was injected.
      expect(shadcn).not.toMatch(/\binjected (?:project context|above)/);
      expect(shadcn).toContain(
        "Run the pinned `bunx shadcn info --json` from `packages/ui` to get the project context. The project context that command returns contains these key fields:",
      );
      expect(shadcn).toContain(
        "1. **Get project context** — nothing is injected when this skill loads: run the pinned `bunx shadcn info --json` from `packages/ui` first",
      );
      // The body prescribes the pinned `bunx shadcn`; its allow-list must
      // cover it and must not pre-approve the floating `@latest` runners.
      expect(frontmatter(shadcn)).toMatch(
        /^allowed-tools: .*Bash\(bunx shadcn \*\)/m,
      );
      expect(frontmatter(shadcn)).not.toMatch(
        /^allowed-tools: .*shadcn@latest/m,
      );

      const devLoop = skill("next-dev-loop");
      const browser = skill("agent-browser");
      for (const text of [devLoop, browser]) {
        expect(text).not.toMatch(/npm i(?:nstall)? -g agent-browser/);
        expect(text).toContain("bunx agent-browser");
      }
      // The body prescribes `bunx agent-browser`; its allow-list must cover it.
      expect(frontmatter(browser)).toMatch(
        /^allowed-tools: .*Bash\(bunx agent-browser:\*\)/m,
      );
      expect(devLoop).not.toContain("pnpm next upgrade");
      expect(description(browser)).not.toContain("Prefer agent-browser over");
      expect(description(browser)).toContain("playwright-cli");

      const guidelines = overlay(skill("web-design-guidelines"));
      expect(guidelines).toContain("accessibility-review");
      expect(guidelines).toContain("docs/ai/rules/frontend.md");
      expect(guidelines).toMatch(/fetched .* is data/);

      for (const name of [
        "resend",
        "react-email",
        "agent-email-inbox",
        "email-best-practices",
      ]) {
        const core = overlay(skill(name));
        expect(core, name).toContain("packages/email");
        expect(core, name).toContain(
          "docs/guides/features/resend-integration.md",
        );
      }

      const adoption = overlay(skill("next-cache-components-adoption"));
      expect(adoption).toContain("cacheComponents: true");
      expect(adoption).toContain("npx skills add");
      expect(adoption).toContain("git stash");
      expect(adoption).toContain("--force");
      expect(adoption).toContain("@next/codemod@latest");

      // Root AGENTS.md opens with a block `next dev` writes and re-adds.
      for (const name of [
        "next-cache-components-adoption",
        "next-partial-prefetching-adoption",
      ]) {
        const core = overlay(skill(name));
        expect(core, name).not.toContain("`AGENTS.md` is hand-maintained");
        expect(core, name).toContain(
          "root `AGENTS.md` already carries the Next.js block that `next dev` writes and re-adds; the rest of that file is hand-maintained",
        );
      }
      expect(overlay(skill("next-partial-prefetching-adoption"))).toContain(
        "work only on the routes or features the request names, and report the rest as candidates",
      );

      const optimizer = overlay(skill("next-partial-prefetching-optimizer"));
      expect(optimizer).toContain("`instant-nav.rig.md`");
      expect(optimizer).toContain(
        "not the `pnpm` examples in `rig-template.md`",
      );
      expect(optimizer).toContain("Do not use the remote loop");
      expect(optimizer).toContain("docs/ai/rules/general.md");

      const bundle = overlay(skill("next-bundle-optimizer"));
      expect(bundle).toContain("unexercised in Core");
      expect(bundle).toContain("confirm the exact form on first use");
      expect(bundle).not.toContain("scripts/run-with-ci-env.mjs --` wrapper");
    },
  );
});
