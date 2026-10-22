/**
 * #2067 PR #2169 review r4341709686, Builder-owned: proofs are written only
 * where their real path is inside docs/ops/document-cutover/proofs/. A
 * symlinked directory under the proofs root must not carry the write
 * elsewhere: the run exits nonzero, never reports a recorded proof, and
 * writes nothing outside. The command runs with injected clean detectors and
 * the committed proof file writer (no store override); a no_go decision
 * records a stop_the_line proof from any assessment, which reaches the writer.
 */

import { randomBytes } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  symlinkSync,
  unlinkSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  DOCUMENT_CUTOVER_ALLOWLIST_PATH,
  DOCUMENT_CUTOVER_PROOFS_DIR,
} from "../../../packages/api/src/document-cutover";
import { runDocumentCutoverCommand } from "../../../scripts/document-cutover/assess-document-cutover";
import {
  DocumentEnvironmentFixture,
  buildFixtureDetectors,
} from "../packages/api/document-cutover-test-fixture";

import type { DocumentCutoverDetector } from "../../../packages/api/src/document-cutover";

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);
const PROOFS_ROOT = path.join(REPO_ROOT, DOCUMENT_CUTOVER_PROOFS_DIR);
const LOCAL_ENV = { SUPABASE_URL: "http://127.0.0.1:54321" };

const owner = (
  JSON.parse(
    readFileSync(path.join(REPO_ROOT, DOCUMENT_CUTOVER_ALLOWLIST_PATH), "utf8"),
  ) as { owners: Array<{ id: string; role: string }> }
).owners[0] as { id: string; role: string };

let output: string[] = [];
let outsideDir = "";
const cleanup: string[] = [];

beforeEach(() => {
  output = [];
  const capture = (...args: unknown[]) => {
    output.push(args.map(String).join(" "));
  };
  vi.spyOn(console, "log").mockImplementation(capture);
  vi.spyOn(console, "error").mockImplementation(capture);
  mkdirSync(PROOFS_ROOT, { recursive: true });
  outsideDir = mkdtempSync(path.join(os.tmpdir(), "proof-escape-2169-"));
});

afterEach(() => {
  vi.restoreAllMocks();
  for (const entry of cleanup.splice(0)) {
    rmSync(entry, { recursive: true, force: true });
  }
  rmSync(outsideDir, { recursive: true, force: true });
});

/** A unique, not yet existing entry name directly under the proofs root. */
function uniqueProofsEntry(kind: string): {
  relative: string;
  absolute: string;
} {
  const name = `__unit-2169-${kind}-${randomBytes(6).toString("hex")}`;
  const absolute = path.join(PROOFS_ROOT, name);
  cleanup.push(absolute);
  return { relative: `${DOCUMENT_CUTOVER_PROOFS_DIR}/${name}`, absolute };
}

function symlinkOut(absolute: string): void {
  symlinkSync(outsideDir, absolute, "dir");
}

function noGoArgs(out: string): string[] {
  return [
    "--decision",
    "no_go",
    "--owner",
    owner.id,
    "--owner-role",
    owner.role,
    "--statement",
    "Unit #2169 symlink-escape check (no go).",
    "--out",
    out,
  ];
}

function run(argv: string[], detectors?: DocumentCutoverDetector[]) {
  return runDocumentCutoverCommand({
    argv,
    env: LOCAL_ENV,
    detectors:
      detectors ?? buildFixtureDetectors(new DocumentEnvironmentFixture()),
  });
}

describe("#2067 review r4341709686 — proof writes are realpath-contained", () => {
  it("control: a normal --out directory under the proofs root gets the proof file", async () => {
    const out = uniqueProofsEntry("real");
    const exitCode = await run(noGoArgs(out.relative));

    // A no_go proof never exits zero; the write itself succeeds.
    expect(exitCode).toBe(1);
    expect(output.join("\n")).toMatch(/Recorded stop_the_line proof/);
    const files = readdirSync(out.absolute);
    expect(files).toHaveLength(1);
    expect(files[0]).toMatch(/\.json$/);
    expect(readdirSync(outsideDir)).toEqual([]);
  });

  it("an --out directory that is already a symlink out of the proofs root stops the line before the target is read; nothing is written outside", async () => {
    const out = uniqueProofsEntry("symlink");
    symlinkOut(out.absolute);
    const exitCode = await run(noGoArgs(out.relative));

    expect(exitCode).toBe(1);
    const text = output.join("\n");
    expect(text).toContain(
      `--out "${out.relative}" does not resolve inside ${DOCUMENT_CUTOVER_PROOFS_DIR}/`,
    );
    expect(text).not.toMatch(/Recorded .* proof/);
    expect(readdirSync(outsideDir)).toEqual([]);
  });

  it("a symlink nested below a real --out directory is refused the same way", async () => {
    const parent = uniqueProofsEntry("nested");
    mkdirSync(parent.absolute);
    symlinkOut(path.join(parent.absolute, "operator"));
    const exitCode = await run(noGoArgs(`${parent.relative}/operator`));

    expect(exitCode).toBe(1);
    expect(output.join("\n")).not.toMatch(/Recorded .* proof/);
    expect(readdirSync(outsideDir)).toEqual([]);
  });

  it("the writer refuses a directory that became a symlink after --out was checked: exit 1, no success reported, nothing written outside", async () => {
    const out = uniqueProofsEntry("swapped");
    // --out names a directory that does not exist yet, so the early check
    // passes; a detector run then plants a symlink at that path before the
    // proof is written (a race the writer must still refuse).
    let planted = false;
    const detectors = buildFixtureDetectors(
      new DocumentEnvironmentFixture(),
    ).map((detector) => ({
      ...detector,
      async inspectSurface(surfaceId: string) {
        if (!planted) {
          planted = true;
          symlinkOut(out.absolute);
        }
        return detector.inspectSurface(surfaceId);
      },
    }));

    const exitCode = await run(noGoArgs(out.relative), detectors);

    expect(planted).toBe(true);
    expect(exitCode).toBe(1);
    const text = output.join("\n");
    expect(text).toMatch(
      /No proof recorded: Proof path .* is refused: .*symlink escape refused/,
    );
    expect(text).not.toMatch(/Recorded .* proof/);
    expect(readdirSync(outsideDir)).toEqual([]);
    expect(existsSync(out.absolute)).toBe(true);
    unlinkSync(out.absolute);
  });
});
