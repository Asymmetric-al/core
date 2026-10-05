import { execFileSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  createStagedSnapshot,
  scannerEnvironment,
  validateInstalledVersion,
} from "../../../scripts/verify/shadscan.mjs";

beforeEach(() => {
  // Git hooks export their invoking checkout/index selection. Both fixture
  // commands and createStagedSnapshot must operate on this test's own repo.
  for (const name of Object.keys(process.env)) {
    if (name.startsWith("GIT_")) vi.stubEnv(name, undefined);
  }
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("Shadscan staged commit input", () => {
  it("keeps reporting tokens and Node injection options out of the scanner process", () => {
    const environment = {
      PATH: "/test/bin",
      CI: "1",
      GH_TOKEN: "test-gh",
      GITHUB_TOKEN: "test-github",
      NODE_OPTIONS: "--import=/test/hook.mjs",
    };
    expect(scannerEnvironment(environment)).toEqual({
      PATH: "/test/bin",
      CI: "1",
    });
    expect(environment.GH_TOKEN).toBe("test-gh");
  });
  it("uses the index's source and policy while excluding ignored local environment files", () => {
    const root = mkdtempSync(path.join(os.tmpdir(), "core-shadscan-staged-"));
    let snapshot: string | undefined;
    try {
      // Fail before any Git mutation if this file's environment isolation regresses.
      expect(
        Object.keys(process.env).filter((name) => name.startsWith("GIT_")),
      ).toEqual([]);
      execFileSync("git", ["init", "--quiet"], { cwd: root });
      mkdirSync(path.join(root, "tooling/shadscan"), { recursive: true });
      writeFileSync(
        path.join(root, "tooling/shadscan/policy.json"),
        '{"applicationFloor":80}\n',
      );
      writeFileSync(
        path.join(root, "component.tsx"),
        '<button aria-label="Staged name" />\n',
      );
      writeFileSync(path.join(root, ".gitignore"), ".env.local\n");
      writeFileSync(
        path.join(root, ".env.local"),
        "IGNORED_TEST_ONLY=placeholder\n",
      );
      execFileSync(
        "git",
        ["add", "component.tsx", ".gitignore", "tooling/shadscan/policy.json"],
        { cwd: root },
      );
      writeFileSync(
        path.join(root, "tooling/shadscan/policy.json"),
        '{"applicationFloor":0}\n',
      );
      writeFileSync(
        path.join(root, "component.tsx"),
        '<button aria-label="Unstaged improvement" />\n',
      );

      snapshot = createStagedSnapshot(root);
      expect(
        readFileSync(
          path.join(snapshot, "tooling/shadscan/policy.json"),
          "utf8",
        ),
      ).toContain('"applicationFloor":80');
      expect(
        readFileSync(path.join(snapshot, "component.tsx"), "utf8"),
      ).toContain("Staged name");
      expect(() => readFileSync(path.join(snapshot, ".env.local"))).toThrow();
    } finally {
      if (snapshot) rmSync(snapshot, { recursive: true, force: true });
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("requires the staged dependency declaration, installed binary and policy version to agree", () => {
    const policy = { engineVersion: "0.17.0" };
    expect(() =>
      validateInstalledVersion("0.17.0", "0.17.0", policy),
    ).not.toThrow();
    expect(() => validateInstalledVersion("^0.17.0", "0.17.0", policy)).toThrow(
      /match exactly/,
    );
    expect(() => validateInstalledVersion("0.17.0", "0.1.1", policy)).toThrow(
      /match exactly/,
    );
  });
});
