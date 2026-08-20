import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const REPO_ROOT = fileURLToPath(new URL("../../../", import.meta.url));
const MAX_ROOT_AGENTS_BYTES = 16_384;
const MAX_ROOT_AGENTS_LINES = 200;
const MAX_ROOT_AGENTS_LINE_LENGTH = 500;
const NESTED_AGENTS_PATHS = [
  "apps/admin/AGENTS.md",
  "apps/donor/AGENTS.md",
  "apps/missionary/AGENTS.md",
  "packages/api/AGENTS.md",
  "packages/auth/AGENTS.md",
  "packages/database/AGENTS.md",
  "packages/ui/AGENTS.md",
  "packages/eve-runtime/AGENTS.md",
  "scripts/AGENTS.md",
  "supabase/AGENTS.md",
] as const;

function readRepoFile(relativePath: string): string {
  return readFileSync(join(REPO_ROOT, relativePath), "utf8");
}

function parseApplyTo(source: string): string | undefined {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) {
    return undefined;
  }

  const apply = match[1].match(/^applyTo:\s*(.+)$/m);
  if (!apply) {
    return undefined;
  }

  return apply[1].trim().replace(/^["']|["']$/g, "");
}

function countOccurrences(haystack: string, needle: string): number {
  return haystack.split(needle).length - 1;
}

const LOCAL_REFERENCE_PREFIXES = [
  ".agents/",
  ".codex/",
  ".next-docs/",
  "apps/",
  "docs/",
  "node_modules/",
  "openspec/",
  "packages/",
  "scripts/",
  "supabase/",
] as const;

function extractDirectLocalReferences(source: string): string[] {
  const exactRootPaths = new Set(["AGENTS.md", "package.json", "turbo.json"]);
  const references = Array.from(source.matchAll(/`([^`\n]+)`/g), ([, value]) =>
    value.replace(/\/\*\*.*$/, "").replace(/\/$/, ""),
  ).filter(
    (value) =>
      exactRootPaths.has(value) ||
      LOCAL_REFERENCE_PREFIXES.some((prefix) => value.startsWith(prefix)),
  );

  return [...new Set(references)];
}

describe("agent instruction routing fixtures", () => {
  const agents = readRepoFile("AGENTS.md");
  const uiAgents = readRepoFile("packages/ui/AGENTS.md");
  const frontend = readRepoFile("docs/ai/rules/frontend.md");
  const skillRouting = readRepoFile("docs/ai/rules/agent-skill-routing.md");
  const tanstackGuide = readRepoFile(
    "docs/guides/development/tanstack-integration.md",
  );
  const packageManifests = [
    "package.json",
    "apps/admin/package.json",
    "apps/donor/package.json",
    "apps/missionary/package.json",
    "packages/database/package.json",
    "packages/ui/package.json",
  ]
    .map(readRepoFile)
    .join("\n");
  const tddSkill = readRepoFile("docs/ai/skills/tdd/SKILL.md");
  const moaiSkill = readRepoFile("docs/ai/skills/moai-library-shadcn/SKILL.md");
  const copilotRoot = readRepoFile(".github/copilot-instructions.md");
  const copilotStudio = readRepoFile(
    ".github/instructions/shadcn-studio-mcp.instructions.md",
  );
  const copilotUi = readRepoFile(
    ".github/instructions/packages-ui.instructions.md",
  );
  const copilotAppsUi = readRepoFile(
    ".github/instructions/apps-ui.instructions.md",
  );
  const componentsJson = readRepoFile("packages/ui/components.json");

  it("keeps root AGENTS.md inside the measured Codex instruction budget", () => {
    const bytes = Buffer.byteLength(agents, "utf8");
    const lines = agents.split(/\r?\n/);
    expect(bytes).toBeGreaterThan(5_000);
    expect(bytes).toBeLessThanOrEqual(MAX_ROOT_AGENTS_BYTES);
    expect(lines.length).toBeLessThanOrEqual(MAX_ROOT_AGENTS_LINES);
    expect(Math.max(...lines.map((line) => line.length))).toBeLessThanOrEqual(
      MAX_ROOT_AGENTS_LINE_LENGTH,
    );
    expect(countOccurrences(agents, "<!-- NEXT-AGENTS-MD-START -->")).toBe(0);
    expect(countOccurrences(agents, "<!-- NEXT-AGENTS-MD-END -->")).toBe(0);
    expect(countOccurrences(agents, "<!-- BEGIN:nextjs-agent-rules -->")).toBe(
      1,
    );
    expect(countOccurrences(agents, "<!-- END:nextjs-agent-rules -->")).toBe(1);
    const beginMarker = agents.indexOf("<!-- BEGIN:nextjs-agent-rules -->");
    const endMarker = agents.indexOf("<!-- END:nextjs-agent-rules -->");
    expect(beginMarker).toBe(0);
    expect(endMarker).toBeGreaterThan(beginMarker);
    expect(agents).toContain("base-maia");
    expect(agents).toContain("red-green-refactor");
    expect(agents).toContain("openspec/project.md");
    expect(agents).toContain("## Code review rules");
    expect(agents).not.toContain("## Cursor Cloud");
    expect(agents).not.toContain("## Required skills");
  });

  it("keeps every direct local reference in root AGENTS.md resolvable", () => {
    const managedBlockEnd = agents.indexOf("<!-- END:nextjs-agent-rules -->");
    const authoredInstructions = agents.slice(managedBlockEnd);
    const references = extractDirectLocalReferences(authoredInstructions);
    expect(references.length).toBeGreaterThan(30);

    for (const relativePath of references) {
      expect(
        () => statSync(join(REPO_ROOT, relativePath)),
        relativePath,
      ).not.toThrow();
    }
  });

  it("keeps task-specific catalogs out of the always-on root", () => {
    expect(agents).toContain("docs/ai/rules/agent-skill-routing.md");
    expect(agents).toContain("Codex discovers repository skills");
    expect(agents).not.toMatch(/docs\/ai\/skills\/[^`\s]+\/SKILL\.md/);
    expect(agents).not.toContain("Inngest MCP");
    expect(agents).not.toContain("TanStack Charts");
    expect(agents).not.toContain("REUI_LICENSE_KEY");
  });

  it("keeps nested AGENTS.md scoped and locally structured", () => {
    const nextjsAppAgents = new Set([
      "apps/admin/AGENTS.md",
      "apps/donor/AGENTS.md",
      "apps/missionary/AGENTS.md",
    ]);

    for (const relativePath of NESTED_AGENTS_PATHS) {
      const content = readRepoFile(relativePath);
      expect(content, relativePath).toContain("## Triggers");
      expect(content, relativePath).toMatch(/## Workflow( Steps)?/);
      expect(content, relativePath).toMatch(/## Checklist/);
      expect(content, relativePath).not.toContain("Source-of-truth order");
      if (nextjsAppAgents.has(relativePath)) {
        expect(content, relativePath).toContain(
          "<!-- BEGIN:nextjs-agent-rules -->",
        );
        expect(content, relativePath).toContain(
          "<!-- END:nextjs-agent-rules -->",
        );
        continue;
      }

      expect(content, relativePath).not.toContain(
        "<!-- BEGIN:nextjs-agent-rules -->",
      );
    }

    expect(readRepoFile("apps/admin/AGENTS.md")).toContain("3030");
    expect(readRepoFile("apps/admin/AGENTS.md")).toContain("Mission Control");
    expect(readRepoFile("apps/donor/AGENTS.md")).toContain("3000");
    expect(readRepoFile("apps/missionary/AGENTS.md")).toContain("4000");
  });

  it("routes UI, dashboard, form, registry, Base UI, and theme work through exact base-maia", () => {
    expect(JSON.parse(componentsJson)).toMatchObject({
      style: "base-maia",
      tailwind: {
        baseColor: "zinc",
        cssVariables: true,
      },
    });
    expect(agents).toContain("exact `base-maia`");
    expect(agents).toContain("packages/ui");
    expect(skillRouting).toContain(
      "docs/ai/skills/moai-library-shadcn/SKILL.md",
    );
    expect(uiAgents).toContain("base-maia");
    expect(uiAgents).toContain("Never run `shadcn init`");
    expect(uiAgents).toContain(".agents/skills/shadcn/");
    expect(uiAgents).toContain("bg-background");
    expect(uiAgents).toContain("text-foreground");
    expect(uiAgents).toContain("render");
    expect(uiAgents).toContain("not Radix `asChild`");
    expect(frontend).toContain("packages/ui/AGENTS.md");
    expect(moaiSkill).toContain("base-maia");
    expect(moaiSkill).toContain("Never run `shadcn init`");
    expect(copilotRoot).toContain("base-maia");
    expect(copilotUi).toContain("base-maia");
    expect(copilotAppsUi).toContain("packages/ui/AGENTS.md");
    expect(parseApplyTo(copilotUi)).toBe("packages/ui/**");
    expect(parseApplyTo(copilotAppsUi)).toBe("apps/**/*.{tsx,jsx,css}");
  });

  it("rejects alternate shadcn styles and conflicting registry islands in UI guidance", () => {
    expect(uiAgents).toMatch(/Another shadcn style \(`base-nova`/);
    expect(uiAgents).toContain("Do not keep the original visual system");
    expect(moaiSkill).toContain("base-nova");
    expect(agents).not.toMatch(/choose another shadcn style/i);
  });

  it("routes TDD for substantive work and exempts documentation-only edits", () => {
    expect(agents).toContain("red-green-refactor");
    expect(skillRouting).toContain("docs/ai/skills/tdd/SKILL.md");
    expect(tddSkill).toContain("/tdd");
    expect(tddSkill).toContain("/TDD");
    expect(tddSkill).toContain("Do not wait for the user to type `/tdd`");
    expect(tddSkill).toContain("documentation-only");
    expect(tddSkill).toContain("exact generated-mirror updates");
    expect(tddSkill).toContain("non-operative in Core");
  });

  it("routes Next.js work through explore-first, bundled docs, MCP, and agent-browser", () => {
    expect(agents).toContain("## Start every task");
    expect(agents).toContain("node_modules/next/dist/docs/");
    expect(agents).toContain(".next-docs/");
    expect(agents).toContain("live Next.js diagnostics");
    expect(agents).toContain("Cache Components");
    expect(agents).toContain("partial prefetching");
    expect(copilotRoot).toContain("apps/<app>/node_modules/next/dist/docs/");
  });

  it("routes TanStack work from installed packages only", () => {
    expect(packageManifests).toContain("@tanstack/react-query");
    expect(packageManifests).toContain("@tanstack/db");
    expect(packageManifests).toContain("@tanstack/react-form");
    expect(packageManifests).toContain("9.0.0-beta.9");
    expect(packageManifests).toContain("@tanstack/react-virtual");
    expect(packageManifests).not.toContain("@tanstack/react-charts");
    expect(packageManifests).not.toContain("@tanstack/react-hotkeys");
    expect(packageManifests).not.toContain("@tanstack/react-pacer");
    expect(tanstackGuide).toContain(
      "packages/ui/components/shadcn/data-table/tanstack.ts",
    );
  });

  it("routes Supabase, Payload, Stripe, Resend, Eve, and OpenSpec work without bloating root catalogs", () => {
    expect(skillRouting).toContain("docs/ai/skills/supabase/SKILL.md");
    expect(skillRouting).toContain(
      "docs/ai/skills/payloadcms-payload/SKILL.md",
    );
    expect(skillRouting).toContain(
      "docs/ai/skills/idempotency-handling/SKILL.md",
    );
    expect(skillRouting).toContain("docs/ai/skills/resend-cli/SKILL.md");
    expect(skillRouting).toContain("docs/ai/skills/eve/SKILL.md");
    expect(agents).toContain("openspec/project.md");
    expect(agents).toContain(
      "non-trivial behavior, workflow, or durable-convention changes",
    );
    expect(skillRouting).toContain(
      "**Resend CLI** (`docs/ai/skills/resend-cli/`)",
    );
    expect(
      readRepoFile("packages/eve-runtime/AGENTS.md").replace(/\s+/g, " "),
    ).toContain("Do not expose the full repository development skill library");
    expect(readRepoFile("supabase/AGENTS.md")).toContain(
      "docs/ai/skills/supabase/SKILL.md",
    );
  });

  it("keeps Cursor Cloud supabase workaround unique and seed-safe", () => {
    const cloud = readRepoFile("docs/guides/development/cursor-cloud.md");
    expect(cloud).toContain("docker info");
    expect(cloud).toContain('STAGING="$(mktemp -d)"');
    expect(cloud).toContain("$STAGING/seed.sql");
    expect(cloud).not.toContain("/tmp/supabase_mig_staging");
    expect(cloud).toContain("```bash");
  });

  it("keeps Copilot shadcn/studio instructions path-scoped", () => {
    expect(parseApplyTo(copilotStudio)).not.toBe("**");
    expect(parseApplyTo(copilotStudio)).toContain(
      "docs/ai/rules/shadcn-studio-mcp.md",
    );
    expect(copilotRoot).not.toContain("Skip for now");
  });
});

describe("agent instruction file inventory", () => {
  it("does not leave AGENTS.body.md as a second root source", () => {
    expect(() => statSync(join(REPO_ROOT, "AGENTS.body.md"))).toThrow();
  });

  it("keeps generated skill mirrors under the canonical trio", () => {
    const generatedRoots = [
      ".agents/skills",
      ".claude/skills",
      ".cursor/skills",
    ];
    for (const root of generatedRoots) {
      expect(readdirSync(join(REPO_ROOT, root)).length).toBeGreaterThan(0);
    }
  });
});
