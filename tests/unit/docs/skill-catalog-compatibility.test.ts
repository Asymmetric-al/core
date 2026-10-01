import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
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

const root = process.cwd();
const temporaryRoots: string[] = [];
const explicit = [
  "animate",
  "animate-expo",
  "emil-prototype",
  "mobile-native",
  "pick-ui-library",
  "review-animations",
  "write-swift",
  "frontend-design",
  "design-taste-frontend",
  "redesign-existing-projects",
  "test-driven-development",
];
const read = (name: string, file = "SKILL.md") =>
  readFile(path.join(root, "docs/ai/skills", name, file), "utf8");

afterEach(async () => {
  for (const temp of temporaryRoots.splice(0))
    await rm(temp, { recursive: true, force: true });
});

describe("integrated catalog Core contracts", () => {
  it("uses byte-exact pinned upstream fixtures", async () => {
    const fixtureRoot = path.join(root, "tests/fixtures/skills/emil-upstream");
    const provenance = JSON.parse(
      await readFile(path.join(fixtureRoot, "provenance.json"), "utf8"),
    ) as { files: Record<string, string> };
    for (const [file, expected] of Object.entries(provenance.files)) {
      expect(
        createHash("sha256")
          .update(await readFile(path.join(fixtureRoot, file)))
          .digest("hex"),
        file,
      ).toBe(expected);
    }
  });

  it("resolves every relative Markdown file link in the Playwright reference pack", async () => {
    const visit = async (directory: string): Promise<void> => {
      for (const entry of await readdir(directory, { withFileTypes: true })) {
        const file = path.join(directory, entry.name);
        if (entry.isDirectory()) await visit(file);
        else if (entry.name.endsWith(".md")) {
          const body = await readFile(file, "utf8");
          for (const match of body.matchAll(/\]\(([^)]+)\)/g)) {
            const target = match[1]!.split("#")[0]!;
            if (
              !target ||
              target.includes(":") ||
              target.startsWith("/") ||
              !target.endsWith(".md")
            )
              continue;
            expect(
              existsSync(path.resolve(path.dirname(file), target)),
              `${file}: ${target}`,
            ).toBe(true);
          }
        }
      }
    };
    await visit(path.join(root, "docs/ai/skills/playwright-best-practices"));
  });

  it("keeps design-pack recipes within the existing UI owners", async () => {
    expect(await read("better-ui", "icons.md")).not.toContain(
      "text-zinc-500 hover:text-zinc-900 aria-pressed:text-blue-600",
    );
    expect(
      await read("emil-design-engineering", "component-design.md"),
    ).toContain("nativeButton={false}");
    const discovery = (await read("improve-animations")).split("---")[1];
    expect(discovery).toContain("prioritized audit");
  });

  it("preserves Core's pinned Stripe client and quoted payment-method boundary", async () => {
    for (const name of ["stripe-best-practices", "upgrade-stripe"]) {
      const skill = await readFile(
        path.join(root, ".agents/skills", name, "SKILL.md"),
        "utf8",
      );
      expect(skill).toContain("packages/api/src/stripe/api-version.ts");
      expect(skill).toContain("packages/api/package.json");
      expect(skill).not.toContain("Always use the latest API version and SDK");
      expect(skill).not.toContain("use this version when upgrading unless");
    }
    const payments = await readFile(
      path.join(root, ".agents/skills/stripe-best-practices/SKILL.md"),
      "utf8",
    );
    expect(payments).not.toContain("Never include `payment_method_types`");
    expect(payments).toContain("packages/api/src/donate/payment-intent.ts");
    expect(payments).toContain("quoted payment method");
    const tax = await readFile(
      path.join(root, ".agents/skills/stripe-best-practices/references/tax.md"),
      "utf8",
    );
    expect(tax).not.toContain("(undefined#");
    expect(tax).not.toContain("`txcd_10103001` for SaaS");
    expect(tax).toContain("https://docs.stripe.com/tax/tax-codes");
  });

  it("keeps compiled component guidance consistent with the Core render rule", async () => {
    const index = await read("components-build");
    const compiled = await read("components-build", "AGENTS.md");
    expect(index).toContain("asChild");
    expect(compiled).toContain("asChild");
  });

  it("preserves the repaired Ask Matt routes and Cursor babysit loop", async () => {
    const askMatt = await read("ask-matt");
    const babysit = await read("babysit");
    expect(babysit).not.toContain(
      "$CLI instructions:babysit-skill --harness cursor --interactive",
    );
    expect(babysit).toContain("keep driving `$CLI run:iterate`");
  });

  it.each(explicit)(
    "keeps %s explicitly invoked in both discovery metadata and prose",
    async (name) => {
      const content = await read(name);
      const metadata = content.split("---")[1];
      expect(metadata).toContain("disable-model-invocation: true");
      expect(content).toMatch(/explicitly invoked|explicitly /);
    },
  );

  it.each([
    "ask-sonner",
    "apple-design",
    "emil-design-eng",
    "improve-animations",
  ])("does not stall a concrete task when %s is routed", async (name) => {
    const content = await read(name);
    expect(content).not.toContain(
      "Do not provide any other information until the user asks a question.",
    );
  });

  it("does not send routine motion work to an explicit-only library picker", async () => {
    const content = await read("animate");
    expect(content).not.toContain("stop and invoke `pick-ui-library`");
    expect(content.replaceAll("\n", " ")).toContain("reuse `@asym/ui`");
    expect(content).toContain("Base UI");
  });

  it("teaches the existing Core toast, utility and Base UI composition owners", async () => {
    const shadcn = await readFile(
      path.join(root, ".agents/skills/shadcn/SKILL.md"),
      "utf8",
    );
    const composition = await readFile(
      path.join(root, ".agents/skills/shadcn/rules/composition.md"),
      "utf8",
    );
    const styling = await readFile(
      path.join(root, ".agents/skills/shadcn/rules/styling.md"),
      "utf8",
    );
    expect(shadcn).toContain("Core uses the existing Sonner host");
    expect(composition).not.toContain('from "@/components/ui/toast"');
    expect(composition).not.toContain("toast.add(");
    expect(composition).toContain('from "sonner"');
    expect(styling).not.toContain('from "cn"');
    expect(styling).toContain('from "@asym/ui/lib/utils"');
    const renderRule = await read("components-build", "rules/as-child.md");
    expect(renderRule).toContain("asChild");
  });

  it("keeps motion recipes and picker recommendations within Core's installed contracts", async () => {
    expect(await read("animate", "RECIPES.md")).not.toContain(
      "var(--ease-out)",
    );
    const picker = await read("pick-ui-library");
    expect(picker).not.toContain("https://zustand.docs.pmnd.rs");
    expect(picker).toContain("`@asym/ui` `Command`");
    expect(picker).toContain("`@asym/ui`\n   `InputOTP`");
    expect(await read("ask-sonner", "API.md")).not.toContain(
      "toast.getActiveToasts()",
    );
  });

  it("keeps eval output data inside its script element after an ecosystem resync", async () => {
    await mkdir(path.join(root, ".tmp"), { recursive: true });
    const temp = await mkdtemp(path.join(root, ".tmp", "catalog-eval-"));
    temporaryRoots.push(temp);
    await mkdir(path.join(temp, "scripts"), { recursive: true });
    await cp(
      path.join(root, "scripts/sync-agent-skills.mjs"),
      path.join(temp, "scripts/sync-agent-skills.mjs"),
    );
    await cp(path.join(root, "scripts/lib"), path.join(temp, "scripts/lib"), {
      recursive: true,
    });
    await mkdir(path.join(temp, "docs/ai/skills/sample"), { recursive: true });
    await writeFile(
      path.join(temp, "docs/ai/skills/sample/SKILL.md"),
      "# Sample\n",
    );
    const viewer = path.join(temp, ".agents/skills/skill-creator/eval-viewer");
    await mkdir(viewer, { recursive: true });
    await writeFile(path.join(viewer, "../SKILL.md"), "# Skill creator\n");
    for (const file of ["generate_review.py", "viewer.html"])
      await cp(
        path.join(root, ".agents/skills/skill-creator/eval-viewer", file),
        path.join(viewer, file),
      );
    const generatorPath = path.join(viewer, "generate_review.py");
    const generator = await readFile(generatorPath, "utf8");
    await writeFile(
      generatorPath,
      generator.replace(
        'json.dumps(embedded).replace("<", "\\\\u003c")',
        "json.dumps(embedded)",
      ),
    );
    const sync = spawnSync(
      process.execPath,
      ["scripts/sync-agent-skills.mjs"],
      { cwd: temp, encoding: "utf8" },
    );
    expect(sync.status, sync.stdout + sync.stderr).toBe(0);
    const probe = [
      "import importlib.util,json,sys",
      "from html.parser import HTMLParser",
      "spec=importlib.util.spec_from_file_location('viewer',sys.argv[1])",
      "module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)",
      "payload='</script><script>globalThis.__coreFixture=true</script>'",
      "html=module.generate_html([{'id':'fixture','prompt':payload,'outputs':[]}],'fixture')",
      "decoded=json.JSONDecoder().raw_decode(html.split('const EMBEDDED_DATA = ',1)[1])[0]",
      "print(json.dumps({'breakout': '<script>globalThis.__coreFixture=true</script>' in html,'escaped': '\\\\u003c/script>' in html,'roundtrip': decoded['runs'][0]['prompt']==payload}))",
    ].join("\n");
    const result = spawnSync("python3", ["-c", probe, generatorPath], {
      encoding: "utf8",
    });
    expect(result.status, result.stderr).toBe(0);
    expect(JSON.parse(result.stdout)).toEqual({
      breakout: false,
      escaped: true,
      roundtrip: true,
    });
  });

  it("restores the git guardrail and wizard invocation boundary before generating mirrors", async () => {
    await mkdir(path.join(root, ".tmp"), { recursive: true });
    const temp = await mkdtemp(path.join(root, ".tmp", "catalog-adapters-"));
    temporaryRoots.push(temp);
    await mkdir(path.join(temp, "scripts/refresh-overlays"), {
      recursive: true,
    });
    await cp(
      path.join(root, "scripts/sync-agent-skills.mjs"),
      path.join(temp, "scripts/sync-agent-skills.mjs"),
    );
    await cp(path.join(root, "scripts/lib"), path.join(temp, "scripts/lib"), {
      recursive: true,
    });
    await cp(
      path.join(
        root,
        "scripts/refresh-overlays/git-guardrails-block-dangerous-git.sh",
      ),
      path.join(
        temp,
        "scripts/refresh-overlays/git-guardrails-block-dangerous-git.sh",
      ),
    );
    await mkdir(path.join(temp, "docs/ai/skills/sample"), { recursive: true });
    await writeFile(
      path.join(temp, "docs/ai/skills/sample/SKILL.md"),
      "# Sample\n",
    );
    await mkdir(
      path.join(temp, ".agents/skills/git-guardrails-claude-code/scripts"),
      { recursive: true },
    );
    await writeFile(
      path.join(temp, ".agents/skills/git-guardrails-claude-code/SKILL.md"),
      "# Guardrail\n",
    );
    await writeFile(
      path.join(
        temp,
        ".agents/skills/git-guardrails-claude-code/scripts/block-dangerous-git.sh",
      ),
      "#!/bin/sh\nexit 0\n",
    );
    await mkdir(path.join(temp, ".agents/skills/wizard"), { recursive: true });
    await writeFile(
      path.join(temp, ".agents/skills/wizard/SKILL.md"),
      "---\nname: wizard\ndescription: Use when configuring credentials\n---\n\n# Wizard\n",
    );
    await mkdir(path.join(temp, "docs/ai/skills/nestjs-best-practices"), {
      recursive: true,
    });
    await writeFile(
      path.join(temp, "docs/ai/skills/nestjs-best-practices/SKILL.md"),
      "# Reference only\n",
    );
    await mkdir(path.join(temp, ".agents/skills/nestjs-best-practices"), {
      recursive: true,
    });
    await writeFile(
      path.join(temp, ".agents/skills/nestjs-best-practices/AGENTS.md"),
      "# Excluded upstream pack build instructions\n",
    );
    const result = spawnSync(
      process.execPath,
      ["scripts/sync-agent-skills.mjs"],
      { cwd: temp, encoding: "utf8" },
    );
    expect(result.status, result.stdout + result.stderr).toBe(0);
    const expected = await readFile(
      path.join(
        root,
        "scripts/refresh-overlays/git-guardrails-block-dangerous-git.sh",
      ),
      "utf8",
    );
    for (const mirror of [".agents", ".cursor", ".claude"]) {
      await expect(
        readFile(
          path.join(temp, mirror, "skills/nestjs-best-practices/AGENTS.md"),
          "utf8",
        ),
      ).rejects.toThrow(/ENOENT/);

      await expect(
        readFile(
          path.join(
            temp,
            mirror,
            "skills/git-guardrails-claude-code/scripts/block-dangerous-git.sh",
          ),
          "utf8",
        ),
      ).resolves.toBe(expected);
      const wizard = await readFile(
        path.join(temp, mirror, "skills/wizard/SKILL.md"),
        "utf8",
      );
      expect(wizard).toContain("disable-model-invocation: true");
      expect(wizard).toContain(
        "description: Use only when the user explicitly ",
      );
    }
  });
});
