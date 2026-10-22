import { spawnSync } from "node:child_process";
import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const repo = process.cwd();
const roots: string[] = [];
const reviewed = "c1c8a8c1471069fb0e188eeaff69b8e8db6564a8";
const cleanEnv = Object.fromEntries(
  Object.entries(process.env).filter(([key]) => !key.startsWith("GIT_")),
);

function git(cwd: string, args: string[]) {
  const result = spawnSync("git", args, {
    cwd,
    env: cleanEnv,
    encoding: "utf8",
  });
  expect(result.status, result.stderr).toBe(0);
  return result.stdout.trim();
}

async function fixture(
  options: { missing?: string; linked?: string; badPin?: boolean } = {},
) {
  await mkdir(path.join(repo, ".tmp"), { recursive: true });
  const root = await mkdtemp(
    path.join(repo, ".tmp", "security-audit-refresh-"),
  );
  roots.push(root);
  await mkdir(path.join(root, "scripts"), { recursive: true });
  await cp(
    path.join(repo, "scripts/refresh-upstream-skills.mjs"),
    path.join(root, "scripts/refresh-upstream-skills.mjs"),
  );
  await cp(path.join(repo, "scripts/lib"), path.join(root, "scripts/lib"), {
    recursive: true,
  });
  const source = path.join(root, "upstream");
  const skill = path.join(source, "skills/security-audit");
  await cp(path.join(repo, "docs/ai/skills/security-audit"), skill, {
    recursive: true,
  });
  await rm(path.join(skill, "references"), { recursive: true, force: true });
  const raw = (await readFile(path.join(skill, "SKILL.md"), "utf8")).replace(
    /<!-- CORE-OVERLAY-START -->[\s\S]*?<!-- CORE-OVERLAY-END -->\n*/u,
    "",
  );
  await writeFile(path.join(skill, "SKILL.md"), raw);
  await writeFile(path.join(source, "LICENSE"), "MIT fixture license\n");
  // Refresh must not run lifecycle hooks or imported executable/test files.
  const marker = path.join(root, "TARGET_EXECUTED");
  const payload =
    'require("node:fs").writeFileSync(' +
    JSON.stringify(marker) +
    ', "executed");';
  await writeFile(
    path.join(source, "package.json"),
    JSON.stringify({ scripts: { postinstall: "node never-execute.cjs" } }),
  );
  await writeFile(path.join(source, "never-execute.cjs"), payload);
  await writeFile(path.join(skill, "validate-findings.test.cjs"), payload);
  if (options.missing) await rm(path.join(skill, options.missing));
  if (options.linked) {
    await rm(path.join(skill, options.linked));
    await symlink("../../LICENSE", path.join(skill, options.linked));
  }
  git(source, ["init", "-b", "main"]);
  git(source, ["add", "."]);
  git(source, [
    "-c",
    "user.name=Fixture",
    "-c",
    "user.email=fixture@example.invalid",
    "-c",
    "commit.gpgsign=false",
    "commit",
    "-m",
    "Synthetic reviewed source",
  ]);
  const pin = options.badPin
    ? "0".repeat(40)
    : git(source, ["rev-parse", "HEAD"]);
  const script = path.join(root, "scripts/refresh-upstream-skills.mjs");
  let text = await readFile(script, "utf8");
  text = text.replace(
    'repo: "https://github.com/cloudflare/security-audit-skill.git"',
    "repo: " + JSON.stringify(source),
  );
  const helper = path.join(root, "scripts/lib/security-audit-source.mjs");
  const helperText = await readFile(helper, "utf8");
  expect(helperText).toContain(reviewed);
  await writeFile(helper, helperText.replace(reviewed, pin));
  await writeFile(script, text);
  const canonical = path.join(root, "docs/ai/skills/security-audit");
  await mkdir(canonical, { recursive: true });
  await writeFile(
    path.join(canonical, "SKILL.md"),
    "# Old skill\n\n<!-- CORE-OVERLAY-START -->\n\nFixture Core overlay.\n\n<!-- CORE-OVERLAY-END -->\n",
  );
  await writeFile(path.join(canonical, "obsolete.md"), "old companion");
  const lock =
    '{"version":1,"skills":{"security-audit":{"source":"cloudflare/security-audit-skill","computedHash":"old"}}}\n';
  await writeFile(path.join(root, "skills-lock.json"), lock);
  return { root, canonical, lock, marker };
}

function run(root: string) {
  return spawnSync(
    process.execPath,
    [
      "scripts/refresh-upstream-skills.mjs",
      "--only=cloudflare/security-audit-skill",
    ],
    {
      cwd: root,
      env: cleanEnv,
      encoding: "utf8",
      timeout: 30_000,
    },
  );
}

afterEach(async () => {
  await Promise.all(
    roots.splice(0).map((root) => rm(root, { recursive: true, force: true })),
  );
});

describe("reviewed security-audit refresh", () => {
  it("publishes the pinned tree, keeps the overlay, prunes obsolete files and never executes imported code", async () => {
    const { root, canonical, marker } = await fixture();
    const result = run(root);
    expect(result.status, result.stdout + result.stderr).toBe(0);
    expect(await readFile(path.join(canonical, "SKILL.md"), "utf8")).toContain(
      "Fixture Core overlay.",
    );
    expect(
      await readFile(
        path.join(canonical, "VALIDATION-AND-REPORTING.md"),
        "utf8",
      ),
    ).toContain("findings");
    expect(
      await readFile(path.join(canonical, "references/LICENSE.md"), "utf8"),
    ).toBe("MIT fixture license\n");
    await expect(
      readFile(path.join(canonical, "obsolete.md")),
    ).rejects.toMatchObject({ code: "ENOENT" });
    await expect(readFile(marker)).rejects.toMatchObject({ code: "ENOENT" });
    const lock = JSON.parse(
      await readFile(path.join(root, "skills-lock.json"), "utf8"),
    );
    expect(lock.skills["security-audit"]).toMatchObject({
      source: "cloudflare/security-audit-skill",
      skillPath: "skills/security-audit/SKILL.md",
    });
    expect(lock.skills["security-audit"].treeHash).toMatch(/^[a-f0-9]{64}$/u);
    const first = await readFile(path.join(canonical, "SKILL.md"), "utf8");
    const repeated = run(root);
    expect(repeated.status, repeated.stderr).toBe(0);
    expect(await readFile(path.join(canonical, "SKILL.md"), "utf8")).toBe(
      first,
    );
  });

  it.each([
    { missing: "report-schema.json" },
    { missing: "HUNTING.md" },
    { linked: "ATTACK-CLASSES.md" },
    { badPin: true },
  ])(
    "rejects incompatible or unpinned source without changing canonical content or lock: %j",
    async (options) => {
      const { root, canonical, lock } = await fixture(options);
      const before = await readFile(path.join(canonical, "SKILL.md"), "utf8");
      const result = run(root);
      expect(result.status, result.stdout + result.stderr).not.toBe(0);
      expect(result.stderr).toContain(
        options.badPin
          ? "fetch reviewed"
          : options.linked
            ? "regular files"
            : "inventory",
      );
      expect(await readFile(path.join(canonical, "SKILL.md"), "utf8")).toBe(
        before,
      );
      expect(await readFile(path.join(canonical, "obsolete.md"), "utf8")).toBe(
        "old companion",
      );
      expect(await readFile(path.join(root, "skills-lock.json"), "utf8")).toBe(
        lock,
      );
    },
  );

  it("rolls back canonical files and lock metadata after a partial lock write", async () => {
    const { root, canonical, lock } = await fixture();
    const before = await readFile(path.join(canonical, "SKILL.md"), "utf8");
    const script = path.join(root, "scripts/refresh-upstream-skills.mjs");
    let text = await readFile(script, "utf8");
    text = text.replace(
      "  writeFile,\n",
      "  writeFile as originalWriteFile,\n",
    );
    text += [
      "",
      "let failed = false;",
      "async function writeFile(target, content, ...args) {",
      '  if (!failed && String(target).includes("/.skills-lock.json.refresh-file-")) {',
      "    failed = true;",
      '    await originalWriteFile(target, "partial lock");',
      '    console.error("REACHED_LOCK_WRITE_FAILURE");',
      '    throw new Error("fixture lock failure");',
      "  }",
      "  return originalWriteFile(target, content, ...args);",
      "}",
    ].join("\n");
    await writeFile(script, text);
    const result = run(root);
    expect(result.stderr).toContain("REACHED_LOCK_WRITE_FAILURE");
    expect(result.status).not.toBe(0);
    expect(await readFile(path.join(canonical, "SKILL.md"), "utf8")).toBe(
      before,
    );
    expect(await readFile(path.join(canonical, "obsolete.md"), "utf8")).toBe(
      "old companion",
    );
    expect(await readFile(path.join(root, "skills-lock.json"), "utf8")).toBe(
      lock,
    );
  });
});
