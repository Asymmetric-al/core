/**
 * Acceptance tests for GitHub issue #2067 — proof output and provenance.
 * Spec (rev 2, Blake-approved): {@link https://github.com/Asymmetric-al/core/issues/2067#issuecomment-6306182453}
 *
 * Covers DC1 (append-only `<ISO>-<proofId>.json` files under
 * docs/ops/document-cutover/proofs/, never overwritten), the DC2 field
 * contract (`recordedBy`, `proofPath`, `digest`; no `attestedBy` /
 * `attestationContext`), and the `--out` default / `.gitignore` change (spec §2
 * "Proof output").
 *
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 */

import { readFileSync } from "node:fs";
import path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import {
  LOCAL_TARGET_ENV,
  PROOFS_DIR,
  PROOFS_DIR_REL,
  PROOF_FILE_NAME,
  allowlistedOwner,
  cleanTarget,
  cleanupProofFiles,
  collectKeys,
  decisionArgs,
  git,
  listProofFiles,
  expectedDigest,
  mintCleanProof,
  newProofFiles,
  readProofFile,
  runCommand,
} from "./command-harness";

vi.mock("@supabase/supabase-js", async (importOriginal) =>
  (await import("./fake-supabase")).mockSupabaseModule(await importOriginal()),
);

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  cleanupProofFiles();
});

async function recordNoGo() {
  return runCommand({
    argv: decisionArgs("no_go", allowlistedOwner()),
    env: LOCAL_TARGET_ENV,
  });
}

describe("issue #2067 — DC1 append-only proof files under docs/ops/document-cutover/proofs/", () => {
  it("DC1: two consecutive runs (default --out) produce two distinct <ISO>-<proofId>.json files; the first file's bytes are unchanged", async () => {
    cleanTarget();
    const before = listProofFiles();

    await recordNoGo();
    const afterFirst = newProofFiles(before);
    expect(afterFirst).toHaveLength(1);
    const firstName = afterFirst[0] as string;
    const firstBytes = readFileSync(path.join(PROOFS_DIR, firstName));

    await recordNoGo();
    const created = newProofFiles(before);
    expect(created).toHaveLength(2);
    expect(new Set(created).size).toBe(2);

    for (const name of created) {
      const match = PROOF_FILE_NAME.exec(name);
      expect(match, `${name} is not <ISO>-<proofId>.json`).not.toBeNull();
      const proof = readProofFile(name);
      expect(match?.[2]).toBe(proof.proofId);
    }
    expect(
      readFileSync(path.join(PROOFS_DIR, firstName)).equals(firstBytes),
    ).toBe(true);
  });

  it("DC1: writing over an existing proof path throws — a colliding second run fails and leaves the first file's bytes unchanged", async () => {
    cleanTarget();
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-10-20T19:00:00.000Z"));
    vi.spyOn(globalThis.crypto, "randomUUID").mockReturnValue(
      "00000000-0000-4000-8000-000000002067",
    );
    const before = listProofFiles();

    await recordNoGo();
    const first = newProofFiles(before);
    expect(first).toHaveLength(1);
    const firstName = first[0] as string;
    const firstBytes = readFileSync(path.join(PROOFS_DIR, firstName));

    const second = await recordNoGo();

    expect(second.exitCode).not.toBe(0);
    expect(newProofFiles(before)).toEqual(first);
    expect(
      readFileSync(path.join(PROOFS_DIR, firstName)).equals(firstBytes),
    ).toBe(true);
  });
});

describe("issue #2067 — DC2 provenance replaces attestation", () => {
  it("DC2: a new proof contains recordedBy, proofPath and digest, and no attestedBy/attestationContext anywhere", async () => {
    const minted = await mintCleanProof();
    const keys = collectKeys(minted.proof);

    expect(typeof minted.proof.recordedBy).toBe("string");
    expect(String(minted.proof.recordedBy).trim()).not.toBe("");
    expect(typeof minted.proof.digest).toBe("string");
    expect(String(minted.proof.digest)).toMatch(/^[0-9a-f]{64}$/);
    expect(typeof minted.proof.proofPath).toBe("string");
    expect(String(minted.proof.proofPath)).toContain(PROOFS_DIR_REL);
    expect(String(minted.proof.proofPath).endsWith(minted.name)).toBe(true);
    expect(keys.has("attestedBy")).toBe(false);
    expect(keys.has("attestationContext")).toBe(false);
  });

  it("DC2: a stop_the_line (no_go) proof carries the same provenance and no attestation", async () => {
    cleanTarget();
    const before = listProofFiles();
    await recordNoGo();
    const [name] = newProofFiles(before);
    expect(name).toBeDefined();
    const proof = readProofFile(name as string);
    const keys = collectKeys(proof);

    expect(proof.outcome).toBe("stop_the_line");
    expect(keys.has("recordedBy")).toBe(true);
    expect(keys.has("proofPath")).toBe(true);
    expect(keys.has("digest")).toBe(true);
    expect(keys.has("attestedBy")).toBe(false);
    expect(keys.has("attestationContext")).toBe(false);
  });
});

describe("issue #2067 — DC2 digest rule (addendum 2 item 2)", () => {
  it("DC2: a clean proof's digest is the canonical-JSON SHA-256 of the proof with the digest field left out", async () => {
    const minted = await mintCleanProof();
    expect(minted.proof.digest).toBe(await expectedDigest(minted.proof));
  });

  it("DC2: a stop_the_line (no_go) proof's digest follows the same rule", async () => {
    cleanTarget();
    const before = listProofFiles();
    await recordNoGo();
    const [name] = newProofFiles(before);
    expect(name).toBeDefined();
    const proof = readProofFile(name as string);
    expect(proof.digest).toBe(await expectedDigest(proof));
  });
});

describe("issue #2067 — spec §2 proof output: --out default and .gitignore", () => {
  it("proof files under docs/ops/document-cutover/proofs/ are not git-ignored (they are committed through a PR)", () => {
    let ignored = true;
    try {
      git([
        "check-ignore",
        "-q",
        `${PROOFS_DIR_REL}/2026-10-20T19-00-00.000Z-acceptance.json`,
      ]);
    } catch (error) {
      // `git check-ignore` exits 1 when the path is not ignored.
      if ((error as { status?: number }).status !== 1) throw error;
      ignored = false;
    }
    expect(ignored).toBe(false);
  });
});
