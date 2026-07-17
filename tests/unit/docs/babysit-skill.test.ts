import { createHash } from "node:crypto";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

import { describe, expect, it } from "vitest";

const repoRoot = process.cwd();
const canonicalSkillRoot = path.join(repoRoot, "docs/ai/skills/babysit");
const skillPath = path.join(canonicalSkillRoot, "SKILL.md");
const versionsPath = path.join(canonicalSkillRoot, "versions.json");
const upstreamMetadataPath = path.join(
  canonicalSkillRoot,
  "references/upstream.md",
);
const refreshScriptPath = path.join(
  repoRoot,
  "scripts/refresh-upstream-skills.mjs",
);

function extractDependencyBlock(skill: string) {
  const match = skill.match(
    /### Babysitter SDK and CLI\n\n([\s\S]*?)\n\n### jq/,
  );
  expect(match, "Babysitter dependency section").not.toBeNull();
  return match?.[1] ?? "";
}

function extractDependencyShell(dependencyBlock: string) {
  const match = dependencyBlock.match(/```bash\n([\s\S]*?)\n```/);
  expect(match, "Babysitter dependency shell block").not.toBeNull();
  return match?.[1] ?? "";
}

function runDocumentedResolver(
  dependencyShell: string,
  setupVersions: (skillRoot: string) => void,
) {
  const tempRoot = mkdtempSync(path.join(os.tmpdir(), "babysit-version-test-"));
  const skillRoot = path.join(tempRoot, "docs/ai/skills/babysit");
  mkdirSync(skillRoot, { recursive: true });
  setupVersions(skillRoot);

  const env = Object.fromEntries(
    Object.entries(process.env).filter(([key]) => !key.startsWith("GIT_")),
  );
  delete env.PLUGIN_ROOT;

  const gitInit = spawnSync("git", ["init", "--quiet"], {
    cwd: tempRoot,
    encoding: "utf8",
    env,
  });
  expect(gitInit.status, gitInit.stderr).toBe(0);

  const result = spawnSync(
    "bash",
    ["-c", `${dependencyShell}\nprintf '%s' "$SDK_VERSION"`],
    {
      cwd: tempRoot,
      encoding: "utf8",
      env,
    },
  );
  rmSync(tempRoot, { recursive: true, force: true });
  return result;
}

function listFilesRecursively(root: string, current = root): string[] {
  return readdirSync(current, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = path.join(current, entry.name);
    if (entry.isDirectory()) {
      return listFilesRecursively(root, absolutePath);
    }
    if (!entry.isFile()) {
      return [];
    }
    return [path.relative(root, absolutePath).split(path.sep).join("/")];
  });
}

function computeVendoredTreeHash(root: string) {
  const relativePaths = listFilesRecursively(root)
    .filter((relativePath) => relativePath !== "references/upstream.md")
    .sort();
  const hash = createHash("sha256");

  for (const relativePath of relativePaths) {
    hash.update(relativePath);
    hash.update("\0");
    hash.update(readFileSync(path.join(root, relativePath)));
    hash.update("\0");
  }

  return hash.digest("hex");
}

function encodeForTemplateLiteral(value: string) {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll("`", "\\`")
    .replaceAll("${", "\\${");
}

const failClosedCases: Array<[string, (skillRoot: string) => void]> = [
  ["missing", () => undefined],
  [
    "unreadable",
    (skillRoot) =>
      mkdirSync(path.join(skillRoot, "versions.json"), { recursive: true }),
  ],
  [
    "malformed",
    (skillRoot) =>
      writeFileSync(path.join(skillRoot, "versions.json"), "{not-json"),
  ],
  [
    "empty",
    (skillRoot) =>
      writeFileSync(
        path.join(skillRoot, "versions.json"),
        JSON.stringify({ sdkVersion: "" }),
      ),
  ],
  [
    "unsafe",
    (skillRoot) =>
      writeFileSync(
        path.join(skillRoot, "versions.json"),
        JSON.stringify({ sdkVersion: "latest" }),
      ),
  ],
];

describe("babysit skill", () => {
  const skill = readFileSync(skillPath, "utf8");
  const dependencyBlock = extractDependencyBlock(skill);
  const dependencyShell = extractDependencyShell(dependencyBlock);

  it("resolves exactly the reviewed SDK pin with PLUGIN_ROOT unset", () => {
    const versions = JSON.parse(readFileSync(versionsPath, "utf8")) as {
      sdkVersion: string;
    };
    const result = runDocumentedResolver(dependencyShell, (skillRoot) => {
      writeFileSync(
        path.join(skillRoot, "versions.json"),
        JSON.stringify(versions),
      );
    });

    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toBe(versions.sdkVersion);
  });

  it.each(failClosedCases)(
    "fails closed for %s version data",
    (_caseName, setupVersions) => {
      const result = runDocumentedResolver(dependencyShell, setupVersions);

      expect(result.status).not.toBe(0);
      expect(result.stdout.trim()).not.toBe("latest");
    },
  );

  it("uses only the exact validated pin through npx", () => {
    expect(skill).not.toContain("PLUGIN_ROOT");
    expect(skill).not.toMatch(/\blatest\b/i);
    expect(skill).not.toMatch(/npm\s+(?:i|install)\s+(?:-g|--global)\b/);
    expect(dependencyShell).toContain(
      'CLI="npx -y @a5c-ai/babysitter-sdk@$SDK_VERSION"',
    );
    expect(
      skill.match(/npx -y @a5c-ai\/babysitter-sdk@\$SDK_VERSION/g),
    ).toHaveLength(1);
    expect(dependencyShell).toContain("exactVersionPattern.test(sdkVersion)");
    expect(dependencyShell).toContain(") || exit 1");
  });

  it("requires the reviewed post-refresh adaptation and rejects drift", () => {
    const refreshScript = readFileSync(refreshScriptPath, "utf8");
    const upstreamBlockMatch = refreshScript.match(
      /const BABYSIT_UPSTREAM_DEPENDENCY_BLOCK = `([\s\S]*?)`;\n\nconst BABYSIT_CORE_DEPENDENCY_BLOCK/,
    );
    const coreBlockMatch = refreshScript.match(
      /const BABYSIT_CORE_DEPENDENCY_BLOCK = `([\s\S]*?)`;\n\nconst POST_REFRESH_REPLACEMENTS/,
    );
    expect(
      upstreamBlockMatch,
      "reviewed Babysitter upstream block",
    ).not.toBeNull();
    expect(upstreamBlockMatch?.[1]).toContain("\\${PLUGIN_ROOT}/versions.json");
    expect(upstreamBlockMatch?.[1]).toContain("||'latest'");
    expect(upstreamBlockMatch?.[1]).toContain(
      "npm i -g @a5c-ai/babysitter-sdk@$SDK_VERSION",
    );
    expect(coreBlockMatch, "Babysitter Core refresh block").not.toBeNull();
    expect(coreBlockMatch?.[1]).toBe(encodeForTemplateLiteral(dependencyBlock));

    const babysitReplacement = refreshScript.match(
      /\{\n    skillName: "babysit",\n([\s\S]*?)\n  \},/,
    );
    expect(babysitReplacement, "Babysitter refresh replacement").not.toBeNull();
    expect(babysitReplacement?.[1]).toContain(
      "search: BABYSIT_UPSTREAM_DEPENDENCY_BLOCK",
    );
    expect(babysitReplacement?.[1]).toContain(
      "replace: BABYSIT_CORE_DEPENDENCY_BLOCK",
    );
    expect(babysitReplacement?.[1]).toContain("required: true");
    expect(refreshScript).toContain(
      "Required Core compatibility replacement is missing",
    );
    expect(refreshScript).toContain(
      "review upstream drift before refreshing canonical skills",
    );
  });

  it("keeps lock and provenance hashes aligned with canonical bytes", () => {
    const lock = JSON.parse(
      readFileSync(path.join(repoRoot, "skills-lock.json"), "utf8"),
    ) as {
      skills: Record<string, { computedHash?: string; treeHash?: string }>;
    };
    const computedHash = createHash("sha256")
      .update(readFileSync(skillPath))
      .digest("hex");
    const treeHash = computeVendoredTreeHash(canonicalSkillRoot);
    const upstreamMetadata = readFileSync(upstreamMetadataPath, "utf8");

    expect(lock.skills.babysit?.computedHash).toBe(computedHash);
    expect(lock.skills.babysit?.treeHash).toBe(treeHash);
    expect(upstreamMetadata).toContain(`skills_lock_hash: ${computedHash}`);
    expect(upstreamMetadata).toContain(
      `- **Computed hash:** \`${computedHash}\``,
    );
  });

  it("keeps the six changed runtime mirror files byte-identical", () => {
    const relativePaths = ["SKILL.md", "references/upstream.md"] as const;
    const runtimeRoots = [
      ".agents/skills/babysit",
      ".cursor/skills/babysit",
      ".claude/skills/babysit",
    ] as const;

    for (const runtimeRoot of runtimeRoots) {
      for (const relativePath of relativePaths) {
        expect(
          readFileSync(path.join(repoRoot, runtimeRoot, relativePath)),
          `${runtimeRoot}/${relativePath}`,
        ).toEqual(readFileSync(path.join(canonicalSkillRoot, relativePath)));
      }
    }
  });
});
