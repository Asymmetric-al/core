import { readFileSync } from "node:fs";
import { existsSync } from "node:fs";

import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(path, "utf8");

describe("commit metadata is not a development gate", () => {
  it("keeps formatting and substantive CI while accepting mixed unsigned history", () => {
    const ci = read(".github/workflows/ci.yml");
    const preflight = read("scripts/verify/ci-preflight.mjs");
    const release = read("scripts/release/production.mjs");
    const scripts = read("package.json");
    for (const source of [ci, preflight, release, scripts]) {
      expect(source).not.toContain("verify:git-attribution");
    }
    expect(ci).toContain("bun run format:check");
    expect(ci).toContain(
      "needs: [format, integrity, lint, typecheck, build, test-unit]",
    );
    const format = ci.slice(
      ci.indexOf("  format:"),
      ci.indexOf("  integrity:"),
    );
    expect(format).toContain("bun run format:check");
    expect(format).not.toMatch(
      /bun run (skills:verify|openspec:validate|verify:phase25-spec)/u,
    );
    for (const gate of ["lint", "typecheck", "build", "test:unit"]) {
      expect(preflight).toContain(`script: "${gate}"`);
    }
    expect(existsSync("scripts/verify/git-attribution.mjs")).toBe(false);
    expect(existsSync("scripts/git/trusted-identities.mjs")).toBe(false);
    expect(release).toContain(
      "assertReleaseSourceIsOnDevelop(args.remote, commit)",
    );
    expect(ci).toContain("ref: ${{ github.event.pull_request.base.sha }}");
  });

  it("runs normal CI for automation PRs against any internal base branch", () => {
    for (const workflow of [
      ".github/workflows/ci.yml",
      ".github/workflows/ci-integration.yml",
      ".github/workflows/shadscan.yml",
    ]) {
      expect(read(workflow)).toMatch(/  pull_request:\n  push:/u);
    }
  });
});
