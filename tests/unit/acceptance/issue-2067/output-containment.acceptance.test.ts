/**
 * Acceptance tests for GitHub issue #2067 addendum 4 — criterion 9 (m3):
 * output is contained in docs/ops/document-cutover/proofs/.
 * Addendum 4 (Blake-approved 2026-10-20 10:31 PM PT):
 * {@link https://github.com/Asymmetric-al/core/issues/2067#issuecomment-6308840307}
 *
 * - `--out` must resolve inside docs/ops/document-cutover/proofs/. Otherwise
 *   (`--out .`, `--out ""`, `--out ../x`, an absolute directory elsewhere) the
 *   run exits non-zero and writes nothing.
 * - `--verify` rejects any proof path outside that directory.
 *
 * These runs use the real proof writer (no injected store), so a run that
 * ignores containment would write a file. Every candidate directory is
 * scanned for a file carrying this run's marker; any such file is removed
 * after the test.
 *
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 */

import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterAll, afterEach, describe, expect, it, vi } from "vitest";

import {
  LOCAL_TARGET_ENV,
  PROOFS_DIR,
  PROOFS_DIR_REL,
  REPO_ROOT,
  allowlistedOwner,
  cleanTarget,
  cleanupProofFiles,
  decisionArgs,
  listProofFiles,
  markedStatement,
  mintCleanProof,
  newProofFiles,
  proofRunMarker,
  runCommand,
} from "./command-harness";

vi.mock("@supabase/supabase-js", async (importOriginal) =>
  (await import("./fake-supabase")).mockSupabaseModule(await importOriginal()),
);
vi.mock("pg", async () => (await import("./fake-postgres")).mockPgModule());

const outsideDir = mkdtempSync(path.join(os.tmpdir(), "acceptance-2067-out-"));
const strayFiles = new Set<string>();
const createdDirs = new Set<string>();

afterEach(() => {
  vi.restoreAllMocks();
  cleanupProofFiles();
  for (const file of strayFiles) rmSync(file, { force: true });
  strayFiles.clear();
});

afterAll(() => {
  rmSync(outsideDir, { recursive: true, force: true });
  for (const dir of createdDirs) {
    try {
      if (readdirSync(dir).length === 0) rmSync(dir, { recursive: true });
    } catch {
      // already gone
    }
  }
});

/** Files under `dir` (up to `maxDepth` levels down) whose contents carry `marker`. */
function markedFiles(
  dir: string,
  marker: string,
  maxDepth = 2,
  depth = 0,
): string[] {
  if (!existsSync(dir) || !statSync(dir).isDirectory()) return [];
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".git") continue;
    const full = path.join(dir, name);
    let stat;
    try {
      stat = statSync(full);
    } catch {
      continue;
    }
    if (stat.isDirectory()) {
      if (depth < maxDepth) {
        out.push(...markedFiles(full, marker, maxDepth, depth + 1));
      }
      continue;
    }
    if (!name.endsWith(".json") || stat.size > 4 * 1024 * 1024) continue;
    try {
      if (readFileSync(full, "utf8").includes(marker)) out.push(full);
    } catch {
      // unreadable
    }
  }
  return out;
}

const OUTSIDE_OUT: Array<[string, string]> = [
  ["`--out .`", "."],
  ['`--out ""`', ""],
  ["`--out ../x`", "../x"],
  ["an absolute directory outside the repo", outsideDir],
  ["a sibling of the proofs directory", "docs/ops/document-cutover"],
];

async function runWithOut(decision: "go" | "no_go", out: string) {
  cleanTarget();
  const marker = proofRunMarker();
  const resolved = path.resolve(REPO_ROOT, out);
  const existed = existsSync(resolved);
  const before = listProofFiles();
  const result = await runCommand({
    argv: [
      ...decisionArgs(decision, allowlistedOwner(), markedStatement(marker)),
      "--out",
      out,
    ],
    env: LOCAL_TARGET_ENV,
  });
  if (!existed && existsSync(resolved)) createdDirs.add(resolved);
  const written = [
    ...new Set([
      ...markedFiles(resolved, marker),
      ...markedFiles(REPO_ROOT, marker),
      // At 5dd859b4 `--out .` yields proofPath "/<name>.json" (filesystem
      // root); that write only fails where the runner is not root.
      ...markedFiles(path.parse(REPO_ROOT).root, marker, 0),
      ...newProofFiles(before, marker).map((name) =>
        path.join(PROOFS_DIR, name),
      ),
    ]),
  ];
  written.forEach((file) => strayFiles.add(file));
  return { result, written };
}

describe("issue #2067 addendum 4 — criterion 9 (m3): --out must resolve inside docs/ops/document-cutover/proofs/", () => {
  it("control: --out docs/ops/document-cutover/proofs records the no_go proof there", async () => {
    const { written } = await runWithOut("no_go", PROOFS_DIR_REL);
    expect(written).toHaveLength(1);
    expect(path.dirname(written[0] as string)).toBe(PROOFS_DIR);
  });

  it.each(OUTSIDE_OUT)(
    "criterion 9: --decision no_go with %s exits non-zero and writes nothing",
    async (_label, out) => {
      const { result, written } = await runWithOut("no_go", out);
      expect(result.exitCode).not.toBe(0);
      expect(written).toEqual([]);
    },
  );

  it.each(OUTSIDE_OUT)(
    "criterion 9: --decision go on a clean target with %s exits non-zero and writes nothing",
    async (_label, out) => {
      const { result, written } = await runWithOut("go", out);
      expect(result.exitCode).not.toBe(0);
      expect(written).toEqual([]);
    },
  );
});

describe("issue #2067 addendum 4 — criterion 9 (m3): --verify rejects proof paths outside docs/ops/document-cutover/proofs/", () => {
  async function verify(target: string) {
    return runCommand({ argv: ["--verify", target], env: LOCAL_TARGET_ENV });
  }

  it("criterion 9: an exact copy of a valid proof outside the proofs directory (OS temp dir) fails --verify, while the original passes", async () => {
    const minted = await mintCleanProof();
    const inside = await verify(minted.relPath);
    expect(inside.exitCode, `${inside.stdout}\n${inside.stderr}`).toBe(0);

    const copy = path.join(outsideDir, minted.name);
    copyFileSync(minted.absPath, copy);
    const outside = await verify(copy);
    expect(outside.exitCode).not.toBe(0);
  });

  it("criterion 9: a copy in docs/ops/document-cutover/ (outside proofs/), named through proofs/../, fails --verify", async () => {
    const minted = await mintCleanProof();
    const inside = await verify(minted.relPath);
    expect(inside.exitCode, `${inside.stdout}\n${inside.stderr}`).toBe(0);

    const siblingDir = path.dirname(PROOFS_DIR);
    mkdirSync(siblingDir, { recursive: true });
    const copy = path.join(siblingDir, `acceptance-2067-${minted.name}`);
    copyFileSync(minted.absPath, copy);
    strayFiles.add(copy);
    const outside = await verify(`${PROOFS_DIR_REL}/../${path.basename(copy)}`);
    expect(outside.exitCode).not.toBe(0);
  });
});
