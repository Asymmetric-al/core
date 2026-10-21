import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { verifyEvidenceFiles } from "../../../docs/prds/sitestacker-parity/phase-28-missionary-workspace-depth/tools/verify-evidence.mjs";
import { repositoryGitEnvironment } from "../../../scripts/git/environment.mjs";

const archive = "docs/features/missionary-workspace-depth/grill";
let root: string;

function capture(name: string, content: string) {
  const file = `${archive}/${name}`;
  mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
  writeFileSync(path.join(root, file), content);
  execFileSync("git", ["add", "--", file], {
    cwd: root,
    env: repositoryGitEnvironment(),
  });
  return {
    path: file,
    sha256: createHash("sha256").update(content).digest("hex"),
    bytes: Buffer.byteLength(content),
  };
}

beforeEach(() => {
  root = mkdtempSync(path.join(tmpdir(), "core-phase28-evidence-"));
  execFileSync("git", ["init", "-q", root], {
    env: repositoryGitEnvironment(),
  });
});

afterEach(() => {
  vi.unstubAllEnvs();
  rmSync(root, { recursive: true, force: true });
});

describe("Phase 28 historical evidence verification", () => {
  it("reads captured bytes without executing historical programs or freezing living documents", () => {
    const record = capture(
      "probe.mjs",
      'throw new Error("must not execute");\r\n',
    );
    writeFileSync(
      path.join(root, "CONTEXT.md"),
      "A legitimate glossary update\n",
    );
    expect(verifyEvidenceFiles(root, [record])).toBe(1);
  });

  it("rejects same-length tampering", () => {
    const record = capture("capture.txt", "original\n");
    writeFileSync(path.join(root, record.path), "modified\n");
    expect(() => verifyEvidenceFiles(root, [record])).toThrow(
      "SHA-256 mismatch",
    );
  });

  it("rejects line-ending normalization of captured bytes", () => {
    const record = capture("capture.txt", "original\r\n");
    writeFileSync(path.join(root, record.path), "original\n");
    expect(() => verifyEvidenceFiles(root, [record])).toThrow(
      "byte count mismatch",
    );
  });

  it("rejects a missing captured file", () => {
    const record = capture("capture.txt", "original\n");
    unlinkSync(path.join(root, record.path));
    expect(() => verifyEvidenceFiles(root, [record])).toThrow();
  });

  it("rejects a present file removed from Git tracking", () => {
    const record = capture("capture.txt", "original\n");
    execFileSync("git", ["rm", "--cached", "--", record.path], {
      cwd: root,
      env: repositoryGitEnvironment(),
    });
    expect(() => verifyEvidenceFiles(root, [record])).toThrow(
      "archive inventory",
    );
  });

  it("rejects omissions from the manifest even when remaining hashes match", () => {
    const record = capture("capture.txt", "original\n");
    capture("omitted.txt", "other evidence\n");
    expect(() => verifyEvidenceFiles(root, [record])).toThrow(
      "archive inventory",
    );
  });

  it("rejects duplicate records", () => {
    const record = capture("capture.txt", "original\n");
    expect(() => verifyEvidenceFiles(root, [record, record])).toThrow(
      "Duplicate",
    );
  });

  it("rejects paths escaping the historical archive", () => {
    const record = capture("capture.txt", "original\n");
    expect(() =>
      verifyEvidenceFiles(root, [
        { ...record, path: `${archive}/../README.md` },
      ]),
    ).toThrow("Invalid archive path");
    expect(() =>
      verifyEvidenceFiles(root, [{ ...record, path: "CONTEXT.md" }]),
    ).toThrow("Invalid archive path");
  });

  it("selects its own repository despite inherited hook routing", () => {
    const record = capture("capture.txt", "original\n");
    const foreign = path.join(root, "foreign");
    execFileSync("git", ["init", "-q", foreign], {
      env: repositoryGitEnvironment(),
    });
    vi.stubEnv("GIT_DIR", path.join(foreign, ".git"));
    vi.stubEnv("GIT_WORK_TREE", foreign);
    vi.stubEnv("GIT_COMMON_DIR", path.join(foreign, ".git"));
    vi.stubEnv("GIT_INDEX_FILE", path.join(foreign, ".git", "index"));
    expect(verifyEvidenceFiles(root, [record])).toBe(1);
  });
});
