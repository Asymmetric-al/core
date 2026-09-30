import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const repoRoot = process.cwd();
const packSource = "emilkowalski/skills";
const runtimeRoots = [
  "docs/ai/skills",
  ".agents/skills",
  ".cursor/skills",
  ".claude/skills",
] as const;

const upstreamFiles = {
  animate: ["SKILL.md", "RECIPES.md"],
  "animate-expo": ["SKILL.md", "RECIPES.md"],
  "animation-vocabulary": ["SKILL.md"],
  "apple-design": ["SKILL.md"],
  "ask-sonner": ["SKILL.md", "API.md"],
  "emil-design-eng": ["SKILL.md"],
  "emil-prototype": ["SKILL.md", "PICKER.md"],
  "improve-animations": ["AUDIT.md", "PLAN-TEMPLATE.md", "SKILL.md"],
  "mobile-native": ["SKILL.md"],
  "pick-ui-library": ["SKILL.md"],
  "review-animations": ["SKILL.md", "STANDARDS.md"],
  "write-swift": ["SKILL.md"],
} as const;

function listFiles(root: string, relativeRoot = ""): string[] {
  const directory = path.join(root, relativeRoot);
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const relativePath = path.join(relativeRoot, entry.name);
    return entry.isDirectory()
      ? listFiles(root, relativePath)
      : [relativePath.replaceAll("\\", "/")];
  });
}

function readSkillFile(
  runtimeRoot: (typeof runtimeRoots)[number],
  skillName: keyof typeof upstreamFiles,
  relativePath: string,
) {
  return readFileSync(
    path.join(repoRoot, runtimeRoot, skillName, relativePath),
    "utf8",
  );
}

describe("emilkowalski skill pack", () => {
  it("keeps every canonical file byte-identical in all three runtime mirrors", () => {
    for (const [skillName, requiredFiles] of Object.entries(upstreamFiles)) {
      const typedSkillName = skillName as keyof typeof upstreamFiles;
      const canonicalRoot = path.join(
        repoRoot,
        "docs/ai/skills",
        typedSkillName,
      );
      const canonicalFiles = listFiles(canonicalRoot).sort();

      expect(canonicalFiles).toEqual(
        expect.arrayContaining([
          ...requiredFiles,
          "references/LICENSE.md",
          "references/upstream.md",
        ]),
      );

      for (const runtimeRoot of runtimeRoots.slice(1)) {
        for (const relativePath of canonicalFiles) {
          expect(
            readSkillFile(runtimeRoot, typedSkillName, relativePath),
            `${runtimeRoot}/${skillName}/${relativePath}`,
          ).toBe(readSkillFile("docs/ai/skills", typedSkillName, relativePath));
        }
      }
    }
  });

  it("keeps discovery metadata, lock provenance, and shared routing valid", () => {
    const lock = JSON.parse(
      readFileSync(path.join(repoRoot, "skills-lock.json"), "utf8"),
    ) as {
      skills: Record<
        string,
        { source?: string; sourceType?: string; skillPath?: string }
      >;
    };
    const skillRouting = readFileSync(
      path.join(repoRoot, "docs/ai/rules/agent-skill-routing.md"),
      "utf8",
    );

    for (const skillName of Object.keys(upstreamFiles)) {
      const skill = readSkillFile(
        "docs/ai/skills",
        skillName as keyof typeof upstreamFiles,
        "SKILL.md",
      );
      expect(skill).toMatch(/^---\r?\n/);
      expect(skill).toContain(`\nname: ${skillName}\n`);
      expect(skill).toMatch(/\ndescription: .+\n/);
      expect(skillRouting).toContain(`docs/ai/skills/${skillName}/SKILL.md`);
      expect(lock.skills[skillName]).toMatchObject({
        source: packSource,
        sourceType: "github",
        skillPath: expect.stringContaining(
          skillName === "emil-prototype"
            ? "skills/prototype/SKILL.md"
            : `skills/${skillName}/SKILL.md`,
        ),
      });
    }

    expect(readFileSync(path.join(repoRoot, "CLAUDE.md"), "utf8")).toBe(
      "@AGENTS.md\n",
    );
    expect(
      readSkillFile("docs/ai/skills", "review-animations", "SKILL.md"),
    ).toContain("disable-model-invocation: true");
    expect(
      readSkillFile("docs/ai/skills", "pick-ui-library", "SKILL.md"),
    ).toContain("disable-model-invocation: true");
    expect(
      readSkillFile("docs/ai/skills", "emil-prototype", "SKILL.md"),
    ).toContain("disable-model-invocation: true");
    expect(lock.skills["mobile-native"]).toMatchObject({
      source: packSource,
      sourceType: "github",
      skillPath: "skills/mobile-native/SKILL.md",
    });
    expect(skillRouting).toContain("docs/ai/skills/mobile-native/SKILL.md");
    expect(
      readSkillFile("docs/ai/skills", "mobile-native", "SKILL.md"),
    ).toContain("disable-model-invocation: true");
    expect(readSkillFile("docs/ai/skills", "animate", "SKILL.md")).toContain(
      "disable-model-invocation: true",
    );
    expect(
      readSkillFile("docs/ai/skills", "write-swift", "SKILL.md"),
    ).toContain("disable-model-invocation: true");
    expect(lock.skills.prototype).toMatchObject({
      source: "mattpocock/skills",
      skillPath: "skills/engineering/prototype/SKILL.md",
    });
  });

  it("keeps Core markdown and duration compatibility adaptations", () => {
    const vocabulary = readSkillFile(
      "docs/ai/skills",
      "animation-vocabulary",
      "SKILL.md",
    );
    const appleDesign = readSkillFile(
      "docs/ai/skills",
      "apple-design",
      "SKILL.md",
    );
    const audit = readSkillFile(
      "docs/ai/skills",
      "improve-animations",
      "AUDIT.md",
    );
    const planTemplate = readSkillFile(
      "docs/ai/skills",
      "improve-animations",
      "PLAN-TEMPLATE.md",
    );
    const standards = readSkillFile(
      "docs/ai/skills",
      "review-animations",
      "STANDARDS.md",
    );

    expect(vocabulary.match(/^```text$/gm)).toHaveLength(4);
    expect(appleDesign).toContain(
      "```text\nrelativeVelocity = gestureVelocity /",
    );
    expect(audit).toContain(
      "most UI animations stay under 300ms; modals and drawers may use 200–500ms",
    );
    expect(audit).toContain("modals/drawers above 500ms");
    expect(planTemplate).toContain("## Triggers");
    expect(planTemplate).toContain("## Workflow");
    expect(planTemplate).toContain("## Checklist");
    expect(planTemplate).toContain(
      "The trigger still applies in the current checkout",
    );
    expect(standards).toContain(
      "Most UI animations stay under 300ms; modals and drawers may use up to 500ms",
    );
  });

  it("keeps Base UI ownership in Emil component design and the shared Sonner toaster", () => {
    const componentDesign = readFileSync(
      path.join(
        repoRoot,
        "docs/ai/skills/emil-design-engineering/component-design.md",
      ),
      "utf8",
    );
    const askSonner = readFileSync(
      path.join(repoRoot, "docs/ai/skills/ask-sonner/SKILL.md"),
      "utf8",
    );

    expect(componentDesign).not.toContain("asChild");
    expect(componentDesign).not.toContain("@radix-ui/react-slot");
    expect(componentDesign).toContain("buttonVariants");
    expect(componentDesign).toContain("nativeButton={false}");
    expect(componentDesign).toContain("Base UI");
    expect(askSonner).not.toMatch(/import \{ Toaster \} from ["']sonner["']/);
    expect(askSonner).toContain("@asym/ui/components/shadcn/sonner");
    expect(askSonner).toContain("bun run skills:verify");

    const picker = readSkillFile(
      "docs/ai/skills",
      "pick-ui-library",
      "SKILL.md",
    );
    expect(picker).toContain("Do not install Zustand");
    expect(picker).not.toContain("https://zustand.docs.pmnd.rs");
    expect(picker).not.toMatch(/→ zustand\./);
  });

  it("keeps animate and prototype overlays from installing libraries or public prototype routes", () => {
    const animate = readSkillFile("docs/ai/skills", "animate", "SKILL.md");
    const prototype = readSkillFile(
      "docs/ai/skills",
      "emil-prototype",
      "SKILL.md",
    );
    const refreshScript = readFileSync(
      path.join(repoRoot, "scripts/refresh-upstream-skills.mjs"),
      "utf8",
    );

    expect(animate).toContain("Do not invoke `pick-ui-library`");
    expect(animate).not.toContain("stop and invoke `pick-ui-library`");
    expect(animate).not.toContain("drop frames");
    expect(animate).not.toMatch(/--ease-out:/);
    expect(animate).not.toMatch(/var\(--ease-out\)/);
    expect(animate).toContain("--ease-out-soft");
    const recipes = readSkillFile("docs/ai/skills", "animate", "RECIPES.md");
    expect(recipes).toContain("var(--ease-out-soft)");
    expect(recipes).toContain("var(--duration-press)");
    expect(recipes).toContain("var(--duration-drawer)");
    expect(recipes).not.toContain("160ms");
    expect(recipes).not.toContain("500ms");
    expect(recipes).not.toMatch(/var\(--ease-out\)/);
    expect(recipes).not.toMatch(/var\(--ease-in-out\)/);
    expect(prototype).toContain("apps/*/app/prototypes/");
    expect(prototype).not.toContain("/prototypes/<slug>");
    const expo = readSkillFile("docs/ai/skills", "animate-expo", "SKILL.md");
    expect(expo).toContain("disable-model-invocation: true");
    expect(expo).not.toContain(
      "adding gestures, sheets, screen transitions, press feedback or haptics",
    );
    const askSonner = readSkillFile("docs/ai/skills", "ask-sonner", "SKILL.md");
    expect(askSonner).not.toContain("!text-red-900");
    expect(askSonner).not.toContain("toasterId");
    expect(askSonner).not.toContain("layout.tsx");
    const picker = readSkillFile(
      "docs/ai/skills",
      "pick-ui-library",
      "SKILL.md",
    );
    expect(picker).toContain("Do not add another `cmdk` tree");
    expect(picker).toContain("InputOTP");
    expect(picker).not.toContain("https://cmdk.paco.me");
    expect(picker).not.toContain("https://input-otp.rodz.dev");
    const swift = readSkillFile("docs/ai/skills", "write-swift", "SKILL.md");
    expect(swift).toContain("**Toolchain baseline: Swift 6.4**");
    expect(swift).not.toContain("unreleased");
    expect(swift).not.toContain("which has not shipped");
    expect(refreshScript).toContain('relativePath: "component-design.md"');
    expect(refreshScript).toContain(
      "4. **asChild** - Render as different element (Radix pattern)",
    );
  });
});
