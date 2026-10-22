import { createHash } from "node:crypto";
import { existsSync, lstatSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const repoRoot = process.cwd();
const runtimeRoots = [
  ".agents/skills",
  ".cursor/skills",
  ".claude/skills",
] as const;
const retainedSnapshots = new Set([
  "better-forms",
  "clean-code",
  "remotion-best-practices",
  "tailwind-v4-shadcn",
  "pdf",
]);

// Reviewed baseline c4d36cb029121641b8882237632d0d6da434049e; this task adds only security-audit.
const baselineSkillNames = [
  "accessibility-review",
  "agent-browser",
  "agent-email-inbox",
  "anim",
  "animate",
  "animate-expo",
  "animation-vocabulary",
  "api-design-principles",
  "apple-design",
  "architecture-patterns",
  "ask-matt",
  "ask-sonner",
  "babysit",
  "base-ui",
  "bats-testing-patterns",
  "bendc-frontend-guidelines",
  "better-accessibility",
  "better-colors",
  "better-forms",
  "better-interface",
  "better-layout",
  "better-typography",
  "better-ui",
  "better-writing",
  "cache-components",
  "check-compiler-errors",
  "claude-handoff",
  "clean-code",
  "cms-migration",
  "code-review",
  "code-review-excellence",
  "codebase-design",
  "commit",
  "components-build",
  "control-cli",
  "control-ui",
  "create-agent",
  "deploy-to-vercel",
  "deployment-pipeline-design",
  "design-an-interface",
  "design-system-patterns",
  "design-taste-frontend",
  "deslop",
  "diagnosing-bugs",
  "domain-model",
  "domain-modeling",
  "edit-article",
  "email-best-practices",
  "emil-design-eng",
  "emil-design-engineering",
  "emil-prototype",
  "eve",
  "find-animation-opportunities",
  "find-skills",
  "fix-ci",
  "fix-merge-conflicts",
  "frontend-design",
  "get-pr-comments",
  "git-guardrails-claude-code",
  "github-actions-templates",
  "grill-for-unknowns",
  "grill-me",
  "grill-with-docs",
  "grilling",
  "handoff",
  "idempotency-handling",
  "impeccable",
  "implement",
  "improve",
  "improve-animations",
  "improve-codebase-architecture",
  "inngest",
  "inngest-agents",
  "inngest-api",
  "inngest-api-cli",
  "inngest-brownfield-audit",
  "inngest-durable-functions",
  "inngest-events",
  "inngest-flow-control",
  "inngest-middleware",
  "inngest-realtime",
  "inngest-setup",
  "inngest-steps",
  "inngest-v3-v4-migration",
  "interface-design",
  "interface-review",
  "lint-and-validate",
  "loop-me",
  "loop-on-ci",
  "make-pr-easy-to-review",
  "migrate-to-shoehorn",
  "moai-library-shadcn",
  "mobile-native",
  "motion",
  "nestjs-best-practices",
  "new-branch-and-pr",
  "next-cache-components-adoption",
  "next-cache-components-optimizer",
  "next-dev-loop",
  "nextjs-app-architecture",
  "nextjs-app-router",
  "nextjs-supabase-auth",
  "nodejs-backend-patterns",
  "npm-deps-cleanup",
  "obsidian-vault",
  "openspec-apply-change",
  "openspec-archive-change",
  "openspec-explore",
  "openspec-propose",
  "openspec-sync-specs",
  "openspec-update-change",
  "openspec-verify-change",
  "payload",
  "pdf",
  "pick-ui-library",
  "playwright-best-practices",
  "playwright-cli",
  "playwright-skill",
  "pr-review-canvas",
  "prd-to-plan",
  "prompt-engineering-patterns",
  "prototype",
  "qa",
  "react-component-dev",
  "react-doctor",
  "react-email",
  "react-state-management",
  "rechart",
  "redesign-existing-projects",
  "remotion-best-practices",
  "repo-entry",
  "request-refactor-plan",
  "research",
  "resend",
  "resend-cli",
  "resolving-merge-conflicts",
  "reui",
  "review-and-ship",
  "review-animations",
  "run-smoke-tests",
  "samson-factory",
  "scaffold-exercises",
  "setup-matt-pocock-skills",
  "setup-pre-commit",
  "shadcn",
  "shadcn-ui",
  "skill-creator",
  "stripe-best-practices",
  "stripe-integration",
  "stripe-projects",
  "supabase",
  "supabase-postgres-best-practices",
  "systematic-debugging",
  "tailwind-design-system",
  "tailwind-v4-shadcn",
  "tdd",
  "teach",
  "test-driven-development",
  "thermo-nuclear-code-quality-review",
  "tiptap",
  "to-spec",
  "to-tickets",
  "triage",
  "turborepo",
  "typescript-advanced-types",
  "typescript-expert",
  "ubiquitous-language",
  "upgrade-stripe",
  "use-dom",
  "vercel-cli-with-tokens",
  "vercel-composition-patterns",
  "vercel-optimize",
  "vercel-react-best-practices",
  "vercel-react-native-skills",
  "vercel-react-view-transitions",
  "verify-this",
  "vitest",
  "wayfinder",
  "web-design-guidelines",
  "webapp-testing",
  "weekly-review",
  "what-did-i-get-done",
  "wizard",
  "workflow-from-chats",
  "write-swift",
  "writing-beats",
  "writing-fragments",
  "writing-great-skills",
  "writing-shape",
] as const;

const reviewedEcosystemSkills = [
  {
    name: "api-design-principles",
    source: "wshobson/agents",
    skillPath:
      "plugins/backend-development/skills/api-design-principles/SKILL.md",
    reviewedCommit: "0874a27b17a22e2b7c2e2bcd725768e0803cad06",
    computedHash:
      "1f6166c23c0a0f32d703c19d84b3c30c2873daefb9e8732339a009934fa17013",
    licenses: {
      "references/LICENSE.md":
        "8ceaab71b527eb5db43810b74afc618ee36556197d2d51c45fd00aac483988c1",
    },
  },
  {
    name: "architecture-patterns",
    source: "wshobson/agents",
    skillPath:
      "plugins/backend-development/skills/architecture-patterns/SKILL.md",
    reviewedCommit: "0874a27b17a22e2b7c2e2bcd725768e0803cad06",
    computedHash:
      "350caf22b856b7d2908a10a69a8cc13e743c757ba9838716051b4e29fc1d7595",
    licenses: {
      "references/LICENSE.md":
        "8ceaab71b527eb5db43810b74afc618ee36556197d2d51c45fd00aac483988c1",
    },
  },
  {
    name: "deployment-pipeline-design",
    source: "wshobson/agents",
    skillPath:
      "plugins/cicd-automation/skills/deployment-pipeline-design/SKILL.md",
    reviewedCommit: "0874a27b17a22e2b7c2e2bcd725768e0803cad06",
    computedHash:
      "9a56bd9401c1dc8ef5a15758d7234f211193097ddb3895d46d1ddcd730687b18",
    licenses: {
      "references/LICENSE.md":
        "8ceaab71b527eb5db43810b74afc618ee36556197d2d51c45fd00aac483988c1",
    },
  },
  {
    name: "github-actions-templates",
    source: "wshobson/agents",
    skillPath:
      "plugins/cicd-automation/skills/github-actions-templates/SKILL.md",
    reviewedCommit: "0874a27b17a22e2b7c2e2bcd725768e0803cad06",
    computedHash:
      "fc3c06ddb2423804be275defbb8a2c35f1564ba28aaeb07dcf01ec9c4cc8f023",
    licenses: {
      "references/LICENSE.md":
        "8ceaab71b527eb5db43810b74afc618ee36556197d2d51c45fd00aac483988c1",
    },
  },
  {
    name: "code-review-excellence",
    source: "wshobson/agents",
    skillPath:
      "plugins/developer-essentials/skills/code-review-excellence/SKILL.md",
    reviewedCommit: "0874a27b17a22e2b7c2e2bcd725768e0803cad06",
    computedHash:
      "1e264e04e7d2db9f4de3d34576f444650233752ba79396ea96c1f8dc8df486ea",
    licenses: {
      "references/LICENSE.md":
        "8ceaab71b527eb5db43810b74afc618ee36556197d2d51c45fd00aac483988c1",
    },
  },
  {
    name: "react-state-management",
    source: "wshobson/agents",
    skillPath:
      "plugins/frontend-mobile-development/skills/react-state-management/SKILL.md",
    reviewedCommit: "0874a27b17a22e2b7c2e2bcd725768e0803cad06",
    computedHash:
      "71abf349b19fe5cef64f4e4f2dd4a89011a5e947d8ce278d53a489292f508032",
    licenses: {
      "references/LICENSE.md":
        "8ceaab71b527eb5db43810b74afc618ee36556197d2d51c45fd00aac483988c1",
    },
  },
  {
    name: "tailwind-design-system",
    source: "wshobson/agents",
    skillPath:
      "plugins/frontend-mobile-development/skills/tailwind-design-system/SKILL.md",
    reviewedCommit: "0874a27b17a22e2b7c2e2bcd725768e0803cad06",
    computedHash:
      "b6577edb7b7f71a6954f68b80c7eea1748ccdf31862759f864bce558fb2bcf83",
    licenses: {
      "references/LICENSE.md":
        "8ceaab71b527eb5db43810b74afc618ee36556197d2d51c45fd00aac483988c1",
    },
  },
  {
    name: "nodejs-backend-patterns",
    source: "wshobson/agents",
    skillPath:
      "plugins/javascript-typescript/skills/nodejs-backend-patterns/SKILL.md",
    reviewedCommit: "0874a27b17a22e2b7c2e2bcd725768e0803cad06",
    computedHash:
      "d52e1150accdc27e916f0962c9ba0872fcbe8a7d849d905dcc795c0f9d05aeae",
    licenses: {
      "references/LICENSE.md":
        "8ceaab71b527eb5db43810b74afc618ee36556197d2d51c45fd00aac483988c1",
    },
  },
  {
    name: "typescript-advanced-types",
    source: "wshobson/agents",
    skillPath:
      "plugins/javascript-typescript/skills/typescript-advanced-types/SKILL.md",
    reviewedCommit: "0874a27b17a22e2b7c2e2bcd725768e0803cad06",
    computedHash:
      "c32101c65134d94ef1a3305ef486020b57be6408f97ed952c9c560e3fe04188d",
    licenses: {
      "references/LICENSE.md":
        "8ceaab71b527eb5db43810b74afc618ee36556197d2d51c45fd00aac483988c1",
    },
  },
  {
    name: "prompt-engineering-patterns",
    source: "wshobson/agents",
    skillPath:
      "plugins/llm-application-dev/skills/prompt-engineering-patterns/SKILL.md",
    reviewedCommit: "0874a27b17a22e2b7c2e2bcd725768e0803cad06",
    computedHash:
      "6a210b15be01bc6f76a74ec1e46302dee310ddf79d2def63fc9b7c54221fe329",
    licenses: {
      "references/LICENSE.md":
        "8ceaab71b527eb5db43810b74afc618ee36556197d2d51c45fd00aac483988c1",
    },
  },
  {
    name: "stripe-integration",
    source: "wshobson/agents",
    skillPath: "plugins/payment-processing/skills/stripe-integration/SKILL.md",
    reviewedCommit: "0874a27b17a22e2b7c2e2bcd725768e0803cad06",
    computedHash:
      "32b5a60d3f6cad896b3dc468ee7b81e55afa61adf740512e95a411efdb4ae0f6",
    licenses: {
      "references/LICENSE.md":
        "8ceaab71b527eb5db43810b74afc618ee36556197d2d51c45fd00aac483988c1",
    },
  },
  {
    name: "bats-testing-patterns",
    source: "wshobson/agents",
    skillPath: "plugins/shell-scripting/skills/bats-testing-patterns/SKILL.md",
    reviewedCommit: "0874a27b17a22e2b7c2e2bcd725768e0803cad06",
    computedHash:
      "d7992dbf589789f1ae446161d86c1cab026b9dfc4acfed5491d552be97338e62",
    licenses: {
      "references/LICENSE.md":
        "8ceaab71b527eb5db43810b74afc618ee36556197d2d51c45fd00aac483988c1",
    },
  },
  {
    name: "design-system-patterns",
    source: "wshobson/agents",
    skillPath: "plugins/ui-design/skills/design-system-patterns/SKILL.md",
    reviewedCommit: "0874a27b17a22e2b7c2e2bcd725768e0803cad06",
    computedHash:
      "618355f0e6c6ba8ca5d231035c9da18302fe6894aedce565743e9181b6c928ee",
    licenses: {
      "references/LICENSE.md":
        "8ceaab71b527eb5db43810b74afc618ee36556197d2d51c45fd00aac483988c1",
    },
  },
  {
    name: "skill-creator",
    source: "anthropics/skills",
    skillPath: "skills/skill-creator/SKILL.md",
    reviewedCommit: "dbd4588f9e1033efb41dad4bef2f7947c8993d44",
    computedHash:
      "dcd4803e61e913e6fc27294184cd3a71f09f5e924ff20c8a9a20173e7b3c2bcf",
    licenses: {
      "LICENSE.txt":
        "bc6b3af2f331cbc7fb0da1344efb2cbe5877a31498b4d70dbc7000f3405a1362",
    },
  },
  {
    name: "systematic-debugging",
    source: "obra/superpowers",
    skillPath: "skills/systematic-debugging/SKILL.md",
    reviewedCommit: "2ce8aa15d05bd57213e6f746f953aafb7ded7a8b",
    computedHash:
      "51c6435d98c83c42c96ba7c35725a0b2c376cd487fb1a4e6bd0ddbe7e33ef202",
    licenses: {
      "references/LICENSE.md":
        "a37e0e9697144819e1d965176ac4ae5bc3fa02d11e7812036bbcadf6dafe2400",
    },
  },
  {
    name: "shadcn-ui",
    source: "google-labs-code/stitch-skills",
    skillPath: "plugins/stitch-build/skills/shadcn-ui/SKILL.md",
    reviewedCommit: "0337446dadde6f8c94210444e2aa9d546126480f",
    computedHash:
      "2ddfe599ac2ba631ca019f7b6e37ee5df9cd34f83fc016f6ea9d4ba5bbfa0304",
    licenses: {
      "references/LICENSE.md":
        "b4133a55232c0996713349891dc55469d46a16ec027c033c9e4108b2149abb42",
    },
  },
  {
    name: "interface-design",
    source: "Dammyjay93/interface-design",
    skillPath: ".claude/skills/interface-design/SKILL.md",
    reviewedCommit: "2f9be3206855bcb2d1d0af262c8bae25cba6658d",
    computedHash:
      "720b31a31276e899fbe3006a33cbfeaceb77a73ba4c27b80d29afd38c8b7b208",
    licenses: {
      "references/LICENSE.md":
        "54c405ef24e71634b73c994133d028e7a96d1906f42615366296d6583dcaba8f",
    },
  },
  {
    name: "use-dom",
    source: "expo/skills",
    skillPath: "plugins/expo/skills/expo-dom/SKILL.md",
    reviewedCommit: "3d1ca4e2a3c5ffc14817a85dde0bf1b188e9753d",
    computedHash:
      "b388777e22619b24bed4b0dc76afa52e1f8c0fe23cb1e90d869d0159ba5167dd",
    licenses: {
      "references/LICENSE.md":
        "49c5f9c7097c9a940ff663a54c27a4c60e379df6cc2b3052df0d37a09a85df93",
    },
  },
  {
    name: "lint-and-validate",
    source: "davila7/claude-code-templates",
    skillPath:
      "cli-tool/components/skills/development/lint-and-validate/SKILL.md",
    reviewedCommit: "5bbe5a76f1feb48cdadee248fd169cf53e053783",
    computedHash:
      "2ade7398d02788f2b52cbc72c5e4313dd7ff9843c7b6748d342577b83ec92d68",
    licenses: {
      "references/LICENSE.md":
        "a55a73d663695ef30cb5c865b777f8205165f512719a4978f2855b2df71dd682",
    },
  },
  {
    name: "typescript-expert",
    source: "davila7/claude-code-templates",
    skillPath:
      "cli-tool/components/skills/development/typescript-expert/SKILL.md",
    reviewedCommit: "5bbe5a76f1feb48cdadee248fd169cf53e053783",
    computedHash:
      "88b62c21b51eae08cd9af282d29d5adb9fa06626af59768cd4e9d739791e5a65",
    licenses: {
      "references/LICENSE-claudekit.md":
        "ad877e194d5f86a095f08f641bf8fd614af314e404b0c20684dd4003d764d481",
      "references/LICENSE.md":
        "a55a73d663695ef30cb5c865b777f8205165f512719a4978f2855b2df71dd682",
    },
  },
] as const;

// Hashes retain the excluded PDF payload without reproducing its contents.
const pdfBaselineHashes = {
  "LICENSE.txt":
    "79f6d8f5b427252fa3b1c11ecdbdb6bf610b944f7530b4de78f770f38741cfaa",
  "SKILL.md":
    "c6ec597784914c8cdce5f2235164f48fbb847a4441a1bf3f74ba69d9bec6662b",
  "forms.md":
    "9530b3f57034792e0242a3abfe8b3c296466329551916f2ff6c5a70db78f7e44",
  "reference.md":
    "5217a563a2758ff6c232ac2151bc53550bd720a39d0a878f7f8f40c0f606c07a",
  "scripts/check_bounding_boxes.py":
    "0ced522402dd7b3c82a0be9518cf4e485fa9cc0467d7beab6ddb04cb36fcc3e1",
  "scripts/check_fillable_fields.py":
    "1fe10b9980a5493c9bbec8c20630c603eaa475b45403751c08f26738736647b8",
  "scripts/convert_pdf_to_images.py":
    "7f58e292a67e18a8ff000d30bad2469389546731f7e8a698cc1d0aed001ea15d",
  "scripts/create_validation_image.py":
    "8fa9fd7962c9f940045b81cf6b991e7c1057c1838e3f9cc6d305007a222ffebf",
  "scripts/extract_form_field_info.py":
    "bb235b36f497bbb1c7c6821cecf527bbba7213520de11219da99f7b13a38c109",
  "scripts/extract_form_structure.py":
    "6814e3fe8f78c2b16d766c132b5a727ff7a31b71d76a7d46bd6e40fe50bc97c5",
  "scripts/fill_fillable_fields.py":
    "d140872c2e92e41b1e05370ae8d270c5b7f5ebdf55d9905f03bc974a9c708ff5",
  "scripts/fill_pdf_form_with_annotations.py":
    "8a56e063a49ed53c0b0e1d312ecf8023af76816ed139486ec3b539873de202fd",
} as const;

function readRepoFile(relativePath: string) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function digest(relativePath: string) {
  return createHash("sha256")
    .update(readFileSync(path.join(repoRoot, relativePath)))
    .digest("hex");
}

function installedSkills(runtimeRoot: string) {
  return readdirSync(path.join(repoRoot, runtimeRoot), { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isDirectory() &&
        existsSync(path.join(repoRoot, runtimeRoot, entry.name, "SKILL.md")),
    )
    .map((entry) => entry.name)
    .sort();
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

function readLock() {
  return JSON.parse(readRepoFile("skills-lock.json")) as {
    skills: Record<
      string,
      {
        source?: string;
        sourceType?: string;
        skillPath?: string;
        computedHash?: string;
      }
    >;
  };
}

describe("reviewed installed skill inventory", () => {
  it("accounts for every installed skill without adding unrelated pack skills", () => {
    const expectedNames = [...baselineSkillNames, "security-audit"].sort();
    const { skills } = readLock();

    for (const runtimeRoot of runtimeRoots) {
      expect(installedSkills(runtimeRoot), runtimeRoot).toEqual(expectedNames);
    }

    for (const name of installedSkills(".agents/skills")) {
      const canonical = existsSync(
        path.join(repoRoot, "docs/ai/skills", name, "SKILL.md"),
      );
      expect(
        canonical || Object.hasOwn(skills, name) || retainedSnapshots.has(name),
        "unowned installed skill: " + name,
      ).toBe(true);
    }
  });

  it.each(reviewedEcosystemSkills)(
    "keeps the reviewed source, provenance, license, and Core adapter for $name",
    (skill) => {
      const { skills } = readLock();
      const root = ".agents/skills/" + skill.name;
      const provenance = readRepoFile(root + "/references/upstream.md");
      const entrypoint = readRepoFile(root + "/SKILL.md");

      expect(skills[skill.name]).toMatchObject({
        source: skill.source,
        sourceType: "github",
        skillPath: skill.skillPath,
        computedHash: skill.computedHash,
      });
      expect(provenance).toContain("reviewed_commit: " + skill.reviewedCommit);
      expect(provenance).toContain("skills_lock_hash: " + skill.computedHash);
      expect(provenance).toContain("ownership: ecosystem");
      expect(entrypoint).toContain("\nname: " + skill.name + "\n");
      expect(entrypoint).toContain("<!-- CORE-OVERLAY-START -->");
      expect(entrypoint).toContain("<!-- CORE-OVERLAY-END -->");

      for (const [licensePath, hash] of Object.entries(skill.licenses)) {
        expect(digest(root + "/" + licensePath), licensePath).toBe(hash);
      }
    },
  );

  it("keeps all reviewed ecosystem adapters configured for reinstall recovery", () => {
    const overlays = JSON.parse(
      readRepoFile("scripts/refresh-overlays/ecosystem-core-overlays.json"),
    ) as { skills: Array<{ name: string; overlay: string }> };
    const guidance = JSON.parse(
      readRepoFile("scripts/refresh-overlays/ecosystem-core-guidance.json"),
    ) as { replacements: Array<{ path: string }> };
    expect(overlays.skills.map((skill) => skill.name).sort()).toEqual(
      reviewedEcosystemSkills.map((skill) => skill.name).sort(),
    );
    for (const skill of overlays.skills) {
      expect(skill.overlay).toContain("<!-- CORE-OVERLAY-START -->");
      expect(skill.overlay).toContain("<!-- CORE-OVERLAY-END -->");
    }
    expect(
      guidance.replacements.map((replacement) => replacement.path),
    ).toEqual(
      expect.arrayContaining([
        "api-design-principles/assets/rest-api-template.py",
        "skill-creator/eval-viewer/generate_review.py",
        "use-dom/agents/openai.yaml",
        "interface-design/agents/openai.yaml",
        "lint-and-validate/SKILL.md",
        "typescript-expert/SKILL.md",
      ]),
    );
  });

  it("keeps renamed Expo invocation compatible and product-design exploration explicit", () => {
    const expoSkill = readRepoFile(".agents/skills/use-dom/SKILL.md");
    const expoMetadata = readRepoFile(
      ".agents/skills/use-dom/agents/openai.yaml",
    );
    const interfaceSkill = readRepoFile(
      ".agents/skills/interface-design/SKILL.md",
    );
    const interfaceMetadata = readRepoFile(
      ".agents/skills/interface-design/agents/openai.yaml",
    );
    expect(expoSkill).toContain("\nname: use-dom\n");
    expect(expoMetadata).toContain("$use-dom");
    expect(expoMetadata).not.toContain("$expo-dom");
    expect(existsSync(path.join(repoRoot, ".agents/skills/expo-dom"))).toBe(
      false,
    );
    expect(interfaceSkill).toContain("disable-model-invocation: true");
    expect(interfaceMetadata).toContain("allow_implicit_invocation: false");
  });

  it("retains reviewed helper repairs and configured Core validation", () => {
    expect(
      readRepoFile(
        ".agents/skills/skill-creator/eval-viewer/generate_review.py",
      ),
    ).toContain('json.dumps(embedded).replace("<", "\\\\u003c")');
    expect(
      readRepoFile(
        ".agents/skills/api-design-principles/assets/rest-api-template.py",
      ),
    ).toContain("detail_dict = detail if isinstance(detail, dict) else None");
    const table = readRepoFile(
      ".agents/skills/shadcn-ui/examples/data-table.tsx",
    );
    expect(table).toContain("render={");
    expect(table).toContain("<DropdownMenuGroup>");
    expect(table).not.toContain("asChild");
    const lint = readRepoFile(".agents/skills/lint-and-validate/SKILL.md");
    expect(lint).not.toContain("npm audit");
    expect(lint).not.toContain("--fix");
    const typescript = readRepoFile(
      ".agents/skills/typescript-expert/SKILL.md",
    );
    expect(typescript).not.toContain("bundle:");
    expect(typescript).not.toContain("recommend switching and stop");
    expect(typescript).toContain("bun run typecheck");
  });

  it("resolves vendored Markdown file links within the refreshed skill packages", () => {
    for (const skill of reviewedEcosystemSkills) {
      const root = ".agents/skills/" + skill.name;
      const absoluteRoot = path.join(repoRoot, root);
      for (const file of filesUnder(root).filter((name) =>
        name.endsWith(".md"),
      )) {
        for (const match of readRepoFile(root + "/" + file).matchAll(
          /\]\(([^)]+)\)/g,
        )) {
          const target = match[1]!.split("#")[0]!;
          if (!target || target.includes(":") || !target.endsWith(".md"))
            continue;
          const resolved = path.resolve(
            absoluteRoot,
            path.dirname(file),
            target,
          );
          const relative = path.relative(absoluteRoot, resolved);
          expect(
            path.isAbsolute(relative) ||
              relative === ".." ||
              relative.startsWith(".." + path.sep),
            root + "/" + file + ": package-escaping link " + target,
          ).toBe(false);
          expect(existsSync(resolved), root + "/" + file + ": " + target).toBe(
            true,
          );
        }
      }
    }
  });

  it("records every installed skill and its final payload in the source audit", () => {
    const audit = JSON.parse(
      readRepoFile("docs/ai/skill-source-audit.json"),
    ) as {
      schemaVersion: number;
      baselineCommit: string;
      skills: Array<{ name: string; status: string; treeHash: string }>;
    };
    expect(audit.schemaVersion).toBe(1);
    expect(audit.baselineCommit).toBe(
      "c4d36cb029121641b8882237632d0d6da434049e",
    );
    expect(audit.skills.map((skill) => skill.name).sort()).toEqual(
      [...baselineSkillNames, "security-audit"].sort(),
    );
    expect(new Set(audit.skills.map((skill) => skill.name)).size).toBe(
      audit.skills.length,
    );
    expect(audit.skills.find((skill) => skill.name === "pdf")?.status).toMatch(
      /excluded/i,
    );

    for (const skill of audit.skills) {
      const root = ".agents/skills/" + skill.name;
      const hash = createHash("sha256");
      for (const file of filesUnder(root)) {
        hash.update(file);
        hash.update("\0");
        hash.update(readFileSync(path.join(repoRoot, root, file)));
        hash.update("\0");
      }
      expect(skill.treeHash, skill.name).toBe(hash.digest("hex"));
    }
  });

  it("distinguishes reviewed ReUI bundle identity from removed-source availability evidence", () => {
    const audit = JSON.parse(readRepoFile("docs/ai/skill-source-audit.json"));
    const manifest = JSON.parse(
      readRepoFile("docs/ai/skills/reui/references/upstream-manifest.json"),
    );
    const reui = audit.skills.find(
      (skill: { name: string }) => skill.name === "reui",
    );
    expect(reui.sourceIdentity).toEqual({
      kind: "hosted-bundle",
      url: manifest.source,
      version: manifest.version,
      bundleSha256: manifest.bundleSha256,
    });
    expect(reui.sourcePath).toBe("SKILL.md");
    expect(reui.rawSkillHash).toBe(manifest.files["SKILL.md"].sha256);
    expect(reui.rawSkillHash).not.toBe(reui.entrypointHash);
    const evidence = reui.reviewEvidence.find(
      (entry: { kind: string }) => entry.kind === "reviewed-hosted-bundle",
    );
    expect(evidence.sourceIdentity).toEqual(reui.sourceIdentity);
    for (const [file, metadata] of Object.entries(manifest.files) as [
      string,
      { sha256: string },
    ][]) {
      expect(evidence.sourceFileHashes[file]).toBe(metadata.sha256);
    }
    for (const name of [
      "redesign-existing-projects",
      "resolving-merge-conflicts",
    ]) {
      const skill = audit.skills.find(
        (entry: { name: string }) => entry.name === name,
      );
      expect(skill.status).toBe("retained-snapshot");
      expect(
        skill.reviewEvidence.some(
          (entry: { kind: string }) =>
            entry.kind === "reviewed-source-import-record",
        ),
      ).toBe(false);
      expect(
        skill.reviewEvidence.find(
          (entry: { kind: string }) =>
            entry.kind === "removed-source-availability-check",
        ).examinedRef,
      ).toBe(skill.examinedRef);
      const provenance = readRepoFile(
        "docs/ai/skills/" + name + "/references/upstream.md",
      );
      expect(provenance).toContain("Do not reinstall");
      expect(provenance).not.toContain("npx skills add");
    }
  });

  it("leaves every excluded PDF payload byte unchanged in all runtime trees", () => {
    const expectedFiles = Object.keys(pdfBaselineHashes).sort();
    for (const runtimeRoot of runtimeRoots) {
      const root = runtimeRoot + "/pdf";
      expect(filesUnder(root), root).toEqual(expectedFiles);
      for (const [file, expectedHash] of Object.entries(pdfBaselineHashes)) {
        const relativePath = root + "/" + file;
        expect(lstatSync(path.join(repoRoot, relativePath)).isFile()).toBe(
          true,
        );
        expect(digest(relativePath), relativePath).toBe(expectedHash);
      }
    }
  });
});
